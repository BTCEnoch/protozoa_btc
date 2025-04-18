/**
 * Particle Service for Bitcoin Protozoa
 *
 * This service manages all particle groups in the system.
 * It handles creation, updates, and rendering of particles.
 */

import { Role } from '../../types/core';
import { ParticleGroup } from '../../types/particles/particle';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { Vector3 } from '../../types/common';
import { getParticleGroupFactory } from './particleGroupFactory';
import { getRenderService } from '../rendering/renderService';
import { getParticlePositions, getParticleVelocities, updateParticlePositions, applyForcesToParticles } from '../../lib/particleSystem';
import { getParticleWorkerService } from './particleWorkerService';
import { getConfigLoader } from '../config';
import { BehaviorTrait } from '../../types/traits/trait';

/**
 * Particle Service class
 * Manages all particle groups in the system
 */
class ParticleService {
  private static instance: ParticleService | null = null;
  private groups: Map<string, ParticleGroup> = new Map();
  private blockData: BlockData | null = null;
  private initialized = false;
  private lastUpdateTime = 0;

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
  public static getInstance(): ParticleService {
    if (!ParticleService.instance) {
      ParticleService.instance = new ParticleService();
    }
    return ParticleService.instance;
  }

  /**
   * Initialize the service with block data
   * @param blockData Bitcoin block data
   */
  public initialize(blockData: BlockData): void {
    if (this.initialized) {
      console.warn('Particle Service already initialized');
      return;
    }

    this.blockData = blockData;

    // Initialize particle group factory
    getParticleGroupFactory().initialize(blockData);

    // Clear existing groups
    this.groups.clear();

    // Set last update time
    this.lastUpdateTime = Date.now();

    this.initialized = true;
    console.log('Particle Service initialized');
  }

  /**
   * Create particle groups for all roles
   * @param particleCounts Map of roles to particle counts
   */
  public createParticleGroups(particleCounts: Map<Role, number>): void {
    if (!this.initialized || !this.blockData) {
      throw new Error('Particle Service not initialized');
    }

    // Create a group for each role
    let index = 0;
    for (const [role, count] of particleCounts.entries()) {
      // Skip if count is 0
      if (count <= 0) continue;

      // Create the group
      const group = getParticleGroupFactory().createGroup({
        role,
        count,
        nonce: this.blockData.nonce,
        index: index++
      });

      // Store the group
      this.groups.set(group.id, group);

      console.log(`Created particle group: ${group.id}, Role: ${role}, Count: ${count}, Tier: ${group.subclass.tier}`);
    }
  }

  /**
   * Update all particle groups
   */
  public async update(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Calculate delta time
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;

    // Update each group
    const updatePromises: Promise<void>[] = [];

    for (const group of this.groups.values()) {
      updatePromises.push(this.updateGroup(group, deltaTime));
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);
  }

  /**
   * Update a specific particle group
   * @param group Particle group to update
   * @param deltaTime Time step for the update
   */
  private async updateGroup(group: ParticleGroup, deltaTime: number): Promise<void> {
    try {
      // Check if we should use a worker for this group
      const useWorker = this.shouldUseWorker(group);

      if (useWorker) {
        // Use worker for large groups
        await this.updateGroupWithWorker(group, deltaTime);
      } else {
        // Use main thread for small groups
        this.updateGroupOnMainThread(group, deltaTime);
      }
    } catch (error) {
      console.error(`Error updating group ${group.id}:`, error);
    }
  }

  /**
   * Check if a worker should be used for a group
   * @param group The particle group
   * @returns True if a worker should be used, false otherwise
   */
  private shouldUseWorker(group: ParticleGroup): boolean {
    try {
      // Get worker threshold from config
      const performanceConfig = getConfigLoader().getPerformanceConfig();
      const workerThreshold = performanceConfig.workerThreshold;

      // Use worker if particle count exceeds threshold
      return group.count > workerThreshold;
    } catch (error) {
      console.warn('Error getting worker threshold from config:', error);
      // Default to 1000 if config fails
      return group.count > 1000;
    }
  }

  /**
   * Update a particle group on the main thread
   * @param group The particle group to update
   * @param deltaTime Time step for the update
   */
  private updateGroupOnMainThread(group: ParticleGroup, deltaTime: number): void {
    // Get current positions
    const positions = getParticlePositions(group.particles);

    // Generate behavior forces
    // TODO: Replace with actual behavior service implementation
    const behaviorForces = this.generateBehaviorForces(
      group.traits.behavior && group.traits.behavior.length > 0 ? group.traits.behavior[0] : null,
      positions,
      Date.now() * 0.001 // Current time in seconds
    );

    // Apply forces to particles
    applyForcesToParticles(group.particles, behaviorForces);

    // Update particle positions
    updateParticlePositions(group.particles, deltaTime);

    // Get updated positions and velocities
    const updatedPositions = getParticlePositions(group.particles);
    const updatedVelocities = getParticleVelocities(group.particles);

    // Update rendering
    getRenderService().updateParticles(
      group.role,
      updatedPositions,
      updatedVelocities
    );
  }

  /**
   * Update a particle group using a worker
   * @param group The particle group to update
   * @param deltaTime Time step for the update
   */
  private async updateGroupWithWorker(group: ParticleGroup, deltaTime: number): Promise<void> {
    // Get particle positions, velocities, and accelerations
    const positions = getParticlePositions(group.particles);
    const velocities = getParticleVelocities(group.particles);
    const accelerations = group.particles.map(p => p.acceleration);

    // Get behavior parameters
    const behaviorParams = group.traits.behavior[0]?.physicsLogic || {
      separationWeight: 1.5,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      perception: 5.0
    };

    // Get target positions if available
    const targetPositions = group.particles.map(p => p.targetPosition).filter(Boolean);

    // Calculate forces using worker
    const forces = await getParticleWorkerService().calculateForces(
      group.id,
      positions,
      velocities,
      targetPositions.length === group.particles.length ? targetPositions : undefined,
      behaviorParams,
      deltaTime
    );

    // Apply forces to particles
    applyForcesToParticles(group.particles, forces);

    // Update positions using worker
    const result = await getParticleWorkerService().updatePositions(
      group.id,
      positions,
      velocities,
      accelerations,
      deltaTime
    );

    // Update particle data
    for (let i = 0; i < group.particles.length; i++) {
      group.particles[i].position = result.positions[i];
      group.particles[i].velocity = result.velocities[i];
      group.particles[i].acceleration = result.accelerations[i];
    }

    // Update rendering
    getRenderService().updateParticles(
      group.role,
      result.positions,
      result.velocities
    );
  }

  /**
   * Get a particle group by ID
   * @param id Group ID
   * @returns The particle group, or undefined if not found
   */
  public getGroup(id: string): ParticleGroup | undefined {
    return this.groups.get(id);
  }

  /**
   * Get all particle groups
   * @returns Array of all particle groups
   */
  public getAllGroups(): ParticleGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * Get particle groups by role
   * @param role Particle role
   * @returns Array of particle groups with the specified role
   */
  public getGroupsByRole(role: Role): ParticleGroup[] {
    return Array.from(this.groups.values()).filter(group => group.role === role);
  }

  /**
   * Get the total number of particles
   * @returns Total number of particles across all groups
   */
  public getTotalParticleCount(): number {
    let total = 0;
    for (const group of this.groups.values()) {
      total += group.count;
    }
    return total;
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.groups.clear();
    this.blockData = null;
    this.initialized = false;
  }

  /**
   * Generate behavior forces for particles
   * @param behaviorTrait Behavior trait
   * @param positions Particle positions
   * @param time Current time in seconds
   * @returns Array of forces
   */
  private generateBehaviorForces(
    behaviorTrait: BehaviorTrait | null,
    positions: Vector3[],
    time: number
  ): Vector3[] {
    // Create default forces (zero vectors)
    const forces: Vector3[] = positions.map(() => ({ x: 0, y: 0, z: 0 }));

    // If no behavior trait, return zero forces
    if (!behaviorTrait) {
      return forces;
    }

    // Get behavior parameters
    const params = behaviorTrait.physicsLogic || {
      strength: 1.0,
      range: 10.0,
      priority: 1.0,
      persistence: 0.5,
      frequency: 1.0
    };

    // Apply simple flocking behavior
    const separationWeight = 1.5;
    const alignmentWeight = 1.0;
    const cohesionWeight = 1.0;
    const perception = params.range || 5.0;

    // Apply separation force
    this.applySeparationForce(positions, forces, separationWeight, perception);

    // Apply cohesion force
    this.applyCohesionForce(positions, forces, cohesionWeight, perception);

    // Apply time-based oscillation
    this.applyOscillationForce(forces, time, params.frequency || 1.0, params.strength || 1.0);

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
}

/**
 * Get the particle service instance
 * @returns The particle service instance
 */
export function getParticleService(): ParticleService {
  return ParticleService.getInstance();
}

