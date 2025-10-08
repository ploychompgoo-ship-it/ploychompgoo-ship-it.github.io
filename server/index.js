import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import lineWebhook from './line-webhook.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

// Middleware
// The LINE webhook needs a raw body for signature validation, so we use express.raw for that specific route.
// For all other routes, we can use express.json.
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api', lineWebhook);
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.type('text/plain').send('Dashboard server is running'));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err?.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  const HOST = '127.0.0.1';

  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
  });
}

// Export for Vercel serverless deployment
export default app;