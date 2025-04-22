/**
 * Group Service
 *
 * This service is the main entry point for the Group Domain.
 */
import { Role, Tier } from '../../../shared/types/core';
import { GroupDomainEventType } from '../events/types';
import { IClassAssignmentService } from '../interfaces/classAssignmentService';
import { IGroupService } from '../interfaces/groupService';
import { IParticleDistributionService } from '../interfaces/particleDistributionService';
import { ITraitAssignmentService } from '../interfaces/traitAssignmentService';
import { ClassAssignment } from '../models/class';
import { GroupAttributes, ParticleGroups } from '../models/particleGroups';
import { GroupTraits } from '../models/traits';
import { calculateAttributes } from '../utils/attributeUtils';
import { calculateTier } from '../utils/groupUtils';

/**
 * GroupService class
 * Implements the IGroupService interface
 */
export class GroupService implements IGroupService {
  private particleDistributionService: IParticleDistributionService;
  private classAssignmentService: IClassAssignmentService;
  private traitAssignmentService: ITraitAssignmentService;

  /**
   * Constructor
   * @param particleDistributionService The particle distribution service
   * @param classAssignmentService The class assignment service
   * @param traitAssignmentService The trait assignment service
   */
  constructor(
    particleDistributionService: IParticleDistributionService,
    classAssignmentService: IClassAssignmentService,
    traitAssignmentService: ITraitAssignmentService
  ) {
    this.particleDistributionService = particleDistributionService;
    this.classAssignmentService = classAssignmentService;
    this.traitAssignmentService = traitAssignmentService;
  }

  /**
   * Creates particle groups for a creature
   * @param totalParticles The total number of particles for the creature
   * @param seed The seed for random number generation
   * @returns The particle groups for the creature
   */
  public createParticleGroups(totalParticles: number, seed: string): ParticleGroups {
    return this.particleDistributionService.distributeParticles(totalParticles, seed);
  }

  /**
   * Assigns a class to a creature based on its particle groups
   * @param particleGroups The particle groups for the creature
   * @param seed The seed for random number generation
   * @returns The class assignment for the creature
   */
  public assignClass(particleGroups: ParticleGroups, seed: string): ClassAssignment {
    return this.classAssignmentService.assignClass(particleGroups, seed);
  }

  /**
   * Assigns traits to a particle group
   * @param role The role of the particle group
   * @param tier The tier of the creature
   * @param seed The seed for random number generation
   * @returns The traits for the particle group
   */
  public assignTraits(role: Role, tier: Tier, seed: string): GroupTraits {
    return this.traitAssignmentService.assignTraits(role, tier, seed);
  }

  /**
   * Calculates the tier of a creature based on its total particle count
   * @param totalParticles The total number of particles for the creature
   * @returns The tier of the creature
   */
  public calculateTier(totalParticles: number): Tier {
    const tier = calculateTier(totalParticles);

    // Emit event
    this.emitEvent(GroupDomainEventType.GROUP_TIER_CALCULATED, {
      totalParticles,
      tier,
      timestamp: Date.now()
    });

    return tier;
  }

  /**
   * Calculates the attribute for a particle group
   * @param particleCount The number of particles in the group
   * @returns The attribute for the particle group
   */
  public calculateAttributes(particleCount: number): GroupAttributes {
    const attributes = calculateAttributes(particleCount);

    // Emit event
    this.emitEvent(GroupDomainEventType.GROUP_ATTRIBUTES_CALCULATED, {
      particleCount,
      attributes,
      timestamp: Date.now()
    });

    return attributes;
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
