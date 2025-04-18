/**
 * Ability Service for Bitcoin Protozoa
 *
 * This service is responsible for managing abilities for particle groups.
 * It handles ability selection, application, and evolution.
 *
 * The service supports a 6-tier system for abilities:
 * - Tier 1 (Common): Basic abilities randomly selected from tier-specific pools
 * - Tier 2 (Uncommon): Improved abilities randomly selected from tier-specific pools
 * - Tier 3+ (Rare/Epic/Legendary/Mythic): Subclass-specific abilities deterministically selected
 *   based on particle subclass with increasing power and specialization at higher tiers
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import { Role, Tier } from '../../types/core';
import { Ability, AbilityPool, FormationTrait } from '../../types/abilities/ability';
import { RNGSystem, RNGStream } from '../../types/utils/rng';
import { createRNGFromBlock } from '../../lib/rngSystem';
import { getAbilityBankLoader } from './abilityBankLoader';
import { getAbilityFactory } from './abilityFactory';

/**
 * Error types for ability service operations
 */
export enum AbilityServiceErrorType {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  DEPENDENCY_FAILED = 'DEPENDENCY_FAILED',
  NO_ABILITIES = 'NO_ABILITIES',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Ability service class
 */
export class AbilityService {
  private blockData: BlockData | null = null;
  private rngSystem: RNGSystem | null = null;
  private abilityBank: Record<string, Record<number, AbilityPool>> | null = null;
  private selectedAbilities: Map<string, {
    primary: Ability;
    secondary: Ability;
    unique: Ability;
    crowdControl: Ability;
    formationTrait: FormationTrait;
  }> = new Map();
  private initialized = false;
  private dependenciesInitialized = false;

  /**
   * Initialize the ability service with block data
   * @param blockData The block data to use for RNG
   */
  public async initialize(blockData: BlockData): Promise<void> {
    if (!blockData || typeof blockData !== 'object') {
      throw new Error('Invalid block data provided to AbilityService');
    }

    this.blockData = blockData;
    this.rngSystem = createRNGFromBlock(blockData);

    // Initialize dependencies
    await this.initializeDependencies(blockData);

    this.selectedAbilities.clear();
    this.initialized = true;

    console.log('Ability service initialized with block data:', blockData);
  }

  /**
   * Initialize all required dependencies
   * @param blockData The block data to use for initialization
   */
  private async initializeDependencies(blockData: BlockData): Promise<void> {
    try {
      // Load ability bank
      const abilityBankLoader = getAbilityBankLoader();

      // Initialize the ability bank loader if not already initialized
      if (!abilityBankLoader.isInitialized()) {
        abilityBankLoader.initialize(blockData);
      }

      // Initialize ability factory
      const abilityFactory = getAbilityFactory();
      if (!abilityFactory.isInitialized()) {
        abilityFactory.initialize(blockData);
      }

      // Try to load ability bank from files first, fall back to mock data if needed
      try {
        this.abilityBank = await abilityBankLoader.loadFromFiles('src/data');
        console.log('Loaded ability bank from files');
      } catch (error) {
        console.error('Error loading ability bank from files:', error);
        this.abilityBank = abilityBankLoader.createMockAbilityBank();
        console.log('Using mock ability bank');
      }

      // Mark dependencies as initialized
      this.dependenciesInitialized = true;

      console.log('Ability service dependencies initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ability service dependencies:', error);
      this.dependenciesInitialized = false;
      const initError = new Error('Failed to initialize ability service dependencies');
      initError.name = AbilityServiceErrorType.DEPENDENCY_FAILED;
      throw initError;
    }
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized && this.dependenciesInitialized;
  }

  /**
   * Select abilities for a particle group
   * @param groupId The ID of the particle group
   * @param role The role of the particle group
   * @param tier The tier of the particle group
   * @param subclass Optional subclass to filter abilities by
   * @returns The selected abilities
   */
  public selectAbilitiesForGroup(
    groupId: string,
    role: Role,
    tier: Tier,
    subclass?: string
  ): {
    primary: Ability;
    secondary: Ability;
    unique: Ability;
    crowdControl: Ability;
    formationTrait: FormationTrait;
  } {
    if (!this.isInitialized()) {
      const error = new Error('Ability service not initialized');
      error.name = AbilityServiceErrorType.NOT_INITIALIZED;
      throw error;
    }

    // Check if we already have abilities for this group with this subclass
    const cacheKey = subclass ? `${groupId}_${subclass}` : groupId;
    if (this.selectedAbilities.has(cacheKey)) {
      return this.selectedAbilities.get(cacheKey)!;
    }

    // For higher tiers (TIER_3+), we use the ability factory's deterministic selection
    // which handles subclass-specific ability selection
    if (tier >= Tier.TIER_3) {
      if (!subclass) {
        console.warn(`Missing subclass for tier ${tier} particle group ${groupId}. Using default subclass.`);
        // Derive a default subclass based on role
        subclass = this.getDefaultSubclassForRole(role);
      }

      // Use ability factory for deterministic selection
      const abilityFactory = getAbilityFactory();
      const abilities = abilityFactory.createAbilities(role, tier, subclass);

      // Store the selected abilities
      this.selectedAbilities.set(cacheKey, abilities);
      return abilities;
    }

    // For lower tiers (TIER_1, TIER_2), use the ability pools
    return this.selectAbilitiesFromPool(groupId, role, tier, subclass);
  }

  /**
   * Select abilities from the ability pool
   * @param groupId The ID of the particle group
   * @param role The role of the particle group
   * @param tier The tier of the particle group
   * @param subclass Optional subclass to filter abilities by
   * @returns The selected abilities
   */
  private selectAbilitiesFromPool(
    groupId: string,
    role: Role,
    tier: Tier,
    subclass?: string
  ): {
    primary: Ability;
    secondary: Ability;
    unique: Ability;
    crowdControl: Ability;
    formationTrait: FormationTrait;
  } {
    if (!this.rngSystem || !this.abilityBank) {
      const error = new Error('Ability service not properly initialized');
      error.name = AbilityServiceErrorType.NOT_INITIALIZED;
      throw error;
    }

    // Get the ability pool for this role and tier
    const abilityPool = this.getAbilityPool(role, tier);
    if (!abilityPool) {
      const error = new Error(`No ability pool found for ${role}, tier ${tier}`);
      error.name = AbilityServiceErrorType.NO_ABILITIES;
      throw error;
    }

    // Create category-specific RNG streams for better randomness
    const primaryStream = this.rngSystem.createStream(`${groupId}_primary_ability` as any);
    const secondaryStream = this.rngSystem.createStream(`${groupId}_secondary_ability` as any);
    const uniqueStream = this.rngSystem.createStream(`${groupId}_unique_ability` as any);
    const crowdControlStream = this.rngSystem.createStream(`${groupId}_crowd_control_ability` as any);
    const formationTraitStream = this.rngSystem.createStream(`${groupId}_formation_trait` as any);

    // Filter abilities by subclass if provided
    const filteredPrimary = subclass
      ? abilityPool.primary.filter(a => !a.subclass || a.subclass === subclass)
      : abilityPool.primary;

    const filteredSecondary = subclass
      ? abilityPool.secondary.filter(a => !a.subclass || a.subclass === subclass)
      : abilityPool.secondary;

    const filteredUnique = subclass
      ? abilityPool.unique.filter(a => !a.subclass || a.subclass === subclass)
      : abilityPool.unique;

    const filteredCrowdControl = subclass
      ? abilityPool.crowdControl.filter(a => !a.subclass || a.subclass === subclass)
      : abilityPool.crowdControl;

    const filteredFormationTraits = subclass
      ? abilityPool.formationTraits.filter(ft => !ft.subclass || ft.subclass === subclass)
      : abilityPool.formationTraits;

    // Validate filtered abilities
    this.validateFilteredAbilities(filteredPrimary, filteredSecondary, filteredUnique,
                                  filteredCrowdControl, filteredFormationTraits, role, tier, subclass);

    // Select one ability from each category
    const primary = this.selectRandomAbility(filteredPrimary, primaryStream);
    const secondary = this.selectRandomAbility(filteredSecondary, secondaryStream);
    const unique = this.selectRandomAbility(filteredUnique, uniqueStream);
    const crowdControl = this.selectRandomAbility(filteredCrowdControl, crowdControlStream);
    const formationTrait = this.selectRandomFormationTrait(filteredFormationTraits, formationTraitStream);

    // Store the selected abilities
    const selectedAbilities = {
      primary,
      secondary,
      unique,
      crowdControl,
      formationTrait
    };

    const cacheKey = subclass ? `${groupId}_${subclass}` : groupId;
    this.selectedAbilities.set(cacheKey, selectedAbilities);
    return selectedAbilities;
  }

  /**
   * Validate that filtered ability arrays have at least one item
   * @param primary Primary abilities
   * @param secondary Secondary abilities
   * @param unique Unique abilities
   * @param crowdControl Crowd control abilities
   * @param formationTraits Formation traits
   * @param role The role
   * @param tier The tier
   * @param subclass The subclass used for filtering
   */
  private validateFilteredAbilities(
    primary: Ability[],
    secondary: Ability[],
    unique: Ability[],
    crowdControl: Ability[],
    formationTraits: FormationTrait[],
    role: Role,
    tier: Tier,
    subclass?: string
  ): void {
    if (primary.length === 0) {
      const error = new Error(`No primary abilities match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityServiceErrorType.NO_ABILITIES;
      throw error;
    }

    if (secondary.length === 0) {
      const error = new Error(`No secondary abilities match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityServiceErrorType.NO_ABILITIES;
      throw error;
    }

    if (unique.length === 0) {
      const error = new Error(`No unique abilities match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityServiceErrorType.NO_ABILITIES;
      throw error;
    }

    if (crowdControl.length === 0) {
      const error = new Error(`No crowd control abilities match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityServiceErrorType.NO_ABILITIES;
      throw error;
    }

    if (formationTraits.length === 0) {
      const error = new Error(`No formation traits match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityServiceErrorType.NO_ABILITIES;
      throw error;
    }
  }

  /**
   * Get the ability pool for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns The ability pool
   */
  private getAbilityPool(role: Role, tier: Tier): AbilityPool | null {
    if (!this.abilityBank) {
      return null;
    }

    return this.abilityBank[role]?.[tier] || null;
  }

  /**
   * Select a random ability from a list
   * @param abilities The list of abilities
   * @param rngStream The RNG stream to use
   * @returns A randomly selected ability
   */
  private selectRandomAbility(abilities: Ability[], rngStream: RNGStream): Ability {
    if (abilities.length === 0) {
      throw new Error('No abilities to select from');
    }

    const index = Math.floor(rngStream.next() * abilities.length);
    return abilities[index];
  }

  /**
   * Select a random formation trait from a list
   * @param formationTraits The list of formation traits
   * @param rngStream The RNG stream to use
   * @returns A randomly selected formation trait
   */
  private selectRandomFormationTrait(formationTraits: FormationTrait[], rngStream: RNGStream): FormationTrait {
    if (formationTraits.length === 0) {
      throw new Error('No formation traits to select from');
    }

    const index = Math.floor(rngStream.next() * formationTraits.length);
    return formationTraits[index];
  }

  /**
   * Get the default subclass for a role
   * @param role The role
   * @returns A default subclass name
   */
  private getDefaultSubclassForRole(role: Role): string {
    switch (role) {
      case Role.CORE:
        return 'Sustainer';
      case Role.ATTACK:
        return 'Berserker';
      case Role.DEFENSE:
        return 'Guardian';
      case Role.CONTROL:
        return 'Commander';
      case Role.MOVEMENT:
        return 'Scout';
      default:
        return 'Generic';
    }
  }

  /**
   * Get all abilities for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns All abilities for the role and tier
   */
  public getAllAbilitiesForRoleTier(role: Role, tier: Tier): AbilityPool | null {
    if (!this.isInitialized()) {
      const error = new Error('Ability service not initialized');
      error.name = AbilityServiceErrorType.NOT_INITIALIZED;
      throw error;
    }

    return this.getAbilityPool(role, tier);
  }

  /**
   * Get ability by ID
   * @param abilityId The ability ID
   * @param role The role
   * @param tier The tier
   * @returns The ability with the specified ID, or null if not found
   */
  public getAbilityById(abilityId: string, role: Role, tier: Tier): Ability | null {
    if (!this.isInitialized()) {
      const error = new Error('Ability service not initialized');
      error.name = AbilityServiceErrorType.NOT_INITIALIZED;
      throw error;
    }

    const abilityFactory = getAbilityFactory();
    return abilityFactory.createAbilityById(abilityId, role, tier) || null;
  }

  /**
   * Get formation trait by ID
   * @param traitId The formation trait ID
   * @param role The role
   * @param tier The tier
   * @returns The formation trait with the specified ID, or null if not found
   */
  public getFormationTraitById(traitId: string, role: Role, tier: Tier): FormationTrait | null {
    if (!this.isInitialized()) {
      const error = new Error('Ability service not initialized');
      error.name = AbilityServiceErrorType.NOT_INITIALIZED;
      throw error;
    }

    const abilityFactory = getAbilityFactory();
    return abilityFactory.createFormationTraitById(traitId, role, tier) || null;
  }

  /**
   * Clear cached abilities for a group
   * @param groupId The group ID
   */
  public clearAbilitiesForGroup(groupId: string): void {
    // Clear all entries that start with the groupId
    for (const key of this.selectedAbilities.keys()) {
      if (key === groupId || key.startsWith(`${groupId}_`)) {
        this.selectedAbilities.delete(key);
      }
    }
  }

  /**
   * Clear all cached abilities
   */
  public clearAllAbilities(): void {
    this.selectedAbilities.clear();
  }
}

// Singleton instance
let abilityServiceInstance: AbilityService | null = null;

/**
 * Get the ability service instance
 * @returns The ability service instance
 */
export function getAbilityService(): AbilityService {
  if (!abilityServiceInstance) {
    abilityServiceInstance = new AbilityService();
  }
  return abilityServiceInstance;
}

