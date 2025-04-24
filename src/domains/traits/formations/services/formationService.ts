/**
 * Formation Service for Bitcoin Protozoa
 *
 * This service manages formation patterns and their application to particle groups.
 */

import { Role, Rarity } from '../../../../shared/types/core';
import { BlockData } from '../../../bitcoin/types/bitcoin';
import { Formation, FormationPattern } from '../types/formation';
import { formationPatterns } from '../data/patterns';
import { Logging } from '../../../../shared/utils';
import { registry } from '../../../../shared/services/serviceRegistry';
import { IParticleService } from '../../../particle/interfaces/particleService';
import { RNGStream } from '../../../rng/types/rng';
import { getRNGService } from '../../../rng/services/rngService';

// Singleton instance
let instance: FormationService | null = null;

/**
 * Formation Service class
 */
export class FormationService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private rngStream: RNGStream | null = null;
  private logger = Logging.createLogger('FormationService');

  /**
   * Initialize the formation service with block data
   * @param blockData The Bitcoin block data
   * @throws Error if Particle service is not initialized
   */
  async initialize(blockData: BlockData): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Formation service already initialized');
      return;
    }

    this.blockData = blockData;

    // Get RNG service and ensure it's initialized
    const rngService = getRNGService();
    if (!rngService.isInitialized()) {
      throw new Error('RNG service must be initialized before Formation service');
    }

    // Check if Particle service is available and initialized
    if (!registry.has('ParticleService')) {
      throw new Error('Particle service not available. Cannot initialize Formation service.');
    }

    const particleService = registry.get<IParticleService>('ParticleService');
    if (!particleService.isInitialized()) {
      throw new Error('Particle service must be initialized before Formation service. Check initialization order.');
    }

    this.logger.info('Particle service is initialized. Proceeding with Formation service initialization.');

    // Get the formations RNG stream
    const rngSystem = rngService.getRNGSystem();
    this.rngStream = rngSystem.getStream('formations');

    this.initialized = true;
    this.logger.info('Formation service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get a random formation for the given role and rarity
   * @param role The role to get a formation for
   * @param rarity The rarity tier to get a formation for
   * @returns A random formation matching the criteria
   */
  getRandomFormation(role: Role, rarity: Rarity): Formation | null {
    if (!this.initialized || !this.rngStream) {
      this.logger.warn('Formation service not initialized');
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
      this.logger.warn('Formation service not initialized');
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
      this.logger.warn('Formation service not initialized');
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
      this.logger.warn('Formation service not initialized');
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
   * Apply a formation pattern to a particle group
   * @param groupId The ID of the particle group
   * @param pattern The formation pattern to apply
   */
  applyFormationPattern(groupId: string, pattern: FormationPattern): void {
    if (!this.initialized) {
      this.logger.warn('Formation service not initialized');
      return;
    }

    // Get the particle service
    if (!registry.has('ParticleService')) {
      this.logger.error('Particle service not available');
      return;
    }

    const particleService = registry.get<IParticleService>('ParticleService');

    // Get the particle group
    const group = particleService.getGroup(groupId);
    if (!group) {
      this.logger.error(`Particle group not found: ${groupId}`);
      return;
    }

    // Apply the pattern to the group
    // This is a placeholder implementation
    this.logger.info(`Applied formation pattern to group ${groupId}`);
  }

  /**
   * Reset the service
   */
  reset(): void {
    this.blockData = null;
    this.rngStream = null;
    this.initialized = false;
    this.logger.info('Formation service reset');
  }
}

/**
 * Get the formation service instance
 * @returns The formation service singleton instance
 */
export function getFormationService(): FormationService {
  if (!instance) {
    instance = new FormationService();
  }
  return instance;
}
