/**
 * Ability Bank Loader for Bitcoin Protozoa
 *
 * This service is responsible for loading ability data from various sources
 * and creating an ability bank for use by the ability service.
 */

import { Role, Tier } from '../../types/core';
import { Ability, AbilityPool, FormationTrait } from '../../types/abilities/ability';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { RNGSystem } from '../../types/utils/rng';
import { createRNGFromBlock } from '../../lib/rngSystem';

// Define alternative implementation for filesystem operations
// This allows the code to run in both Node.js and browser environments
interface FileSystem {
  readFile(path: string, encoding: string): Promise<string>;
}

// Implement a mock file system for development/testing or when running in browser
class MockFileSystem implements FileSystem {
  async readFile(path: string, encoding: string): Promise<string> {
    console.log(`Mock reading file: ${path}`);
    // In a real implementation, this would be replaced with actual file reading
    // For now, simulate reading by returning mock data
    return JSON.stringify(this.getMockDataForPath(path));
  }

  private getMockDataForPath(path: string): any {
    // Extract role and tier from path
    const pathParts = path.split('/');
    const roleStr = pathParts[pathParts.length - 2];
    const tierStr = pathParts[pathParts.length - 1].replace('.json', '');

    // Convert to enum values
    const role = this.stringToRole(roleStr);
    const tier = this.stringToTier(tierStr);

    // Create basic mock data structure
    return {
      role,
      tier,
      primary: this.createMockAbilities(role, tier, 'primary', 3),
      secondary: this.createMockAbilities(role, tier, 'secondary', 3),
      unique: this.createMockAbilities(role, tier, 'unique', 2),
      crowdControl: this.createMockAbilities(role, tier, 'crowdControl', 2),
      formationTraits: this.createMockFormationTraits(role, tier, 3)
    };
  }

  private createMockAbilities(
    role: Role,
    tier: Tier,
    category: 'primary' | 'secondary' | 'unique' | 'crowdControl',
    count: number
  ): any[] {
    const abilities = [];
    const rolePrefix = role.toString().toLowerCase();

    for (let i = 0; i < count; i++) {
      abilities.push({
        id: `${rolePrefix}_${category}_${i}`,
        name: `${this.capitalize(rolePrefix)} ${this.capitalize(category)} ${i + 1}`,
        description: `A ${category} ability for ${rolePrefix} particles`,
        cooldown: 10 + Math.floor(Math.random() * 20),
        category,
        subclass: i % 2 === 0 ? `${rolePrefix}_sub_1` : `${rolePrefix}_sub_2`,
        energyCost: category === 'primary' ? 5 : category === 'secondary' ? 10 : category === 'unique' ? 15 : 8,
        visualEffect: `${category}_${tier}_effect`,
        soundEffect: `${category}_sound`
      });
    }

    return abilities;
  }

  private createMockFormationTraits(role: Role, tier: Tier, count: number): any[] {
    const traits = [];
    const rolePrefix = role.toString().toLowerCase();

    for (let i = 0; i < count; i++) {
      traits.push({
        id: `${rolePrefix}_formation_${i}`,
        name: `${this.capitalize(rolePrefix)} Formation ${i + 1}`,
        description: `A formation trait for ${rolePrefix} particles`,
        subclass: i % 2 === 0 ? `${rolePrefix}_sub_1` : `${rolePrefix}_sub_2`,
        bonusType: i % 2 === 0 ? 'attack' : 'defense',
        bonusValue: 5 + Math.floor(Math.random() * 10),
        visualEffect: `formation_${tier}_effect`
      });
    }

    return traits;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private stringToRole(roleStr: string): Role {
    const roleLower = roleStr.toLowerCase();
    switch (roleLower) {
      case 'core': return Role.CORE;
      case 'attack': return Role.ATTACK;
      case 'defense': return Role.DEFENSE;
      case 'control': return Role.CONTROL;
      case 'movement': return Role.MOVEMENT;
      default: return Role.CORE;
    }
  }

  private stringToTier(tierStr: string): Tier {
    const tierLower = tierStr.toLowerCase();
    switch (tierLower) {
      case 'tier_1': case 'common': return Tier.TIER_1;
      case 'tier_2': case 'uncommon': return Tier.TIER_2;
      case 'tier_3': case 'rare': return Tier.TIER_3;
      case 'tier_4': case 'epic': return Tier.TIER_4;
      case 'tier_5': case 'legendary': return Tier.TIER_5;
      case 'tier_6': case 'mythic': return Tier.TIER_6;
      default: return Tier.TIER_1;
    }
  }
}

// PathUtil for handling path operations
class PathUtil {
  static join(...paths: string[]): string {
    // Simple path joining implementation
    return paths.join('/').replace(/\/+/g, '/');
  }
}

// Create instances of our utilities
const fileSystem: FileSystem = new MockFileSystem();
const pathUtil = PathUtil;

/**
 * Error types for ability bank loading
 */
export enum AbilityBankErrorType {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_ABILITY_DATA = 'INVALID_ABILITY_DATA',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Ability bank loader class
 */
export class AbilityBankLoader {
  private blockData: BlockData | null = null;
  private rngSystem: RNGSystem | null = null;
  private initialized = false;

  /**
   * Initialize the ability bank loader
   * @param blockData Block data for deterministic bank generation
   */
  public initialize(blockData: BlockData): void {
    if (!blockData || typeof blockData !== 'object') {
      throw new Error('Invalid block data provided to AbilityBankLoader');
    }

    this.blockData = blockData;
    this.rngSystem = createRNGFromBlock(blockData);
    this.initialized = true;
    console.log('Ability Bank Loader initialized with block data:', blockData);
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Load ability data from JSON files
   * @param basePath The base path to the ability data files
   * @returns A promise resolving to an ability bank
   */
  public async loadFromFiles(basePath: string): Promise<Record<string, Record<number, AbilityPool>>> {
    try {
      if (!this.initialized) {
        const error = new Error('Ability Bank Loader not initialized');
        error.name = AbilityBankErrorType.NOT_INITIALIZED;
        throw error;
      }

      // Create empty ability bank
      const abilityBank: Record<string, Record<number, AbilityPool>> = {
        [Role.CORE]: {},
        [Role.ATTACK]: {},
        [Role.DEFENSE]: {},
        [Role.CONTROL]: {},
        [Role.MOVEMENT]: {}
      };

      // Load ability pools for each role and tier
      for (const role of Object.values(Role)) {
        // Only load TIER_1 and TIER_2 tiers from pools
        // Higher tiers use predefined subclasses
        for (const tier of [Tier.TIER_1, Tier.TIER_2]) {
          try {
            // Create an empty ability pool
            const abilityPool: AbilityPool = {
              role: role as Role,
              tier: tier as Tier,
              primary: [],
              secondary: [],
              unique: [],
              crowdControl: [],
              formationTraits: []
            };

            // Load abilities from JSON files
            const abilitiesPath = pathUtil.join(basePath, 'abilities', role.toLowerCase(), `${role.toLowerCase()}_tier${tier.toString().replace('TIER_', '')}_abilities.json`);
            const formationTraitsPath = pathUtil.join(basePath, 'abilities', role.toLowerCase(), `${role.toLowerCase()}_tier${tier.toString().replace('TIER_', '')}_formation_traits.json`);

            try {
              // Load abilities
              const abilitiesData = await fileSystem.readFile(abilitiesPath, 'utf-8');
              const abilities = JSON.parse(abilitiesData) as Ability[];

              // Categorize abilities
              for (const ability of abilities) {
                switch (ability.category) {
                  case 'primary':
                    abilityPool.primary.push(ability);
                    break;
                  case 'secondary':
                    abilityPool.secondary.push(ability);
                    break;
                  case 'unique':
                    abilityPool.unique.push(ability);
                    break;
                  case 'crowdControl':
                    abilityPool.crowdControl.push(ability);
                    break;
                  default:
                    console.warn(`Unknown ability category: ${ability.category}`);
                }
              }

              // Load formation traits
              const formationTraitsData = await fileSystem.readFile(formationTraitsPath, 'utf-8');
              abilityPool.formationTraits = JSON.parse(formationTraitsData) as FormationTrait[];

              // Validate the loaded data
              this.validateAbilityPool(abilityPool, role, tier);

              // Store in the ability bank
              abilityBank[role][tier] = abilityPool;

              console.log(`Successfully loaded ability pool for ${role}, tier ${tier}`);
            } catch (error) {
              if (error instanceof SyntaxError) {
                console.error(`Invalid JSON in ability files for ${role}, tier ${tier}:`, error);
                const jsonError = new Error(`Invalid JSON in ability files for ${role}, tier ${tier}`);
                jsonError.name = AbilityBankErrorType.INVALID_JSON;
                throw jsonError;
              } else if (error.code === 'ENOENT') {
                console.error(`File not found: ${error.path}`);
                const fileError = new Error(`Failed to read ability file for ${role}, tier ${tier}`);
                fileError.name = AbilityBankErrorType.FILE_NOT_FOUND;
                throw fileError;
              } else {
                throw error; // Re-throw other errors
              }
            }
          } catch (error) {
            console.error(`Error loading ability pool for ${role}, tier ${tier}:`, error);

            // In development mode, we can fall back to mock data
            console.warn(`Falling back to mock data for ${role}, tier ${tier}`);
            abilityBank[role][tier] = this.createMockAbilityPool(role, tier);
          }
        }
      }

      return abilityBank;
    } catch (error) {
      console.error('Error loading ability bank:', error);
      throw error;
    }
  }

  /**
   * Validate an ability pool
   * @param pool The ability pool to validate
   * @param role The role for this pool
   * @param tier The tier for this pool
   * @throws Error if the pool is invalid
   */
  private validateAbilityPool(pool: AbilityPool, role: Role, tier: Tier): void {
    // Check if all required arrays exist
    if (!Array.isArray(pool.primary) ||
        !Array.isArray(pool.secondary) ||
        !Array.isArray(pool.unique) ||
        !Array.isArray(pool.crowdControl) ||
        !Array.isArray(pool.formationTraits)) {
      const error = new Error(`Invalid ability pool structure for ${role}, tier ${tier}`);
      error.name = AbilityBankErrorType.INVALID_ABILITY_DATA;
      throw error;
    }

    // Check if arrays have at least one item each
    if (pool.primary.length === 0 ||
        pool.secondary.length === 0 ||
        pool.unique.length === 0 ||
        pool.crowdControl.length === 0 ||
        pool.formationTraits.length === 0) {
      console.warn(`Ability pool for ${role}, tier ${tier} has empty categories`);
    }

    // Ensure all abilities have required fields
    const validateAbility = (ability: Ability): void => {
      if (!ability.name || !ability.description || ability.cooldown === undefined || !ability.category) {
        const error = new Error(`Invalid ability in pool for ${role}, tier ${tier}`);
        error.name = AbilityBankErrorType.INVALID_ABILITY_DATA;
        throw error;
      }

      // Generate IDs for abilities that don't have them
      if (!ability.id) {
        ability.id = this.generateAbilityId(ability.name);
      }
    };

    // Ensure all formation traits have required fields
    const validateFormationTrait = (trait: FormationTrait): void => {
      if (!trait.name || !trait.description) {
        const error = new Error(`Invalid formation trait in pool for ${role}, tier ${tier}`);
        error.name = AbilityBankErrorType.INVALID_ABILITY_DATA;
        throw error;
      }

      // Generate IDs for traits that don't have them
      if (!trait.id) {
        trait.id = this.generateAbilityId(trait.name);
      }
    };

    // Validate each ability
    pool.primary.forEach(validateAbility);
    pool.secondary.forEach(validateAbility);
    pool.unique.forEach(validateAbility);
    pool.crowdControl.forEach(validateAbility);
    pool.formationTraits.forEach(validateFormationTrait);

    // Assign role and tier if not present
    if (!pool.role) {
      pool.role = role;
    }

    if (!pool.tier) {
      pool.tier = tier;
    }
  }

  /**
   * Generate an ID from an ability or trait name
   * @param name The name to generate an ID from
   * @returns A string ID
   */
  private generateAbilityId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Create a mock ability bank for testing
   * @returns An ability bank with mock data
   */
  public createMockAbilityBank(): Record<string, Record<number, AbilityPool>> {
    if (!this.initialized) {
      const error = new Error('Ability Bank Loader not initialized');
      error.name = AbilityBankErrorType.NOT_INITIALIZED;
      throw error;
    }

    // Create empty ability bank
    const abilityBank: Record<string, Record<number, AbilityPool>> = {
      [Role.CORE]: {},
      [Role.ATTACK]: {},
      [Role.DEFENSE]: {},
      [Role.CONTROL]: {},
      [Role.MOVEMENT]: {}
    };

    // Initialize with mock data for each role and tier
    for (const role of Object.values(Role)) {
      // Only create TIER_1 and TIER_2 tiers
      // Higher tiers use predefined subclasses
      for (const tier of [Tier.TIER_1, Tier.TIER_2]) {
        abilityBank[role][tier] = this.createMockAbilityPool(role, tier);
      }
    }

    return abilityBank;
  }

  /**
   * Create a mock ability pool for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns A mock ability pool
   */
  private createMockAbilityPool(role: Role, tier: Tier): AbilityPool {
    // Create mock abilities based on role and tier
    const primary: Ability[] = [];
    const secondary: Ability[] = [];
    const unique: Ability[] = [];
    const crowdControl: Ability[] = [];
    const formationTraits: FormationTrait[] = [];

    // Add subclasses based on role
    const subclasses = this.getSubclassesForRole(role);

    // Add mock abilities based on role
    switch (role) {
      case Role.CORE:
        primary.push(
          this.createMockAbility('Healing Pulse', 'Heals nearby allies for 10% of their max health', 'primary', tier, subclasses[0]),
          this.createMockAbility('Energy Transfer', 'Transfers 20% of your energy to an ally', 'primary', tier, subclasses[1])
        );
        secondary.push(
          this.createMockAbility('Stabilize', 'Reduces damage taken by 15% for 5 seconds', 'secondary', tier, subclasses[0]),
          this.createMockAbility('Energize', 'Increases energy regeneration by 20% for 5 seconds', 'secondary', tier, subclasses[1])
        );
        unique.push(
          this.createMockAbility('Core Surge', 'Releases a burst of energy, healing all allies for 5% of their max health', 'unique', tier, subclasses[0]),
          this.createMockAbility('Vital Link', 'Creates a link with an ally, sharing 10% of healing received', 'unique', tier, subclasses[1])
        );
        crowdControl.push(
          this.createMockAbility('Stasis Field', 'Creates a field that slows enemies by 20% for 3 seconds', 'crowdControl', tier, subclasses[0]),
          this.createMockAbility('Repulsion Wave', 'Pushes enemies away from you', 'crowdControl', tier, subclasses[1])
        );
        formationTraits.push(
          this.createMockFormationTrait('Core Resonance', 'Increases healing done by 10%', tier, subclasses[0]),
          this.createMockFormationTrait('Energy Flow', 'Increases energy regeneration by 10%', tier, subclasses[1])
        );
        break;

      case Role.ATTACK:
        primary.push(
          this.createMockAbility('Quick Strike', 'Deals 15% max HP damage to one enemy', 'primary', tier, subclasses[0]),
          this.createMockAbility('Heavy Strike', 'Deals 20% max HP damage to one enemy', 'primary', tier, subclasses[1])
        );
        secondary.push(
          this.createMockAbility('Expose Weakness', 'Increases damage dealt to target by 10% for 5 seconds', 'secondary', tier, subclasses[0]),
          this.createMockAbility('Sharpen Blades', 'Increases critical strike chance by 10% for 5 seconds', 'secondary', tier, subclasses[1])
        );
        unique.push(
          this.createMockAbility('Frenzy', 'Increases attack speed by 20% for 5 seconds', 'unique', tier, subclasses[0]),
          this.createMockAbility('Execute', 'Deals 30% max HP damage to enemies below 20% health', 'unique', tier, subclasses[1])
        );
        crowdControl.push(
          this.createMockAbility('Stun', 'Stuns target for 2 seconds', 'crowdControl', tier, subclasses[0]),
          this.createMockAbility('Knockback', 'Knocks target back 5 units', 'crowdControl', tier, subclasses[1])
        );
        formationTraits.push(
          this.createMockFormationTrait('Aggressive Stance', 'Increases damage output by 10%', tier, subclasses[0]),
          this.createMockFormationTrait('Blade Formation', 'Increases critical strike damage by 20%', tier, subclasses[1])
        );
        break;

      case Role.DEFENSE:
        primary.push(
          this.createMockAbility('Shield Wall', 'Reduces damage taken by 30% for 5 seconds', 'primary', tier, subclasses[0]),
          this.createMockAbility('Reactive Armor', 'Reflects 15% of damage back to attacker', 'primary', tier, subclasses[1])
        );
        secondary.push(
          this.createMockAbility('Fortify', 'Increases max health by 20% for 8 seconds', 'secondary', tier, subclasses[0]),
          this.createMockAbility('Absorb Damage', 'Converts 10% of damage taken to energy', 'secondary', tier, subclasses[1])
        );
        unique.push(
          this.createMockAbility('Invulnerability', 'Prevents all damage for 2 seconds', 'unique', tier, subclasses[0]),
          this.createMockAbility('Regenerate', 'Heals 5% of max health per second for 5 seconds', 'unique', tier, subclasses[1])
        );
        crowdControl.push(
          this.createMockAbility('Taunt', 'Forces enemies to attack you for 3 seconds', 'crowdControl', tier, subclasses[0]),
          this.createMockAbility('Barrier', 'Creates a barrier that blocks projectiles for 3 seconds', 'crowdControl', tier, subclasses[1])
        );
        formationTraits.push(
          this.createMockFormationTrait('Defensive Formation', 'Reduces damage taken by 10%', tier, subclasses[0]),
          this.createMockFormationTrait('Shield Wall', 'Creates a barrier around the formation', tier, subclasses[1])
        );
        break;

      case Role.CONTROL:
        primary.push(
          this.createMockAbility('Mind Control', 'Takes control of an enemy for 3 seconds', 'primary', tier, subclasses[0]),
          this.createMockAbility('Confusion', 'Causes the target to attack random targets for 4 seconds', 'primary', tier, subclasses[1])
        );
        secondary.push(
          this.createMockAbility('Amplify', 'Increases ability effectiveness by 25% for 5 seconds', 'secondary', tier, subclasses[0]),
          this.createMockAbility('Energy Drain', 'Steals 15% of target\'s energy', 'secondary', tier, subclasses[1])
        );
        unique.push(
          this.createMockAbility('Mass Disable', 'Disables all enemies in an area for 2 seconds', 'unique', tier, subclasses[0]),
          this.createMockAbility('Command', 'Orders all allies to focus fire on a target', 'unique', tier, subclasses[1])
        );
        crowdControl.push(
          this.createMockAbility('Root', 'Prevents target from moving for 3 seconds', 'crowdControl', tier, subclasses[0]),
          this.createMockAbility('Silence', 'Prevents target from using abilities for 3 seconds', 'crowdControl', tier, subclasses[1])
        );
        formationTraits.push(
          this.createMockFormationTrait('Mind Link', 'Reduces cooldowns by 15%', tier, subclasses[0]),
          this.createMockFormationTrait('Coordinated Assault', 'Increases damage to controlled targets by 20%', tier, subclasses[1])
        );
        break;

      case Role.MOVEMENT:
        primary.push(
          this.createMockAbility('Dash', 'Quickly moves in a direction', 'primary', tier, subclasses[0]),
          this.createMockAbility('Teleport', 'Instantly teleports to a location', 'primary', tier, subclasses[1])
        );
        secondary.push(
          this.createMockAbility('Speed Boost', 'Increases movement speed by 30% for 5 seconds', 'secondary', tier, subclasses[0]),
          this.createMockAbility('Ghost', 'Allows movement through obstacles for 3 seconds', 'secondary', tier, subclasses[1])
        );
        unique.push(
          this.createMockAbility('Blink', 'Teleport and deal damage in an area', 'unique', tier, subclasses[0]),
          this.createMockAbility('Time Warp', 'Rewind position to 3 seconds ago and heal 10% health', 'unique', tier, subclasses[1])
        );
        crowdControl.push(
          this.createMockAbility('Vacuum', 'Pulls all enemies towards you', 'crowdControl', tier, subclasses[0]),
          this.createMockAbility('Wormhole', 'Creates a portal that teleports enemies to a random location', 'crowdControl', tier, subclasses[1])
        );
        formationTraits.push(
          this.createMockFormationTrait('Swift Movement', 'Increases movement speed by 15%', tier, subclasses[0]),
          this.createMockFormationTrait('Phase Shift', 'Allows formation to move through obstacles', tier, subclasses[1])
        );
        break;

      default:
        break;
    }

    return {
      tier,
      role,
      primary,
      secondary,
      unique,
      crowdControl,
      formationTraits
    };
  }

  /**
   * Get subclasses for a given role
   * @param role The role
   * @returns Array of subclass names
   */
  private getSubclassesForRole(role: Role): string[] {
    switch (role) {
      case Role.CORE:
        return ['Sustainer', 'Energizer'];
      case Role.ATTACK:
        return ['Berserker', 'Assassin'];
      case Role.DEFENSE:
        return ['Guardian', 'Sentinel'];
      case Role.CONTROL:
        return ['Commander', 'Disruptor'];
      case Role.MOVEMENT:
        return ['Scout', 'Phaser'];
      default:
        return ['Generic'];
    }
  }

  /**
   * Create a mock ability
   * @param name The ability name
   * @param description The ability description
   * @param category The ability category
   * @param tier The tier of the ability
   * @param subclass Optional subclass for the ability
   * @returns A mock ability
   */
  private createMockAbility(
    name: string,
    description: string,
    category: 'primary' | 'secondary' | 'unique' | 'crowdControl',
    tier: Tier,
    subclass?: string
  ): Ability {
    // Generate a consistent ID based on name
    const id = name.toLowerCase().replace(/\s+/g, '_');

    // Return a mock ability with consistent properties
    return {
      id,
      name,
      description,
      cooldown: 10 + Math.floor(Math.random() * 20), // Random cooldown between 10-30
      category,
      subclass, // Add subclass if provided
      energyCost: category === 'primary' ? 5 : category === 'secondary' ? 10 : category === 'unique' ? 15 : 8,
      damage: category === 'primary' || category === 'unique' ? 10 + Math.floor(Math.random() * 20) : undefined,
      healing: category === 'primary' && Math.random() > 0.5 ? 10 + Math.floor(Math.random() * 15) : undefined,
      duration: ['secondary', 'crowdControl'].includes(category) ? 3 + Math.floor(Math.random() * 5) : undefined,
      range: 5 + Math.floor(Math.random() * 10),
      area: category === 'crowdControl' ? 3 + Math.floor(Math.random() * 5) : undefined,
      visualEffect: `${category}_${tier}_effect`,
      soundEffect: `${category}_sound`
    };
  }

  /**
   * Create a mock formation trait
   * @param name The formation trait name
   * @param description The formation trait description
   * @param tier The tier of the formation trait
   * @param subclass Optional subclass for the formation trait
   * @returns A mock formation trait
   */
  private createMockFormationTrait(
    name: string,
    description: string,
    tier: Tier,
    subclass?: string
  ): FormationTrait {
    // Generate a consistent ID based on name
    const id = name.toLowerCase().replace(/\s+/g, '_');

    // Return a mock formation trait with consistent properties
    return {
      id,
      name,
      description,
      subclass, // Add subclass if provided
      bonusType: name.split(' ')[0].toLowerCase(),
      bonusValue: 5 + Math.floor(Math.random() * 10),
      visualEffect: `formation_${tier}_effect`
    };
  }
}

// Singleton instance
let abilityBankLoaderInstance: AbilityBankLoader | null = null;

/**
 * Get the ability bank loader instance
 * @returns The ability bank loader instance
 */
export function getAbilityBankLoader(): AbilityBankLoader {
  if (!abilityBankLoaderInstance) {
    abilityBankLoaderInstance = new AbilityBankLoader();
  }
  return abilityBankLoaderInstance;
}

