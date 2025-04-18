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
import { 
  Particle, 
  ParticleGroup, 
  ParticleCreationOptions, 
  ParticleGroupCreationOptions,
  ParticleSystemConfig
} from '../types/particle';
import { getParticleSystemService } from './particleSystemService';

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
   */
  public async initialize(blockData: BlockData): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Particle Service already initialized');
      return;
    }

    this.blockData = blockData;

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

    // Use default values from config if not provided
    const position = options.position || { x: 0, y: 0, z: 0 };
    const velocity = options.velocity || { x: 0, y: 0, z: 0 };
    const mass = options.mass || this.config?.defaultMass || 1.0;
    const size = options.size || this.config?.defaultSize || 1.0;
    const color = options.color || this.config?.defaultColor || '#FFFFFF';
    const opacity = options.opacity !== undefined ? options.opacity : this.config?.defaultOpacity || 1.0;
    const emissive = options.emissive !== undefined ? options.emissive : this.config?.defaultEmissive || true;
    const geometry = options.geometry || this.config?.defaultGeometry || 'sphere';
    const material = options.material || this.config?.defaultMaterial || 'standard';

    // Create particle ID
    const particleId = `particle-${role}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the particle
    const particle: Particle = {
      id: particleId,
      role,
      position,
      velocity,
      acceleration: { x: 0, y: 0, z: 0 },
      mass,
      size,
      color,
      opacity,
      emissive,
      geometry,
      material
    };

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
   * Reset the service
   */
  public reset(): void {
    this.groups.clear();
    this.blockData = null;
    this.initialized = false;
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
