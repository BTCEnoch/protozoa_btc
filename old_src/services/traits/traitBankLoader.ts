/**
 * Trait Bank Loader for Bitcoin Protozoa
 * 
 * This service is responsible for loading trait data from various sources
 * and creating a trait bank for use by the trait service and factory.
 */

import { Role } from '../../types/creatures/creature';
import { BaseTrait, BehaviorTrait, ClassBonusTrait, ForceCalculationTrait, FormationTrait, SubclassTrait, TraitBank, VisualTrait } from '../../types/traits/trait';

/**
 * Trait Bank Loader class
 */
export class TraitBankLoader {
  private static instance: TraitBankLoader;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Initialize with empty state
  }

  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): TraitBankLoader {
    if (!TraitBankLoader.instance) {
      TraitBankLoader.instance = new TraitBankLoader();
    }
    return TraitBankLoader.instance;
  }

  /**
   * Load trait data from JSON files
   * @param basePath The base path to the trait data files
   * @returns A promise resolving to a trait bank
   */
  public async loadFromFiles(basePath: string): Promise<TraitBank> {
    try {
      // Create empty trait bank
      const traitBank: TraitBank = {
        visualTraits: {} as Record<Role, VisualTrait[]>,
        formationTraits: {} as Record<Role, FormationTrait[]>,
        behaviorTraits: {} as Record<Role, BehaviorTrait[]>,
        classBonusTraits: {} as Record<Role, ClassBonusTrait[]>,
        forceCalculationTraits: {} as Record<Role, ForceCalculationTrait[]>,
        subclassTraits: {} as Record<Role, SubclassTrait[]>
      };

      // Initialize empty arrays for each role
      const roles = Object.values(Role);
      for (const role of roles) {
        traitBank.visualTraits[role] = [];
        traitBank.formationTraits[role] = [];
        traitBank.behaviorTraits[role] = [];
        traitBank.classBonusTraits[role] = [];
        traitBank.forceCalculationTraits[role] = [];
        traitBank.subclassTraits[role] = [];
      }

      // Load visual traits
      for (const role of roles) {
        const visualTraits = await this.loadTraitFile<VisualTrait>(
          `${basePath}/visual/${role.toLowerCase()}_visual_traits.json`
        );
        traitBank.visualTraits[role] = visualTraits;
      }

      // Load formation traits
      for (const role of roles) {
        const formationTraits = await this.loadTraitFile<FormationTrait>(
          `${basePath}/formation/${role.toLowerCase()}_formation_traits.json`
        );
        traitBank.formationTraits[role] = formationTraits;
      }

      // Load behavior traits
      for (const role of roles) {
        const behaviorTraits = await this.loadTraitFile<BehaviorTrait>(
          `${basePath}/behavior/${role.toLowerCase()}_behavior_traits.json`
        );
        traitBank.behaviorTraits[role] = behaviorTraits;
      }

      // Load class bonus traits
      for (const role of roles) {
        const classBonusTraits = await this.loadTraitFile<ClassBonusTrait>(
          `${basePath}/class_bonus/${role.toLowerCase()}_class_bonus_traits.json`
        );
        traitBank.classBonusTraits[role] = classBonusTraits;
      }

      // Load force calculation traits
      for (const role of roles) {
        const forceCalculationTraits = await this.loadTraitFile<ForceCalculationTrait>(
          `${basePath}/force_calculation/${role.toLowerCase()}_force_calculation_traits.json`
        );
        traitBank.forceCalculationTraits[role] = forceCalculationTraits;
      }

      // Load subclass traits
      for (const role of roles) {
        const subclassTraits = await this.loadTraitFile<SubclassTrait>(
          `${basePath}/subclass/${role.toLowerCase()}_subclass_traits.json`
        );
        traitBank.subclassTraits[role] = subclassTraits;
      }

      return traitBank;
    } catch (error) {
      console.error('Error loading trait bank:', error);
      throw error;
    }
  }

  /**
   * Load a trait file
   * @param filePath The path to the trait file
   * @returns A promise resolving to an array of traits
   */
  private async loadTraitFile<T extends BaseTrait>(filePath: string): Promise<T[]> {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.warn(`Failed to load trait file ${filePath}: ${response.status} ${response.statusText}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.warn(`Error loading trait file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Create a mock trait bank for testing
   * @returns A trait bank with mock data
   */
  public createMockTraitBank(): TraitBank {
    // Create empty trait bank
    const traitBank: TraitBank = {
      visualTraits: {} as Record<Role, VisualTrait[]>,
      formationTraits: {} as Record<Role, FormationTrait[]>,
      behaviorTraits: {} as Record<Role, BehaviorTrait[]>,
      classBonusTraits: {} as Record<Role, ClassBonusTrait[]>,
      forceCalculationTraits: {} as Record<Role, ForceCalculationTrait[]>,
      subclassTraits: {} as Record<Role, SubclassTrait[]>
    };

    // Initialize with mock data for each role
    const roles = Object.values(Role);
    for (const role of roles) {
      traitBank.visualTraits[role] = this.createMockVisualTraits(role);
      traitBank.formationTraits[role] = this.createMockFormationTraits(role);
      traitBank.behaviorTraits[role] = this.createMockBehaviorTraits(role);
      traitBank.classBonusTraits[role] = this.createMockClassBonusTraits(role);
      traitBank.forceCalculationTraits[role] = this.createMockForceCalculationTraits(role);
      traitBank.subclassTraits[role] = this.createMockSubclassTraits(role);
    }

    return traitBank;
  }

  /**
   * Create mock visual traits for a role
   * @param role The particle role
   * @returns An array of mock visual traits
   */
  private createMockVisualTraits(role: Role): VisualTrait[] {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_visual_${index}`,
      name: `${role} Visual Trait ${index}`,
      description: `A ${rarity.toLowerCase()} visual trait for ${role} particles`,
      rarityTier: rarity,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      shape: `${role.toLowerCase()}_shape_${index}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      effect: `${role.toLowerCase()}_effect_${index}`,
      scale: 1.0 + (index * 0.1)
    }));
  }

  /**
   * Create mock formation traits for a role
   * @param role The particle role
   * @returns An array of mock formation traits
   */
  private createMockFormationTraits(role: Role): FormationTrait[] {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    const patterns = ['circle', 'grid', 'spiral', 'vortex', 'wave', 'cluster'];
    const falloffs = ['LINEAR', 'QUADRATIC', 'EXPONENTIAL', 'INVERSE_SQUARE'];
    
    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_formation_${index}`,
      name: `${role} Formation Trait ${index}`,
      description: `A ${rarity.toLowerCase()} formation trait for ${role} particles`,
      rarityTier: rarity,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      pattern: patterns[index % patterns.length],
      physicsLogic: {
        stiffness: 0.5 + (index * 0.1),
        range: 10 + (index * 5),
        falloff: falloffs[index % falloffs.length],
        targetFunction: `${role.toLowerCase()}_target_${index}`,
        additionalParameters: {}
      },
      visualProperties: {
        baseColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
        particleScale: 1.0 + (index * 0.1),
        trailEffect: index % 2 === 0
      }
    }));
  }

  /**
   * Create mock behavior traits for a role
   * @param role The particle role
   * @returns An array of mock behavior traits
   */
  private createMockBehaviorTraits(role: Role): BehaviorTrait[] {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    const types = ['FLOCKING', 'PULSATION', 'OSCILLATION', 'ROTATION', 'SWARMING', 'HUNTING'];
    
    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_behavior_${index}`,
      name: `${role} Behavior Trait ${index}`,
      description: `A ${rarity.toLowerCase()} behavior trait for ${role} particles`,
      rarityTier: rarity,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      type: types[index % types.length],
      physicsLogic: {
        strength: 0.5 + (index * 0.1),
        range: 10 + (index * 5),
        priority: index + 1,
        persistence: 0.5 + (index * 0.1),
        frequency: 0.5 + (index * 0.1),
        additionalParameters: {}
      },
      visualEffects: {
        particleEffect: `${role.toLowerCase()}_particle_effect_${index}`,
        trailEffect: `${role.toLowerCase()}_trail_effect_${index}`,
        colorModulation: index % 2 === 0
      }
    }));
  }

  /**
   * Create mock class bonus traits for a role
   * @param role The particle role
   * @returns An array of mock class bonus traits
   */
  private createMockClassBonusTraits(role: Role): ClassBonusTrait[] {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    const statTypes = ['HEALTH', 'DAMAGE', 'SPEED', 'DEFENSE', 'ENERGY', 'COOLDOWN'];
    
    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_class_bonus_${index}`,
      name: `${role} Class Bonus Trait ${index}`,
      description: `A ${rarity.toLowerCase()} class bonus trait for ${role} particles`,
      rarityTier: rarity,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      statType: statTypes[index % statTypes.length],
      bonusAmount: 0.1 + (index * 0.05),
      conditions: {
        minParticles: 10 + (index * 5),
        maxParticles: 100 + (index * 10),
        requiredFormation: index % 2 === 0 ? `${role.toLowerCase()}_formation_${index}` : undefined
      }
    }));
  }

  /**
   * Create mock force calculation traits for a role
   * @param role The particle role
   * @returns An array of mock force calculation traits
   */
  private createMockForceCalculationTraits(role: Role): ForceCalculationTrait[] {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    const forceTypes = ['ATTRACTION', 'REPULSION', 'ALIGNMENT', 'COHESION', 'SEPARATION', 'SEEKING'];
    const falloffs = ['LINEAR', 'QUADRATIC', 'EXPONENTIAL', 'INVERSE_SQUARE'];
    
    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_force_calculation_${index}`,
      name: `${role} Force Calculation Trait ${index}`,
      description: `A ${rarity.toLowerCase()} force calculation trait for ${role} particles`,
      rarityTier: rarity,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      forceType: forceTypes[index % forceTypes.length],
      strengthMultiplier: 0.5 + (index * 0.1),
      rangeMultiplier: 0.5 + (index * 0.1),
      falloff: falloffs[index % falloffs.length],
      targetGroups: index % 2 === 0 ? [role] : Object.values(Role).filter(r => r !== role)
    }));
  }

  /**
   * Create mock subclass traits for a role
   * @param role The particle role
   * @returns An array of mock subclass traits
   */
  private createMockSubclassTraits(role: Role): SubclassTrait[] {
    const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    
    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_subclass_${index}`,
      name: `${role} Subclass Trait ${index}`,
      description: `A ${rarity.toLowerCase()} subclass trait for ${role} particles`,
      rarityTier: rarity,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      formationTrait: `${role.toLowerCase()}_formation_${index}`,
      abilities: [
        {
          id: `${role.toLowerCase()}_ability_${index}_1`,
          name: `${role} Ability ${index} 1`,
          description: `A ${rarity.toLowerCase()} ability for ${role} particles`,
          type: 'PRIMARY',
          cooldown: 5 + index,
          energyCost: 10 + (index * 5),
          effects: []
        },
        {
          id: `${role.toLowerCase()}_ability_${index}_2`,
          name: `${role} Ability ${index} 2`,
          description: `A ${rarity.toLowerCase()} ability for ${role} particles`,
          type: 'SECONDARY',
          cooldown: 10 + index,
          energyCost: 20 + (index * 5),
          effects: []
        }
      ],
      synergy: `${role.toLowerCase()}_synergy_${index}`,
      themeProperties: {
        primaryColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
        secondaryColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
        particleEffect: `${role.toLowerCase()}_particle_effect_${index}`,
        soundEffect: `${role.toLowerCase()}_sound_effect_${index}`
      }
    }));
  }
}

/**
 * Get the trait bank loader instance
 * @returns The trait bank loader instance
 */
export function getTraitBankLoader(): TraitBankLoader {
  return TraitBankLoader.getInstance();
}

