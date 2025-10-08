import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory store for content items and images
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
    return `/api/image/${imageId}`;
  } catch (error) {
    console.error('Error fetching image from LINE:', error);
    return null;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-line-signature');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  
  // Root endpoint
  if (url === '/' && method === 'GET') {
    return res.json({ 
      message: 'LINE Dashboard Backend API',
      status: 'running',
      timestamp: new Date().toISOString()
    });
  }

  // Health check
  if (url === '/health' && method === 'GET') {
    return res.json({ 
      ok: true, 
      env: {
        hasLineSecret: !!process.env.LINE_CHANNEL_SECRET,
        hasLineToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        clientUrl: process.env.CLIENT_URL
      }
    });
  }

  // LINE webhook
  if (url === '/webhook' && method === 'POST') {
    try {
      console.log('Webhook received:', {
        headers: req.headers,
        method: req.method,
        url: req.url
      });

      const channelSecret = process.env.LINE_CHANNEL_SECRET;
      const signature = req.headers['x-line-signature'];
      
      // Get raw body
      let body;
      if (req.body && Buffer.isBuffer(req.body)) {
        body = req.body;
      } else if (typeof req.body === 'string') {
        body = Buffer.from(req.body, 'utf8');
      } else {
        body = Buffer.from(JSON.stringify(req.body || {}), 'utf8');
      }

      // Always return 200 for LINE verification initially
      if (!body || body.length === 0) {
        console.log('Empty body - returning 200 for verification');
        return res.status(200).json({ success: true });
      }

      if (!channelSecret) {
        console.warn('LINE_CHANNEL_SECRET not set - skipping validation');
      } else if (!signature) {
        console.warn('No x-line-signature header - skipping validation');
      } else {
        const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
        console.log('Signature validation:', {
          received: signature,
          calculated: hash,
          match: hash === signature
        });
        
        if (hash !== signature) {
          console.error('Signature validation failed!');
          return res.status(400).json({ error: 'Invalid signature' });
        }
      }

      let events;
      try {
        events = JSON.parse(body.toString());
      } catch (e) {
        console.error('Failed to parse webhook body:', e);
        return res.status(400).json({ error: 'Invalid JSON format' });
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

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Test webhook
  if (url === '/test-webhook' && method === 'POST') {
    try {
      const { type, text, imageUrl: testImageUrl } = req.body;
      const contentId = uuidv4();

      let newItem = {
        id: contentId,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        originalContent: {},
        processedContent: {},
      };

      if (type === 'text') {
        newItem.originalContent.text = text;
        newItem.processedContent.text = await processTextWithAI(text);
      } else if (type === 'image') {
        newItem.originalContent.imageUrl = testImageUrl;
        newItem.processedContent.imageUrl = testImageUrl;
      } else {
        return res.status(400).json({ error: 'Invalid test type' });
      }

      contentStore.set(contentId, newItem);
      console.log('Test content created:', newItem);
      return res.status(200).json({ success: true, item: newItem });
    } catch (error) {
      console.error('Test webhook error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Image serving
  if (url?.startsWith('/image/') && method === 'GET') {
    const imageId = url.split('/image/')[1];
    const image = imageStore.get(imageId);
    if (image) {
      res.setHeader('Content-Type', image.type);
      return res.send(image.buffer);
    } else {
      return res.status(404).json({ error: 'Image not found' });
    }
  }

  // 404 for other routes
  return res.status(404).json({ error: 'Not found' });
}