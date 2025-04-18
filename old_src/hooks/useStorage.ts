/**
 * Storage Hook for Bitcoin Protozoa
 * 
 * This hook provides a convenient way to use the storage service in React components.
 * It handles loading and saving data, and provides a reactive interface for updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStorageService } from '../services/storage/storageService';
import { StorageEvent } from '../services/storage/storageEvents';

/**
 * Hook for using the storage service
 * @param key The storage key
 * @param initialValue The initial value to use if the key doesn't exist
 * @returns A tuple of [value, setValue, loading, error]
 */
export function useStorage<T>(key: string, initialValue: T): [T, (value: T) => Promise<void>, boolean, Error | null] {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const storageService = getStorageService();

  // Load data from storage
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await storageService.loadData(key);
        
        if (isMounted) {
          if (data !== null) {
            setValue(data as T);
          }
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };
    
    loadData();
    
    // Subscribe to storage events
    const unsubscribe = storageService.subscribe(StorageEvent.DATA_SAVED, (data) => {
      if (data.key === key) {
        loadData();
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [key, storageService]);
  
  // Save data to storage
  const updateValue = useCallback(async (newValue: T) => {
    try {
      setLoading(true);
      await storageService.saveData(key, newValue);
      setValue(newValue);
      setLoading(false);
      setError(null);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [key, storageService]);
  
  return [value, updateValue, loading, error];
}

/**
 * Hook for using a creature from storage
 * @param creatureId The ID of the creature
 * @returns A tuple of [creature, setCreature, loading, error]
 */
export function useCreature(creatureId: string): [any, (creature: any) => Promise<void>, boolean, Error | null] {
  const [creature, setCreature] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const storageService = getStorageService();
  
  // Load creature from storage
  useEffect(() => {
    let isMounted = true;
    
    const loadCreature = async () => {
      try {
        setLoading(true);
        const data = await storageService.loadCreature(creatureId);
        
        if (isMounted) {
          setCreature(data);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };
    
    loadCreature();
    
    // Subscribe to storage events
    const unsubscribe = storageService.subscribe(StorageEvent.CREATURE_SAVED, (data) => {
      if (data.id === creatureId) {
        loadCreature();
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [creatureId, storageService]);
  
  // Save creature to storage
  const updateCreature = useCallback(async (newCreature: any) => {
    try {
      setLoading(true);
      await storageService.saveCreature(newCreature);
      setCreature(newCreature);
      setLoading(false);
      setError(null);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [storageService]);
  
  return [creature, updateCreature, loading, error];
}

/**
 * Hook for using all creatures from storage
 * @returns A tuple of [creatures, loading, error]
 */
export function useAllCreatures(): [any[], boolean, Error | null] {
  const [creatures, setCreatures] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const storageService = getStorageService();
  
  // Load all creatures from storage
  useEffect(() => {
    let isMounted = true;
    
    const loadCreatures = async () => {
      try {
        setLoading(true);
        const data = await storageService.loadAllCreatures();
        
        if (isMounted) {
          setCreatures(data);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };
    
    loadCreatures();
    
    // Subscribe to storage events
    const unsubscribeSaved = storageService.subscribe(StorageEvent.CREATURE_SAVED, () => {
      loadCreatures();
    });
    
    const unsubscribeDeleted = storageService.subscribe(StorageEvent.CREATURE_DELETED, () => {
      loadCreatures();
    });
    
    return () => {
      isMounted = false;
      unsubscribeSaved();
      unsubscribeDeleted();
    };
  }, [storageService]);
  
  return [creatures, loading, error];
}
