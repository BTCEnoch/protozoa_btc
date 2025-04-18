/**
 * Storage Service for Bitcoin Protozoa
 *
 * This service provides persistent storage for game data.
 */

import { 
  StorageBackend, 
  StorageServiceOptions, 
  StorageEvent, 
  StorageKeys,
  StorageProvider
} from '../types/storage';
import { getLocalStorageService } from './localStorageService';
import { Logging } from '../../../shared/utils';

// Default configuration
const DEFAULT_CONFIG: StorageServiceOptions = {
  useCompression: true,
  maxItems: 100,
  storageBackend: 'localStorage',
  workerEnabled: false,
  prefix: 'bitcoin_protozoa_'
};

// Singleton instance
let instance: StorageService | null = null;

/**
 * Storage Service class
 * Provides persistent storage for game data
 */
export class StorageService implements StorageProvider {
  private initialized: boolean = false;
  private options: StorageServiceOptions;
  private isAvailable: boolean = false;
  private itemsIndex: string[] = [];
  private backend: StorageBackend;
  private logger = Logging.createLogger('StorageService');

  /**
   * Constructor
   * @param options Storage service options
   */
  constructor(options: StorageServiceOptions = {}) {
    this.options = {
      ...DEFAULT_CONFIG,
      ...options
    };

    // Create storage backend
    if (this.options.storageBackend === 'indexedDB') {
      // TODO: Implement IndexedDB backend
      this.backend = getLocalStorageService(this.options.prefix);
    } else {
      this.backend = getLocalStorageService(this.options.prefix);
    }

    // Check if storage is available
    this.isAvailable = this.backend.isAvailable();
  }

  /**
   * Initialize the storage service
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Storage service already initialized');
      return;
    }

    if (this.isAvailable) {
      try {
        // Initialize backend
        if ('initialize' in this.backend) {
          await (this.backend as any).initialize();
        }

        // Load items index
        const indexJson = await this.backend.getItem(StorageKeys.CREATURES_INDEX);
        if (indexJson) {
          try {
            this.itemsIndex = JSON.parse(indexJson);
          } catch (error) {
            this.logger.error('Failed to parse items index:', error);
            this.itemsIndex = [];
          }
        }
      } catch (error) {
        this.logger.error('Failed to initialize storage service:', error);
        this.itemsIndex = [];
      }
    }

    this.initialized = true;
    this.logger.info('Storage service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Save data to storage
   * @param key The storage key
   * @param data The data to save
   * @returns Promise that resolves to true if successful
   */
  public async saveData<T>(key: string, data: T): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      this.logger.warn('Storage is not available, data not saved');
      return false;
    }

    try {
      // Convert data to JSON string
      const dataJson = JSON.stringify(data);

      // Save data
      await this.backend.setItem(key, dataJson);

      return true;
    } catch (error) {
      this.logger.error(`Failed to save data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Load data from storage
   * @param key The storage key
   * @returns Promise that resolves to the loaded data or null if not found
   */
  public async loadData<T>(key: string): Promise<T | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      this.logger.warn('Storage is not available, cannot load data');
      return null;
    }

    try {
      // Get data from storage
      const dataJson = await this.backend.getItem(key);

      if (!dataJson) {
        return null;
      }

      // Parse data
      const data = JSON.parse(dataJson) as T;

      return data;
    } catch (error) {
      this.logger.error(`Failed to load data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete data from storage
   * @param key The storage key
   * @returns Promise that resolves to true if successful
   */
  public async deleteData(key: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      this.logger.warn('Storage is not available, cannot delete data');
      return false;
    }

    try {
      // Remove data from storage
      await this.backend.removeItem(key);

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all data from storage
   * @returns Promise that resolves to true if successful
   */
  public async clearData(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      this.logger.warn('Storage is not available, cannot clear data');
      return false;
    }

    try {
      // Clear all data from storage
      await this.backend.clear();

      // Reset items index
      this.itemsIndex = [];

      return true;
    } catch (error) {
      this.logger.error('Failed to clear data:', error);
      return false;
    }
  }

  /**
   * Get all keys from storage
   * @returns Promise that resolves to an array of keys
   */
  public async getKeys(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      this.logger.warn('Storage is not available, cannot get keys');
      return [];
    }

    try {
      // Get all keys from storage
      return await this.backend.keys();
    } catch (error) {
      this.logger.error('Failed to get keys:', error);
      return [];
    }
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.itemsIndex = [];
    this.initialized = false;
    this.logger.info('Storage service reset');
  }
}

/**
 * Get the storage service instance
 * @returns The storage service instance
 */
export function getStorageService(options?: StorageServiceOptions): StorageService {
  if (!instance) {
    instance = new StorageService(options);
  }
  return instance;
}
