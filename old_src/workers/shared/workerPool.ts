/**
 * Worker Pool for Bitcoin Protozoa
 * 
 * This module provides a worker pool implementation for efficient task distribution
 * across multiple web workers. It handles worker creation, task scheduling, and
 * load balancing.
 */

import { ComputeTask, ComputeOptions } from '../../types/workers/compute';
import { WorkerMessage } from '../../types/workers/messages';
import { createWorker, sendMessage, terminateWorker } from '../../lib/workerBridge';

/**
 * Worker Pool class
 * Manages a pool of workers for efficient task distribution
 */
export class WorkerPool {
  private workers: Map<number, { id: number; status: 'idle' | 'busy' }> = new Map();
  private taskQueue: ComputeTask[] = [];
  private options: ComputeOptions;
  private isProcessing: boolean = false;
  private taskMap: Map<string, ComputeTask> = new Map();
  
  /**
   * Create a new worker pool
   * @param options Worker pool options
   */
  constructor(options: ComputeOptions) {
    this.options = {
      // Default options
      workerCount: 4,
      workerUrl: '',
      maxConcurrentTasks: 8,
      taskTimeout: 30000,
      maxQueueSize: 100,
      priorityLevels: 3,
      useSharedArrayBuffers: false,
      useTransferables: true,
      maxRetries: 3,
      retryDelay: 1000,
      logLevel: 'error',
      ...options
    };
    
    this.initialize();
  }
  
  /**
   * Initialize the worker pool
   */
  private initialize(): void {
    // Create workers
    for (let i = 0; i < this.options.workerCount; i++) {
      const { id } = createWorker(this.options.workerUrl, {
        type: 'module',
        name: `worker-${i}`
      });
      
      this.workers.set(id, { id, status: 'idle' });
    }
    
    console.log(`Worker pool initialized with ${this.options.workerCount} workers`);
  }
  
  /**
   * Schedule a task for execution
   * @param task Task to schedule
   * @returns Promise that resolves with the task result
   */
  public scheduleTask(task: Omit<ComputeTask, 'id' | 'created'>): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check if the queue is full
      if (this.taskQueue.length >= this.options.maxQueueSize) {
        reject(new Error('Task queue is full'));
        return;
      }
      
      // Create a complete task
      const completeTask: ComputeTask = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created: Date.now(),
        callback: (result: any) => resolve(result),
        errorHandler: (error: any) => reject(error)
      };
      
      // Add the task to the queue
      this.taskQueue.push(completeTask);
      this.taskMap.set(completeTask.id, completeTask);
      
      // Sort the queue by priority
      this.taskQueue.sort((a, b) => b.priority - a.priority);
      
      // Start processing tasks
      if (!this.isProcessing) {
        this.processNextTask();
      }
    });
  }
  
  /**
   * Process the next task in the queue
   */
  private processNextTask(): void {
    // If there are no tasks, stop processing
    if (this.taskQueue.length === 0) {
      this.isProcessing = false;
      return;
    }
    
    this.isProcessing = true;
    
    // Find an idle worker
    const idleWorker = Array.from(this.workers.values()).find(worker => worker.status === 'idle');
    
    if (!idleWorker) {
      // No idle workers, wait and try again
      setTimeout(() => this.processNextTask(), 100);
      return;
    }
    
    // Get the next task
    const task = this.taskQueue.shift();
    if (!task) {
      // No tasks, stop processing
      this.isProcessing = false;
      return;
    }
    
    // Mark the worker as busy
    this.workers.set(idleWorker.id, { ...idleWorker, status: 'busy' });
    
    // Set the task start time
    task.started = Date.now();
    
    // Send the task to the worker
    const message: WorkerMessage = {
      type: task.type,
      data: task.data
    };
    
    // Get transferables if enabled
    const transferables = this.options.useTransferables ? this.getTransferables(task.data) : [];
    
    // Send the message
    sendMessage(idleWorker.id, message, transferables)
      .then(response => {
        // Mark the worker as idle
        this.workers.set(idleWorker.id, { ...idleWorker, status: 'idle' });
        
        // Set the task completion time
        task.completed = Date.now();
        
        // Call the task callback
        if (task.callback) {
          task.callback(response.data);
        }
        
        // Remove the task from the map
        this.taskMap.delete(task.id);
        
        // Process the next task
        this.processNextTask();
      })
      .catch(error => {
        // Mark the worker as idle
        this.workers.set(idleWorker.id, { ...idleWorker, status: 'idle' });
        
        // Handle the error
        this.handleTaskError(task, error);
        
        // Process the next task
        this.processNextTask();
      });
  }
  
  /**
   * Handle a task error
   * @param task Task that failed
   * @param error Error that occurred
   */
  private handleTaskError(task: ComputeTask, error: any): void {
    // Check if we should retry the task
    const retryCount = task.data?.retryCount || 0;
    
    if (retryCount < this.options.maxRetries) {
      // Increment the retry count
      task.data = {
        ...task.data,
        retryCount: retryCount + 1
      };
      
      // Add the task back to the queue with a delay
      setTimeout(() => {
        this.taskQueue.push(task);
        
        // Sort the queue by priority
        this.taskQueue.sort((a, b) => b.priority - a.priority);
        
        // Start processing tasks if not already processing
        if (!this.isProcessing) {
          this.processNextTask();
        }
      }, this.options.retryDelay);
    } else {
      // Call the error handler
      if (task.errorHandler) {
        task.errorHandler(error);
      }
      
      // Remove the task from the map
      this.taskMap.delete(task.id);
      
      // Log the error
      if (this.options.logLevel !== 'none') {
        console.error(`Task ${task.id} failed after ${retryCount} retries:`, error);
      }
    }
  }
  
  /**
   * Get transferable objects from task data
   * @param data Task data
   * @returns Array of transferable objects
   */
  private getTransferables(data: any): Transferable[] {
    const transferables: Transferable[] = [];
    
    if (!data) {
      return transferables;
    }
    
    // Check for ArrayBuffer and TypedArray properties
    for (const key in data) {
      const value = data[key];
      
      if (value instanceof ArrayBuffer) {
        transferables.push(value);
      } else if (
        value instanceof Int8Array ||
        value instanceof Uint8Array ||
        value instanceof Uint8ClampedArray ||
        value instanceof Int16Array ||
        value instanceof Uint16Array ||
        value instanceof Int32Array ||
        value instanceof Uint32Array ||
        value instanceof Float32Array ||
        value instanceof Float64Array
      ) {
        transferables.push(value.buffer);
      }
    }
    
    return transferables;
  }
  
  /**
   * Get the number of tasks in the queue
   * @returns Number of tasks in the queue
   */
  public getQueueLength(): number {
    return this.taskQueue.length;
  }
  
  /**
   * Get the number of busy workers
   * @returns Number of busy workers
   */
  public getBusyWorkerCount(): number {
    return Array.from(this.workers.values()).filter(worker => worker.status === 'busy').length;
  }
  
  /**
   * Get the number of idle workers
   * @returns Number of idle workers
   */
  public getIdleWorkerCount(): number {
    return Array.from(this.workers.values()).filter(worker => worker.status === 'idle').length;
  }
  
  /**
   * Terminate all workers
   */
  public terminate(): void {
    // Terminate all workers
    for (const worker of this.workers.values()) {
      terminateWorker(worker.id);
    }
    
    // Clear the worker map
    this.workers.clear();
    
    // Clear the task queue
    this.taskQueue = [];
    
    // Clear the task map
    this.taskMap.clear();
    
    // Reset the processing flag
    this.isProcessing = false;
    
    console.log('Worker pool terminated');
  }
}

/**
 * Create a new worker pool
 * @param options Worker pool options
 * @returns Worker pool instance
 */
export function createWorkerPool(options: ComputeOptions): WorkerPool {
  return new WorkerPool(options);
}
