// Legacy Socket.IO service - replaced with polling service for Netlify Functions
// Socket.IO doesn't work with serverless functions, so we use polling instead

const IS_PRODUCTION = import.meta.env.PROD;

class AIService {
  constructor() {
    console.log('AIService: Using REST API approach instead of Socket.IO for Netlify Functions');
    this.backendUrl = '/.netlify/functions/webhook';
    this.isAvailable = true;
  }

  // Health check for backend
  async healthCheck() {
    try {
      const response = await fetch(`${this.backendUrl}?health=true`);
      const data = await response.json();
      console.log('Backend health check:', data);
      return data.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error.message);
      return false;
    }
  }

  // Subscribe to new content notifications (placeholder for now)
  subscribeToContent(callback) {
    console.log('Content subscription set up - using polling service instead of Socket.IO');
    // The actual polling will be handled by content-service.js
  }

  // Clean up (placeholder)
  cleanup() {
    console.log('AI Service cleanup');
  }
  
  // Check if service is available
  isSocketConnected() {
    return this.isAvailable;
  }
}

// Create singleton instance
const aiService = new AIService();
export default aiService;