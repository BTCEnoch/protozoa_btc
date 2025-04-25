/**
 * Physics Service Test Helper
 *
 * This file provides helper functions for initializing the PhysicsService in tests.
 */

import { getPhysicsService } from '../../domains/physics/services/physicsService';
import { registry } from '../../shared/services/serviceRegistry';
import { PhysicsConfig } from '../../domains/physics/types';

/**
 * Initialize the PhysicsService for testing
 * @param config Optional physics configuration
 */
export async function initializePhysicsService(config?: PhysicsConfig): Promise<void> {
  console.log('Initializing Physics Service for testing...');

  // Get and initialize physics service
  const physicsService = getPhysicsService();

  // Apply config if provided
  if (config) {
    physicsService.setConfig(config);
  }

  await physicsService.initialize();

  // Register in service registry
  registry.register('PhysicsService', physicsService);

  console.log('Physics Service initialized for testing');
  return physicsService;
}

/**
 * Reset the PhysicsService
 */
export function resetPhysicsService(): void {
  if (registry.has('PhysicsService')) {
    const physicsService = registry.get('PhysicsService') as any;
    if (physicsService.isInitialized()) {
      physicsService.reset();
      console.log('Physics Service reset');
    }
  }
}
