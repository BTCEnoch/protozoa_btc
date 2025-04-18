/**
 * Random Utilities
 *
 * Provides utilities for random number generation.
 *
 * Note: This file is deprecated. Use lib/rngSystem.ts instead.
 */

import { createSeededRandom as createSeededRandomFromRNG } from '../../lib/rngSystem';

/**
 * Create a seeded random number generator
 * @param seed The random seed
 * @returns A function that returns a random number between 0 and 1
 * @deprecated Use createSeededRandom from lib/rngSystem.ts instead
 */
export function createSeededRandom(seed: number): () => number {
  console.warn('createSeededRandom from utils/random.ts is deprecated. Use createSeededRandom from lib/rngSystem.ts instead.');
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
