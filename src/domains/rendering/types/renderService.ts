/**
 * Render Service Types for Bitcoin Protozoa
 * 
 * This file defines the types for the render service.
 */

import { Role } from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';

/**
 * Render service interface
 */
export interface RenderService {
  /**
   * Initialize the render service
   * @param container DOM element to render to (optional)
   */
  initialize(container?: HTMLElement): Promise<void>;
  
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
   * Start the render loop
   */
  startRenderLoop(): void;
  
  /**
   * Stop the render loop
   */
  stopRenderLoop(): void;
  
  /**
   * Render the scene
   */
  render(): void;
  
  /**
   * Take a screenshot of the current view
   * @returns Data URL of the screenshot
   */
  takeScreenshot(): string;
  
  /**
   * Dispose of all resources
   */
  dispose(): void;
}
