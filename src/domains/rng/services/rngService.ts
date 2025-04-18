/**
 * RNG Service for Bitcoin Protozoa
 *
 * This service provides deterministic random number generation
 * based on Bitcoin block data.
 */

import { BlockData } from '../../../domains/bitcoin/types/bitcoin';
import { RNGStream, RNGSystem, RNGStreamName, RNGProvider } from '../types/rng';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: RNGService | null = null;

/**
 * Creates a hash from block data for seeding
 * @param blockData Bitcoin block data
 * @returns 32-bit integer for seeding
 */
function createSeedFromBlock(blockData: BlockData): number {
  const { nonce, hash, timestamp } = blockData;

  // Convert nonce to number if it's a string
  const nonceValue = typeof nonce === 'string' ? parseInt(nonce, 16) : nonce;

  // Get first 8 chars of hash as number
  const hashPrefix = parseInt(hash.substring(0, 8), 16);

  // Combine values with XOR
  return nonceValue ^ hashPrefix ^ timestamp;
}

/**
 * Mulberry32 is a simple but high-quality 32-bit RNG
 * @param seed The seed value (derived from Bitcoin block data)
 * @returns A function that generates random numbers between 0 and 1
 */
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * RNG Stream implementation for consistent random sequences
 */
class RNGStreamImpl implements RNGStream {
  private rng: () => number;
  private streamName: RNGStreamName;

  constructor(seed: number, streamName: RNGStreamName) {
    // Create unique seed for each stream based on name
    const streamSeed = seed ^ Array.from(streamName).reduce((acc, char) =>
      acc + char.charCodeAt(0), 0);
    this.rng = mulberry32(streamSeed);
    this.streamName = streamName;
  }

  next(): number {
    return this.rng();
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  nextItem<T>(array: T[]): T {
    if (!array || array.length === 0) {
      throw new Error('Cannot get a random item from an empty array');
    }
    return array[this.nextInt(0, array.length - 1)];
  }

  nextItems<T>(array: T[], count: number): T[] {
    if (!array || array.length === 0) {
      throw new Error('Cannot get random items from an empty array');
    }
    if (count < 0) {
      throw new Error('Count must be a non-negative number');
    }
    return this.shuffle([...array]).slice(0, count);
  }

  shuffle<T>(array: T[]): T[] {
    if (!array) {
      throw new Error('Cannot shuffle undefined or null array');
    }

    // If array is empty, return empty array
    if (array.length === 0) {
      return [];
    }

    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  getStreamName(): RNGStreamName {
    return this.streamName;
  }
}

/**
 * RNG Service class
 * Provides random number generation functionality
 */
export class RNGService implements RNGProvider {
  private rngSystem: RNGSystem | null = null;
  private generalStream: RNGStream | null = null;
  private initialized: boolean = false;
  private logger = Logging.createLogger('RNGService');

  /**
   * Initialize the RNG service with block data
   * @param blockData The Bitcoin block data
   */
  public async initialize(blockData: BlockData): Promise<void> {
    if (this.initialized) {
      this.logger.warn('RNG service already initialized');
      return;
    }

    // Create RNG system from block data
    this.rngSystem = new RNGSystemImpl(blockData);
    
    // Get the general stream for convenience methods
    this.generalStream = this.rngSystem.getStream('general');

    this.initialized = true;
    this.logger.info('RNG service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the RNG system
   * @returns The RNG system
   */
  public getRNGSystem(): RNGSystem {
    if (!this.initialized || !this.rngSystem) {
      throw new Error('RNG service not initialized');
    }
    return this.rngSystem;
  }

  /**
   * Get a random number between 0 and 1
   * @returns A random number between 0 and 1
   */
  public getRandomFloat(): number;

  /**
   * Get a random number between min and max
   * @param min Minimum value
   * @param max Maximum value
   * @returns A random number between min and max
   */
  public getRandomFloat(min?: number, max?: number): number {
    if (!this.initialized || !this.generalStream) {
      throw new Error('RNG service not initialized');
    }

    if (min === undefined || max === undefined) {
      return this.generalStream.next();
    }

    return min + this.generalStream.next() * (max - min);
  }

  /**
   * Get a random integer between min and max (inclusive)
   * @param min Minimum value
   * @param max Maximum value
   * @returns A random integer between min and max
   */
  public getRandomInt(min: number, max: number): number {
    if (!this.initialized || !this.generalStream) {
      throw new Error('RNG service not initialized');
    }
    return this.generalStream.nextInt(min, max);
  }

  /**
   * Get a random boolean with the given probability
   * @param probability Probability of returning true (default: 0.5)
   * @returns A random boolean
   */
  public getRandomBool(probability: number = 0.5): boolean {
    if (!this.initialized || !this.generalStream) {
      throw new Error('RNG service not initialized');
    }
    return this.generalStream.nextBool(probability);
  }

  /**
   * Get a random item from the array
   * @param array The array to select from
   * @returns A random item from the array
   */
  public getRandomElement<T>(array: T[]): T {
    if (!this.initialized || !this.generalStream) {
      throw new Error('RNG service not initialized');
    }
    return this.generalStream.nextItem(array);
  }

  /**
   * Get n random items from the array
   * @param array The array to select from
   * @param count The number of items to select
   * @returns An array of random items
   */
  public getRandomElements<T>(array: T[], count: number): T[] {
    if (!this.initialized || !this.generalStream) {
      throw new Error('RNG service not initialized');
    }
    return this.generalStream.nextItems(array, count);
  }

  /**
   * Get a shuffled copy of the array
   * @param array The array to shuffle
   * @returns A shuffled copy of the array
   */
  public shuffleArray<T>(array: T[]): T[] {
    if (!this.initialized || !this.generalStream) {
      throw new Error('RNG service not initialized');
    }
    return this.generalStream.shuffle(array);
  }

  /**
   * Set the seed for the RNG
   * @param seed The seed value
   */
  public setSeed(seed: number): void {
    if (!this.initialized || !this.rngSystem) {
      throw new Error('RNG service not initialized');
    }
    this.rngSystem.setSeed(seed);
  }

  /**
   * Get the current seed
   * @returns The current seed
   */
  public getSeed(): number {
    if (!this.initialized || !this.rngSystem) {
      throw new Error('RNG service not initialized');
    }
    return this.rngSystem.getSeed();
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.rngSystem = null;
    this.generalStream = null;
    this.initialized = false;
    this.logger.info('RNG service reset');
  }
}

/**
 * RNG System implementation for managing multiple streams
 */
class RNGSystemImpl implements RNGSystem {
  private streams: Map<RNGStreamName, RNGStream>;
  private blockData: BlockData;
  private seed: number;

  constructor(blockData: BlockData) {
    this.blockData = blockData;
    this.seed = createSeedFromBlock(blockData);
    this.streams = new Map();

    // Initialize default streams
    const defaultStreams: RNGStreamName[] = [
      'traits',
      'physics',
      'formation',
      'visual',
      'subclass',
      'ability',
      'mutation',
      'particle',
      'behavior',
      'general'
    ];

    defaultStreams.forEach(name => this.createStream(name));
  }

  getStream(name: RNGStreamName): RNGStream {
    const stream = this.streams.get(name);
    if (!stream) {
      throw new Error(`RNG stream '${name}' not found. Available streams: ${Array.from(this.streams.keys()).join(', ')}`);
    }
    return stream;
  }

  createStream(name: RNGStreamName): RNGStream {
    const stream = new RNGStreamImpl(this.seed, name);
    this.streams.set(name, stream);
    return stream;
  }

  getBlockData(): BlockData {
    return this.blockData;
  }

  getSeed(): number {
    return this.seed;
  }

  setSeed(seed: number): void {
    this.seed = seed;
    
    // Recreate all streams with the new seed
    const streamNames = Array.from(this.streams.keys());
    this.streams.clear();
    streamNames.forEach(name => this.createStream(name));
  }
}

/**
 * Get the RNG service instance
 * @returns The RNG service instance
 */
export function getRNGService(): RNGService {
  if (!instance) {
    instance = new RNGService();
  }
  return instance;
}
