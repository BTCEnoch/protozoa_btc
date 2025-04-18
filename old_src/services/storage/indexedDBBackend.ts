/**
 * IndexedDB Backend for Bitcoin Protozoa
 * 
 * This file provides an implementation of the StorageBackend interface using IndexedDB.
 * It handles storing and retrieving data from IndexedDB with proper error handling.
 */

import { StorageBackend } from './storageBackendInterface';

/**
 * IndexedDB backend implementation
 */
export class IndexedDBBackend implements StorageBackend {
  private dbName: string;
  private storeName: string;
  private prefix: string;
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Constructor
   * @param dbName The name of the database
   * @param storeName The name of the object store
   * @param prefix The prefix for keys
   */
  constructor(dbName: string = 'bitcoin_protozoa', storeName: string = 'storage', prefix: string = '') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.prefix = prefix;
  }

  /**
   * Initialize the database
   * @returns Promise that resolves to the database
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('Failed to open IndexedDB:', event);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Get an item from storage
   * @param key The key to get
   * @returns Promise that resolves to the value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.initDB();
      const fullKey = this.prefix ? `${this.prefix}${key}` : key;

      return new Promise<string | null>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(fullKey);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = (event) => {
          console.error(`Failed to get item ${key}:`, event);
          reject(new Error(`Failed to get item ${key}`));
        };
      });
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
      const db = await this.initDB();
      const fullKey = this.prefix ? `${this.prefix}${key}` : key;

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, fullKey);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          console.error(`Failed to set item ${key}:`, event);
          reject(new Error(`Failed to set item ${key}`));
        };
      });
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
      const db = await this.initDB();
      const fullKey = this.prefix ? `${this.prefix}${key}` : key;

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(fullKey);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          console.error(`Failed to remove item ${key}:`, event);
          reject(new Error(`Failed to remove item ${key}`));
        };
      });
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
      const db = await this.initDB();

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        if (this.prefix) {
          // If we have a prefix, we need to get all keys and delete only those with our prefix
          const request = store.getAllKeys();
          
          request.onsuccess = () => {
            const keys = request.result as string[];
            const prefixedKeys = keys.filter(key => 
              typeof key === 'string' && key.startsWith(this.prefix)
            );
            
            let completed = 0;
            let errors = 0;
            
            if (prefixedKeys.length === 0) {
              resolve();
              return;
            }
            
            prefixedKeys.forEach(key => {
              const deleteRequest = store.delete(key);
              
              deleteRequest.onsuccess = () => {
                completed++;
                if (completed + errors === prefixedKeys.length) {
                  if (errors > 0) {
                    reject(new Error(`Failed to clear some items (${errors} errors)`));
                  } else {
                    resolve();
                  }
                }
              };
              
              deleteRequest.onerror = () => {
                errors++;
                completed++;
                if (completed + errors === prefixedKeys.length) {
                  reject(new Error(`Failed to clear some items (${errors} errors)`));
                }
              };
            });
          };
          
          request.onerror = (event) => {
            console.error('Failed to get keys for clearing:', event);
            reject(new Error('Failed to get keys for clearing'));
          };
        } else {
          // If we don't have a prefix, we can clear the entire store
          const request = store.clear();
          
          request.onsuccess = () => {
            resolve();
          };
          
          request.onerror = (event) => {
            console.error('Failed to clear storage:', event);
            reject(new Error('Failed to clear storage'));
          };
        }
      });
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
      const db = await this.initDB();

      return new Promise<string[]>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          const allKeys = request.result as string[];
          
          // Filter keys by prefix if needed
          if (this.prefix) {
            const prefixedKeys = allKeys
              .filter(key => typeof key === 'string' && key.startsWith(this.prefix))
              .map(key => key.substring(this.prefix.length));
            resolve(prefixedKeys);
          } else {
            resolve(allKeys as string[]);
          }
        };

        request.onerror = (event) => {
          console.error('Failed to get keys:', event);
          reject(new Error('Failed to get keys'));
        };
      });
    } catch (error) {
      console.error('Error in keys():', error);
      return [];
    }
  }

  /**
   * Check if IndexedDB is available
   * @returns True if IndexedDB is available
   */
  isAvailable(): boolean {
    try {
      return !!indexedDB;
    } catch (e) {
      return false;
    }
  }
}
