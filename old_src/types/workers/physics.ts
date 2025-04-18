/**
 * Physics Types for Bitcoin Protozoa
 *
 * This file defines the types for physics calculations in workers.
 */

import { Vector3 } from '../common';

/**
 * Physics data interface
 * Data for physics calculations
 */
export interface PhysicsData {
  // Particle data
  positions: Float32Array;
  velocities: Float32Array;
  forces: Float32Array;
  masses: Float32Array;

  // Constraint data
  constraints: PhysicsConstraint[];

  // Force field data
  forceFields: ForceField[];

  // Simulation parameters
  timeStep: number;
  iterations: number;
  damping: number;
}

/**
 * Physics constraint interface
 * Constraint for physics calculations
 */
export interface PhysicsConstraint {
  // Constraint type
  type: 'distance' | 'angle' | 'hinge' | 'point';

  // Particle indices
  indices: number[];

  // Constraint parameters
  params: {
    // Distance constraint
    distance?: number;
    stiffness?: number;

    // Angle constraint
    angle?: number;

    // Hinge constraint
    axis?: Vector3;

    // Point constraint
    point?: Vector3;
  };
}

/**
 * Force field interface
 * Force field for physics calculations
 */
export interface ForceField {
  // Force field type
  type: 'gravity' | 'attraction' | 'repulsion' | 'vortex' | 'wind';

  // Force field parameters
  position?: Vector3;
  direction?: Vector3;
  strength: number;
  radius?: number;
  falloff?: 'linear' | 'quadratic' | 'exponential';
}

/**
 * Force calculation options interface
 * Options for force calculations
 */
export interface ForceCalculationOptions {
  // Calculation method
  method: 'direct' | 'barnes-hut' | 'grid';

  // Optimization parameters
  optimizationLevel: 'low' | 'medium' | 'high';

  // Barnes-Hut parameters
  theta?: number;

  // Grid parameters
  cellSize?: number;

  // Cutoff parameters
  cutoffDistance?: number;

  // Parallelization parameters
  useMultipleThreads?: boolean;
  threadCount?: number;
}
