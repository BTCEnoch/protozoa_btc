/**
 * Types for formations
 *
 * This file defines the types for formations, formation patterns, and formation effects.
 */

import { Role } from './core';
import { Tier } from './ability';

// Formation interface
export interface Formation {
  id: string;
  name: string;
  description: string;
  role: Role;
  tier: Tier;
  subclass: string;
  pattern: FormationPattern;
  effect: FormationEffect;
  center?: { x: number; y: number; z: number };
}

// Formation Pattern interface
export interface FormationPattern {
  type: FormationPatternType;
  density: number; // 0-1, how tightly packed the particles are
  cohesion: number; // 0-1, how strongly particles stick together
  flexibility: number; // 0-1, how easily the formation adapts to changes
  parameters: Record<string, any>; // Additional pattern-specific parameters
}

// Formation Pattern Type enum
export enum FormationPatternType {
  // Original patterns
  NUCLEUS = 'NUCLEUS', // Dense central formation
  ARROW = 'ARROW', // Forward-pointing formation
  SHIELD = 'SHIELD', // Defensive barrier formation
  WEB = 'WEB', // Complex, interconnected formation
  SWARM = 'SWARM', // Loose, adaptable formation
  VORTEX = 'VORTEX', // Spinning, cyclone-like formation
  PHALANX = 'PHALANX', // Tight, grid-like formation
  WAVE = 'WAVE', // Undulating, wave-like formation

  // New patterns
  CIRCLE = 'CIRCLE', // Circular pattern around a central point
  GRID = 'GRID', // Grid pattern in 2D or 3D
  SPIRAL = 'SPIRAL', // Spiral pattern emanating from center
  SPHERE = 'SPHERE', // Spherical pattern
  HELIX = 'HELIX', // Helical (3D spiral) pattern
  CLUSTER = 'CLUSTER', // Organic-looking clusters
  TREE = 'TREE', // Tree-like branching structure
  SIERPINSKI = 'SIERPINSKI', // Sierpinski triangle/tetrahedron pattern
  MANDELBROT = 'MANDELBROT' // Mandelbrot set pattern
}

// Formation Effect interface
export interface FormationEffect {
  type: FormationEffectType;
  magnitude: number; // 0-1, strength of the effect
  duration?: number; // Duration in seconds, if applicable
  cooldown?: number; // Cooldown in seconds, if applicable
  trigger?: string; // Condition that triggers the effect, if applicable
  parameters: Record<string, number>; // Additional effect-specific parameters
}

// Formation Effect Type enum
export enum FormationEffectType {
  DAMAGE_BOOST = 'DAMAGE_BOOST', // Increases damage output
  DEFENSE_BOOST = 'DEFENSE_BOOST', // Increases damage reduction
  SPEED_BOOST = 'SPEED_BOOST', // Increases movement speed
  HEALING = 'HEALING', // Provides healing over time
  SHIELD = 'SHIELD', // Creates a damage-absorbing shield
  DISRUPTION = 'DISRUPTION', // Disrupts enemy formations
  CONTROL = 'CONTROL', // Enhances crowd control abilities
  SYNERGY = 'SYNERGY' // Enhances coordination with other formations
}

// Formation Registry interface
export interface FormationRegistry {
  [role: string]: {
    [tier: number]: Formation[];
  };
}

/**
 * Get a formation by role, tier, and subclass
 * @param registry The formation registry
 * @param role The role
 * @param tier The tier
 * @param subclass The subclass
 * @returns The formation, or undefined if not found
 */
export function getFormation(
  registry: FormationRegistry,
  role: Role,
  tier: Tier,
  subclass: string
): Formation | undefined {
  const tierFormations = registry[role]?.[tier];
  if (!tierFormations) return undefined;

  return tierFormations.find(formation => formation.subclass === subclass);
}
