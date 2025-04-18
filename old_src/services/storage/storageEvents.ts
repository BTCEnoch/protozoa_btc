/**
 * Storage Events for Bitcoin Protozoa
 * 
 * This file defines the events that can be emitted by the storage service.
 */

/**
 * Storage events
 */
export enum StorageEvent {
  CREATURE_SAVED = 'storage:creature_saved',
  CREATURE_LOADED = 'storage:creature_loaded',
  CREATURE_DELETED = 'storage:creature_deleted',
  DATA_SAVED = 'storage:data_saved',
  DATA_LOADED = 'storage:data_loaded',
  DATA_DELETED = 'storage:data_deleted',
  STORAGE_CLEARED = 'storage:cleared',
  STORAGE_ERROR = 'storage:error'
}
