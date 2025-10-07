import { Router } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// In-memory store for content items and images
const contentStore = new Map();
const imageStore = new Map();

// --- Helper Functions ---

// Function to process text with Gemini AI
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

// Function to fetch and store an image from LINE
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
        imageStore.set(imageId, { buffer: Buffer.from(buffer), type: response.headers.get('content-type') });
        
        // Return a URL that the frontend can use to fetch the image from our server
        return `/api/image/${imageId}`;
    } catch (error) {
        console.error('Error fetching image from LINE:', error);
        return null;
    }
}


// --- Middleware ---

// LINE signature validation middleware
const validateLineSignature = (req, res, next) => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    console.warn('LINE_CHANNEL_SECRET is not set. Skipping signature validation.');
    return next();
  }

  const signature = req.headers['x-line-signature'];
  if (!signature) {
    return res.status(401).send('Missing signature');
  }

  const body = JSON.stringify(req.body);
  const generatedSignature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  if (signature !== generatedSignature) {
    return res.status(400).send('Invalid signature');
  }

  next();
};


// --- API Endpoints ---

// Endpoint for the actual LINE webhook
router.post('/webhook', (req, res) => {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const signature = req.headers['x-line-signature'];
    const body = req.body; // This is a raw buffer thanks to the middleware in index.js

    if (!channelSecret || !signature) {
        console.warn('LINE channel secret or signature is missing. Skipping validation.');
    } else {
        const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64');
        if (hash !== signature) {
            console.error('Signature validation failed!');
            // Log the received signature and the generated one for debugging
            console.error('Received Signature:', signature);
            console.error('Generated Signature:', hash);
            return res.status(400).send('Invalid signature');
        }
    }

    // Now that validation is done, parse the JSON body
    let events;
    try {
        events = JSON.parse(body.toString());
    } catch (e) {
        console.error('Failed to parse webhook body:', e);
        return res.status(400).send('Invalid JSON format');
    }
    
    const io = req.app.get('io');

    Promise.all(events.events.map(async (event) => {
        if (event.type !== 'message') {
            return;
        }


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
            // Placeholder for AI image processing
            newItem.processedContent.imageUrl = imageUrl; 
        } else {
            return; // Ignore other message types
        }

        contentStore.set(contentId, newItem);
        io.emit('newContent', newItem);
    }))
    .then(() => res.status(200).json({ success: true }))
    .catch((err) => {
        console.error("Failed to process events", err);
        res.status(500).json({ success: false });
    });
});


// Endpoint for local testing
router.post('/test-webhook', async (req, res) => {
  const { type, text, imageUrl: testImageUrl } = req.body;
  const io = req.app.get('io');
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
    // For testing, we just pass the URL through
    newItem.originalContent.imageUrl = testImageUrl;
    newItem.processedContent.imageUrl = testImageUrl;
  } else {
    return res.status(400).json({ error: 'Invalid test type' });
  }

  contentStore.set(contentId, newItem);
  io.emit('newContent', newItem);
  console.log('Emitted new content via test-webhook:', newItem);
  res.status(200).json({ success: true, item: newItem });
});

// Endpoint to serve stored images
router.get('/image/:id', (req, res) => {
  const imageId = req.params.id;
  const image = imageStore.get(imageId);
  if (image) {
    res.setHeader('Content-Type', image.type);
    res.send(image.buffer);
  } else {
    res.status(404).send('Image not found');
  }
});

export default router;
