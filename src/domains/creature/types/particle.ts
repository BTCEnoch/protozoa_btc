/**
 * Particle-related types for Bitcoin Protozoa
 */

import { Role, AttributeType } from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';

/**
 * Particle interface
 * Represents a single particle in the system
 */
export interface Particle {
  id: string;
  role: Role;
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
  role: Role;
  count: number;
  traits: any; // Will be replaced with TraitCollection when we migrate that type
  attributes: Record<AttributeType, number>;
  particles: Particle[];
  mutations: string[]; // IDs of applied mutations
  subclass: any; // Will be replaced with SubclassData when we migrate that type
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
  role: Role;
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
  role: Role;
  count: number;
  nonce: number;
  index: number;
  forcedTraits?: any; // Will be replaced with Partial<TraitCollection> when we migrate that type
}
