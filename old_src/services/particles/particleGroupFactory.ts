/**
 * Particle Group Factory for Bitcoin Protozoa
 *
 * This factory is responsible for creating particle groups with appropriate traits and abilities.
 * It ensures deterministic group creation based on Bitcoin block data.
 */

import { Role, Tier } from '../../types/core';
import { ParticleGroup, ParticleGroupCreationOptions } from '../../types/particles/particle';
import { RNGSystem } from '../../types/utils/rng';
import { BlockData } from '../../types/bitcoin/bitcoin';
import { createRNGFromBlockNonce } from '../../lib/rngSystem';
import { createParticleGroup, determineTierFromAttributeValue } from '../../lib/particleSystem';
import { TraitCollection } from '../../types/traits/trait';
import { getTraitService } from '../traits/index';
import { getAbilityFactory } from '../abilities/index';
import { getBehaviorService } from '../behaviors/index';
import { getFormationService } from '../formations/index';
import { SubclassData } from '../../types/abilities/ability_reference';

/**
 * Particle Group Factory class
 * Creates particle groups with appropriate traits and abilities
 */
class ParticleGroupFactory {
  private static instance: ParticleGroupFactory | null = null;
  private rngSystem: RNGSystem | null = null;
  private blockData: BlockData | null = null;
  private initialized = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): ParticleGroupFactory {
    if (!ParticleGroupFactory.instance) {
      ParticleGroupFactory.instance = new ParticleGroupFactory();
    }
    return ParticleGroupFactory.instance;
  }

  /**
   * Initialize the factory with block data
   * @param blockData Bitcoin block data
   */
  public initialize(blockData: BlockData): void {
    if (this.initialized) {
      console.warn('Particle Group Factory already initialized');
      return;
    }

    this.blockData = blockData;
    this.rngSystem = createRNGFromBlockNonce(blockData.nonce);

    // Initialize dependent services
    getTraitService().initialize(blockData);
    getAbilityFactory().initialize(this.rngSystem);
    getBehaviorService().initialize(blockData);
    getFormationService().initialize(blockData);

    this.initialized = true;
    console.log('Particle Group Factory initialized');
  }

  /**
   * Create a particle group
   * @param options Particle group creation options
   * @returns A new particle group
   */
  public createGroup(options: ParticleGroupCreationOptions): ParticleGroup {
    if (!this.initialized || !this.rngSystem || !this.blockData) {
      throw new Error('Particle Group Factory not initialized');
    }

    // Create RNG stream for this group
    const groupRng = this.rngSystem.getStream(`group-${options.role}-${options.index}`);

    // Get traits for this group
    const traits = this.getTraitsForGroup(options);

    // Calculate base attribute value
    const baseAttributeValue = this.calculateBaseAttributeValue(options);

    // Determine tier based on attribute value
    const tier = determineTierFromAttributeValue(baseAttributeValue);

    // Get subclass for this group
    const subclass = this.getSubclassForGroup(options.role, tier, options.index);

    // Create the particle group
    const group = createParticleGroup(options, this.rngSystem, subclass, traits);

    // Apply formation to the group
    this.applyFormationToGroup(group);

    // Apply behavior to the group
    this.applyBehaviorToGroup(group);

    return group;
  }

  /**
   * Get traits for a particle group
   * @param options Particle group creation options
   * @returns Trait collection for the group
   */
  private getTraitsForGroup(options: ParticleGroupCreationOptions): TraitCollection {
    // Use forced traits if provided
    if (options.forcedTraits) {
      return {
        ...getTraitService().createTraitCollection(options.role),
        ...options.forcedTraits
      };
    }

    // Otherwise, create traits based on role
    return getTraitService().createTraitCollection(options.role);
  }

  /**
   * Calculate base attribute value for a group
   * @param options Particle group creation options
   * @returns Base attribute value
   */
  private calculateBaseAttributeValue(options: ParticleGroupCreationOptions): number {
    // Use nonce and index to create a deterministic base value
    const baseValue = (options.nonce % 1000) + (options.index * 100);

    // Adjust based on role
    const roleMultiplier = this.getRoleMultiplier(options.role);

    // Adjust based on count
    const countMultiplier = Math.log10(options.count) * 100;

    return Math.floor(baseValue * roleMultiplier + countMultiplier);
  }

  /**
   * Get role-specific multiplier for attribute calculation
   * @param role Particle role
   * @returns Role multiplier
   */
  private getRoleMultiplier(role: Role): number {
    switch (role) {
      case Role.CORE:
        return 1.2;
      case Role.CONTROL:
        return 1.1;
      case Role.MOVEMENT:
        return 1.0;
      case Role.DEFENSE:
        return 1.3;
      case Role.ATTACK:
        return 1.4;
      default:
        return 1.0;
    }
  }

  /**
   * Get subclass for a group
   * @param role Particle role
   * @param tier Particle tier
   * @param index Group index
   * @returns Subclass data
   */
  private getSubclassForGroup(role: Role, tier: Tier, index: number): SubclassData {
    if (!this.rngSystem) {
      throw new Error('RNG system not initialized');
    }

    // Create RNG stream for subclass selection
    const subclassRng = this.rngSystem.getStream(`subclass-${role}-${tier}-${index}`);

    // For lower tiers (Common, Uncommon), use dynamic subclasses
    if (tier <= Tier.UNCOMMON) {
      // Get abilities for this role and tier
      const abilities = getAbilityFactory().createAbilities(role, tier);

      return {
        id: `${role.toLowerCase()}_${tier.toLowerCase()}_${index}`,
        name: `${role} ${tier} Subclass ${index}`,
        tier: tier,
        description: `A ${tier.toLowerCase()} tier subclass for ${role.toLowerCase()} particles.`,
        abilities: {
          primary: abilities.primary,
          secondary: abilities.secondary,
          unique: abilities.unique,
          crowdControl: abilities.crowdControl,
          formationTrait: abilities.formationTrait
        }
      };
    }

    // For higher tiers (Rare+), use predefined subclasses
    // In a real implementation, we would have a subclass registry
    // For now, we'll create a subclass with a name based on the role and tier
    const subclassNames = [
      'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon',
      'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
      'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron'
    ];

    const subclassIndex = Math.floor(subclassRng.next() * subclassNames.length);
    const subclassName = subclassNames[subclassIndex];

    // Get abilities for this role, tier, and subclass
    const abilities = getAbilityFactory().createAbilities(role, tier, subclassName);

    return {
      id: `${role.toLowerCase()}_${subclassName.toLowerCase()}_${tier.toLowerCase()}`,
      name: `${subclassName} ${role}`,
      tier: tier,
      description: `A ${tier.toLowerCase()} tier ${subclassName} subclass for ${role.toLowerCase()} particles.`,
      abilities: {
        primary: abilities.primary,
        secondary: abilities.secondary,
        unique: abilities.unique,
        crowdControl: abilities.crowdControl,
        formationTrait: abilities.formationTrait
      }
    };
  }

  /**
   * Apply formation to a particle group
   * @param group Particle group
   */
  private applyFormationToGroup(group: ParticleGroup): void {
    // Get formation positions for this group
    const positions = getFormationService().generatePositionsForRole(group.role, group.count);

    // Apply positions to particles
    for (let i = 0; i < Math.min(group.particles.length, positions.length); i++) {
      group.particles[i].targetPosition = positions[i];
    }
  }

  /**
   * Apply behavior to a particle group
   * @param group Particle group
   */
  private applyBehaviorToGroup(group: ParticleGroup): void {
    // In a real implementation, we would apply behavior traits to the group
    // For now, we'll just log that we're applying behavior
    console.log(`Applying behavior to group ${group.id}`);
  }

  /**
   * Reset the factory
   */
  public reset(): void {
    this.rngSystem = null;
    this.blockData = null;
    this.initialized = false;
  }
}

/**
 * Get the particle group factory instance
 * @returns The particle group factory instance
 */
export function getParticleGroupFactory(): ParticleGroupFactory {
  return ParticleGroupFactory.getInstance();
}

