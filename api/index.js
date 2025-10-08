import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST"],
  credentials: true
}));

// Middleware for parsing JSON
app.use(express.json());
app.use('/webhook', express.raw({ type: 'application/json' }));

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

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'LINE Dashboard Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    env: {
      hasLineSecret: !!process.env.LINE_CHANNEL_SECRET,
      hasLineToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      clientUrl: process.env.CLIENT_URL
    }
  });
});

// LINE webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const signature = req.headers['x-line-signature'];
    const body = req.body;

    if (!channelSecret || !signature) {
      console.warn('LINE channel secret or signature is missing. Skipping validation.');
    } else {
      const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
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

    for (const event of events.events) {
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

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test webhook endpoint
app.post('/test-webhook', async (req, res) => {
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
    res.status(200).json({ success: true, item: newItem });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Image serving endpoint
app.get('/image/:id', (req, res) => {
  const imageId = req.params.id;
  const image = imageStore.get(imageId);
  if (image) {
    res.setHeader('Content-Type', image.type);
    res.send(image.buffer);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;