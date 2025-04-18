/**
 * Storage Backend Interface for Bitcoin Protozoa
 * 
 * This file defines the interface for storage backends.
 * All storage backends must implement this interface.
 */

/**
 * Storage backend interface
 */
export interface StorageBackend {
  /**
   * Get an item from storage
   * @param key The key to get
   * @returns Promise that resolves to the value or null if not found
   */
  getItem(key: string): Promise<string | null>;
  
  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to set
   * @returns Promise that resolves when the operation is complete
   */
  setItem(key: string, value: string): Promise<void>;
  
  /**
   * Remove an item from storage
   * @param key The key to remove
   * @returns Promise that resolves when the operation is complete
   */
  removeItem(key: string): Promise<void>;
  
  /**
   * Clear all items from storage
   * @returns Promise that resolves when the operation is complete
   */
  clear(): Promise<void>;
  
  /**
   * Get all keys from storage
   * @returns Promise that resolves to an array of keys
   */
  keys(): Promise<string[]>;
  
  /**
   * Check if storage is available
   * @returns True if storage is available
   */
  isAvailable(): boolean;
}
