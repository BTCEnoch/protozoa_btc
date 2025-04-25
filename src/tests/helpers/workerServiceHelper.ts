/**
 * Worker Service Test Helper
 * 
 * This file provides helper functions for initializing the WorkerService in tests.
 */

import { getWorkerService } from '../../domains/workers/services/workerService';
import { registry } from '../../shared/services/serviceRegistry';

/**
 * Initialize the WorkerService for testing
 * @param options Worker service configuration options
 */
export async function initializeWorkerService(options?: {
  workerCount?: number;
  taskTimeout?: number;
}): Promise<void> {
  console.log('Initializing Worker Service for testing...');
  
  // Get worker service
  const workerService = getWorkerService();
  
  // Initialize with options if provided
  if (!workerService.isInitialized()) {
    await workerService.initialize();
    
    // Set worker count if provided
    if (options?.workerCount) {
      workerService.setMaxWorkers(options.workerCount);
    }
    
    // Register in service registry
    registry.register('WorkerService', workerService);
    
    console.log('Worker Service initialized for testing');
  }
}

/**
 * Reset the WorkerService
 */
export function resetWorkerService(): void {
  const workerService = getWorkerService();
  if (workerService.isInitialized()) {
    workerService.reset();
    console.log('Worker Service reset');
  }
}
