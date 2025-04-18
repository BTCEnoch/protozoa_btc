/**
 * Creature Generator Service
 *
 * This service is responsible for generating new creatures based on Bitcoin block data.
 * It uses the RNG system for deterministic creature generation and integrates
 * with the trait, formation, behavior, and ability services.
 */

import { v4 as uuidv4 } from 'uuid';
import { Role, Tier } from '../../types/core';
import { Creature, CreatureGroup, CreatureGenerationOptions } from '../../types/creatures/creature';
import { BlockData } from '../../services/bitcoin/bitcoinService';
import { createRNGFromBlock, RNGStream } from '../../lib/rngSystem';
import { getTraitService } from '../traits/traitService';
import { getFormationService } from '../formations/formationService';
import { getBehaviorService } from '../behaviors/behaviorService';
import { getAbilityService } from '../abilities/abilityService';
import { getSubclass } from './subclassGenerator';
import { Subclass } from '../../types/creatures/subclass';
import { getTierThresholdLoader, TierThresholds } from './tierThresholdLoader';

// Singleton instance
let instance: CreatureGenerator | null = null;

/**
 * Default particle distribution by role
 */
const DEFAULT_PARTICLE_DISTRIBUTION: Record<Role, number> = {
  [Role.CORE]: 20,      // 20% of particles are core
  [Role.CONTROL]: 15,   // 15% of particles are control
  [Role.ATTACK]: 25,    // 25% of particles are attack
  [Role.DEFENSE]: 20,   // 20% of particles are defense
  [Role.MOVEMENT]: 20   // 20% of particles are movement
};

/**
 * Min and max particles for a creature
 */
const MIN_PARTICLES = 50;
const MAX_PARTICLES = 250;

/**
 * Creature Generator class
 */
class CreatureGenerator {
  private initialized: boolean = false;
  private tierThresholds: TierThresholds | null = null;

  /**
   * Initialize services required for creature generation
   */
  async initialize(): Promise<void> {
    // Initialize dependent services if needed
    if (!getTraitService().isInitialized()) {
      console.warn('Trait service is not initialized. Some features may not work correctly.');
    }

    if (!getFormationService().isInitialized()) {
      console.warn('Formation service is not initialized. Some features may not work correctly.');
    }

    if (!getBehaviorService().isInitialized()) {
      console.warn('Behavior service is not initialized. Some features may not work correctly.');
    }

    if (!getAbilityService().isInitialized()) {
      console.warn('Ability service is not initialized. Some features may not work correctly.');
    }

    // Initialize subclass generator
    try {
      // Create a mock RNG stream for initialization
      const mockRngStream: RNGStream = {
        next: () => 0.5,
        nextInt: (min: number, _max: number) => min,
        nextBool: () => false,
        nextItem: <T>(items: T[]) => items[0],
        nextItems: <T>(items: T[], count: number) => items.slice(0, count),
        shuffle: <T>(items: T[]) => [...items],
        getStreamName: () => 'subclass'
      };

      // Try to get a subclass to initialize the generator
      getSubclass(Role.CORE, Tier.TIER_1, mockRngStream);
    } catch (error) {
      console.warn('Subclass generator is not initialized. Some features may not work correctly.');
    }

    // Initialize and get tier thresholds
    try {
      const tierThresholdLoader = getTierThresholdLoader();
      if (!tierThresholdLoader.isInitialized()) {
        tierThresholdLoader.initialize();
      }
      this.tierThresholds = tierThresholdLoader.getTierThresholds();
      console.log('Loaded tier thresholds successfully');
    } catch (error) {
      console.warn('Failed to load tier thresholds, using defaults:', error);
      // We'll handle this in determineTierFromParticles by checking for null
    }

    this.initialized = true;
  }

  /**
   * Generate a new creature from block data
   * @param options Creature generation options
   * @returns A new creature entity
   */
  async generateCreature(options: CreatureGenerationOptions): Promise<Creature> {
    if (!this.initialized) {
      await this.initialize();
    }

    const { blockNumber, blockData } = options;

    // Create RNG system for deterministic generation
    const rngSystem = createRNGFromBlock(blockData);
    const particleStream = rngSystem.getStream('particle');
    const traitStream = rngSystem.getStream('traits');

    // Determine total particle count (based on block data)
    const totalParticles = particleStream.nextInt(MIN_PARTICLES, MAX_PARTICLES);

    // Calculate particles per role based on distribution
    const particleDistribution = options.particleDistribution || DEFAULT_PARTICLE_DISTRIBUTION;
    const particlesByRole: Record<Role, number> = {} as Record<Role, number>;

    // First pass: calculate raw particles per role
    let allocatedParticles = 0;
    for (const role of Object.values(Role)) {
      const percentage = particleDistribution[role] || DEFAULT_PARTICLE_DISTRIBUTION[role];
      const particles = Math.floor(totalParticles * (percentage / 100));
      particlesByRole[role] = particles;
      allocatedParticles += particles;
    }

    // Distribute remaining particles due to rounding
    let remaining = totalParticles - allocatedParticles;
    while (remaining > 0) {
      const role = particleStream.nextItem(Object.values(Role));
      particlesByRole[role]++;
      remaining--;
    }

    // Create creature groups for each role
    const groups: CreatureGroup[] = [];
    for (const role of Object.values(Role)) {
      const particles = particlesByRole[role];
      if (particles > 0) {
        // Determine tier based on particle count
        const tier = this.determineTierFromParticles(particles);

        // Get traits for this role and tier
        const subclass = this.getSubclassForRole(role, tier, traitStream);

        // Calculate attribute value based on particles and tier
        const attributeValue = this.calculateAttributeValue(particles, tier);

        // Create creature group
        groups.push({
          id: uuidv4(),
          role,
          subclass,
          particles,
          attributeValue,
          mutations: []
        });
      }
    }

    // Create the creature entity
    const creature: Creature = {
      id: uuidv4(),
      blockNumber,
      blockData,
      groups,
      mutations: [],
      createdAt: Date.now(),
      lastUpdatedAt: Date.now()
    };

    return creature;
  }

  /**
   * Determine tier based on particle count
   * @param particles Number of particles
   * @returns The corresponding tier
   */
  private determineTierFromParticles(particles: number): Tier {
    if (this.tierThresholds) {
      return getTierThresholdLoader().getTierForParticleCount(particles);
    }
    
    // Default tier calculation if thresholds aren't available
    if (particles < 90) return Tier.TIER_1;
    if (particles < 120) return Tier.TIER_2;
    if (particles < 150) return Tier.TIER_3;
    if (particles < 180) return Tier.TIER_4;
    if (particles < 200) return Tier.TIER_5;
    return Tier.TIER_6;
  }

  /**
   * Get subclass for a specific role and tier
   * @param role The role to get subclass for
   * @param tier The tier level
   * @param rngStream The RNG stream for deterministic selection
   * @returns A subclass object
   */
  private getSubclassForRole(role: Role, tier: Tier, rngStream: RNGStream): Subclass {
    // Use the subclass generator to get a subclass
    try {
      return getSubclass(role, tier, rngStream);
    } catch (error) {
      console.warn(`Error getting subclass for ${role} ${tier}:`, error);

      // Fallback to a default subclass if the generator fails
      return {
        name: `Default ${role}`,
        tier: tier,
        bonuses: {
          attributeMultiplier: 1.0 + (Number(tier.replace('TIER_', '')) * 0.1)
        }
      };
    }
  }

  /**
   * Calculate attribute value based on particles and tier
   * @param particles Number of particles
   * @param tier The tier level
   * @returns Calculated attribute value
   */
  private calculateAttributeValue(particles: number, tier: Tier): number {
    // Base value is particles * 5
    const baseValue = particles * 5;

    // Tier multiplier increases with tier
    const tierNumber = Number(tier.replace('TIER_', ''));
    const tierMultiplier = 1.0 + (tierNumber * 0.2);

    return Math.floor(baseValue * tierMultiplier);
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Get the creature generator instance
 * @returns The creature generator singleton instance
 */
export function getCreatureGenerator(): CreatureGenerator {
  if (!instance) {
    instance = new CreatureGenerator();
  }
  return instance;
}
