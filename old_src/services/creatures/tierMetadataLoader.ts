/**
 * Tier Metadata Loader
 * 
 * This module is responsible for loading and providing tier-related metadata
 * such as tier names, colors, and visual properties.
 */

import { Tier } from '../../types/core';
import { getTierThresholdLoader, TierThresholds } from './tierThresholdLoader';

// Singleton instance
let instance: TierMetadataLoader | null = null;

/**
 * Tier visual metadata interface
 */
export interface TierMetadata {
  name: string;         // Display name of the tier
  color: string;        // Primary color (hex) 
  accent: string;       // Accent color (hex)
  particleMin: number;  // Minimum particles for this tier
  particleMax: number;  // Maximum particles for this tier
}

/**
 * Tier metadata map type
 */
export type TierMetadataMap = Record<Tier, TierMetadata>;

/**
 * Default tier metadata
 */
const DEFAULT_TIER_METADATA: TierMetadataMap = {
  [Tier.TIER_1]: {
    name: 'Microbe',
    color: '#3498db',
    accent: '#2980b9',
    particleMin: 50,
    particleMax: 89
  },
  [Tier.TIER_2]: {
    name: 'Cell',
    color: '#2ecc71',
    accent: '#27ae60',
    particleMin: 90,
    particleMax: 119
  },
  [Tier.TIER_3]: {
    name: 'Multicellular',
    color: '#f1c40f',
    accent: '#f39c12',
    particleMin: 120,
    particleMax: 149
  },
  [Tier.TIER_4]: {
    name: 'Complex',
    color: '#e67e22',
    accent: '#d35400',
    particleMin: 150,
    particleMax: 179
  },
  [Tier.TIER_5]: {
    name: 'Advanced',
    color: '#e74c3c',
    accent: '#c0392b',
    particleMin: 180,
    particleMax: 199
  },
  [Tier.TIER_6]: {
    name: 'Apex',
    color: '#9b59b6',
    accent: '#8e44ad', 
    particleMin: 200,
    particleMax: 250
  }
};

/**
 * Class responsible for loading and providing tier metadata
 */
class TierMetadataLoader {
  private initialized: boolean = false;
  private tierMetadata: TierMetadataMap = DEFAULT_TIER_METADATA;

  /**
   * Initialize the tier metadata loader
   * If initialization fails, default metadata will be used
   */
  initialize(): void {
    try {
      // Get reference to the tier threshold loader
      const thresholdLoader = getTierThresholdLoader();
      
      // Make sure the tier threshold loader is initialized
      if (!thresholdLoader.isInitialized()) {
        thresholdLoader.initialize();
      }
      
      // Get the tier thresholds
      const thresholds = thresholdLoader.getTierThresholds();
      
      // Update our metadata with the threshold values
      this.updateMetadataWithThresholds(thresholds);
      
      console.log('Tier metadata initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize tier metadata, using defaults:', error);
      this.tierMetadata = DEFAULT_TIER_METADATA;
      this.initialized = true;
    }
  }

  /**
   * Update the metadata with the threshold values
   */
  private updateMetadataWithThresholds(thresholds: TierThresholds): void {
    // Create a new tier metadata map with updated thresholds
    const updatedMetadata: TierMetadataMap = { ...this.tierMetadata };
    
    // Update each tier's particle min and max values
    for (const tier of Object.values(Tier)) {
      if (thresholds.tiers[tier]) {
        const range = thresholds.tiers[tier];
        updatedMetadata[tier] = {
          ...updatedMetadata[tier],
          particleMin: range.min,
          particleMax: range.max !== null ? range.max : Number.MAX_SAFE_INTEGER
        };
      }
    }
    
    this.tierMetadata = updatedMetadata;
  }

  /**
   * Get metadata for a specific tier
   * @param tier The tier to get metadata for
   * @returns The tier metadata
   */
  getTierMetadata(tier: Tier): TierMetadata {
    return this.tierMetadata[tier];
  }

  /**
   * Get all tier metadata
   * @returns Map of all tier metadata
   */
  getAllTierMetadata(): TierMetadataMap {
    return this.tierMetadata;
  }

  /**
   * Get the tier for a specific particle count
   * @param particles The particle count
   * @returns The corresponding tier
   */
  getTierForParticleCount(particles: number): Tier {
    return getTierThresholdLoader().getTierForParticleCount(particles);
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Get the tier metadata loader instance
 * @returns The tier metadata loader singleton
 */
export function getTierMetadataLoader(): TierMetadataLoader {
  if (!instance) {
    instance = new TierMetadataLoader();
  }
  return instance;
} 