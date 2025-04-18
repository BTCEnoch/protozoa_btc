/**
 * Formation Worker Service
 * 
 * Service for interfacing with the formation worker.
 */

import { BlockData } from '../../services/bitcoin/bitcoinService';
import { FormationPattern } from '../../types/formations/formation';
import { WorkerBridge } from '../../lib/workerBridge';

// Singleton instance
let instance: FormationWorkerService | null = null;

/**
 * Formation Worker Service class
 */
class FormationWorkerService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private worker: Worker | null = null;
  private workerBridge: WorkerBridge = new WorkerBridge();
  private workerId: number | null = null;
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();
  private config = {
    scale: 1.0,
    rotationSpeed: 0.01,
    useNoise: false,
    noiseScale: 0.1,
    noiseFrequency: 0.1,
    blendTime: 0.5,
    useTransition: true
  };

  /**
   * Initialize the formation worker service with block data
   * @param blockData The Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    this.blockData = blockData;
    
    // Create the worker
    this.createWorker();
    
    // Set the worker configuration with a seed derived from the nonce
    // Handle both string and number nonce types
    this.setWorkerConfig({
      noiseSeed: blockData.nonce, // Already a number in our simplified BlockData
      ...this.config
    });
    
    this.initialized = true;
  }

  /**
   * Create the formation worker
   */
  private createWorker(): void {
    // Clean up any existing worker
    this.terminateWorker();
    
    // Create a new worker
    this.workerId = this.workerBridge.createWorker('formation');
    
    // Get the worker instance
    const worker = this.workerBridge.getWorker(this.workerId);
    if (worker instanceof Worker) {
      this.worker = worker;
      // Set up the message handler
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } else {
      console.error('Failed to create formation worker as a standard Worker');
    }
  }

  /**
   * Terminate the worker
   */
  private terminateWorker(): void {
    if (this.workerId !== null) {
      this.workerBridge.terminateWorker(this.workerId);
      this.workerId = null;
      this.worker = null;
    }
  }

  /**
   * Handle messages from the worker
   * @param event The message event
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data, id } = event.data;
    
    // Handle request completion
    if (id && this.pendingRequests.has(id)) {
      const { resolve } = this.pendingRequests.get(id)!;
      this.pendingRequests.delete(id);
      resolve(data);
      return;
    }
    
    // Handle worker events
    switch (type) {
      case 'formation.ready':
        console.log('Formation worker is ready');
        break;
      
      default:
        console.warn(`Unknown message type from formation worker: ${type}`);
    }
  }

  /**
   * Handle worker errors
   * @param event The error event
   */
  private handleWorkerError(event: ErrorEvent): void {
    console.error('Formation worker error:', event.message);
    
    // Reject all pending requests
    for (const { reject } of this.pendingRequests.values()) {
      reject(new Error(`Worker error: ${event.message}`));
    }
    
    this.pendingRequests.clear();
    
    // Recreate the worker
    this.createWorker();
  }

  /**
   * Set the worker configuration
   * @param config The worker configuration
   */
  setWorkerConfig(config: any): void {
    // Update the local config
    this.config = { ...this.config, ...config };
    
    // Send the config to the worker
    if (this.worker) {
      this.worker.postMessage({
        type: 'formation.setOptions',
        data: {
          options: this.config
        }
      });
    }
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Set the formation pattern
   * @param pattern The formation pattern to set
   * @param count The number of particles
   */
  setPattern(pattern: FormationPattern, count: number): void {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }
    
    this.worker.postMessage({
      type: 'formation.setPattern',
      data: {
        pattern,
        count
      }
    });
  }

  /**
   * Calculate formation positions
   * @param count The number of particles
   * @param timestamp The current timestamp
   * @returns Promise resolving to the calculated positions
   */
  calculatePositions(count: number, timestamp: number): Promise<Float32Array> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }
    
    // Generate a unique ID for this request
    const id = `formation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a promise that will resolve when the worker responds
    const promise = new Promise<Float32Array>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      // Set a timeout to reject the promise if the worker doesn't respond
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Worker request timed out'));
        }
      }, 5000); // 5 second timeout
    });
    
    // Send the request to the worker
    this.worker.postMessage({
      id,
      type: 'formation.calculate',
      data: {
        count,
        timestamp
      }
    });
    
    return promise;
  }

  /**
   * Reset the worker
   */
  reset(): void {
    if (this.worker) {
      this.worker.postMessage({
        type: 'formation.reset'
      });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.terminateWorker();
    this.initialized = false;
    this.blockData = null;
    this.pendingRequests.clear();
  }
}

/**
 * Get the formation worker service instance
 * @returns The formation worker service instance
 */
export function getFormationWorkerService(): FormationWorkerService {
  if (!instance) {
    instance = new FormationWorkerService();
  }
  return instance;
} 
