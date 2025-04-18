/**
 * Position Worker for Bitcoin Protozoa
 * 
 * This worker updates particle positions based on forces and constraints.
 * It handles velocity, acceleration, and damping calculations.
 */

import { PhysicsWorkerMessage } from '../../types/workers/messages';

// Worker state
let options = {
  timeStep: 0.016, // 60 FPS
  damping: 0.98,
  gravity: { x: 0, y: -9.8, z: 0 },
  iterations: 1,
  maxSpeed: 100
};

/**
 * Update particle positions based on forces
 * @param data Physics data
 * @returns Updated positions, velocities, and transferable objects
 */
function updatePositions(data: any): {
  positions: Float32Array;
  velocities: Float32Array;
  transferables: Transferable[];
} {
  const { positions, velocities, forces, masses, constraints, timeStep } = data;
  
  // Use provided timeStep or default
  const dt = timeStep || options.timeStep;
  
  // Create copies of the arrays to avoid modifying the originals
  const newPositions = new Float32Array(positions);
  const newVelocities = new Float32Array(velocities);
  
  // Update velocities and positions
  const particleCount = positions.length / 3;
  
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    // Calculate acceleration (F = ma, a = F/m)
    const mass = masses[i];
    const invMass = mass > 0 ? 1 / mass : 0;
    
    const ax = forces[ix] * invMass + options.gravity.x;
    const ay = forces[iy] * invMass + options.gravity.y;
    const az = forces[iz] * invMass + options.gravity.z;
    
    // Update velocity (v = v + a * dt)
    newVelocities[ix] += ax * dt;
    newVelocities[iy] += ay * dt;
    newVelocities[iz] += az * dt;
    
    // Apply damping
    newVelocities[ix] *= options.damping;
    newVelocities[iy] *= options.damping;
    newVelocities[iz] *= options.damping;
    
    // Limit velocity to max speed
    const speedSquared = newVelocities[ix] * newVelocities[ix] +
                         newVelocities[iy] * newVelocities[iy] +
                         newVelocities[iz] * newVelocities[iz];
    
    if (speedSquared > options.maxSpeed * options.maxSpeed) {
      const speed = Math.sqrt(speedSquared);
      const scale = options.maxSpeed / speed;
      
      newVelocities[ix] *= scale;
      newVelocities[iy] *= scale;
      newVelocities[iz] *= scale;
    }
    
    // Update position (p = p + v * dt)
    newPositions[ix] += newVelocities[ix] * dt;
    newPositions[iy] += newVelocities[iy] * dt;
    newPositions[iz] += newVelocities[iz] * dt;
  }
  
  // Apply constraints
  if (constraints && constraints.length > 0) {
    for (let iteration = 0; iteration < options.iterations; iteration++) {
      applyConstraints(newPositions, newVelocities, constraints, dt);
    }
  }
  
  return {
    positions: newPositions,
    velocities: newVelocities,
    transferables: [newPositions.buffer, newVelocities.buffer]
  };
}

/**
 * Apply constraints to particle positions
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param constraints Constraints to apply
 * @param dt Time step
 */
function applyConstraints(
  positions: Float32Array,
  velocities: Float32Array,
  constraints: any[],
  dt: number
): void {
  for (const constraint of constraints) {
    switch (constraint.type) {
      case 'distance':
        applyDistanceConstraint(positions, velocities, constraint, dt);
        break;
      case 'angle':
        applyAngleConstraint(positions, velocities, constraint, dt);
        break;
      case 'hinge':
        applyHingeConstraint(positions, velocities, constraint, dt);
        break;
      case 'point':
        applyPointConstraint(positions, velocities, constraint, dt);
        break;
    }
  }
}

/**
 * Apply a distance constraint between two particles
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param constraint Distance constraint
 * @param dt Time step
 */
function applyDistanceConstraint(
  positions: Float32Array,
  velocities: Float32Array,
  constraint: any,
  dt: number
): void {
  const { indices, params } = constraint;
  const [i, j] = indices;
  const { distance, stiffness } = params;
  
  const ix = i * 3;
  const iy = ix + 1;
  const iz = ix + 2;
  
  const jx = j * 3;
  const jy = jx + 1;
  const jz = jx + 2;
  
  // Calculate current distance
  const dx = positions[jx] - positions[ix];
  const dy = positions[jy] - positions[iy];
  const dz = positions[jz] - positions[iz];
  
  const currentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Skip if distance is too small to avoid numerical issues
  if (currentDistance < 0.0001) {
    return;
  }
  
  // Calculate correction
  const diff = (currentDistance - distance) / currentDistance;
  const correctionFactor = diff * stiffness;
  
  // Apply correction
  positions[ix] += dx * correctionFactor * 0.5;
  positions[iy] += dy * correctionFactor * 0.5;
  positions[iz] += dz * correctionFactor * 0.5;
  
  positions[jx] -= dx * correctionFactor * 0.5;
  positions[jy] -= dy * correctionFactor * 0.5;
  positions[jz] -= dz * correctionFactor * 0.5;
  
  // Update velocities to reflect the constraint
  const vx = (positions[ix] - (positions[ix] - dx * correctionFactor * 0.5)) / dt;
  const vy = (positions[iy] - (positions[iy] - dy * correctionFactor * 0.5)) / dt;
  const vz = (positions[iz] - (positions[iz] - dz * correctionFactor * 0.5)) / dt;
  
  velocities[ix] = vx;
  velocities[iy] = vy;
  velocities[iz] = vz;
  
  velocities[jx] = -vx;
  velocities[jy] = -vy;
  velocities[jz] = -vz;
}

/**
 * Apply an angle constraint between three particles
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param constraint Angle constraint
 * @param dt Time step
 */
function applyAngleConstraint(
  positions: Float32Array,
  velocities: Float32Array,
  constraint: any,
  dt: number
): void {
  const { indices, params } = constraint;
  const [i, j, k] = indices;
  const { angle, stiffness } = params;
  
  // For simplicity, we'll just maintain the distances for now
  // A proper angle constraint would require more complex calculations
  
  // Apply distance constraints between i-j and j-k
  applyDistanceConstraint(
    positions,
    velocities,
    {
      indices: [i, j],
      params: {
        distance: Math.sqrt(
          Math.pow(positions[i * 3] - positions[j * 3], 2) +
          Math.pow(positions[i * 3 + 1] - positions[j * 3 + 1], 2) +
          Math.pow(positions[i * 3 + 2] - positions[j * 3 + 2], 2)
        ),
        stiffness
      }
    },
    dt
  );
  
  applyDistanceConstraint(
    positions,
    velocities,
    {
      indices: [j, k],
      params: {
        distance: Math.sqrt(
          Math.pow(positions[j * 3] - positions[k * 3], 2) +
          Math.pow(positions[j * 3 + 1] - positions[k * 3 + 1], 2) +
          Math.pow(positions[j * 3 + 2] - positions[k * 3 + 2], 2)
        ),
        stiffness
      }
    },
    dt
  );
}

/**
 * Apply a hinge constraint between particles
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param constraint Hinge constraint
 * @param dt Time step
 */
function applyHingeConstraint(
  positions: Float32Array,
  velocities: Float32Array,
  constraint: any,
  dt: number
): void {
  // Hinge constraints are complex and would require a more sophisticated physics engine
  // For now, we'll just maintain the distances
  const { indices, params } = constraint;
  const { stiffness } = params;
  
  // Apply distance constraints between all pairs
  for (let i = 0; i < indices.length - 1; i++) {
    for (let j = i + 1; j < indices.length; j++) {
      applyDistanceConstraint(
        positions,
        velocities,
        {
          indices: [indices[i], indices[j]],
          params: {
            distance: Math.sqrt(
              Math.pow(positions[indices[i] * 3] - positions[indices[j] * 3], 2) +
              Math.pow(positions[indices[i] * 3 + 1] - positions[indices[j] * 3 + 1], 2) +
              Math.pow(positions[indices[i] * 3 + 2] - positions[indices[j] * 3 + 2], 2)
            ),
            stiffness
          }
        },
        dt
      );
    }
  }
}

/**
 * Apply a point constraint to a particle
 * @param positions Particle positions
 * @param velocities Particle velocities
 * @param constraint Point constraint
 * @param dt Time step
 */
function applyPointConstraint(
  positions: Float32Array,
  velocities: Float32Array,
  constraint: any,
  dt: number
): void {
  const { indices, params } = constraint;
  const [i] = indices;
  const { point, stiffness } = params;
  
  const ix = i * 3;
  const iy = ix + 1;
  const iz = ix + 2;
  
  // Calculate displacement
  const dx = point.x - positions[ix];
  const dy = point.y - positions[iy];
  const dz = point.z - positions[iz];
  
  // Apply correction
  positions[ix] += dx * stiffness;
  positions[iy] += dy * stiffness;
  positions[iz] += dz * stiffness;
  
  // Update velocity
  velocities[ix] = dx * stiffness / dt;
  velocities[iy] = dy * stiffness / dt;
  velocities[iz] = dz * stiffness / dt;
}

// Set up message handling
self.addEventListener('message', (event) => {
  const message = event.data as PhysicsWorkerMessage;
  
  try {
    switch (message.type) {
      case 'updatePositions':
        const result = updatePositions(message.data);
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
          timeStep: 0.016,
          damping: 0.98,
          gravity: { x: 0, y: -9.8, z: 0 },
          iterations: 1,
          maxSpeed: 100
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
