/**
 * Common types used throughout the Bitcoin Protozoa application
 */

/**
 * Particle roles
 */
export enum ParticleRole {
  CORE = 'CORE',         // Central energy and stability
  CONTROL = 'CONTROL',   // Coordination and direction
  ATTACK = 'ATTACK',     // Offensive capabilities
  DEFENSE = 'DEFENSE',   // Protection and resilience
  MOVEMENT = 'MOVEMENT'  // Mobility and speed
}

/**
 * Rarity tiers
 */
export enum RarityTier {
  COMMON = 'Common',       // ~40%
  UNCOMMON = 'Uncommon',   // ~30%
  RARE = 'Rare',           // ~20%
  EPIC = 'Epic',           // ~8%
  LEGENDARY = 'Legendary', // ~1.5%
  MYTHIC = 'Mythic'        // ~0.5%
}

/**
 * Attribute types
 */
export enum AttributeType {
  WIS = 'WIS', // Wisdom - CORE's governing attribute
  INT = 'INT', // Intelligence - CONTROL's governing attribute
  STR = 'STR', // Strength - ATTACK's governing attribute
  DEF = 'DEF', // Defense - DEFENSE's governing attribute
  AGI = 'AGI'  // Agility - MOVEMENT's governing attribute
}

/**
 * Trait categories
 */
export enum TraitCategory {
  VISUAL = 'VISUAL',                   // Appearance traits
  FORMATION = 'FORMATION',             // Spatial arrangement traits
  BEHAVIOR = 'BEHAVIOR',               // Movement pattern traits
  FORCE_CALCULATION = 'FORCE_CALCULATION' // Physics interaction traits
}

/**
 * Falloff types for force calculations
 */
export enum FalloffType {
  LINEAR = 'linear',
  QUADRATIC = 'quadratic',
  EXPONENTIAL = 'exponential',
  INVERSE = 'inverse',
  QUANTUM = 'quantum',
  CONSTANT = 'constant'
}

/**
 * Behavior types
 */
export enum BehaviorType {
  FLOCKING = 'Flocking',
  PULSATION = 'Pulsation',
  OSCILLATION = 'Oscillation',
  ROTATION = 'Rotation',
  QUANTUM_FLUCTUATION = 'Quantum Fluctuation',
  ERRATIC = 'Erratic',
  FLOWING = 'Flowing',
  DEFENSIVE = 'Defensive'
}

/**
 * Force types
 */
export enum ForceType {
  ATTRACTION = 'Attraction',
  REPULSION = 'Repulsion',
  ALIGNMENT = 'Alignment',
  COHESION = 'Cohesion'
}

/**
 * Ability types
 */
export enum AbilityType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
  UNIQUE = 'Unique',
  CROWD_CONTROL = 'CrowdControl'
}

/**
 * 3D Vector interface
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Attribute values interface
 */
export interface AttributeValues {
  [AttributeType.WIS]: number;
  [AttributeType.INT]: number;
  [AttributeType.STR]: number;
  [AttributeType.DEF]: number;
  [AttributeType.AGI]: number;
}

/**
 * Default particle distribution by role
 */
export const DEFAULT_PARTICLE_DISTRIBUTION: Record<ParticleRole, number> = {
  [ParticleRole.CORE]: 50,     // 10% - Central energy and stability
  [ParticleRole.CONTROL]: 100, // 20% - Coordination and direction
  [ParticleRole.ATTACK]: 125,  // 25% - Offensive capabilities
  [ParticleRole.DEFENSE]: 125, // 25% - Protection and resilience
  [ParticleRole.MOVEMENT]: 100 // 20% - Mobility and speed
};

/**
 * Default rarity weights for trait selection
 */
export const DEFAULT_RARITY_WEIGHTS: Record<RarityTier, number> = {
  [RarityTier.COMMON]: 40,     // 40% chance
  [RarityTier.UNCOMMON]: 30,   // 30% chance
  [RarityTier.RARE]: 20,       // 20% chance
  [RarityTier.EPIC]: 8,        // 8% chance
  [RarityTier.LEGENDARY]: 1.5, // 1.5% chance
  [RarityTier.MYTHIC]: 0.5     // 0.5% chance
};

/**
 * Evolution milestone interface
 */
export interface EvolutionMilestone {
  confirmations: number;
  mutationChance: number;
  description: string;
}

/**
 * Default evolution milestones
 */
export const DEFAULT_EVOLUTION_MILESTONES: EvolutionMilestone[] = [
  { confirmations: 10000, mutationChance: 0.01, description: "Common → Uncommon (1% chance)" },
  { confirmations: 50000, mutationChance: 0.05, description: "Uncommon → Rare (5% chance)" },
  { confirmations: 100000, mutationChance: 0.10, description: "Rare → Epic (10% chance)" },
  { confirmations: 250000, mutationChance: 0.25, description: "Epic → Legendary (25% chance)" },
  { confirmations: 500000, mutationChance: 0.50, description: "Legendary → Mythic (50% chance)" },
  { confirmations: 1000000, mutationChance: 1.00, description: "Mythic → Special Evolution (100% chance)" }
];
