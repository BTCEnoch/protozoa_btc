/**
 * Mutation Types for Bitcoin Protozoa
 *
 * This file contains the type definitions for the mutation system.
 * It builds on the core types and defines the structure of mutations.
 */

import { Role, Rarity, Tier, AttributeType } from './core';
import { Vector3 } from './common';
import { CreatureGroup } from './creature';

/**
 * Mutation interface
 * Represents a mutation that can be applied to a creature group
 */
export interface Mutation {
  id: string;
  name: string;
  description: string;
  category: MutationCategory;
  rarity: Rarity;
  confirmationThreshold: number;
  appliedAt: number; // Timestamp when the mutation was applied

  // Attribute bonuses (percentage increases)
  attributeBonuses?: Partial<Record<AttributeType, number>>;

  // Effect handlers
  applyEffect: (group: CreatureGroup) => CreatureGroup;
  visualEffect?: string; // Visual effect ID or description

  // Metadata
  compatibleRoles: Role[];
  incompatibleWith?: string[]; // IDs of mutations this can't combine with
  requiresMutations?: string[]; // IDs of mutations required first
}

/**
 * Mutation category enum
 * Defines the categories of mutations
 */
export enum MutationCategory {
  ATTRIBUTE = 'ATTRIBUTE',
  PARTICLE = 'PARTICLE',
  SUBCLASS = 'SUBCLASS',
  ABILITY = 'ABILITY',
  SYNERGY = 'SYNERGY',
  FORMATION = 'FORMATION',
  BEHAVIOR = 'BEHAVIOR',
  EXOTIC = 'EXOTIC'
}

/**
 * Mutation application result interface
 * Represents the result of applying a mutation to a creature group
 */
export interface MutationApplicationResult {
  success: boolean;
  message: string;
  updatedGroup?: CreatureGroup;
  visualEffect?: string; // Visual effect to display
  soundEffect?: string; // Sound effect to play
}

/**
 * Mutation distribution by rarity
 * Defines the number of mutations for each rarity tier
 */
export const MUTATION_DISTRIBUTION: Record<Rarity, number> = {
  [Rarity.COMMON]: 80,      // 80 common mutations
  [Rarity.UNCOMMON]: 60,    // 60 uncommon mutations
  [Rarity.RARE]: 40,        // 40 rare mutations
  [Rarity.EPIC]: 16,        // 16 epic mutations
  [Rarity.LEGENDARY]: 3,    // 3 legendary mutations
  [Rarity.MYTHIC]: 1        // 1 mythic mutation
};

/**
 * Attribute mutation interface
 * Represents a mutation that affects attributes
 */
export interface AttributeMutation extends Mutation {
  category: MutationCategory.ATTRIBUTE;
  attributeBonuses: Partial<Record<AttributeType, number>>;
  multiplier?: number; // Multiplier for the attribute value
  flat?: number; // Flat bonus to the attribute value
}

/**
 * Particle mutation interface
 * Represents a mutation that affects particle count or properties
 */
export interface ParticleMutation extends Mutation {
  category: MutationCategory.PARTICLE;
  particleCountChange?: number; // Change in particle count (positive or negative)
  particlePropertyChanges?: Record<string, any>; // Changes to particle properties
  particleDistribution?: Partial<Record<Role, number>>; // Changes to particle distribution
}

/**
 * Subclass mutation interface
 * Represents a mutation that affects subclass
 */
export interface SubclassMutation extends Mutation {
  category: MutationCategory.SUBCLASS;
  newSubclassId?: string; // ID of the new subclass
  hybridSubclassIds?: string[]; // IDs of subclasses to hybridize
  tierChange?: number; // Change in tier (positive or negative)
  specialization?: string; // Specialization within the subclass
}

/**
 * Ability mutation interface
 * Represents a mutation that affects abilities
 */
export interface AbilityMutation extends Mutation {
  category: MutationCategory.ABILITY;
  newAbilityId?: string; // ID of the new ability
  abilityModifications?: Record<string, any>; // Modifications to existing abilities
  abilityType?: string; // Type of ability affected
  cooldownReduction?: number; // Reduction in ability cooldown
  damageIncrease?: number; // Increase in ability damage
  rangeIncrease?: number; // Increase in ability range
}

/**
 * Synergy mutation interface
 * Represents a mutation that affects synergies between groups
 */
export interface SynergyMutation extends Mutation {
  category: MutationCategory.SYNERGY;
  targetRoles: Role[]; // Roles that this synergy affects
  synergyEffect: string; // Description of the synergy effect
  synergyBonus?: number; // Bonus provided by the synergy
  synergyType?: string; // Type of synergy (e.g., 'damage', 'healing', 'defense')
  synergyCondition?: string; // Condition for the synergy to activate
}

/**
 * Exotic mutation interface
 * Represents a rare and powerful mutation with unique effects
 */
export interface ExoticMutation extends Mutation {
  category: MutationCategory.EXOTIC;
  uniqueEffectId: string; // ID of the unique effect
  globalEffect?: boolean; // Whether the effect applies to the entire creature
  transformationEffect?: string; // Description of the transformation effect
  specialAbility?: string; // Special ability granted by the mutation
  evolutionPath?: string; // Future evolution path unlocked by this mutation
}

// Visual mutations have been removed as visuals will be designed and assigned to abilities and classes

/**
 * Formation mutation interface
 * Represents a mutation that affects formation traits
 */
export interface FormationMutation extends Mutation {
  category: MutationCategory.FORMATION;
  newFormationId?: string; // ID of the new formation trait
  densityChange?: number; // Change in formation density
  patternChange?: string; // New formation pattern
  rangeChange?: number; // Change in formation range
  stabilityChange?: number; // Change in formation stability
}

/**
 * Behavior mutation interface
 * Represents a mutation that affects behavior traits
 */
export interface BehaviorMutation extends Mutation {
  category: MutationCategory.BEHAVIOR;
  newBehaviorId?: string; // ID of the new behavior trait
  speedChange?: number; // Change in movement speed
  aggressionChange?: number; // Change in aggression level
  cohesionChange?: number; // Change in group cohesion
  patternChange?: string; // New behavior pattern
}

/**
 * Mutation bank interface
 * A collection of mutations organized by category and rarity
 */
export interface MutationBank {
  [MutationCategory.ATTRIBUTE]: Record<Rarity, AttributeMutation[]>;
  [MutationCategory.PARTICLE]: Record<Rarity, ParticleMutation[]>;
  [MutationCategory.SUBCLASS]: Record<Rarity, SubclassMutation[]>;
  [MutationCategory.ABILITY]: Record<Rarity, AbilityMutation[]>;
  [MutationCategory.SYNERGY]: Record<Rarity, SynergyMutation[]>;
  [MutationCategory.FORMATION]: Record<Rarity, FormationMutation[]>;
  [MutationCategory.BEHAVIOR]: Record<Rarity, BehaviorMutation[]>;
  [MutationCategory.EXOTIC]: Record<Rarity, ExoticMutation[]>;
}

/**
 * Mutation chance by confirmation milestone
 * Defines the chance of mutation at each confirmation milestone
 */
export const MUTATION_CHANCE_BY_MILESTONE: Record<number, number> = {
  10000: 0.01,   // 1% chance at 10k confirmations
  50000: 0.05,   // 5% chance at 50k confirmations
  100000: 0.1,   // 10% chance at 100k confirmations
  250000: 0.25,  // 25% chance at 250k confirmations
  500000: 0.5,   // 50% chance at 500k confirmations
  1000000: 1.0   // 100% chance at 1M confirmations
};

/**
 * Mutation rarity by confirmation milestone
 * Defines the available rarities at each confirmation milestone
 */
export const MUTATION_RARITY_BY_MILESTONE: Record<number, Rarity[]> = {
  10000: [Rarity.COMMON],
  50000: [Rarity.COMMON, Rarity.UNCOMMON],
  100000: [Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE],
  250000: [Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC],
  500000: [Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY],
  1000000: [Rarity.EPIC, Rarity.LEGENDARY, Rarity.MYTHIC]
};

/**
 * Get the highest confirmation milestone reached
 * @param confirmations The number of confirmations
 * @returns The highest milestone reached, or 0 if no milestone reached
 */
export function getHighestMilestone(confirmations: number): number {
  const milestones = Object.keys(MUTATION_CHANCE_BY_MILESTONE)
    .map(Number)
    .sort((a, b) => b - a);

  for (const milestone of milestones) {
    if (confirmations >= milestone) {
      return milestone;
    }
  }

  return 0;
}

/**
 * Get the mutation chance for a given confirmation count
 * @param confirmations The number of confirmations
 * @returns The mutation chance (0-1)
 */
export function getMutationChance(confirmations: number): number {
  const milestone = getHighestMilestone(confirmations);
  return milestone ? MUTATION_CHANCE_BY_MILESTONE[milestone] : 0;
}

/**
 * Get the available mutation rarities for a given confirmation count
 * @param confirmations The number of confirmations
 * @returns An array of available rarities
 */
export function getAvailableRarities(confirmations: number): Rarity[] {
  const milestone = getHighestMilestone(confirmations);
  return milestone ? MUTATION_RARITY_BY_MILESTONE[milestone] : [];
}

/**
 * Create a mutation ID
 * @param category The mutation category
 * @param role The role
 * @param rarity The rarity
 * @param index The index
 * @returns A unique mutation ID
 */
export function createMutationId(category: MutationCategory, role: Role, rarity: Rarity, index: number): string {
  return `${category.toLowerCase()}_${role.toLowerCase()}_${rarity.toLowerCase()}_${index}`;
}
