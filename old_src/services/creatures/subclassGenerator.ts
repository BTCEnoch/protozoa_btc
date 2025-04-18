/**
 * Subclass Generator for Bitcoin Protozoa
 *
 * This service generates subclasses for creature groups based on role, tier, and RNG.
 */

import { Role, Tier } from '../../types/core';
import { Subclass, createDefaultSubclass } from '../../types/creatures/subclass';
import { RNGStream } from '../../lib/rngSystem';
import { fileSystem } from '../../lib/fileSystem';
import * as pathUtil from 'path';

/**
 * SubclassGenerator class
 * Generates subclasses for creature groups
 */
class SubclassGenerator {
  private static instance: SubclassGenerator;
  private initialized: boolean = false;
  private subclassBank: any = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   * @returns The SubclassGenerator instance
   */
  public static getInstance(): SubclassGenerator {
    if (!SubclassGenerator.instance) {
      SubclassGenerator.instance = new SubclassGenerator();
    }
    return SubclassGenerator.instance;
  }

  /**
   * Initialize the subclass generator
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load subclass data from JSON file
      const subclassData = await this.loadSubclassData();
      this.subclassBank = subclassData;
      this.initialized = true;
      console.log('Subclass generator initialized');
    } catch (error) {
      console.error('Error initializing subclass generator:', error);
      // Create a basic subclass bank with default values
      this.createDefaultSubclassBank();
      this.initialized = true;
      console.warn('Using default subclass bank');
    }
  }

  /**
   * Load subclass data from JSON file
   * @returns The subclass data
   */
  private async loadSubclassData(): Promise<any> {
    try {
      const filePath = pathUtil.join('src', 'data', 'creatures', 'subclasses.json');
      const data = await fileSystem.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading subclass data:', error);
      throw error;
    }
  }

  /**
   * Create a default subclass bank
   */
  private createDefaultSubclassBank(): void {
    this.subclassBank = {
      roles: {
        CORE: {},
        ATTACK: {},
        DEFENSE: {},
        CONTROL: {},
        MOVEMENT: {}
      }
    };

    // Add default subclasses for each role and tier
    const roles = [Role.CORE, Role.ATTACK, Role.DEFENSE, Role.CONTROL, Role.MOVEMENT];
    const tiers = [Tier.TIER_1, Tier.TIER_2, Tier.TIER_3, Tier.TIER_4, Tier.TIER_5, Tier.TIER_6];

    for (const role of roles) {
      for (const tier of tiers) {
        if (!this.subclassBank.roles[role][tier]) {
          this.subclassBank.roles[role][tier] = [];
        }
        this.subclassBank.roles[role][tier].push(createDefaultSubclass(role, tier));
      }
    }
  }

  /**
   * Get a subclass for a role and tier
   * @param role The role
   * @param tier The tier
   * @param rngStream The RNG stream to use
   * @returns A subclass
   */
  public getSubclass(role: Role, tier: Tier, rngStream: RNGStream): Subclass {
    if (!this.initialized) {
      throw new Error('Subclass generator not initialized');
    }

    try {
      // Check if we have subclasses for this role and tier
      const subclasses = this.subclassBank.roles[role][tier];
      
      if (!subclasses || subclasses.length === 0) {
        console.warn(`No subclasses found for ${role} ${tier}, using default`);
        return createDefaultSubclass(role, tier);
      }

      // Select a random subclass
      const index = Math.floor(rngStream.random() * subclasses.length);
      const subclass = subclasses[index];

      // Convert to Subclass type
      return {
        name: subclass.name,
        tier,
        bonuses: subclass.bonuses
      };
    } catch (error) {
      console.error(`Error getting subclass for ${role} ${tier}:`, error);
      return createDefaultSubclass(role, tier);
    }
  }

  /**
   * Reset the subclass generator
   */
  public reset(): void {
    this.initialized = false;
    this.subclassBank = null;
  }
}

/**
 * Get the subclass generator instance
 * @returns The SubclassGenerator instance
 */
export function getSubclassGenerator(): SubclassGenerator {
  return SubclassGenerator.getInstance();
}

/**
 * Get a subclass for a role and tier
 * @param role The role
 * @param tier The tier
 * @param rngStream The RNG stream to use
 * @returns A subclass
 */
export function getSubclass(role: Role, tier: Tier, rngStream: RNGStream): Subclass {
  const generator = getSubclassGenerator();
  if (!generator.initialized) {
    throw new Error('Subclass generator not initialized');
  }
  return generator.getSubclass(role, tier, rngStream);
}
