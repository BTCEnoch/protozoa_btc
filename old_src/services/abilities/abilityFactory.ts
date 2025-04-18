/**
 * Ability Factory for Bitcoin Protozoa
 *
 * This factory is responsible for creating abilities for particle groups.
 * It handles deterministic ability creation for tier 3+ abilities based on subclass.
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import { Role, Tier } from '../../types/core';
import { Ability, FormationTrait } from '../../types/abilities/ability';
import { RNGSystem, RNGStream } from '../../types/utils/rng';
import { createRNGFromBlock } from '../../lib/rngSystem';
import { AbilityReference } from '../../types/abilities/index';

/**
 * Subclass mapping for deterministic ability selection
 * Each subclass maps to a collection of preferred abilities
 */
interface SubclassAbilityMapping {
  primary: string[];
  secondary: string[];
  unique: string[];
  crowdControl: string[];
  formationTraits: string[];
}

/**
 * Error types for ability factory operations
 */
export enum AbilityFactoryErrorType {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  NO_ABILITIES_AVAILABLE = 'NO_ABILITIES_AVAILABLE',
  INVALID_SUBCLASS = 'INVALID_SUBCLASS',
  UNKNOWN = 'UNKNOWN',
  INVALID_TEMPLATE = 'INVALID_TEMPLATE',
  SUBCLASS_REQUIRED = 'SUBCLASS_REQUIRED',
  ABILITY_NOT_FOUND = 'ABILITY_NOT_FOUND'
}

/**
 * Ability Factory class
 * Creates abilities for particles based on their role and tier
 */
class AbilityFactory {
  private rngSystem: RNGSystem | null = null;
  private blockData: BlockData | null = null;
  private initialized = false;
  // Cache for subclass mappings
  private subclassMappings: Map<string, SubclassAbilityMapping> = new Map();
  
  // Template caches
  private cachedAbilityTemplates: Record<string, any> = {};
  private cachedFormationTraitTemplates: Record<string, any> = {};

  /**
   * Initialize the ability factory
   * @param blockData Block data for deterministic ability selection
   */
  public initialize(blockData: BlockData): void {
    if (!blockData || typeof blockData !== 'object') {
      throw new Error('Invalid block data provided to AbilityFactory');
    }
  
    this.blockData = blockData;
    this.rngSystem = createRNGFromBlock(blockData);
    this.subclassMappings.clear();
    this.initialized = true;
    
    // Preload and cache the templates
    this.preloadTemplates();
    
    console.log('Ability Factory initialized');
  }

  /**
   * Preload ability and formation trait templates
   */
  private preloadTemplates(): void {
    try {
      // In a real implementation, we would use the actual templates
      // For now, let's create mock templates that match our interface
      this.cachedAbilityTemplates = this.createMockAbilityTemplates();
      this.cachedFormationTraitTemplates = this.createMockFormationTraitTemplates();
      console.log('Templates preloaded successfully');
    } catch (error) {
      console.error('Failed to preload templates:', error);
      throw error;
    }
  }
  
  /**
   * Create mock ability templates
   * @returns A record of ability templates
   */
  private createMockAbilityTemplates(): Record<string, any> {
    // These would typically come from imported template files
    // This is a placeholder implementation
    const templates: Record<string, any> = {};
    
    // Add mock templates for each role, tier, and subclass
    for (const role of Object.values(Role)) {
      for (const tier of [Tier.TIER_3, Tier.TIER_4, Tier.TIER_5, Tier.TIER_6]) {
        // For each role, create subclasses
        const subclasses = this.getSubclassesForRole(role);
        
        for (const subclass of subclasses) {
          // For each subclass, create templates for each category
          for (const category of ['primary', 'secondary', 'unique', 'crowdControl']) {
            const key = `${role}_${tier}_${subclass}_${category}`;
            templates[key] = [
              this.createMockAbility(role, tier, category, subclass)
            ];
          }
          
          // Also create a formation trait template
          const formationKey = `${role}_${tier}_${subclass}_formationTrait`;
          templates[formationKey] = [
            this.createMockFormationTrait(role, tier, subclass)
          ];
        }
        
        // Also create generic templates
        for (const category of ['primary', 'secondary', 'unique', 'crowdControl']) {
          const key = `${role}_${tier}_generic_${category}`;
          templates[key] = [
            this.createMockAbility(role, tier, category)
          ];
        }
        
        // And generic formation trait
        const formationKey = `${role}_${tier}_generic_formationTrait`;
        templates[formationKey] = [
          this.createMockFormationTrait(role, tier)
        ];
      }
    }
    
    return templates;
  }
  
  /**
   * Create mock formation trait templates
   * @returns A record of formation trait templates
   */
  private createMockFormationTraitTemplates(): Record<string, any> {
    // These would typically come from imported template files
    // This is a placeholder implementation
    const templates: Record<string, any> = {};
    
    // Add mock templates for each role, tier, and subclass
    for (const role of Object.values(Role)) {
      for (const tier of [Tier.TIER_3, Tier.TIER_4, Tier.TIER_5, Tier.TIER_6]) {
        // For each role, create subclasses
        const subclasses = this.getSubclassesForRole(role);
        
        for (const subclass of subclasses) {
          // Create a formation trait template for each subclass
          const key = `${role}_${tier}_${subclass}_formationTrait`;
          templates[key] = [
            this.createMockFormationTrait(role, tier, subclass)
          ];
        }
        
        // Also create generic templates
        const genericKey = `${role}_${tier}_generic_formationTrait`;
        templates[genericKey] = [
          this.createMockFormationTrait(role, tier)
        ];
      }
    }
    
    return templates;
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
   * @param role The role
   * @param tier The tier
   * @param category The category
   * @param subclass Optional subclass
   * @returns A mock ability
   */
  private createMockAbility(
    role: Role,
    tier: Tier,
    category: string,
    subclass?: string
  ): Ability {
    const id = `${role.toLowerCase()}_${category.toLowerCase()}_${subclass?.toLowerCase() || 'generic'}`;
    const name = `${this.capitalize(role.toString())} ${this.capitalize(category)} ${subclass || ''}`;
    
    return {
      id,
      name,
      description: `A ${category} ability for ${role.toString().toLowerCase()} particles`,
      cooldown: 10 + Math.floor(Math.random() * 20),
      category: category as any,
      subclass,
      tier,
      energyCost: category === 'primary' ? 5 : category === 'secondary' ? 10 : category === 'unique' ? 15 : 8,
      damage: ['primary', 'unique'].includes(category) ? 10 + Math.floor(Math.random() * 20) : undefined,
      heal: role === Role.CORE ? 10 + Math.floor(Math.random() * 15) : undefined,
      duration: ['secondary', 'crowdControl'].includes(category) ? 3 + Math.floor(Math.random() * 5) : undefined,
      range: 5 + Math.floor(Math.random() * 10),
      area: category === 'crowdControl' ? 3 + Math.floor(Math.random() * 5) : undefined,
      visualEffect: `${category}_${tier}_effect`,
      soundEffect: `${category}_sound`,
      hasCriticalEffect: tier >= Tier.TIER_4,
      hasChainEffect: tier >= Tier.TIER_5,
      hasLegendaryEffect: tier >= Tier.TIER_6
    };
  }
  
  /**
   * Create a mock formation trait
   * @param role The role
   * @param tier The tier
   * @param subclass Optional subclass
   * @returns A mock formation trait
   */
  private createMockFormationTrait(
    role: Role,
    tier: Tier,
    subclass?: string
  ): FormationTrait {
    const id = `${role.toLowerCase()}_formation_${subclass?.toLowerCase() || 'generic'}`;
    const name = `${this.capitalize(role.toString())} Formation ${subclass || ''}`;
    
    return {
      id,
      name,
      description: `A formation trait for ${role.toString().toLowerCase()} particles`,
      subclass,
      tier,
      bonusType: role.toString().toLowerCase(),
      bonusValue: 10 + Math.floor(Math.random() * 15),
      bonus: 10 + Math.floor(Math.random() * 15),
      visualEffect: `formation_${tier}_effect`,
      hasAdvancedEffect: tier >= Tier.TIER_4,
      hasSynergyEffect: tier >= Tier.TIER_5,
      hasMythicEffect: tier >= Tier.TIER_6
    };
  }
  
  /**
   * Capitalize a string
   * @param str The string to capitalize
   * @returns The capitalized string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Check if the factory is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized && !!this.rngSystem;
  }

  /**
   * Create abilities for a particle
   * @param role Particle role
   * @param tier Particle tier
   * @param subclass Optional subclass name for higher tier particles
   * @returns Object containing the particle's abilities
   */
  public createAbilities(
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
      const error = new Error('Ability Factory not initialized');
      error.name = AbilityFactoryErrorType.NOT_INITIALIZED;
      throw error;
    }

    // For tier 3+, subclass is required for deterministic ability selection
    if (tier >= Tier.TIER_3 && !subclass) {
      const error = new Error(`Subclass is required for tier ${tier} abilities`);
      error.name = AbilityFactoryErrorType.SUBCLASS_REQUIRED;
      throw error;
    }

    // For higher tiers (Rare+), we use subclass to determine abilities deterministically
    if (tier >= Tier.TIER_3 && subclass) {
      try {
        return this.createDeterministicAbilities(role, tier, subclass);
      } catch (error) {
        console.error(`Error creating deterministic abilities: ${error}`);
        console.warn('Falling back to random ability selection');
        // Fall back to random selection if deterministic fails
      }
    }

    // For lower tiers or fallback, select randomly with category-specific streams
    return this.createRandomAbilities(role, tier, subclass);
  }
  
  /**
   * Create abilities deterministically based on subclass
   * @param role The particle role
   * @param tier The particle tier
   * @param subclass The subclass for deterministic selection
   * @returns Selected abilities
   */
  private createDeterministicAbilities(
    role: Role,
    tier: Tier,
    subclass: string
  ): {
    primary: Ability;
    secondary: Ability;
    unique: Ability;
    crowdControl: Ability;
    formationTrait: FormationTrait;
  } {
    if (!this.rngSystem) {
      const error = new Error('RNG system not initialized');
      error.name = AbilityFactoryErrorType.NOT_INITIALIZED;
      throw error;
    }
    
    // First, check if we already have a mapping for this subclass
    let mapping = this.getOrCreateSubclassMapping(role, tier, subclass);
    
    // Now select abilities based on the mapping
    const primary = this.selectByPreferenceOrDeterministic(
      AbilityReference.getAbilityPool(role, tier).primary, 
      mapping.primary, 
      `${subclass}_primary`,
      0
    );
    
    const secondary = this.selectByPreferenceOrDeterministic(
      AbilityReference.getAbilityPool(role, tier).secondary, 
      mapping.secondary, 
      `${subclass}_secondary`,
      1
    );
    
    const unique = this.selectByPreferenceOrDeterministic(
      AbilityReference.getAbilityPool(role, tier).unique, 
      mapping.unique, 
      `${subclass}_unique`,
      2
    );
    
    const crowdControl = this.selectByPreferenceOrDeterministic(
      AbilityReference.getAbilityPool(role, tier).crowdControl, 
      mapping.crowdControl, 
      `${subclass}_crowd_control`,
      3
    );
    
    const formationTrait = this.selectFormationTraitByPreferenceOrDeterministic(
      AbilityReference.getAbilityPool(role, tier).formationTraits, 
      mapping.formationTraits, 
      `${subclass}_formation`,
      4
    );
    
    return {
      primary,
      secondary,
      unique,
      crowdControl,
      formationTrait
    };
  }
  
  /**
   * Get an existing subclass mapping or create a new one
   * @param role The role
   * @param tier The tier
   * @param subclass The subclass
   * @returns A mapping of ability preferences for this subclass
   */
  private getOrCreateSubclassMapping(role: Role, tier: Tier, subclass: string): SubclassAbilityMapping {
    const key = `${role}_${tier}_${subclass}`;
    
    // Return existing mapping if we have one
    if (this.subclassMappings.has(key)) {
      return this.subclassMappings.get(key)!;
    }
    
    // Otherwise, create a new mapping based on the subclass and role
    const mapping: SubclassAbilityMapping = {
      primary: [],
      secondary: [],
      unique: [],
      crowdControl: [],
      formationTraits: []
    };
    
    // For different roles and subclasses, we'd have different preferences
    // This is a simplified example that could be expanded
    if (role === Role.ATTACK) {
      if (subclass.toLowerCase().includes('berserker')) {
        mapping.primary.push('heavy_strike', 'quick_strike', 'cleave');
        mapping.secondary.push('sharpen_blades', 'bloodlust');
        mapping.unique.push('frenzy', 'execute');
      } else if (subclass.toLowerCase().includes('assassin')) {
        mapping.primary.push('backstab', 'poison_strike', 'quick_strike');
        mapping.secondary.push('expose_weakness', 'stealth');
        mapping.unique.push('execute', 'shadow_step');
      }
    } else if (role === Role.DEFENSE) {
      if (subclass.toLowerCase().includes('guardian')) {
        mapping.primary.push('shield_wall', 'taunt', 'block');
        mapping.secondary.push('fortify', 'shield_bash');
        mapping.unique.push('unbreakable', 'guardian_aura');
      }
    }
    // Add similar mappings for other roles and subclasses
    
    // Store in cache for future use
    this.subclassMappings.set(key, mapping);
    return mapping;
  }
  
  /**
   * Select an ability based on preferences or deterministically if no match
   * @param abilities Available abilities
   * @param preferences Preferred ability IDs
   * @param seedBase Base seed for deterministic selection
   * @param offset Offset for deterministic selection
   * @returns Selected ability
   */
  private selectByPreferenceOrDeterministic(
    abilities: Ability[],
    preferences: string[],
    seedBase: string,
    offset: number
  ): Ability {
    // First try to find an ability that matches our preferences
    for (const prefId of preferences) {
      const matchingAbility = abilities.find(a => a.id === prefId);
      if (matchingAbility) {
        return matchingAbility;
      }
    }
    
    // If no preferences match, use deterministic selection based on a seeded RNG
    if (!this.rngSystem) {
      throw new Error('RNG system not initialized');
    }
    
    // Use the rngSystem to create a stream specifically for this selection
    const streamName = `ability_selection_${seedBase}`;
    // Convert streamName to string to avoid type issues with RNGStreamName
    const stream = this.rngSystem.createStream(streamName as any);
    const seedValue = stream.next();
    const index = Math.floor(seedValue * abilities.length);
    
    return abilities[index];
  }
  
  /**
   * Select a formation trait based on preferences or deterministically if no match
   * @param traits Available formation traits
   * @param preferences Preferred trait IDs
   * @param seedBase Base seed for deterministic selection
   * @param offset Offset for deterministic selection
   * @returns Selected formation trait
   */
  private selectFormationTraitByPreferenceOrDeterministic(
    traits: FormationTrait[],
    preferences: string[],
    seedBase: string,
    offset: number
  ): FormationTrait {
    // First try to find a trait that matches our preferences
    for (const prefId of preferences) {
      const matchingTrait = traits.find(t => t.id === prefId);
      if (matchingTrait) {
        return matchingTrait;
      }
    }
    
    // If no preferences match, use deterministic selection based on a seeded RNG
    if (!this.rngSystem) {
      throw new Error('RNG system not initialized');
    }
    
    // Use the rngSystem to create a stream specifically for this selection
    const streamName = `trait_selection_${seedBase}`;
    // Convert streamName to string to avoid type issues with RNGStreamName
    const stream = this.rngSystem.createStream(streamName as any);
    const seedValue = stream.next();
    const index = Math.floor(seedValue * traits.length);
    
    return traits[index];
  }
  
  /**
   * Create abilities randomly from the ability pool
   * @param role The particle role
   * @param tier The particle tier
   * @param subclass Optional subclass for filtering
   * @returns Selected abilities
   */
  private createRandomAbilities(
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
    if (!this.rngSystem) {
      const error = new Error('RNG system not initialized');
      error.name = AbilityFactoryErrorType.NOT_INITIALIZED;
      throw error;
    }

    // Create category-specific RNG streams for better randomness
    // Using 'as any' to bypass TypeScript's strict RNGStreamName type checking
    const primaryStream = this.rngSystem.createStream(`${role}_primary_ability` as any);
    const secondaryStream = this.rngSystem.createStream(`${role}_secondary_ability` as any);
    const uniqueStream = this.rngSystem.createStream(`${role}_unique_ability` as any);
    const crowdControlStream = this.rngSystem.createStream(`${role}_crowd_control_ability` as any);
    const formationTraitStream = this.rngSystem.createStream(`${role}_formation_trait` as any);
    
    // Filter abilities by subclass if provided
    const filteredPrimary = subclass
      ? AbilityReference.getAbilityPool(role, tier).primary.filter((a: Ability) => !a.subclass || a.subclass === subclass)
      : AbilityReference.getAbilityPool(role, tier).primary;
      
    const filteredSecondary = subclass
      ? AbilityReference.getAbilityPool(role, tier).secondary.filter((a: Ability) => !a.subclass || a.subclass === subclass)
      : AbilityReference.getAbilityPool(role, tier).secondary;
      
    const filteredUnique = subclass
      ? AbilityReference.getAbilityPool(role, tier).unique.filter((a: Ability) => !a.subclass || a.subclass === subclass)
      : AbilityReference.getAbilityPool(role, tier).unique;
      
    const filteredCrowdControl = subclass
      ? AbilityReference.getAbilityPool(role, tier).crowdControl.filter((a: Ability) => !a.subclass || a.subclass === subclass)
      : AbilityReference.getAbilityPool(role, tier).crowdControl;
      
    const filteredFormationTraits = subclass
      ? AbilityReference.getAbilityPool(role, tier).formationTraits.filter((t: FormationTrait) => !t.subclass || t.subclass === subclass)
      : AbilityReference.getAbilityPool(role, tier).formationTraits;
    
    // Check that we have at least one ability in each category after filtering
    this.validateFilteredAbilities(filteredPrimary, filteredSecondary, filteredUnique, 
                                  filteredCrowdControl, filteredFormationTraits, role, tier, subclass);
    
    // Select abilities randomly from each category using dedicated streams
    const primary = this.selectRandomAbility(filteredPrimary, primaryStream);
    const secondary = this.selectRandomAbility(filteredSecondary, secondaryStream);
    const unique = this.selectRandomAbility(filteredUnique, uniqueStream);
    const crowdControl = this.selectRandomAbility(filteredCrowdControl, crowdControlStream);
    const formationTrait = this.selectRandomFormationTrait(filteredFormationTraits, formationTraitStream);

    return {
      primary,
      secondary,
      unique,
      crowdControl,
      formationTrait
    };
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
      error.name = AbilityFactoryErrorType.NO_ABILITIES_AVAILABLE;
      throw error;
    }
    
    if (secondary.length === 0) {
      const error = new Error(`No secondary abilities match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityFactoryErrorType.NO_ABILITIES_AVAILABLE;
      throw error;
    }
    
    if (unique.length === 0) {
      const error = new Error(`No unique abilities match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityFactoryErrorType.NO_ABILITIES_AVAILABLE;
      throw error;
    }
    
    if (crowdControl.length === 0) {
      const error = new Error(`No crowd control abilities match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityFactoryErrorType.NO_ABILITIES_AVAILABLE;
      throw error;
    }
    
    if (formationTraits.length === 0) {
      const error = new Error(`No formation traits match subclass ${subclass} for ${role}, tier ${tier}`);
      error.name = AbilityFactoryErrorType.NO_ABILITIES_AVAILABLE;
      throw error;
    }
  }
  
  /**
   * Validate the ability pool to ensure it has abilities in each category
   * @param abilityPool The ability pool to validate
   * @param role The role 
   * @param tier The tier
   */
  private validateAbilityPool(abilityPool: any, role: Role, tier: Tier): void {
    // Check if any category is missing or empty
    if (!abilityPool.primary || abilityPool.primary.length === 0) {
      throw new Error(`No primary abilities available for ${role}, tier ${tier}`);
    }
    
    if (!abilityPool.secondary || abilityPool.secondary.length === 0) {
      throw new Error(`No secondary abilities available for ${role}, tier ${tier}`);
    }
    
    if (!abilityPool.unique || abilityPool.unique.length === 0) {
      throw new Error(`No unique abilities available for ${role}, tier ${tier}`);
    }
    
    if (!abilityPool.crowdControl || abilityPool.crowdControl.length === 0) {
      throw new Error(`No crowd control abilities available for ${role}, tier ${tier}`);
    }
    
    if (!abilityPool.formationTraits || abilityPool.formationTraits.length === 0) {
      throw new Error(`No formation traits available for ${role}, tier ${tier}`);
    }
  }

  /**
   * Create a specific ability by ID
   * @param abilityId Ability ID
   * @param role Particle role
   * @param tier Particle tier
   * @returns The ability with the specified ID, or undefined if not found
   */
  public createAbilityById(
    abilityId: string,
    role: Role,
    tier: Tier
  ): Ability | undefined {
    if (!this.isInitialized()) {
      const error = new Error('Ability factory not initialized');
      error.name = AbilityFactoryErrorType.NOT_INITIALIZED;
      throw error;
    }
    
    // Search for the ability by ID in the templates
    for (const [key, template] of Object.entries(this.cachedAbilityTemplates)) {
      if (Array.isArray(template)) {
        for (const item of template) {
          if (item.id === abilityId) {
            // Create a copy of the ability and apply tier modifiers
            const ability: Ability = { ...item };
            ability.tier = tier;
            this.applyTierModifiers(ability, tier);
            return ability;
          }
        }
      } else if (template.id === abilityId) {
        // Create a copy of the ability and apply tier modifiers
        const ability: Ability = { ...template };
        ability.tier = tier;
        this.applyTierModifiers(ability, tier);
        return ability;
      }
    }
    
    return undefined;
  }

  /**
   * Create a specific formation trait by ID
   * @param traitId Formation trait ID
   * @param role Particle role
   * @param tier Particle tier
   * @returns The formation trait with the specified ID, or undefined if not found
   */
  public createFormationTraitById(
    traitId: string,
    role: Role,
    tier: Tier
  ): FormationTrait | undefined {
    if (!this.isInitialized()) {
      const error = new Error('Ability factory not initialized');
      error.name = AbilityFactoryErrorType.NOT_INITIALIZED;
      throw error;
    }
    
    // Search for the formation trait by ID in the templates
    for (const [key, template] of Object.entries(this.cachedFormationTraitTemplates)) {
      if (Array.isArray(template)) {
        for (const item of template) {
          if (item.id === traitId) {
            // Create a copy of the formation trait and apply tier modifiers
            const formationTrait: FormationTrait = { ...item };
            formationTrait.tier = tier;
            this.applyTierModifiersToFormationTrait(formationTrait, tier);
            return formationTrait;
          }
        }
      } else if (template.id === traitId) {
        // Create a copy of the formation trait and apply tier modifiers
        const formationTrait: FormationTrait = { ...template };
        formationTrait.tier = tier;
        this.applyTierModifiersToFormationTrait(formationTrait, tier);
        return formationTrait;
      }
    }
    
    return undefined;
  }

  /**
   * Select a random ability from an array of abilities
   * @param abilities Array of abilities to select from
   * @param rngStream RNG stream to use for selection
   * @returns Selected ability
   */
  private selectRandomAbility(abilities: Ability[], rngStream: RNGStream): Ability {
    if (!rngStream || abilities.length === 0) {
      throw new Error('No abilities available or RNG system not initialized');
    }

    const index = Math.floor(rngStream.next() * abilities.length);
    return abilities[index];
  }

  /**
   * Select a random formation trait from an array of formation traits
   * @param formationTraits Array of formation traits to select from
   * @param rngStream RNG stream to use for selection
   * @returns Selected formation trait
   */
  private selectRandomFormationTrait(formationTraits: FormationTrait[], rngStream: RNGStream): FormationTrait {
    if (!rngStream || formationTraits.length === 0) {
      throw new Error('No formation traits available or RNG system not initialized');
    }

    const index = Math.floor(rngStream.next() * formationTraits.length);
    return formationTraits[index];
  }

  /**
   * Apply tier-specific modifiers to an ability
   * @param ability The ability to modify
   * @param tier The tier
   */
  private applyTierModifiers(ability: Ability, tier: Tier): void {
    // Scale values based on tier
    if (ability.damage) {
      ability.damage *= this.getTierMultiplier(tier);
    }
    
    if (ability.heal) {
      ability.heal *= this.getTierMultiplier(tier);
    }
    
    if (ability.duration) {
      ability.duration *= this.getTierMultiplier(tier, 0.8); // Lower multiplier for duration
    }
    
    if (ability.cooldown) {
      ability.cooldown *= this.getTierMultiplier(tier, 0.7); // Lower multiplier for cooldown
    }
    
    // Add tier-specific flags or properties
    if (tier >= Tier.TIER_4) {
      ability.hasCriticalEffect = true;
    }
    
    if (tier >= Tier.TIER_5) {
      ability.hasChainEffect = true;
    }
    
    if (tier >= Tier.TIER_6) {
      ability.hasLegendaryEffect = true;
    }
  }
  
  /**
   * Apply tier-specific modifiers to a formation trait
   * @param formationTrait The formation trait to modify
   * @param tier The tier
   */
  private applyTierModifiersToFormationTrait(formationTrait: FormationTrait, tier: Tier): void {
    // Scale values based on tier
    if (formationTrait.bonus) {
      formationTrait.bonus *= this.getTierMultiplier(tier);
    }
    
    // Add tier-specific flags or properties
    if (tier >= Tier.TIER_4) {
      formationTrait.hasAdvancedEffect = true;
    }
    
    if (tier >= Tier.TIER_5) {
      formationTrait.hasSynergyEffect = true;
    }
    
    if (tier >= Tier.TIER_6) {
      formationTrait.hasMythicEffect = true;
    }
  }
  
  /**
   * Get a multiplier based on tier
   * @param tier The tier
   * @param base The base multiplier (default: 1.0)
   * @returns The multiplier for the tier
   */
  private getTierMultiplier(tier: Tier, base: number = 1.0): number {
    switch (tier) {
      case Tier.TIER_1:
        return base;
      case Tier.TIER_2:
        return base * 1.5;
      case Tier.TIER_3:
        return base * 2.25;
      case Tier.TIER_4:
        return base * 3.5;
      case Tier.TIER_5:
        return base * 5.0;
      case Tier.TIER_6:
        return base * 8.0;
      default:
        return base;
    }
  }
}

// Singleton instance
let abilityFactoryInstance: AbilityFactory | null = null;

/**
 * Get the ability factory instance
 * @returns The ability factory instance
 */
export function getAbilityFactory(): AbilityFactory {
  if (!abilityFactoryInstance) {
    abilityFactoryInstance = new AbilityFactory();
  }
  return abilityFactoryInstance;
}

