const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// In-memory store (จะ reset ทุกครั้งที่ function cold start)
const contentStore = new Map();
const imageStore = new Map();

// Helper function to process text with AI
async function processTextWithAI(text) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Returning original text.');
    return `(AI Disabled) ${text}`;
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Transform the following text into a compelling product story: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error processing text with AI:', error);
    return `(AI Error) ${text}`;
  }
}

// Helper function to process image from LINE
async function processImage(messageId) {
  const imageUrl = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  try {
    const response = await fetch(imageUrl, {
      headers: { 'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const imageId = uuidv4();
    imageStore.set(imageId, { 
      buffer: Buffer.from(buffer), 
      type: response.headers.get('content-type') 
    });
    return `/.netlify/functions/webhook?image=${imageId}`;
  } catch (error) {
    console.error('Error fetching image from LINE:', error);
    return null;
  }
}

exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body, headers } = event;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-line-signature',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Health check
  if (httpMethod === 'GET' && queryStringParameters?.health) {
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ok: true, 
        env: {
          hasLineSecret: !!process.env.LINE_CHANNEL_SECRET,
          hasLineToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
          hasGeminiKey: !!process.env.GEMINI_API_KEY,
          netlifyFunction: true
        },
        contentCount: contentStore.size
      })
    };
  }

  // Get recent content
  if (httpMethod === 'GET' && queryStringParameters?.getContent) {
    const recentContent = Array.from(contentStore.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20); // Return last 20 items
    
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content: recentContent,
        timestamp: new Date().toISOString()
      })
    };
  }

  // Image serving
  if (httpMethod === 'GET' && queryStringParameters?.image) {
    const imageId = queryStringParameters.image;
    const image = imageStore.get(imageId);
    if (image) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': image.type },
        body: image.buffer.toString('base64'),
        isBase64Encoded: true
      };
    } else {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Image not found' })
      };
    }
  }

  // LINE webhook
  if (httpMethod === 'POST') {
    try {
      console.log('Webhook received:', {
        headers,
        bodyLength: body?.length
      });

      const channelSecret = process.env.LINE_CHANNEL_SECRET;
      const signature = headers['x-line-signature'];

      // Always return 200 for LINE verification initially
      if (!body || body.length === 0) {
        console.log('Empty body - returning 200 for verification');
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true })
        };
      }

      if (!channelSecret) {
        console.warn('LINE_CHANNEL_SECRET not set - skipping validation');
      } else if (!signature) {
        console.warn('No x-line-signature header - skipping validation');
      } else {
        const hash = crypto.createHmac('sha256', channelSecret).update(body, 'utf8').digest('base64');
        console.log('Signature validation:', {
          received: signature,
          calculated: hash,
          match: hash === signature
        });
        
        if (hash !== signature) {
          console.error('Signature validation failed!');
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid signature' })
          };
        }
      }

      let events;
      try {
        events = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse webhook body:', e);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid JSON format' })
        };
      }

      for (const event of events.events || []) {
        if (event.type !== 'message') continue;

        const { message } = event;
        const contentId = uuidv4();
        let newItem = {
          id: contentId,
          status: 'Pending',
          timestamp: new Date().toISOString(),
          originalContent: {},
          processedContent: {},
        };

        if (message.type === 'text') {
          newItem.originalContent.text = message.text;
          newItem.processedContent.text = await processTextWithAI(message.text);
        } else if (message.type === 'image') {
          const imageUrl = await processImage(message.id);
          newItem.originalContent.imageUrl = imageUrl;
          newItem.processedContent.imageUrl = imageUrl;
        }

        contentStore.set(contentId, newItem);
        console.log('New content processed:', newItem);
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      console.error('Webhook error:', error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  // Default response
  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: 'LINE Dashboard Netlify Function',
      status: 'running',
      timestamp: new Date().toISOString()
    })
  };
};