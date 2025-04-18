/**
 * Creature Service
 *
 * This service provides methods for managing creatures in the application.
 * It integrates with the creature generator, storage service, and event service.
 */

import { Creature, CreatureGenerationOptions } from '../../types/creatures/creature';
import { getCreatureGenerator } from './creatureGenerator';
import { getStorageService } from '../storage/storageService';
import { getEventService } from '../events/eventService';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { EventType } from '../../types/events/events';
import { createCreature, validateCreature } from './creatureFactory';

// Singleton instance
let instance: CreatureService | null = null;

/**
 * Creature Service class
 */
class CreatureService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private blockNumber: number = 0;

  /**
   * Initialize the creature service with block data
   * @param blockData The Bitcoin block data
   * @param blockNumber The Bitcoin block number
   */
  async initialize(blockData: BlockData, blockNumber: number = 0): Promise<void> {
    this.blockData = blockData;
    this.blockNumber = blockNumber;

    // Initialize the creature generator
    const creatureGenerator = getCreatureGenerator();
    if (!creatureGenerator.isInitialized()) {
      await creatureGenerator.initialize();
    }

    this.initialized = true;
  }

  /**
   * Create a new creature from the current block data
   * @param options Optional creature generation options
   * @returns A promise resolving to the newly created creature, or null if creation failed
   */
  async createCreature(options?: Partial<CreatureGenerationOptions>): Promise<Creature | null> {
    if (!this.initialized || !this.blockData) {
      console.warn('CreatureService not initialized with block data');
      return null;
    }

    try {
      // Create generation options with current block data
      const blockNumber = options?.blockNumber || this.blockNumber;
      const blockData = options?.blockData || this.blockData;

      // Use the createCreature function from creatureFactory
      const creature = await createCreature(blockNumber, blockData);

      // Save the creature
      await getStorageService().saveCreature(creature);

      // Emit creature created event
      getEventService().emitCreatureCreated(creature);

      return creature;
    } catch (error) {
      console.error('Failed to create creature:', error);
      getEventService().emitError('CreatureService', 'Failed to create creature', error);
      return null;
    }
  }

  /**
   * Get a creature by ID
   * @param creatureId The creature ID
   * @returns The creature or null if not found
   */
  async getCreature(creatureId: string): Promise<Creature | null> {
    return await getStorageService().loadCreature(creatureId);
  }

  /**
   * Get all creatures
   * @returns Array of all creatures
   */
  async getAllCreatures(): Promise<Creature[]> {
    return await getStorageService().loadAllCreatures();
  }

  /**
   * Delete a creature
   * @param creatureId The ID of the creature to delete
   * @returns True if deletion was successful
   */
  async deleteCreature(creatureId: string): Promise<boolean> {
    return await getStorageService().deleteCreature(creatureId);
  }

  /**
   * Update a creature
   * @param creature The creature to update
   * @returns True if update was successful
   */
  async updateCreature(creature: Creature): Promise<boolean> {
    // Validate the creature before updating
    const validationErrors = validateCreature(creature);
    if (validationErrors.length > 0) {
      console.error('Creature validation failed:', validationErrors);
      getEventService().emitError('CreatureService', 'Creature validation failed', validationErrors);
      return false;
    }

    // Update lastUpdatedAt timestamp
    creature.lastUpdatedAt = Date.now();

    // Save to storage
    const success = await getStorageService().saveCreature(creature);

    if (success) {
      // Emit creature updated event
      getEventService().emit({
        type: EventType.CREATURE_UPDATED,
        timestamp: Date.now(),
        source: 'CreatureService',
        data: {
          creatureId: creature.id,
          blockNumber: creature.blockNumber
        }
      });
    }

    return success;
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Get the creature service instance
 * @returns The creature service singleton instance
 */
export function getCreatureService(): CreatureService {
  if (!instance) {
    instance = new CreatureService();
  }
  return instance;
}
