/**
 * Storage Types for Bitcoin Protozoa
 * 
 * This file defines the types for the storage system.
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

/**
 * Storage service options
 */
export interface StorageServiceOptions {
  useCompression?: boolean;
  maxItems?: number;
  storageBackend?: 'localStorage' | 'indexedDB';
  workerEnabled?: boolean;
  prefix?: string;
}

/**
 * Storage events
 */
export enum StorageEvent {
  ITEM_SAVED = 'storage:item_saved',
  ITEM_LOADED = 'storage:item_loaded',
  ITEM_DELETED = 'storage:item_deleted',
  DATA_SAVED = 'storage:data_saved',
  DATA_LOADED = 'storage:data_loaded',
  DATA_DELETED = 'storage:data_deleted',
  STORAGE_CLEARED = 'storage:cleared',
  STORAGE_ERROR = 'storage:error'
}

/**
 * Storage keys
 */
export enum StorageKeys {
  CREATURES_INDEX = 'creatures_index',
  LAST_BLOCK = 'last_block',
  SETTINGS = 'settings',
  EVOLUTION_HISTORY = 'evolution_history',
  USER_PREFERENCES = 'user_preferences',
  PARTICLE_CACHE = 'particle_cache',
  VISUAL_CACHE = 'visual_cache'
}

/**
 * Worker task interface
 */
export interface WorkerTask {
  id: string;
  type: string;
  data: any;
}

/**
 * Worker result interface
 */
export interface WorkerResult {
  id: string;
  type: string;
  data: any;
  error?: string;
}

/**
 * Storage provider interface
 */
export interface StorageProvider {
  /**
   * Save data to storage
   * @param key The storage key
   * @param data The data to save
   * @returns Promise that resolves to true if successful
   */
  saveData<T>(key: string, data: T): Promise<boolean>;
  
  /**
   * Load data from storage
   * @param key The storage key
   * @returns Promise that resolves to the loaded data or null if not found
   */
  loadData<T>(key: string): Promise<T | null>;
  
  /**
   * Delete data from storage
   * @param key The storage key
   * @returns Promise that resolves to true if successful
   */
  deleteData(key: string): Promise<boolean>;
  
  /**
   * Clear all data from storage
   * @returns Promise that resolves to true if successful
   */
  clearData(): Promise<boolean>;
  
  /**
   * Get all keys from storage
   * @returns Promise that resolves to an array of keys
   */
  getKeys(): Promise<string[]>;
}
