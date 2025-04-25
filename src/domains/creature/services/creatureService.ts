/**
 * Creature Service
 *
 * This service provides methods for managing creatures in the application.
 * It integrates with the creature generator, storage service, and event system.
 * It also supports progressive loading of creatures for better performance.
 */

import * as THREE from 'three';
import { Creature, CreatureGenerationOptions, LoadingStage } from '../types/creature';
import { BlockData } from '../../bitcoin/types/bitcoin';
// import { EventType } from '../../../shared/types/events';
import { Logging } from '../../../shared/utils';
import { getProgressiveLoader, ProgressiveLoader } from '../utils/progressiveLoader';

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

  // Progressive loading properties
  private progressiveLoader: ProgressiveLoader | null = null;
  private progressiveLoadingEnabled: boolean = true;

  /**
   * Initialize the creature service with block data
   * @param blockData The Bitcoin block data
   * @param blockNumber The Bitcoin block number
   */
  async initialize(blockData: BlockData, blockNumber: number = 0, camera?: THREE.Camera): Promise<void> {
    this.blockData = blockData;
    this.blockNumber = blockNumber;

    // Initialize the creature generator
    const creatureGenerator = await this.getCreatureGenerator();
    if (!creatureGenerator.isInitialized()) {
      await creatureGenerator.initialize();
    }

    // Initialize progressive loader
    this.progressiveLoader = getProgressiveLoader();
    if (camera) {
      this.setCamera(camera);
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
   * Reset the creature service
   * Clears all creatures and resets the service to its initial state
   */
  reset(): void {
    if (!this.initialized) {
      this.logger.warn('Creature service not initialized');
      return;
    }

    // Reset block data
    this.blockData = null;
    this.blockNumber = 0;

    // Reset progressive loader
    if (this.progressiveLoader) {
      this.progressiveLoader.clearQueue();
    }

    // Keep initialized state true since we're just resetting, not disposing
    this.logger.info('Creature service reset');
  }

  /**
   * Set camera for distance calculations
   * @param camera Camera to use for distance calculations
   */
  setCamera(camera: THREE.Camera): void {
    if (this.progressiveLoader) {
      this.progressiveLoader.setCamera(camera);
    }
    this.logger.debug('Camera set for progressive loading');
  }

  /**
   * Enable or disable progressive loading
   * @param enabled Whether progressive loading is enabled
   */
  setProgressiveLoadingEnabled(enabled: boolean): void {
    this.progressiveLoadingEnabled = enabled;
    this.logger.info(`Progressive loading ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Load creatures progressively
   * @param creatures Creatures to load
   */
  loadCreaturesProgressively(creatures: Creature[]): void {
    if (!this.progressiveLoadingEnabled || !this.progressiveLoader) {
      // If progressive loading is disabled, mark all creatures as fully loaded
      for (const creature of creatures) {
        creature.loadingStage = LoadingStage.COMPLETE;
      }
      return;
    }

    // Queue creatures for progressive loading
    this.progressiveLoader.queueCreatures(creatures);
    this.logger.debug(`Queued ${creatures.length} creatures for progressive loading`);
  }

  /**
   * Load a creature to a specific stage
   * @param creature Creature to load
   * @param stage Loading stage to load to
   * @returns Promise resolving when loading is complete
   */
  async loadCreatureToStage(creature: Creature, stage: LoadingStage): Promise<void> {
    if (!creature) return;

    // If already at or beyond the requested stage, do nothing
    if (creature.loadingStage && this.compareLoadingStages(creature.loadingStage, stage) >= 0) {
      return;
    }

    // Load the creature to the requested stage
    switch (stage) {
      case LoadingStage.BASIC:
        await this.loadCreatureBasicData(creature);
        break;
      case LoadingStage.DETAILED:
        // Make sure basic data is loaded first
        if (!creature.loadingStage || creature.loadingStage === LoadingStage.NONE) {
          await this.loadCreatureBasicData(creature);
        }
        await this.loadCreatureDetailedData(creature);
        break;
      case LoadingStage.COMPLETE:
        // Make sure basic and detailed data are loaded first
        if (!creature.loadingStage || creature.loadingStage === LoadingStage.NONE) {
          await this.loadCreatureBasicData(creature);
        }
        if (creature.loadingStage === LoadingStage.BASIC) {
          await this.loadCreatureDetailedData(creature);
        }
        await this.loadCreatureCompleteData(creature);
        break;
    }

    // Update the creature's loading stage
    creature.loadingStage = stage;
    creature.lastUpdatedAt = Date.now();
  }

  /**
   * Load basic data for a creature
   * @param creature Creature to load basic data for
   */
  private async loadCreatureBasicData(creature: Creature): Promise<void> {
    // In a real implementation, this would load the basic data from storage
    // For now, we'll just simulate loading time
    await new Promise(resolve => setTimeout(resolve, 50));

    // Set the loading stage
    creature.loadingStage = LoadingStage.BASIC;
    this.logger.debug(`Loaded basic data for creature ${creature.id}`);
  }

  /**
   * Load detailed data for a creature
   * @param creature Creature to load detailed data for
   */
  private async loadCreatureDetailedData(creature: Creature): Promise<void> {
    // In a real implementation, this would load the detailed data from storage
    // For now, we'll just simulate loading time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Set the loading stage
    creature.loadingStage = LoadingStage.DETAILED;
    this.logger.debug(`Loaded detailed data for creature ${creature.id}`);
  }

  /**
   * Load complete data for a creature
   * @param creature Creature to load complete data for
   */
  private async loadCreatureCompleteData(creature: Creature): Promise<void> {
    // In a real implementation, this would load any remaining data from storage
    // For now, we'll just simulate loading time
    await new Promise(resolve => setTimeout(resolve, 150));

    // Set the loading stage
    creature.loadingStage = LoadingStage.COMPLETE;
    this.logger.debug(`Loaded complete data for creature ${creature.id}`);
  }

  /**
   * Compare two loading stages
   * @param a First loading stage
   * @param b Second loading stage
   * @returns -1 if a < b, 0 if a === b, 1 if a > b
   */
  private compareLoadingStages(a: LoadingStage, b: LoadingStage): number {
    const stageValues: Record<LoadingStage, number> = {
      [LoadingStage.NONE]: 0,
      [LoadingStage.BASIC]: 1,
      [LoadingStage.DETAILED]: 2,
      [LoadingStage.COMPLETE]: 3
    };

    return stageValues[a] - stageValues[b];
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
