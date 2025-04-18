/**
 * Trait Bank Loader for Bitcoin Protozoa
 *
 * This service is responsible for loading trait data from various sources
 * and creating a trait bank for use by the trait service and factory.
 */

import { Role, Rarity, FalloffType, ForceType, BehaviorType, AbilityType } from '../../../shared/types/core';
import {
  BaseTrait,
  BehaviorTrait,
  ClassBonusTrait,
  ForceCalculationTrait,
  FormationTrait,
  SubclassTrait,
  TraitBank,
  VisualTrait
} from '../types/trait';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: TraitBankLoader | null = null;

/**
 * Trait Bank Loader class
 */
export class TraitBankLoader {
  private logger = Logging.createLogger('TraitBankLoader');

  /**
   * Load trait data from JSON files
   * @param basePath The base path to the trait data files
   * @returns A promise resolving to a trait bank
   */
  public async loadFromFiles(basePath: string): Promise<TraitBank> {
    try {
      // Create empty trait bank
      const traitBank: TraitBank = this.createEmptyTraitBank();

      // Load visual traits
      for (const role of Object.values(Role)) {
        const visualTraits = await this.loadTraitFile<VisualTrait>(
          `${basePath}/visual/${role.toLowerCase()}_visual_traits.json`
        );
        traitBank.visualTraits[role] = visualTraits;
      }

      // Load formation traits
      for (const role of Object.values(Role)) {
        const formationTraits = await this.loadTraitFile<FormationTrait>(
          `${basePath}/formation/${role.toLowerCase()}_formation_traits.json`
        );
        traitBank.formationTraits[role] = formationTraits;
      }

      // Load behavior traits
      for (const role of Object.values(Role)) {
        const behaviorTraits = await this.loadTraitFile<BehaviorTrait>(
          `${basePath}/behavior/${role.toLowerCase()}_behavior_traits.json`
        );
        traitBank.behaviorTraits[role] = behaviorTraits;
      }

      // Load class bonus traits
      for (const role of Object.values(Role)) {
        const classBonusTraits = await this.loadTraitFile<ClassBonusTrait>(
          `${basePath}/class_bonus/${role.toLowerCase()}_class_bonus_traits.json`
        );
        traitBank.classBonusTraits[role] = classBonusTraits;
      }

      // Load force calculation traits
      for (const role of Object.values(Role)) {
        const forceCalculationTraits = await this.loadTraitFile<ForceCalculationTrait>(
          `${basePath}/force_calculation/${role.toLowerCase()}_force_calculation_traits.json`
        );
        traitBank.forceCalculationTraits[role] = forceCalculationTraits;
      }

      // Load subclass traits
      for (const role of Object.values(Role)) {
        const subclassTraits = await this.loadTraitFile<SubclassTrait>(
          `${basePath}/subclass/${role.toLowerCase()}_subclass_traits.json`
        );
        traitBank.subclassTraits[role] = subclassTraits;
      }

      return traitBank;
    } catch (error) {
      this.logger.error('Error loading trait bank:', error);
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
        this.logger.warn(`Failed to load trait file ${filePath}: ${response.status} ${response.statusText}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      this.logger.warn(`Error loading trait file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Create an empty trait bank
   * @returns An empty trait bank
   */
  private createEmptyTraitBank(): TraitBank {
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

    return traitBank;
  }

  /**
   * Create a mock trait bank for testing
   * @returns A trait bank with mock data
   */
  public createMockTraitBank(): TraitBank {
    // Create empty trait bank
    const traitBank: TraitBank = this.createEmptyTraitBank();

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
      rarityTier: rarity as any,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      shape: `${role.toLowerCase()}_shape_${index}`,
      colorScheme: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      visualEffect: `${role.toLowerCase()}_effect_${index}`,
      renderingProperties: {
        geometry: `${role.toLowerCase()}_geometry`,
        material: `${role.toLowerCase()}_material`,
        scale: 1.0 + (index * 0.1),
        emissive: true,
        opacity: 1.0,
        colorHex: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
      },
      animationProperties: {
        pulseRate: 0.5,
        rotationSpeed: 0.2,
        trailLength: 0
      }
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
      rarityTier: rarity as any,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      pattern: patterns[index % patterns.length],
      physicsLogic: {
        stiffness: 0.5 + (index * 0.1),
        range: 10 + (index * 5),
        falloff: falloffs[index % falloffs.length] as any,
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
    const types = [BehaviorType.FLOCKING, BehaviorType.PATTERN, BehaviorType.PREDATOR, BehaviorType.PREY, BehaviorType.SWARM];

    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_behavior_${index}`,
      name: `${role} Behavior Trait ${index}`,
      description: `A ${rarity.toLowerCase()} behavior trait for ${role} particles`,
      rarityTier: rarity as any,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      type: BehaviorType[types[index % types.length]] as any,
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
      rarityTier: rarity as any,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      statType: statTypes[index % statTypes.length] as any,
      bonusAmount: 0.1 + (index * 0.05),
      physicsLogic: {
        forceMultiplier: 1.0 + (index * 0.1),
        rangeMultiplier: 1.0 + (index * 0.1),
        speedMultiplier: 1.0 + (index * 0.1),
        stabilityMultiplier: 1.0 + (index * 0.1)
      },
      visualEffects: {
        particleGlow: index % 2 === 0,
        particleSize: 1.0 + (index * 0.1),
        particleColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
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
    const forceTypes = [ForceType.ATTRACTION, ForceType.REPULSION, ForceType.ALIGNMENT, ForceType.COHESION, ForceType.SEPARATION];
    const falloffs = [FalloffType.LINEAR, FalloffType.QUADRATIC, FalloffType.EXPONENTIAL, FalloffType.NONE];

    return rarities.map((rarity, index) => ({
      id: `${role.toLowerCase()}_force_calculation_${index}`,
      name: `${role} Force Calculation Trait ${index}`,
      description: `A ${rarity.toLowerCase()} force calculation trait for ${role} particles`,
      rarityTier: rarity as any,
      role,
      evolutionParameters: {
        mutationChance: 0.1,
        possibleEvolutions: []
      },
      forceType: forceTypes[index % forceTypes.length] as any,
      strengthMultiplier: 0.5 + (index * 0.1),
      rangeMultiplier: 0.5 + (index * 0.1),
      falloff: falloffs[index % falloffs.length] as any,
      targetGroups: index % 2 === 0 ? [role] : Object.values(Role).filter(r => r !== role),
      physicsLogic: {
        forceFunction: `${role.toLowerCase()}_force_${index}`,
        thresholdDistance: 5.0 + (index * 2.0),
        maxForce: 10.0 + (index * 5.0)
      },
      visualEffects: {
        forceVisualization: index % 2 === 0,
        forceColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
      }
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
      rarityTier: rarity as any,
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
          type: AbilityType.PRIMARY,
          cooldown: 5 + index,
          physicsLogic: {
            forceMultiplier: 1.0 + (index * 0.2),
            rangeMultiplier: 1.0 + (index * 0.2),
            durationSeconds: 5 + (index * 2)
          },
          visualEffects: {
            particleEffect: `${role.toLowerCase()}_ability_effect_${index}_1`,
            areaEffect: `${role.toLowerCase()}_area_effect_${index}_1`,
            colorFlash: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
          }
        },
        {
          id: `${role.toLowerCase()}_ability_${index}_2`,
          name: `${role} Ability ${index} 2`,
          description: `A ${rarity.toLowerCase()} ability for ${role} particles`,
          type: AbilityType.SECONDARY,
          cooldown: 10 + index,
          physicsLogic: {
            forceMultiplier: 1.5 + (index * 0.2),
            rangeMultiplier: 1.5 + (index * 0.2),
            durationSeconds: 8 + (index * 2)
          },
          visualEffects: {
            particleEffect: `${role.toLowerCase()}_ability_effect_${index}_2`,
            areaEffect: `${role.toLowerCase()}_area_effect_${index}_2`,
            colorFlash: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
          }
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
 * @returns The trait bank loader singleton instance
 */
export function getTraitBankLoader(): TraitBankLoader {
  if (!instance) {
    instance = new TraitBankLoader();
  }
  return instance;
}
