/**
 * Storage Worker for Bitcoin Protozoa
 * 
 * This worker handles storage-related tasks that can be offloaded from the main thread.
 * It provides functionality for compressing/decompressing data, batch operations, and more.
 */

// Worker task interface
interface WorkerTask {
  id: string;
  type: string;
  data: any;
}

// Worker result interface
interface WorkerResult {
  id: string;
  type: string;
  data: any;
  error?: string;
}

// Task handlers
const taskHandlers: Record<string, (data: any) => Promise<any>> = {
  // Compress data
  async compressData(data: any): Promise<string> {
    try {
      const json = JSON.stringify(data);
      return btoa(encodeURIComponent(json));
    } catch (error) {
      throw new Error(`Failed to compress data: ${error}`);
    }
  },
  
  // Decompress data
  async decompressData(data: string): Promise<any> {
    try {
      const json = decodeURIComponent(atob(data));
      return JSON.parse(json);
    } catch (error) {
      throw new Error(`Failed to decompress data: ${error}`);
    }
  },
  
  // Batch compress multiple items
  async batchCompress(items: Record<string, any>): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(items)) {
      try {
        result[key] = await taskHandlers.compressData(value);
      } catch (error) {
        console.error(`Failed to compress item ${key}:`, error);
        // Skip this item
      }
    }
    
    return result;
  },
  
  // Batch decompress multiple items
  async batchDecompress(items: Record<string, string>): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(items)) {
      try {
        result[key] = await taskHandlers.decompressData(value);
      } catch (error) {
        console.error(`Failed to decompress item ${key}:`, error);
        // Skip this item
      }
    }
    
    return result;
  },
  
  // Filter creatures by criteria
  async filterCreatures(data: { creatures: any[], criteria: any }): Promise<any[]> {
    const { creatures, criteria } = data;
    
    return creatures.filter(creature => {
      // Apply criteria
      for (const [key, value] of Object.entries(criteria)) {
        if (creature[key] !== value) {
          return false;
        }
      }
      return true;
    });
  },
  
  // Sort creatures by field
  async sortCreatures(data: { creatures: any[], field: string, ascending: boolean }): Promise<any[]> {
    const { creatures, field, ascending } = data;
    
    return [...creatures].sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
      
      if (valueA < valueB) {
        return ascending ? -1 : 1;
      }
      if (valueA > valueB) {
        return ascending ? 1 : -1;
      }
      return 0;
    });
  },
  
  // Calculate storage usage
  async calculateStorageUsage(): Promise<{ used: number, available: number, items: number }> {
    try {
      // Calculate localStorage usage
      let used = 0;
      let items = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            used += key.length + value.length;
            items++;
          }
        }
      }
      
      // Estimate available space (5MB is a common limit)
      const available = 5 * 1024 * 1024 - used;
      
      return { used, available, items };
    } catch (error) {
      throw new Error(`Failed to calculate storage usage: ${error}`);
    }
  }
};

// Handle messages from the main thread
self.addEventListener('message', async (event) => {
  const task = event.data as WorkerTask;
  
  try {
    // Check if task handler exists
    const handler = taskHandlers[task.type];
    if (!handler) {
      throw new Error(`Unknown task type: ${task.type}`);
    }
    
    // Execute task
    const result = await handler(task.data);
    
    // Send result back to main thread
    self.postMessage({
      id: task.id,
      type: task.type,
      data: result
    } as WorkerResult);
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id: task.id,
      type: task.type,
      data: null,
      error: error instanceof Error ? error.message : String(error)
    } as WorkerResult);
  }
});
