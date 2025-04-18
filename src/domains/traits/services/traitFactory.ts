/**
 * Trait Factory
 *
 * Factory for creating traits.
 */

import { v4 as uuidv4 } from 'uuid';
import { Role, Rarity, FalloffType, ForceType, BehaviorType, AbilityType } from '../../../shared/types/core';
import {
  BaseTrait,
  VisualTrait,
  FormationTrait,
  BehaviorTrait,
  ForceCalculationTrait,
  ClassBonusTrait,
  SubclassTrait
} from '../types/trait';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { createRNGFromBlock } from '../../../shared/lib/rngSystem';
import { Logging } from '../../../shared/utils';

// Create logger
const logger = Logging.createLogger('TraitFactory');

/**
 * Create a trait with default values
 * @param role The role for the trait
 * @param rarity The rarity of the trait
 * @param category The trait category
 * @returns A base trait
 */
export function createBaseTrait(role: Role, rarity: Rarity, category: string): BaseTrait {
  return {
    id: uuidv4(),
    name: `${role} ${category} Trait`,
    description: `A ${rarity.toLowerCase()} ${category} trait for ${role} particles`,
    rarityTier: rarity,
    role,
    evolutionParameters: {
      mutationChance: getMutationChanceForRarity(rarity),
      possibleEvolutions: []
    }
  };
}

/**
 * Create a visual trait
 * @param role The role for the trait
 * @param rarity The rarity of the trait
 * @param blockData Optional block data for RNG
 * @returns A visual trait
 */
export function createVisualTrait(role: Role, rarity: Rarity, blockData?: BlockData): VisualTrait {
  const baseTrait = createBaseTrait(role, rarity, 'Visual');

  // Use RNG if block data is provided
  let shape = `${role.toLowerCase()}_shape_1`;
  let color = '#FFFFFF';
  let effect = `${role.toLowerCase()}_effect_1`;
  let scale = 1.0;

  if (blockData) {
    const rng = createRNGFromBlock(blockData);
    const stream = rng.getStream(`visual_${role}`);

    // Generate random values
    const shapeIndex = stream.nextInt(1, 5);
    shape = `${role.toLowerCase()}_shape_${shapeIndex}`;

    // Generate random color
    const r = stream.nextInt(0, 255);
    const g = stream.nextInt(0, 255);
    const b = stream.nextInt(0, 255);
    color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    // Generate random effect
    const effectIndex = stream.nextInt(1, 3);
    effect = `${role.toLowerCase()}_effect_${effectIndex}`;

    // Generate random scale based on rarity
    scale = 1.0 + (getRarityValue(rarity) * 0.1) + (stream.next() * 0.2);
  }

  return {
    ...baseTrait,
    shape,
    colorScheme: color,
    visualEffect: effect,
    renderingProperties: {
      geometry: `${role.toLowerCase()}_geometry`,
      material: `${role.toLowerCase()}_material`,
      scale,
      emissive: true,
      opacity: 1.0,
      colorHex: color
    },
    animationProperties: {
      pulseRate: 0.5,
      rotationSpeed: 0.2,
      trailLength: 0
    }
  };
}

/**
 * Create a formation trait
 * @param role The role for the trait
 * @param rarity The rarity of the trait
 * @param blockData Optional block data for RNG
 * @returns A formation trait
 */
export function createFormationTrait(role: Role, rarity: Rarity, blockData?: BlockData): FormationTrait {
  const baseTrait = createBaseTrait(role, rarity, 'Formation');

  // Default values
  let pattern = 'circle';
  let physicsLogic = {
    stiffness: 0.5,
    range: 10,
    falloff: FalloffType.LINEAR,
    targetFunction: `${role.toLowerCase()}_target_1`,
    additionalParameters: {}
  };
  let visualProperties = {
    baseColor: '#FFFFFF',
    particleScale: 1.0,
    trailEffect: false
  };

  // Use RNG if block data is provided
  if (blockData) {
    const rng = createRNGFromBlock(blockData);
    const stream = rng.getStream(`formation_${role}`);

    // Generate random values
    const patterns = ['circle', 'grid', 'spiral', 'vortex', 'wave', 'cluster'];
    pattern = patterns[stream.nextInt(0, patterns.length - 1)];

    const falloffs = [FalloffType.LINEAR, FalloffType.QUADRATIC, FalloffType.EXPONENTIAL, FalloffType.NONE];
    const falloff = falloffs[stream.nextInt(0, falloffs.length - 1)];

    // Generate random physics logic
    physicsLogic = {
      stiffness: 0.5 + (stream.next() * 0.5),
      range: 10 + (stream.nextInt(0, 10)),
      falloff,
      targetFunction: `${role.toLowerCase()}_target_${stream.nextInt(1, 3)}`,
      additionalParameters: {}
    };

    // Generate random visual properties
    const r = stream.nextInt(0, 255);
    const g = stream.nextInt(0, 255);
    const b = stream.nextInt(0, 255);
    const baseColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    visualProperties = {
      baseColor,
      particleScale: 1.0 + (stream.next() * 0.5),
      trailEffect: stream.next() < 0.5
    };
  }

  return {
    ...baseTrait,
    pattern,
    physicsLogic,
    visualProperties
  };
}

/**
 * Create a behavior trait
 * @param role The role for the trait
 * @param rarity The rarity of the trait
 * @param blockData Optional block data for RNG
 * @returns A behavior trait
 */
export function createBehaviorTrait(role: Role, rarity: Rarity, blockData?: BlockData): BehaviorTrait {
  const baseTrait = createBaseTrait(role, rarity, 'Behavior');

  // Default values
  let type = BehaviorType.FLOCKING;
  let physicsLogic = {
    strength: 0.5,
    range: 10,
    priority: 1,
    persistence: 0.5,
    frequency: 0.5,
    additionalParameters: {}
  };
  let visualEffects = {
    particleEffect: `${role.toLowerCase()}_particle_effect_1`,
    trailEffect: `${role.toLowerCase()}_trail_effect_1`,
    colorModulation: false
  };

  // Use RNG if block data is provided
  if (blockData) {
    const rng = createRNGFromBlock(blockData);
    const stream = rng.getStream(`behavior_${role}`);

    // Generate random values
    const types = [BehaviorType.FLOCKING, BehaviorType.PATTERN, BehaviorType.PREDATOR, BehaviorType.PREY, BehaviorType.SWARM];
    type = types[stream.nextInt(0, types.length - 1)];

    // Generate random physics logic
    physicsLogic = {
      strength: 0.5 + (stream.next() * 0.5),
      range: 10 + (stream.nextInt(0, 10)),
      priority: stream.nextInt(1, 5),
      persistence: 0.5 + (stream.next() * 0.5),
      frequency: 0.5 + (stream.next() * 0.5),
      additionalParameters: {}
    };

    // Generate random visual effects
    visualEffects = {
      particleEffect: `${role.toLowerCase()}_particle_effect_${stream.nextInt(1, 3)}`,
      trailEffect: `${role.toLowerCase()}_trail_effect_${stream.nextInt(1, 3)}`,
      colorModulation: stream.next() < 0.5
    };
  }

  return {
    ...baseTrait,
    type,
    physicsLogic,
    visualEffects
  };
}

/**
 * Create a force calculation trait
 * @param role The role for the trait
 * @param rarity The rarity of the trait
 * @param blockData Optional block data for RNG
 * @returns A force calculation trait
 */
export function createForceCalculationTrait(role: Role, rarity: Rarity, blockData?: BlockData): ForceCalculationTrait {
  const baseTrait = createBaseTrait(role, rarity, 'Force Calculation');

  // Default values
  let forceType = ForceType.ATTRACTION;
  let strengthMultiplier = 1.0;
  let rangeMultiplier = 1.0;
  let falloff = FalloffType.LINEAR;
  let targetGroups = [role];
  let physicsLogic = {
    forceFunction: `${role.toLowerCase()}_force_1`,
    thresholdDistance: 5.0,
    maxForce: 10.0
  };
  let visualEffects = {
    forceVisualization: false,
    forceColor: '#FFFFFF'
  };

  // Use RNG if block data is provided
  if (blockData) {
    const rng = createRNGFromBlock(blockData);
    const stream = rng.getStream(`force_${role}`);

    // Generate random values
    const forceTypes = [ForceType.ATTRACTION, ForceType.REPULSION, ForceType.ALIGNMENT, ForceType.COHESION, ForceType.SEPARATION];
    forceType = forceTypes[stream.nextInt(0, forceTypes.length - 1)];

    const falloffs = [FalloffType.LINEAR, FalloffType.QUADRATIC, FalloffType.EXPONENTIAL, FalloffType.NONE];
    falloff = falloffs[stream.nextInt(0, falloffs.length - 1)];

    // Generate random physics logic
    physicsLogic = {
      forceFunction: `${role.toLowerCase()}_force_${stream.nextInt(1, 3)}`,
      thresholdDistance: 5.0 + (stream.next() * 10.0),
      maxForce: 10.0 + (stream.next() * 20.0)
    };

    // Generate random visual effects
    const r = stream.nextInt(0, 255);
    const g = stream.nextInt(0, 255);
    const b = stream.nextInt(0, 255);
    visualEffects = {
      forceVisualization: stream.next() < 0.5,
      forceColor: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    };

    // Generate random multipliers
    strengthMultiplier = 0.5 + (stream.next() * 1.0);
    rangeMultiplier = 0.5 + (stream.next() * 1.0);

    // Generate random target groups
    if (stream.next() < 0.5) {
      // Target all roles
      targetGroups = Object.values(Role);
    } else if (stream.next() < 0.5) {
      // Target a random role
      const roles = Object.values(Role);
      targetGroups = [roles[stream.nextInt(0, roles.length - 1)]];
    } else {
      // Target current role
      targetGroups = [role];
    }
  }

  return {
    ...baseTrait,
    forceType,
    strengthMultiplier,
    rangeMultiplier,
    falloff,
    targetGroups,
    physicsLogic,
    visualEffects
  };
}

/**
 * Create a class bonus trait
 * @param role The role for the trait
 * @param rarity The rarity of the trait
 * @param blockData Optional block data for RNG
 * @returns A class bonus trait
 */
export function createClassBonusTrait(role: Role, rarity: Rarity, blockData?: BlockData): ClassBonusTrait {
  const baseTrait = createBaseTrait(role, rarity, 'Class Bonus');

  // Default values
  let statType = 'HEALTH';
  let bonusAmount = 0.1;
  let physicsLogic = {
    forceMultiplier: 1.0,
    rangeMultiplier: 1.0,
    speedMultiplier: 1.0,
    stabilityMultiplier: 1.0
  };
  let visualEffects = {
    particleGlow: false,
    particleSize: 1.0,
    particleColor: '#FFFFFF'
  };

  // Use RNG if block data is provided
  if (blockData) {
    const rng = createRNGFromBlock(blockData);
    const stream = rng.getStream(`class_bonus_${role}`);

    // Generate random values
    const statTypes = ['HEALTH', 'DAMAGE', 'SPEED', 'DEFENSE', 'ENERGY', 'COOLDOWN'];
    statType = statTypes[stream.nextInt(0, statTypes.length - 1)];

    // Generate random bonus amount based on rarity
    bonusAmount = 0.1 + (getRarityValue(rarity) * 0.05) + (stream.next() * 0.1);

    // Generate random physics logic
    physicsLogic = {
      forceMultiplier: 1.0 + (stream.next() * 0.5),
      rangeMultiplier: 1.0 + (stream.next() * 0.5),
      speedMultiplier: 1.0 + (stream.next() * 0.5),
      stabilityMultiplier: 1.0 + (stream.next() * 0.5)
    };

    // Generate random visual effects
    const r = stream.nextInt(0, 255);
    const g = stream.nextInt(0, 255);
    const b = stream.nextInt(0, 255);
    visualEffects = {
      particleGlow: stream.next() < 0.5,
      particleSize: 1.0 + (stream.next() * 0.5),
      particleColor: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    };
  }

  return {
    ...baseTrait,
    statType,
    bonusAmount,
    physicsLogic,
    visualEffects
  };
}

/**
 * Create a subclass trait
 * @param role The role for the trait
 * @param rarity The rarity of the trait
 * @param blockData Optional block data for RNG
 * @returns A subclass trait
 */
export function createSubclassTrait(role: Role, rarity: Rarity, blockData?: BlockData): SubclassTrait {
  const baseTrait = createBaseTrait(role, rarity, 'Subclass');

  // Default values
  let formationTrait = `${role.toLowerCase()}_formation_1`;
  let abilities = [
    {
      id: `${role.toLowerCase()}_ability_1`,
      name: `${role} Ability 1`,
      description: `A ${rarity.toLowerCase()} ability for ${role} particles`,
      type: AbilityType.PRIMARY,
      cooldown: 10,
      physicsLogic: {
        forceMultiplier: 1.0,
        rangeMultiplier: 1.0,
        durationSeconds: 5
      },
      visualEffects: {
        particleEffect: `${role.toLowerCase()}_particle_effect_1`,
        areaEffect: `${role.toLowerCase()}_area_effect_1`,
        colorFlash: '#FFFFFF'
      }
    }
  ];
  let synergy = `${role.toLowerCase()}_synergy_1`;
  let themeProperties = {
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    particleEffect: `${role.toLowerCase()}_particle_effect_1`,
    soundEffect: `${role.toLowerCase()}_sound_effect_1`
  };

  // Use RNG if block data is provided
  if (blockData) {
    const rng = createRNGFromBlock(blockData);
    const stream = rng.getStream(`subclass_${role}`);

    // Generate random values
    formationTrait = `${role.toLowerCase()}_formation_${stream.nextInt(1, 3)}`;

    // Generate random abilities
    const abilityCount = 1 + Math.floor(getRarityValue(rarity) / 2);
    abilities = [];

    for (let i = 0; i < abilityCount; i++) {
      const abilityTypes = [AbilityType.PRIMARY, AbilityType.SECONDARY, AbilityType.UNIQUE];
      const type = abilityTypes[Math.min(i, abilityTypes.length - 1)];

      abilities.push({
        id: `${role.toLowerCase()}_ability_${i + 1}`,
        name: `${role} ${type.charAt(0) + type.slice(1).toLowerCase()} Ability`,
        description: `A ${rarity.toLowerCase()} ${type.toLowerCase()} ability for ${role} particles`,
        type,
        cooldown: 10 + (i * 10),
        physicsLogic: {
          forceMultiplier: 1.0 + (i * 0.2),
          rangeMultiplier: 1.0 + (i * 0.2),
          durationSeconds: 5 + (i * 2)
        },
        visualEffects: {
          particleEffect: `${role.toLowerCase()}_ability_effect_${i}`,
          areaEffect: `${role.toLowerCase()}_area_effect_${i}`,
          colorFlash: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
        }
      });
    }

    // Generate random synergy
    synergy = `${role.toLowerCase()}_synergy_${stream.nextInt(1, 3)}`;

    // Generate random theme properties
    const r1 = stream.nextInt(0, 255);
    const g1 = stream.nextInt(0, 255);
    const b1 = stream.nextInt(0, 255);
    const primaryColor = `#${r1.toString(16).padStart(2, '0')}${g1.toString(16).padStart(2, '0')}${b1.toString(16).padStart(2, '0')}`;

    const r2 = stream.nextInt(0, 255);
    const g2 = stream.nextInt(0, 255);
    const b2 = stream.nextInt(0, 255);
    const secondaryColor = `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;

    themeProperties = {
      primaryColor,
      secondaryColor,
      particleEffect: `${role.toLowerCase()}_particle_effect_${stream.nextInt(1, 3)}`,
      soundEffect: `${role.toLowerCase()}_sound_effect_${stream.nextInt(1, 3)}`
    };
  }

  return {
    ...baseTrait,
    formationTrait,
    abilities,
    synergy,
    themeProperties
  };
}

/**
 * Get the mutation chance for a rarity
 * @param rarity The rarity
 * @returns The mutation chance
 */
function getMutationChanceForRarity(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.COMMON:
      return 0.05;
    case Rarity.UNCOMMON:
      return 0.04;
    case Rarity.RARE:
      return 0.03;
    case Rarity.EPIC:
      return 0.02;
    case Rarity.LEGENDARY:
      return 0.01;
    case Rarity.MYTHIC:
      return 0.005;
    default:
      return 0.05;
  }
}

/**
 * Get a numeric value for a rarity
 * @param rarity The rarity
 * @returns A numeric value (higher = better)
 */
function getRarityValue(rarity: Rarity): number {
  switch (rarity) {
    case Rarity.COMMON:
      return 0;
    case Rarity.UNCOMMON:
      return 1;
    case Rarity.RARE:
      return 2;
    case Rarity.EPIC:
      return 3;
    case Rarity.LEGENDARY:
      return 4;
    case Rarity.MYTHIC:
      return 5;
    default:
      return 0;
  }
}
