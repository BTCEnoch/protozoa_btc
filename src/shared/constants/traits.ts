/**
 * Trait Constants
 *
 * This file defines constants related to traits.
 */

import { Rarity, Role } from '../types/core';

/**
 * Default rarity weights for trait selection
 */
export const DEFAULT_RARITY_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 50,     // 50% chance
  [Rarity.UNCOMMON]: 30,   // 30% chance
  [Rarity.RARE]: 15,       // 15% chance
  [Rarity.EPIC]: 4,        // 4% chance
  [Rarity.LEGENDARY]: 0.9, // 0.9% chance
  [Rarity.MYTHIC]: 0.1     // 0.1% chance
};

/**
 * Default particle distribution by role
 */
export const DEFAULT_PARTICLE_DISTRIBUTION: Record<Role, number> = {
  [Role.CORE]: 50,     // 10% - Central energy and stability
  [Role.CONTROL]: 100, // 20% - Coordination and direction
  [Role.ATTACK]: 125,  // 25% - Offensive capabilities
  [Role.DEFENSE]: 125, // 25% - Protection and resilience
  [Role.MOVEMENT]: 100 // 20% - Mobility and speed
};

/**
 * Default attribute multipliers by rarity
 */
export const DEFAULT_ATTRIBUTE_MULTIPLIERS: Record<Rarity, number> = {
  [Rarity.COMMON]: 1.0,
  [Rarity.UNCOMMON]: 1.2,
  [Rarity.RARE]: 1.5,
  [Rarity.EPIC]: 2.0,
  [Rarity.LEGENDARY]: 3.0,
  [Rarity.MYTHIC]: 5.0
};

/**
 * Default trait counts by rarity
 */
export const DEFAULT_TRAIT_COUNTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 10,
  [Rarity.UNCOMMON]: 8,
  [Rarity.RARE]: 5,
  [Rarity.EPIC]: 3,
  [Rarity.LEGENDARY]: 2,
  [Rarity.MYTHIC]: 1
};

/**
 * Default ability cooldowns by rarity (in seconds)
 */
export const DEFAULT_ABILITY_COOLDOWNS: Record<Rarity, number> = {
  [Rarity.COMMON]: 30,
  [Rarity.UNCOMMON]: 25,
  [Rarity.RARE]: 20,
  [Rarity.EPIC]: 15,
  [Rarity.LEGENDARY]: 10,
  [Rarity.MYTHIC]: 5
};

/**
 * Default ability durations by rarity (in seconds)
 */
export const DEFAULT_ABILITY_DURATIONS: Record<Rarity, number> = {
  [Rarity.COMMON]: 5,
  [Rarity.UNCOMMON]: 7,
  [Rarity.RARE]: 10,
  [Rarity.EPIC]: 12,
  [Rarity.LEGENDARY]: 15,
  [Rarity.MYTHIC]: 20
};

/**
 * Default formation ranges by rarity
 */
export const DEFAULT_FORMATION_RANGES: Record<Rarity, number> = {
  [Rarity.COMMON]: 5,
  [Rarity.UNCOMMON]: 7,
  [Rarity.RARE]: 10,
  [Rarity.EPIC]: 12,
  [Rarity.LEGENDARY]: 15,
  [Rarity.MYTHIC]: 20
};

/**
 * Default behavior strengths by rarity
 */
export const DEFAULT_BEHAVIOR_STRENGTHS: Record<Rarity, number> = {
  [Rarity.COMMON]: 1.0,
  [Rarity.UNCOMMON]: 1.5,
  [Rarity.RARE]: 2.0,
  [Rarity.EPIC]: 2.5,
  [Rarity.LEGENDARY]: 3.0,
  [Rarity.MYTHIC]: 4.0
};

/**
 * Default visual effect intensities by rarity
 */
export const DEFAULT_VISUAL_INTENSITIES: Record<Rarity, number> = {
  [Rarity.COMMON]: 0.5,
  [Rarity.UNCOMMON]: 0.7,
  [Rarity.RARE]: 1.0,
  [Rarity.EPIC]: 1.2,
  [Rarity.LEGENDARY]: 1.5,
  [Rarity.MYTHIC]: 2.0
};

/**
 * Default trait mutation chances by rarity
 */
export const DEFAULT_TRAIT_MUTATION_CHANCES: Record<Rarity, number> = {
  [Rarity.COMMON]: 0.05,
  [Rarity.UNCOMMON]: 0.04,
  [Rarity.RARE]: 0.03,
  [Rarity.EPIC]: 0.02,
  [Rarity.LEGENDARY]: 0.01,
  [Rarity.MYTHIC]: 0.005
};

/**
 * Default role colors
 */
export const DEFAULT_ROLE_COLORS: Record<Role, string> = {
  [Role.CORE]: '#FFD700',      // Gold
  [Role.CONTROL]: '#4B0082',   // Indigo
  [Role.ATTACK]: '#FF4500',    // Red-Orange
  [Role.DEFENSE]: '#1E90FF',   // Dodger Blue
  [Role.MOVEMENT]: '#32CD32'   // Lime Green
};

/**
 * Default rarity colors
 */
export const DEFAULT_RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: '#AAAAAA',     // Gray
  [Rarity.UNCOMMON]: '#55AA55',   // Green
  [Rarity.RARE]: '#5555FF',       // Blue
  [Rarity.EPIC]: '#AA55AA',       // Purple
  [Rarity.LEGENDARY]: '#FFAA00',  // Orange
  [Rarity.MYTHIC]: '#FF5555'      // Red
};
