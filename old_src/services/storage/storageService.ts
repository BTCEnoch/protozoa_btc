/**
 * Storage Service
 *
 * This service provides persistent storage for creatures and other game data.
 * It uses localStorage for browser persistence and provides fallbacks.
 *
 * Features:
 * - Multiple storage backends (localStorage, IndexedDB)
 * - Data compression for efficient storage
 * - Asynchronous API for non-blocking operations
 * - Subscription system for reactive updates
 * - Worker integration for offloading heavy tasks
 */

import { Creature } from '../../types/creatures/creature';
import { compress, decompress } from '../../lib/compression';
import { getEventService } from '../events/eventService';
import { StorageBackend } from './storageBackendInterface';
import { LocalStorageBackend } from './localStorageBackend';
import { IndexedDBBackend } from './indexedDBBackend';
import { StorageEvent } from './storageEvents';

// Configuration (externalized constants)
const config = {
  STORAGE_PREFIX: 'bitcoin_protozoa_',
  CREATURE_PREFIX: 'creature_',
  SETTINGS_KEY: 'settings',
  MAX_CREATURES: 50,
  USE_COMPRESSION: true,
  WORKER_URL: 'storageWorker.js',
  STORAGE_BACKEND: 'localStorage' // 'localStorage' or 'indexedDB'
};

// Storage keys
enum StorageKeys {
  CREATURES_INDEX = 'creatures_index',
  LAST_BLOCK = 'last_block',
  SETTINGS = 'settings',
  EVOLUTION_HISTORY = 'evolution_history',
  USER_PREFERENCES = 'user_preferences',
  PARTICLE_CACHE = 'particle_cache',
  VISUAL_CACHE = 'visual_cache'
}



// Worker task interface
interface WorkerTask {
  id: string;
  type: string;
  data: any;
}

// Worker result interface
interface WorkerResult {
  id: string;
  type: string;
  data: any;
  error?: string;
}

// Types
interface StorageServiceOptions {
  useCompression?: boolean;
  maxCreatures?: number;
  storageBackend?: 'localStorage' | 'indexedDB';
  workerEnabled?: boolean;
}

// Worker task interface
interface WorkerTask {
  id: string;
  type: string;
  data: any;
}

// Worker result interface
interface WorkerResult {
  id: string;
  type: string;
  data: any;
  error?: string;
}

// Singleton instance
let instance: StorageService | null = null;

/**
 * Storage Service class
 */
class StorageService {
  private initialized: boolean = false;
  private options: StorageServiceOptions;
  private isAvailable: boolean = false;
  private creaturesIndex: string[] = [];
  private backend: StorageBackend;
  private worker: Worker | null = null;
  private taskCallbacks: Map<string, (result: any) => void> = new Map();
  private eventService: any;

  /**
   * Constructor
   * @param options Storage service options
   */
  constructor(options: StorageServiceOptions = {}) {
    this.options = {
      useCompression: options.useCompression ?? config.USE_COMPRESSION,
      maxCreatures: options.maxCreatures ?? config.MAX_CREATURES,
      storageBackend: options.storageBackend ?? 'localStorage' as 'localStorage' | 'indexedDB',
      workerEnabled: options.workerEnabled ?? false
    };

    // Create storage backend
    if (this.options.storageBackend === 'indexedDB') {
      this.backend = new IndexedDBBackend(config.STORAGE_PREFIX);
    } else {
      this.backend = new LocalStorageBackend(config.STORAGE_PREFIX);
    }

    // Check if storage is available
    this.isAvailable = this.backend.isAvailable();

    // Initialize worker if enabled
    if (this.options.workerEnabled) {
      this.initializeWorker();
    }

    // Get event service
    try {
      this.eventService = getEventService();
    } catch (error) {
      console.warn('Event service not available:', error);
    }
  }

  /**
   * Initialize worker
   */
  private initializeWorker(): void {
    try {
      this.worker = new Worker(config.WORKER_URL);
      this.worker.onmessage = (event) => {
        const result = event.data as WorkerResult;
        const callback = this.taskCallbacks.get(result.id);
        if (callback) {
          callback(result.data);
          this.taskCallbacks.delete(result.id);
        }
      };
      console.log('Storage worker initialized');
    } catch (error) {
      console.warn('Failed to initialize storage worker:', error);
      this.worker = null;
    }
  }

  /**
   * Initialize the storage service
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.isAvailable) {
      try {
        // Load creatures index
        const indexJson = await this.backend.getItem(StorageKeys.CREATURES_INDEX);
        if (indexJson) {
          try {
            // Decompress if needed
            const json = this.options.useCompression ? decompress(indexJson) : indexJson;
            this.creaturesIndex = JSON.parse(json);
          } catch (error) {
            console.error('Failed to parse creatures index:', error);
            this.creaturesIndex = [];
          }
        }
      } catch (error) {
        console.error('Failed to load creatures index:', error);
        this.creaturesIndex = [];
      }
    }

    this.initialized = true;
    console.log('Storage service initialized');
  }



  /**
   * Save a creature to storage
   * @param creature The creature to save
   * @returns Promise that resolves to true if successful
   */
  async saveCreature(creature: Creature): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      console.warn('Storage is not available, creature not saved');
      return false;
    }

    try {
      // Convert creature to JSON string
      let creatureJson = JSON.stringify(creature);

      // Compress if enabled
      if (this.options.useCompression) {
        creatureJson = compress(creatureJson);
      }

      // Create storage key for this creature
      const storageKey = `${config.CREATURE_PREFIX}${creature.id}`;

      // Save creature
      await this.backend.setItem(storageKey, creatureJson);

      // Update creatures index if needed
      if (!this.creaturesIndex.includes(creature.id)) {
        // Add creature to index
        this.creaturesIndex.push(creature.id);

        // If we've exceeded max creatures, remove oldest
        if (this.creaturesIndex.length > this.options.maxCreatures) {
          const oldestCreatureId = this.creaturesIndex.shift(); // Remove oldest
          if (oldestCreatureId) {
            await this.backend.removeItem(`${config.CREATURE_PREFIX}${oldestCreatureId}`);
          }
        }

        // Save updated index
        let indexJson = JSON.stringify(this.creaturesIndex);
        if (this.options.useCompression) {
          indexJson = compress(indexJson);
        }
        await this.backend.setItem(StorageKeys.CREATURES_INDEX, indexJson);
      }

      // Emit event
      if (this.eventService) {
        this.eventService.emit(StorageEvent.CREATURE_SAVED, { id: creature.id });
      }

      return true;
    } catch (error) {
      console.error('Failed to save creature:', error);
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_ERROR, {
          operation: 'saveCreature',
          creatureId: creature.id,
          error
        });
      }
      return false;
    }
  }

  /**
   * Load a creature from storage
   * @param creatureId The ID of the creature to load
   * @returns Promise that resolves to the creature object or null if not found
   */
  async loadCreature(creatureId: string): Promise<Creature | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      console.warn('Storage is not available, cannot load creature');
      return null;
    }

    try {
      // Get creature JSON from storage
      const storageKey = `${config.CREATURE_PREFIX}${creatureId}`;
      const creatureJson = await this.backend.getItem(storageKey);

      if (!creatureJson) {
        return null;
      }

      // Decompress if needed
      const json = this.options.useCompression ? decompress(creatureJson) : creatureJson;

      // Parse creature JSON
      const creature = JSON.parse(json) as Creature;

      // Emit event
      if (this.eventService) {
        this.eventService.emit(StorageEvent.CREATURE_LOADED, { id: creatureId });
      }

      return creature;
    } catch (error) {
      console.error(`Failed to load creature ${creatureId}:`, error);
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_ERROR, {
          operation: 'loadCreature',
          creatureId,
          error
        });
      }
      return null;
    }
  }

  /**
   * Delete a creature from storage
   * @param creatureId The ID of the creature to delete
   * @returns Promise that resolves to true if successful
   */
  async deleteCreature(creatureId: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      console.warn('Storage is not available, cannot delete creature');
      return false;
    }

    try {
      // Remove creature from storage
      const storageKey = `${config.CREATURE_PREFIX}${creatureId}`;
      await this.backend.removeItem(storageKey);

      // Update creatures index
      const index = this.creaturesIndex.indexOf(creatureId);
      if (index >= 0) {
        this.creaturesIndex.splice(index, 1);

        // Save updated index
        let indexJson = JSON.stringify(this.creaturesIndex);
        if (this.options.useCompression) {
          indexJson = compress(indexJson);
        }
        await this.backend.setItem(StorageKeys.CREATURES_INDEX, indexJson);
      }

      // Emit event
      if (this.eventService) {
        this.eventService.emit(StorageEvent.CREATURE_DELETED, { id: creatureId });
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete creature ${creatureId}:`, error);
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_ERROR, {
          operation: 'deleteCreature',
          creatureId,
          error
        });
      }
      return false;
    }
  }

  /**
   * Get all creature IDs
   * @returns Promise that resolves to an array of creature IDs
   */
  async getAllCreatureIds(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return [...this.creaturesIndex];
  }

  /**
   * Load all creatures
   * @returns Promise that resolves to an array of creatures
   */
  async loadAllCreatures(): Promise<Creature[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const creatures: Creature[] = [];
    const promises: Promise<void>[] = [];

    // Create promises for loading each creature
    for (const creatureId of this.creaturesIndex) {
      promises.push(
        this.loadCreature(creatureId).then(creature => {
          if (creature) {
            creatures.push(creature);
          }
        })
      );
    }

    // Wait for all creatures to load
    await Promise.all(promises);
    return creatures;
  }

  /**
   * Save general data to storage
   * @param key The storage key
   * @param data The data to save
   * @returns Promise that resolves to true if successful
   */
  async saveData(key: string, data: any): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      console.warn('Storage is not available, data not saved');
      return false;
    }

    try {
      // Convert data to JSON string
      let dataJson = JSON.stringify(data);

      // Compress if enabled
      if (this.options.useCompression) {
        dataJson = compress(dataJson);
      }

      // Save data
      await this.backend.setItem(key, dataJson);

      // Emit event
      if (this.eventService) {
        this.eventService.emit(StorageEvent.DATA_SAVED, { key });
      }

      return true;
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_ERROR, {
          operation: 'saveData',
          key,
          error
        });
      }
      return false;
    }
  }

  /**
   * Load general data from storage
   * @param key The storage key
   * @returns Promise that resolves to the loaded data or null if not found
   */
  async loadData(key: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      console.warn('Storage is not available, cannot load data');
      return null;
    }

    try {
      // Get data from storage
      const dataJson = await this.backend.getItem(key);

      if (!dataJson) {
        return null;
      }

      // Decompress if needed
      const json = this.options.useCompression ? decompress(dataJson) : dataJson;

      // Parse data
      const data = JSON.parse(json);

      // Emit event
      if (this.eventService) {
        this.eventService.emit(StorageEvent.DATA_LOADED, { key });
      }

      return data;
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error);
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_ERROR, {
          operation: 'loadData',
          key,
          error
        });
      }
      return null;
    }
  }

  /**
   * Delete general data from storage
   * @param key The storage key
   * @returns Promise that resolves to true if successful
   */
  async deleteData(key: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      console.warn('Storage is not available, cannot delete data');
      return false;
    }

    try {
      // Remove data from storage
      await this.backend.removeItem(key);

      // Emit event
      if (this.eventService) {
        this.eventService.emit(StorageEvent.DATA_DELETED, { key });
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete data for key ${key}:`, error);
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_ERROR, {
          operation: 'deleteData',
          key,
          error
        });
      }
      return false;
    }
  }

  /**
   * Clear all storage for this application
   * @returns Promise that resolves to true if successful
   */
  async clearAllStorage(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      console.warn('Storage is not available, cannot clear storage');
      return false;
    }

    try {
      // Clear all storage
      await this.backend.clear();

      // Reset creatures index
      this.creaturesIndex = [];

      // Emit event
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_CLEARED, {});
      }

      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      if (this.eventService) {
        this.eventService.emit(StorageEvent.STORAGE_ERROR, {
          operation: 'clearAllStorage',
          error
        });
      }
      return false;
    }
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if storage is available
   * @returns True if storage is available
   */
  isStorageAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Check if worker is available
   * @returns True if worker is available
   */
  isWorkerAvailable(): boolean {
    return this.worker !== null;
  }

  /**
   * Execute a task in the worker
   * @param taskType The type of task to execute
   * @param data The data for the task
   * @returns Promise that resolves to the result of the task
   */
  async executeWorkerTask<T>(taskType: string, data: any): Promise<T> {
    if (!this.worker) {
      throw new Error('Worker is not available');
    }

    return new Promise<T>((resolve, reject) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

      // Set up callback
      this.taskCallbacks.set(taskId, (result) => {
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result as T);
        }
      });

      // Send task to worker
      this.worker.postMessage({
        id: taskId,
        type: taskType,
        data
      } as WorkerTask);
    });
  }

  /**
   * Subscribe to storage events
   * @param event The event to subscribe to
   * @param callback The callback to call when the event occurs
   * @returns A function to unsubscribe
   */
  subscribe(event: StorageEvent, callback: (data: any) => void): () => void {
    if (!this.eventService) {
      console.warn('Event service not available, cannot subscribe to events');
      return () => {};
    }

    return this.eventService.subscribe(event, callback);
  }
}

/**
 * Get the storage service instance
 * @param options Optional configuration options
 * @returns The storage service singleton instance
 */
export function getStorageService(options?: StorageServiceOptions): StorageService {
  if (!instance) {
    instance = new StorageService(options);
  }
  return instance;
}
