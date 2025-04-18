/**
 * Random Utilities
 *
 * Provides utilities for random number generation.
 */

import { createSeededRandom as createSeededRandomFromRNG } from '../../lib/rngSystem';

/**
 * Create a seeded random number generator
 * @param seed The random seed
 * @returns A function that returns a random number between 0 and 1
 */
export function createSeededRandom(seed: number): () => number {
  return createSeededRandomFromRNG(seed);
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param min The minimum value
 * @param max The maximum value
 * @param random The random number generator function
 * @returns A random integer between min and max
 */
export function randomInt(min: number, max: number, random = Math.random): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 * @param min The minimum value
 * @param max The maximum value
 * @param random The random number generator function
 * @returns A random float between min and max
 */
export function randomFloat(min: number, max: number, random = Math.random): number {
  return random() * (max - min) + min;
}

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @param random The random number generator function
 * @returns The shuffled array
 */
export function shuffleArray<T>(array: T[], random = Math.random): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Pick a random item from an array
 * @param array The array to pick from
 * @param random The random number generator function
 * @returns A random item from the array
 */
export function randomItem<T>(array: T[], random = Math.random): T {
  return array[Math.floor(random() * array.length)];
}

/**
 * Pick a random item from an array with weights
 * @param array The array to pick from
 * @param weights The weights for each item
 * @param random The random number generator function
 * @returns A random item from the array
 */
export function weightedRandomItem<T>(array: T[], weights: number[], random = Math.random): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let value = random() * totalWeight;

  for (let i = 0; i < array.length; i++) {
    value -= weights[i];
    if (value <= 0) {
      return array[i];
    }
  }

  return array[array.length - 1];
}

/**
 * Generate a random boolean with a given probability
 * @param probability The probability of returning true (0-1)
 * @param random The random number generator function
 * @returns A random boolean
 */
export function randomBool(probability = 0.5, random = Math.random): boolean {
  return random() < probability;
}

/**
 * Pick multiple random items from an array without replacement
 * @param array The array to pick from
 * @param count The number of items to pick
 * @param random The random number generator function
 * @returns An array of random items
 */
export function randomItems<T>(array: T[], count: number, random = Math.random): T[] {
  if (count >= array.length) {
    return shuffleArray(array, random);
  }
  
  const result: T[] = [];
  const indices = new Set<number>();
  
  while (result.length < count) {
    const index = Math.floor(random() * array.length);
    if (!indices.has(index)) {
      indices.add(index);
      result.push(array[index]);
    }
  }
  
  return result;
}

/**
 * Generate a random color in hex format
 * @param random The random number generator function
 * @returns A random color in hex format
 */
export function randomColor(random = Math.random): string {
  const r = Math.floor(random() * 256);
  const g = Math.floor(random() * 256);
  const b = Math.floor(random() * 256);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a random UUID v4
 * @param random The random number generator function
 * @returns A random UUID v4
 */
export function randomUUID(random = Math.random): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
