/**
 * Formation Factory for Bitcoin Protozoa
 *
 * This service is responsible for creating and managing formations.
 * It provides methods for creating formations from templates, generating
 * formation IDs, and mutating formations based on evolution parameters.
 */

import { Role } from '../../types/core';
import { Formation, FormationPattern, FormationPatternType, FormationEffect, FormationEffectType } from '../../types/formations/formation';
import { Tier } from '../../types/abilities/ability';
import { RNGSystem, RNGStream } from '../../types/utils/rng';
import { hashString } from '../../lib/rngSystem';

/**
 * Singleton class for creating and managing formations
 */
export class FormationFactory {
  private static instance: FormationFactory;
  private rngSystem: RNGSystem | null = null;
  private formationRng: RNGStream | null = null;
  private initialized = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   * @returns The FormationFactory instance
   */
  public static getInstance(): FormationFactory {
    if (!FormationFactory.instance) {
      FormationFactory.instance = new FormationFactory();
    }
    return FormationFactory.instance;
  }

  /**
   * Initialize the formation factory with an RNG system
   * @param rngSystem The RNG system to use
   */
  public initialize(rngSystem: RNGSystem): void {
    this.rngSystem = rngSystem;
    this.formationRng = rngSystem.getStream('formation');
    this.initialized = true;
    console.log('Formation factory initialized with RNG system');
  }

  /**
   * Check if the factory is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a formation
   * @param role The role of the formation
   * @param tier The tier of the formation
   * @param subclass The subclass of the formation
   * @returns A new formation
   */
  public createFormation(role: Role, tier: Tier, subclass: string): Formation {
    if (!this.initialized || !this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Generate a unique ID for the formation
    const id = this.generateFormationId(role, tier, subclass);

    // Determine the pattern type based on role and tier
    const patternType = this.getPatternTypeForRole(role, tier);

    // Create the formation pattern
    const pattern = this.createFormationPattern(patternType, tier);

    // Create the formation effect
    const effect = this.createFormationEffect(role, tier);

    // Create the formation
    const formation: Formation = {
      name: `${subclass} ${patternType} Formation`,
      description: this.generateFormationDescription(role, patternType, tier),
      role,
      tier,
      subclass,
      pattern,
      effect
    };

    return formation;
  }

  /**
   * Create a formation from a template
   * @param template The template to use
   * @returns A new formation based on the template
   */
  public createFormationFromTemplate(template: Partial<Formation>): Formation {
    if (!this.initialized || !this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Ensure required fields are present
    if (!template.role || !template.tier || !template.subclass) {
      throw new Error('Template missing required fields: role, tier, or subclass');
    }

    // Generate a unique ID for the formation
    const id = this.generateFormationId(template.role, template.tier, template.subclass);

    // Use template values or generate defaults
    const patternType = template.pattern?.type || this.getPatternTypeForRole(template.role, template.tier);
    const pattern = template.pattern || this.createFormationPattern(patternType, template.tier);
    const effect = template.effect || this.createFormationEffect(template.role, template.tier);

    // Create the formation
    const formation: Formation = {
      name: template.name || `${template.subclass} ${patternType} Formation`,
      description: template.description || this.generateFormationDescription(template.role, patternType, template.tier),
      role: template.role,
      tier: template.tier,
      subclass: template.subclass,
      pattern,
      effect
    };

    return formation;
  }

  /**
   * Generate a unique ID for a formation
   * @param role The role of the formation
   * @param tier The tier of the formation
   * @param subclass The subclass of the formation
   * @returns A unique ID
   */
  public generateFormationId(role: Role, tier: Tier, subclass: string): string {
    // Create a deterministic ID based on the inputs
    const baseString = `formation_${role}_${tier}_${subclass}_${Date.now()}`;
    const hash = hashString(baseString).toString(16);
    return `formation_${role.toLowerCase()}_${tier.toLowerCase()}_${hash}`;
  }

  /**
   * Get a pattern type for a role
   * @param role The role to get a pattern type for
   * @param tier The tier of the formation
   * @returns A formation pattern type
   */
  private getPatternTypeForRole(role: Role, tier: Tier): FormationPatternType {
    if (!this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Define role-specific formation types
    const roleFormations: Record<Role, FormationPatternType[]> = {
      [Role.CORE]: [
        FormationPatternType.NUCLEUS,
        FormationPatternType.SHIELD,
        FormationPatternType.WEB
      ],
      [Role.CONTROL]: [
        FormationPatternType.WEB,
        FormationPatternType.VORTEX,
        FormationPatternType.SWARM
      ],
      [Role.MOVEMENT]: [
        FormationPatternType.ARROW,
        FormationPatternType.WAVE,
        FormationPatternType.VORTEX
      ],
      [Role.DEFENSE]: [
        FormationPatternType.SHIELD,
        FormationPatternType.PHALANX,
        FormationPatternType.WEB
      ],
      [Role.ATTACK]: [
        FormationPatternType.ARROW,
        FormationPatternType.SWARM,
        FormationPatternType.PHALANX
      ]
    };

    // Get formation types for the role
    const formationTypes = roleFormations[role] || [FormationPatternType.SWARM];

    // Higher tier formations have more specific patterns
    if (tier === Tier.LEGENDARY || tier === Tier.MYTHIC) {
      // For legendary and mythic, use the most specialized formation for the role
      return formationTypes[formationTypes.length - 1];
    } else if (tier === Tier.EPIC || tier === Tier.RARE) {
      // For epic and rare, use the second formation type if available
      return formationTypes[Math.min(1, formationTypes.length - 1)];
    } else {
      // For common and uncommon, use a random formation type
      return formationTypes[this.formationRng.nextInt(0, formationTypes.length)];
    }
  }

  /**
   * Create a formation pattern
   * @param type The pattern type
   * @param tier The tier of the formation
   * @returns A formation pattern
   */
  private createFormationPattern(type: FormationPatternType, tier: Tier): FormationPattern {
    if (!this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Base values for the pattern
    let density = 0.5;
    let cohesion = 0.5;
    let flexibility = 0.5;

    // Adjust values based on tier
    switch (tier) {
      case Tier.COMMON:
        // Common formations are loose and flexible
        density = this.formationRng.nextFloat(0.3, 0.5);
        cohesion = this.formationRng.nextFloat(0.3, 0.5);
        flexibility = this.formationRng.nextFloat(0.6, 0.8);
        break;
      case Tier.UNCOMMON:
        // Uncommon formations are balanced
        density = this.formationRng.nextFloat(0.4, 0.6);
        cohesion = this.formationRng.nextFloat(0.4, 0.6);
        flexibility = this.formationRng.nextFloat(0.5, 0.7);
        break;
      case Tier.RARE:
        // Rare formations are more cohesive
        density = this.formationRng.nextFloat(0.5, 0.7);
        cohesion = this.formationRng.nextFloat(0.5, 0.7);
        flexibility = this.formationRng.nextFloat(0.4, 0.6);
        break;
      case Tier.EPIC:
        // Epic formations are dense and cohesive
        density = this.formationRng.nextFloat(0.6, 0.8);
        cohesion = this.formationRng.nextFloat(0.6, 0.8);
        flexibility = this.formationRng.nextFloat(0.3, 0.5);
        break;
      case Tier.LEGENDARY:
        // Legendary formations are very dense and cohesive
        density = this.formationRng.nextFloat(0.7, 0.9);
        cohesion = this.formationRng.nextFloat(0.7, 0.9);
        flexibility = this.formationRng.nextFloat(0.2, 0.4);
        break;
      case Tier.MYTHIC:
        // Mythic formations are extremely dense and cohesive
        density = this.formationRng.nextFloat(0.8, 1.0);
        cohesion = this.formationRng.nextFloat(0.8, 1.0);
        flexibility = this.formationRng.nextFloat(0.1, 0.3);
        break;
    }

    // Create pattern-specific parameters
    const parameters: Record<string, number> = {};

    // Add parameters based on pattern type
    switch (type) {
      case FormationPatternType.NUCLEUS:
        parameters.radius = this.formationRng.nextFloat(5, 15);
        parameters.layers = this.formationRng.nextInt(2, 5);
        break;
      case FormationPatternType.ARROW:
        parameters.length = this.formationRng.nextFloat(10, 30);
        parameters.width = this.formationRng.nextFloat(5, 15);
        parameters.angle = this.formationRng.nextFloat(30, 60);
        break;
      case FormationPatternType.SHIELD:
        parameters.radius = this.formationRng.nextFloat(10, 20);
        parameters.thickness = this.formationRng.nextFloat(2, 5);
        parameters.coverage = this.formationRng.nextFloat(0.6, 0.9);
        break;
      case FormationPatternType.WEB:
        parameters.radius = this.formationRng.nextFloat(10, 25);
        parameters.connections = this.formationRng.nextInt(3, 8);
        parameters.layers = this.formationRng.nextInt(2, 4);
        break;
      case FormationPatternType.SWARM:
        parameters.radius = this.formationRng.nextFloat(15, 30);
        parameters.clusterCount = this.formationRng.nextInt(3, 8);
        parameters.clusterSize = this.formationRng.nextFloat(3, 8);
        break;
      case FormationPatternType.VORTEX:
        parameters.radius = this.formationRng.nextFloat(10, 20);
        parameters.height = this.formationRng.nextFloat(5, 15);
        parameters.rotationSpeed = this.formationRng.nextFloat(0.5, 2.0);
        break;
      case FormationPatternType.PHALANX:
        parameters.rows = this.formationRng.nextInt(3, 8);
        parameters.columns = this.formationRng.nextInt(5, 12);
        parameters.spacing = this.formationRng.nextFloat(2, 5);
        break;
      case FormationPatternType.WAVE:
        parameters.amplitude = this.formationRng.nextFloat(5, 15);
        parameters.frequency = this.formationRng.nextFloat(0.1, 0.5);
        parameters.speed = this.formationRng.nextFloat(0.5, 2.0);
        break;
    }

    // Create the formation pattern
    return {
      type,
      density,
      cohesion,
      flexibility,
      parameters
    };
  }

  /**
   * Create a formation effect
   * @param role The role of the formation
   * @param tier The tier of the formation
   * @returns A formation effect
   */
  private createFormationEffect(role: Role, tier: Tier): FormationEffect {
    if (!this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Define role-specific effect types
    const roleEffects: Record<Role, FormationEffectType[]> = {
      [Role.CORE]: [
        FormationEffectType.SYNERGY,
        FormationEffectType.HEALING,
        FormationEffectType.SHIELD
      ],
      [Role.CONTROL]: [
        FormationEffectType.CONTROL,
        FormationEffectType.DISRUPTION,
        FormationEffectType.SYNERGY
      ],
      [Role.MOVEMENT]: [
        FormationEffectType.SPEED_BOOST,
        FormationEffectType.SYNERGY,
        FormationEffectType.DISRUPTION
      ],
      [Role.DEFENSE]: [
        FormationEffectType.DEFENSE_BOOST,
        FormationEffectType.SHIELD,
        FormationEffectType.HEALING
      ],
      [Role.ATTACK]: [
        FormationEffectType.DAMAGE_BOOST,
        FormationEffectType.DISRUPTION,
        FormationEffectType.SPEED_BOOST
      ]
    };

    // Get effect types for the role
    const effectTypes = roleEffects[role] || [FormationEffectType.SYNERGY];

    // Select effect type based on tier
    let effectType: FormationEffectType;
    if (tier === Tier.LEGENDARY || tier === Tier.MYTHIC) {
      // For legendary and mythic, use the most specialized effect for the role
      effectType = effectTypes[effectTypes.length - 1];
    } else if (tier === Tier.EPIC || tier === Tier.RARE) {
      // For epic and rare, use the second effect type if available
      effectType = effectTypes[Math.min(1, effectTypes.length - 1)];
    } else {
      // For common and uncommon, use the first effect type
      effectType = effectTypes[0];
    }

    // Base effect strength based on tier
    let strength = 0.0;
    switch (tier) {
      case Tier.COMMON:
        strength = this.formationRng.nextFloat(0.1, 0.3);
        break;
      case Tier.UNCOMMON:
        strength = this.formationRng.nextFloat(0.2, 0.4);
        break;
      case Tier.RARE:
        strength = this.formationRng.nextFloat(0.3, 0.5);
        break;
      case Tier.EPIC:
        strength = this.formationRng.nextFloat(0.4, 0.6);
        break;
      case Tier.LEGENDARY:
        strength = this.formationRng.nextFloat(0.5, 0.8);
        break;
      case Tier.MYTHIC:
        strength = this.formationRng.nextFloat(0.7, 1.0);
        break;
    }

    // Create the formation effect
    return {
      type: effectType,
      strength,
      duration: this.formationRng.nextFloat(5, 15),
      radius: this.formationRng.nextFloat(10, 30),
      conditions: {
        requiresFullFormation: tier === Tier.LEGENDARY || tier === Tier.MYTHIC,
        minimumParticleCount: this.formationRng.nextInt(5, 20),
        activationThreshold: this.formationRng.nextFloat(0.5, 0.9)
      }
    };
  }

  /**
   * Generate a description for a formation
   * @param role The role of the formation
   * @param patternType The pattern type of the formation
   * @param tier The tier of the formation
   * @returns A description for the formation
   */
  private generateFormationDescription(role: Role, patternType: FormationPatternType, tier: Tier): string {
    // Base descriptions for each pattern type
    const patternDescriptions: Record<FormationPatternType, string> = {
      [FormationPatternType.NUCLEUS]: 'A dense, central formation that provides stability',
      [FormationPatternType.ARROW]: 'A forward-pointing formation optimized for attack',
      [FormationPatternType.SHIELD]: 'A defensive barrier formation that protects allies',
      [FormationPatternType.WEB]: 'A complex, interconnected formation with high adaptability',
      [FormationPatternType.SWARM]: 'A loose, adaptable formation that surrounds enemies',
      [FormationPatternType.VORTEX]: 'A spinning, cyclone-like formation that disrupts enemies',
      [FormationPatternType.PHALANX]: 'A tight, grid-like formation with strong defense',
      [FormationPatternType.WAVE]: 'An undulating, wave-like formation with high mobility'
    };

    // Role-specific descriptions
    const roleDescriptions: Record<Role, string> = {
      [Role.CORE]: 'enhancing the core stability of the creature',
      [Role.CONTROL]: 'providing precise control over the creature\'s movements',
      [Role.MOVEMENT]: 'maximizing the creature\'s mobility and speed',
      [Role.DEFENSE]: 'creating a robust defensive perimeter',
      [Role.ATTACK]: 'optimizing offensive capabilities'
    };

    // Tier-specific adjectives
    const tierAdjectives: Record<Tier, string> = {
      [Tier.COMMON]: 'basic',
      [Tier.UNCOMMON]: 'improved',
      [Tier.RARE]: 'advanced',
      [Tier.EPIC]: 'exceptional',
      [Tier.LEGENDARY]: 'extraordinary',
      [Tier.MYTHIC]: 'transcendent'
    };

    // Get the base description for the pattern type
    const patternDescription = patternDescriptions[patternType] || 'A formation of particles';

    // Get the role-specific description
    const roleDescription = roleDescriptions[role] || 'serving a specialized function';

    // Get the tier-specific adjective
    const tierAdjective = tierAdjectives[tier] || 'standard';

    // Combine the descriptions
    return `${patternDescription}, ${roleDescription}. This ${tierAdjective} formation provides unique tactical advantages.`;
  }

  /**
   * Mutate a formation based on evolution parameters
   * @param formation The formation to mutate
   * @param mutationStrength The strength of the mutation (0-1)
   * @returns A mutated formation
   */
  public mutateFormation(formation: Formation, mutationStrength: number): Formation {
    if (!this.initialized || !this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Clone the formation
    const mutatedFormation: Formation = { ...formation };

    // Mutate the pattern
    mutatedFormation.pattern = this.mutateFormationPattern(formation.pattern, mutationStrength);

    // Mutate the effect
    mutatedFormation.effect = this.mutateFormationEffect(formation.effect, mutationStrength);

    return mutatedFormation;
  }

  /**
   * Mutate a formation pattern
   * @param pattern The pattern to mutate
   * @param mutationStrength The strength of the mutation (0-1)
   * @returns A mutated pattern
   */
  private mutateFormationPattern(pattern: FormationPattern, mutationStrength: number): FormationPattern {
    if (!this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Clone the pattern
    const mutatedPattern: FormationPattern = { ...pattern };

    // Determine if we should mutate each property based on mutation strength
    const shouldMutateDensity = this.formationRng.nextFloat(0, 1) < mutationStrength;
    const shouldMutateCohesion = this.formationRng.nextFloat(0, 1) < mutationStrength;
    const shouldMutateFlexibility = this.formationRng.nextFloat(0, 1) < mutationStrength;
    const shouldMutateParameters = this.formationRng.nextFloat(0, 1) < mutationStrength;

    // Mutate density
    if (shouldMutateDensity) {
      const densityChange = this.formationRng.nextFloat(-0.2, 0.2) * mutationStrength;
      mutatedPattern.density = Math.max(0, Math.min(1, pattern.density + densityChange));
    }

    // Mutate cohesion
    if (shouldMutateCohesion) {
      const cohesionChange = this.formationRng.nextFloat(-0.2, 0.2) * mutationStrength;
      mutatedPattern.cohesion = Math.max(0, Math.min(1, pattern.cohesion + cohesionChange));
    }

    // Mutate flexibility
    if (shouldMutateFlexibility) {
      const flexibilityChange = this.formationRng.nextFloat(-0.2, 0.2) * mutationStrength;
      mutatedPattern.flexibility = Math.max(0, Math.min(1, pattern.flexibility + flexibilityChange));
    }

    // Mutate parameters
    if (shouldMutateParameters) {
      // Clone the parameters
      mutatedPattern.parameters = { ...pattern.parameters };

      // Mutate each parameter
      for (const [key, value] of Object.entries(pattern.parameters)) {
        const shouldMutateParameter = this.formationRng.nextFloat(0, 1) < mutationStrength;
        if (shouldMutateParameter) {
          const parameterChange = value * this.formationRng.nextFloat(-0.2, 0.2) * mutationStrength;
          mutatedPattern.parameters[key] = Math.max(0, value + parameterChange);
        }
      }
    }

    return mutatedPattern;
  }

  /**
   * Mutate a formation effect
   * @param effect The effect to mutate
   * @param mutationStrength The strength of the mutation (0-1)
   * @returns A mutated effect
   */
  private mutateFormationEffect(effect: FormationEffect, mutationStrength: number): FormationEffect {
    if (!this.formationRng) {
      throw new Error('Formation factory not initialized');
    }

    // Clone the effect
    const mutatedEffect: FormationEffect = { ...effect };

    // Determine if we should mutate each property based on mutation strength
    const shouldMutateStrength = this.formationRng.nextFloat(0, 1) < mutationStrength;
    const shouldMutateDuration = this.formationRng.nextFloat(0, 1) < mutationStrength;
    const shouldMutateRadius = this.formationRng.nextFloat(0, 1) < mutationStrength;
    const shouldMutateConditions = this.formationRng.nextFloat(0, 1) < mutationStrength;

    // Mutate strength
    if (shouldMutateStrength) {
      const strengthChange = this.formationRng.nextFloat(-0.1, 0.1) * mutationStrength;
      mutatedEffect.strength = Math.max(0, Math.min(1, effect.strength + strengthChange));
    }

    // Mutate duration
    if (shouldMutateDuration) {
      const durationChange = effect.duration * this.formationRng.nextFloat(-0.2, 0.2) * mutationStrength;
      mutatedEffect.duration = Math.max(1, effect.duration + durationChange);
    }

    // Mutate radius
    if (shouldMutateRadius) {
      const radiusChange = effect.radius * this.formationRng.nextFloat(-0.2, 0.2) * mutationStrength;
      mutatedEffect.radius = Math.max(5, effect.radius + radiusChange);
    }

    // Mutate conditions
    if (shouldMutateConditions) {
      // Clone the conditions
      mutatedEffect.conditions = { ...effect.conditions };

      // Mutate minimum particle count
      const shouldMutateMinParticles = this.formationRng.nextFloat(0, 1) < mutationStrength;
      if (shouldMutateMinParticles) {
        const minParticlesChange = Math.round(effect.conditions.minimumParticleCount * this.formationRng.nextFloat(-0.2, 0.2) * mutationStrength);
        mutatedEffect.conditions.minimumParticleCount = Math.max(1, effect.conditions.minimumParticleCount + minParticlesChange);
      }

      // Mutate activation threshold
      const shouldMutateThreshold = this.formationRng.nextFloat(0, 1) < mutationStrength;
      if (shouldMutateThreshold) {
        const thresholdChange = this.formationRng.nextFloat(-0.1, 0.1) * mutationStrength;
        mutatedEffect.conditions.activationThreshold = Math.max(0.1, Math.min(0.9, effect.conditions.activationThreshold + thresholdChange));
      }
    }

    return mutatedEffect;
  }
}

/**
 * Get the formation factory instance
 * @returns The formation factory instance
 */
export function getFormationFactory(): FormationFactory {
  return FormationFactory.getInstance();
}

