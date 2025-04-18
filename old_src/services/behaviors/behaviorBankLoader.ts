/**
 * Behavior Bank Loader for Bitcoin Protozoa
 *
 * This service is responsible for loading behavior data from various sources
 * and creating a behavior bank for use by the behavior service.
 */

import { Role, Tier } from '../../types/core';
import {
  Behavior,
  BehaviorRegistry,
  BehaviorTriggerType,
  BehaviorActionType
} from '../../types/behaviors/behavior';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { RNGSystem } from '../../types/utils/rng';
import { createRNGFromBlock } from '../../lib/rngSystem';

// Import types for fs and path modules
// These will be dynamically loaded when needed
type FS = { 
  promises: { 
    readFile: (path: string, encoding: string) => Promise<string>;
    access: (path: string) => Promise<void>;
  };
};

type Path = {
  join: (...paths: string[]) => string;
};

/**
 * Behavior Bank Loader class
 */
export class BehaviorBankLoader {
  private blockData: BlockData | null = null;
  private rngSystem: RNGSystem | null = null;
  private initialized = false;

  /**
   * Initialize the behavior bank loader
   * @param blockData Block data for deterministic bank generation
   */
  public initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.rngSystem = createRNGFromBlock(blockData);
    this.initialized = true;
    console.log('Behavior Bank Loader initialized with block data:', blockData);
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Load behavior data from JSON files
   * @param basePath The base path to the behavior data files
   * @returns A promise resolving to a behavior registry
   */
  public async loadFromFiles(basePath: string): Promise<BehaviorRegistry> {
    try {
      if (!this.initialized) {
        throw new Error('Behavior Bank Loader not initialized');
      }

      // Try to dynamically import fs and path modules
      let fs: FS | null = null;
      let path: Path | null = null;
      
      try {
        // Use dynamic import to avoid issues in browser environments
        // This will be caught in the try-catch if it fails
        const fsModule = await (Function('return import("fs")'))() as any;
        const pathModule = await (Function('return import("path")'))() as any;
        
        fs = { promises: fsModule.promises };
        path = pathModule;
      } catch (e) {
        console.warn('File system modules not available, using mock data');
        return this.createMockBehaviorRegistry();
      }

      // Create empty behavior registry
      const behaviorRegistry: BehaviorRegistry = {};

      // Initialize empty arrays for each role and tier
      const roles = Object.values(Role);
      // Use only the enum string values, not the numeric values
      const tiers = [
        Tier.TIER_1,
        Tier.TIER_2,
        Tier.TIER_3,
        Tier.TIER_4,
        Tier.TIER_5,
        Tier.TIER_6
      ];

      for (const role of roles) {
        behaviorRegistry[role] = {};
        for (const tier of tiers) {
          behaviorRegistry[role][tier] = [];
        }
      }

      // Load behaviors for each role and tier
      for (const role of roles) {
        for (const tier of tiers) {
          try {
            const tierNumber = tier.toString().replace('TIER_', '');
            const filePath = path.join(basePath, 'behaviors', role.toLowerCase(), `${role.toLowerCase()}_tier${tierNumber}_behaviors.json`);

            // Check if file exists
            try {
              await fs.promises.access(filePath);
            } catch (accessError) {
              console.warn(`Behavior file not found: ${filePath}. Using mock data instead.`);
              behaviorRegistry[role][tier] = this.createMockBehaviors(role, tier);
              continue;
            }

            // Read and parse the file
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            const behaviors = JSON.parse(fileContent) as Behavior[];

            // Validate behaviors
            const validBehaviors = behaviors.filter(behavior => {
              const isValid = this.validateBehavior(behavior, role, tier);
              if (!isValid) {
                console.warn(`Invalid behavior found in ${filePath}:`, behavior.name);
              }
              return isValid;
            });

            behaviorRegistry[role][tier] = validBehaviors;
            console.log(`Loaded ${validBehaviors.length} behaviors for ${role}, tier ${tier}`);
          } catch (error) {
            console.error(`Error loading behaviors for ${role}, tier ${tier}:`, error);
            // Fallback to mock data
            behaviorRegistry[role][tier] = this.createMockBehaviors(role, tier);
          }
        }
      }

      return behaviorRegistry;
    } catch (error) {
      console.error('Error loading behavior bank:', error);
      throw error;
    }
  }

  /**
   * Validate a behavior
   * @param behavior The behavior to validate
   * @param expectedRole The expected role
   * @param expectedTier The expected tier
   * @returns True if the behavior is valid, false otherwise
   */
  private validateBehavior(behavior: Behavior, expectedRole: Role, expectedTier: Tier): boolean {
    // Check required fields
    if (!behavior.name || !behavior.description || !behavior.role ||
        !behavior.tier || !behavior.subclass || !behavior.trigger ||
        !behavior.action || behavior.priority === undefined) {
      return false;
    }

    // Check role and tier match expected values
    if (behavior.role !== expectedRole || behavior.tier !== expectedTier) {
      return false;
    }

    // Check trigger and action have required fields
    if (!behavior.trigger.type || !behavior.trigger.condition ||
        !behavior.action.type || !behavior.action.description) {
      return false;
    }

    return true;
  }

  /**
   * Create a mock behavior registry for testing
   * @returns A behavior registry with mock data
   */
  public createMockBehaviorRegistry(): BehaviorRegistry {
    if (!this.initialized) {
      throw new Error('Behavior Bank Loader not initialized');
    }

    // Create empty behavior registry
    const behaviorRegistry: BehaviorRegistry = {};

    // Initialize with mock data for each role
    const roles = Object.values(Role);
    // Use only the enum string values, not the numeric values
    const tiers = [
      Tier.TIER_1,
      Tier.TIER_2,
      Tier.TIER_3,
      Tier.TIER_4,
      Tier.TIER_5,
      Tier.TIER_6
    ];

    for (const role of roles) {
      behaviorRegistry[role] = {};
      for (const tier of tiers) {
        behaviorRegistry[role][tier] = this.createMockBehaviors(role, tier);
      }
    }

    return behaviorRegistry;
  }

  /**
   * Create mock behaviors for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns An array of mock behaviors
   */
  private createMockBehaviors(role: Role, tier: Tier): Behavior[] {
    const subclasses = [
      'Default',
      'Alpha',
      'Sentinel',
      'Guardian',
      'Assassin',
      'Commander'
    ];

    const triggerTypes = Object.values(BehaviorTriggerType);
    const actionTypes = Object.values(BehaviorActionType);

    // Generate 2-4 behaviors per role and tier
    const count = 2 + Math.floor(Math.random() * 3);
    const behaviors: Behavior[] = [];

    for (let i = 0; i < count; i++) {
      const subclass = i < subclasses.length ? subclasses[i] : 'Default';
      const triggerType = triggerTypes[i % triggerTypes.length];
      const actionType = actionTypes[i % actionTypes.length];

      behaviors.push({
        name: `${role} ${subclass} Behavior ${i}`,
        description: `A tier ${tier} behavior for ${role} ${subclass}`,
        role: role,
        tier: tier,
        subclass: subclass,
        trigger: {
          type: triggerType,
          condition: `Trigger condition for ${triggerType}`,
          parameters: this.generateMockTriggerParameters(triggerType)
        },
        action: {
          type: actionType,
          description: `Action for ${actionType}`,
          parameters: this.generateMockActionParameters(actionType)
        },
        priority: 50 + (i * 10) // Different priorities
      });
    }

    return behaviors;
  }

  /**
   * Generate mock trigger parameters based on trigger type
   * @param triggerType The trigger type
   * @returns Mock trigger parameters
   */
  private generateMockTriggerParameters(triggerType: BehaviorTriggerType): Record<string, any> {
    switch (triggerType) {
      case BehaviorTriggerType.HEALTH_THRESHOLD:
        return { threshold: 0.3 + Math.random() * 0.4 };
      case BehaviorTriggerType.ENEMY_PROXIMITY:
        return { range: 10 + Math.random() * 20 };
      case BehaviorTriggerType.PERIODIC:
        return { interval: 3 + Math.random() * 7 };
      case BehaviorTriggerType.ABILITY_READY:
        return { abilityType: 'primary' };
      case BehaviorTriggerType.ALLY_STATUS:
        return { status: 'low_health', threshold: 0.3 };
      case BehaviorTriggerType.FORMATION_STATUS:
        return { status: 'scattered', threshold: 0.5 };
      case BehaviorTriggerType.ENVIRONMENT:
        return { condition: 'low_energy' };
      case BehaviorTriggerType.COMBAT_START:
      default:
        return {};
    }
  }

  /**
   * Generate mock action parameters based on action type
   * @param actionType The action type
   * @returns Mock action parameters
   */
  private generateMockActionParameters(actionType: BehaviorActionType): Record<string, any> {
    switch (actionType) {
      case BehaviorActionType.TARGET_SELECTION:
        return { targetType: 'nearest_enemy' };
      case BehaviorActionType.ABILITY_USAGE:
        return { abilityId: 'primary_attack' };
      case BehaviorActionType.MOVEMENT:
        return { distance: 10, direction: 'away_from_enemies' };
      case BehaviorActionType.FORMATION_CHANGE:
        return { formationId: 'defensive' };
      case BehaviorActionType.COORDINATION:
        return { allies: 'nearby', action: 'focus_fire' };
      case BehaviorActionType.RETREAT:
        return { distance: 15, duration: 5 };
      case BehaviorActionType.DEFENSIVE:
        return { shield: true, duration: 3 };
      case BehaviorActionType.AGGRESSIVE:
      default:
        return { damage_multiplier: 1.2 };
    }
  }
}

// Singleton instance
let behaviorBankLoaderInstance: BehaviorBankLoader | null = null;

/**
 * Get the behavior bank loader instance
 * @returns The behavior bank loader instance
 */
export function getBehaviorBankLoader(): BehaviorBankLoader {
  if (!behaviorBankLoaderInstance) {
    behaviorBankLoaderInstance = new BehaviorBankLoader();
  }
  return behaviorBankLoaderInstance;
}
