/**
 * Trait Service for Bitcoin Protozoa
 *
 * This service manages trait selection and application based on RNG.
 */

import { Role, Rarity } from '../../../shared/types/core';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { BaseTrait, TraitCollection } from '../types/trait';
import { getRNGService } from '../../rng/services/rngService';
import { RNGStream } from '../../rng/types/rng';
import { formationPatterns } from '../formations/data/patterns';
import { Formation } from '../formations/types/formation';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: TraitService | null = null;

/**
 * Trait Service class
 */
export class TraitService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private rngStream: RNGStream | null = null;
  private logger = Logging.createLogger('TraitService');

  /**
   * Initialize the trait service with block data
   * @param blockData The Bitcoin block data
   */
  async initialize(blockData: BlockData): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Trait service already initialized');
      return;
    }

    this.blockData = blockData;

    // Get RNG service and ensure it's initialized
    const rngService = getRNGService();
    if (!rngService.isInitialized()) {
      throw new Error('RNG service must be initialized before trait service');
    }

    // Get the traits RNG stream
    const rngSystem = rngService.getRNGSystem();
    this.rngStream = rngSystem.getStream('traits');

    this.initialized = true;
    this.logger.info('Trait service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get traits for a specific role
   * @param role The role to get traits for
   * @param rarity Optional rarity filter
   * @returns Array of traits for the specified role
   */
  getTraitsForRole(role: Role, rarity?: Rarity): BaseTrait[] {
    if (!this.initialized) {
      this.logger.warn('Trait service not initialized');
      return [];
    }

    // This is a placeholder implementation
    // In a real implementation, this would load traits from a trait bank
    this.logger.debug(`Getting traits for role ${role}${rarity ? ` with rarity ${rarity}` : ''}`);
    return [];
  }

  /**
   * Create a trait collection for a role
   * @param role The role to create traits for
   * @returns A trait collection for the specified role
   */
  createTraitCollection(role: Role): TraitCollection {
    if (!this.initialized) {
      this.logger.warn('Trait service not initialized');
      return {
        visual: [],
        formation: [],
        behavior: [],
        forceCalculation: [],
        classBonus: [],
        subclass: []
      };
    }

    // This is a placeholder implementation
    // In a real implementation, this would create traits using a trait factory
    this.logger.debug(`Creating trait collection for role ${role}`);
    return {
      visual: [],
      formation: [],
      behavior: [],
      forceCalculation: [],
      classBonus: [],
      subclass: []
    };
  }

  /**
   * Get a trait by ID
   * @param traitId The trait ID
   * @returns The trait, or undefined if not found
   */
  getTraitById(traitId: string): BaseTrait | undefined {
    if (!this.initialized) {
      this.logger.warn('Trait service not initialized');
      return undefined;
    }

    // This is a placeholder implementation
    // In a real implementation, this would look up the trait in a trait bank
    this.logger.debug(`Getting trait by ID ${traitId}`);
    return undefined;
  }

  /**
   * Get traits by category
   * @param category The trait category
   * @param role Optional role filter
   * @param rarity Optional rarity filter
   * @returns Array of traits matching the criteria
   */
  getTraitsByCategory(category: string, role?: Role, rarity?: Rarity): BaseTrait[] {
    if (!this.initialized) {
      this.logger.warn('Trait service not initialized');
      return [];
    }

    // This is a placeholder implementation
    // In a real implementation, this would filter traits by category
    this.logger.debug(`Getting traits by category ${category}${role ? ` for role ${role}` : ''}${rarity ? ` with rarity ${rarity}` : ''}`);
    return [];
  }

  /**
   * Get a random formation for the given role and rarity
   * @param role The role to get a formation for
   * @param rarity The rarity tier to get a formation for
   * @returns A random formation matching the criteria
   */
  getRandomFormation(role: Role, rarity: Rarity): Formation | null {
    if (!this.initialized || !this.rngStream) {
      this.logger.warn('Trait service not initialized');
      return null;
    }

    // Get formations for the role
    const roleFormations = formationPatterns[role.toLowerCase() as keyof typeof formationPatterns];
    if (!roleFormations) {
      this.logger.error(`No formations found for role: ${role}`);
      return null;
    }

    // Filter formations by rarity
    const rarityFormations = roleFormations.formations.filter(
      formation => formation.tier === rarity
    );

    if (rarityFormations.length === 0) {
      this.logger.warn(`No formations found for role ${role} and rarity ${rarity}`);
      return null;
    }

    // Select a random formation
    return this.rngStream.nextItem(rarityFormations as Formation[]);
  }

  /**
   * Get a random formation for the given role
   * @param role The role to get a formation for
   * @returns A random formation for the role
   */
  getRandomFormationForRole(role: Role): Formation | null {
    if (!this.initialized || !this.rngStream) {
      this.logger.warn('Trait service not initialized');
      return null;
    }

    // Get formations for the role
    const roleFormations = formationPatterns[role.toLowerCase() as keyof typeof formationPatterns];
    if (!roleFormations || roleFormations.formations.length === 0) {
      this.logger.error(`No formations found for role: ${role}`);
      return null;
    }

    // Select a random formation
    return this.rngStream.nextItem(roleFormations.formations as Formation[]);
  }

  /**
   * Get all formations for a role
   * @param role The role to get formations for
   * @returns Array of formations for the role
   */
  getFormationsForRole(role: Role): Formation[] {
    if (!this.initialized) {
      this.logger.warn('Trait service not initialized');
      return [];
    }

    // Get formations for the role
    const roleFormations = formationPatterns[role.toLowerCase() as keyof typeof formationPatterns];
    if (!roleFormations) {
      this.logger.error(`No formations found for role: ${role}`);
      return [];
    }

    return roleFormations.formations as Formation[];
  }

  /**
   * Get all formations for a role and rarity
   * @param role The role to get formations for
   * @param rarity The rarity tier to get formations for
   * @returns Array of formations matching the criteria
   */
  getFormationsForRoleAndRarity(role: Role, rarity: Rarity): Formation[] {
    if (!this.initialized) {
      this.logger.warn('Trait service not initialized');
      return [];
    }

    // Get formations for the role
    const roleFormations = formationPatterns[role.toLowerCase() as keyof typeof formationPatterns];
    if (!roleFormations) {
      this.logger.error(`No formations found for role: ${role}`);
      return [];
    }

    // Filter formations by rarity
    return roleFormations.formations.filter(
      formation => formation.tier === rarity
    ) as Formation[];
  }

  /**
   * Reset the service
   */
  reset(): void {
    this.blockData = null;
    this.rngStream = null;
    this.initialized = false;
    this.logger.info('Trait service reset');
  }
}

/**
 * Get the trait service instance
 * @returns The trait service singleton instance
 */
export function getTraitService(): TraitService {
  if (!instance) {
    instance = new TraitService();
  }
  return instance;
}
