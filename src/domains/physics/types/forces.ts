/**
 * Forces Types for Bitcoin Protozoa
 * 
 * This file defines the types for forces in the physics system.
 */

import { Vector3 } from '../../../shared/types/common';
import { ForceType, FalloffType } from './physics';

/**
 * Base force interface
 * Common properties for all force types
 */
export interface BaseForce {
  type: ForceType;
  enabled: boolean;
  target?: string | string[]; // Body ID(s) to apply force to
  position?: Vector3; // Point of application
  radius?: number; // Radius of effect
  falloff?: FalloffType; // How force diminishes with distance
}

/**
 * Constant force interface
 * Applies a constant force in a direction
 */
export interface ConstantForce extends BaseForce {
  type: ForceType.CONSTANT;
  direction: Vector3;
  magnitude: number;
}

/**
 * Impulse force interface
 * Applies an instantaneous force
 */
export interface ImpulseForce extends BaseForce {
  type: ForceType.IMPULSE;
  direction: Vector3;
  magnitude: number;
  duration: number;
}

/**
 * Attraction force interface
 * Attracts bodies to a point
 */
export interface AttractionForce extends BaseForce {
  type: ForceType.ATTRACTION;
  strength: number;
  minDistance?: number; // Minimum distance to apply force
  maxDistance?: number; // Maximum distance to apply force
}

/**
 * Repulsion force interface
 * Repels bodies from a point
 */
export interface RepulsionForce extends BaseForce {
  type: ForceType.REPULSION;
  strength: number;
  minDistance?: number; // Minimum distance to apply force
  maxDistance?: number; // Maximum distance to apply force
}

/**
 * Vortex force interface
 * Creates a swirling force around an axis
 */
export interface VortexForce extends BaseForce {
  type: ForceType.VORTEX;
  strength: number;
  axis: Vector3;
  minDistance?: number; // Minimum distance to apply force
  maxDistance?: number; // Maximum distance to apply force
}

/**
 * Spring force interface
 * Creates a spring-like force between bodies
 */
export interface SpringForce extends BaseForce {
  type: ForceType.SPRING;
  stiffness: number;
  damping: number;
  restLength: number;
  connections: [string, string][]; // Pairs of body IDs to connect
}

/**
 * Drag force interface
 * Applies drag to bodies
 */
export interface DragForce extends BaseForce {
  type: ForceType.DRAG;
  coefficient: number;
  quadratic: boolean; // Whether to use quadratic drag
}

/**
 * Force factory interface
 * Creates force instances
 */
export interface ForceFactory {
  createConstantForce(direction: Vector3, magnitude: number): ConstantForce;
  createImpulseForce(direction: Vector3, magnitude: number, duration: number): ImpulseForce;
  createAttractionForce(position: Vector3, strength: number, radius?: number): AttractionForce;
  createRepulsionForce(position: Vector3, strength: number, radius?: number): RepulsionForce;
  createVortexForce(position: Vector3, axis: Vector3, strength: number, radius?: number): VortexForce;
  createSpringForce(stiffness: number, damping: number, restLength: number, connections: [string, string][]): SpringForce;
  createDragForce(coefficient: number, quadratic?: boolean): DragForce;
}
