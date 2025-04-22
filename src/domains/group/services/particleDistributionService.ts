/**
 * Particle Distribution Service
 *
 * This service is responsible for distributing particles across the five roles.
 */
import { Role } from '../../../shared/types/core';
import { BASE_PARTICLES_PER_GROUP, TOTAL_PARTICLES } from '../constants/distribution';
import { GroupDomainEventType } from '../events/types';
import { IParticleDistributionService } from '../interfaces/particleDistributionService';
import { ParticleGroup, ParticleGroups } from '../models/particleGroups';
import { calculateAttributes } from '../utils/attributeUtils';
import { calculateDominantRole, calculateSecondaryRole } from '../utils/groupUtils';
import { determineParticleRarity, normalizedRandomSplit } from '../utils/distributionUtils';

/**
 * ParticleDistributionService class
 * Implements the IParticleDistributionService interface
 */
export class ParticleDistributionService implements IParticleDistributionService {
  private rngService: any; // Replace with IRNGService when available

  /**
   * Constructor
   * @param rngService The RNG service
   */
  constructor(rngService: any) {
    this.rngService = rngService;
  }

  /**
   * Distributes particles across the five roles using the Normalized Random Split method
   * @param totalParticles The total number of particles to distribute
   * @param seed The seed for random number generation
   * @returns The distribution of particles across the five roles
   */
  public distributeParticles(totalParticles: number, seed: string): ParticleGroups {
    // Use the total particles from constants if not provided
    const particlesToDistribute = totalParticles || TOTAL_PARTICLES;

    // Get all roles
    const roles = Object.values(Role);

    // Distribute particles using normalized random split
    const distribution = normalizedRandomSplit(roles, particlesToDistribute, this.rngService, seed);

    // Create particle groups
    const particleGroups: ParticleGroups = {
      [Role.CORE]: this.createParticleGroup(Role.CORE, distribution[Role.CORE]),
      [Role.CONTROL]: this.createParticleGroup(Role.CONTROL, distribution[Role.CONTROL]),
      [Role.MOVEMENT]: this.createParticleGroup(Role.MOVEMENT, distribution[Role.MOVEMENT]),
      [Role.DEFENSE]: this.createParticleGroup(Role.DEFENSE, distribution[Role.DEFENSE]),
      [Role.ATTACK]: this.createParticleGroup(Role.ATTACK, distribution[Role.ATTACK]),
      totalParticles: particlesToDistribute
    };

    // Emit event
    this.emitEvent(GroupDomainEventType.PARTICLE_GROUPS_CREATED, {
      particleGroups,
      seed,
      timestamp: Date.now()
    });

    return particleGroups;
  }

  /**
   * Calculates the dominant role based on the particle distribution
   * @param particleGroups The particle groups for the creature
   * @returns The dominant role
   */
  public calculateDominantRole(particleGroups: ParticleGroups): Role {
    return calculateDominantRole(particleGroups);
  }

  /**
   * Calculates the secondary role based on the particle distribution
   * @param particleGroups The particle groups for the creature
   * @param dominantRole The dominant role
   * @returns The secondary role
   */
  public calculateSecondaryRole(particleGroups: ParticleGroups, dominantRole: Role): Role {
    return calculateSecondaryRole(particleGroups, dominantRole);
  }

  /**
   * Creates a particle group
   * @param role The role of the particle group
   * @param particleCount The number of particles in the group
   * @returns The particle group
   */
  private createParticleGroup(role: Role, particleCount: number): ParticleGroup {
    // Determine the rarity of the particle group based on its particle count
    const rarity = determineParticleRarity(particleCount);

    return {
      role,
      particleCount,
      attributes: calculateAttributes(particleCount),
      rarity
    };
  }

  /**
   * Emits an event
   * @param type The type of the event
   * @param payload The payload of the event
   */
  private emitEvent(type: GroupDomainEventType, payload: any): void {
    // In a real implementation, we would use an event emitter
    console.log(`Event emitted: ${type}`, payload);
  }
}
