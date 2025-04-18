/**
 * Particle-related types for Bitcoin Protozoa
 */

import { ParticleRole, Vector3, AttributeValues } from './common';
import { TraitCollection } from './trait';
import { SubclassData } from '../../ability_reference';

/**
 * Particle interface
 * Represents a single particle in the system
 */
export interface Particle {
  id: string;
  role: ParticleRole;
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  targetPosition?: Vector3;
  mass: number;
  size: number;
  color: string;
  opacity: number;
  emissive: boolean;
  emissiveColor?: string;
  emissiveIntensity?: number;
  trailLength?: number;
  pulseRate?: number;
  rotationSpeed?: number;
  geometry: string;
  material: string;
  behaviorParams?: Record<string, any>;
}

/**
 * Particle group interface
 * Represents a group of particles with the same role and traits
 */
export interface ParticleGroup {
  id: string;
  role: ParticleRole;
  count: number;
  traits: TraitCollection;
  attributes: AttributeValues;
  particles: Particle[];
  mutations: string[]; // IDs of applied mutations
  subclass: SubclassData;
  baseAttributeValue: number;
  attributeMultipliers: {
    base: number;
    fromTraits: number;
    fromMutations: number;
  };
  entanglementLinks?: EntanglementLink[];
}

/**
 * Entanglement link interface
 * Represents a quantum entanglement between two particle groups
 */
export interface EntanglementLink {
  sourceGroupId: string;
  targetGroupId: string;
  attributeSharePercentage: number;
  cooldownReductionPercentage: number;
}

/**
 * Particle creation options interface
 */
export interface ParticleCreationOptions {
  role: ParticleRole;
  position?: Vector3;
  velocity?: Vector3;
  mass?: number;
  size?: number;
  color?: string;
  opacity?: number;
  emissive?: boolean;
  geometry?: string;
  material?: string;
}

/**
 * Particle group creation options interface
 */
export interface ParticleGroupCreationOptions {
  role: ParticleRole;
  count: number;
  nonce: number;
  index: number;
  forcedTraits?: Partial<TraitCollection>;
}