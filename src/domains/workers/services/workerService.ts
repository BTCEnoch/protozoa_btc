/**
 * Worker Service for Bitcoin Protozoa
 *
 * This service manages web workers for offloading heavy computations.
 */

import { 
  WorkerMessage, 
  WorkerMessageType, 
  WorkerTaskType, 
  WorkerStatus, 
  WorkerInfo, 
  TaskInfo, 
  TaskStatus, 
  TaskPriority, 
  TaskCallback 
} from '../types/worker';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: WorkerService | null = null;

/**
 * Worker Service class
 */
export class WorkerService {
  private workers: Map<number, Worker> = new Map();
  private workerInfo: Map<number, WorkerInfo> = new Map();
  private taskQueue: TaskInfo[] = [];
  private taskCallbacks: Map<string, TaskCallback> = new Map();
  private nextWorkerId: number = 1;
  private nextTaskId: number = 1;
  private initialized: boolean = false;
  private config: any = null;
  private logger = Logging.createLogger('WorkerService');

  /**
   * Initialize the worker service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Worker Service already initialized');
      return;
    }

    // Load configuration
    await this.loadConfig();

    // Initialize with minimum workers
    const minWorkers = this.config?.minWorkers || 2;
    for (let i = 0; i < minWorkers; i++) {
      this.createWorker();
    }

    this.initialized = true;
    this.logger.info(`Worker Service initialized with ${minWorkers} workers`);
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/workers.json');
      this.config = await response.json();
      this.logger.info('Loaded worker configuration');
    } catch (error) {
      this.logger.error('Failed to load worker configuration:', error);
      // Use default configuration
      this.config = {
        minWorkers: 2,
        maxWorkers: 4,
        idleTimeout: 60000,
        taskTimeout: 10000,
        workerScript: 'src/workers/worker.js'
      };
    }
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a new worker
   * @returns Worker ID
   */
  public createWorker(): number {
    if (!this.initialized) {
      this.logger.warn('Worker Service not initialized');
      return -1;
    }

    // Check if we've reached the maximum number of workers
    const maxWorkers = this.config?.maxWorkers || 4;
    if (this.workers.size >= maxWorkers) {
      this.logger.warn(`Maximum number of workers (${maxWorkers}) reached`);
      return -1;
    }

    // Create worker ID
    const workerId = this.nextWorkerId++;

    // Create worker
    const workerScript = this.config?.workerScript || 'src/workers/worker.js';
    const worker = new Worker(workerScript, { type: 'module' });

    // Set up message handler
    worker.onmessage = (event) => this.handleWorkerMessage(workerId, event.data);
    worker.onerror = (event) => this.handleWorkerError(workerId, event);

    // Store worker
    this.workers.set(workerId, worker);

    // Create worker info
    const workerInfo: WorkerInfo = {
      id: `worker-${workerId}`,
      status: WorkerStatus.IDLE,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      taskCount: 0,
      errors: 0
    };
    this.workerInfo.set(workerId, workerInfo);

    // Initialize worker
    this.sendMessageToWorker(workerId, {
      type: WorkerMessageType.INITIALIZE,
      id: `init-${workerId}`,
      timestamp: Date.now(),
      config: this.config
    });

    this.logger.debug(`Created worker with ID ${workerId}`);
    return workerId;
  }

  /**
   * Send a message to a worker
   * @param workerId Worker ID
   * @param message Message to send
   */
  private sendMessageToWorker(workerId: number, message: WorkerMessage): void {
    const worker = this.workers.get(workerId);
    if (!worker) {
      this.logger.warn(`Worker with ID ${workerId} not found`);
      return;
    }

    // Update worker info
    const workerInfo = this.workerInfo.get(workerId);
    if (workerInfo) {
      workerInfo.lastActiveAt = Date.now();
      if (message.type === WorkerMessageType.PROCESS) {
        workerInfo.status = WorkerStatus.BUSY;
        workerInfo.currentTask = message.id;
        workerInfo.taskCount++;
      }
    }

    // Send message
    worker.postMessage(message);
  }

  /**
   * Handle a message from a worker
   * @param workerId Worker ID
   * @param message Message from worker
   */
  private handleWorkerMessage(workerId: number, message: WorkerMessage): void {
    // Update worker info
    const workerInfo = this.workerInfo.get(workerId);
    if (workerInfo) {
      workerInfo.lastActiveAt = Date.now();
      if (message.type === WorkerMessageType.RESULT) {
        workerInfo.status = WorkerStatus.IDLE;
        workerInfo.currentTask = undefined;

        // Process task result
        this.processTaskResult(message);

        // Process next task in queue
        this.processNextTask(workerId);
      }
    }
  }

  /**
   * Handle a worker error
   * @param workerId Worker ID
   * @param event Error event
   */
  private handleWorkerError(workerId: number, event: ErrorEvent): void {
    // Update worker info
    const workerInfo = this.workerInfo.get(workerId);
    if (workerInfo) {
      workerInfo.status = WorkerStatus.ERROR;
      workerInfo.errors++;

      // Log error
      this.logger.error(`Worker ${workerId} error:`, event.message);

      // If the worker has a current task, fail it
      if (workerInfo.currentTask) {
        const taskId = workerInfo.currentTask;
        const callback = this.taskCallbacks.get(taskId);
        if (callback) {
          callback(new Error(`Worker error: ${event.message}`));
          this.taskCallbacks.delete(taskId);
        }
        workerInfo.currentTask = undefined;
      }

      // If the worker has too many errors, terminate it
      if (workerInfo.errors > 5) {
        this.terminateWorker(workerId);
        this.createWorker(); // Create a new worker to replace it
      } else {
        // Otherwise, set it back to idle and process next task
        workerInfo.status = WorkerStatus.IDLE;
        this.processNextTask(workerId);
      }
    }
  }

  /**
   * Process a task result
   * @param message Result message from worker
   */
  private processTaskResult(message: WorkerMessage): void {
    // Get task callback
    const callback = this.taskCallbacks.get(message.id);
    if (!callback) {
      this.logger.warn(`No callback found for task ${message.id}`);
      return;
    }

    // Call callback with result
    if (message.type === WorkerMessageType.RESULT) {
      callback(null, (message as any).result);
    } else if (message.type === WorkerMessageType.ERROR) {
      callback(new Error((message as any).error));
    }

    // Remove callback
    this.taskCallbacks.delete(message.id);
  }

  /**
   * Process the next task in the queue
   * @param workerId Worker ID to use
   */
  private processNextTask(workerId: number): void {
    // Check if there are tasks in the queue
    if (this.taskQueue.length === 0) {
      return;
    }

    // Get worker info
    const workerInfo = this.workerInfo.get(workerId);
    if (!workerInfo || workerInfo.status !== WorkerStatus.IDLE) {
      return;
    }

    // Sort tasks by priority
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    // Get next task
    const task = this.taskQueue.shift();
    if (!task) {
      return;
    }

    // Update task info
    task.status = TaskStatus.RUNNING;
    task.startedAt = Date.now();
    task.workerId = workerId;

    // Send task to worker
    this.sendMessageToWorker(workerId, {
      type: WorkerMessageType.PROCESS,
      id: task.id,
      timestamp: Date.now(),
      data: task.data,
      taskType: task.type
    });
  }

  /**
   * Submit a task to be processed by a worker
   * @param type Task type
   * @param data Task data
   * @param priority Task priority
   * @param callback Callback to be called when task is complete
   * @returns Task ID
   */
  public submitTask(
    type: WorkerTaskType,
    data: any,
    priority: TaskPriority = TaskPriority.NORMAL,
    callback: TaskCallback
  ): string {
    if (!this.initialized) {
      callback(new Error('Worker Service not initialized'));
      return '';
    }

    // Create task ID
    const taskId = `task-${this.nextTaskId++}`;

    // Create task info
    const task: TaskInfo = {
      id: taskId,
      type,
      data,
      priority,
      status: TaskStatus.PENDING,
      createdAt: Date.now()
    };

    // Store callback
    this.taskCallbacks.set(taskId, callback);

    // Add task to queue
    this.taskQueue.push(task);

    // Try to process task immediately
    this.tryProcessTask(task);

    return taskId;
  }

  /**
   * Try to process a task immediately
   * @param task Task to process
   */
  private tryProcessTask(task: TaskInfo): void {
    // Find an idle worker
    for (const [workerId, workerInfo] of this.workerInfo.entries()) {
      if (workerInfo.status === WorkerStatus.IDLE) {
        // Remove task from queue
        const index = this.taskQueue.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.taskQueue.splice(index, 1);
        }

        // Process task
        this.processNextTask(workerId);
        return;
      }
    }

    // If no idle workers and we haven't reached max workers, create a new one
    const maxWorkers = this.config?.maxWorkers || 4;
    if (this.workers.size < maxWorkers) {
      const workerId = this.createWorker();
      if (workerId !== -1) {
        // New worker will process next task when initialized
      }
    }
  }

  /**
   * Cancel a task
   * @param taskId Task ID
   * @returns True if task was cancelled, false otherwise
   */
  public cancelTask(taskId: string): boolean {
    // Check if task is in queue
    const index = this.taskQueue.findIndex(task => task.id === taskId);
    if (index !== -1) {
      // Remove task from queue
      const task = this.taskQueue[index];
      this.taskQueue.splice(index, 1);

      // Call callback with error
      const callback = this.taskCallbacks.get(taskId);
      if (callback) {
        callback(new Error('Task cancelled'));
        this.taskCallbacks.delete(taskId);
      }

      return true;
    }

    // Check if task is running
    for (const [workerId, workerInfo] of this.workerInfo.entries()) {
      if (workerInfo.currentTask === taskId) {
        // Can't cancel running task, but can remove callback
        this.taskCallbacks.delete(taskId);
        return false;
      }
    }

    return false;
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

    // Get worker info
    const workerInfo = this.workerInfo.get(workerId);
    if (workerInfo && workerInfo.currentTask) {
      // Fail current task
      const taskId = workerInfo.currentTask;
      const callback = this.taskCallbacks.get(taskId);
      if (callback) {
        callback(new Error('Worker terminated'));
        this.taskCallbacks.delete(taskId);
      }
    }

    // Terminate worker
    worker.terminate();

    // Remove worker
    this.workers.delete(workerId);
    this.workerInfo.delete(workerId);

    this.logger.debug(`Terminated worker with ID ${workerId}`);
  }

  /**
   * Terminate all workers
   */
  public terminateAllWorkers(): void {
    // Terminate all workers
    for (const workerId of this.workers.keys()) {
      this.terminateWorker(workerId);
    }

    // Fail all tasks
    for (const [taskId, callback] of this.taskCallbacks.entries()) {
      callback(new Error('All workers terminated'));
    }
    this.taskCallbacks.clear();
    this.taskQueue = [];

    this.logger.info('All workers terminated');
  }

  /**
   * Get worker info
   * @param workerId Worker ID
   * @returns Worker info
   */
  public getWorkerInfo(workerId: number): WorkerInfo | undefined {
    return this.workerInfo.get(workerId);
  }

  /**
   * Get all worker info
   * @returns Map of worker info
   */
  public getAllWorkerInfo(): Map<number, WorkerInfo> {
    return this.workerInfo;
  }

  /**
   * Get task queue
   * @returns Task queue
   */
  public getTaskQueue(): TaskInfo[] {
    return [...this.taskQueue];
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.terminateAllWorkers();
    this.initialized = false;
    this.nextWorkerId = 1;
    this.nextTaskId = 1;
    this.logger.info('Worker Service reset');
  }
}

/**
 * Get the worker service instance
 * @returns The worker service instance
 */
export function getWorkerService(): WorkerService {
  if (!instance) {
    instance = new WorkerService();
  }
  return instance;
}
