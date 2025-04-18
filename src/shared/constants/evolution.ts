/**
 * Evolution Constants
 *
 * This file defines constants related to evolution.
 */

import { Rarity, MutationCategory } from '../types/core';

/**
 * Evolution milestones based on block confirmations
 */
export const EVOLUTION_MILESTONES = [
  10000,    // 10k confirmations
  50000,    // 50k confirmations
  100000,   // 100k confirmations
  250000,   // 250k confirmations
  500000,   // 500k confirmations
  1000000   // 1M confirmations
];

/**
 * Evolution stage names
 */
export const EVOLUTION_STAGES = [
  'Nascent',      // 0-9,999 confirmations
  'Developing',   // 10k-49,999 confirmations
  'Mature',       // 50k-99,999 confirmations
  'Evolved',      // 100k-249,999 confirmations
  'Ascendant',    // 250k-499,999 confirmations
  'Awakened',     // 500k-999,999 confirmations
  'Transcendent'  // 1M+ confirmations
];

/**
 * Mutation chances by milestone
 */
export const MUTATION_CHANCES = [
  0.01,   // 1% chance at 10k confirmations
  0.05,   // 5% chance at 50k confirmations
  0.10,   // 10% chance at 100k confirmations
  0.25,   // 25% chance at 250k confirmations
  0.50,   // 50% chance at 500k confirmations
  1.00    // 100% chance at 1M confirmations
];

/**
 * Available mutation rarities by milestone
 */
export const MUTATION_RARITIES: Record<number, Rarity[]> = {
  10000: [Rarity.COMMON],
  50000: [Rarity.COMMON, Rarity.UNCOMMON],
  100000: [Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE],
  250000: [Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC],
  500000: [Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY],
  1000000: [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC]
};

/**
 * Mutation category weights
 */
export const MUTATION_CATEGORY_WEIGHTS: Record<MutationCategory, number> = {
  [MutationCategory.ATTRIBUTE]: 40,
  [MutationCategory.BEHAVIOR]: 25,
  [MutationCategory.ABILITY]: 15,
  [MutationCategory.PARTICLE]: 5,
  [MutationCategory.SUBCLASS]: 5,
  [MutationCategory.SYNERGY]: 5,
  [MutationCategory.FORMATION]: 3,
  [MutationCategory.EXOTIC]: 2
};

/**
 * Maximum mutations per evolution event by milestone
 */
export const MAX_MUTATIONS_PER_EVENT: Record<number, number> = {
  10000: 1,
  50000: 1,
  100000: 2,
  250000: 2,
  500000: 3,
  1000000: 3
};

/**
 * Attribute bonus ranges by mutation rarity
 */
export const ATTRIBUTE_BONUS_RANGES: Record<Rarity, [number, number]> = {
  [Rarity.COMMON]: [0.05, 0.10],      // 5-10% bonus
  [Rarity.UNCOMMON]: [0.10, 0.15],    // 10-15% bonus
  [Rarity.RARE]: [0.15, 0.20],        // 15-20% bonus
  [Rarity.EPIC]: [0.20, 0.30],        // 20-30% bonus
  [Rarity.LEGENDARY]: [0.30, 0.50],   // 30-50% bonus
  [Rarity.MYTHIC]: [0.50, 1.00]       // 50-100% bonus
};

/**
 * Particle count change ranges by mutation rarity
 */
export const PARTICLE_COUNT_RANGES: Record<Rarity, [number, number]> = {
  [Rarity.COMMON]: [1, 5],          // 1-5 particles
  [Rarity.UNCOMMON]: [5, 10],       // 5-10 particles
  [Rarity.RARE]: [10, 15],          // 10-15 particles
  [Rarity.EPIC]: [15, 25],          // 15-25 particles
  [Rarity.LEGENDARY]: [25, 40],     // 25-40 particles
  [Rarity.MYTHIC]: [40, 60]         // 40-60 particles
};

/**
 * Ability cooldown reduction percentages by mutation rarity
 */
export const ABILITY_COOLDOWN_REDUCTIONS: Record<Rarity, number> = {
  [Rarity.COMMON]: 0.05,      // 5% reduction
  [Rarity.UNCOMMON]: 0.10,    // 10% reduction
  [Rarity.RARE]: 0.15,        // 15% reduction
  [Rarity.EPIC]: 0.20,        // 20% reduction
  [Rarity.LEGENDARY]: 0.30,   // 30% reduction
  [Rarity.MYTHIC]: 0.50       // 50% reduction
};

/**
 * Subclass tier change chances by mutation rarity
 */
export const SUBCLASS_TIER_CHANGE_CHANCES: Record<Rarity, number> = {
  [Rarity.COMMON]: 0.01,      // 1% chance
  [Rarity.UNCOMMON]: 0.05,    // 5% chance
  [Rarity.RARE]: 0.10,        // 10% chance
  [Rarity.EPIC]: 0.20,        // 20% chance
  [Rarity.LEGENDARY]: 0.40,   // 40% chance
  [Rarity.MYTHIC]: 0.80       // 80% chance
};

/**
 * Evolution visual effects by stage
 */
export const EVOLUTION_VISUAL_EFFECTS: Record<string, string> = {
  'Nascent': 'subtle_glow',
  'Developing': 'pulse_wave',
  'Mature': 'energy_field',
  'Evolved': 'particle_burst',
  'Ascendant': 'aura_expansion',
  'Awakened': 'dimensional_shift',
  'Transcendent': 'cosmic_resonance'
};
