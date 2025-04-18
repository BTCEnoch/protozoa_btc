/**
 * Particle Worker for Bitcoin Protozoa
 *
 * This worker prepares particle data for rendering, including
 * LOD calculations, attribute updates, and visual effects.
 */

import { RenderWorkerMessage } from '../../types/workers/messages';
import { Vector3 } from '../../types/common';

// Worker state
let options = {
  maxParticles: 10000,
  lodLevels: [
    { distance: 10, detail: 1.0 },
    { distance: 50, detail: 0.5 },
    { distance: 100, detail: 0.2 },
    { distance: 200, detail: 0.1 }
  ],
  fadeDistance: 200,
  fadeRange: 50
};

/**
 * Prepare particles for rendering
 * @param data Render data
 * @returns Prepared attributes and transferable objects
 */
function prepareParticleRender(data: any): {
  scales: Float32Array;
  colors: Float32Array;
  opacities: Float32Array;
  transferables: Transferable[];
} {
  const { positions, cameraPosition, lodLevels, viewportWidth, viewportHeight } = data;

  // Use provided LOD levels or defaults
  const lods = lodLevels || options.lodLevels;

  // Create attribute arrays
  const scales = new Float32Array(positions.length / 3);
  const colors = new Float32Array(positions.length); // RGB for each particle
  const opacities = new Float32Array(positions.length / 3);

  // Calculate attributes for each particle
  const particleCount = positions.length / 3;

  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // Calculate distance to camera
    const dx = positions[ix] - cameraPosition.x;
    const dy = positions[iy] - cameraPosition.y;
    const dz = positions[iz] - cameraPosition.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(distanceSquared);

    // Calculate LOD based on distance
    const lod = calculateLODByDistance(distance, lods);

    // Set scale based on LOD
    scales[i] = lod.detail;

    // Set color (default to white)
    colors[ix] = 1.0;     // R
    colors[iy] = 1.0;     // G
    colors[iz] = 1.0;     // B

    // Set opacity based on distance
    opacities[i] = calculateOpacity(distance);
  }

  return {
    scales,
    colors,
    opacities,
    transferables: [scales.buffer, colors.buffer, opacities.buffer]
  };
}

/**
 * Calculate LOD based on distance
 * @param distance Distance to camera
 * @param lodLevels LOD levels
 * @returns LOD level
 */
function calculateLODByDistance(distance: number, lodLevels: any[]): { distance: number; detail: number } {
  // Find the appropriate LOD level
  for (let i = 0; i < lodLevels.length; i++) {
    if (distance < lodLevels[i].distance) {
      return lodLevels[i];
    }
  }

  // Return the lowest detail level if beyond all distances
  return lodLevels[lodLevels.length - 1];
}

/**
 * Calculate opacity based on distance
 * @param distance Distance to camera
 * @returns Opacity value
 */
function calculateOpacity(distance: number): number {
  // Fade out particles at a distance
  if (distance > options.fadeDistance) {
    const fadeAmount = (distance - options.fadeDistance) / options.fadeRange;
    return Math.max(0, 1 - fadeAmount);
  }

  return 1.0;
}

/**
 * Calculate LOD for all particles
 * @param data LOD calculation data
 * @returns LOD information
 */
function calculateLOD(data: any): { visibleParticles: number; lodLevels: any[] } {
  const { positions, cameraPosition, cameraFrustum } = data;

  // Count visible particles
  let visibleParticles = 0;
  const particleCount = positions.length / 3;

  // Simple frustum culling
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // Calculate distance to camera
    const dx = positions[ix] - cameraPosition.x;
    const dy = positions[iy] - cameraPosition.y;
    const dz = positions[iz] - cameraPosition.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(distanceSquared);

    // Check if within frustum
    if (distance > cameraFrustum.near && distance < cameraFrustum.far) {
      visibleParticles++;
    }
  }

  return {
    visibleParticles,
    lodLevels: options.lodLevels
  };
}

/**
 * Update particle attributes
 * @param data Attribute data
 * @returns Updated attributes and transferable objects
 */
function updateAttributes(data: any): {
  colors: Float32Array;
  opacities: Float32Array;
  transferables: Transferable[];
} {
  const { positions, scales, colors: inputColors, opacities: inputOpacities, timeStep } = data;

  // Create new attribute arrays or use provided ones
  const colors = inputColors ? new Float32Array(inputColors) : new Float32Array(positions.length);
  const opacities = inputOpacities ? new Float32Array(inputOpacities) : new Float32Array(positions.length / 3);

  // Update attributes for each particle
  const particleCount = positions.length / 3;

  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // Apply time-based effects to colors
    if (inputColors) {
      // Pulse effect
      const pulse = Math.sin(Date.now() * 0.001 + i * 0.1) * 0.2 + 0.8;

      colors[ix] = inputColors[ix] * pulse;
      colors[iy] = inputColors[iy] * pulse;
      colors[iz] = inputColors[iz] * pulse;
    } else {
      // Default colors
      colors[ix] = 1.0;
      colors[iy] = 1.0;
      colors[iz] = 1.0;
    }

    // Apply time-based effects to opacities
    if (inputOpacities) {
      // Flicker effect
      const flicker = Math.random() * 0.1 + 0.9;
      opacities[i] = inputOpacities[i] * flicker;
    } else {
      opacities[i] = 1.0;
    }
  }

  return {
    colors,
    opacities,
    transferables: [colors.buffer, opacities.buffer]
  };
}

// Set up message handling
self.addEventListener('message', (event) => {
  const message = event.data as RenderWorkerMessage;

  try {
    switch (message.type) {
      case 'prepareRender':
        const result = prepareParticleRender(message.data);
        self.postMessage({
          type: 'result',
          id: message.id,
          data: result
        }, result.transferables);
        break;

      case 'calculateLOD':
        const lodResult = calculateLOD(message.data);
        self.postMessage({
          type: 'result',
          id: message.id,
          data: lodResult
        });
        break;

      case 'updateAttributes':
        const attrResult = updateAttributes(message.data);
        self.postMessage({
          type: 'result',
          id: message.id,
          data: attrResult
        }, attrResult.transferables);
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
          maxParticles: 10000,
          lodLevels: [
            { distance: 10, detail: 1.0 },
            { distance: 50, detail: 0.5 },
            { distance: 100, detail: 0.2 },
            { distance: 200, detail: 0.1 }
          ],
          fadeDistance: 200,
          fadeRange: 50
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
