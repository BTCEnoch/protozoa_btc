/**
 * Worker Bridge for Bitcoin Protozoa
 * 
 * This file provides utilities for creating and communicating with web workers.
 */

import { WorkerMessage } from '../types/workers/messages';

// Map to store workers by ID
const workers = new Map<number, Worker | SharedWorker>();
let nextWorkerId = 1;
let nextMessageId = 1;

/**
 * Create a new worker
 * @param scriptPath Path to the worker script
 * @param options Worker options
 * @returns Worker ID and worker instance
 */
export function createWorker(
  scriptPath: string,
  options?: {
    type?: 'module' | 'classic';
    name?: string;
    shared?: boolean;
  }
): { id: number; worker: Worker | SharedWorker } {
  const id = nextWorkerId++;
  
  let worker: Worker | SharedWorker;
  if (options?.shared) {
    worker = new SharedWorker(scriptPath, {
      type: options?.type || 'classic',
      name: options?.name || `worker-${id}`
    });
  } else {
    worker = new Worker(scriptPath, {
      type: options?.type || 'classic',
      name: options?.name || `worker-${id}`
    });
  }
  
  workers.set(id, worker);
  return { id, worker };
}

/**
 * Send a message to a worker
 * @param workerId Worker ID
 * @param message Message to send
 * @param transferables Optional transferable objects
 * @returns Promise that resolves with the worker's response
 */
export function sendMessage(
  workerId: number,
  message: WorkerMessage,
  transferables?: Transferable[]
): Promise<WorkerMessage> {
  return new Promise((resolve, reject) => {
    const worker = workers.get(workerId);
    if (!worker) {
      reject(new Error(`Worker with ID ${workerId} not found`));
      return;
    }
    
    const messageId = nextMessageId++;
    const messageWithId: WorkerMessage = {
      ...message,
      id: messageId.toString()
    };
    
    const handleMessage = (event: MessageEvent) => {
      const response = event.data as WorkerMessage;
      if (response.id === messageId.toString()) {
        if (worker instanceof Worker) {
          worker.removeEventListener('message', handleMessage);
        } else {
          (worker as SharedWorker).port.removeEventListener('message', handleMessage);
        }
        
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response);
        }
      }
    };
    
    if (worker instanceof Worker) {
      worker.addEventListener('message', handleMessage);
      worker.postMessage(messageWithId, transferables || []);
    } else {
      (worker as SharedWorker).port.addEventListener('message', handleMessage);
      (worker as SharedWorker).port.postMessage(messageWithId, transferables || []);
    }
  });
}

/**
 * Terminate a worker
 * @param workerId Worker ID
 */
export function terminateWorker(workerId: number): void {
  const worker = workers.get(workerId);
  if (!worker) {
    return;
  }
  
  if (worker instanceof Worker) {
    worker.terminate();
  } else {
    // SharedWorker doesn't have a terminate method
    // We can only close the port
    (worker as SharedWorker).port.close();
  }
  
  workers.delete(workerId);
}

/**
 * Get all worker IDs
 * @returns Array of worker IDs
 */
export function getWorkerIds(): number[] {
  return Array.from(workers.keys());
}

/**
 * Get a worker by ID
 * @param workerId Worker ID
 * @returns Worker instance or undefined if not found
 */
export function getWorker(workerId: number): Worker | SharedWorker | undefined {
  return workers.get(workerId);
}

/**
 * Worker bridge class
 */
export class WorkerBridge {
  private workers: Map<number, Worker | SharedWorker> = new Map();
  private nextWorkerId: number = 1;
  private nextMessageId: number = 1;
  
  /**
   * Create a new worker
   * @param scriptPath Path to the worker script
   * @param options Worker options
   * @returns Worker ID
   */
  public createWorker(
    scriptPath: string,
    options?: {
      type?: 'module' | 'classic';
      name?: string;
      shared?: boolean;
    }
  ): number {
    const id = this.nextWorkerId++;
    
    let worker: Worker | SharedWorker;
    if (options?.shared) {
      worker = new SharedWorker(scriptPath, {
        type: options?.type || 'classic',
        name: options?.name || `worker-${id}`
      });
    } else {
      worker = new Worker(scriptPath, {
        type: options?.type || 'classic',
        name: options?.name || `worker-${id}`
      });
    }
    
    this.workers.set(id, worker);
    return id;
  }
  
  /**
   * Send a message to a worker
   * @param workerId Worker ID
   * @param message Message to send
   * @param transferables Optional transferable objects
   * @returns Promise that resolves with the worker's response
   */
  public sendMessage(
    workerId: number,
    message: WorkerMessage,
    transferables?: Transferable[]
  ): Promise<WorkerMessage> {
    return new Promise((resolve, reject) => {
      const worker = this.workers.get(workerId);
      if (!worker) {
        reject(new Error(`Worker with ID ${workerId} not found`));
        return;
      }
      
      const messageId = this.nextMessageId++;
      const messageWithId: WorkerMessage = {
        ...message,
        id: messageId.toString()
      };
      
      const handleMessage = (event: MessageEvent) => {
        const response = event.data as WorkerMessage;
        if (response.id === messageId.toString()) {
          if (worker instanceof Worker) {
            worker.removeEventListener('message', handleMessage);
          } else {
            (worker as SharedWorker).port.removeEventListener('message', handleMessage);
          }
          
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        }
      };
      
      if (worker instanceof Worker) {
        worker.addEventListener('message', handleMessage);
        worker.postMessage(messageWithId, transferables || []);
      } else {
        (worker as SharedWorker).port.addEventListener('message', handleMessage);
        (worker as SharedWorker).port.postMessage(messageWithId, transferables || []);
      }
    });
  }
  
  /**
   * Terminate a worker
   * @param workerId Worker ID
   */
  public terminateWorker(workerId: number): void {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }
    
    if (worker instanceof Worker) {
      worker.terminate();
    } else {
      // SharedWorker doesn't have a terminate method
      // We can only close the port
      (worker as SharedWorker).port.close();
    }
    
    this.workers.delete(workerId);
  }
  
  /**
   * Get all worker IDs
   * @returns Array of worker IDs
   */
  public getWorkerIds(): number[] {
    return Array.from(this.workers.keys());
  }
  
  /**
   * Get a worker by ID
   * @param workerId Worker ID
   * @returns Worker instance or undefined if not found
   */
  public getWorker(workerId: number): Worker | SharedWorker | undefined {
    return this.workers.get(workerId);
  }
  
  /**
   * Terminate all workers
   */
  public terminateAll(): void {
    for (const [id, worker] of this.workers.entries()) {
      if (worker instanceof Worker) {
        worker.terminate();
      } else {
        // SharedWorker doesn't have a terminate method
        // We can only close the port
        (worker as SharedWorker).port.close();
      }
    }
    
    this.workers.clear();
  }
}
