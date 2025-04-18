/**
 * LocalStorage Service for Bitcoin Protozoa
 *
 * This service provides an implementation of the StorageBackend interface using localStorage.
 */

import { StorageBackend } from '../types/storage';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: LocalStorageService | null = null;

/**
 * LocalStorage Service class
 * Provides localStorage implementation of StorageBackend
 */
export class LocalStorageService implements StorageBackend {
  private prefix: string;
  private initialized: boolean = false;
  private logger = Logging.createLogger('LocalStorageService');

  /**
   * Constructor
   * @param prefix The prefix for keys
   */
  constructor(prefix: string = 'bitcoin_protozoa_') {
    this.prefix = prefix;
  }

  /**
   * Initialize the service
   */
  public initialize(): void {
    if (this.initialized) {
      this.logger.warn('LocalStorage service already initialized');
      return;
    }

    this.initialized = true;
    this.logger.info('LocalStorage service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get an item from storage
   * @param key The key to get
   * @returns Promise that resolves to the value or null if not found
   */
  public async getItem(key: string): Promise<string | null> {
    if (!this.initialized) {
      this.logger.warn('LocalStorage service not initialized');
    }

    try {
      return localStorage.getItem(`${this.prefix}${key}`);
    } catch (error) {
      this.logger.error(`Error in getItem(${key}):`, error);
      return null;
    }
  }

  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to set
   * @returns Promise that resolves when the operation is complete
   */
  public async setItem(key: string, value: string): Promise<void> {
    if (!this.initialized) {
      this.logger.warn('LocalStorage service not initialized');
    }

    try {
      localStorage.setItem(`${this.prefix}${key}`, value);
    } catch (error) {
      this.logger.error(`Error in setItem(${key}):`, error);
      throw error;
    }
  }

  /**
   * Remove an item from storage
   * @param key The key to remove
   * @returns Promise that resolves when the operation is complete
   */
  public async removeItem(key: string): Promise<void> {
    if (!this.initialized) {
      this.logger.warn('LocalStorage service not initialized');
    }

    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      this.logger.error(`Error in removeItem(${key}):`, error);
      throw error;
    }
  }

  /**
   * Clear all items from storage
   * @returns Promise that resolves when the operation is complete
   */
  public async clear(): Promise<void> {
    if (!this.initialized) {
      this.logger.warn('LocalStorage service not initialized');
    }

    try {
      // Remove all items with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      this.logger.error('Error in clear():', error);
      throw error;
    }
  }

  /**
   * Get all keys from storage
   * @returns Promise that resolves to an array of keys
   */
  public async keys(): Promise<string[]> {
    if (!this.initialized) {
      this.logger.warn('LocalStorage service not initialized');
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      this.logger.error('Error in keys():', error);
      return [];
    }
  }

  /**
   * Check if localStorage is available
   * @returns True if localStorage is available
   */
  public isAvailable(): boolean {
    try {
      const testKey = `${this.prefix}_test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      this.logger.warn('localStorage is not available:', e);
      return false;
    }
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.initialized = false;
    this.logger.info('LocalStorage service reset');
  }
}

/**
 * Get the localStorage service instance
 * @returns The localStorage service instance
 */
export function getLocalStorageService(prefix?: string): LocalStorageService {
  if (!instance) {
    instance = new LocalStorageService(prefix);
  }
  return instance;
}
