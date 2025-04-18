/**
 * Animation Type Definitions for Bitcoin Protozoa
 *
 * This file contains the type definitions for animation types.
 */

/**
 * AnimationType enum
 * Defines the different types of animations
 */
export enum AnimationType {
  PULSE = 'PULSE',
  SPIN = 'SPIN',
  ORBIT = 'ORBIT',
  WAVE = 'WAVE',
  FLICKER = 'FLICKER',
  STATIC = 'STATIC'
}

/**
 * Animation interface
 * Defines an animation
 */
export interface Animation {
  type: AnimationType;
  speed: number;
  amplitude?: number;
  frequency?: number;
  radius?: number;
  maxSize?: number;
  minSize?: number;
  variation?: number;
  length?: number;
  fadeRate?: number;
}

/**
 * VisualEffectType enum
 * Defines the different types of visual effects
 */
export enum VisualEffectType {
  ENERGY = 'ENERGY',
  FIRE = 'FIRE',
  SHIELD = 'SHIELD',
  AURA = 'AURA',
  BURST = 'BURST',
  TRAIL = 'TRAIL'
}

/**
 * VisualEffectTrigger enum
 * Defines the different triggers for visual effects
 */
export enum VisualEffectTrigger {
  MOVING = 'MOVING',
  ABILITY_USE = 'ABILITY_USE',
  DAMAGED = 'DAMAGED',
  HEALING = 'HEALING',
  ALWAYS = 'ALWAYS'
}

/**
 * VisualEffect interface
 * Defines a visual effect
 */
export interface VisualEffect {
  type: VisualEffectType;
  trigger: VisualEffectTrigger;
  intensity: number;
  color?: string;
  properties?: {
    radius?: number;
    particleCount?: number;
    length?: number;
    fadeRate?: number;
  };
}
