/**
 * Creature Service
 *
 * This service provides methods for managing creatures in the application.
 * It integrates with the creature generator, storage service, and event system.
 */

import { Creature, CreatureGenerationOptions } from '../types/creature';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { EventType } from '../../../shared/types/events';
import { Logging } from '../../../shared/utils';

// Import other services (to be implemented)
// import { getStorageService } from '../../shared/services/storage';
// import { getEventBus } from '../../../shared/lib/eventBus';

// Singleton instance
let instance: CreatureService | null = null;

/**
 * Creature Service class
 */
export class CreatureService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private blockNumber: number = 0;
  private logger = Logging.createLogger('CreatureService');

  /**
   * Initialize the creature service with block data
   * @param blockData The Bitcoin block data
   * @param blockNumber The Bitcoin block number
   */
  async initialize(blockData: BlockData, blockNumber: number = 0): Promise<void> {
    this.blockData = blockData;
    this.blockNumber = blockNumber;

    // Initialize the creature generator
    const creatureGenerator = await this.getCreatureGenerator();
    if (!creatureGenerator.isInitialized()) {
      await creatureGenerator.initialize();
    }

    this.initialized = true;
    this.logger.info('Creature service initialized');
  }

  /**
   * Create a new creature from the current block data
   * @param options Optional creature generation options
   * @returns A promise resolving to the newly created creature, or null if creation failed
   */
  async createCreature(options?: Partial<CreatureGenerationOptions>): Promise<Creature | null> {
    if (!this.initialized || !this.blockData) {
      this.logger.warn('CreatureService not initialized with block data');
      return null;
    }

    try {
      // Create generation options with current block data
      const blockNumber = options?.blockNumber || this.blockNumber;
      const blockData = options?.blockData || this.blockData;

      // Use the createCreature function from creatureFactory
      const creature = await this.createCreatureFromFactory(blockNumber, blockData);

      // Save the creature
      await this.saveCreature(creature);

      // Emit creature created event
      this.emitCreatureCreated(creature);

      return creature;
    } catch (error) {
      this.logger.error('Failed to create creature:', error);
      this.emitError('Failed to create creature', error);
      return null;
    }
  }

  /**
   * Get a creature by ID
   * @param creatureId The creature ID
   * @returns The creature or null if not found
   */
  async getCreature(creatureId: string): Promise<Creature | null> {
    return await this.loadCreature(creatureId);
  }

  /**
   * Get all creatures
   * @returns Array of all creatures
   */
  async getAllCreatures(): Promise<Creature[]> {
    return await this.loadAllCreatures();
  }

  /**
   * Delete a creature
   * @param creatureId The ID of the creature to delete
   * @returns True if deletion was successful
   */
  async deleteCreature(creatureId: string): Promise<boolean> {
    return await this.deleteCreatureFromStorage(creatureId);
  }

  /**
   * Update a creature
   * @param creature The creature to update
   * @returns True if update was successful
   */
  async updateCreature(creature: Creature): Promise<boolean> {
    // Validate the creature before updating
    const validationErrors = this.validateCreature(creature);
    if (validationErrors.length > 0) {
      this.logger.error('Creature validation failed:', validationErrors);
      this.emitError('Creature validation failed', validationErrors);
      return false;
    }

    // Update lastUpdatedAt timestamp
    creature.lastUpdatedAt = Date.now();

    // Save to storage
    const success = await this.saveCreature(creature);

    if (success) {
      // Emit creature updated event
      this.emitCreatureUpdated(creature);
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

  /**
   * Get the creature generator
   * @returns The creature generator
   */
  private async getCreatureGenerator(): Promise<any> {
    // This will be implemented when we migrate the creature generator
    // For now, return a mock implementation
    return {
      isInitialized: () => true,
      initialize: async () => {},
      generateCreature: async () => ({
        id: 'mock-creature',
        blockNumber: this.blockNumber,
        blockData: this.blockData,
        groups: [],
        mutations: [],
        createdAt: Date.now(),
        lastUpdatedAt: Date.now()
      })
    };
  }

  /**
   * Create a creature from the factory
   * @param blockNumber The block number
   * @param blockData The block data
   * @returns A new creature
   */
  private async createCreatureFromFactory(blockNumber: number, blockData: BlockData): Promise<Creature> {
    // This will be implemented when we migrate the creature factory
    // For now, return a mock implementation
    return {
      id: `creature-${blockNumber}-${Date.now()}`,
      blockNumber,
      blockData,
      groups: [],
      mutations: [],
      createdAt: Date.now(),
      lastUpdatedAt: Date.now()
    };
  }

  /**
   * Save a creature to storage
   * @param creature The creature to save
   * @returns True if the save was successful
   */
  private async saveCreature(creature: Creature): Promise<boolean> {
    // This will be implemented when we migrate the storage service
    // For now, return true
    this.logger.info(`Saving creature ${creature.id}`);
    return true;
  }

  /**
   * Load a creature from storage
   * @param creatureId The creature ID
   * @returns The creature or null if not found
   */
  private async loadCreature(creatureId: string): Promise<Creature | null> {
    // This will be implemented when we migrate the storage service
    // For now, return null
    this.logger.info(`Loading creature ${creatureId}`);
    return null;
  }

  /**
   * Load all creatures from storage
   * @returns Array of all creatures
   */
  private async loadAllCreatures(): Promise<Creature[]> {
    // This will be implemented when we migrate the storage service
    // For now, return an empty array
    this.logger.info('Loading all creatures');
    return [];
  }

  /**
   * Delete a creature from storage
   * @param creatureId The creature ID
   * @returns True if the deletion was successful
   */
  private async deleteCreatureFromStorage(creatureId: string): Promise<boolean> {
    // This will be implemented when we migrate the storage service
    // For now, return true
    this.logger.info(`Deleting creature ${creatureId}`);
    return true;
  }

  /**
   * Validate a creature
   * @param creature The creature to validate
   * @returns An array of validation errors, or empty array if valid
   */
  private validateCreature(creature: Creature): string[] {
    const errors: string[] = [];

    // Check required fields
    if (!creature.id) errors.push('Creature id is required');
    if (!creature.blockNumber) errors.push('Block number is required');
    if (!creature.blockData) errors.push('Block data is required');
    if (!creature.groups) errors.push('Creature groups are required');
    if (!Array.isArray(creature.groups)) errors.push('Creature groups must be an array');

    // Check timestamps
    if (!creature.createdAt) errors.push('Created timestamp is required');
    if (!creature.lastUpdatedAt) errors.push('Last updated timestamp is required');

    // Validate each group
    if (creature.groups && Array.isArray(creature.groups)) {
      creature.groups.forEach((group, index) => {
        if (!group.id) errors.push(`Group ${index} id is required`);
        if (!group.role) errors.push(`Group ${index} role is required`);
        if (!group.particles) errors.push(`Group ${index} particles are required`);
        if (!group.attributeValue) errors.push(`Group ${index} attribute value is required`);
      });
    }

    return errors;
  }

  /**
   * Emit a creature created event
   * @param creature The created creature
   */
  private emitCreatureCreated(creature: Creature): void {
    // This will be implemented when we migrate the event system
    // For now, just log
    this.logger.info(`Creature created: ${creature.id}`);
  }

  /**
   * Emit a creature updated event
   * @param creature The updated creature
   */
  private emitCreatureUpdated(creature: Creature): void {
    // This will be implemented when we migrate the event system
    // For now, just log
    this.logger.info(`Creature updated: ${creature.id}`);
  }

  /**
   * Emit an error event
   * @param message The error message
   * @param error The error object
   */
  private emitError(message: string, error: any): void {
    // This will be implemented when we migrate the event system
    // For now, just log
    this.logger.error(`Error: ${message}`, error);
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
