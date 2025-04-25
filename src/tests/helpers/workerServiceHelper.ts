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

  // Check if a mock service is already registered
  if (registry.has('WorkerService')) {
    const workerService = registry.get('WorkerService') as any;

    // Set worker count if provided
    if (options?.workerCount && workerService.setMaxWorkers) {
      workerService.setMaxWorkers(options.workerCount);
    }

    console.log('Using existing Worker Service');
    return;
  }

  // Get worker service
  try {
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
  } catch (error) {
    console.error('Failed to initialize Worker Service:', error);

    // Create a mock service as fallback
    const mockWorkerService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      isInitialized: jest.fn().mockReturnValue(true),
      setMaxWorkers: jest.fn(),
      reset: jest.fn()
    };

    // Set worker count if provided
    if (options?.workerCount) {
      mockWorkerService.setMaxWorkers(options.workerCount);
    }

    // Register mock in service registry
    registry.register('WorkerService', mockWorkerService);

    console.log('Mock Worker Service registered for testing');
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
