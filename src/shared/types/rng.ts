/**
 * RNG System Types
 * 
 * This file defines the types for the Random Number Generation system.
 */

/**
 * BlockData interface
 * Represents Bitcoin block data used for RNG seeding
 */
export interface BlockData {
  nonce: number;
  confirmations: number;
  hash?: string;
  timestamp?: number;
}

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
  
  // Returns the name of the stream
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
  
  // Get the block data used to seed this RNG system
  getBlockData(): BlockData;
  
  // Get the seed value used for this RNG system
  getSeed(): number;
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
    | string; // Allow for custom stream names
