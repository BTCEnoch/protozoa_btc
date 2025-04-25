/**
 * Trait Assignment Service
 *
 * This service is responsible for assigning traits to particle groups.
 */
import { Role, Tier, Rarity } from '../../../shared/types/core';
import { TRAIT_RARITY_DISTRIBUTIONS } from '../constants/distribution';
import { GroupDomainEventType } from '../events/types';
import { ITraitAssignmentService } from '../interfaces/traitAssignmentService';
import { GroupTrait, GroupTraitType, GroupTraits, TraitRarityDistribution } from '../models/traits';

/**
 * TraitAssignmentService class
 * Implements the ITraitAssignmentService interface
 */
export class TraitAssignmentService implements ITraitAssignmentService {
  private rngService: any; // Replace with IRNGService when available

  /**
   * Constructor
   * @param rngService The RNG service
   * @param traitRepository The trait repository (will be used in future implementations)
   */
  constructor(rngService: any, traitRepository: any) {
    this.rngService = rngService;
    // Store traitRepository when we implement the repository pattern
    // this.traitRepository = traitRepository;
  }

  /**
   * Assigns traits to a particle group
   * @param role The role of the particle group
   * @param tier The tier of the creature
   * @param seed The seed for random number generation
   * @returns The traits for the particle group
   */
  public assignTraits(role: Role, tier: Tier, seed: string): GroupTraits {
    // Get the trait rarity distribution for the tier
    const distribution = this.getTraitRarityDistribution(tier);

    // Determine the number of traits based on the tier
    const traitCount = this.getTraitCount(tier);

    // Assign traits
    const traits: GroupTraits = {};

    if (traitCount >= 1) {
      // Assign primary trait
      const primaryRarity = this.getRandomRarity(distribution, `${seed}-primary`);
      traits.primary = this.getRandomTrait(role, primaryRarity, `${seed}-primary`);
    }

    if (traitCount >= 2) {
      // Assign secondary trait
      const secondaryRarity = this.getRandomRarity(distribution, `${seed}-secondary`);
      traits.secondary = this.getRandomTrait(role, secondaryRarity, `${seed}-secondary`);
    }

    if (traitCount >= 3) {
      // Assign tertiary trait
      const tertiaryRarity = this.getRandomRarity(distribution, `${seed}-tertiary`);
      traits.tertiary = this.getRandomTrait(role, tertiaryRarity, `${seed}-tertiary`);
    }

    // Emit event
    this.emitEvent(GroupDomainEventType.TRAITS_ASSIGNED, {
      role,
      traits,
      seed,
      timestamp: Date.now()
    });

    return traits;
  }

  /**
   * Gets the trait rarity distribution for a tier
   * @param tier The tier of the creature
   * @returns The trait rarity distribution
   */
  public getTraitRarityDistribution(tier: Tier): TraitRarityDistribution {
    return TRAIT_RARITY_DISTRIBUTIONS[tier];
  }

  /**
   * Gets a random trait for a role and rarity
   * @param role The role of the particle group
   * @param rarity The rarity of the trait
   * @param seed The seed for random number generation
   * @returns The trait
   */
  public getRandomTrait(role: Role, rarity: Rarity, seed: string): GroupTrait {
    // In a real implementation, we would get traits from a repository
    // For now, we'll return a mock trait

    const traitId = `${role}-${rarity}-${seed}`;

    return {
      id: traitId,
      name: `${role} ${rarity} Trait`,
      description: `A ${rarity.toLowerCase()} trait for ${role.toLowerCase()} groups`,
      type: this.getRandomTraitType(seed),
      rarity,
      effect: `Increases ${role.toLowerCase()} effectiveness by ${this.getEffectValue(rarity)}%`,
      modifiers: {
        [role.toLowerCase()]: this.getEffectValue(rarity) / 100
      }
    };
  }

  /**
   * Gets a random rarity based on the trait rarity distribution
   * @param distribution The trait rarity distribution
   * @param seed The seed for random number generation
   * @returns The rarity
   */
  public getRandomRarity(distribution: TraitRarityDistribution, seed: string): Rarity {
    // Generate a random number
    const r = this.rngService.getRandomNumber(seed);

    // Calculate cumulative probabilities
    let cumulativeProbability = 0;

    for (const [rarity, probability] of Object.entries(distribution)) {
      cumulativeProbability += probability;

      if (r < cumulativeProbability) {
        return rarity as Rarity;
      }
    }

    // Default to COMMON if no match is found
    return Rarity.COMMON;
  }

  /**
   * Gets the number of traits based on the tier
   * @param tier The tier of the creature
   * @returns The number of traits
   */
  private getTraitCount(tier: Tier): number {
    switch (tier) {
      case Tier.TIER_1:
        return 1;
      case Tier.TIER_2:
        return 1;
      case Tier.TIER_3:
        return 2;
      case Tier.TIER_4:
        return 2;
      case Tier.TIER_5:
        return 3;
      case Tier.TIER_6:
        return 3;
      default:
        return 1;
    }
  }

  /**
   * Gets a random trait type
   * @param seed The seed for random number generation
   * @returns The trait type
   */
  private getRandomTraitType(seed: string): GroupTraitType {
    const types = Object.values(GroupTraitType);
    const index = Math.floor(this.rngService.getRandomNumber(seed) * types.length);
    return types[index];
  }

  /**
   * Gets the effect value based on the rarity
   * @param rarity The rarity of the trait
   * @returns The effect value
   */
  private getEffectValue(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 15;
      case Rarity.EPIC:
        return 20;
      case Rarity.LEGENDARY:
        return 25;
      case Rarity.MYTHIC:
        return 30;
      default:
        return 5;
    }
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
