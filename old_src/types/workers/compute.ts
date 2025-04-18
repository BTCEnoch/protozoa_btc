/**
 * Compute Types for Bitcoin Protozoa
 * 
 * This file defines the types for compute tasks in workers.
 */

/**
 * Compute task interface
 * Task for worker computation
 */
export interface ComputeTask {
  // Task ID
  id: string;
  
  // Task type
  type: string;
  
  // Task data
  data: any;
  
  // Task priority
  priority: number;
  
  // Task dependencies
  dependencies?: string[];
  
  // Task callback
  callback?: (result: any) => void;
  
  // Task error handler
  errorHandler?: (error: any) => void;
  
  // Task timeout
  timeout?: number;
  
  // Task created timestamp
  created: number;
  
  // Task started timestamp
  started?: number;
  
  // Task completed timestamp
  completed?: number;
}

/**
 * Compute options interface
 * Options for compute tasks
 */
export interface ComputeOptions {
  // Worker options
  workerCount: number;
  workerUrl: string;
  
  // Task options
  maxConcurrentTasks: number;
  taskTimeout: number;
  
  // Queue options
  maxQueueSize: number;
  priorityLevels: number;
  
  // Performance options
  useSharedArrayBuffers: boolean;
  useTransferables: boolean;
  
  // Error handling options
  maxRetries: number;
  retryDelay: number;
  
  // Logging options
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
}
