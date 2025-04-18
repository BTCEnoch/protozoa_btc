/**
 * Creature Generator Service
 *
 * This service is responsible for generating new creatures based on Bitcoin block data.
 * It uses the RNG system for deterministic creature generation and integrates
 * with the trait, formation, behavior, and ability services.
 */

import { v4 as uuidv4 } from 'uuid';
import { Role, Tier } from '../../../shared/types/core';
import { Creature, CreatureGroup, CreatureGenerationOptions } from '../types/creature';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { createRNGFromBlock, RNGStream } from '../../../shared/lib/rngSystem';
import { Subclass } from '../types/subclass';
import { Logging } from '../../../shared/utils';

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
 * Tier thresholds interface
 */
interface TierThresholds {
  [key: string]: number;
}

/**
 * Creature Generator class
 */
export class CreatureGenerator {
  private initialized: boolean = false;
  private tierThresholds: TierThresholds | null = null;
  private logger = Logging.createLogger('CreatureGenerator');

  /**
   * Initialize services required for creature generation
   */
  async initialize(): Promise<void> {
    // Initialize dependent services if needed
    // These will be implemented when we migrate the respective services
    // For now, we'll just log warnings

    this.logger.info('Initializing creature generator');

    // Initialize tier thresholds
    try {
      this.tierThresholds = this.getDefaultTierThresholds();
      this.logger.info('Loaded tier thresholds successfully');
    } catch (error) {
      this.logger.warn('Failed to load tier thresholds, using defaults:', error);
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
      if (particles < this.tierThresholds.tier2) return Tier.TIER_1;
      if (particles < this.tierThresholds.tier3) return Tier.TIER_2;
      if (particles < this.tierThresholds.tier4) return Tier.TIER_3;
      if (particles < this.tierThresholds.tier5) return Tier.TIER_4;
      if (particles < this.tierThresholds.tier6) return Tier.TIER_5;
      return Tier.TIER_6;
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
    // This will be implemented when we migrate the subclass generator
    // For now, return a default subclass
    try {
      // Fallback to a default subclass
      return {
        name: `Default ${role}`,
        tier: tier,
        bonuses: {
          attributeMultiplier: 1.0 + (Number(tier.replace('TIER_', '')) * 0.1)
        }
      };
    } catch (error) {
      this.logger.warn(`Error getting subclass for ${role} ${tier}:`, error);

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
   * Get default tier thresholds
   * @returns Default tier thresholds
   */
  private getDefaultTierThresholds(): TierThresholds {
    return {
      tier1: 0,
      tier2: 90,
      tier3: 120,
      tier4: 150,
      tier5: 180,
      tier6: 200
    };
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
