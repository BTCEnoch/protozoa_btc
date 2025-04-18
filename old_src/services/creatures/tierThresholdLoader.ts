/**
 * Tier Threshold Loader Service
 *
 * This service is responsible for loading tier threshold data from JSON.
 */

import { Tier } from '../../types/core';
import thresholdsJson from '../../data/creatures/tierThresholds.json';

export interface TierRange {
  min: number;
  max: number | null; // null represents unlimited/infinity
}

export interface TierThresholds {
  tiers: Record<Tier, TierRange>;
  attributeThresholds: Record<Tier, TierRange>;
}

// Singleton instance
let instance: TierThresholdLoader | null = null;

/**
 * Tier Threshold Loader class
 */
class TierThresholdLoader {
  private thresholds: TierThresholds | null = null;
  private initialized = false;

  /**
   * Initialize the tier threshold loader
   */
  public initialize(): void {
    try {
      // Parse the thresholds JSON into a strongly-typed TierThresholds
      this.thresholds = thresholdsJson as TierThresholds;
      this.initialized = true;
      console.log('Tier threshold loader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize tier threshold loader:', error);
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
   * Get the tier thresholds
   * @returns The tier thresholds
   */
  public getTierThresholds(): TierThresholds {
    if (!this.initialized || !this.thresholds) {
      throw new Error('Tier threshold loader not initialized');
    }
    return this.thresholds;
  }

  /**
   * Get the tier for a particle count
   * @param particleCount The number of particles
   * @returns The appropriate tier for the particle count
   */
  public getTierForParticleCount(particleCount: number): Tier {
    if (!this.initialized || !this.thresholds) {
      throw new Error('Tier threshold loader not initialized');
    }
    
    for (const [tier, range] of Object.entries(this.thresholds.tiers)) {
      if (particleCount >= range.min && (range.max === null || particleCount <= range.max)) {
        return tier as Tier;
      }
    }
    
    // Default to lowest tier if no match is found
    return Tier.TIER_1;
  }

  /**
   * Get the tier for an attribute value
   * @param attributeValue The attribute value
   * @returns The appropriate tier for the attribute value
   */
  public getTierForAttributeValue(attributeValue: number): Tier {
    if (!this.initialized || !this.thresholds) {
      throw new Error('Tier threshold loader not initialized');
    }
    
    for (const [tier, range] of Object.entries(this.thresholds.attributeThresholds)) {
      if (attributeValue >= range.min && (range.max === null || attributeValue <= range.max)) {
        return tier as Tier;
      }
    }
    
    // Default to lowest tier if no match is found
    return Tier.TIER_1;
  }
}

/**
 * Get the tier threshold loader instance
 * @returns The tier threshold loader instance
 */
export function getTierThresholdLoader(): TierThresholdLoader {
  if (!instance) {
    instance = new TierThresholdLoader();
    if (!instance.isInitialized()) {
      instance.initialize();
    }
  }
  return instance;
}
