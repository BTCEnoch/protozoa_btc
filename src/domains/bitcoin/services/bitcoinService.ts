/**
 * Bitcoin Data Service
 *
 * This service handles fetching Bitcoin block data from the ordinals.com API.
 * It specifically focuses on retrieving ONLY the nonce and confirmations data
 * needed for creature generation and evolution.
 */

import { BlockData, BlockInfo } from '../types';

// Confirmation milestones
const CONFIRMATION_MILESTONES = [10000, 50000, 100000, 250000, 500000, 1000000];

/**
 * Get the highest confirmation milestone reached
 * @param confirmations The number of confirmations
 * @returns The highest milestone reached
 */
export function getConfirmationMilestone(confirmations: number): number {
  for (let i = CONFIRMATION_MILESTONES.length - 1; i >= 0; i--) {
    if (confirmations >= CONFIRMATION_MILESTONES[i]) {
      return CONFIRMATION_MILESTONES[i];
    }
  }
  return 0; // No milestone reached
}

/**
 * Get the mutation chance based on confirmation milestone
 * @param milestone The confirmation milestone
 * @returns The mutation chance (0-1)
 */
export function getMutationChance(milestone: number): number {
  switch (milestone) {
    case 1000000: return 1.0;   // 100%
    case 500000: return 0.5;    // 50%
    case 250000: return 0.25;   // 25%
    case 100000: return 0.1;    // 10%
    case 50000: return 0.05;    // 5%
    case 10000: return 0.01;    // 1%
    default: return 0;          // 0%
  }
}

// Cache interface for storing fetched block data
interface BlockDataCache {
  [blockNumber: number]: {
    data: BlockData;
    timestamp: number;
  };
}

/**
 * Bitcoin Data Service class
 */
export class BitcoinService {
  private static instance: BitcoinService;

  /**
   * Get the singleton instance
   * @param apiBaseUrl Optional API base URL
   * @param cacheExpiryTime Optional cache expiry time
   * @returns The singleton instance
   */
  public static getInstance(apiBaseUrl?: string, cacheExpiryTime?: number): BitcoinService {
    if (!BitcoinService.instance) {
      BitcoinService.instance = new BitcoinService(apiBaseUrl, cacheExpiryTime);
    }
    return BitcoinService.instance;
  }
  private cache: BlockDataCache = {};
  private readonly cacheExpiryTime: number;
  private readonly apiBaseUrl: string;

  /**
   * Constructor
   * @param apiBaseUrl The base URL for the ordinals.com API
   * @param cacheExpiryTime Cache expiry time in milliseconds (default: 1 hour)
   */
  constructor(
    apiBaseUrl: string = 'https://ordinals.com',
    cacheExpiryTime: number = 60 * 60 * 1000
  ) {
    this.apiBaseUrl = apiBaseUrl;
    this.cacheExpiryTime = cacheExpiryTime;
  }

  /**
   * Fetch Bitcoin block data from the ordinals.com API
   * @param blockNumber The block number to fetch
   * @param forceRefresh Whether to force a refresh from the API (bypass cache)
   * @returns Promise resolving to the block data
   */
  async fetchBlockData(blockNumber: number, forceRefresh: boolean = false): Promise<BlockData> {
    // Validate block number
    this.validateBlockNumber(blockNumber);

    // Check cache if not forcing refresh
    if (!forceRefresh && this.isCacheValid(blockNumber)) {
      return this.cache[blockNumber].data;
    }

    try {
      // Construct the API URL
      const apiUrl = `${this.apiBaseUrl}/r/blockinfo/${blockNumber}`;

      // Fetch the data
      const response = await fetch(apiUrl);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to fetch block data: ${response.status} ${response.statusText}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Extract ONLY the nonce and confirmations
      // Deliberately ignore all other fields
      const blockData: BlockData = {
        nonce: parseInt(data.nonce, 10) || 0, // Convert string nonce to number
        confirmations: data.confirmations,
        height: blockNumber
      };

      // Cache the data
      this.cacheBlockData(blockNumber, blockData);

      return blockData;
    } catch (error) {
      console.error(`Error fetching Bitcoin block data for block ${blockNumber}:`, error);

      // If we have cached data, return it even if it's expired
      if (blockNumber in this.cache) {
        console.warn(`Using expired cache data for block ${blockNumber}`);
        return this.cache[blockNumber].data;
      }

      // Otherwise, return mock data
      return this.createMockBlockData(blockNumber);
    }
  }

  /**
   * Check if the cached data for a block is still valid
   * @param blockNumber The block number to check
   * @returns Whether the cache is valid
   */
  private isCacheValid(blockNumber: number): boolean {
    // If the block is not in the cache, it's not valid
    if (!(blockNumber in this.cache)) {
      return false;
    }

    const cachedData = this.cache[blockNumber];
    const currentTime = Date.now();

    // If the block has over 1M confirmations, it's fully evolved and the cache never expires
    if (cachedData.data.confirmations >= 1000000) {
      return true;
    }

    // Dynamic cache expiry based on confirmation count
    // Newer blocks with fewer confirmations expire faster
    let adjustedExpiryTime = this.cacheExpiryTime;

    if (cachedData.data.confirmations < 10) {
      // Very recent blocks - cache for 5 minutes
      adjustedExpiryTime = 5 * 60 * 1000;
    } else if (cachedData.data.confirmations < 100) {
      // Recent blocks - cache for 15 minutes
      adjustedExpiryTime = 15 * 60 * 1000;
    } else if (cachedData.data.confirmations < 1000) {
      // Somewhat recent blocks - cache for 30 minutes
      adjustedExpiryTime = 30 * 60 * 1000;
    } else if (cachedData.data.confirmations < 10000) {
      // Older blocks - cache for 1 hour (default)
      adjustedExpiryTime = this.cacheExpiryTime;
    } else if (cachedData.data.confirmations < 100000) {
      // Much older blocks - cache for 6 hours
      adjustedExpiryTime = 6 * 60 * 60 * 1000;
    } else {
      // Very old blocks - cache for 24 hours
      adjustedExpiryTime = 24 * 60 * 60 * 1000;
    }

    // Check if the cache has expired based on the adjusted expiry time
    return (currentTime - cachedData.timestamp) < adjustedExpiryTime;
  }

  /**
   * Cache block data
   * @param blockNumber The block number
   * @param data The block data to cache
   */
  private cacheBlockData(blockNumber: number, data: BlockData): void {
    this.cache[blockNumber] = {
      data,
      timestamp: Date.now()
    };
  }

  /**
   * Create mock block data for development/testing
   * @param blockNumber The block number to create mock data for
   * @returns Mock block data with ONLY nonce and confirmations
   */
  private createMockBlockData(blockNumber: number): BlockData {
    // Use the block number as a seed for deterministic mock data
    const seed = blockNumber * 1000;

    // Current approximate block height (as of 2023)
    const currentBlockHeight = 800000;

    // Calculate mock confirmations based on block number with more realistic pattern
    let mockConfirmations: number;

    if (blockNumber > currentBlockHeight) {
      // Future blocks (shouldn't happen, but just in case)
      mockConfirmations = 0;
    } else if (blockNumber === currentBlockHeight) {
      // Current block
      mockConfirmations = 1;
    } else if (blockNumber >= currentBlockHeight - 6) {
      // Very recent blocks (0-6 blocks ago)
      mockConfirmations = currentBlockHeight - blockNumber + 1;
    } else if (blockNumber >= currentBlockHeight - 144) {
      // Recent blocks (last 24 hours, assuming 10 min block time)
      mockConfirmations = currentBlockHeight - blockNumber + 1;
    } else if (blockNumber >= currentBlockHeight - 1008) {
      // Last week
      mockConfirmations = currentBlockHeight - blockNumber + 1;
    } else if (blockNumber >= currentBlockHeight - 52560) {
      // Last year (approximate)
      mockConfirmations = currentBlockHeight - blockNumber + 1;
    } else if (blockNumber <= 1) {
      // Genesis block and block 1
      mockConfirmations = currentBlockHeight;
    } else {
      // Older blocks
      mockConfirmations = currentBlockHeight - blockNumber + 1;
    }

    // Ensure confirmations are within realistic bounds
    mockConfirmations = Math.max(0, Math.min(mockConfirmations, currentBlockHeight));

    // Return ONLY nonce and confirmations - nothing else
    return {
      nonce: seed % 4294967295, // Nonce is a 32-bit number
      confirmations: mockConfirmations,
      height: blockNumber
    };
  }

  /**
   * Validate a block number
   * @param blockNumber The block number to validate
   * @throws Error if the block number is invalid
   */
  private validateBlockNumber(blockNumber: number): void {
    if (!Number.isInteger(blockNumber)) {
      throw new Error('Block number must be an integer');
    }

    if (blockNumber < 0) {
      throw new Error('Block number must be non-negative');
    }

    // Current Bitcoin block height is around 800,000 as of 2023
    // This is a loose validation to catch obvious errors
    if (blockNumber > 1000000) {
      throw new Error('Block number is unrealistically high');
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Remove a specific block from the cache
   * @param blockNumber The block number to remove
   */
  removeFromCache(blockNumber: number): void {
    delete this.cache[blockNumber];
  }

  /**
   * Fetch content from an inscription ID
   * @param inscriptionId The inscription ID
   * @returns Promise resolving to the content
   */
  async fetchInscriptionContent(inscriptionId: string): Promise<any> {
    try {
      // Construct the API URL
      const apiUrl = `${this.apiBaseUrl}/content/${inscriptionId}`;

      // Fetch the data
      const response = await fetch(apiUrl);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to fetch inscription content: ${response.status} ${response.statusText}`);
      }

      // Parse the response based on content type
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else if (contentType?.includes('text/')) {
        return await response.text();
      } else {
        // For binary data, return as blob
        return await response.blob();
      }
    } catch (error) {
      console.error(`Error fetching inscription content for ID ${inscriptionId}:`, error);
      throw error;
    }
  }
}

/**
 * Get the BitcoinService instance
 * @param apiBaseUrl Optional API base URL
 * @param cacheExpiryTime Optional cache expiry time
 * @returns The BitcoinService instance
 */
export function getBitcoinService(apiBaseUrl?: string, cacheExpiryTime?: number): BitcoinService {
  return BitcoinService.getInstance(apiBaseUrl, cacheExpiryTime);
}
