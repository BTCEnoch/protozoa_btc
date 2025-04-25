/**
 * Formation Service Test Helper
 * 
 * This file provides helper functions for initializing the FormationService in tests.
 */

import { getFormationService } from '../../domains/traits/formations/services/formationService';
import { getParticleService } from '../../domains/particle/services/particleService';
import { getRNGService } from '../../domains/rng/services/rngService';
import { registry } from '../../shared/services/serviceRegistry';
import { BlockData } from '../../domains/bitcoin/types/bitcoin';

/**
 * Initialize the FormationService for testing
 * This ensures that all dependencies are properly initialized
 * @param blockData The Bitcoin block data to use for initialization
 */
export async function initializeFormationService(blockData: BlockData): Promise<void> {
  console.log('Initializing Formation Service for testing...');
  
  // Initialize RNG Service first (required by FormationService)
  const rngService = getRNGService();
  if (!rngService.isInitialized()) {
    await rngService.initialize(blockData);
    registry.register('RNGService', rngService);
    console.log('RNG Service initialized for testing');
  }
  
  // Initialize Particle Service (required by FormationService)
  const particleService = getParticleService();
  if (!particleService.isInitialized()) {
    await particleService.initialize(blockData);
    registry.register('ParticleService', particleService);
    console.log('Particle Service initialized for testing');
  }
  
  // Initialize Formation Service
  const formationService = getFormationService();
  if (!formationService.isInitialized()) {
    await formationService.initialize(blockData);
    registry.register('FormationService', formationService);
    console.log('Formation Service initialized for testing');
  }
}

/**
 * Reset the FormationService and its dependencies
 */
export function resetFormationService(): void {
  const formationService = getFormationService();
  if (formationService.isInitialized()) {
    formationService.reset();
    console.log('Formation Service reset');
  }
  
  const particleService = getParticleService();
  if (particleService.isInitialized()) {
    particleService.reset();
    console.log('Particle Service reset');
  }
  
  const rngService = getRNGService();
  if (rngService.isInitialized()) {
    rngService.reset();
    console.log('RNG Service reset');
  }
}
