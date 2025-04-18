/**
 * Evolution Types for Bitcoin Protozoa
 *
 * This file contains the type definitions for the evolution system.
 * It builds on the core types and defines the structure of evolution events.
 */

import { Role, Tier } from '../../../shared/types/core';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { Mutation } from '../../traits/types/mutation';

/**
 * Evolution stage interface
 * Represents a stage in the evolution of a creature
 */
export interface EvolutionStage {
  id: string;
  name: string;
  description: string;
  confirmationThreshold: number;
  mutationProbability: number;
}

/**
 * Evolution options interface
 * Configuration options for the evolution process
 */
export interface EvolutionOptions {
  mutationIntensity: number;
  maxMutationsPerEvent: number;
  enableExoticMutations: boolean;
  enableSubclassMutations: boolean;
}

/**
 * Evolution strategy interface
 * Defines a strategy for determining how mutations are applied
 */
export interface EvolutionStrategy {
  id: string;
  name: string;
  description: string;
  calculateMutations(
    creature: any,
    role: Role,
    tier: Tier,
    confirmations: number,
    options: EvolutionOptions
  ): Mutation[];
}

/**
 * Evolution result interface
 * The result of an evolution calculation
 */
export interface EvolutionResult {
  creatureId: string;
  blockNumber: number;
  confirmations: number;
  mutations: Mutation[];
  timestamp: number;
  strategy: string;
  newTier?: Tier;
}

/**
 * Evolution entry interface
 * Represents an entry in the evolution history
 */
export interface EvolutionEntry {
  creatureId: string;
  blockNumber: number;
  confirmations: number;
  mutations: Mutation[];
  timestamp: number;
}

/**
 * Helper functions for evolution calculations
 */

/**
 * Calculate mutation probability based on confirmations
 * @param confirmations The number of confirmations
 * @returns The mutation probability (0-1)
 */
export function calculateMutationProbability(confirmations: number): number {
  if (confirmations >= 1000000) return 1.0;    // 100%
  if (confirmations >= 500000) return 0.75;    // 75%
  if (confirmations >= 250000) return 0.5;     // 50%
  if (confirmations >= 100000) return 0.25;    // 25%
  if (confirmations >= 50000) return 0.1;      // 10%
  if (confirmations >= 10000) return 0.05;     // 5%
  return 0.01;                                 // 1%
}

/**
 * Get the evolution stage based on confirmations
 * @param confirmations The number of confirmations
 * @returns The evolution stage name
 */
export function getEvolutionStage(confirmations: number): string {
  if (confirmations >= 1000000) return 'Transcendent';
  if (confirmations >= 500000) return 'Awakened';
  if (confirmations >= 250000) return 'Ascendant';
  if (confirmations >= 100000) return 'Evolved';
  if (confirmations >= 50000) return 'Mature';
  if (confirmations >= 10000) return 'Developing';
  return 'Nascent';
}
