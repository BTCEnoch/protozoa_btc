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
  WorkerStatus,
  WorkerHealthStatus,
  WorkerHealthMetrics
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
  // Configuration for worker pools
  private workerConfig: any = null;
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
      const response = await fetch('src/shared/data/config/workers.json');
      this.workerConfig = await response.json();
      this.logger.info('Loaded worker pool configuration');
    } catch (error) {
      this.logger.error('Failed to load worker pool configuration:', error);
      // Use default configuration
      this.workerConfig = {
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
  public async submitTask(
    poolName: string,
    data: any,
    priority: TaskPriority = TaskPriority.NORMAL,
    callback: TaskCallback
  ): Promise<string | undefined> {
    if (!this.initialized) {
      callback(new Error('Worker Pool Service not initialized'));
      return undefined;
    }

    // Get task type
    const taskType = this.taskTypeMap.get(poolName);
    if (!taskType) {
      callback(new Error(`Unknown pool: ${poolName}`));
      return undefined;
    }

    // Submit task to worker service
    try {
      // The worker service's submitTask returns a Promise<string>
      return await getWorkerService().submitTask(taskType, data, priority, callback);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  }

  /**
   * Submit a physics task
   * @param data Task data
   * @param priority Task priority
   * @returns Promise resolving to task result
   */
  public async submitPhysicsTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.submitTask('physics', data, priority, (error, result) => {
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
  public async submitParticleTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.submitTask('particle', data, priority, (error, result) => {
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
  public async submitFormationTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.submitTask('formation', data, priority, (error, result) => {
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
  public async submitBehaviorTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.submitTask('behavior', data, priority, (error, result) => {
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
  public async submitEvolutionTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.submitTask('evolution', data, priority, (error, result) => {
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
  public async submitGameTheoryTask(data: any, priority: TaskPriority = TaskPriority.NORMAL): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.submitTask('gameTheory', data, priority, (error, result) => {
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

  /**
   * Get worker health status
   * @param workerId Worker ID
   * @returns Worker health status or undefined if worker not found
   */
  public getWorkerHealthStatus(workerId: number): WorkerHealthStatus | undefined {
    const workerInfo = getWorkerService().getWorkerInfo(workerId);
    if (!workerInfo) {
      return undefined;
    }

    return workerInfo.health?.status || WorkerHealthStatus.UNKNOWN;
  }

  /**
   * Get worker health metrics
   * @param workerId Worker ID
   * @returns Worker health metrics or undefined if worker not found
   */
  public getWorkerHealthMetrics(workerId: number): WorkerHealthMetrics | undefined {
    const workerInfo = getWorkerService().getWorkerInfo(workerId);
    if (!workerInfo) {
      return undefined;
    }

    return workerInfo.health;
  }

  /**
   * Update worker health status
   * @param workerId Worker ID
   * @param status Worker health status
   * @returns True if update was successful, false otherwise
   */
  public updateWorkerHealthStatus(workerId: number, status: WorkerHealthStatus): boolean {
    const workerInfo = getWorkerService().getWorkerInfo(workerId);
    if (!workerInfo) {
      return false;
    }

    // Create health metrics if not exists
    if (!workerInfo.health) {
      workerInfo.health = {
        status,
        lastCheckedAt: Date.now()
      };
    } else {
      // Update status and last checked time
      workerInfo.health.status = status;
      workerInfo.health.lastCheckedAt = Date.now();
    }

    return true;
  }

  /**
   * Update worker health metrics
   * @param workerId Worker ID
   * @param metrics Worker health metrics
   * @returns True if update was successful, false otherwise
   */
  public updateWorkerHealthMetrics(workerId: number, metrics: Partial<WorkerHealthMetrics>): boolean {
    const workerInfo = getWorkerService().getWorkerInfo(workerId);
    if (!workerInfo) {
      return false;
    }

    // Create health metrics if not exists
    if (!workerInfo.health) {
      workerInfo.health = {
        status: metrics.status || WorkerHealthStatus.UNKNOWN,
        lastCheckedAt: Date.now(),
        ...metrics
      };
    } else {
      // Update metrics
      Object.assign(workerInfo.health, metrics, { lastCheckedAt: Date.now() });
    }

    return true;
  }

  /**
   * Check health of all workers
   * @returns Map of worker IDs to health status
   */
  public checkAllWorkersHealth(): Map<number, WorkerHealthStatus> {
    const result = new Map<number, WorkerHealthStatus>();
    const workerInfoMap = getWorkerService().getAllWorkerInfo();

    for (const [workerId, workerInfo] of workerInfoMap.entries()) {
      // Calculate health status based on worker info
      let healthStatus = WorkerHealthStatus.HEALTHY;

      // Check if worker is active
      if (workerInfo.status === WorkerStatus.ERROR || workerInfo.status === WorkerStatus.TERMINATED) {
        healthStatus = WorkerHealthStatus.UNHEALTHY;
      } else if (workerInfo.errors > 0) {
        // If worker has errors but is still active, mark as degraded
        healthStatus = WorkerHealthStatus.DEGRADED;
      }

      // Update worker health metrics
      this.updateWorkerHealthMetrics(workerId, {
        status: healthStatus,
        errorRate: workerInfo.errors / Math.max(1, workerInfo.taskCount),
        taskSuccessRate: (workerInfo.taskCount - workerInfo.errors) / Math.max(1, workerInfo.taskCount)
      });

      // Add to result
      result.set(workerId, healthStatus);
    }

    return result;
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
