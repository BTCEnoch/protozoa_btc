/**
 * Mutation Service
 *
 * Service for managing mutations.
 */

import { BlockData } from '../../bitcoin/types/bitcoin';
import { Creature, CreatureGroup } from '../../creature/types/creature';
import { Mutation, MutationCategory } from '../types/mutation';
import { Role, Rarity } from '../../../shared/types/core';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: MutationService | null = null;

/**
 * Mutation Service class
 */
export class MutationService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private logger = Logging.createLogger('MutationService');

  /**
   * Initialize the mutation service with block data
   * @param blockData The Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.initialized = true;
    this.logger.info('Mutation service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Generate a mutation for a creature group
   * @param group The creature group to generate a mutation for
   * @param category The mutation category
   * @returns A mutation or null if generation failed
   */
  generateMutation(group: CreatureGroup, category: MutationCategory): Mutation | null {
    if (!this.initialized || !this.blockData) {
      this.logger.warn('Mutation service not initialized');
      return null;
    }

    try {
      // This is a placeholder implementation
      // In a real implementation, this would generate a mutation based on the category
      this.logger.debug(`Generating ${category} mutation for ${group.role} group`);

      return {
        id: `mutation-${Date.now()}`,
        name: `${category} Mutation`,
        description: `A mutation that affects ${category.toLowerCase()}`,
        category,
        rarity: Rarity.COMMON,
        confirmationThreshold: 10000,
        appliedAt: Date.now(),
        compatibleRoles: [group.role],
        visualEffect: `${category.toLowerCase()}_effect`,
        // Add the required applyEffect function
        applyEffect: (targetGroup: CreatureGroup) => {
          // Simple implementation that just returns the group unchanged
          return targetGroup;
        }
      };
    } catch (error) {
      this.logger.error(`Error generating mutation:`, error);
      return null;
    }
  }

  /**
   * Apply a mutation to a creature group
   * @param group The creature group to apply the mutation to
   * @param mutation The mutation to apply
   * @returns The updated creature group
   */
  applyMutation(group: CreatureGroup, mutation: Mutation): CreatureGroup {
    if (!this.initialized) {
      this.logger.warn('Mutation service not initialized');
      return group;
    }

    try {
      // Clone the group to avoid modifying the original
      const updatedGroup = { ...group };

      // Add the mutation to the group's mutations
      updatedGroup.mutations = [...(updatedGroup.mutations || []), mutation];

      // This is a placeholder implementation
      // In a real implementation, this would apply the mutation's effects
      this.logger.debug(`Applying ${mutation.category} mutation to ${group.role} group`);

      // Apply a simple attribute boost (10%)
      updatedGroup.attributeValue = Math.floor(updatedGroup.attributeValue * 1.1);

      return updatedGroup;
    } catch (error) {
      this.logger.error(`Error applying mutation:`, error);
      return group;
    }
  }

  /**
   * Apply mutations to a creature based on confirmations
   * @param creature The creature to apply mutations to
   * @param confirmations The number of confirmations
   * @returns The updated creature
   */
  applyMutationsBasedOnConfirmations(creature: Creature, confirmations: number): Creature {
    if (!this.initialized || !this.blockData) {
      this.logger.warn('Mutation service not initialized');
      return creature;
    }

    try {
      // Clone the creature to avoid modifying the original
      const updatedCreature = { ...creature };

      // Calculate mutation probability based on confirmations
      const mutationProbability = this.calculateMutationProbability(confirmations);

      // Determine if a mutation should occur
      if (Math.random() < mutationProbability) {
        // Select a random group to mutate
        if (updatedCreature.groups && updatedCreature.groups.length > 0) {
          const randomIndex = Math.floor(Math.random() * updatedCreature.groups.length);
          const group = updatedCreature.groups[randomIndex];

          // Select a random mutation category
          const categories = Object.values(MutationCategory);
          const randomCategory = categories[Math.floor(Math.random() * categories.length)];

          // Generate and apply the mutation
          const mutation = this.generateMutation(group, randomCategory);

          if (mutation) {
            const updatedGroup = this.applyMutation(group, mutation);
            updatedCreature.groups[randomIndex] = updatedGroup;

            // Add the mutation to the creature's mutations
            updatedCreature.mutations = [...(updatedCreature.mutations || []), mutation];

            this.logger.info(`Applied ${randomCategory} mutation to creature ${creature.id}`);
          }
        }
      }

      return updatedCreature;
    } catch (error) {
      this.logger.error(`Error applying mutations based on confirmations:`, error);
      return creature;
    }
  }

  /**
   * Calculate mutation probability based on confirmations
   * @param confirmations The number of confirmations
   * @returns The mutation probability (0-1)
   */
  private calculateMutationProbability(confirmations: number): number {
    if (confirmations >= 1000000) return 1.0;    // 100%
    if (confirmations >= 500000) return 0.75;    // 75%
    if (confirmations >= 250000) return 0.5;     // 50%
    if (confirmations >= 100000) return 0.25;    // 25%
    if (confirmations >= 50000) return 0.1;      // 10%
    if (confirmations >= 10000) return 0.05;     // 5%
    return 0.01;                                 // 1%
  }

  /**
   * Reset the service
   */
  reset(): void {
    this.blockData = null;
    this.initialized = false;
    this.logger.info('Mutation service reset');
  }
}

/**
 * Get the mutation service instance
 * @returns The mutation service instance
 */
export function getMutationService(): MutationService {
  if (!instance) {
    instance = new MutationService();
  }
  return instance;
}
