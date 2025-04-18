/**
 * LocalStorage Backend for Bitcoin Protozoa
 * 
 * This file provides an implementation of the StorageBackend interface using localStorage.
 * It handles storing and retrieving data from localStorage with proper error handling.
 */

import { StorageBackend } from './storageBackendInterface';

/**
 * LocalStorage backend implementation
 */
export class LocalStorageBackend implements StorageBackend {
  private prefix: string;

  /**
   * Constructor
   * @param prefix The prefix for keys
   */
  constructor(prefix: string = 'bitcoin_protozoa_') {
    this.prefix = prefix;
  }

  /**
   * Get an item from storage
   * @param key The key to get
   * @returns Promise that resolves to the value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error(`Error in getItem(${key}):`, error);
      return null;
    }
  }

  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to set
   * @returns Promise that resolves when the operation is complete
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(`${this.prefix}${key}`, value);
    } catch (error) {
      console.error(`Error in setItem(${key}):`, error);
      throw error;
    }
  }

  /**
   * Remove an item from storage
   * @param key The key to remove
   * @returns Promise that resolves when the operation is complete
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error(`Error in removeItem(${key}):`, error);
      throw error;
    }
  }

  /**
   * Clear all items from storage
   * @returns Promise that resolves when the operation is complete
   */
  async clear(): Promise<void> {
    try {
      // Remove all items with our prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error in clear():', error);
      throw error;
    }
  }

  /**
   * Get all keys from storage
   * @returns Promise that resolves to an array of keys
   */
  async keys(): Promise<string[]> {
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
      console.error('Error in keys():', error);
      return [];
    }
  }

  /**
   * Check if localStorage is available
   * @returns True if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = `${this.prefix}_test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }
}
