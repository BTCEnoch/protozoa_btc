/**
 * Formation Worker for Bitcoin Protozoa
 * 
 * This worker calculates positions for particles based on formation patterns.
 * It handles various formation types including circles, grids, spirals, and
 * more complex patterns.
 */

import { WorkerMessage } from '../../types/workers/messages';
import { FormationPattern, FormationPatternType } from '../../types/formations/formation';

// Custom formation configuration for worker
interface FormationConfig {
  scale: number;
  rotationSpeed: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  useNoise: boolean;
  noiseScale: number;
  noiseFrequency: number;
  noiseSeed: number;
  blendTime: number;
  useTransition: boolean;
}

// Default options
const defaultOptions: FormationConfig = {
  scale: 1.0,
  rotationSpeed: 0.01,
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  useNoise: false,
  noiseScale: 0.1,
  noiseFrequency: 0.1,
  noiseSeed: 0,
  blendTime: 0.5,
  useTransition: false
};

// Worker state
let options: FormationConfig = { ...defaultOptions };
let currentPattern: FormationPatternType = FormationPatternType.CIRCLE;
let time = 0;
let previousPositions: Float32Array | null = null;
let targetPositions: Float32Array | null = null;
let transitionStartTime = 0;
let isTransitioning = false;

/**
 * Handle messages from the main thread
 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'formation.calculate':
      const result = calculateFormation(data);
      self.postMessage({ 
        ...result 
      }, {
        transfer: result.transferables 
      });
      break;
    
    case 'formation.setOptions':
      options = { ...defaultOptions, ...data.options };
      break;
    
    case 'formation.setPattern':
      if (options.useTransition && previousPositions && data.count === previousPositions.length / 3) {
        // Start transition
        previousPositions = targetPositions || previousPositions;
        isTransitioning = true;
        transitionStartTime = time;
      }
      
      currentPattern = data.pattern;
      break;
      
    case 'formation.reset':
      resetWorker();
      break;
      
    default:
      console.warn(`Unknown message type: ${type}`);
  }
};

/**
 * Calculate formation positions
 * @param data Calculation data
 * @returns Calculated positions and transferables
 */
function calculateFormation(data: any): { positions: Float32Array; transferables: Transferable[] } {
  const { count, timestamp } = data;
  time = timestamp;
  
  // Create positions array if needed
  if (!targetPositions || targetPositions.length !== count * 3) {
    targetPositions = new Float32Array(count * 3);
  }
  
  // Calculate target positions
  calculateFormationPositions(targetPositions, count, currentPattern);
  
  // Handle transitions
  let positions: Float32Array;
  if (isTransitioning && previousPositions) {
    const transitionTime = options.blendTime || 0.5;
    const elapsedTime = (time - transitionStartTime) / 1000; // Convert to seconds
    const t = Math.min(elapsedTime / transitionTime, 1.0);
    
    // Blend between previous and target positions
    positions = blendPositions(previousPositions, targetPositions, t);
    
    // End transition when completed
    if (t >= 1.0) {
      isTransitioning = false;
      previousPositions = null;
    }
  } else {
    positions = targetPositions;
  }
  
  return {
    positions,
    transferables: [positions.buffer]
  };
}

/**
 * Calculate formation positions based on pattern
 * @param positions Output positions array
 * @param count Number of particles
 * @param pattern Formation pattern
 */
function calculateFormationPositions(
  positions: Float32Array,
  count: number,
  pattern: FormationPatternType
): void {
  switch (pattern) {
    case FormationPatternType.CIRCLE:
      calculateCircleFormation(positions, count);
      break;
    case FormationPatternType.GRID:
      calculateGridFormation(positions, count);
      break;
    case FormationPatternType.SPIRAL:
      calculateSpiralFormation(positions, count);
      break;
    case FormationPatternType.SPHERE:
      calculateSphereFormation(positions, count);
      break;
    case FormationPatternType.HELIX:
      calculateHelixFormation(positions, count);
      break;
    case FormationPatternType.WAVE:
      calculateWaveFormation(positions, count, time);
      break;
    default:
      calculateCircleFormation(positions, count);
  }
  
  // Apply global transformations
  applyFormationTransforms(positions, count);
  
  // Apply noise if enabled
  if (options.useNoise) {
    applyNoise(positions, count);
  }
}

/**
 * Calculate circle formation
 * @param positions Output positions array
 * @param count Number of particles
 */
function calculateCircleFormation(positions: Float32Array, count: number): void {
  const radius = 20 * options.scale;
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = 0;
    
    const ix = i * 3;
    positions[ix] = x;
    positions[ix + 1] = y;
    positions[ix + 2] = z;
  }
}

/**
 * Calculate grid formation
 * @param positions Output positions array
 * @param count Number of particles
 */
function calculateGridFormation(positions: Float32Array, count: number): void {
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 5 * options.scale;
  const offset = (gridSize * spacing) / 2;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    
    const x = (col * spacing) - offset;
    const y = (row * spacing) - offset;
    const z = 0;
    
    const ix = i * 3;
    positions[ix] = x;
    positions[ix + 1] = y;
    positions[ix + 2] = z;
  }
}

/**
 * Calculate spiral formation
 * @param positions Output positions array
 * @param count Number of particles
 */
function calculateSpiralFormation(positions: Float32Array, count: number): void {
  const spins = 5;
  const maxRadius = 30 * options.scale;
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const radius = t * maxRadius;
    const angle = t * Math.PI * 2 * spins;
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = 0;
    
    const ix = i * 3;
    positions[ix] = x;
    positions[ix + 1] = y;
    positions[ix + 2] = z;
  }
}

/**
 * Calculate sphere formation
 * @param positions Output positions array
 * @param count Number of particles
 */
function calculateSphereFormation(positions: Float32Array, count: number): void {
  const radius = 20 * options.scale;
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
  
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y) * radius;
    
    const angle = phi * i; // Golden angle increment
    
    const x = Math.cos(angle) * radiusAtY;
    const z = Math.sin(angle) * radiusAtY;
    
    const ix = i * 3;
    positions[ix] = x;
    positions[ix + 1] = y * radius;
    positions[ix + 2] = z;
  }
}

/**
 * Calculate helix formation
 * @param positions Output positions array
 * @param count Number of particles
 */
function calculateHelixFormation(positions: Float32Array, count: number): void {
  const radius = 15 * options.scale;
  const height = 40 * options.scale;
  const turns = 3;
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = t * Math.PI * 2 * turns;
    
    const x = Math.cos(angle) * radius;
    const y = (t - 0.5) * height;
    const z = Math.sin(angle) * radius;
    
    const ix = i * 3;
    positions[ix] = x;
    positions[ix + 1] = y;
    positions[ix + 2] = z;
  }
}

/**
 * Calculate wave formation
 * @param positions Output positions array
 * @param count Number of particles
 * @param time Current time for animation
 */
function calculateWaveFormation(positions: Float32Array, count: number, time: number): void {
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 5 * options.scale;
  const offset = (gridSize * spacing) / 2;
  const frequency = 0.1;
  const amplitude = 10 * options.scale;
  const speed = 0.001;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    
    const x = (col * spacing) - offset;
    const y = Math.sin((x * frequency) + (time * speed)) * amplitude;
    const z = (row * spacing) - offset;
    
    const ix = i * 3;
    positions[ix] = x;
    positions[ix + 1] = y;
    positions[ix + 2] = z;
  }
}

/**
 * Apply global transforms to formation
 * @param positions Output positions array
 * @param count Number of particles
 */
function applyFormationTransforms(positions: Float32Array, count: number): void {
  // Apply rotation around Y axis if rotation speed is non-zero
  if (options.rotationSpeed && options.rotationSpeed !== 0) {
    const angle = time * options.rotationSpeed;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = positions[ix];
      const z = positions[ix + 2];
      
      positions[ix] = x * cosAngle - z * sinAngle;
      positions[ix + 2] = x * sinAngle + z * cosAngle;
    }
  }
  
  // Apply offsets
  if (options.offsetX || options.offsetY || options.offsetZ) {
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      positions[ix] += options.offsetX || 0;
      positions[ix + 1] += options.offsetY || 0;
      positions[ix + 2] += options.offsetZ || 0;
    }
  }
}

/**
 * Apply simplex noise to positions
 * @param positions Output positions array
 * @param count Number of particles
 */
function applyNoise(positions: Float32Array, count: number): void {
  const noiseScale = options.noiseScale || 0.1;
  
  // This is a simplified noise implementation
  // In a real application, you would use a proper noise library
  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    
    // Generate some pseudo-random displacement based on position and time
    const noiseX = Math.sin(positions[ix] * 0.1 + time * 0.001) * noiseScale;
    const noiseY = Math.cos(positions[ix + 1] * 0.1 + time * 0.001) * noiseScale;
    const noiseZ = Math.sin(positions[ix + 2] * 0.1 + time * 0.001) * noiseScale;
    
    positions[ix] += noiseX;
    positions[ix + 1] += noiseY;
    positions[ix + 2] += noiseZ;
  }
}

/**
 * Blend between two position arrays
 * @param source Source positions
 * @param target Target positions
 * @param t Blend factor (0-1)
 * @returns Blended positions
 */
function blendPositions(
  source: Float32Array,
  target: Float32Array,
  t: number
): Float32Array {
  const result = new Float32Array(target.length);
  
  for (let i = 0; i < target.length; i++) {
    result[i] = source[i] + (target[i] - source[i]) * t;
  }
  
  return result;
}

/**
 * Reset worker state
 */
function resetWorker(): void {
  options = { ...defaultOptions };
  currentPattern = FormationPatternType.CIRCLE;
  time = 0;
  previousPositions = null;
  targetPositions = null;
  isTransitioning = false;
}

// Let main thread know worker is ready
self.postMessage({ type: 'formation.ready' }); 
