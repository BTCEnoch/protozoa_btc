/**
 * Behavior Service for Bitcoin Protozoa
 *
 * This service is responsible for managing behaviors for particles and particle groups.
 * It handles behavior selection, application, and evolution.
 */

import { Role, Tier } from '../../types/core';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { RNGSystem, RNGStream } from '../../types/utils/rng';
import { createRNGFromBlock } from '../../lib/rngSystem';
import { Behavior, BehaviorRegistry, BehaviorTriggerType } from '../../types/behaviors/behavior';
import { getBehaviorBankLoader } from './behaviorBankLoader';
import { getBehaviorFactory } from './behaviorFactory';

/**
 * Behavior Service class
 */
class BehaviorService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private rngSystem: RNGSystem | null = null;
  private behaviorRegistry: BehaviorRegistry | null = null;
  private selectedBehaviors: Map<string, Behavior[]> = new Map();

  /**
   * Initialize the behavior service with block data
   * @param blockData The Bitcoin block data
   */
  public initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.rngSystem = createRNGFromBlock(blockData);

    // Initialize bank loader and factory
    const behaviorBankLoader = getBehaviorBankLoader();
    behaviorBankLoader.initialize(blockData);

    // Try to load behaviors from files first, fall back to mock data if needed
    behaviorBankLoader.loadFromFiles('src/data')
      .then(registry => {
        this.behaviorRegistry = registry;
        console.log('Loaded behavior registry from files');
      })
      .catch(error => {
        console.error('Error loading behavior registry from files:', error);
        this.behaviorRegistry = behaviorBankLoader.createMockBehaviorRegistry();
        console.log('Using mock behavior registry');
      });

    // Initialize the behavior factory
    const behaviorFactory = getBehaviorFactory();
    behaviorFactory.initialize(blockData);

    this.selectedBehaviors.clear();
    this.initialized = true;

    console.log('Behavior service initialized with block data:', blockData);
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get behaviors for a specific group
   * @param groupId The group ID
   * @param role The role to get behaviors for
   * @param tier The tier to get behaviors for
   * @param subclass Optional subclass to filter behaviors by
   * @returns Array of behaviors for the specified parameters
   */
  public getBehaviorsForGroup(
    groupId: string,
    role: Role,
    tier: Tier,
    subclass?: string
  ): Behavior[] {
    if (!this.initialized || !this.rngSystem) {
      throw new Error('Behavior service not initialized');
    }

    if (!this.behaviorRegistry) {
      console.warn('Behavior registry not yet loaded, returning empty array');
      return [];
    }

    // Check if we already have behaviors for this group
    const cacheKey = `${groupId}_${role}_${tier}_${subclass || 'Default'}`;
    if (this.selectedBehaviors.has(cacheKey)) {
      return this.selectedBehaviors.get(cacheKey) || [];
    }

    // Get all behaviors for this role and tier
    const tierBehaviors = this.behaviorRegistry[role]?.[tier] || [];
    if (tierBehaviors.length === 0) {
      console.warn(`No behaviors found for role ${role}, tier ${tier}`);
      return [];
    }

    // Standardize subclass handling - use 'Default' if not provided
    const targetSubclass = subclass || 'Default';

    // Filter by subclass if provided
    let filteredBehaviors = tierBehaviors.filter(behavior =>
      behavior.subclass.toLowerCase() === targetSubclass.toLowerCase()
    );

    // If no behaviors found for the specific subclass, fall back to 'Default'
    if (filteredBehaviors.length === 0 && targetSubclass.toLowerCase() !== 'default') {
      console.warn(`No behaviors found for subclass ${targetSubclass}, falling back to Default`);
      filteredBehaviors = tierBehaviors.filter(behavior =>
        behavior.subclass.toLowerCase() === 'default'
      );
    }

    // If still no behaviors, use all behaviors for this tier
    if (filteredBehaviors.length === 0) {
      console.warn(`No Default behaviors found, using all behaviors for tier ${tier}`);
      filteredBehaviors = tierBehaviors;
    }

    // Use the behavior selection stream for consistent selection
    const selectionStream = this.rngSystem.getStream('behavior');

    // Select a subset of behaviors based on the group ID
    // The number selected depends on the tier - higher tiers get more behaviors
    const tierNumber = parseInt(tier.toString().replace('TIER_', ''), 10);
    const behaviorCount = Math.min(filteredBehaviors.length, 1 + Math.floor(tierNumber / 2));

    // Use weighted selection based on priority instead of random shuffling
    const selectedBehaviors = this.selectBehaviorsByPriority(
      filteredBehaviors,
      behaviorCount,
      selectionStream
    );

    // Cache the results with an expiration time (5 minutes)
    this.selectedBehaviors.set(cacheKey, selectedBehaviors);

    // Set a timeout to invalidate the cache after 5 minutes
    setTimeout(() => {
      this.selectedBehaviors.delete(cacheKey);
    }, 5 * 60 * 1000);

    return selectedBehaviors;
  }

  /**
   * Select behaviors based on their priority weights
   * @param behaviors The behaviors to select from
   * @param count The number of behaviors to select
   * @param rngStream The RNG stream to use
   * @returns Array of selected behaviors
   */
  private selectBehaviorsByPriority(
    behaviors: Behavior[],
    count: number,
    rngStream: RNGStream
  ): Behavior[] {
    if (behaviors.length <= count) {
      return [...behaviors]; // Return all behaviors if we need more than available
    }

    // Calculate total priority weight
    const totalWeight = behaviors.reduce((sum, behavior) => sum + behavior.priority, 0);

    // Select behaviors based on weighted probability
    const selected: Behavior[] = [];
    const availableBehaviors = [...behaviors];

    for (let i = 0; i < count; i++) {
      if (availableBehaviors.length === 0) break;

      // Calculate current total weight of available behaviors
      const currentTotalWeight = availableBehaviors.reduce(
        (sum, behavior) => sum + behavior.priority,
        0
      );

      // Select a random point in the weight distribution
      const randomWeight = rngStream.next() * currentTotalWeight;

      // Find the behavior at that point
      let cumulativeWeight = 0;
      let selectedIndex = -1;

      for (let j = 0; j < availableBehaviors.length; j++) {
        cumulativeWeight += availableBehaviors[j].priority;
        if (cumulativeWeight >= randomWeight) {
          selectedIndex = j;
          break;
        }
      }

      // If we somehow didn't select anything (shouldn't happen), pick the last one
      if (selectedIndex === -1) {
        selectedIndex = availableBehaviors.length - 1;
      }

      // Add the selected behavior to our result and remove it from available behaviors
      selected.push(availableBehaviors[selectedIndex]);
      availableBehaviors.splice(selectedIndex, 1);
    }

    return selected;
  }

  /**
   * Shuffle an array using the provided RNG stream
   * @param array The array to shuffle
   * @param rngStream The RNG stream to use
   * @returns A shuffled copy of the array
   */
  private shuffleArray<T>(array: T[], rngStream: RNGStream): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rngStream.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Singleton instance
let instance: BehaviorService | null = null;

/**
 * Get the behavior service instance
 * @returns The behavior service instance
 */
export function getBehaviorService(): BehaviorService {
  if (!instance) {
    instance = new BehaviorService();
  }
  return instance;
}

