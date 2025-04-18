/**
 * Trait Loader Service
 *
 * This service is responsible for loading trait data from JSON.
 */

import { Rarity } from '../../types/core';
import traitsJson from '../../data/creatures/traits.json';

export interface TraitEffect {
  attribute?: string;
  multiplier?: number;
  attributePerParticle?: number;
  particleBonus?: number;
  cooldownReduction?: number;
  rangeIncrease?: number;
  roles?: string[];
  bonusMultiplier?: number;
  [key: string]: any;
}

export interface Trait {
  id: string;
  name: string;
  category: string;
  rarity: string;
  effect: TraitEffect;
}

export interface TraitCategory {
  [key: string]: Trait;
}

export interface TraitCollection {
  traits: {
    attribute: TraitCategory;
    particle: TraitCategory;
    ability: TraitCategory;
    synergy: TraitCategory;
    [key: string]: TraitCategory;
  };
}

// Singleton instance
let instance: TraitLoader | null = null;

/**
 * Trait Loader class
 */
class TraitLoader {
  private traitCollection: TraitCollection | null = null;
  private initialized = false;

  /**
   * Initialize the trait loader
   */
  public initialize(): void {
    try {
      // Parse the traits JSON into a strongly-typed TraitCollection
      this.traitCollection = traitsJson as TraitCollection;
      this.initialized = true;
      console.log('Trait loader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize trait loader:', error);
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
   * Get the trait collection
   * @returns The trait collection
   */
  public getTraitCollection(): TraitCollection {
    if (!this.initialized || !this.traitCollection) {
      throw new Error('Trait loader not initialized');
    }
    return this.traitCollection;
  }

  /**
   * Get traits by category
   * @param category The trait category
   * @returns Object containing traits in the specified category
   */
  public getTraitsByCategory(category: string): TraitCategory {
    if (!this.initialized || !this.traitCollection) {
      throw new Error('Trait loader not initialized');
    }
    
    const categoryTraits = this.traitCollection.traits[category];
    if (!categoryTraits) {
      console.warn(`No traits found for category ${category}`);
      return {};
    }
    
    return categoryTraits;
  }

  /**
   * Get traits by category and rarity
   * @param category The trait category
   * @param rarity The trait rarity
   * @returns Array of traits in the specified category and rarity
   */
  public getTraitsByCategoryAndRarity(category: string, rarity: Rarity): Trait[] {
    const categoryTraits = this.getTraitsByCategory(category);
    
    return Object.values(categoryTraits).filter(trait => 
      trait.rarity === rarity
    );
  }

  /**
   * Get a trait by ID
   * @param traitId The trait ID
   * @returns The trait with the specified ID, or undefined if not found
   */
  public getTraitById(traitId: string): Trait | undefined {
    if (!this.initialized || !this.traitCollection) {
      throw new Error('Trait loader not initialized');
    }
    
    // Search all categories for the trait
    for (const category in this.traitCollection.traits) {
      const categoryTraits = this.traitCollection.traits[category];
      if (categoryTraits[traitId]) {
        return categoryTraits[traitId];
      }
    }
    
    console.warn(`Trait with ID ${traitId} not found`);
    return undefined;
  }

  /**
   * Get a random trait by category and rarity
   * @param category The trait category
   * @param rarity The trait rarity
   * @returns A random trait in the specified category and rarity, or undefined if none available
   */
  public getRandomTrait(category: string, rarity: Rarity): Trait | undefined {
    const traits = this.getTraitsByCategoryAndRarity(category, rarity);
    if (traits.length === 0) {
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * traits.length);
    return traits[randomIndex];
  }
}

/**
 * Get the trait loader instance
 * @returns The trait loader instance
 */
export function getTraitLoader(): TraitLoader {
  if (!instance) {
    instance = new TraitLoader();
    if (!instance.isInitialized()) {
      instance.initialize();
    }
  }
  return instance;
} 