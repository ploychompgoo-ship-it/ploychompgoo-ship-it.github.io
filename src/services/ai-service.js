import io from 'socket.io-client';

// In development: use Vite proxy (empty string)
// In production: use full backend URL from environment variable
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
const IS_PRODUCTION = import.meta.env.PROD;

class AIService {
  constructor() {
    this.socket = io(SOCKET_URL, {
      withCredentials: false,
      transports: ['polling', 'websocket'],
      // Force secure connection in production
      secure: IS_PRODUCTION,
      // Allow cross-origin in production
      autoConnect: true,
      timeout: 20000
    });
    // Expose for quick debugging in browser console
    if (typeof window !== 'undefined') {
      window.aiSocket = this.socket;
    }
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to AI processing server', {
        id: this.socket.id,
        url: SOCKET_URL || 'same-origin via Vite proxy'
      });
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connect_error:', err?.message || err);
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      console.warn('Socket reconnect_attempt', attempt);
    });

    this.socket.io.on('reconnect_error', (err) => {
      console.error('Socket reconnect_error', err?.message || err);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('Socket reconnect_failed');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from AI processing server', reason);
    });
  }

  // Subscribe to new content notifications
  subscribeToContent(callback) {
    this.socket.on('newContent', (content) => {
      callback(content);
    });
  }

  // Clean up socket connection
  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Create singleton instance
const aiService = new AIService();
export default aiService;