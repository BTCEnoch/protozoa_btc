/**
 * Trait Types for Bitcoin Protozoa
 *
 * This file contains the type definitions for the trait system.
 * It builds on the core types and defines the structure of traits.
 */

import {
  Role,
  Rarity,
  TraitCategory,
  FalloffType,
  ForceType,
  BehaviorType,
  AbilityType
} from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';

/**
 * Base trait interface
 * Common properties for all traits
 */
export interface BaseTrait {
  id: string;
  name: string;
  description: string;
  rarityTier: Rarity;
  role: Role;
  evolutionParameters: {
    mutationChance: number;
    possibleEvolutions: string[]; // IDs of possible evolutions
  };
}

/**
 * Visual trait interface
 * Defines the appearance of particles
 */
export interface VisualTrait extends BaseTrait {
  shape: string;
  colorScheme: string;
  visualEffect: string;
  renderingProperties: {
    geometry: string;
    material: string;
    scale: number;
    emissive: boolean;
    opacity: number;
    colorHex: string;
  };
  animationProperties: {
    pulseRate: number;
    rotationSpeed: number;
    trailLength: number;
  };
}

/**
 * Formation trait interface
 * Defines the spatial arrangement of particles
 */
export interface FormationTrait extends BaseTrait {
  pattern: string;
  physicsLogic: {
    stiffness: number;
    range: number;
    falloff: FalloffType;
    targetFunction: string;
    additionalParameters: Record<string, any>;
  };
  visualProperties: {
    baseColor: string;
    particleScale: number;
    trailEffect: boolean;
  };
}

/**
 * Behavior trait interface
 * Defines the movement patterns of particles
 */
export interface BehaviorTrait extends BaseTrait {
  type: BehaviorType;
  physicsLogic: {
    strength: number;
    range: number;
    priority: number;
    persistence: number;
    frequency: number;
    additionalParameters: Record<string, any>;
  };
  visualEffects: {
    particleEffect: string;
    trailEffect: string;
    colorModulation: boolean;
  };
}

/**
 * Force calculation trait interface
 * Defines the physics interactions between particles
 */
export interface ForceCalculationTrait extends BaseTrait {
  forceType: ForceType;
  strengthMultiplier: number;
  rangeMultiplier: number;
  falloff: FalloffType;
  targetGroups: Role[];
  physicsLogic: {
    forceFunction: string;
    thresholdDistance: number;
    maxForce: number;
  };
  visualEffects: {
    forceVisualization: boolean;
    forceColor: string;
  };
}

/**
 * Class bonus trait interface
 * Defines statistical enhancements for particles
 */
export interface ClassBonusTrait extends BaseTrait {
  statType: string;
  bonusAmount: number;
  physicsLogic: {
    forceMultiplier: number;
    rangeMultiplier: number;
    speedMultiplier: number;
    stabilityMultiplier: number;
  };
  visualEffects: {
    particleGlow: boolean;
    particleSize: number;
    particleColor: string;
  };
}

/**
 * Ability interface
 * Defines an ability that a subclass can use
 */
export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  cooldown: number;
  physicsLogic: {
    forceMultiplier: number;
    rangeMultiplier: number;
    durationSeconds: number;
  };
  visualEffects: {
    particleEffect: string;
    areaEffect: string;
    colorFlash: string;
  };
}

/**
 * Subclass trait interface
 * Defines role-specific specializations with unique abilities
 */
export interface SubclassTrait extends BaseTrait {
  formationTrait: string; // ID of the formation trait
  abilities: Ability[];
  synergy: string;
  themeProperties: {
    primaryColor: string;
    secondaryColor: string;
    particleEffect: string;
    soundEffect: string;
  };
}

/**
 * Trait collection interface
 * A collection of traits for a particle group
 */
export interface TraitCollection {
  visual: VisualTrait[];
  formation: FormationTrait[];
  behavior: BehaviorTrait[];
  classBonus: ClassBonusTrait[];
  forceCalculation: ForceCalculationTrait[];
  subclass?: SubclassTrait[];
}

/**
 * Selected traits interface
 * The traits selected for a particle group
 */
export interface SelectedTraits {
  visual: VisualTrait;
  formation: FormationTrait;
  behavior: BehaviorTrait;
  classBonus: ClassBonusTrait;
  forceCalculation: ForceCalculationTrait;
  subclass?: SubclassTrait;
}

/**
 * Trait bank interface
 * A collection of traits organized by role and category
 */
export interface TraitBank {
  visualTraits: Record<Role, VisualTrait[]>;
  formationTraits: Record<Role, FormationTrait[]>;
  behaviorTraits: Record<Role, BehaviorTrait[]>;
  classBonusTraits: Record<Role, ClassBonusTrait[]>;
  forceCalculationTraits: Record<Role, ForceCalculationTrait[]>;
  subclassTraits: Record<Role, SubclassTrait[]>;
}
