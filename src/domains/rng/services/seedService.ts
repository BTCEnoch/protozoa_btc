/**
 * Seed Service for Bitcoin Protozoa
 *
 * This service manages seed generation and manipulation.
 */

import { BlockData } from '../../../domains/bitcoin/types/bitcoin';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: SeedService | null = null;

/**
 * Seed Service class
 * Manages seed generation and manipulation
 */
export class SeedService {
  private initialized: boolean = false;
  private logger = Logging.createLogger('SeedService');

  /**
   * Initialize the seed service
   */
  public initialize(): void {
    if (this.initialized) {
      this.logger.warn('Seed service already initialized');
      return;
    }

    this.initialized = true;
    this.logger.info('Seed service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a seed from block data
   * @param blockData The Bitcoin block data
   * @returns A seed value
   */
  public createSeedFromBlock(blockData: BlockData): number {
    if (!this.initialized) {
      throw new Error('Seed service not initialized');
    }

    const { nonce, hash, timestamp } = blockData;

    // Convert nonce to number if it's a string
    const nonceValue = typeof nonce === 'string' ? parseInt(nonce, 16) : nonce;

    // Get first 8 chars of hash as number
    const hashPrefix = parseInt(hash.substring(0, 8), 16);

    // Combine values with XOR
    return nonceValue ^ hashPrefix ^ timestamp;
  }

  /**
   * Create a seed from a string
   * @param str The string to hash
   * @returns A seed value
   */
  public createSeedFromString(str: string): number {
    if (!this.initialized) {
      throw new Error('Seed service not initialized');
    }

    return this.hashString(str);
  }

  /**
   * Hash a string to create a numeric seed
   * @param str The string to hash
   * @returns A numeric hash value suitable for seeding
   */
  public hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Create a seed from a number
   * @param num The number to use as seed
   * @returns A seed value
   */
  public createSeedFromNumber(num: number): number {
    if (!this.initialized) {
      throw new Error('Seed service not initialized');
    }

    // Simple transformation to make the seed more random-like
    return Math.abs((num * 9301 + 49297) % 233280);
  }

  /**
   * Create a seed from the current time
   * @returns A seed value
   */
  public createSeedFromTime(): number {
    if (!this.initialized) {
      throw new Error('Seed service not initialized');
    }

    return this.createSeedFromNumber(Date.now());
  }

  /**
   * Create a seed from multiple values
   * @param values The values to combine
   * @returns A seed value
   */
  public createSeedFromValues(...values: (string | number)[]): number {
    if (!this.initialized) {
      throw new Error('Seed service not initialized');
    }

    // Convert all values to numbers
    const numericValues = values.map(value => {
      if (typeof value === 'string') {
        return this.hashString(value);
      }
      return value;
    });

    // Combine values with XOR
    return numericValues.reduce((acc, value) => acc ^ value, 0);
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.initialized = false;
    this.logger.info('Seed service reset');
  }
}

/**
 * Get the seed service instance
 * @returns The seed service instance
 */
export function getSeedService(): SeedService {
  if (!instance) {
    instance = new SeedService();
  }
  return instance;
}
