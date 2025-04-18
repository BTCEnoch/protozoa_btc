/**
 * Particle Worker Service for Bitcoin Protozoa
 *
 * This service manages particle workers for offloading particle physics calculations.
 */

import { Vector3 } from '../../types/common';
import { WorkerMessage } from '../../types/workers/messages';
import { WorkerBridge } from '../../lib/workerBridge';
import { getConfigLoader } from '../config';

/**
 * Particle Worker Service class
 */
class ParticleWorkerService {
  private static instance: ParticleWorkerService | null = null;
  private initialized = false;
  private workerBridge = new WorkerBridge();
  private workers: Map<string, number> = new Map(); // Map of group ID to worker ID
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): ParticleWorkerService {
    if (!ParticleWorkerService.instance) {
      ParticleWorkerService.instance = new ParticleWorkerService();
    }
    return ParticleWorkerService.instance;
  }
  
  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Particle Worker Service already initialized');
      return;
    }
    
    this.initialized = true;
    console.log('Particle Worker Service initialized');
  }
  
  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Create a worker for a particle group
   * @param groupId Particle group ID
   * @returns Worker ID
   */
  public createWorker(groupId: string): number {
    // Check if a worker already exists for this group
    if (this.workers.has(groupId)) {
      return this.workers.get(groupId)!;
    }
    
    // Create a new worker
    const workerId = this.workerBridge.createWorker('src/workers/particle/particleWorker.ts', {
      type: 'module',
      name: `particle-worker-${groupId}`
    });
    
    // Store the worker ID
    this.workers.set(groupId, workerId);
    
    // Initialize the worker with physics config
    try {
      const physicsConfig = getConfigLoader().getPhysicsConfig();
      this.workerBridge.sendMessage(workerId, {
        type: 'initialize',
        data: {
          options: physicsConfig
        }
      });
    } catch (error) {
      console.warn('Error initializing worker with physics config:', error);
    }
    
    return workerId;
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
    // Get or create worker for this group
    const workerId = this.createWorker(groupId);
    
    // Convert positions, velocities, and accelerations to Float32Arrays
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
    
    // Send message to worker
    const response = await this.workerBridge.sendMessage(workerId, {
      type: 'updatePositions',
      data: {
        positions: positionsArray,
        velocities: velocitiesArray,
        accelerations: accelerationsArray,
        deltaTime
      }
    }, [
      positionsArray.buffer,
      velocitiesArray.buffer,
      accelerationsArray.buffer
    ]);
    
    // Convert Float32Arrays back to Vector3 arrays
    const updatedPositions: Vector3[] = [];
    const updatedVelocities: Vector3[] = [];
    const updatedAccelerations: Vector3[] = [];
    
    const resultPositions = response.data.positions as Float32Array;
    const resultVelocities = response.data.velocities as Float32Array;
    const resultAccelerations = response.data.accelerations as Float32Array;
    
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
    // Get or create worker for this group
    const workerId = this.createWorker(groupId);
    
    // Convert positions and velocities to Float32Arrays
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
    
    // Convert target positions to Float32Array if provided
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
    
    // Send message to worker
    const transferables: Transferable[] = [
      positionsArray.buffer,
      velocitiesArray.buffer
    ];
    
    if (targetPositionsArray) {
      transferables.push(targetPositionsArray.buffer);
    }
    
    const response = await this.workerBridge.sendMessage(workerId, {
      type: 'calculateForces',
      data: {
        positions: positionsArray,
        velocities: velocitiesArray,
        targetPositions: targetPositionsArray,
        behaviorParams,
        deltaTime
      }
    }, transferables);
    
    // Convert Float32Array back to Vector3 array
    const forces: Vector3[] = [];
    const resultForces = response.data.forces as Float32Array;
    
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
   * Terminate a worker
   * @param groupId Particle group ID
   */
  public terminateWorker(groupId: string): void {
    const workerId = this.workers.get(groupId);
    if (workerId !== undefined) {
      this.workerBridge.terminateWorker(workerId);
      this.workers.delete(groupId);
    }
  }
  
  /**
   * Terminate all workers
   */
  public terminateAllWorkers(): void {
    this.workerBridge.terminateAll();
    this.workers.clear();
  }
  
  /**
   * Reset the service
   */
  public reset(): void {
    this.terminateAllWorkers();
    this.initialized = false;
  }
}

/**
 * Get the particle worker service instance
 * @returns The particle worker service instance
 */
export function getParticleWorkerService(): ParticleWorkerService {
  return ParticleWorkerService.getInstance();
}
