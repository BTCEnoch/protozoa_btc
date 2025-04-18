/**
 * Formation Types
 *
 * This file defines the types for formation patterns and related data.
 */

export type FormationRole = 'CORE' | 'ATTACK' | 'DEFENSE' | 'CONTROL' | 'MOVEMENT' | string;
export type FormationTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | string;
export type FormationEffectType = 'SYNERGY' | 'DAMAGE_BOOST' | 'HEALING' | 'SHIELD' | 'SPEED_BOOST' | string;
export type FormationPatternType = 'NUCLEUS' | 'SPHERE' | 'SPIRAL' | 'WEB' | 'MANDELBROT' | 'ARROW' | 'SWARM' | 'VORTEX' | 'PHALANX' | 'PINCER' | 'ORBITAL' | 'NOVA' | 'PHANTOM' | 'CANNON' | 'SHREDDER' | string;

export interface FormationPatternParameters {
  [key: string]: any;
}

export interface FormationEffectParameters {
  radius: number;
  requiresFullFormation: number;
  minimumParticleCount: number;
  activationThreshold: number;
  [key: string]: any;
}

export interface FormationPattern {
  type: FormationPatternType;
  density: number;
  cohesion: number;
  flexibility: number;
  parameters: FormationPatternParameters;
}

export interface FormationEffect {
  type: FormationEffectType;
  magnitude: number;
  duration: number;
  parameters: FormationEffectParameters;
}

export interface Formation {
  id: string;
  name: string;
  description: string;
  role: FormationRole;
  tier: FormationTier;
  subclass: string;
  pattern: FormationPattern;
  effect: FormationEffect;
}

export interface FormationSet {
  role: FormationRole;
  formations: Formation[];
}

export interface FormationPatterns {
  core: FormationSet;
  attack: FormationSet;
  defense: FormationSet;
  control: FormationSet;
  movement: FormationSet;
}
