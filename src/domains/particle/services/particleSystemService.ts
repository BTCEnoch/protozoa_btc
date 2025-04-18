/**
 * Particle System Service for Bitcoin Protozoa
 *
 * This service handles the physics and behavior of particles.
 * It provides a high-performance system for updating particle positions and properties.
 */

import { Vector3 } from '../../../shared/types/common';
import { Logging } from '../../../shared/utils';
import { 
  Particle, 
  ParticleGroup, 
  ParticleSystemConfig,
  ParticleUpdateResult
} from '../types/particle';
import { getWorkerService } from '../../workers/services/workerService';

// Singleton instance
let instance: ParticleSystemService | null = null;

/**
 * Particle System Service class
 * Handles the physics and behavior of particles
 */
export class ParticleSystemService {
  private config: ParticleSystemConfig | null = null;
  private initialized = false;
  private useWorkers = true;
  private logger = Logging.createLogger('ParticleSystemService');

  /**
   * Initialize the service with configuration
   * @param config Particle system configuration
   */
  public async initialize(config: ParticleSystemConfig): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Particle System Service already initialized');
      return;
    }

    this.config = config;
    this.useWorkers = config.useWebWorkers;

    // Initialize worker service if using workers
    if (this.useWorkers) {
      await getWorkerService().initialize();
    }

    this.initialized = true;
    this.logger.info('Particle System Service initialized');
  }

  /**
   * Update a particle group
   * @param group Particle group to update
   * @param deltaTime Time step for the update
   */
  public async updateGroup(group: ParticleGroup, deltaTime: number): Promise<void> {
    if (!this.initialized || !this.config) {
      this.logger.warn('Particle System Service not initialized');
      return;
    }

    try {
      // Check if we should use a worker for this group
      const useWorker = this.useWorkers && group.count > this.config.workerThreshold;

      if (useWorker) {
        // Use worker for large groups
        await this.updateGroupWithWorker(group, deltaTime);
      } else {
        // Use main thread for small groups
        this.updateGroupOnMainThread(group, deltaTime);
      }
    } catch (error) {
      this.logger.error(`Error updating group ${group.id}:`, error);
    }
  }

  /**
   * Update a particle group on the main thread
   * @param group The particle group to update
   * @param deltaTime Time step for the update
   */
  private updateGroupOnMainThread(group: ParticleGroup, deltaTime: number): void {
    // Extract positions, velocities, and accelerations
    const positions: Vector3[] = [];
    const velocities: Vector3[] = [];
    const accelerations: Vector3[] = [];

    for (const particle of group.particles) {
      positions.push(particle.position);
      velocities.push(particle.velocity);
      accelerations.push(particle.acceleration);
    }

    // Apply physics
    this.applyPhysics(positions, velocities, accelerations, deltaTime);

    // Apply behavior forces
    const forces = this.generateBehaviorForces(positions, velocities, Date.now() / 1000);
    
    // Apply forces to accelerations
    for (let i = 0; i < forces.length; i++) {
      accelerations[i].x += forces[i].x;
      accelerations[i].y += forces[i].y;
      accelerations[i].z += forces[i].z;
    }

    // Update particle positions and velocities
    for (let i = 0; i < group.particles.length; i++) {
      const particle = group.particles[i];
      
      // Update position and velocity
      particle.position = positions[i];
      particle.velocity = velocities[i];
      particle.acceleration = accelerations[i];
    }
  }

  /**
   * Update a particle group using a worker
   * @param group The particle group to update
   * @param deltaTime Time step for the update
   */
  private async updateGroupWithWorker(group: ParticleGroup, deltaTime: number): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Extract positions, velocities, and accelerations
      const positions = new Float32Array(group.particles.length * 3);
      const velocities = new Float32Array(group.particles.length * 3);
      const accelerations = new Float32Array(group.particles.length * 3);

      // Fill arrays with particle data
      for (let i = 0; i < group.particles.length; i++) {
        const particle = group.particles[i];
        const idx = i * 3;
        
        // Position
        positions[idx] = particle.position.x;
        positions[idx + 1] = particle.position.y;
        positions[idx + 2] = particle.position.z;
        
        // Velocity
        velocities[idx] = particle.velocity.x;
        velocities[idx + 1] = particle.velocity.y;
        velocities[idx + 2] = particle.velocity.z;
        
        // Acceleration
        accelerations[idx] = particle.acceleration.x;
        accelerations[idx + 1] = particle.acceleration.y;
        accelerations[idx + 2] = particle.acceleration.z;
      }

      // Create worker data
      const workerData = {
        groupId: group.id,
        positions,
        velocities,
        accelerations,
        deltaTime,
        timestamp: Date.now()
      };

      // Send to worker
      const result = await getWorkerService().runTask('updateParticles', workerData);

      // Update particles with result
      if (result && result.positions && result.velocities) {
        for (let i = 0; i < group.particles.length; i++) {
          const particle = group.particles[i];
          const idx = i * 3;
          
          // Update position
          particle.position.x = result.positions[idx];
          particle.position.y = result.positions[idx + 1];
          particle.position.z = result.positions[idx + 2];
          
          // Update velocity
          particle.velocity.x = result.velocities[idx];
          particle.velocity.y = result.velocities[idx + 1];
          particle.velocity.z = result.velocities[idx + 2];
          
          // Update acceleration
          particle.acceleration.x = result.accelerations[idx];
          particle.acceleration.y = result.accelerations[idx + 1];
          particle.acceleration.z = result.accelerations[idx + 2];
        }
      }
    } catch (error) {
      this.logger.error(`Error updating group ${group.id} with worker:`, error);
      
      // Fall back to main thread update
      this.updateGroupOnMainThread(group, deltaTime);
    }
  }

  /**
   * Apply physics to particles
   * @param positions Particle positions
   * @param velocities Particle velocities
   * @param accelerations Particle accelerations
   * @param deltaTime Time step for the update
   */
  private applyPhysics(
    positions: Vector3[],
    velocities: Vector3[],
    accelerations: Vector3[],
    deltaTime: number
  ): void {
    // Apply simple Euler integration
    for (let i = 0; i < positions.length; i++) {
      // Update velocity based on acceleration
      velocities[i].x += accelerations[i].x * deltaTime;
      velocities[i].y += accelerations[i].y * deltaTime;
      velocities[i].z += accelerations[i].z * deltaTime;
      
      // Apply damping
      const damping = 0.99;
      velocities[i].x *= damping;
      velocities[i].y *= damping;
      velocities[i].z *= damping;
      
      // Update position based on velocity
      positions[i].x += velocities[i].x * deltaTime;
      positions[i].y += velocities[i].y * deltaTime;
      positions[i].z += velocities[i].z * deltaTime;
      
      // Reset acceleration
      accelerations[i].x = 0;
      accelerations[i].y = 0;
      accelerations[i].z = 0;
    }
  }

  /**
   * Generate behavior forces for particles
   * @param positions Particle positions
   * @param velocities Particle velocities
   * @param time Current time in seconds
   * @returns Array of forces
   */
  private generateBehaviorForces(
    positions: Vector3[],
    velocities: Vector3[],
    time: number
  ): Vector3[] {
    // Create default forces (zero vectors)
    const forces: Vector3[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));

    // Apply simple flocking behavior
    const separationWeight = 1.5;
    const cohesionWeight = 1.0;
    const alignmentWeight = 0.5;
    const perception = 5.0;

    // Apply separation force
    this.applySeparationForce(positions, forces, separationWeight, perception);

    // Apply cohesion force
    this.applyCohesionForce(positions, forces, cohesionWeight, perception);

    // Apply alignment force
    this.applyAlignmentForce(positions, velocities, forces, alignmentWeight, perception);

    // Apply time-based oscillation
    this.applyOscillationForce(forces, time, 1.0, 0.5);

    return forces;
  }

  /**
   * Apply separation force to particles
   * @param positions Particle positions
   * @param forces Output forces
   * @param weight Force weight
   * @param perception Perception radius
   */
  private applySeparationForce(
    positions: Vector3[],
    forces: Vector3[],
    weight: number,
    perception: number
  ): void {
    const perceptionSquared = perception * perception;

    for (let i = 0; i < positions.length; i++) {
      let steerX = 0;
      let steerY = 0;
      let steerZ = 0;
      let total = 0;

      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;

        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dz = positions[i].z - positions[j].z;
        const distSquared = dx * dx + dy * dy + dz * dz;

        if (distSquared < perceptionSquared) {
          // Calculate separation vector
          const dist = Math.sqrt(distSquared);
          const factor = weight / (dist + 0.0001);

          steerX += dx * factor;
          steerY += dy * factor;
          steerZ += dz * factor;
          total++;
        }
      }

      if (total > 0) {
        forces[i].x += steerX;
        forces[i].y += steerY;
        forces[i].z += steerZ;
      }
    }
  }

  /**
   * Apply cohesion force to particles
   * @param positions Particle positions
   * @param forces Output forces
   * @param weight Force weight
   * @param perception Perception radius
   */
  private applyCohesionForce(
    positions: Vector3[],
    forces: Vector3[],
    weight: number,
    perception: number
  ): void {
    const perceptionSquared = perception * perception;

    for (let i = 0; i < positions.length; i++) {
      let centerX = 0;
      let centerY = 0;
      let centerZ = 0;
      let total = 0;

      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;

        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dz = positions[j].z - positions[i].z;
        const distSquared = dx * dx + dy * dy + dz * dz;

        if (distSquared < perceptionSquared) {
          centerX += positions[j].x;
          centerY += positions[j].y;
          centerZ += positions[j].z;
          total++;
        }
      }

      if (total > 0) {
        centerX /= total;
        centerY /= total;
        centerZ /= total;

        // Calculate direction to center
        const dirX = centerX - positions[i].x;
        const dirY = centerY - positions[i].y;
        const dirZ = centerZ - positions[i].z;

        // Calculate cohesion force
        forces[i].x += dirX * weight;
        forces[i].y += dirY * weight;
        forces[i].z += dirZ * weight;
      }
    }
  }

  /**
   * Apply alignment force to particles
   * @param positions Particle positions
   * @param velocities Particle velocities
   * @param forces Output forces
   * @param weight Force weight
   * @param perception Perception radius
   */
  private applyAlignmentForce(
    positions: Vector3[],
    velocities: Vector3[],
    forces: Vector3[],
    weight: number,
    perception: number
  ): void {
    const perceptionSquared = perception * perception;

    for (let i = 0; i < positions.length; i++) {
      let avgVelX = 0;
      let avgVelY = 0;
      let avgVelZ = 0;
      let total = 0;

      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;

        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dz = positions[j].z - positions[i].z;
        const distSquared = dx * dx + dy * dy + dz * dz;

        if (distSquared < perceptionSquared) {
          avgVelX += velocities[j].x;
          avgVelY += velocities[j].y;
          avgVelZ += velocities[j].z;
          total++;
        }
      }

      if (total > 0) {
        avgVelX /= total;
        avgVelY /= total;
        avgVelZ /= total;

        // Calculate alignment force
        forces[i].x += (avgVelX - velocities[i].x) * weight;
        forces[i].y += (avgVelY - velocities[i].y) * weight;
        forces[i].z += (avgVelZ - velocities[i].z) * weight;
      }
    }
  }

  /**
   * Apply oscillation force to particles
   * @param forces Output forces
   * @param time Current time in seconds
   * @param frequency Oscillation frequency
   * @param strength Force strength
   */
  private applyOscillationForce(
    forces: Vector3[],
    time: number,
    frequency: number,
    strength: number
  ): void {
    for (let i = 0; i < forces.length; i++) {
      // Create a unique phase for each particle
      const phase = (i / forces.length) * Math.PI * 2;

      // Calculate oscillation
      const oscillation = Math.sin(time * frequency + phase) * strength;

      // Apply oscillation force
      forces[i].x += oscillation * 0.1;
      forces[i].y += Math.cos(time * frequency + phase) * strength * 0.1;
      forces[i].z += (Math.sin(time * frequency * 0.5 + phase) + Math.cos(time * frequency * 0.3)) * strength * 0.05;
    }
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.config = null;
    this.initialized = false;
    this.logger.info('Particle System Service reset');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Get the particle system service instance
 * @returns The particle system service instance
 */
export function getParticleSystemService(): ParticleSystemService {
  if (!instance) {
    instance = new ParticleSystemService();
  }
  return instance;
}
