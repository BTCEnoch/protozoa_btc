/**
 * Bitcoin API Client for Bitcoin Protozoa
 *
 * This service is responsible for fetching Bitcoin block data from the API.
 * It handles API requests, error handling, and data parsing.
 */

import { BlockInfo, BlockData } from '../../types/bitcoin/bitcoin';

/**
 * Bitcoin API client class
 */
export class BitcoinApiClient {
  private static instance: BitcoinApiClient;
  private baseUrl: string = 'https://ordinals.com';
  private initialized: boolean = false;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiryTime: number = 60 * 60 * 1000; // 1 hour

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Initialize with empty state
  }

  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): BitcoinApiClient {
    if (!BitcoinApiClient.instance) {
      BitcoinApiClient.instance = new BitcoinApiClient();
    }
    return BitcoinApiClient.instance;
  }

  /**
   * Initialize the Bitcoin API client
   * @param baseUrl Optional base URL for the API
   * @param cacheExpiryTime Optional cache expiry time in milliseconds
   */
  public initialize(baseUrl?: string, cacheExpiryTime?: number): void {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
    if (cacheExpiryTime) {
      this.cacheExpiryTime = cacheExpiryTime;
    }
    this.initialized = true;
    console.log('Bitcoin API client initialized with base URL:', this.baseUrl);
    console.log('Cache expiry time set to:', this.cacheExpiryTime, 'ms');
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Fetch block info from the API
   * @param blockNumber The block number to fetch
   * @param forceRefresh Whether to force a refresh from the API (bypass cache)
   * @returns A promise resolving to the block info
   */
  public async fetchBlockInfo(blockNumber: number, forceRefresh: boolean = false): Promise<BlockInfo> {
    if (!this.initialized) {
      throw new Error('Bitcoin API client not initialized');
    }

    const cacheKey = `blockInfo_${blockNumber}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if available and not expired, unless force refresh is requested
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheExpiryTime) {
      console.log(`Using cached block info for block ${blockNumber}`);
      return cached.data as BlockInfo;
    }

    try {
      // Implement retry logic with exponential backoff
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: Error | null = null;

      while (retryCount < maxRetries) {
        try {
          const response = await fetch(`${this.baseUrl}/r/blockinfo/${blockNumber}`);

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const data = await response.json();
          const blockInfo = this.parseBlockResponse(data);

          // Cache the successful response
          this.cache.set(cacheKey, { data: blockInfo, timestamp: Date.now() });
          return blockInfo;
        } catch (error) {
          lastError = error as Error;
          retryCount++;

          if (retryCount < maxRetries) {
            // Exponential backoff: wait 2^retryCount * 100ms before retrying
            const backoffTime = Math.pow(2, retryCount) * 100;
            console.warn(`Retry ${retryCount}/${maxRetries} for block ${blockNumber} after ${backoffTime}ms`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      }

      // If we've exhausted all retries, throw the last error
      console.error(`Error fetching block info for block ${blockNumber} after ${maxRetries} retries:`, lastError);

      // If we have cached data, return it even if it's expired
      if (cached) {
        console.warn(`Using expired cache data for block ${blockNumber}`);
        return cached.data as BlockInfo;
      }

      throw this.handleApiError(lastError!);
    } catch (error) {
      console.error(`Error fetching block info for block ${blockNumber}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Fetch block confirmations from the API
   * @param blockNumber The block number to fetch
   * @returns A promise resolving to the confirmation count
   */
  public async fetchBlockConfirmations(blockNumber: number): Promise<number> {
    if (!this.initialized) {
      throw new Error('Bitcoin API client not initialized');
    }

    try {
      const blockInfo = await this.fetchBlockInfo(blockNumber);
      return blockInfo.confirmations;
    } catch (error) {
      console.error(`Error fetching block confirmations for block ${blockNumber}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Fetch inscription content from the API
   * @param inscriptionId The inscription ID to fetch
   * @param forceRefresh Whether to force a refresh from the API (bypass cache)
   * @returns A promise resolving to the inscription content
   */
  public async fetchInscriptionContent(inscriptionId: string, forceRefresh: boolean = false): Promise<any> {
    if (!this.initialized) {
      throw new Error('Bitcoin API client not initialized');
    }

    const cacheKey = `inscription_${inscriptionId}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if available and not expired, unless force refresh is requested
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheExpiryTime) {
      console.log(`Using cached inscription content for ${inscriptionId}`);
      return cached.data;
    }

    try {
      // Implement retry logic with exponential backoff
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: Error | null = null;

      while (retryCount < maxRetries) {
        try {
          const response = await fetch(`${this.baseUrl}/content/${inscriptionId}`);

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          // Parse the response based on content type
          const contentType = response.headers.get('content-type');
          let content;

          if (contentType?.includes('application/json')) {
            content = await response.json();
          } else if (contentType?.includes('text/')) {
            content = await response.text();
          } else {
            // For binary data, return as blob
            content = await response.blob();
          }

          // Cache the successful response
          this.cache.set(cacheKey, { data: content, timestamp: Date.now() });
          return content;
        } catch (error) {
          lastError = error as Error;
          retryCount++;

          if (retryCount < maxRetries) {
            // Exponential backoff: wait 2^retryCount * 100ms before retrying
            const backoffTime = Math.pow(2, retryCount) * 100;
            console.warn(`Retry ${retryCount}/${maxRetries} for inscription ${inscriptionId} after ${backoffTime}ms`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      }

      // If we've exhausted all retries, throw the last error
      console.error(`Error fetching inscription content for ${inscriptionId} after ${maxRetries} retries:`, lastError);

      // If we have cached data, return it even if it's expired
      if (cached) {
        console.warn(`Using expired cache data for inscription ${inscriptionId}`);
        return cached.data;
      }

      throw this.handleApiError(lastError!);
    } catch (error) {
      console.error(`Error fetching inscription content for inscription ${inscriptionId}:`, error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Handle API errors
   * @param error The error to handle
   * @returns A new error with a more descriptive message
   */
  private handleApiError(error: any): Error {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new Error(`Network error: ${error.message}`);
    }

    // Check if it's an API error
    if (error instanceof Error && error.message.includes('API request failed')) {
      return new Error(`API error: ${error.message}`);
    }

    // Default error
    return new Error(`Bitcoin API error: ${error.message || 'Unknown error'}`);
  }

  /**
   * Parse block response from the API
   * @param data The raw API response data
   * @returns The parsed block info
   */
  private parseBlockResponse(data: any): BlockInfo {
    // Validate required fields
    if (!data.height || !data.hash || !data.nonce) {
      throw new Error('Invalid block data: missing required fields');
    }

    // Parse and return block info
    return {
      height: data.height,
      hash: data.hash,
      nonce: data.nonce,
      confirmations: data.confirmations || 0,
      timestamp: data.time || Date.now(),
      difficulty: data.difficulty || 0,
      merkleRoot: data.merkleroot || '',
      version: data.version || 0,
      bits: data.bits || '',
      size: data.size || 0,
      weight: data.weight || 0,
      transactions: data.tx?.length || 0
    };
  }

  /**
   * Reset the Bitcoin API client
   */
  public reset(): void {
    this.baseUrl = 'https://ordinals.com';
    this.initialized = false;
    this.cache.clear();
    this.cacheExpiryTime = 60 * 60 * 1000; // Reset to default 1 hour
    console.log('Bitcoin API client reset');
  }
}

/**
 * Get the Bitcoin API client instance
 * @returns The Bitcoin API client instance
 */
export function getBitcoinApiClient(): BitcoinApiClient {
  return BitcoinApiClient.getInstance();
}

