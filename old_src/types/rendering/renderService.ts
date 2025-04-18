/**
 * Render Service Types for Bitcoin Protozoa
 * 
 * This file defines the types for the render service.
 */

import { Role } from '../core';
import { Vector3 } from '../common';

/**
 * Render service interface
 */
export interface RenderService {
  /**
   * Initialize the render service
   */
  initialize(): void;
  
  /**
   * Update particle positions
   * @param role Particle role
   * @param positions Array of particle positions
   * @param velocities Optional array of particle velocities
   * @param scales Optional array of particle scales
   */
  updateParticles(
    role: Role,
    positions: Vector3[],
    velocities?: Vector3[],
    scales?: number[]
  ): void;
  
  /**
   * Render the scene
   */
  render(): void;
  
  /**
   * Reset the render service
   */
  reset(): void;
}
