/**
 * Particle Worker Service for Bitcoin Protozoa
 *
 * This service manages particle workers for offloading particle physics calculations.
 */

import { Vector3, Vector3Utils } from '../../../shared/types/common';
import { TaskPriority } from '../types/worker';
import { getWorkerPoolService } from './workerPoolService';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: ParticleWorkerService | null = null;

/**
 * Particle Worker Service class
 */
export class ParticleWorkerService {
  private initialized: boolean = false;
  private particleGroups: Map<string, {
    lastUpdate: number;
    positions: Vector3[];
    velocities: Vector3[];
    accelerations: Vector3[];
  }> = new Map();
  private logger = Logging.createLogger('ParticleWorkerService');

  /**
   * Initialize the particle worker service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Particle Worker Service already initialized');
      return;
    }

    // Initialize worker pool service
    await getWorkerPoolService().initialize();

    this.initialized = true;
    this.logger.info('Particle Worker Service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Update particle positions using a worker
   * @param groupId Particle group ID
   * @param positions Particle positions
   * @param velocities Particle velocities
   * @param accelerations Particle accelerations
   * @param deltaTime Time step
   * @returns Promise resolving to updated positions, velocities, and accelerations
   */
  public async updatePositions(
    groupId: string,
    positions: Vector3[],
    velocities: Vector3[],
    accelerations: Vector3[],
    deltaTime: number
  ): Promise<{
    positions: Vector3[];
    velocities: Vector3[];
    accelerations: Vector3[];
  }> {
    if (!this.initialized) {
      throw new Error('Particle Worker Service not initialized');
    }

    // Store current state
    this.particleGroups.set(groupId, {
      lastUpdate: Date.now(),
      positions: positions.map(p => Vector3Utils.clone(p)),
      velocities: velocities.map(v => Vector3Utils.clone(v)),
      accelerations: accelerations.map(a => Vector3Utils.clone(a))
    });

    // Convert positions, velocities, and accelerations to arrays
    const positionsArray = new Float32Array(positions.length * 3);
    const velocitiesArray = new Float32Array(velocities.length * 3);
    const accelerationsArray = new Float32Array(accelerations.length * 3);

    for (let i = 0; i < positions.length; i++) {
      const ix3 = i * 3;
      positionsArray[ix3] = positions[i].x;
      positionsArray[ix3 + 1] = positions[i].y;
      positionsArray[ix3 + 2] = positions[i].z;

      velocitiesArray[ix3] = velocities[i].x;
      velocitiesArray[ix3 + 1] = velocities[i].y;
      velocitiesArray[ix3 + 2] = velocities[i].z;

      accelerationsArray[ix3] = accelerations[i].x;
      accelerationsArray[ix3 + 1] = accelerations[i].y;
      accelerationsArray[ix3 + 2] = accelerations[i].z;
    }

    // Submit task to worker pool
    const result = await getWorkerPoolService().submitParticleTask({
      type: 'updatePositions',
      groupId,
      positions: positionsArray,
      velocities: velocitiesArray,
      accelerations: accelerationsArray,
      deltaTime
    }, TaskPriority.HIGH);

    // Convert arrays back to Vector3 objects
    const updatedPositions: Vector3[] = [];
    const updatedVelocities: Vector3[] = [];
    const updatedAccelerations: Vector3[] = [];

    const resultPositions = result.positions as Float32Array;
    const resultVelocities = result.velocities as Float32Array;
    const resultAccelerations = result.accelerations as Float32Array;

    for (let i = 0; i < positions.length; i++) {
      const ix3 = i * 3;
      updatedPositions.push({
        x: resultPositions[ix3],
        y: resultPositions[ix3 + 1],
        z: resultPositions[ix3 + 2]
      });

      updatedVelocities.push({
        x: resultVelocities[ix3],
        y: resultVelocities[ix3 + 1],
        z: resultVelocities[ix3 + 2]
      });

      updatedAccelerations.push({
        x: resultAccelerations[ix3],
        y: resultAccelerations[ix3 + 1],
        z: resultAccelerations[ix3 + 2]
      });
    }

    // Update stored state
    this.particleGroups.set(groupId, {
      lastUpdate: Date.now(),
      positions: updatedPositions.map(p => Vector3Utils.clone(p)),
      velocities: updatedVelocities.map(v => Vector3Utils.clone(v)),
      accelerations: updatedAccelerations.map(a => Vector3Utils.clone(a))
    });

    return {
      positions: updatedPositions,
      velocities: updatedVelocities,
      accelerations: updatedAccelerations
    };
  }

  /**
   * Calculate forces for particles using a worker
   * @param groupId Particle group ID
   * @param positions Particle positions
   * @param velocities Particle velocities
   * @param targetPositions Optional target positions
   * @param behaviorParams Optional behavior parameters
   * @param deltaTime Time step
   * @returns Promise resolving to calculated forces
   */
  public async calculateForces(
    groupId: string,
    positions: Vector3[],
    velocities: Vector3[],
    targetPositions?: Vector3[],
    behaviorParams?: any,
    deltaTime: number = 1/60
  ): Promise<Vector3[]> {
    if (!this.initialized) {
      throw new Error('Particle Worker Service not initialized');
    }

    // Convert positions and velocities to arrays
    const positionsArray = new Float32Array(positions.length * 3);
    const velocitiesArray = new Float32Array(velocities.length * 3);

    for (let i = 0; i < positions.length; i++) {
      const ix3 = i * 3;
      positionsArray[ix3] = positions[i].x;
      positionsArray[ix3 + 1] = positions[i].y;
      positionsArray[ix3 + 2] = positions[i].z;

      velocitiesArray[ix3] = velocities[i].x;
      velocitiesArray[ix3 + 1] = velocities[i].y;
      velocitiesArray[ix3 + 2] = velocities[i].z;
    }

    // Convert target positions to array if provided
    let targetPositionsArray: Float32Array | undefined;
    if (targetPositions) {
      targetPositionsArray = new Float32Array(targetPositions.length * 3);
      for (let i = 0; i < targetPositions.length; i++) {
        const ix3 = i * 3;
        targetPositionsArray[ix3] = targetPositions[i].x;
        targetPositionsArray[ix3 + 1] = targetPositions[i].y;
        targetPositionsArray[ix3 + 2] = targetPositions[i].z;
      }
    }

    // Submit task to worker pool
    const result = await getWorkerPoolService().submitParticleTask({
      type: 'calculateForces',
      groupId,
      positions: positionsArray,
      velocities: velocitiesArray,
      targetPositions: targetPositionsArray,
      behaviorParams,
      deltaTime
    }, TaskPriority.HIGH);

    // Convert array back to Vector3 objects
    const forces: Vector3[] = [];
    const resultForces = result.forces as Float32Array;

    for (let i = 0; i < positions.length; i++) {
      const ix3 = i * 3;
      forces.push({
        x: resultForces[ix3],
        y: resultForces[ix3 + 1],
        z: resultForces[ix3 + 2]
      });
    }

    return forces;
  }

  /**
   * Get the last known state for a particle group
   * @param groupId Particle group ID
   * @returns Last known state, or undefined if not found
   */
  public getParticleGroupState(groupId: string): {
    lastUpdate: number;
    positions: Vector3[];
    velocities: Vector3[];
    accelerations: Vector3[];
  } | undefined {
    return this.particleGroups.get(groupId);
  }

  /**
   * Clear a particle group
   * @param groupId Particle group ID
   */
  public clearParticleGroup(groupId: string): void {
    this.particleGroups.delete(groupId);
  }

  /**
   * Clear all particle groups
   */
  public clearAllParticleGroups(): void {
    this.particleGroups.clear();
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.clearAllParticleGroups();
    this.initialized = false;
    this.logger.info('Particle Worker Service reset');
  }
}

/**
 * Get the particle worker service instance
 * @returns The particle worker service instance
 */
export function getParticleWorkerService(): ParticleWorkerService {
  if (!instance) {
    instance = new ParticleWorkerService();
  }
  return instance;
}
