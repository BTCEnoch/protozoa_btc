/**
 * Mutation Bank Loader for Bitcoin Protozoa
 *
 * This service is responsible for loading mutation data from various sources
 * and creating a mutation bank for use by the mutation service.
 */

import {
  Role,
  Rarity,
  AttributeType,
  RoleToAttributeType
} from '../../types/core';
import { CreatureGroup } from '../../types/creatures/creature';
import {
  MutationCategory,
  MutationBank,
  AttributeMutation,
  ParticleMutation,
  SubclassMutation,
  AbilityMutation,
  SynergyMutation,
  FormationMutation,
  BehaviorMutation,
  ExoticMutation,
  createMutationId
} from '../../types/mutations/mutation';

/**
 * Mutation bank loader class
 */
export class MutationBankLoader {
  private static instance: MutationBankLoader;

  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): MutationBankLoader {
    if (!MutationBankLoader.instance) {
      MutationBankLoader.instance = new MutationBankLoader();
    }
    return MutationBankLoader.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Load mutation data from JSON files
   * @param basePath The base path to the mutation data files
   * @returns A promise resolving to a mutation bank
   */
  public async loadFromFiles(basePath: string): Promise<MutationBank> {
    try {
      // Create empty mutation bank
      const mutationBank: MutationBank = this.createEmptyMutationBank();

      // Load mutations for each category and rarity
      for (const category of Object.values(MutationCategory)) {
        for (const rarity of Object.values(Rarity)) {
          try {
            const filePath = `${basePath}/${category.toLowerCase()}/${rarity.toLowerCase()}.json`;
            const response = await fetch(filePath);

            if (!response.ok) {
              console.warn(`No mutation file found for ${category}, rarity ${rarity}: ${response.status} ${response.statusText}`);
              continue;
            }

            const data = await response.json();

            if (!data.mutations || !Array.isArray(data.mutations)) {
              console.warn(`Invalid mutation data for ${category}, rarity ${rarity}: missing or invalid mutations array`);
              continue;
            }

            // Process the mutations based on category
            switch (category) {
              case MutationCategory.ATTRIBUTE:
                mutationBank[category][rarity] = this.processAttributeMutations(data.mutations);
                break;
              case MutationCategory.PARTICLE:
                mutationBank[category][rarity] = this.processParticleMutations(data.mutations);
                break;
              case MutationCategory.SUBCLASS:
                mutationBank[category][rarity] = this.processSubclassMutations(data.mutations);
                break;
              case MutationCategory.ABILITY:
                mutationBank[category][rarity] = this.processAbilityMutations(data.mutations);
                break;
              case MutationCategory.SYNERGY:
                mutationBank[category][rarity] = this.processSynergyMutations(data.mutations);
                break;
              case MutationCategory.FORMATION:
                mutationBank[category][rarity] = this.processFormationMutations(data.mutations);
                break;
              case MutationCategory.BEHAVIOR:
                mutationBank[category][rarity] = this.processBehaviorMutations(data.mutations);
                break;
              case MutationCategory.EXOTIC:
                mutationBank[category][rarity] = this.processExoticMutations(data.mutations);
                break;
            }

            console.log(`Loaded ${mutationBank[category][rarity].length} mutations for ${category}, rarity ${rarity}`);
          } catch (error) {
            console.error(`Error loading mutations for ${category}, rarity ${rarity}:`, error);
          }
        }
      }

      // If no mutations were loaded, use mock data
      let totalMutations = 0;
      for (const category of Object.values(MutationCategory)) {
        for (const rarity of Object.values(Rarity)) {
          totalMutations += mutationBank[category][rarity].length;
        }
      }

      if (totalMutations === 0) {
        console.warn('No mutations loaded from files, using mock data');
        return this.createMockMutationBank();
      }

      return mutationBank;
    } catch (error) {
      console.error('Error loading mutation bank:', error);
      console.warn('Falling back to mock data');
      return this.createMockMutationBank();
    }
  }

  /**
   * Create an empty mutation bank
   * @returns An empty mutation bank
   */
  private createEmptyMutationBank(): MutationBank {
    const mutationBank: Partial<MutationBank> = {};

    // Initialize empty arrays for each category and rarity
    for (const category of Object.values(MutationCategory)) {
      mutationBank[category] = {} as Record<Rarity, any[]>;

      for (const rarity of Object.values(Rarity)) {
        mutationBank[category][rarity] = [];
      }
    }

    return mutationBank as MutationBank;
  }

  /**
   * Create a mock mutation bank for testing
   * @returns A mutation bank with mock data
   */
  public createMockMutationBank(): MutationBank {
    // Create empty mutation bank
    const mutationBank: MutationBank = this.createEmptyMutationBank();

    // Create mock mutations for each category and rarity
    for (const category of Object.values(MutationCategory)) {
      for (const rarity of Object.values(Rarity)) {
        switch (category) {
          case MutationCategory.ATTRIBUTE:
            mutationBank[category][rarity] = this.createMockAttributeMutations(rarity);
            break;
          case MutationCategory.PARTICLE:
            mutationBank[category][rarity] = this.createMockParticleMutations(rarity);
            break;
          case MutationCategory.SUBCLASS:
            mutationBank[category][rarity] = this.createMockSubclassMutations(rarity);
            break;
          case MutationCategory.ABILITY:
            mutationBank[category][rarity] = this.createMockAbilityMutations(rarity);
            break;
          case MutationCategory.SYNERGY:
            mutationBank[category][rarity] = this.createMockSynergyMutations(rarity);
            break;
          // Visual mutations have been removed as visuals will be designed and assigned to abilities and classes
          case MutationCategory.FORMATION:
            mutationBank[category][rarity] = this.createMockFormationMutations(rarity);
            break;
          case MutationCategory.BEHAVIOR:
            mutationBank[category][rarity] = this.createMockBehaviorMutations(rarity);
            break;
          case MutationCategory.EXOTIC:
            mutationBank[category][rarity] = this.createMockExoticMutations(rarity);
            break;
        }
      }
    }

    return mutationBank;
  }

  /**
   * Create mock attribute mutations
   * @param rarity The rarity tier
   * @returns An array of attribute mutations
   */
  private createMockAttributeMutations(rarity: Rarity): AttributeMutation[] {
    const mutations: AttributeMutation[] = [];
    const roles = Object.values(Role);
    const attributes = Object.values(AttributeType);

    // Create 2 mutations per role
    for (const role of roles) {
      // Get the primary attribute for this role
      const primaryAttribute = RoleToAttributeType[role];

      // Create a primary attribute mutation
      const primaryMutation: AttributeMutation = {
        id: createMutationId(MutationCategory.ATTRIBUTE, role, rarity, 1),
        name: `Enhanced ${primaryAttribute}`,
        description: `Increases ${primaryAttribute} by ${this.getAttributeBoostForRarity(rarity)}%`,
        category: MutationCategory.ATTRIBUTE,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        attributeBonuses: {
          [primaryAttribute]: this.getAttributeBoostForRarity(rarity)
        },
        multiplier: 1 + (this.getAttributeBoostForRarity(rarity) / 100),
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getAttributeBoostForRarity(rarity) / 100))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_attribute_boost_effect`,
        compatibleRoles: [role]
      };

      mutations.push(primaryMutation);

      // Create a secondary attribute mutation that affects all attributes
      const secondaryMutation: AttributeMutation = {
        id: createMutationId(MutationCategory.ATTRIBUTE, role, rarity, 2),
        name: `${role} Mastery`,
        description: `Increases all attributes by ${this.getAttributeBoostForRarity(rarity) / 2}%`,
        category: MutationCategory.ATTRIBUTE,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        attributeBonuses: attributes.reduce((bonuses, attr) => {
          bonuses[attr] = this.getAttributeBoostForRarity(rarity) / 2;
          return bonuses;
        }, {} as Partial<Record<AttributeType, number>>),
        multiplier: 1 + (this.getAttributeBoostForRarity(rarity) / 200),
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getAttributeBoostForRarity(rarity) / 200))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_mastery_effect`,
        compatibleRoles: [role]
      };

      mutations.push(secondaryMutation);
    }

    return mutations;
  }

  /**
   * Create mock particle mutations
   * @param rarity The rarity tier
   * @returns An array of particle mutations
   */
  private createMockParticleMutations(rarity: Rarity): ParticleMutation[] {
    const mutations: ParticleMutation[] = [];
    const roles = Object.values(Role);

    // Create 2 mutations per role
    for (const role of roles) {
      // Create a particle count increase mutation
      const countIncreaseMutation: ParticleMutation = {
        id: createMutationId(MutationCategory.PARTICLE, role, rarity, 1),
        name: `${role} Particle Surge`,
        description: `Increases ${role} particle count by ${this.getParticleCountBoostForRarity(rarity)}`,
        category: MutationCategory.PARTICLE,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        particleCountChange: this.getParticleCountBoostForRarity(rarity),
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply the particle count boost
          updatedGroup.particles += this.getParticleCountBoostForRarity(rarity);

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_particle_surge_effect`,
        compatibleRoles: [role]
      };

      mutations.push(countIncreaseMutation);

      // Create a particle distribution mutation
      const distributionMutation: ParticleMutation = {
        id: createMutationId(MutationCategory.PARTICLE, role, rarity, 2),
        name: `${role} Specialization`,
        description: `Optimizes particle distribution for ${role}`,
        category: MutationCategory.PARTICLE,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        particleDistribution: {
          [role]: this.getParticleDistributionBoostForRarity(rarity)
        },
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply the attribute boost based on particle count
          updatedGroup.attributeValue += Math.floor(
            updatedGroup.particles * (this.getAttributeBoostForRarity(rarity) / 100)
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_specialization_effect`,
        compatibleRoles: [role]
      };

      mutations.push(distributionMutation);
    }

    return mutations;
  }

  /**
   * Create mock subclass mutations
   * @param rarity The rarity tier
   * @returns An array of subclass mutations
   */
  private createMockSubclassMutations(rarity: Rarity): SubclassMutation[] {
    const mutations: SubclassMutation[] = [];
    const roles = Object.values(Role);

    // Create 1 mutation per role
    for (const role of roles) {
      // Create a subclass evolution mutation
      const subclassMutation: SubclassMutation = {
        id: createMutationId(MutationCategory.SUBCLASS, role, rarity, 1),
        name: `${role} Evolution`,
        description: `Evolves the ${role} subclass to a higher tier`,
        category: MutationCategory.SUBCLASS,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        tierChange: 1, // Increase tier by 1
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply the attribute boost based on rarity
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getAttributeBoostForRarity(rarity) / 50))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_evolution_effect`,
        compatibleRoles: [role]
      };

      mutations.push(subclassMutation);
    }

    return mutations;
  }

  /**
   * Create mock ability mutations
   * @param rarity The rarity tier
   * @returns An array of ability mutations
   */
  private createMockAbilityMutations(rarity: Rarity): AbilityMutation[] {
    const mutations: AbilityMutation[] = [];
    const roles = Object.values(Role);

    // Create 2 mutations per role
    for (const role of roles) {
      // Create a cooldown reduction mutation
      const cooldownMutation: AbilityMutation = {
        id: createMutationId(MutationCategory.ABILITY, role, rarity, 1),
        name: `${role} Efficiency`,
        description: `Reduces ability cooldowns by ${this.getCooldownReductionForRarity(rarity)}%`,
        category: MutationCategory.ABILITY,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        cooldownReduction: this.getCooldownReductionForRarity(rarity),
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // In a real implementation, this would modify ability cooldowns
          // For now, just apply an attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getCooldownReductionForRarity(rarity) / 200))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_efficiency_effect`,
        compatibleRoles: [role]
      };

      mutations.push(cooldownMutation);

      // Create a damage increase mutation
      const damageMutation: AbilityMutation = {
        id: createMutationId(MutationCategory.ABILITY, role, rarity, 2),
        name: `${role} Power`,
        description: `Increases ability damage by ${this.getDamageIncreaseForRarity(rarity)}%`,
        category: MutationCategory.ABILITY,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        damageIncrease: this.getDamageIncreaseForRarity(rarity),
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // In a real implementation, this would modify ability damage
          // For now, just apply an attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getDamageIncreaseForRarity(rarity) / 100))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_power_effect`,
        compatibleRoles: [role]
      };

      mutations.push(damageMutation);
    }

    return mutations;
  }

  /**
   * Create mock synergy mutations
   * @param rarity The rarity tier
   * @returns An array of synergy mutations
   */
  private createMockSynergyMutations(rarity: Rarity): SynergyMutation[] {
    const mutations: SynergyMutation[] = [];
    const roles = Object.values(Role);

    // Create 1 mutation per role
    for (const role of roles) {
      // Get a random target role that's different from the current role
      const targetRoles = roles.filter(r => r !== role);
      const targetRole = targetRoles[0]; // In a real implementation, this would be random

      // Create a synergy mutation
      const synergyMutation: SynergyMutation = {
        id: createMutationId(MutationCategory.SYNERGY, role, rarity, 1),
        name: `${role}-${targetRole} Synergy`,
        description: `Creates a synergy between ${role} and ${targetRole} groups`,
        category: MutationCategory.SYNERGY,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        targetRoles: [role, targetRole],
        synergyEffect: `Increases effectiveness when ${role} and ${targetRole} work together`,
        synergyBonus: this.getSynergyBonusForRarity(rarity),
        synergyType: 'attribute',
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // Only apply the effect if this is one of the target roles
          if (updatedGroup.role === role || updatedGroup.role === targetRole) {
            updatedGroup.attributeValue = Math.floor(
              updatedGroup.attributeValue * (1 + (this.getSynergyBonusForRarity(rarity) / 100))
            );
          }

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_${targetRole.toLowerCase()}_synergy_effect`,
        compatibleRoles: [role, targetRole]
      };

      mutations.push(synergyMutation);
    }

    return mutations;
  }

  // Visual mutations have been removed as visuals will be designed and assigned to abilities and classes

  /**
   * Create mock formation mutations
   * @param rarity The rarity tier
   * @returns An array of formation mutations
   */
  private createMockFormationMutations(rarity: Rarity): FormationMutation[] {
    const mutations: FormationMutation[] = [];
    const roles = Object.values(Role);

    // Create 1 mutation per role
    for (const role of roles) {
      // Create a formation mutation
      const formationMutation: FormationMutation = {
        id: createMutationId(MutationCategory.FORMATION, role, rarity, 1),
        name: `${role} Formation Shift`,
        description: `Changes the formation pattern of ${role} particles`,
        category: MutationCategory.FORMATION,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        patternChange: `${role.toLowerCase()}_pattern_${rarity.toLowerCase()}`,
        densityChange: this.getDensityChangeForRarity(rarity),
        rangeChange: this.getRangeChangeForRarity(rarity),
        stabilityChange: this.getStabilityChangeForRarity(rarity),
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // In a real implementation, this would modify formation properties
          // For now, just apply a small attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getAttributeBoostForRarity(rarity) / 200))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_formation_shift_effect`,
        compatibleRoles: [role]
      };

      mutations.push(formationMutation);
    }

    return mutations;
  }

  /**
   * Create mock behavior mutations
   * @param rarity The rarity tier
   * @returns An array of behavior mutations
   */
  private createMockBehaviorMutations(rarity: Rarity): BehaviorMutation[] {
    const mutations: BehaviorMutation[] = [];
    const roles = Object.values(Role);

    // Create 1 mutation per role
    for (const role of roles) {
      // Create a behavior mutation
      const behaviorMutation: BehaviorMutation = {
        id: createMutationId(MutationCategory.BEHAVIOR, role, rarity, 1),
        name: `${role} Behavior Adaptation`,
        description: `Adapts the behavior of ${role} particles`,
        category: MutationCategory.BEHAVIOR,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        speedChange: this.getSpeedChangeForRarity(rarity),
        aggressionChange: role === Role.ATTACK ? this.getAggressionChangeForRarity(rarity) : 0,
        cohesionChange: role === Role.DEFENSE ? this.getCohesionChangeForRarity(rarity) : 0,
        patternChange: `${role.toLowerCase()}_behavior_pattern_${rarity.toLowerCase()}`,
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // In a real implementation, this would modify behavior properties
          // For now, just apply a small attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getAttributeBoostForRarity(rarity) / 200))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_behavior_adaptation_effect`,
        compatibleRoles: [role]
      };

      mutations.push(behaviorMutation);
    }

    return mutations;
  }

  /**
   * Create mock exotic mutations
   * @param rarity The rarity tier
   * @returns An array of exotic mutations
   */
  private createMockExoticMutations(rarity: Rarity): ExoticMutation[] {
    // Only create exotic mutations for Legendary and Mythic rarities
    if (rarity !== Rarity.LEGENDARY && rarity !== Rarity.MYTHIC) {
      return [];
    }

    const mutations: ExoticMutation[] = [];
    const roles = Object.values(Role);

    // Create 1 mutation per role
    for (const role of roles) {
      // Create an exotic mutation
      const exoticMutation: ExoticMutation = {
        id: createMutationId(MutationCategory.EXOTIC, role, rarity, 1),
        name: `${role} Transcendence`,
        description: `A rare and powerful mutation that transforms ${role} particles`,
        category: MutationCategory.EXOTIC,
        rarity,
        confirmationThreshold: this.getConfirmationThresholdForRarity(rarity),
        appliedAt: 0, // Will be set when applied
        uniqueEffectId: `${role.toLowerCase()}_transcendence_${rarity.toLowerCase()}`,
        globalEffect: rarity === Rarity.MYTHIC, // Only Mythic mutations have global effects
        transformationEffect: `Transforms ${role} particles into a higher state of being`,
        specialAbility: `Grants a unique ability to ${role} particles`,
        applyEffect: (group: CreatureGroup) => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply a significant attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (this.getExoticBoostForRarity(rarity) / 100))
          );

          return updatedGroup;
        },
        visualEffect: `${role.toLowerCase()}_transcendence_effect`,
        compatibleRoles: [role]
      };

      mutations.push(exoticMutation);
    }

    return mutations;
  }

  /**
   * Get the confirmation threshold for a rarity tier
   * @param rarity The rarity tier
   * @returns The confirmation threshold
   */
  private getConfirmationThresholdForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 10000;
      case Rarity.UNCOMMON:
        return 50000;
      case Rarity.RARE:
        return 100000;
      case Rarity.EPIC:
        return 250000;
      case Rarity.LEGENDARY:
        return 500000;
      case Rarity.MYTHIC:
        return 1000000;
      default:
        return 10000;
    }
  }

  /**
   * Get the attribute boost percentage for a rarity tier
   * @param rarity The rarity tier
   * @returns The attribute boost percentage
   */
  private getAttributeBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 15;
      case Rarity.EPIC:
        return 25;
      case Rarity.LEGENDARY:
        return 40;
      case Rarity.MYTHIC:
        return 60;
      default:
        return 5;
    }
  }

  /**
   * Get the particle count boost for a rarity tier
   * @param rarity The rarity tier
   * @returns The particle count boost
   */
  private getParticleCountBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 15;
      case Rarity.EPIC:
        return 25;
      case Rarity.LEGENDARY:
        return 40;
      case Rarity.MYTHIC:
        return 60;
      default:
        return 5;
    }
  }

  /**
   * Get the particle distribution boost for a rarity tier
   * @param rarity The rarity tier
   * @returns The particle distribution boost
   */
  private getParticleDistributionBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 15;
      case Rarity.EPIC:
        return 20;
      case Rarity.LEGENDARY:
        return 25;
      case Rarity.MYTHIC:
        return 30;
      default:
        return 5;
    }
  }

  /**
   * Get the cooldown reduction percentage for a rarity tier
   * @param rarity The rarity tier
   * @returns The cooldown reduction percentage
   */
  private getCooldownReductionForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 15;
      case Rarity.EPIC:
        return 20;
      case Rarity.LEGENDARY:
        return 30;
      case Rarity.MYTHIC:
        return 40;
      default:
        return 5;
    }
  }

  /**
   * Get the damage increase percentage for a rarity tier
   * @param rarity The rarity tier
   * @returns The damage increase percentage
   */
  private getDamageIncreaseForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 20;
      case Rarity.EPIC:
        return 30;
      case Rarity.LEGENDARY:
        return 50;
      case Rarity.MYTHIC:
        return 75;
      default:
        return 5;
    }
  }

  /**
   * Get the synergy bonus percentage for a rarity tier
   * @param rarity The rarity tier
   * @returns The synergy bonus percentage
   */
  private getSynergyBonusForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 3;
      case Rarity.UNCOMMON:
        return 6;
      case Rarity.RARE:
        return 10;
      case Rarity.EPIC:
        return 15;
      case Rarity.LEGENDARY:
        return 25;
      case Rarity.MYTHIC:
        return 40;
      default:
        return 3;
    }
  }



  /**
   * Get the density change for a rarity tier
   * @param rarity The rarity tier
   * @returns The density change
   */
  private getDensityChangeForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 0.05;
      case Rarity.UNCOMMON:
        return 0.1;
      case Rarity.RARE:
        return 0.15;
      case Rarity.EPIC:
        return 0.2;
      case Rarity.LEGENDARY:
        return 0.3;
      case Rarity.MYTHIC:
        return 0.5;
      default:
        return 0.05;
    }
  }

  /**
   * Get the range change for a rarity tier
   * @param rarity The rarity tier
   * @returns The range change
   */
  private getRangeChangeForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 1;
      case Rarity.UNCOMMON:
        return 2;
      case Rarity.RARE:
        return 3;
      case Rarity.EPIC:
        return 5;
      case Rarity.LEGENDARY:
        return 8;
      case Rarity.MYTHIC:
        return 12;
      default:
        return 1;
    }
  }

  /**
   * Get the stability change for a rarity tier
   * @param rarity The rarity tier
   * @returns The stability change
   */
  private getStabilityChangeForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 0.05;
      case Rarity.UNCOMMON:
        return 0.1;
      case Rarity.RARE:
        return 0.15;
      case Rarity.EPIC:
        return 0.2;
      case Rarity.LEGENDARY:
        return 0.3;
      case Rarity.MYTHIC:
        return 0.5;
      default:
        return 0.05;
    }
  }

  /**
   * Get the speed change for a rarity tier
   * @param rarity The rarity tier
   * @returns The speed change
   */
  private getSpeedChangeForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 0.05;
      case Rarity.UNCOMMON:
        return 0.1;
      case Rarity.RARE:
        return 0.15;
      case Rarity.EPIC:
        return 0.2;
      case Rarity.LEGENDARY:
        return 0.3;
      case Rarity.MYTHIC:
        return 0.5;
      default:
        return 0.05;
    }
  }

  /**
   * Get the aggression change for a rarity tier
   * @param rarity The rarity tier
   * @returns The aggression change
   */
  private getAggressionChangeForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 0.05;
      case Rarity.UNCOMMON:
        return 0.1;
      case Rarity.RARE:
        return 0.15;
      case Rarity.EPIC:
        return 0.2;
      case Rarity.LEGENDARY:
        return 0.3;
      case Rarity.MYTHIC:
        return 0.5;
      default:
        return 0.05;
    }
  }

  /**
   * Get the cohesion change for a rarity tier
   * @param rarity The rarity tier
   * @returns The cohesion change
   */
  private getCohesionChangeForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 0.05;
      case Rarity.UNCOMMON:
        return 0.1;
      case Rarity.RARE:
        return 0.15;
      case Rarity.EPIC:
        return 0.2;
      case Rarity.LEGENDARY:
        return 0.3;
      case Rarity.MYTHIC:
        return 0.5;
      default:
        return 0.05;
    }
  }

  /**
   * Get the exotic boost for a rarity tier
   * @param rarity The rarity tier
   * @returns The exotic boost percentage
   */
  private getExoticBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return 50;
      case Rarity.MYTHIC:
        return 100;
      default:
        return 25;
    }
  }

  /**
   * Process attribute mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of attribute mutations
   */
  private processAttributeMutations(mutationsData: any[]): AttributeMutation[] {
    const mutations: AttributeMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // Calculate the total attribute boost percentage
          let totalBoost = 0;
          if (data.attributeBonuses) {
            // Get the primary attribute for this role
            const primaryAttribute = RoleToAttributeType[group.role];

            // Apply the attribute boost for the primary attribute
            if (data.attributeBonuses[primaryAttribute]) {
              totalBoost += data.attributeBonuses[primaryAttribute];
            }

            // Apply boosts for other attributes (at reduced effectiveness)
            for (const [attr, boost] of Object.entries(data.attributeBonuses)) {
              if (attr !== primaryAttribute) {
                totalBoost += (boost as number) * 0.5; // 50% effectiveness for non-primary attributes
              }
            }
          }

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (totalBoost / 100))
          );

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: AttributeMutation = {
          id: data.id || createMutationId(MutationCategory.ATTRIBUTE, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.ATTRIBUTE,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          attributeBonuses: data.attributeBonuses || {},
          multiplier: data.multiplier || 1 + (this.getAttributeBoostForRarity(data.rarity) / 100),
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_attribute_boost_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing attribute mutation:', error, data);
      }
    }

    return mutations;
  }

  /**
   * Process particle mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of particle mutations
   */
  private processParticleMutations(mutationsData: any[]): ParticleMutation[] {
    const mutations: ParticleMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply particle count change if specified
          if (data.particleCountChange) {
            updatedGroup.particles += data.particleCountChange;
          }

          // Apply attribute boost based on particle changes
          if (data.particleCountChange) {
            // Attribute boost based on new particles (each particle adds a small percentage)
            const particleBoost = data.particleCountChange * 0.5; // 0.5% per particle
            updatedGroup.attributeValue = Math.floor(
              updatedGroup.attributeValue * (1 + (particleBoost / 100))
            );
          }

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: ParticleMutation = {
          id: data.id || createMutationId(MutationCategory.PARTICLE, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.PARTICLE,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          particleCountChange: data.particleCountChange || this.getParticleCountBoostForRarity(data.rarity),
          particlePropertyChanges: data.particlePropertyChanges,
          particleDistribution: data.particleDistribution,
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_particle_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing particle mutation:', error, data);
      }
    }

    return mutations;
  }

  /**
   * Process ability mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of ability mutations
   */
  private processAbilityMutations(mutationsData: any[]): AbilityMutation[] {
    const mutations: AbilityMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply ability effects
          // Note: In a real implementation, this would modify the creature's abilities
          // For now, we'll just apply an attribute boost based on the ability effects
          let totalBoost = 0;

          if (data.abilityEffects) {
            // Calculate total boost from ability effects
            if (data.abilityEffects.damageBoost) {
              totalBoost += data.abilityEffects.damageBoost * 0.5; // 50% effectiveness for attribute
            }
            if (data.abilityEffects.cooldownReduction) {
              totalBoost += data.abilityEffects.cooldownReduction * 0.3; // 30% effectiveness for attribute
            }
            if (data.abilityEffects.rangeBoost) {
              totalBoost += data.abilityEffects.rangeBoost * 0.2; // 20% effectiveness for attribute
            }
            if (data.abilityEffects.durationBoost) {
              totalBoost += data.abilityEffects.durationBoost * 0.2; // 20% effectiveness for attribute
            }
            if (data.abilityEffects.costReduction) {
              totalBoost += data.abilityEffects.costReduction * 0.3; // 30% effectiveness for attribute
            }
            if (data.abilityEffects.additionalCharges) {
              totalBoost += data.abilityEffects.additionalCharges * 20; // 20% per additional charge
            }
          }

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (totalBoost / 100))
          );

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: AbilityMutation = {
          id: data.id || createMutationId(MutationCategory.ABILITY, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.ABILITY,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          newAbilityId: data.newAbilityId,
          abilityModifications: data.abilityEffects,
          abilityType: data.abilityType || 'damage',
          cooldownReduction: data.abilityEffects?.cooldownReduction,
          damageIncrease: data.abilityEffects?.damageBoost,
          rangeIncrease: data.abilityEffects?.rangeBoost,
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_ability_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing ability mutation:', error, data);
      }
    }

    return mutations;
  }

  /**
   * Get the synergy boost for a rarity tier
   * @param rarity The rarity tier
   * @returns The synergy boost percentage
   */
  private getSynergyBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 3;
      case Rarity.UNCOMMON:
        return 7;
      case Rarity.RARE:
        return 15;
      case Rarity.EPIC:
        return 25;
      case Rarity.LEGENDARY:
        return 40;
      case Rarity.MYTHIC:
        return 75;
      default:
        return 5;
    }
  }

  /**
   * Process synergy mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of synergy mutations
   */
  private processSynergyMutations(mutationsData: any[]): SynergyMutation[] {
    const mutations: SynergyMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply synergy effects
          // Note: In a real implementation, this would check for other groups and apply synergy effects
          // For now, we'll just apply a small attribute boost
          const synergyBoost = data.synergyBonus || this.getSynergyBoostForRarity(data.rarity);

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (synergyBoost / 100))
          );

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: SynergyMutation = {
          id: data.id || createMutationId(MutationCategory.SYNERGY, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.SYNERGY,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          targetRoles: data.targetRoles || [],
          synergyBonus: data.synergyBonus || this.getSynergyBoostForRarity(data.rarity),
          synergyType: data.synergyType || 'attribute',
          synergyEffect: data.synergyEffect || 'Provides a synergy bonus when specific roles are present',
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_synergy_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing synergy mutation:', error, data);
      }
    }

    return mutations;
  }

  /**
   * Process subclass mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of subclass mutations
   */
  private processSubclassMutations(mutationsData: any[]): SubclassMutation[] {
    const mutations: SubclassMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // In a real implementation, this would change the subclass
          // For now, we'll just apply an attribute boost
          const subclassBoost = this.getSubclassBoostForRarity(data.rarity);

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (subclassBoost / 100))
          );

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: SubclassMutation = {
          id: data.id || createMutationId(MutationCategory.SUBCLASS, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.SUBCLASS,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          newSubclassId: data.newSubclass || '',
          hybridSubclassIds: data.hybridSubclassIds,
          tierChange: data.tierChange,
          specialization: data.specialization,
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_subclass_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing subclass mutation:', error, data);
      }
    }

    return mutations;
  }

  /**
   * Get the subclass boost for a rarity tier
   * @param rarity The rarity tier
   * @returns The subclass boost percentage
   */
  private getSubclassBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 20;
      case Rarity.EPIC:
        return 35;
      case Rarity.LEGENDARY:
        return 50;
      case Rarity.MYTHIC:
        return 100;
      default:
        return 5;
    }
  }

  /**
   * Process formation mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of formation mutations
   */
  private processFormationMutations(mutationsData: any[]): FormationMutation[] {
    const mutations: FormationMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // In a real implementation, this would change the formation
          // For now, we'll just apply an attribute boost
          const formationBoost = this.getFormationBoostForRarity(data.rarity);

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (formationBoost / 100))
          );

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: FormationMutation = {
          id: data.id || createMutationId(MutationCategory.FORMATION, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.FORMATION,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          newFormationId: data.newFormation || '',
          densityChange: data.densityChange,
          patternChange: data.patternChange,
          rangeChange: data.rangeChange,
          stabilityChange: data.stabilityChange,
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_formation_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing formation mutation:', error, data);
      }
    }

    return mutations;
  }

  /**
   * Get the formation boost for a rarity tier
   * @param rarity The rarity tier
   * @returns The formation boost percentage
   */
  private getFormationBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 20;
      case Rarity.EPIC:
        return 35;
      case Rarity.LEGENDARY:
        return 50;
      case Rarity.MYTHIC:
        return 100;
      default:
        return 5;
    }
  }

  /**
   * Process behavior mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of behavior mutations
   */
  private processBehaviorMutations(mutationsData: any[]): BehaviorMutation[] {
    const mutations: BehaviorMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // In a real implementation, this would change the behavior
          // For now, we'll just apply an attribute boost
          const behaviorBoost = this.getBehaviorBoostForRarity(data.rarity);

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (behaviorBoost / 100))
          );

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: BehaviorMutation = {
          id: data.id || createMutationId(MutationCategory.BEHAVIOR, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.BEHAVIOR,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          newBehaviorId: data.newBehavior || '',
          speedChange: data.speedChange,
          aggressionChange: data.aggressionChange,
          cohesionChange: data.cohesionChange,
          patternChange: data.patternChange,
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_behavior_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing behavior mutation:', error, data);
      }
    }

    return mutations;
  }

  /**
   * Get the behavior boost for a rarity tier
   * @param rarity The rarity tier
   * @returns The behavior boost percentage
   */
  private getBehaviorBoostForRarity(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 20;
      case Rarity.EPIC:
        return 35;
      case Rarity.LEGENDARY:
        return 50;
      case Rarity.MYTHIC:
        return 100;
      default:
        return 5;
    }
  }

  /**
   * Process exotic mutations from JSON data
   * @param mutationsData The raw mutation data from JSON
   * @returns An array of exotic mutations
   */
  private processExoticMutations(mutationsData: any[]): ExoticMutation[] {
    const mutations: ExoticMutation[] = [];

    for (const data of mutationsData) {
      try {
        // Create the apply effect function
        const applyEffect = (group: CreatureGroup): CreatureGroup => {
          // Clone the group
          const updatedGroup = { ...group };

          // Apply exotic effects
          // For now, we'll just apply a large attribute boost
          const exoticBoost = data.exoticBoost || this.getExoticBoostForRarity(data.rarity);

          // Apply the attribute boost
          updatedGroup.attributeValue = Math.floor(
            updatedGroup.attributeValue * (1 + (exoticBoost / 100))
          );

          return updatedGroup;
        };

        // Create the mutation object
        const mutation: ExoticMutation = {
          id: data.id || createMutationId(MutationCategory.EXOTIC, data.compatibleRoles[0], data.rarity, mutations.length),
          name: data.name,
          description: data.description,
          category: MutationCategory.EXOTIC,
          rarity: data.rarity,
          confirmationThreshold: data.confirmationThreshold || this.getConfirmationThresholdForRarity(data.rarity),
          appliedAt: 0, // Will be set when applied
          uniqueEffectId: data.exoticEffect || 'exotic_boost',
          globalEffect: data.globalEffect || true,
          transformationEffect: data.transformationEffect,
          specialAbility: data.specialAbility,
          evolutionPath: data.evolutionPath,
          applyEffect,
          visualEffect: data.visualEffect || `${data.compatibleRoles[0].toLowerCase()}_exotic_effect`,
          compatibleRoles: data.compatibleRoles || [Role.CORE],
          incompatibleWith: data.incompatibleWith,
          requiresMutations: data.requiresMutations
        };

        mutations.push(mutation);
      } catch (error) {
        console.error('Error processing exotic mutation:', error, data);
      }
    }

    return mutations;
  }
}

/**
 * Get the mutation bank loader instance
 * @returns The mutation bank loader instance
 */
export function getMutationBankLoader(): MutationBankLoader {
  return MutationBankLoader.getInstance();
}

