/**
 * Particle Service for Bitcoin Protozoa
 *
 * This service manages all particle groups in the system.
 * It handles creation, updates, and rendering of particles.
 */

import { Role, AttributeType } from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { Logging } from '../../../shared/utils';
import { getObjectReuseManager } from '../../../shared/utils/memory/objectReuse';
import {
  Particle,
  ParticleGroup,
  ParticleCreationOptions,
  ParticleGroupCreationOptions,
  ParticleSystemConfig
} from '../types/particle';
import { getParticleSystemService } from './particleSystemService';
import { getWorkerService } from '../../workers/services/workerService';
import { TaskPriority, WorkerTaskType } from '../../workers/types/worker';
import { registry } from '../../../shared/services/serviceRegistry';
import { ITraitService } from '../../traits/interfaces/traitService';

// Singleton instance
let instance: ParticleService | null = null;

/**
 * Particle Service class
 * Manages all particle groups in the system
 */
export class ParticleService {
  private groups: Map<string, ParticleGroup> = new Map();
  private blockData: BlockData | null = null;
  private initialized = false;
  private lastUpdateTime = 0;
  private config: ParticleSystemConfig | null = null;
  private logger = Logging.createLogger('ParticleService');

  /**
   * Initialize the service with block data
   * @param blockData Bitcoin block data
   * @throws Error if Traits service is not initialized
   */
  public async initialize(blockData: BlockData): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Particle Service already initialized');
      return;
    }

    this.blockData = blockData;

    // Check if Traits service is available and initialized
    if (!registry.has('TraitService')) {
      throw new Error('Traits service not available. Cannot initialize Particle service.');
    }

    const traitService = registry.get<ITraitService>('TraitService');
    if (!traitService.isInitialized()) {
      throw new Error('Traits service must be initialized before Particle service. Check initialization order.');
    }

    this.logger.info('Traits service is initialized. Proceeding with Particle service initialization.');

    // Load configuration
    await this.loadConfig();

    // Initialize particle system service
    await getParticleSystemService().initialize(this.config!);

    // Clear existing groups
    this.groups.clear();

    // Set last update time
    this.lastUpdateTime = Date.now();

    this.initialized = true;
    this.logger.info('Particle Service initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/particles.json');
      this.config = await response.json();
      this.logger.info('Loaded particle configuration');
    } catch (error) {
      this.logger.error('Failed to load particle configuration:', error);
      // Use default configuration
      this.config = {
        maxParticles: 10000,
        workerThreshold: 1000,
        useWebWorkers: true,
        updateInterval: 16,
        renderInterval: 16,
        physicsStepSize: 0.016,
        defaultMass: 1.0,
        defaultSize: 1.0,
        defaultColor: '#FFFFFF',
        defaultOpacity: 1.0,
        defaultEmissive: true,
        defaultGeometry: 'sphere',
        defaultMaterial: 'standard'
      };
      this.logger.warn('Using default particle configuration');
    }
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
      const groupOptions: ParticleGroupCreationOptions = {
        role,
        count,
        nonce: this.blockData.nonce,
        index
      };

      const group = this.createParticleGroup(groupOptions);

      // Store the group
      this.groups.set(group.id, group);

      this.logger.info(`Created particle group: ${group.id}, Role: ${role}, Count: ${count}`);
      index++;
    }
  }

  /**
   * Create a particle group
   * @param options Group creation options
   * @returns The created particle group
   */
  private createParticleGroup(options: ParticleGroupCreationOptions): ParticleGroup {
    const { role, count, nonce, index } = options;

    // Create group ID
    const groupId = `group-${role}-${index}-${nonce}`;

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(this.createParticle({
        role,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      }));
    }

    // Create the group
    const group: ParticleGroup = {
      id: groupId,
      role,
      count,
      particles,
      attributes: {} as Record<AttributeType, number>,
      baseAttributeValue: 0,
      attributeMultipliers: {
        base: 1.0,
        fromTraits: 0,
        fromMutations: 0
      }
    };

    return group;
  }

  /**
   * Create a particle
   * @param options Particle creation options
   * @returns The created particle
   */
  private createParticle(options: ParticleCreationOptions): Particle {
    const { role } = options;

    // Get a particle from the pool
    const particle = getObjectReuseManager().getParticlePool().get();

    // Create particle ID
    particle.id = `particle-${role}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Set role
    particle.role = role;

    // Set position
    if (options.position) {
      particle.position.x = options.position.x;
      particle.position.y = options.position.y;
      particle.position.z = options.position.z;
    }

    // Set velocity
    if (options.velocity) {
      particle.velocity.x = options.velocity.x;
      particle.velocity.y = options.velocity.y;
      particle.velocity.z = options.velocity.z;
    }

    // Set other properties
    particle.mass = options.mass || this.config?.defaultMass || 1.0;
    particle.size = options.size || this.config?.defaultSize || 1.0;
    particle.color = options.color || this.config?.defaultColor || '#FFFFFF';
    particle.opacity = options.opacity !== undefined ? options.opacity : this.config?.defaultOpacity || 1.0;
    particle.emissive = options.emissive !== undefined ? options.emissive : this.config?.defaultEmissive || true;
    particle.geometry = options.geometry || this.config?.defaultGeometry || 'sphere';
    particle.material = options.material || this.config?.defaultMaterial || 'standard';

    // Log reuse statistics periodically
    if (Math.random() < 0.01) { // Log approximately once every 100 particles
      const stats = getObjectReuseManager().getStats();
      this.logger.debug(`Particle pool stats: ${stats.particles.poolSize} pooled, ${stats.particles.created} created, ${stats.particles.reused} reused`);
    }

    return particle;
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
      // Use the particle system service to update the group
      await getParticleSystemService().updateGroup(group, deltaTime);
    } catch (error) {
      this.logger.error(`Error updating group ${group.id}:`, error);
    }
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
   * Get particle positions for a specific role
   * @param role Particle role
   * @returns Array of particle positions
   */
  public getParticlePositions(role: Role): Vector3[] {
    const positions: Vector3[] = [];

    // Get all groups for the role
    const groups = this.getGroupsByRole(role);

    // Collect positions from all groups
    for (const group of groups) {
      for (const particle of group.particles) {
        positions.push(particle.position);
      }
    }

    return positions;
  }

  /**
   * Get particle velocities for a specific role
   * @param role Particle role
   * @returns Array of particle velocities
   */
  public getParticleVelocities(role: Role): Vector3[] {
    const velocities: Vector3[] = [];

    // Get all groups for the role
    const groups = this.getGroupsByRole(role);

    // Collect velocities from all groups
    for (const group of groups) {
      for (const particle of group.particles) {
        velocities.push(particle.velocity);
      }
    }

    return velocities;
  }

  /**
   * Update multiple particle groups atomically
   * @param groupIds IDs of the groups to update
   * @param deltaTime Time step for the update
   * @returns Promise that resolves when all updates are complete
   */
  public async updateGroupsAtomically(groupIds: string[], deltaTime: number): Promise<void> {
    if (!this.initialized) {
      this.logger.warn('Particle Service not initialized');
      return;
    }

    // Get worker service
    const workerService = getWorkerService();
    if (!workerService.isInitialized()) {
      this.logger.warn('Worker Service not initialized');
      return;
    }

    // Create a transaction
    const transactionId = workerService.createTransaction();

    // Create a promise to track completion
    return new Promise<void>((resolve, reject) => {
      try {
        // Submit tasks for each group
        const taskIds: string[] = [];
        for (const groupId of groupIds) {
          const group = this.groups.get(groupId);
          if (!group) {
            this.logger.warn(`Group ${groupId} not found`);
            continue;
          }

          // Submit task to update the group
          const taskId = workerService.submitTransactionTask(
            transactionId,
            WorkerTaskType.PARTICLE,
            {
              groupId,
              particles: group.particles,
              deltaTime
            },
            TaskPriority.HIGH,
            (error, result) => {
              if (error) {
                this.logger.error(`Error updating group ${groupId}:`, error);
                return;
              }

              // Update the group with the result
              if (result && result.particles) {
                group.particles = result.particles;
                this.groups.set(groupId, group);
              }
            }
          );

          taskIds.push(taskId);
        }

        // Commit the transaction
        workerService.commitTransaction(transactionId, (error) => {
          if (error) {
            this.logger.error('Error committing transaction:', error);
            reject(error);
            return;
          }

          this.logger.debug(`Updated ${groupIds.length} groups atomically`);
          resolve();
        });
      } catch (error) {
        // Rollback the transaction on error
        workerService.rollbackTransaction(transactionId);
        this.logger.error('Error updating groups atomically:', error);
        reject(error);
      }
    });
  }

  /**
   * Release a particle back to the pool
   * @param particle The particle to release
   */
  public releaseParticle(particle: Particle): void {
    getObjectReuseManager().getParticlePool().release(particle);
  }

  /**
   * Release all particles in a group back to the pool
   * @param group The particle group
   */
  public releaseParticleGroup(group: ParticleGroup): void {
    for (const particle of group.particles) {
      this.releaseParticle(particle);
    }
    group.particles = [];
  }

  /**
   * Reset the service
   */
  public reset(): void {
    // Release all particles back to the pool
    for (const group of this.groups.values()) {
      this.releaseParticleGroup(group);
    }

    this.groups.clear();
    this.blockData = null;
    this.initialized = false;

    // Log pool statistics
    getObjectReuseManager().logStats();

    this.logger.info('Particle Service reset');
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
 * Get the particle service instance
 * @returns The particle service instance
 */
export function getParticleService(): ParticleService {
  if (!instance) {
    instance = new ParticleService();
  }
  return instance;
}


