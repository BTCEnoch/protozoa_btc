/**
 * Worker Message Types for Bitcoin Protozoa
 *
 * This file defines the types for messages sent between the main thread and workers.
 */

import { Vector3 } from '../common';

/**
 * Base worker message interface
 * All worker messages extend this interface
 */
export interface WorkerMessage {
  // Message type
  type: string;

  // Message ID for tracking responses
  id?: string;

  // Message data
  data?: any;

  // Error information
  error?: {
    message: string;
    stack?: string;
  };
}

/**
 * Physics worker message interface
 * Messages for physics workers
 */
export interface PhysicsWorkerMessage extends WorkerMessage {
  // Physics-specific message types
  type: 'calculateForces' | 'updatePositions' | 'applyConstraints' | 'initialize' | 'reset' | 'result' | 'error';

  // Physics data
  data?: {
    // Particle data
    positions?: Float32Array;
    velocities?: Float32Array;
    forces?: Float32Array;
    masses?: Float32Array;

    // Constraint data
    constraints?: {
      type: 'distance' | 'angle' | 'hinge' | 'point';
      indices: number[];
      params: any;
    }[];

    // Force field data
    forceFields?: {
      type: 'gravity' | 'attraction' | 'repulsion' | 'vortex' | 'wind';
      position?: Vector3;
      direction?: Vector3;
      strength: number;
      radius?: number;
      falloff?: 'linear' | 'quadratic' | 'exponential';
    }[];

    // Simulation parameters
    timeStep?: number;
    iterations?: number;
    damping?: number;
  };
}

/**
 * Behavior worker message interface
 * Messages for behavior workers
 */
export interface BehaviorWorkerMessage extends WorkerMessage {
  // Behavior-specific message types
  type: 'calculateBehavior' | 'applyRules' | 'updateTargets' | 'initialize' | 'reset' | 'result' | 'error';

  // Behavior data
  data?: {
    // Particle data
    positions?: Float32Array;
    velocities?: Float32Array;

    // Group data
    groups?: {
      startIndex: number;
      count: number;
      role: string;
      behavior: string;
    }[];

    // Behavior parameters
    behaviors?: {
      type: string;
      strength: number;
      range: number;
      priority: number;
      persistence: number;
      frequency: number;
      params: any;
    }[];

    // Target data
    targets?: {
      position: Vector3;
      weight: number;
    }[];

    // Simulation parameters
    timeStep?: number;
    maxSpeed?: number;
    maxForce?: number;
  };
}

/**
 * Render worker message interface
 * Messages for render workers
 */
export interface RenderWorkerMessage extends WorkerMessage {
  // Render-specific message types
  type: 'prepareRender' | 'updateAttributes' | 'calculateLOD' | 'initialize' | 'reset' | 'result' | 'error';

  // Render data
  data?: {
    // Particle data
    positions?: Float32Array;
    scales?: Float32Array;
    colors?: Float32Array;
    opacities?: Float32Array;

    // Camera data
    cameraPosition?: Vector3;
    cameraFrustum?: {
      near: number;
      far: number;
      fov: number;
      aspect: number;
    };

    // LOD data
    lodLevels?: {
      distance: number;
      detail: number;
    }[];

    // Render parameters
    viewportWidth?: number;
    viewportHeight?: number;
    pixelRatio?: number;
  };
}

/**
 * Bitcoin worker message interface
 * Messages for Bitcoin workers
 */
export interface BitcoinWorkerMessage extends WorkerMessage {
  // Bitcoin-specific message types
  type: 'fetchBlock' | 'fetchConfirmations' | 'fetchInscription' | 'initialize' | 'reset' | 'result' | 'error';

  // Bitcoin data
  data?: {
    // Block data
    blockNumber?: number;
    blockHash?: string;

    // Inscription data
    inscriptionId?: string;

    // API parameters
    apiUrl?: string;
    timeout?: number;
    retries?: number;
  };
}
