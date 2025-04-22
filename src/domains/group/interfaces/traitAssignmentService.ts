/**
 * Trait Assignment Service Interface
 * 
 * This file defines the interface for the Trait Assignment Service.
 */
import { Role, Tier, Rarity } from '../../../shared/types/core';
import { GroupTrait, GroupTraits, TraitRarityDistribution } from '../models/traits';

/**
 * ITraitAssignmentService interface
 * Defines the methods for the Trait Assignment Service
 */
export interface ITraitAssignmentService {
  /**
   * Assigns traits to a particle group
   * @param role The role of the particle group
   * @param tier The tier of the creature
   * @param seed The seed for random number generation
   * @returns The traits for the particle group
   */
  assignTraits(role: Role, tier: Tier, seed: string): GroupTraits;

  /**
   * Gets the trait rarity distribution for a tier
   * @param tier The tier of the creature
   * @returns The trait rarity distribution
   */
  getTraitRarityDistribution(tier: Tier): TraitRarityDistribution;

  /**
   * Gets a random trait for a role and rarity
   * @param role The role of the particle group
   * @param rarity The rarity of the trait
   * @param seed The seed for random number generation
   * @returns The trait
   */
  getRandomTrait(role: Role, rarity: Rarity, seed: string): GroupTrait;

  /**
   * Gets a random rarity based on the trait rarity distribution
   * @param distribution The trait rarity distribution
   * @param seed The seed for random number generation
   * @returns The rarity
   */
  getRandomRarity(distribution: TraitRarityDistribution, seed: string): Rarity;
}
