/**
 * Flocking Worker for Bitcoin Protozoa
 *
 * This worker calculates flocking behaviors for particles, including
 * separation, alignment, cohesion, and other group behaviors.
 */

import { BehaviorWorkerMessage } from '../../types/workers/messages';
import { Vector3 } from '../../types/common';

// Worker state
let options = {
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  targetWeight: 1.0,
  perceptionRadius: 10,
  maxSpeed: 10,
  maxForce: 0.1
};

/**
 * Calculate flocking behavior for particles
 * @param data Behavior data
 * @returns Calculated forces and transferable objects
 */
function calculateFlockingBehavior(data: any): { forces: Float32Array; transferables: Transferable[] } {
  const { positions, velocities, groups, behaviors, targets, timeStep } = data;

  // Create a forces array
  const forces = new Float32Array(positions.length);

  // Process each group separately
  if (groups && groups.length > 0) {
    for (const group of groups) {
      const { startIndex, count, role, behavior } = group;

      // Find the behavior parameters for this group
      const behaviorParams = behaviors?.find(b => b.type === behavior) || {
        strength: 1,
        range: options.perceptionRadius,
        priority: 1,
        persistence: 0.5,
        frequency: 1,
        params: {}
      };

      // Apply flocking behavior to the group
      applyFlockingToGroup(
        positions,
        velocities,
        forces,
        startIndex,
        count,
        behaviorParams,
        targets,
        timeStep || 0.016
      );
    }
  } else {
    // Apply flocking behavior to all particles
    const behaviorParams = behaviors?.find(b => b.type === 'flock') || {
      strength: 1,
      range: options.perceptionRadius,
      priority: 1,
      persistence: 0.5,
      frequency: 1,
      params: {}
    };

    applyFlockingToGroup(
      positions,
      velocities,
      forces,
      0,
      positions.length / 3,
      behaviorParams,
      targets,
      timeStep || 0.016
    );
  }

  return {
    forces,
    transferables: [forces.buffer]
  };
}

/**
 * Apply flocking behavior to a group of particles
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param forces Output forces
 * @param startIndex Start index of the group
 * @param count Number of particles in the group
 * @param behaviorParams Behavior parameters
 * @param targets Target positions
 * @param timeStep Time step
 */
function applyFlockingToGroup(
  positions: Float32Array,
  velocities: Float32Array,
  forces: Float32Array,
  startIndex: number,
  count: number,
  behaviorParams: any,
  targets: any[],
  timeStep: number
): void {
  const {
    strength,
    range,
    params
  } = behaviorParams;

  // Get behavior-specific parameters or use defaults
  const separationWeight = params.separationWeight || options.separationWeight;
  const alignmentWeight = params.alignmentWeight || options.alignmentWeight;
  const cohesionWeight = params.cohesionWeight || options.cohesionWeight;
  const targetWeight = params.targetWeight || options.targetWeight;
  const perceptionRadius = range || options.perceptionRadius;
  const maxSpeed = params.maxSpeed || options.maxSpeed;
  const maxForce = params.maxForce || options.maxForce;

  // Apply flocking behavior to each particle in the group
  for (let i = 0; i < count; i++) {
    const particleIndex = startIndex + i;
    const ix = particleIndex * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // Calculate separation force
    const separation = calculateSeparation(
      positions,
      particleIndex,
      startIndex,
      count,
      perceptionRadius
    );

    // Calculate alignment force
    const alignment = calculateAlignment(
      positions,
      velocities,
      particleIndex,
      startIndex,
      count,
      perceptionRadius
    );

    // Calculate cohesion force
    const cohesion = calculateCohesion(
      positions,
      particleIndex,
      startIndex,
      count,
      perceptionRadius
    );

    // Calculate target force
    const target = calculateTargetForce(
      positions,
      particleIndex,
      targets
    );

    // Apply weights and combine forces
    forces[ix] += (
      separation.x * separationWeight +
      alignment.x * alignmentWeight +
      cohesion.x * cohesionWeight +
      target.x * targetWeight
    ) * strength;

    forces[iy] += (
      separation.y * separationWeight +
      alignment.y * alignmentWeight +
      cohesion.y * cohesionWeight +
      target.y * targetWeight
    ) * strength;

    forces[iz] += (
      separation.z * separationWeight +
      alignment.z * alignmentWeight +
      cohesion.z * cohesionWeight +
      target.z * targetWeight
    ) * strength;

    // Limit force magnitude
    const forceMagnitudeSquared =
      forces[ix] * forces[ix] +
      forces[iy] * forces[iy] +
      forces[iz] * forces[iz];

    if (forceMagnitudeSquared > maxForce * maxForce) {
      const forceMagnitude = Math.sqrt(forceMagnitudeSquared);
      const scale = maxForce / forceMagnitude;

      forces[ix] *= scale;
      forces[iy] *= scale;
      forces[iz] *= scale;
    }
  }
}

/**
 * Calculate separation force for a particle
 * @param positions Particle positions
 * @param particleIndex Index of the particle
 * @param startIndex Start index of the group
 * @param count Number of particles in the group
 * @param perceptionRadius Perception radius
 * @returns Separation force vector
 */
function calculateSeparation(
  positions: Float32Array,
  particleIndex: number,
  startIndex: number,
  count: number,
  perceptionRadius: number
): Vector3 {
  const ix = particleIndex * 3;
  const iy = ix + 1;
  const iz = ix + 2;

  const steering: Vector3 = { x: 0, y: 0, z: 0 };
  let total = 0;

  // Check all particles in the group
  for (let i = 0; i < count; i++) {
    const otherIndex = startIndex + i;

    // Skip self
    if (otherIndex === particleIndex) {
      continue;
    }

    const ox = otherIndex * 3;
    const oy = ox + 1;
    const oz = ox + 2;

    // Calculate distance vector
    const dx = positions[ix] - positions[ox];
    const dy = positions[iy] - positions[oy];
    const dz = positions[iz] - positions[oz];

    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;

    // Check if within perception radius
    if (distanceSquared < perceptionRadius * perceptionRadius && distanceSquared > 0) {
      // Calculate separation force (inversely proportional to distance)
      const distance = Math.sqrt(distanceSquared);
      const factor = 1 / distance;

      steering.x += dx * factor;
      steering.y += dy * factor;
      steering.z += dz * factor;

      total++;
    }
  }

  // Average the forces
  if (total > 0) {
    steering.x /= total;
    steering.y /= total;
    steering.z /= total;

    // Normalize and scale
    const magnitude = Math.sqrt(
      steering.x * steering.x +
      steering.y * steering.y +
      steering.z * steering.z
    );

    if (magnitude > 0) {
      steering.x /= magnitude;
      steering.y /= magnitude;
      steering.z /= magnitude;
    }
  }

  return steering;
}

/**
 * Calculate alignment force for a particle
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param particleIndex Index of the particle
 * @param startIndex Start index of the group
 * @param count Number of particles in the group
 * @param perceptionRadius Perception radius
 * @returns Alignment force vector
 */
function calculateAlignment(
  positions: Float32Array,
  velocities: Float32Array,
  particleIndex: number,
  startIndex: number,
  count: number,
  perceptionRadius: number
): Vector3 {
  const ix = particleIndex * 3;
  const iy = ix + 1;
  const iz = ix + 2;

  const steering: Vector3 = { x: 0, y: 0, z: 0 };
  let total = 0;

  // Check all particles in the group
  for (let i = 0; i < count; i++) {
    const otherIndex = startIndex + i;

    // Skip self
    if (otherIndex === particleIndex) {
      continue;
    }

    const ox = otherIndex * 3;
    const oy = ox + 1;
    const oz = ox + 2;

    // Calculate distance vector
    const dx = positions[ox] - positions[ix];
    const dy = positions[oy] - positions[iy];
    const dz = positions[oz] - positions[iz];

    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;

    // Check if within perception radius
    if (distanceSquared < perceptionRadius * perceptionRadius) {
      // Add velocity to steering
      steering.x += velocities[ox];
      steering.y += velocities[oy];
      steering.z += velocities[oz];

      total++;
    }
  }

  // Average the velocities
  if (total > 0) {
    steering.x /= total;
    steering.y /= total;
    steering.z /= total;

    // Normalize and scale
    const magnitude = Math.sqrt(
      steering.x * steering.x +
      steering.y * steering.y +
      steering.z * steering.z
    );

    if (magnitude > 0) {
      steering.x /= magnitude;
      steering.y /= magnitude;
      steering.z /= magnitude;
    }
  }

  return steering;
}

/**
 * Calculate cohesion force for a particle
 * @param positions Particle positions
 * @param particleIndex Index of the particle
 * @param startIndex Start index of the group
 * @param count Number of particles in the group
 * @param perceptionRadius Perception radius
 * @returns Cohesion force vector
 */
function calculateCohesion(
  positions: Float32Array,
  particleIndex: number,
  startIndex: number,
  count: number,
  perceptionRadius: number
): Vector3 {
  const ix = particleIndex * 3;
  const iy = ix + 1;
  const iz = ix + 2;

  const center: Vector3 = { x: 0, y: 0, z: 0 };
  let total = 0;

  // Check all particles in the group
  for (let i = 0; i < count; i++) {
    const otherIndex = startIndex + i;

    // Skip self
    if (otherIndex === particleIndex) {
      continue;
    }

    const ox = otherIndex * 3;
    const oy = ox + 1;
    const oz = ox + 2;

    // Calculate distance vector
    const dx = positions[ox] - positions[ix];
    const dy = positions[oy] - positions[iy];
    const dz = positions[oz] - positions[iz];

    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;

    // Check if within perception radius
    if (distanceSquared < perceptionRadius * perceptionRadius) {
      // Add position to center
      center.x += positions[ox];
      center.y += positions[oy];
      center.z += positions[oz];

      total++;
    }
  }

  // Calculate steering towards center
  const steering: Vector3 = { x: 0, y: 0, z: 0 };

  if (total > 0) {
    // Calculate center of mass
    center.x /= total;
    center.y /= total;
    center.z /= total;

    // Calculate direction to center
    steering.x = center.x - positions[ix];
    steering.y = center.y - positions[iy];
    steering.z = center.z - positions[iz];

    // Normalize and scale
    const magnitude = Math.sqrt(
      steering.x * steering.x +
      steering.y * steering.y +
      steering.z * steering.z
    );

    if (magnitude > 0) {
      steering.x /= magnitude;
      steering.y /= magnitude;
      steering.z /= magnitude;
    }
  }

  return steering;
}

/**
 * Calculate target force for a particle
 * @param positions Particle positions
 * @param particleIndex Index of the particle
 * @param targets Target positions
 * @returns Target force vector
 */
function calculateTargetForce(
  positions: Float32Array,
  particleIndex: number,
  targets: any[]
): Vector3 {
  const ix = particleIndex * 3;
  const iy = ix + 1;
  const iz = ix + 2;

  const steering: Vector3 = { x: 0, y: 0, z: 0 };

  // If no targets, return zero force
  if (!targets || targets.length === 0) {
    return steering;
  }

  // Find the closest target
  let closestTarget = targets[0];
  let closestDistanceSquared = Number.MAX_VALUE;

  for (const target of targets) {
    const dx = target.position.x - positions[ix];
    const dy = target.position.y - positions[iy];
    const dz = target.position.z - positions[iz];

    const distanceSquared = dx * dx + dy * dy + dz * dz;

    if (distanceSquared < closestDistanceSquared) {
      closestDistanceSquared = distanceSquared;
      closestTarget = target;
    }
  }

  // Calculate direction to target
  steering.x = closestTarget.position.x - positions[ix];
  steering.y = closestTarget.position.y - positions[iy];
  steering.z = closestTarget.position.z - positions[iz];

  // Normalize and scale
  const magnitude = Math.sqrt(
    steering.x * steering.x +
    steering.y * steering.y +
    steering.z * steering.z
  );

  if (magnitude > 0) {
    steering.x /= magnitude;
    steering.y /= magnitude;
    steering.z /= magnitude;

    // Apply target weight
    steering.x *= closestTarget.weight || 1;
    steering.y *= closestTarget.weight || 1;
    steering.z *= closestTarget.weight || 1;
  }

  return steering;
}

// Set up message handling
self.addEventListener('message', (event) => {
  const message = event.data as BehaviorWorkerMessage;

  try {
    switch (message.type) {
      case 'calculateBehavior':
        const result = calculateFlockingBehavior(message.data);
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
          separationWeight: 1.5,
          alignmentWeight: 1.0,
          cohesionWeight: 1.0,
          targetWeight: 1.0,
          perceptionRadius: 10,
          maxSpeed: 10,
          maxForce: 0.1
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
