/**
 * Worker Pool Service for Bitcoin Protozoa
 *
 * This service provides a higher-level interface for managing worker pools
 * for specific task types.
 */

import { 
  WorkerTaskType, 
  TaskPriority, 
  TaskCallback, 
  WorkerPoolConfig 
} from '../types/worker';
import { getWorkerService } from './workerService';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: WorkerPoolService | null = null;

/**
 * Worker Pool Service class
 */
export class WorkerPoolService {
  private taskTypeMap: Map<string, WorkerTaskType> = new Map();
  private initialized: boolean = false;
  private config: any = null;
  private logger = Logging.createLogger('WorkerPoolService');

  /**
   * Initialize the worker pool service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Worker Pool Service already initialized');
      return;
    }

    // Initialize worker service
    await getWorkerService().initialize();

    // Load configuration
    await this.loadConfig();

    // Initialize task type map
    this.initializeTaskTypeMap();

    this.initialized = true;
    this.logger.info('Worker Pool Service initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/workers.json');
      this.config = await response.json();
      this.logger.info('Loaded worker pool configuration');
    } catch (error) {
      this.logger.error('Failed to load worker pool configuration:', error);
      // Use default configuration
      this.config = {
        pools: {
          physics: {
            minWorkers: 1,
            maxWorkers: 2,
            taskTimeout: 5000
          },
          particle: {
            minWorkers: 1,
            maxWorkers: 2,
            taskTimeout: 5000
          },
          formation: {
            minWorkers: 1,
            maxWorkers: 1,
            taskTimeout: 10000
          },
          behavior: {
            minWorkers: 1,
            maxWorkers: 1,
            taskTimeout: 5000
          },
          evolution: {
            minWorkers: 1,
            maxWorkers: 1,
            taskTimeout: 30000
          },
          gameTheory: {
            minWorkers: 1,
            maxWorkers: 1,
            taskTimeout: 10000
          }
        }
      };
    }
  }

  /**
   * Initialize task type map
   */
  private initializeTaskTypeMap(): void {
    this.taskTypeMap.set('physics', WorkerTaskType.PHYSICS);
    this.taskTypeMap.set('particle', WorkerTaskType.PARTICLE);
    this.taskTypeMap.set('formation', WorkerTaskType.FORMATION);
    this.taskTypeMap.set('behavior', WorkerTaskType.BEHAVIOR);
    this.taskTypeMap.set('evolution', WorkerTaskType.EVOLUTION);
    this.taskTypeMap.set('gameTheory', WorkerTaskType.GAME_THEORY);
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Submit a task to a specific pool
   * @param poolName Pool name
   * @param data Task data
   * @param priority Task priority
   * @param callback Callback to be called when task is complete
   * @returns Task ID
   */
  public submitTask(
    poolName: string,
    data: any,
    priority: TaskPriority = TaskPriority.NORMAL,
    callback: TaskCallback
  ): string {
    if (!this.initialized) {
      callback(new Error('Worker Pool Service not initialized'));
      return '';
    }

    // Get task type
    const taskType = this.taskTypeMap.get(poolName);
    if (!taskType) {
      callback(new Error(`Unknown pool: ${poolName}`));
      return '';
    }

    // Submit task to worker service
    return getWorkerService().submitTask(taskType, data, priority, callback);
  }

  /**
   * Submit a physics task
   * @param data Task data
   * @param priority Task priority
   * @returns Promise resolving to task result
   */
  public submitPhysicsTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise((resolve, reject) => {
      this.submitTask('physics', data, priority, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Submit a particle task
   * @param data Task data
   * @param priority Task priority
   * @returns Promise resolving to task result
   */
  public submitParticleTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise((resolve, reject) => {
      this.submitTask('particle', data, priority, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Submit a formation task
   * @param data Task data
   * @param priority Task priority
   * @returns Promise resolving to task result
   */
  public submitFormationTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise((resolve, reject) => {
      this.submitTask('formation', data, priority, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Submit a behavior task
   * @param data Task data
   * @param priority Task priority
   * @returns Promise resolving to task result
   */
  public submitBehaviorTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise((resolve, reject) => {
      this.submitTask('behavior', data, priority, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Submit an evolution task
   * @param data Task data
   * @param priority Task priority
   * @returns Promise resolving to task result
   */
  public submitEvolutionTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise((resolve, reject) => {
      this.submitTask('evolution', data, priority, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Submit a game theory task
   * @param data Task data
   * @param priority Task priority
   * @returns Promise resolving to task result
   */
  public submitGameTheoryTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise((resolve, reject) => {
      this.submitTask('gameTheory', data, priority, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Cancel a task
   * @param taskId Task ID
   * @returns True if task was cancelled, false otherwise
   */
  public cancelTask(taskId: string): boolean {
    if (!this.initialized) {
      return false;
    }

    return getWorkerService().cancelTask(taskId);
  }

  /**
   * Reset the service
   */
  public reset(): void {
    getWorkerService().reset();
    this.initialized = false;
    this.logger.info('Worker Pool Service reset');
  }
}

/**
 * Get the worker pool service instance
 * @returns The worker pool service instance
 */
export function getWorkerPoolService(): WorkerPoolService {
  if (!instance) {
    instance = new WorkerPoolService();
  }
  return instance;
}
