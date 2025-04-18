/**
 * Particle Types for Bitcoin Protozoa
 * 
 * This file defines the types for the particle system.
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
  particles: Particle[];
  attributes: Record<AttributeType, number>;
  baseAttributeValue: number;
  attributeMultipliers: {
    base: number;
    fromTraits: number;
    fromMutations: number;
  };
  traits?: any; // Will be replaced with TraitCollection when we migrate that type
  mutations?: string[]; // IDs of applied mutations
  subclass?: any; // Will be replaced with SubclassData when we migrate that type
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

/**
 * Particle system configuration interface
 */
export interface ParticleSystemConfig {
  maxParticles: number;
  workerThreshold: number;
  useWebWorkers: boolean;
  updateInterval: number;
  renderInterval: number;
  physicsStepSize: number;
  defaultMass: number;
  defaultSize: number;
  defaultColor: string;
  defaultOpacity: number;
  defaultEmissive: boolean;
  defaultGeometry: string;
  defaultMaterial: string;
}

/**
 * Particle behavior type
 */
export enum ParticleBehaviorType {
  FLOCKING = 'flocking',
  SWARMING = 'swarming',
  ORBITING = 'orbiting',
  PULSING = 'pulsing',
  RANDOM = 'random',
  TARGETED = 'targeted',
  FORMATION = 'formation',
  CUSTOM = 'custom'
}

/**
 * Particle behavior interface
 */
export interface ParticleBehavior {
  type: ParticleBehaviorType;
  weight: number;
  params: Record<string, any>;
}

/**
 * Particle force interface
 */
export interface ParticleForce {
  type: string;
  strength: number;
  direction?: Vector3;
  origin?: Vector3;
  radius?: number;
  falloff?: number;
}

/**
 * Particle system statistics interface
 */
export interface ParticleSystemStats {
  totalParticles: number;
  activeParticles: number;
  particleGroups: number;
  updateTime: number;
  renderTime: number;
  physicsTime: number;
  fps: number;
  memoryUsage: number;
}

/**
 * Particle update result interface
 */
export interface ParticleUpdateResult {
  positions: Vector3[];
  velocities: Vector3[];
  accelerations: Vector3[];
  sizes?: number[];
  colors?: string[];
  opacities?: number[];
}

/**
 * Particle worker message interface
 */
export interface ParticleWorkerMessage {
  type: 'init' | 'update' | 'result' | 'error';
  groupId?: string;
  data?: any;
  deltaTime?: number;
  timestamp?: number;
}

/**
 * Particle worker result interface
 */
export interface ParticleWorkerResult {
  groupId: string;
  positions: Float32Array;
  velocities: Float32Array;
  accelerations: Float32Array;
  timestamp: number;
  computeTime: number;
}
