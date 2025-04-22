/**
 * Distribution Constants
 *
 * This file defines constants for particle distribution in the Group Domain.
 */
import { Role, Tier, Rarity } from '../../../shared/types/core';
import { TraitRarityDistribution } from '../models/traits';

/**
 * DIRICHLET_ALPHA
 * Alpha parameters for the Dirichlet distribution
 * Higher values lead to more uniform distributions
 * Lower values lead to more skewed distributions
 */
export const DIRICHLET_ALPHA = {
  [Role.CORE]: 1.0,
  [Role.CONTROL]: 1.0,
  [Role.MOVEMENT]: 1.0,
  [Role.DEFENSE]: 1.0,
  [Role.ATTACK]: 1.0
};

/**
 * BASE_PARTICLES_PER_GROUP
 * Base number of particles per group (guaranteed minimum)
 */
export const BASE_PARTICLES_PER_GROUP = 40;

/**
 * MIN_PARTICLES_PER_GROUP
 * Minimum number of particles per group (including base)
 */
export const MIN_PARTICLES_PER_GROUP = 60;

/**
 * ATTRIBUTE_RANGE
 * Range of attribute values
 * Note: These are now directly tied to particle counts
 * The maximum base attribute (200) is just below the Tier 3 threshold (201),
 * requiring mutations to reach higher tiers
 */
export const ATTRIBUTE_RANGE = {
  MIN: 60,
  MAX: 200
};

/**
 * PARTICLE_RANGE
 * Range of particle counts
 */
export const PARTICLE_RANGE = {
  MIN: 60,
  MAX: 200
};

/**
 * PARTICLE_RARITY_RANGES
 * Particle count ranges for each rarity level
 */
export const PARTICLE_RARITY_RANGES = {
  COMMON: [60, 116],     // 40% chance
  UNCOMMON: [117, 158],  // 30% chance
  RARE: [159, 186],      // 20% chance
  EPIC: [187, 197],      // 8% chance
  LEGENDARY: [198, 199], // 2% chance
  MYTHIC: [200, 200]     // 1% chance
};

/**
 * TOTAL_PARTICLES
 * Total number of particles per creature
 */
export const TOTAL_PARTICLES = 500;

/**
 * DISTRIBUTABLE_PARTICLES
 * Number of particles to distribute after base allocation
 */
export const DISTRIBUTABLE_PARTICLES = TOTAL_PARTICLES - (BASE_PARTICLES_PER_GROUP * 5);

/**
 * TIER_PARTICLE_RANGES
 * Particle count ranges for each tier
 * Note: These are the thresholds for class tiers, not the same as particle rarity
 */
export const TIER_PARTICLE_RANGES: Record<Tier, [number, number]> = {
  [Tier.TIER_1]: [60, 116],    // Common
  [Tier.TIER_2]: [117, 200],   // Uncommon
  [Tier.TIER_3]: [201, 250],   // Rare (requires mutations)
  [Tier.TIER_4]: [251, 300],   // Epic (requires mutations)
  [Tier.TIER_5]: [301, 350],   // Legendary (requires mutations)
  [Tier.TIER_6]: [351, 400]    // Mythic (requires mutations)
};

/**
 * TRAIT_RARITY_DISTRIBUTIONS
 * Trait rarity distributions for each tier
 */
export const TRAIT_RARITY_DISTRIBUTIONS: Record<Tier, TraitRarityDistribution> = {
  [Tier.TIER_1]: {
    [Rarity.COMMON]: 0.7,
    [Rarity.UNCOMMON]: 0.25,
    [Rarity.RARE]: 0.05,
    [Rarity.EPIC]: 0,
    [Rarity.LEGENDARY]: 0,
    [Rarity.MYTHIC]: 0
  },
  [Tier.TIER_2]: {
    [Rarity.COMMON]: 0.5,
    [Rarity.UNCOMMON]: 0.35,
    [Rarity.RARE]: 0.15,
    [Rarity.EPIC]: 0,
    [Rarity.LEGENDARY]: 0,
    [Rarity.MYTHIC]: 0
  },
  [Tier.TIER_3]: {
    [Rarity.COMMON]: 0.3,
    [Rarity.UNCOMMON]: 0.4,
    [Rarity.RARE]: 0.25,
    [Rarity.EPIC]: 0.05,
    [Rarity.LEGENDARY]: 0,
    [Rarity.MYTHIC]: 0
  },
  [Tier.TIER_4]: {
    [Rarity.COMMON]: 0.2,
    [Rarity.UNCOMMON]: 0.3,
    [Rarity.RARE]: 0.35,
    [Rarity.EPIC]: 0.15,
    [Rarity.LEGENDARY]: 0,
    [Rarity.MYTHIC]: 0
  },
  [Tier.TIER_5]: {
    [Rarity.COMMON]: 0.1,
    [Rarity.UNCOMMON]: 0.2,
    [Rarity.RARE]: 0.3,
    [Rarity.EPIC]: 0.3,
    [Rarity.LEGENDARY]: 0.1,
    [Rarity.MYTHIC]: 0
  },
  [Tier.TIER_6]: {
    [Rarity.COMMON]: 0,
    [Rarity.UNCOMMON]: 0.1,
    [Rarity.RARE]: 0.2,
    [Rarity.EPIC]: 0.4,
    [Rarity.LEGENDARY]: 0.25,
    [Rarity.MYTHIC]: 0.05
  }
};
