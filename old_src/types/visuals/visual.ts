/**
 * Visual Types for Bitcoin Protozoa
 *
 * This file contains the type definitions for the visual system.
 * It builds on the core types and defines the structure of visual traits,
 * particle appearances, and visual effects.
 */

import { Role, Tier, Rarity } from './core';
import { Vector3 } from './common';

/**
 * Visual Trait interface
 * Defines the visual appearance of particles
 */
export interface VisualTrait {
  id: string;
  name: string;
  description: string;
  role: Role;
  tier: Tier;
  rarity?: Rarity;
  subclass?: string;
  particleAppearance: ParticleAppearance;
  animation: Animation;
  effects: VisualEffect[];
}

/**
 * Particle Appearance interface
 * Defines the visual properties of a particle
 */
export interface ParticleAppearance {
  shape: ParticleShape;
  color: string;
  size: number;
  opacity: number;
  emissive: boolean;
  emissiveColor?: string;
  emissiveIntensity?: number;
  texture?: string;
  wireframe?: boolean;
  roughness?: number;
  metalness?: number;
}

/**
 * Particle Shape enum
 * Defines the different shapes for particles
 */
export enum ParticleShape {
  SPHERE = 'SPHERE',
  CUBE = 'CUBE',
  CONE = 'CONE',
  CYLINDER = 'CYLINDER',
  TORUS = 'TORUS',
  ICOSAHEDRON = 'ICOSAHEDRON',
  TETRAHEDRON = 'TETRAHEDRON',
  OCTAHEDRON = 'OCTAHEDRON',
  CUSTOM = 'CUSTOM'
}

/**
 * Animation interface
 * Defines an animation for a particle
 */
export interface Animation {
  type: AnimationType;
  speed: number;
  amplitude?: number;
  frequency?: number;
  direction?: Vector3;
  loop?: boolean;
  easing?: string;
  parameters?: Record<string, any>;
}

/**
 * Animation Type enum
 * Defines the different types of animations
 */
export enum AnimationType {
  PULSE = 'PULSE',
  SPIN = 'SPIN',
  ORBIT = 'ORBIT',
  WAVE = 'WAVE',
  FLICKER = 'FLICKER',
  STATIC = 'STATIC',
  TRAIL = 'TRAIL',
  NONE = 'NONE'
}

/**
 * Visual Effect interface
 * Defines a visual effect for a particle
 */
export interface VisualEffect {
  type: VisualEffectType;
  intensity: number;
  color?: string;
  duration?: number;
  trigger?: VisualEffectTrigger;
  parameters?: Record<string, any>;
}

/**
 * Visual Effect Type enum
 * Defines the different types of visual effects
 */
export enum VisualEffectType {
  GLOW = 'GLOW',
  TRAIL = 'TRAIL',
  PARTICLES = 'PARTICLES',
  SHOCKWAVE = 'SHOCKWAVE',
  LIGHTNING = 'LIGHTNING',
  ENERGY = 'ENERGY',
  FIRE = 'FIRE',
  SHIELD = 'SHIELD',
  AURA = 'AURA',
  BURST = 'BURST',
  NONE = 'NONE'
}

/**
 * Visual Effect Trigger enum
 * Defines the different triggers for visual effects
 */
export enum VisualEffectTrigger {
  ALWAYS = 'ALWAYS',
  ON_COLLISION = 'ON_COLLISION',
  ON_ABILITY = 'ON_ABILITY',
  ON_MUTATION = 'ON_MUTATION',
  ON_EVOLUTION = 'ON_EVOLUTION',
  DAMAGED = 'DAMAGED',
  MOVING = 'MOVING',
  ABILITY_USE = 'ABILITY_USE',
  HEALING = 'HEALING',
  NONE = 'NONE'
}

/**
 * Evolution Stage interface
 * Defines a stage of evolution for a visual trait
 */
export interface EvolutionStage {
  name: string;
  description: string;
  particleAppearance?: Partial<ParticleAppearance>;
  animation?: Partial<Animation>;
  effects?: VisualEffect[];
}

/**
 * Evolution Parameters interface
 * Defines parameters for visual evolution
 */
export interface EvolutionParameters {
  confirmationThresholds?: number[];
  evolutionStages?: EvolutionStage[];
}

/**
 * Visual Trait interface update
 */
export interface VisualTrait {
  id: string;
  name: string;
  description: string;
  role: Role;
  tier: Tier;
  rarity?: Rarity;
  subclass?: string;
  particleAppearance: ParticleAppearance;
  animation: Animation;
  effects: VisualEffect[];
  evolutionParameters?: EvolutionParameters;
}

/**
 * Visual Registry interface
 * Registry of visual traits organized by role and tier
 */
export interface VisualRegistry {
  [role: string]: {
    [tier: string]: VisualTrait[];
  };
}
