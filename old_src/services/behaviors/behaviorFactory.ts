/**
 * Behavior Factory for Bitcoin Protozoa
 *
 * This factory is responsible for creating behaviors for particle groups.
 * It ensures deterministic behavior creation based on Bitcoin block data.
 */

import { Role, Rarity, Tier } from '../../types/core';
import { RNGSystem, RNGStream } from '../../types/utils/rng';
import { BehaviorTrait } from '../../types/traits/trait';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { createRNGFromBlock } from '../../lib/rngSystem';

/**
 * Behavior factory class
 */
export class BehaviorFactory {
  private rngSystem: RNGSystem | null = null;
  private blockData: BlockData | null = null;
  private initialized = false;

  /**
   * Initialize the behavior factory with block data
   * @param blockData Block data for deterministic behavior creation
   */
  public initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.rngSystem = createRNGFromBlock(blockData);
    this.initialized = true;
    console.log('Behavior factory initialized with block data:', blockData);
  }

  /**
   * Check if the factory is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a behavior
   * @param params The behavior parameters
   * @returns A behavior trait
   * @throws Error if required parameters are missing or invalid
   */
  public createBehavior(params: {
    name: string;
    description: string;
    role: Role;
    rarity: Rarity;
    type: string;
    strength?: number;
    range?: number;
    priority?: number;
    persistence?: number;
    frequency?: number;
    additionalParameters?: Record<string, any>;
  }): BehaviorTrait {
    if (!this.rngSystem || !this.initialized) {
      throw new Error('Behavior factory not initialized');
    }

    // Validate required parameters
    if (!params.name || !params.description || !params.role || !params.rarity || !params.type) {
      throw new Error('Missing required parameters for behavior creation');
    }

    // Use the behavior stream for all behavior-related random numbers
    const behaviorStream = this.rngSystem.getStream('behavior');

    // Generate a random strength if not provided
    const strength = params.strength ?? 0.5 + behaviorStream.next() * 0.5;

    // Generate a random range if not provided
    const range = params.range ?? 5 + behaviorStream.next() * 10;

    // Generate a random priority if not provided
    const priority = params.priority ?? behaviorStream.next();

    // Generate a random persistence if not provided
    const persistence = params.persistence ?? 0.5 + behaviorStream.next() * 0.5;

    // Generate a random frequency if not provided
    const frequency = params.frequency ?? 0.5 + behaviorStream.next() * 0.5;

    // Validate numeric parameters
    if (strength < 0 || strength > 1.5) {
      throw new Error(`Invalid strength value: ${strength}. Must be between 0 and 1.5`);
    }
    if (range < 0) {
      throw new Error(`Invalid range value: ${range}. Must be positive`);
    }
    if (priority < 0 || priority > 1) {
      throw new Error(`Invalid priority value: ${priority}. Must be between 0 and 1`);
    }
    if (persistence < 0 || persistence > 1) {
      throw new Error(`Invalid persistence value: ${persistence}. Must be between 0 and 1`);
    }
    if (frequency < 0 || frequency > 1) {
      throw new Error(`Invalid frequency value: ${frequency}. Must be between 0 and 1`);
    }

    // Create the behavior trait
    return {
      id: this.generateBehaviorId(params.role, params.type, params.name),
      name: params.name,
      description: params.description,
      rarityTier: params.rarity,
      role: params.role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      type: params.type,
      physicsLogic: {
        strength,
        range,
        priority,
        persistence,
        frequency,
        additionalParameters: params.additionalParameters ?? {}
      },
      visualEffects: {
        particleEffect: `${params.role.toLowerCase()}_${params.type.toLowerCase()}_effect`,
        trailEffect: `${params.role.toLowerCase()}_${params.type.toLowerCase()}_trail`,
        colorModulation: behaviorStream.next() > 0.5
      }
    };
  }

  /**
   * Create a behavior from a template
   * @param template The behavior template
   * @param overrides The properties to override
   * @returns A behavior trait
   * @throws Error if required parameters are missing or invalid after merging
   */
  public createBehaviorFromTemplate(
    template: Partial<BehaviorTrait>,
    overrides: Partial<BehaviorTrait> = {}
  ): BehaviorTrait {
    if (!this.rngSystem || !this.initialized) {
      throw new Error('Behavior factory not initialized');
    }

    // Use the behavior stream for all behavior-related random numbers
    const behaviorStream = this.rngSystem.getStream('behavior');

    // Merge template and overrides
    const merged = {
      ...template,
      ...overrides
    };

    // Validate required properties
    if (!merged.name || !merged.role || !merged.type) {
      throw new Error('Missing required properties in template: name, role, or type');
    }

    // Ensure required properties are present
    if (!merged.id) {
      merged.id = this.generateBehaviorId(
        merged.role!,
        merged.type!,
        merged.name!
      );
    }

    if (!merged.description) {
      merged.description = `${merged.name} behavior for ${merged.role} role`;
    }

    if (!merged.rarityTier) {
      throw new Error('Missing required property in template: rarityTier');
    }

    if (!merged.evolutionParameters) {
      merged.evolutionParameters = {
        mutationChance: 0.1,
        possibleEvolutions: []
      };
    }

    if (!merged.physicsLogic) {
      merged.physicsLogic = {
        strength: 0.5 + behaviorStream.next() * 0.5,
        range: 5 + behaviorStream.next() * 10,
        priority: behaviorStream.next(),
        persistence: 0.5 + behaviorStream.next() * 0.5,
        frequency: 0.5 + behaviorStream.next() * 0.5,
        additionalParameters: {}
      };
    }

    if (!merged.visualEffects) {
      merged.visualEffects = {
        particleEffect: `${merged.role!.toLowerCase()}_${merged.type!.toLowerCase()}_effect`,
        trailEffect: `${merged.role!.toLowerCase()}_${merged.type!.toLowerCase()}_trail`,
        colorModulation: behaviorStream.next() > 0.5
      };
    }

    // Validate numeric parameters
    const { strength, range, priority, persistence, frequency } = merged.physicsLogic;
    if (strength < 0 || strength > 1.5) {
      throw new Error(`Invalid strength value: ${strength}. Must be between 0 and 1.5`);
    }
    if (range < 0) {
      throw new Error(`Invalid range value: ${range}. Must be positive`);
    }
    if (priority < 0 || priority > 1) {
      throw new Error(`Invalid priority value: ${priority}. Must be between 0 and 1`);
    }
    if (persistence < 0 || persistence > 1) {
      throw new Error(`Invalid persistence value: ${persistence}. Must be between 0 and 1`);
    }
    if (frequency < 0 || frequency > 1) {
      throw new Error(`Invalid frequency value: ${frequency}. Must be between 0 and 1`);
    }

    return merged as BehaviorTrait;
  }

  /**
   * Generate a behavior ID
   * @param role The role
   * @param type The behavior type
   * @param name The behavior name
   * @returns A behavior ID
   */
  public generateBehaviorId(role: Role, type: string, name: string): string {
    // Convert name to snake_case
    const snakeCaseName = name.toLowerCase().replace(/\s+/g, '_');

    // Generate ID
    return `${role.toLowerCase()}_${type.toLowerCase()}_${snakeCaseName}`;
  }
}

// Singleton instance
let behaviorFactoryInstance: BehaviorFactory | null = null;

/**
 * Get the behavior factory instance
 * @returns The behavior factory instance
 */
export function getBehaviorFactory(): BehaviorFactory {
  if (!behaviorFactoryInstance) {
    behaviorFactoryInstance = new BehaviorFactory();
  }
  return behaviorFactoryInstance;
}

