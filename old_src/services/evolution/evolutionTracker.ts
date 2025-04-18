/**
 * Evolution Tracker Service
 * 
 * Tracks and records evolution events and mutations for creatures.
 */

import { Mutation } from '../../types/mutations/mutation';

// Singleton instance
let instance: EvolutionTracker | null = null;

/**
 * Evolution Tracker entry
 */
interface EvolutionEntry {
  creatureId: string;
  blockNumber: number;
  confirmations: number;
  mutations: Mutation[];
  timestamp: number;
}

/**
 * Evolution Tracker service class
 */
class EvolutionTracker {
  private initialized: boolean = false;
  private evolutionHistory: Map<string, EvolutionEntry[]> = new Map();
  
  /**
   * Initialize the evolution tracker
   */
  initialize(): void {
    this.evolutionHistory = new Map();
    this.initialized = true;
  }
  
  /**
   * Check if the tracker is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Track an evolution event for a creature
   * @param creatureId ID of the creature
   * @param blockNumber Block number the creature was created in
   * @param confirmations Number of confirmations
   * @param mutations List of mutations applied in this evolution
   */
  trackEvolution(
    creatureId: string, 
    blockNumber: number, 
    confirmations: number, 
    mutations: Mutation[]
  ): void {
    if (!this.initialized) {
      throw new Error('Evolution tracker not initialized');
    }
    
    const entry: EvolutionEntry = {
      creatureId,
      blockNumber,
      confirmations,
      mutations,
      timestamp: Date.now()
    };
    
    // Get the creature's history or create an empty array
    const history = this.evolutionHistory.get(creatureId) || [];
    
    // Add the new entry
    history.push(entry);
    
    // Update the map
    this.evolutionHistory.set(creatureId, history);
  }
  
  /**
   * Get evolution history for a creature
   * @param creatureId ID of the creature
   * @returns Array of evolution entries for the creature
   */
  getEvolutionHistory(creatureId: string): EvolutionEntry[] {
    if (!this.initialized) {
      throw new Error('Evolution tracker not initialized');
    }
    
    return this.evolutionHistory.get(creatureId) || [];
  }
  
  /**
   * Get the total number of mutations for a creature
   * @param creatureId ID of the creature
   * @returns Total number of mutations
   */
  getTotalMutations(creatureId: string): number {
    const history = this.getEvolutionHistory(creatureId);
    return history.reduce((total, entry) => total + entry.mutations.length, 0);
  }
  
  /**
   * Clear evolution history for a creature
   * @param creatureId ID of the creature
   */
  clearHistory(creatureId: string): void {
    if (!this.initialized) {
      throw new Error('Evolution tracker not initialized');
    }
    
    this.evolutionHistory.delete(creatureId);
  }
  
  /**
   * Clear all evolution history
   */
  clearAllHistory(): void {
    if (!this.initialized) {
      throw new Error('Evolution tracker not initialized');
    }
    
    this.evolutionHistory.clear();
  }
}

/**
 * Get the evolution tracker instance
 * @returns The evolution tracker instance
 */
export function getEvolutionTracker(): EvolutionTracker {
  if (!instance) {
    instance = new EvolutionTracker();
  }
  return instance;
}

