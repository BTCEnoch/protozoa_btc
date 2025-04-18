/**
 * Core Types for Bitcoin Protozoa
 *
 * This file contains the core enums, interfaces, and types used throughout the application.
 */

/**
 * Role enum
 * Defines the different roles that particles can have
 */
export enum Role {
  CORE = 'CORE',
  CONTROL = 'CONTROL',
  MOVEMENT = 'MOVEMENT',
  DEFENSE = 'DEFENSE',
  ATTACK = 'ATTACK'
}

/**
 * Rarity enum
 * Defines the different rarity levels for traits and abilities
 */
export enum Rarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

/**
 * Tier enum
 * Defines the different tier levels for traits and abilities
 */
export enum Tier {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
  TIER_4 = 'TIER_4',
  TIER_5 = 'TIER_5',
  TIER_6 = 'TIER_6',

  // Alternative naming convention used in some files
  COMMON = 'TIER_1',
  UNCOMMON = 'TIER_2',
  RARE = 'TIER_3',
  EPIC = 'TIER_4',
  LEGENDARY = 'TIER_5',
  MYTHIC = 'TIER_6'
}

/**
 * AttributeType enum
 * Defines the different attribute types for particles
 */
export enum AttributeType {
  STRENGTH = 'STRENGTH',
  AGILITY = 'AGILITY',
  INTELLIGENCE = 'INTELLIGENCE',
  VITALITY = 'VITALITY',
  RESILIENCE = 'RESILIENCE',

  // Alternative naming convention used in some files
  STR = 'STRENGTH',
  AGI = 'AGILITY',
  INT = 'INTELLIGENCE',
  WIS = 'VITALITY',
  DEF = 'RESILIENCE'
}

/**
 * TraitCategory enum
 * Defines the different categories for traits
 */
export enum TraitCategory {
  VISUAL = 'VISUAL',
  FORMATION = 'FORMATION',
  BEHAVIOR = 'BEHAVIOR',
  FORCE_CALCULATION = 'FORCE_CALCULATION',
  CLASS_BONUS = 'CLASS_BONUS',
  SUBCLASS = 'SUBCLASS'
}

/**
 * MutationCategory enum
 * Defines the different categories for mutations
 */
export enum MutationCategory {
  ATTRIBUTE = 'ATTRIBUTE',
  PARTICLE = 'PARTICLE',
  SUBCLASS = 'SUBCLASS',
  ABILITY = 'ABILITY',
  SYNERGY = 'SYNERGY',
  FORMATION = 'FORMATION',
  BEHAVIOR = 'BEHAVIOR',
  EXOTIC = 'EXOTIC'
}

// Vector3 interface is now imported from common.ts

/**
 * Color interface
 * Defines a color with RGB(A) values
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * ColorTheme interface
 * Defines a color theme with primary, secondary, and accent colors
 */
export interface ColorTheme {
  primary: string;
  secondary?: string;
  accent?: string;
}

/**
 * FalloffType enum
 * Defines the different types of falloff for forces
 */
export enum FalloffType {
  LINEAR = 'LINEAR',
  QUADRATIC = 'QUADRATIC',
  EXPONENTIAL = 'EXPONENTIAL',
  NONE = 'NONE'
}

/**
 * ForceType enum
 * Defines the different types of forces
 */
export enum ForceType {
  ATTRACTION = 'ATTRACTION',
  REPULSION = 'REPULSION',
  ALIGNMENT = 'ALIGNMENT',
  COHESION = 'COHESION',
  SEPARATION = 'SEPARATION'
}

/**
 * BehaviorType enum
 * Defines the different types of behaviors
 */
export enum BehaviorType {
  FLOCKING = 'FLOCKING',
  PATTERN = 'PATTERN',
  PREDATOR = 'PREDATOR',
  PREY = 'PREY',
  SWARM = 'SWARM'
}

/**
 * RoleToAttributeType mapping
 * Maps roles to their primary attributes
 */
export const RoleToAttributeType: Record<Role, AttributeType> = {
  [Role.CORE]: AttributeType.VITALITY,
  [Role.ATTACK]: AttributeType.STRENGTH,
  [Role.DEFENSE]: AttributeType.RESILIENCE,
  [Role.CONTROL]: AttributeType.INTELLIGENCE,
  [Role.MOVEMENT]: AttributeType.AGILITY
};
