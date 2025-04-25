/**
 * Physics Types for Bitcoin Protozoa
 *
 * This file defines the types for the physics system.
 */

import { Vector3 } from '../../../shared/types/common';

/**
 * Adaptive physics detail interface
 * Represents the level of physics detail for a body based on distance
 */
export interface AdaptivePhysicsDetail {
  useCollisions: boolean;      // Whether to perform collision detection for this body
  collisionIterations: number; // Number of collision resolution iterations
  forceMultiplier: number;     // Multiplier for forces applied to this body
  useConstraints: boolean;     // Whether to apply constraints to this body
  useDamping: boolean;         // Whether to apply damping to this body
  dampingFactor: number;       // Damping factor for velocity (0-1)
}

/**
 * Physics body interface
 * Represents a physical body in the simulation
 */
export interface PhysicsBody {
  id: string;
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  mass: number;
  radius: number;
  restitution: number; // Bounciness (0-1)
  friction: number; // Friction coefficient (0-1)
  fixed: boolean; // Whether the body is fixed in place
  active: boolean; // Whether the body is active in the simulation
  group: number; // Collision group
  collidesWith: number[]; // Collision groups this body collides with
  userData?: any; // Custom user data
  // Throttling properties
  distanceFromCamera?: number; // Distance from camera for throttling
  lastUpdateTime?: number; // Last time this body was updated
  updateFrequency?: number; // How often this body should be updated (updates per second)
  qualityLevel?: string; // Physics quality level for this body
  // Adaptive physics properties
  adaptiveDetail?: AdaptivePhysicsDetail; // Adaptive physics detail level
}

/**
 * Physics configuration interface
 * Simplified configuration for physics service
 */
export interface PhysicsConfig {
  timeStep?: number;
  iterations?: number;
  gravity?: Vector3;
  bounds?: {
    min: Vector3;
    max: Vector3;
  };
}

/**
 * Physics world configuration interface
 * Detailed configuration for physics world
 */
export interface PhysicsWorldConfig {
  gravity: Vector3;
  bounds: {
    min: Vector3;
    max: Vector3;
  };
  timeStep: number;
  iterations: number;
  broadphase: BroadphaseType;
  sleepThreshold: number;
  maxBodies: number;
  throttling?: {
    enabled: boolean;
    distanceThreshold?: number;
    updateFrequency?: number;
  };
  adaptive?: {
    enabled: boolean;
    distanceThresholds?: {
      near: number;
      medium: number;
      far: number;
    };
    importanceFactors?: {
      size: number;
      velocity: number;
      proximity: number;
      visibility: number;
    };
  };
}

/**
 * Broadphase type enum
 * Different algorithms for broad phase collision detection
 */
export enum BroadphaseType {
  BRUTE_FORCE = 'BRUTE_FORCE',
  GRID = 'GRID',
  OCTREE = 'OCTREE',
  SWEEP_AND_PRUNE = 'SWEEP_AND_PRUNE'
}

/**
 * Integration method enum
 * Different numerical integration methods
 */
export enum IntegrationMethod {
  EULER = 'EULER',
  VERLET = 'VERLET',
  RK4 = 'RK4'
}

/**
 * Physics update result interface
 */
export interface PhysicsUpdateResult {
  bodies: PhysicsBody[];
  collisions: Collision[];
  time: number;
  iterations: number;
}

/**
 * Collision interface
 * Represents a collision between two bodies
 */
export interface Collision {
  bodyA: string; // ID of first body
  bodyB: string; // ID of second body
  point: Vector3; // Collision point
  normal: Vector3; // Collision normal
  depth: number; // Penetration depth
  impulse: number; // Collision impulse
  time: number; // Time of collision
}

/**
 * Ray interface
 * Represents a ray for raycasting
 */
export interface Ray {
  origin: Vector3;
  direction: Vector3;
  length: number;
}

/**
 * Raycast result interface
 */
export interface RaycastResult {
  hit: boolean;
  bodyId?: string;
  point?: Vector3;
  normal?: Vector3;
  distance?: number;
}

/**
 * Force interface
 * Represents a force applied to a body
 */
export interface Force {
  type: ForceType;
  value: Vector3 | number;
  target?: string | string[]; // Body ID(s) to apply force to
  position?: Vector3; // Point of application
  radius?: number; // Radius of effect
  falloff?: FalloffType; // How force diminishes with distance
}

/**
 * Force type enum
 */
export enum ForceType {
  CONSTANT = 'CONSTANT',
  IMPULSE = 'IMPULSE',
  ATTRACTION = 'ATTRACTION',
  REPULSION = 'REPULSION',
  VORTEX = 'VORTEX',
  SPRING = 'SPRING',
  DRAG = 'DRAG'
}

/**
 * Falloff type enum
 */
export enum FalloffType {
  NONE = 'NONE',
  LINEAR = 'LINEAR',
  QUADRATIC = 'QUADRATIC',
  EXPONENTIAL = 'EXPONENTIAL'
}
