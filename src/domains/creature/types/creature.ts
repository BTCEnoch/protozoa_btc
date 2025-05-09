/**
 * Creature Types for Bitcoin Protozoa
 *
 * This file contains the type definitions for creatures and related entities.
 * It builds on the core types and defines the structure of creatures.
 */

import { Role, AttributeType, RoleToAttributeType } from '../../../shared/types/core';
import { BlockData } from '../../bitcoin/types/bitcoin';

/**
 * Loading stage enum
 * Defines the different loading stages for creatures
 */
export enum LoadingStage {
  NONE = 'NONE',           // Not loaded at all
  BASIC = 'BASIC',         // Basic data loaded (position, type, etc.)
  DETAILED = 'DETAILED',   // Detailed attributes loaded (traits, particles, etc.)
  COMPLETE = 'COMPLETE'    // Fully loaded with all data
}

/**
 * Creature interface
 * Represents a complete creature made up of particle groups
 */
export interface Creature {
  id: string;
  blockNumber: number;
  blockData: BlockData;
  groups: CreatureGroup[];
  mutations: any[]; // Will be replaced with Mutation[] when we migrate that type
  createdAt: number; // Timestamp
  lastUpdatedAt: number; // Timestamp
  traits?: any; // Traits for the creature
  attributes?: Record<AttributeType, number>; // Calculated attributes

  // Progressive loading properties
  loadingStage?: LoadingStage; // Current loading stage
  loadingPriority?: number;    // Priority for loading (higher = load sooner)
  distanceFromCamera?: number; // Distance from camera for loading priority
}

/**
 * Creature Group interface
 * Represents a group of particles with the same role
 */
export interface CreatureGroup {
  id: string;
  role: Role;
  subclass: any; // Will be replaced with Subclass when we migrate that type
  particles: any[]; // Array of particles
  count?: number; // Number of particles (for convenience)
  attributeValue?: number; // Calculated attribute value
  baseAttributeValue?: number; // Base attribute value before multipliers
  attributeMultipliers?: {
    base: number;
    fromTraits: number;
    fromMutations: number;
  };
  attributes?: Record<AttributeType, number>; // Calculated attributes
  mutations: any[]; // Will be replaced with Mutation[] when we migrate that type
  traits?: any; // Traits for the group
}

/**
 * Evolution event interface
 * Represents a single evolution event in a creature's history
 */
export interface EvolutionEvent {
  id: string;
  timestamp: number; // Timestamp
  confirmations: number;
  groupId: string;
  role: Role;
  traitCategory: string;
  previousTraitId: string;
  newTraitId: string;
  description: string;
}

/**
 * Creature generation options interface
 */
export interface CreatureGenerationOptions {
  blockNumber: number;
  blockData: BlockData;
  particleDistribution?: Partial<Record<Role, number>>;
  forcedTraits?: Record<Role, any>;
}

/**
 * Creature statistics interface
 */
export interface CreatureStats {
  totalParticles: number;
  particlesByRole: Record<Role, number>;
  attributes: Record<AttributeType, number>;
  subclassesByRole: Record<Role, string>;
  averageTier: number;
  tierCounts: Record<number, number>;
  mutationCount: number;
  evolutionEvents: number;
  age: number; // In milliseconds since creation
}

/**
 * Calculate creature statistics
 * @param creature The creature to calculate statistics for
 * @returns The calculated statistics
 */
export function calculateCreatureStatistics(creature: Creature): CreatureStats {
  // Initialize statistics
  const statistics: CreatureStats = {
    totalParticles: 0,
    particlesByRole: {
      [Role.CORE]: 0,
      [Role.CONTROL]: 0,
      [Role.ATTACK]: 0,
      [Role.DEFENSE]: 0,
      [Role.MOVEMENT]: 0
    },
    attributes: {
      [AttributeType.VITALITY]: 0,
      [AttributeType.INTELLIGENCE]: 0,
      [AttributeType.STRENGTH]: 0,
      [AttributeType.RESILIENCE]: 0,
      [AttributeType.AGILITY]: 0
    },
    subclassesByRole: {
      [Role.CORE]: '',
      [Role.CONTROL]: '',
      [Role.ATTACK]: '',
      [Role.DEFENSE]: '',
      [Role.MOVEMENT]: ''
    },
    averageTier: 0,
    tierCounts: {},
    mutationCount: 0,
    evolutionEvents: 0, // We'll count these from mutations
    age: Date.now() - creature.createdAt
  };

  // Calculate statistics from groups
  for (const group of creature.groups) {
    // Count particles
    const particleCount = group.count || group.particles?.length || 0;
    statistics.totalParticles += particleCount;
    statistics.particlesByRole[group.role] += particleCount;

    // Add attribute value to the corresponding attribute type
    const attributeType = RoleToAttributeType[group.role];
    const attributeValue = group.attributeValue || group.baseAttributeValue || 0;
    statistics.attributes[attributeType] += attributeValue;

    // Record subclass
    statistics.subclassesByRole[group.role] = group.subclass?.name || 'None';

    // Count mutations
    statistics.mutationCount += group.mutations?.length || 0;

    // Track tier information
    const tier = group.subclass?.tier || 1;
    statistics.tierCounts[tier] = (statistics.tierCounts[tier] || 0) + 1;

    // Count evolution events from mutations
    statistics.evolutionEvents += group.mutations?.length || 0;
  }

  // Calculate average tier
  let totalTier = 0;
  let tierCount = 0;
  for (const tier in statistics.tierCounts) {
    totalTier += Number(tier) * statistics.tierCounts[Number(tier)];
    tierCount += statistics.tierCounts[Number(tier)];
  }
  statistics.averageTier = tierCount > 0 ? totalTier / tierCount : 0;

  return statistics;
}
