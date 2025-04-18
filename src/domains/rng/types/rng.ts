/**
 * RNG Types for Bitcoin Protozoa
 * 
 * This file defines the types for the Random Number Generation system.
 */

import { BlockData } from '../../bitcoin/types/bitcoin';

/**
 * RNG Stream interface
 * Represents a stream of random numbers for a specific purpose
 */
export interface RNGStream {
  // Returns a random number between 0 and 1
  next(): number;
  
  // Returns a random integer between min and max (inclusive)
  nextInt(min: number, max: number): number;
  
  // Returns true with probability equal to the given value
  nextBool(probability?: number): boolean;
  
  // Returns a random item from the array
  nextItem<T>(array: T[]): T;
  
  // Returns n random items from the array
  nextItems<T>(array: T[], count: number): T[];
  
  // Returns a shuffled copy of the array
  shuffle<T>(array: T[]): T[];

  // Get the stream name
  getStreamName(): RNGStreamName;
}

/**
 * RNG System interface
 * Manages multiple RNG streams
 */
export interface RNGSystem {
  // Get an existing RNG stream by name
  getStream(name: RNGStreamName): RNGStream;
  
  // Create a new RNG stream with a specific seed
  createStream(name: RNGStreamName): RNGStream;

  // Get the block data used to seed the system
  getBlockData(): BlockData;

  // Get the seed value
  getSeed(): number;

  // Set a new seed value
  setSeed(seed: number): void;
}

/**
 * Standard RNG stream names
 */
export type RNGStreamName = 
  | 'traits'
  | 'physics'
  | 'formation'
  | 'visual'
  | 'subclass'
  | 'ability'
  | 'mutation'
  | 'particle'
  | 'behavior'
  | 'general';

/**
 * RNG Provider interface
 * Provides random numbers from various sources
 */
export interface RNGProvider {
  // Get a random number between 0 and 1
  getRandomFloat(): number;
  
  // Get a random number between min and max
  getRandomFloat(min: number, max: number): number;
  
  // Get a random integer between min and max (inclusive)
  getRandomInt(min: number, max: number): number;
  
  // Get a random boolean with the given probability
  getRandomBool(probability?: number): boolean;
  
  // Get a random item from the array
  getRandomElement<T>(array: T[]): T;
  
  // Get n random items from the array
  getRandomElements<T>(array: T[], count: number): T[];
  
  // Get a shuffled copy of the array
  shuffleArray<T>(array: T[]): T[];

  // Set the seed for the RNG
  setSeed(seed: number): void;

  // Get the current seed
  getSeed(): number;
}
