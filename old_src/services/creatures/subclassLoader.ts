/**
 * Subclass Loader Service
 *
 * This service is responsible for loading subclass data from JSON.
 */

import { SubclassCollection, Subclass } from '../../types/creatures/subclass';
import { Role, Tier } from '../../types/core';
import subclassesJson from '../../data/creatures/subclasses.json';

// Singleton instance
let instance: SubclassLoader | null = null;

/**
 * Subclass Loader class
 */
class SubclassLoader {
  private subclassCollection: SubclassCollection | null = null;
  private initialized = false;

  /**
   * Initialize the subclass loader
   */
  public initialize(): void {
    try {
      // Parse the subclasses JSON into a strongly-typed SubclassCollection
      this.subclassCollection = subclassesJson as SubclassCollection;
      this.initialized = true;
      console.log('Subclass loader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize subclass loader:', error);
      throw error;
    }
  }

  /**
   * Check if the loader is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the subclass collection
   * @returns The subclass collection
   */
  public getSubclassCollection(): SubclassCollection {
    if (!this.initialized || !this.subclassCollection) {
      throw new Error('Subclass loader not initialized');
    }
    return this.subclassCollection;
  }

  /**
   * Get subclasses for a specific role and tier
   * @param role The role
   * @param tier The tier
   * @returns Array of subclasses for the specified role and tier
   */
  public getSubclassesByRoleAndTier(role: Role, tier: Tier): Subclass[] {
    if (!this.initialized || !this.subclassCollection) {
      throw new Error('Subclass loader not initialized');
    }
    
    const roleSubclasses = this.subclassCollection.roles[role];
    if (!roleSubclasses) {
      console.warn(`No subclasses found for role ${role}`);
      return [];
    }
    
    const tierSubclasses = roleSubclasses[tier];
    if (!tierSubclasses) {
      console.warn(`No subclasses found for role ${role}, tier ${tier}`);
      return [];
    }
    
    return tierSubclasses.map(subclass => ({
      ...subclass,
      tier // Ensure tier is set on the subclass
    }));
  }

  /**
   * Get a random subclass for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns A random subclass for the specified role and tier, or undefined if none available
   */
  public getRandomSubclass(role: Role, tier: Tier): Subclass | undefined {
    const subclasses = this.getSubclassesByRoleAndTier(role, tier);
    if (subclasses.length === 0) {
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * subclasses.length);
    return subclasses[randomIndex];
  }
}

/**
 * Get the subclass loader instance
 * @returns The subclass loader instance
 */
export function getSubclassLoader(): SubclassLoader {
  if (!instance) {
    instance = new SubclassLoader();
    if (!instance.isInitialized()) {
      instance.initialize();
    }
  }
  return instance;
} 