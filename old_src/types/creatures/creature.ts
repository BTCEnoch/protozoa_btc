/**
 * Creature Types for Bitcoin Protozoa
 *
 * This file contains the type definitions for creatures and related entities.
 * It builds on the core types and defines the structure of creatures.
 */

import { Role, AttributeType, Rarity, Tier, RoleToAttributeType } from '../../types/core';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { Mutation } from '../../types/mutations/mutation';
import { Subclass } from './subclass';

/**
 * Creature interface
 * Represents a complete creature made up of particle groups
 */
export interface Creature {
  id: string;
  blockNumber: number;
  blockData: BlockData;
  groups: CreatureGroup[];
  mutations: Mutation[];
  createdAt: number; // Timestamp
  lastUpdatedAt: number; // Timestamp
}

/**
 * Creature Group interface
 * Represents a group of particles with the same role
 */
export interface CreatureGroup {
  id: string;
  role: Role;
  subclass: Subclass;
  particles: number;
  attributeValue: number;
  mutations: Mutation[];
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
      [AttributeType.WIS]: 0,
      [AttributeType.INT]: 0,
      [AttributeType.STR]: 0,
      [AttributeType.DEF]: 0,
      [AttributeType.AGI]: 0
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
    statistics.totalParticles += group.particles;
    statistics.particlesByRole[group.role] += group.particles;

    // Add attribute value to the corresponding attribute type
    const attributeType = RoleToAttributeType[group.role];
    statistics.attributes[attributeType] += group.attributeValue;

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
