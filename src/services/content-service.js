class ContentPollingService {
  constructor() {
    this.isPolling = false;
    this.pollInterval = null;
    this.callbacks = [];
    this.lastFetchTime = null;
    this.POLL_INTERVAL = 5000; // Poll every 5 seconds
    
    // Netlify Function endpoint
    this.BACKEND_URL = '/.netlify/functions/webhook';
    
    console.log('ContentPollingService initialized with polling approach');
  }

  // Subscribe to new content notifications via polling
  subscribeToContent(callback) {
    this.callbacks.push(callback);
    
    if (!this.isPolling) {
      this.startPolling();
    }
  }
  
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('Started polling for new content');
    
    // Initial fetch
    this.pollForContent();
    
    // Set up interval polling
    this.pollInterval = setInterval(() => {
      this.pollForContent();
    }, this.POLL_INTERVAL);
  }
  
  async pollForContent() {
    try {
      // Fetch actual content from Netlify Function
      const response = await fetch(`${this.BACKEND_URL}?getContent=true`);
      
      if (response.ok) {
        const data = await response.json();
        const newContent = data.content || [];
        
        // Check for new items since last fetch
        if (this.lastFetchTime) {
          const newItems = newContent.filter(item => 
            new Date(item.timestamp) > new Date(this.lastFetchTime)
          );
          
          // Notify subscribers of new items
          newItems.forEach(item => {
            this.callbacks.forEach(callback => {
              try {
                callback(item);
              } catch (error) {
                console.error('Error in content callback:', error);
              }
            });
          });
          
          if (newItems.length > 0) {
            console.log(`Found ${newItems.length} new content items`);
          }
        } else {
          // First fetch - load all existing content
          console.log(`Loaded ${newContent.length} existing content items`);
          newContent.forEach(item => {
            this.callbacks.forEach(callback => {
              try {
                callback(item);
              } catch (error) {
                console.error('Error in content callback:', error);
              }
            });
          });
        }
        
        this.lastFetchTime = data.timestamp;
      }
    } catch (error) {
      console.warn('Polling error (this is normal if backend is not running):', error.message);
    }
  }
  
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
    console.log('Stopped polling for content');
  }
  
  cleanup() {
    this.stopPolling();
    this.callbacks = [];
  }
  
  // Check if service is active
  isActive() {
    return this.isPolling;
  }
}

// Create singleton instance
const contentService = new ContentPollingService();
export default contentService;