/**
 * Class Assignment Service
 *
 * This service is responsible for assigning classes to creatures.
 */
import { Role, Tier } from '../../../shared/types/core';
import { GroupDomainEventType } from '../events/types';
import { IClassAssignmentService } from '../interfaces/classAssignmentService';
import { ClassAssignment, HybridSubclass, SpecializedSubclass } from '../models/class';
import { ParticleGroups } from '../models/particleGroups';
import { MainClass, MainClassToSpecializedPaths, RoleToMainClass, SpecializedPath, SpecializedPathToEvolution, SubclassPrefix } from '../models/types';
import { calculateDominantRole, calculateSecondaryRole, calculateTier } from '../utils/groupUtils';

/**
 * ClassAssignmentService class
 * Implements the IClassAssignmentService interface
 */
export class ClassAssignmentService implements IClassAssignmentService {
  private rngService: any; // Replace with IRNGService when available

  /**
   * Constructor
   * @param rngService The RNG service
   */
  constructor(rngService: any) {
    this.rngService = rngService;
  }

  /**
   * Assigns a class to a creature based on its particle groups
   * @param particleGroups The particle groups for the creature
   * @param seed The seed for random number generation
   * @returns The class assignment for the creature
   */
  public assignClass(particleGroups: ParticleGroups, seed: string): ClassAssignment {
    // Calculate dominant role
    const dominantRole = calculateDominantRole(particleGroups);

    // Calculate tier based on the dominant role's particle count
    const tier = calculateTier(particleGroups[dominantRole].particleCount);

    // Calculate secondary role
    const secondaryRole = calculateSecondaryRole(particleGroups, dominantRole);

    // Determine main class
    const mainClass = RoleToMainClass[dominantRole];

    // Create subclass
    let subclass;
    if (tier === Tier.TIER_1 || tier === Tier.TIER_2) {
      // Create hybrid subclass for tiers 1-2
      subclass = this.createHybridSubclass(mainClass, dominantRole, secondaryRole, tier);
    } else {
      // Determine specialized path for tiers 3-6
      const specializedPath = this.determineSpecializedPath(mainClass, secondaryRole, seed);

      // Create specialized subclass
      subclass = this.createSpecializedSubclass(mainClass, specializedPath, tier);
    }

    // Create class assignment
    const classAssignment: ClassAssignment = {
      mainClass,
      subclass,
      dominantRole,
      secondaryRole,
      tier
    };

    // Emit event
    this.emitEvent(GroupDomainEventType.CLASS_ASSIGNED, {
      classAssignment,
      seed,
      timestamp: Date.now()
    });

    return classAssignment;
  }

  /**
   * Creates a hybrid subclass for tiers 1-2
   * @param mainClass The main class of the creature
   * @param primaryRole The primary role of the creature
   * @param secondaryRole The secondary role of the creature
   * @param tier The tier of the creature
   * @returns The hybrid subclass
   */
  public createHybridSubclass(
    mainClass: MainClass,
    primaryRole: Role,
    secondaryRole: Role,
    tier: Tier
  ): HybridSubclass {
    // Generate subclass name
    const primaryPrefix = SubclassPrefix[primaryRole];
    const secondaryPrefix = SubclassPrefix[secondaryRole];
    const name = `${primaryPrefix} ${secondaryPrefix} ${mainClass}`;

    return {
      name,
      mainClass,
      tier,
      primaryRole,
      secondaryRole
    };
  }

  /**
   * Creates a specialized subclass for tiers 3-6
   * @param mainClass The main class of the creature
   * @param specializedPath The specialized path of the creature
   * @param tier The tier of the creature
   * @returns The specialized subclass
   */
  public createSpecializedSubclass(
    mainClass: MainClass,
    specializedPath: SpecializedPath,
    tier: Tier
  ): SpecializedSubclass {
    // Get the evolution name for the specialized path at the given tier
    const name = SpecializedPathToEvolution[specializedPath][tier];

    return {
      name,
      mainClass,
      tier,
      specializedPath
    };
  }

  /**
   * Determines the specialized path for a creature based on its dominant and secondary roles
   * @param mainClass The main class of the creature
   * @param secondaryRole The secondary role of the creature
   * @param seed The seed for random number generation
   * @returns The specialized path
   */
  public determineSpecializedPath(
    mainClass: MainClass,
    secondaryRole: Role,
    seed: string
  ): SpecializedPath {
    // Get the specialized paths for the main class
    const specializedPaths = MainClassToSpecializedPaths[mainClass];

    // Use the secondary role to influence the choice
    // For simplicity, we'll use a random number to choose between the two paths
    const r = this.rngService.getRandomNumber(seed);

    // If the secondary role is ATTACK or DEFENSE, favor the first path
    // If the secondary role is CONTROL or MOVEMENT, favor the second path
    // If the secondary role is CORE, use a 50/50 split
    let threshold = 0.5;
    if (secondaryRole === Role.ATTACK || secondaryRole === Role.DEFENSE) {
      threshold = 0.7;
    } else if (secondaryRole === Role.CONTROL || secondaryRole === Role.MOVEMENT) {
      threshold = 0.3;
    }

    return r < threshold ? specializedPaths[0] : specializedPaths[1];
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
