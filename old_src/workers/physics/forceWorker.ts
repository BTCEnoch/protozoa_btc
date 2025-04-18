/**
 * Force Worker for Bitcoin Protozoa
 * 
 * This worker calculates forces between particles for physics simulations.
 * It handles various force types including gravity, attraction, repulsion,
 * and custom force fields.
 */

import { PhysicsWorkerMessage } from '../../types/workers/messages';
import { ForceCalculationOptions } from '../../types/workers/physics';
import { SpatialGrid } from '../shared/spatialGrid';

// Worker state
let spatialGrid: SpatialGrid | null = null;
let options: ForceCalculationOptions = {
  method: 'direct',
  optimizationLevel: 'medium',
  theta: 0.5,
  cellSize: 10,
  cutoffDistance: 50,
  useMultipleThreads: false,
  threadCount: 1
};

/**
 * Calculate forces between particles
 * @param data Physics data
 * @returns Calculated forces and transferable objects
 */
function calculateForces(data: any): { forces: Float32Array; transferables: Transferable[] } {
  const { positions, masses, forceFields } = data;
  
  // Create a forces array
  const forces = new Float32Array(positions.length);
  
  // Update the spatial grid if using grid optimization
  if (options.method === 'grid' && spatialGrid) {
    spatialGrid.update(positions);
  } else if (options.method === 'grid') {
    spatialGrid = new SpatialGrid(options.cellSize);
    spatialGrid.update(positions);
  }
  
  // Calculate forces based on the selected method
  switch (options.method) {
    case 'direct':
      calculateDirectForces(positions, masses, forces, forceFields);
      break;
    case 'grid':
      calculateGridForces(positions, masses, forces, forceFields);
      break;
    case 'barnes-hut':
      calculateBarnesHutForces(positions, masses, forces, forceFields);
      break;
    default:
      calculateDirectForces(positions, masses, forces, forceFields);
  }
  
  return {
    forces,
    transferables: [forces.buffer]
  };
}

/**
 * Calculate forces using the direct method (O(n²))
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param forceFields Force fields
 */
function calculateDirectForces(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  forceFields: any[]
): void {
  const particleCount = positions.length / 3;
  
  // Initialize forces to zero
  for (let i = 0; i < forces.length; i++) {
    forces[i] = 0;
  }
  
  // Calculate particle-particle forces
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    for (let j = i + 1; j < particleCount; j++) {
      const jx = j * 3;
      const jy = jx + 1;
      const jz = jx + 2;
      
      // Calculate distance vector
      const dx = positions[jx] - positions[ix];
      const dy = positions[jy] - positions[iy];
      const dz = positions[jz] - positions[iz];
      
      // Calculate distance squared
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      
      // Skip if distance is too small to avoid numerical issues
      if (distanceSquared < 0.0001) {
        continue;
      }
      
      // Apply cutoff distance if specified
      if (options.cutoffDistance && distanceSquared > options.cutoffDistance * options.cutoffDistance) {
        continue;
      }
      
      // Calculate gravitational force
      const distance = Math.sqrt(distanceSquared);
      const forceMagnitude = (masses[i] * masses[j]) / distanceSquared;
      
      // Calculate force components
      const fx = (forceMagnitude * dx) / distance;
      const fy = (forceMagnitude * dy) / distance;
      const fz = (forceMagnitude * dz) / distance;
      
      // Apply force to both particles (action-reaction)
      forces[ix] += fx;
      forces[iy] += fy;
      forces[iz] += fz;
      
      forces[jx] -= fx;
      forces[jy] -= fy;
      forces[jz] -= fz;
    }
  }
  
  // Apply force fields
  if (forceFields && forceFields.length > 0) {
    applyForceFields(positions, masses, forces, forceFields);
  }
}

/**
 * Calculate forces using the grid method (O(n))
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param forceFields Force fields
 */
function calculateGridForces(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  forceFields: any[]
): void {
  const particleCount = positions.length / 3;
  
  // Initialize forces to zero
  for (let i = 0; i < forces.length; i++) {
    forces[i] = 0;
  }
  
  // Ensure we have a spatial grid
  if (!spatialGrid) {
    spatialGrid = new SpatialGrid(options.cellSize);
    spatialGrid.update(positions);
  }
  
  // Calculate particle-particle forces using the grid
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    // Get nearby particles
    const neighbors = spatialGrid.getNeighborIndices(i, options.cutoffDistance || 50);
    
    for (const j of neighbors) {
      const jx = j * 3;
      const jy = jx + 1;
      const jz = jx + 2;
      
      // Calculate distance vector
      const dx = positions[jx] - positions[ix];
      const dy = positions[jy] - positions[iy];
      const dz = positions[jz] - positions[iz];
      
      // Calculate distance squared
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      
      // Skip if distance is too small to avoid numerical issues
      if (distanceSquared < 0.0001) {
        continue;
      }
      
      // Calculate gravitational force
      const distance = Math.sqrt(distanceSquared);
      const forceMagnitude = (masses[i] * masses[j]) / distanceSquared;
      
      // Calculate force components
      const fx = (forceMagnitude * dx) / distance;
      const fy = (forceMagnitude * dy) / distance;
      const fz = (forceMagnitude * dz) / distance;
      
      // Apply force to both particles (action-reaction)
      forces[ix] += fx;
      forces[iy] += fy;
      forces[iz] += fz;
      
      forces[jx] -= fx;
      forces[jy] -= fy;
      forces[jz] -= fz;
    }
  }
  
  // Apply force fields
  if (forceFields && forceFields.length > 0) {
    applyForceFields(positions, masses, forces, forceFields);
  }
}

/**
 * Calculate forces using the Barnes-Hut algorithm (O(n log n))
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param forceFields Force fields
 */
function calculateBarnesHutForces(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  forceFields: any[]
): void {
  // For now, fall back to direct calculation
  // Barnes-Hut requires an octree implementation which is more complex
  calculateDirectForces(positions, masses, forces, forceFields);
}

/**
 * Apply force fields to particles
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param forceFields Force fields
 */
function applyForceFields(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  forceFields: any[]
): void {
  const particleCount = positions.length / 3;
  
  for (const field of forceFields) {
    switch (field.type) {
      case 'gravity':
        applyGravityField(positions, masses, forces, field, particleCount);
        break;
      case 'attraction':
        applyAttractionField(positions, masses, forces, field, particleCount);
        break;
      case 'repulsion':
        applyRepulsionField(positions, masses, forces, field, particleCount);
        break;
      case 'vortex':
        applyVortexField(positions, masses, forces, field, particleCount);
        break;
      case 'wind':
        applyWindField(positions, masses, forces, field, particleCount);
        break;
    }
  }
}

/**
 * Apply a gravity field to particles
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param field Gravity field
 * @param particleCount Number of particles
 */
function applyGravityField(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  field: any,
  particleCount: number
): void {
  // Apply a uniform gravity force in the specified direction
  const { direction, strength } = field;
  
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    forces[ix] += direction.x * strength * masses[i];
    forces[iy] += direction.y * strength * masses[i];
    forces[iz] += direction.z * strength * masses[i];
  }
}

/**
 * Apply an attraction field to particles
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param field Attraction field
 * @param particleCount Number of particles
 */
function applyAttractionField(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  field: any,
  particleCount: number
): void {
  // Apply an attraction force towards a point
  const { position, strength, radius, falloff } = field;
  
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    // Calculate distance vector
    const dx = position.x - positions[ix];
    const dy = position.y - positions[iy];
    const dz = position.z - positions[iz];
    
    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    // Skip if distance is too small to avoid numerical issues
    if (distanceSquared < 0.0001) {
      continue;
    }
    
    // Apply radius cutoff
    if (radius && distanceSquared > radius * radius) {
      continue;
    }
    
    // Calculate force magnitude based on falloff
    let forceMagnitude = strength * masses[i];
    const distance = Math.sqrt(distanceSquared);
    
    switch (falloff) {
      case 'linear':
        forceMagnitude *= 1 - distance / radius;
        break;
      case 'quadratic':
        forceMagnitude *= 1 - (distance * distance) / (radius * radius);
        break;
      case 'exponential':
        forceMagnitude *= Math.exp(-distance / radius);
        break;
      default:
        // No falloff
        break;
    }
    
    // Calculate force components
    const fx = (forceMagnitude * dx) / distance;
    const fy = (forceMagnitude * dy) / distance;
    const fz = (forceMagnitude * dz) / distance;
    
    // Apply force
    forces[ix] += fx;
    forces[iy] += fy;
    forces[iz] += fz;
  }
}

/**
 * Apply a repulsion field to particles
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param field Repulsion field
 * @param particleCount Number of particles
 */
function applyRepulsionField(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  field: any,
  particleCount: number
): void {
  // Apply a repulsion force away from a point
  const { position, strength, radius, falloff } = field;
  
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    // Calculate distance vector
    const dx = positions[ix] - position.x;
    const dy = positions[iy] - position.y;
    const dz = positions[iz] - position.z;
    
    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    // Skip if distance is too small to avoid numerical issues
    if (distanceSquared < 0.0001) {
      continue;
    }
    
    // Apply radius cutoff
    if (radius && distanceSquared > radius * radius) {
      continue;
    }
    
    // Calculate force magnitude based on falloff
    let forceMagnitude = strength * masses[i];
    const distance = Math.sqrt(distanceSquared);
    
    switch (falloff) {
      case 'linear':
        forceMagnitude *= 1 - distance / radius;
        break;
      case 'quadratic':
        forceMagnitude *= 1 - (distance * distance) / (radius * radius);
        break;
      case 'exponential':
        forceMagnitude *= Math.exp(-distance / radius);
        break;
      default:
        // No falloff
        break;
    }
    
    // Calculate force components
    const fx = (forceMagnitude * dx) / distance;
    const fy = (forceMagnitude * dy) / distance;
    const fz = (forceMagnitude * dz) / distance;
    
    // Apply force
    forces[ix] += fx;
    forces[iy] += fy;
    forces[iz] += fz;
  }
}

/**
 * Apply a vortex field to particles
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param field Vortex field
 * @param particleCount Number of particles
 */
function applyVortexField(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  field: any,
  particleCount: number
): void {
  // Apply a vortex force around a point
  const { position, strength, radius, falloff } = field;
  
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    // Calculate distance vector
    const dx = positions[ix] - position.x;
    const dy = positions[iy] - position.y;
    const dz = positions[iz] - position.z;
    
    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    // Skip if distance is too small to avoid numerical issues
    if (distanceSquared < 0.0001) {
      continue;
    }
    
    // Apply radius cutoff
    if (radius && distanceSquared > radius * radius) {
      continue;
    }
    
    // Calculate force magnitude based on falloff
    let forceMagnitude = strength * masses[i];
    const distance = Math.sqrt(distanceSquared);
    
    switch (falloff) {
      case 'linear':
        forceMagnitude *= 1 - distance / radius;
        break;
      case 'quadratic':
        forceMagnitude *= 1 - (distance * distance) / (radius * radius);
        break;
      case 'exponential':
        forceMagnitude *= Math.exp(-distance / radius);
        break;
      default:
        // No falloff
        break;
    }
    
    // Calculate tangential force components (cross product with up vector)
    const fx = forceMagnitude * dy;
    const fy = -forceMagnitude * dx;
    const fz = 0; // Assuming vortex is in XY plane
    
    // Apply force
    forces[ix] += fx;
    forces[iy] += fy;
    forces[iz] += fz;
  }
}

/**
 * Apply a wind field to particles
 * @param positions Particle positions
 * @param masses Particle masses
 * @param forces Output forces
 * @param field Wind field
 * @param particleCount Number of particles
 */
function applyWindField(
  positions: Float32Array,
  masses: Float32Array,
  forces: Float32Array,
  field: any,
  particleCount: number
): void {
  // Apply a uniform wind force in the specified direction
  const { direction, strength } = field;
  
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;
    
    forces[ix] += direction.x * strength;
    forces[iy] += direction.y * strength;
    forces[iz] += direction.z * strength;
  }
}

// Set up message handling
self.addEventListener('message', (event) => {
  const message = event.data as PhysicsWorkerMessage;
  
  try {
    switch (message.type) {
      case 'calculateForces':
        const result = calculateForces(message.data);
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
        
        if (options.method === 'grid') {
          spatialGrid = new SpatialGrid(options.cellSize);
        }
        
        self.postMessage({
          type: 'result',
          id: message.id,
          data: { initialized: true }
        });
        break;
        
      case 'reset':
        // Reset worker state
        spatialGrid = null;
        options = {
          method: 'direct',
          optimizationLevel: 'medium',
          theta: 0.5,
          cellSize: 10,
          cutoffDistance: 50,
          useMultipleThreads: false,
          threadCount: 1
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
