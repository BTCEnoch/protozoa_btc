/**
 * Particle Worker for Bitcoin Protozoa
 *
 * This worker handles particle physics calculations for large particle groups.
 * It offloads computation from the main thread to improve performance.
 */

import { Vector3 } from '../../types/common';
import { WorkerMessage } from '../../types/workers/messages';

// Worker context
const ctx: Worker = self as any;

// Default options
const defaultOptions = {
  maxSpeed: 10.0,
  maxForce: 1.0,
  damping: 0.95,
  gravity: 0.0,
  collisionRadius: 0.5,
  bounceCoefficient: 0.8
};

// Current options
let options = { ...defaultOptions };

// Handle messages from the main thread
ctx.addEventListener('message', (event) => {
  const message = event.data as WorkerMessage;
  
  try {
    switch (message.type) {
      case 'updatePositions':
        const result = updateParticlePositions(message.data);
        ctx.postMessage({
          type: 'result',
          id: message.id,
          data: result
        }, result.transferables);
        break;
        
      case 'calculateForces':
        const forcesResult = calculateForces(message.data);
        ctx.postMessage({
          type: 'result',
          id: message.id,
          data: forcesResult
        }, forcesResult.transferables);
        break;
        
      case 'initialize':
        // Initialize worker state
        if (message.data?.options) {
          options = { ...options, ...message.data.options };
        }
        
        ctx.postMessage({
          type: 'result',
          id: message.id,
          data: { initialized: true }
        });
        break;
        
      case 'reset':
        // Reset worker state
        options = { ...defaultOptions };
        
        ctx.postMessage({
          type: 'result',
          id: message.id,
          data: { reset: true }
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    ctx.postMessage({
      type: 'error',
      id: message.id,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }
});

/**
 * Update particle positions based on velocities
 * @param data The particle data
 * @returns Updated particle data
 */
function updateParticlePositions(data: {
  positions: Float32Array;
  velocities: Float32Array;
  accelerations: Float32Array;
  deltaTime: number;
}): {
  positions: Float32Array;
  velocities: Float32Array;
  accelerations: Float32Array;
  transferables: Transferable[];
} {
  const { positions, velocities, accelerations, deltaTime } = data;
  const count = positions.length / 3;
  
  // Update velocities based on accelerations
  for (let i = 0; i < count; i++) {
    const ix3 = i * 3;
    
    // Apply damping
    velocities[ix3] *= options.damping;
    velocities[ix3 + 1] *= options.damping;
    velocities[ix3 + 2] *= options.damping;
    
    // Update velocity based on acceleration
    velocities[ix3] += accelerations[ix3] * deltaTime;
    velocities[ix3 + 1] += accelerations[ix3 + 1] * deltaTime;
    velocities[ix3 + 2] += accelerations[ix3 + 2] * deltaTime;
    
    // Apply max speed limit
    const speedSquared = 
      velocities[ix3] * velocities[ix3] + 
      velocities[ix3 + 1] * velocities[ix3 + 1] + 
      velocities[ix3 + 2] * velocities[ix3 + 2];
      
    if (speedSquared > options.maxSpeed * options.maxSpeed) {
      const speed = Math.sqrt(speedSquared);
      const scale = options.maxSpeed / speed;
      velocities[ix3] *= scale;
      velocities[ix3 + 1] *= scale;
      velocities[ix3 + 2] *= scale;
    }
    
    // Update position based on velocity
    positions[ix3] += velocities[ix3] * deltaTime;
    positions[ix3 + 1] += velocities[ix3 + 1] * deltaTime;
    positions[ix3 + 2] += velocities[ix3 + 2] * deltaTime;
    
    // Reset acceleration
    accelerations[ix3] = 0;
    accelerations[ix3 + 1] = 0;
    accelerations[ix3 + 2] = 0;
  }
  
  return {
    positions,
    velocities,
    accelerations,
    transferables: [
      positions.buffer,
      velocities.buffer,
      accelerations.buffer
    ]
  };
}

/**
 * Calculate forces for particles
 * @param data The particle data
 * @returns Calculated forces
 */
function calculateForces(data: {
  positions: Float32Array;
  velocities: Float32Array;
  targetPositions?: Float32Array;
  behaviorParams?: any;
  deltaTime: number;
}): {
  forces: Float32Array;
  transferables: Transferable[];
} {
  const { positions, velocities, targetPositions, behaviorParams, deltaTime } = data;
  const count = positions.length / 3;
  const forces = new Float32Array(positions.length);
  
  // Apply behavior forces
  if (behaviorParams) {
    applyBehaviorForces(positions, velocities, forces, behaviorParams, count);
  }
  
  // Apply target position forces if available
  if (targetPositions) {
    applyTargetForces(positions, targetPositions, forces, count);
  }
  
  // Apply gravity
  if (options.gravity !== 0) {
    for (let i = 0; i < count; i++) {
      forces[i * 3 + 1] -= options.gravity;
    }
  }
  
  return {
    forces,
    transferables: [forces.buffer]
  };
}

/**
 * Apply behavior forces to particles
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param forces Output forces
 * @param behaviorParams Behavior parameters
 * @param count Number of particles
 */
function applyBehaviorForces(
  positions: Float32Array,
  velocities: Float32Array,
  forces: Float32Array,
  behaviorParams: any,
  count: number
): void {
  // Apply separation force
  if (behaviorParams.separationWeight > 0) {
    applySeparationForce(positions, forces, behaviorParams.separationWeight, behaviorParams.perception || 5, count);
  }
  
  // Apply alignment force
  if (behaviorParams.alignmentWeight > 0) {
    applyAlignmentForce(positions, velocities, forces, behaviorParams.alignmentWeight, behaviorParams.perception || 5, count);
  }
  
  // Apply cohesion force
  if (behaviorParams.cohesionWeight > 0) {
    applyCohesionForce(positions, forces, behaviorParams.cohesionWeight, behaviorParams.perception || 5, count);
  }
}

/**
 * Apply separation force to particles
 * @param positions Particle positions
 * @param forces Output forces
 * @param weight Force weight
 * @param perception Perception radius
 * @param count Number of particles
 */
function applySeparationForce(
  positions: Float32Array,
  forces: Float32Array,
  weight: number,
  perception: number,
  count: number
): void {
  const perceptionSquared = perception * perception;
  
  for (let i = 0; i < count; i++) {
    const ix3 = i * 3;
    let steerX = 0;
    let steerY = 0;
    let steerZ = 0;
    let total = 0;
    
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      
      const jx3 = j * 3;
      const dx = positions[ix3] - positions[jx3];
      const dy = positions[ix3 + 1] - positions[jx3 + 1];
      const dz = positions[ix3 + 2] - positions[jx3 + 2];
      const distSquared = dx * dx + dy * dy + dz * dz;
      
      if (distSquared < perceptionSquared) {
        // Calculate separation vector
        const dist = Math.sqrt(distSquared);
        const factor = weight / (dist + 0.0001);
        
        steerX += dx * factor;
        steerY += dy * factor;
        steerZ += dz * factor;
        total++;
      }
    }
    
    if (total > 0) {
      forces[ix3] += steerX;
      forces[ix3 + 1] += steerY;
      forces[ix3 + 2] += steerZ;
    }
  }
}

/**
 * Apply alignment force to particles
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param forces Output forces
 * @param weight Force weight
 * @param perception Perception radius
 * @param count Number of particles
 */
function applyAlignmentForce(
  positions: Float32Array,
  velocities: Float32Array,
  forces: Float32Array,
  weight: number,
  perception: number,
  count: number
): void {
  const perceptionSquared = perception * perception;
  
  for (let i = 0; i < count; i++) {
    const ix3 = i * 3;
    let avgVelX = 0;
    let avgVelY = 0;
    let avgVelZ = 0;
    let total = 0;
    
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      
      const jx3 = j * 3;
      const dx = positions[jx3] - positions[ix3];
      const dy = positions[jx3 + 1] - positions[ix3 + 1];
      const dz = positions[jx3 + 2] - positions[ix3 + 2];
      const distSquared = dx * dx + dy * dy + dz * dz;
      
      if (distSquared < perceptionSquared) {
        avgVelX += velocities[jx3];
        avgVelY += velocities[jx3 + 1];
        avgVelZ += velocities[jx3 + 2];
        total++;
      }
    }
    
    if (total > 0) {
      avgVelX /= total;
      avgVelY /= total;
      avgVelZ /= total;
      
      // Calculate alignment force
      const forceX = (avgVelX - velocities[ix3]) * weight;
      const forceY = (avgVelY - velocities[ix3 + 1]) * weight;
      const forceZ = (avgVelZ - velocities[ix3 + 2]) * weight;
      
      forces[ix3] += forceX;
      forces[ix3 + 1] += forceY;
      forces[ix3 + 2] += forceZ;
    }
  }
}

/**
 * Apply cohesion force to particles
 * @param positions Particle positions
 * @param forces Output forces
 * @param weight Force weight
 * @param perception Perception radius
 * @param count Number of particles
 */
function applyCohesionForce(
  positions: Float32Array,
  forces: Float32Array,
  weight: number,
  perception: number,
  count: number
): void {
  const perceptionSquared = perception * perception;
  
  for (let i = 0; i < count; i++) {
    const ix3 = i * 3;
    let centerX = 0;
    let centerY = 0;
    let centerZ = 0;
    let total = 0;
    
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      
      const jx3 = j * 3;
      const dx = positions[jx3] - positions[ix3];
      const dy = positions[jx3 + 1] - positions[ix3 + 1];
      const dz = positions[jx3 + 2] - positions[ix3 + 2];
      const distSquared = dx * dx + dy * dy + dz * dz;
      
      if (distSquared < perceptionSquared) {
        centerX += positions[jx3];
        centerY += positions[jx3 + 1];
        centerZ += positions[jx3 + 2];
        total++;
      }
    }
    
    if (total > 0) {
      centerX /= total;
      centerY /= total;
      centerZ /= total;
      
      // Calculate direction to center
      const dirX = centerX - positions[ix3];
      const dirY = centerY - positions[ix3 + 1];
      const dirZ = centerZ - positions[ix3 + 2];
      
      // Calculate cohesion force
      forces[ix3] += dirX * weight;
      forces[ix3 + 1] += dirY * weight;
      forces[ix3 + 2] += dirZ * weight;
    }
  }
}

/**
 * Apply target position forces to particles
 * @param positions Particle positions
 * @param targetPositions Target positions
 * @param forces Output forces
 * @param count Number of particles
 */
function applyTargetForces(
  positions: Float32Array,
  targetPositions: Float32Array,
  forces: Float32Array,
  count: number
): void {
  const targetWeight = 1.0; // Strength of target attraction
  
  for (let i = 0; i < count; i++) {
    const ix3 = i * 3;
    
    // Skip if target position is not defined
    if (isNaN(targetPositions[ix3]) || 
        isNaN(targetPositions[ix3 + 1]) || 
        isNaN(targetPositions[ix3 + 2])) {
      continue;
    }
    
    // Calculate direction to target
    const dirX = targetPositions[ix3] - positions[ix3];
    const dirY = targetPositions[ix3 + 1] - positions[ix3 + 1];
    const dirZ = targetPositions[ix3 + 2] - positions[ix3 + 2];
    
    // Calculate distance to target
    const distSquared = dirX * dirX + dirY * dirY + dirZ * dirZ;
    
    if (distSquared > 0.0001) {
      const dist = Math.sqrt(distSquared);
      const factor = Math.min(dist, options.maxForce) * targetWeight;
      
      forces[ix3] += (dirX / dist) * factor;
      forces[ix3 + 1] += (dirY / dist) * factor;
      forces[ix3 + 2] += (dirZ / dist) * factor;
    }
  }
}

// Notify that the worker is ready
ctx.postMessage({ type: 'ready' });
