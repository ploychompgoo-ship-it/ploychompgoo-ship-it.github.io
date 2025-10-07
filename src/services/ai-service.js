import io from 'socket.io-client';

// In development: use Vite proxy (empty string)
// In production: use full backend URL from environment variable
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
const IS_PRODUCTION = import.meta.env.PROD;

class AIService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    
    // Only initialize if we have a valid socket URL or in development
    if (SOCKET_URL || !IS_PRODUCTION) {
      try {
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
      } catch (error) {
        console.warn('Socket.IO initialization failed:', error.message);
        this.socket = null;
      }
    } else {
      console.warn('Socket.IO disabled: No backend URL configured');
    }
  }

  setupSocketListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to AI processing server', {
        id: this.socket.id,
        url: SOCKET_URL || 'same-origin via Vite proxy'
      });
    });

    this.socket.on('connect_error', (err) => {
      this.isConnected = false;
      console.warn('Socket connect_error (this is normal without backend):', err?.message || err);
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      console.warn('Socket reconnect_attempt', attempt);
    });

    this.socket.io.on('reconnect_error', (err) => {
      console.warn('Socket reconnect_error (this is normal without backend):', err?.message || err);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.warn('Socket reconnect_failed (this is normal without backend)');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Disconnected from AI processing server', reason);
    });
  }

  // Subscribe to new content notifications
  subscribeToContent(callback) {
    if (this.socket) {
      this.socket.on('newContent', (content) => {
        callback(content);
      });
    } else {
      console.warn('Socket not available for content subscription');
    }
  }

  // Clean up socket connection
  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  
  // Check if socket is connected
  isSocketConnected() {
    return this.socket && this.isConnected;
  }
}

// Create singleton instance
const aiService = new AIService();
export default aiService;