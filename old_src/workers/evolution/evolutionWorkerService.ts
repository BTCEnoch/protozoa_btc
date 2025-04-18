/**
 * Evolution Worker Service
 * 
 * Service for interfacing with the evolution worker.
 */

import { BlockData } from '../../services/bitcoin/bitcoinService';
import { Creature } from '../../types/creatures/creature';
import { Mutation } from '../../types/mutations/mutation';
import { WorkerBridge } from '../../lib/workerBridge';

// Singleton instance
let instance: EvolutionWorkerService | null = null;

/**
 * Evolution Worker Service class
 */
class EvolutionWorkerService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private worker: Worker | null = null;
  private workerBridge: WorkerBridge = new WorkerBridge();
  private workerId: number | null = null;
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();
  private config = {
    maxMutationsPerEvent: 3,
    enableSubclassMutations: true,
    enableExoticMutations: false,
    mutationIntensity: 0.5
  };

  /**
   * Initialize the evolution worker service with block data
   * @param blockData The Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    this.blockData = blockData;
    
    // Create the worker
    this.createWorker();
    
    // Set the worker configuration
    this.setWorkerConfig({
      seed: blockData.nonce,
      ...this.config
    });
    
    this.initialized = true;
  }

  /**
   * Create the evolution worker
   */
  private createWorker(): void {
    // Clean up any existing worker
    this.terminateWorker();
    
    // Create a new worker
    this.workerId = this.workerBridge.createWorker('evolution');
    
    // Get the worker instance
    const worker = this.workerBridge.getWorker(this.workerId);
    if (worker instanceof Worker) {
      this.worker = worker;
      // Set up the message handler
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } else {
      console.error('Failed to create evolution worker as a standard Worker');
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
      case 'evolution.ready':
        console.log('Evolution worker is ready');
        break;
      
      case 'evolution.result':
        // This will be handled by the request completion logic above
        break;
      
      default:
        console.warn(`Unknown message type from evolution worker: ${type}`);
    }
  }

  /**
   * Handle worker errors
   * @param event The error event
   */
  private handleWorkerError(event: ErrorEvent): void {
    console.error('Evolution worker error:', event.message);
    
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
        type: 'evolution.setConfig',
        data: this.config
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
   * Calculate evolution for a creature based on confirmations
   * @param creature The creature to evolve
   * @param confirmations The number of confirmations
   * @returns Promise resolving to the evolution result
   */
  calculateEvolution(creature: Creature, confirmations: number): Promise<any> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }
    
    // Generate a unique ID for this request
    const id = `evolution_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a promise that will resolve when the worker responds
    const promise = new Promise<any>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      // Set a timeout to reject the promise if the worker doesn't respond
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Worker request timed out'));
        }
      }, 30000); // 30 second timeout
    });
    
    // Send the request to the worker
    this.worker.postMessage({
      id,
      type: 'evolution.calculate',
      data: {
        creature,
        confirmations
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
        type: 'evolution.reset'
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
 * Get the evolution worker service instance
 * @returns The evolution worker service instance
 */
export function getEvolutionWorkerService(): EvolutionWorkerService {
  if (!instance) {
    instance = new EvolutionWorkerService();
  }
  return instance;
} 
