/**
 * Common types used throughout the Bitcoin Protozoa application
 */

import { AttributeType, Rarity } from './core';

/**
 * 3D Vector interface
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Vector3 utility functions
 */
export const Vector3Utils = {
  /**
   * Create a new Vector3
   */
  create: (x: number = 0, y: number = 0, z: number = 0): Vector3 => ({ x, y, z }),

  /**
   * Clone a Vector3
   */
  clone: (v: Vector3): Vector3 => ({ x: v.x, y: v.y, z: v.z }),

  /**
   * Add two vectors
   */
  add: (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),

  /**
   * Subtract vector b from vector a
   */
  subtract: (a: Vector3, b: Vector3): Vector3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),

  /**
   * Multiply a vector by a scalar
   */
  multiply: (v: Vector3, scalar: number): Vector3 => ({ x: v.x * scalar, y: v.y * scalar, z: v.z * scalar }),

  /**
   * Divide a vector by a scalar
   */
  divide: (v: Vector3, scalar: number): Vector3 => ({ x: v.x / scalar, y: v.y / scalar, z: v.z / scalar }),

  /**
   * Calculate the length (magnitude) of a vector
   */
  length: (v: Vector3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),

  /**
   * Calculate the squared length of a vector (more efficient than length)
   */
  lengthSquared: (v: Vector3): number => v.x * v.x + v.y * v.y + v.z * v.z,

  /**
   * Normalize a vector (make it unit length)
   */
  normalize: (v: Vector3): Vector3 => {
    const len = Vector3Utils.length(v);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  },

  /**
   * Calculate the dot product of two vectors
   */
  dot: (a: Vector3, b: Vector3): number => a.x * b.x + a.y * b.y + a.z * b.z,

  /**
   * Calculate the cross product of two vectors
   */
  cross: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }),

  /**
   * Calculate the distance between two vectors
   */
  distance: (a: Vector3, b: Vector3): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  /**
   * Calculate the squared distance between two vectors (more efficient than distance)
   */
  distanceSquared: (a: Vector3, b: Vector3): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return dx * dx + dy * dy + dz * dz;
  },

  /**
   * Linear interpolation between two vectors
   */
  lerp: (a: Vector3, b: Vector3, t: number): Vector3 => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  }),

  /**
   * Get a zero vector
   */
  zero: (): Vector3 => ({ x: 0, y: 0, z: 0 }),

  /**
   * Get a unit vector in the X direction
   */
  unitX: (): Vector3 => ({ x: 1, y: 0, z: 0 }),

  /**
   * Get a unit vector in the Y direction
   */
  unitY: (): Vector3 => ({ x: 0, y: 1, z: 0 }),

  /**
   * Get a unit vector in the Z direction
   */
  unitZ: (): Vector3 => ({ x: 0, y: 0, z: 1 }),

  /**
   * Check if two vectors are equal
   */
  equals: (a: Vector3, b: Vector3, epsilon: number = 0.0001): boolean => {
    return (
      Math.abs(a.x - b.x) < epsilon &&
      Math.abs(a.y - b.y) < epsilon &&
      Math.abs(a.z - b.z) < epsilon
    );
  }
}

/**
 * Attribute values interface
 */
export interface AttributeValues {
  [AttributeType.STRENGTH]: number;
  [AttributeType.AGILITY]: number;
  [AttributeType.INTELLIGENCE]: number;
  [AttributeType.VITALITY]: number;
  [AttributeType.RESILIENCE]: number;
}

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
