/**
 * Pattern Worker for Bitcoin Protozoa
 *
 * This worker calculates pattern-based behaviors for particles, including
 * formations, shapes, and other structured arrangements.
 */

import { BehaviorWorkerMessage } from '../../types/workers/messages';
import { Vector3 } from '../../types/common';

// Worker state
let options = {
  formationStrength: 1.0,
  transitionSpeed: 0.1,
  maxForce: 0.5,
  damping: 0.9
};

/**
 * Calculate pattern behavior for particles
 * @param data Behavior data
 * @returns Calculated forces and transferable objects
 */
function calculatePatternBehavior(data: any): { forces: Float32Array; transferables: Transferable[] } {
  const { positions, velocities, groups, behaviors, timeStep } = data;

  // Create a forces array
  const forces = new Float32Array(positions.length);

  // Process each group separately
  if (groups && groups.length > 0) {
    for (const group of groups) {
      const { startIndex, count, role, behavior } = group;

      // Find the behavior parameters for this group
      const behaviorParams = behaviors?.find(b => b.type === behavior) || {
        strength: 1,
        range: 10,
        priority: 1,
        persistence: 0.5,
        frequency: 1,
        params: {}
      };

      // Apply pattern behavior to the group
      applyPatternToGroup(
        positions,
        velocities,
        forces,
        startIndex,
        count,
        behaviorParams,
        timeStep || 0.016
      );
    }
  } else {
    // Apply pattern behavior to all particles
    const behaviorParams = behaviors?.find(b => b.type === 'pattern') || {
      strength: 1,
      range: 10,
      priority: 1,
      persistence: 0.5,
      frequency: 1,
      params: {}
    };

    applyPatternToGroup(
      positions,
      velocities,
      forces,
      0,
      positions.length / 3,
      behaviorParams,
      timeStep || 0.016
    );
  }

  return {
    forces,
    transferables: [forces.buffer]
  };
}

/**
 * Apply pattern behavior to a group of particles
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param forces Output forces
 * @param startIndex Start index of the group
 * @param count Number of particles in the group
 * @param behaviorParams Behavior parameters
 * @param timeStep Time step
 */
function applyPatternToGroup(
  positions: Float32Array,
  velocities: Float32Array,
  forces: Float32Array,
  startIndex: number,
  count: number,
  behaviorParams: any,
  timeStep: number
): void {
  const {
    strength,
    params
  } = behaviorParams;

  // Get behavior-specific parameters or use defaults
  const formationStrength = params.formationStrength || options.formationStrength;
  const transitionSpeed = params.transitionSpeed || options.transitionSpeed;
  const maxForce = params.maxForce || options.maxForce;
  const damping = params.damping || options.damping;

  // Get pattern type
  const patternType = params.patternType || 'grid';

  // Calculate pattern target positions
  const targetPositions = calculatePatternPositions(
    patternType,
    count,
    params
  );

  // Apply pattern forces to each particle in the group
  for (let i = 0; i < count; i++) {
    const particleIndex = startIndex + i;
    const ix = particleIndex * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // Get target position for this particle
    const targetPosition = targetPositions[i];

    // Calculate direction to target
    const dx = targetPosition.x - positions[ix];
    const dy = targetPosition.y - positions[iy];
    const dz = targetPosition.z - positions[iz];

    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(distanceSquared);

    // Calculate force magnitude (stronger when further away)
    let forceMagnitude = Math.min(distance * formationStrength, maxForce);

    // Apply force
    if (distance > 0.001) {
      forces[ix] += (dx / distance) * forceMagnitude * strength;
      forces[iy] += (dy / distance) * forceMagnitude * strength;
      forces[iz] += (dz / distance) * forceMagnitude * strength;
    }

    // Apply damping to velocity
    forces[ix] -= velocities[ix] * damping;
    forces[iy] -= velocities[iy] * damping;
    forces[iz] -= velocities[iz] * damping;
  }
}

/**
 * Calculate pattern positions for particles
 * @param patternType Type of pattern
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculatePatternPositions(
  patternType: string,
  count: number,
  params: any
): Vector3[] {
  switch (patternType) {
    case 'grid':
      return calculateGridPattern(count, params);
    case 'circle':
      return calculateCirclePattern(count, params);
    case 'sphere':
      return calculateSpherePattern(count, params);
    case 'line':
      return calculateLinePattern(count, params);
    case 'spiral':
      return calculateSpiralPattern(count, params);
    case 'vortex':
      return calculateVortexPattern(count, params);
    case 'wave':
      return calculateWavePattern(count, params);
    case 'random':
      return calculateRandomPattern(count, params);
    default:
      return calculateGridPattern(count, params);
  }
}

/**
 * Calculate grid pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateGridPattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get grid parameters
  const spacing = params.spacing || 2;
  const centerX = params.centerX || 0;
  const centerY = params.centerY || 0;
  const centerZ = params.centerZ || 0;

  // Calculate grid dimensions
  const size = Math.ceil(Math.sqrt(count));
  const halfSize = (size - 1) * spacing / 2;

  // Create grid positions
  for (let i = 0; i < count; i++) {
    const x = (i % size) * spacing - halfSize + centerX;
    const y = Math.floor(i / size) * spacing - halfSize + centerY;
    const z = centerZ;

    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Calculate circle pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateCirclePattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get circle parameters
  const radius = params.radius || 10;
  const centerX = params.centerX || 0;
  const centerY = params.centerY || 0;
  const centerZ = params.centerZ || 0;

  // Create circle positions
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius + centerX;
    const y = Math.sin(angle) * radius + centerY;
    const z = centerZ;

    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Calculate sphere pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateSpherePattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get sphere parameters
  const radius = params.radius || 10;
  const centerX = params.centerX || 0;
  const centerY = params.centerY || 0;
  const centerZ = params.centerZ || 0;

  // Create sphere positions using fibonacci sphere algorithm
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y); // radius at y

    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    positions.push({
      x: x * radius + centerX,
      y: y * radius + centerY,
      z: z * radius + centerZ
    });
  }

  return positions;
}

/**
 * Calculate line pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateLinePattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get line parameters
  const length = params.length || 20;
  const startX = params.startX || -length / 2;
  const startY = params.startY || 0;
  const startZ = params.startZ || 0;
  const endX = params.endX || length / 2;
  const endY = params.endY || 0;
  const endZ = params.endZ || 0;

  // Create line positions
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;
    const z = startZ + (endZ - startZ) * t;

    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Calculate spiral pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateSpiralPattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get spiral parameters
  const radius = params.radius || 10;
  const turns = params.turns || 3;
  const height = params.height || 0;
  const centerX = params.centerX || 0;
  const centerY = params.centerY || 0;
  const centerZ = params.centerZ || 0;

  // Create spiral positions
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = t * turns * Math.PI * 2;
    const r = t * radius;
    const x = Math.cos(angle) * r + centerX;
    const y = Math.sin(angle) * r + centerY;
    const z = t * height + centerZ;

    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Calculate vortex pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateVortexPattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get vortex parameters
  const radius = params.radius || 10;
  const height = params.height || 20;
  const turns = params.turns || 3;
  const centerX = params.centerX || 0;
  const centerY = params.centerY || 0;
  const centerZ = params.centerZ || 0;

  // Create vortex positions
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = t * turns * Math.PI * 2;
    const x = Math.cos(angle) * radius + centerX;
    const y = Math.sin(angle) * radius + centerY;
    const z = t * height + centerZ - height / 2;

    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Calculate wave pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateWavePattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get wave parameters
  const width = params.width || 20;
  const amplitude = params.amplitude || 5;
  const frequency = params.frequency || 1;
  const centerX = params.centerX || 0;
  const centerY = params.centerY || 0;
  const centerZ = params.centerZ || 0;

  // Create wave positions
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = (t - 0.5) * width + centerX;
    const y = Math.sin(t * Math.PI * 2 * frequency) * amplitude + centerY;
    const z = centerZ;

    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Calculate random pattern positions
 * @param count Number of particles
 * @param params Pattern parameters
 * @returns Array of target positions
 */
function calculateRandomPattern(count: number, params: any): Vector3[] {
  const positions: Vector3[] = [];

  // Get random parameters
  const radius = params.radius || 10;
  const centerX = params.centerX || 0;
  const centerY = params.centerY || 0;
  const centerZ = params.centerZ || 0;
  const seed = params.seed || 12345;

  // Create random positions
  for (let i = 0; i < count; i++) {
    // Simple deterministic random function
    const random = (a: number) => {
      const x = Math.sin(a + seed) * 10000;
      return x - Math.floor(x);
    };

    const angle1 = random(i * 0.1) * Math.PI * 2;
    const angle2 = random(i * 0.2) * Math.PI * 2;
    const r = random(i * 0.3) * radius;

    const x = Math.cos(angle1) * Math.cos(angle2) * r + centerX;
    const y = Math.sin(angle1) * Math.cos(angle2) * r + centerY;
    const z = Math.sin(angle2) * r + centerZ;

    positions.push({ x, y, z });
  }

  return positions;
}

// Set up message handling
self.addEventListener('message', (event) => {
  const message = event.data as BehaviorWorkerMessage;

  try {
    switch (message.type) {
      case 'calculateBehavior':
        const result = calculatePatternBehavior(message.data);
        self.postMessage({
          type: 'result',
          id: message.id,
          data: result
        }, result.transferables);
        break;

      case 'initialize':
        // Initialize worker state
        if (message.data?.options) {
          options = { ...options, ...message.data.options };
        }

        self.postMessage({
          type: 'result',
          id: message.id,
          data: { initialized: true }
        });
        break;

      case 'reset':
        // Reset worker state
        options = {
          formationStrength: 1.0,
          transitionSpeed: 0.1,
          maxForce: 0.5,
          damping: 0.9
        };

        self.postMessage({
          type: 'result',
          id: message.id,
          data: { reset: true }
        });
        break;

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      id: message.id,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});
