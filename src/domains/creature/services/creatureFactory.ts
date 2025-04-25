/**
 * Creature Factory
 *
 * This factory is responsible for creating creature instances with appropriate
 * defaults and validation.
 */

import { v4 as uuidv4 } from 'uuid';
import { Creature, CreatureGroup } from '../types/creature';
import { Role } from '../../../shared/types/core';
import type { Tier } from '../../../shared/types/core';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { getCreatureGenerator } from './creatureGenerator';
import { createRNGFromBlock } from '../../../shared/lib/rngSystem';
import { Subclass } from '../types/subclass';
// Import logging utility if needed in the future
// import { Logging } from '../../../shared/utils';

/**
 * Create a new creature
 * @param blockNumber The Bitcoin block number
 * @param blockData The Bitcoin block data
 * @returns A promise resolving to a new creature entity
 */
export async function createCreature(blockNumber: number, blockData: BlockData): Promise<Creature> {
  return await getCreatureGenerator().generateCreature({
    blockNumber,
    blockData
  });
}

/**
 * Create a new creature group
 * @param role The role of the group
 * @param particles The number of particles in the group
 * @param tier The tier of the group
 * @param blockData Optional block data for RNG
 * @returns A new creature group entity
 */
export function createCreatureGroup(role: Role, particles: number, tier: Tier, blockData?: BlockData): CreatureGroup {
  // Calculate attribute value based on particles and tier
  const attributeValue = calculateAttributeValue(particles, tier);

  // Get subclass
  let subclass: Subclass;
  if (blockData) {
    // Use RNG to select a subclass if block data is available
    const rngSystem = createRNGFromBlock(blockData);
    subclass = getSubclassForRole(role, tier, rngSystem.getStream('subclass'));
  } else {
    // Use default subclass if no block data is available
    subclass = {
      name: `Default ${role}`,
      tier: tier,
      bonuses: {
        attributeMultiplier: 1.0
      }
    };
  }

  return {
    id: uuidv4(),
    role,
    subclass,
    particles,
    attributeValue,
    mutations: []
  };
}

/**
 * Get a subclass for a specific role and tier
 * @param role The role
 * @param tier The tier
 * @param rngStream The RNG stream
 * @returns A subclass
 */
function getSubclassForRole(role: Role, tier: Tier, rngStream: any): Subclass {
  // This will be implemented when we migrate the subclass generator
  // For now, return a default subclass

  // TODO: Use rngStream to select a subclass when implemented
  // const randomValue = rngStream.next();

  return {
    name: `Default ${role}`,
    tier: tier,
    bonuses: {
      attributeMultiplier: 1.0 + ((Number(tier.replace('TIER_', '')) - 1) * 0.2)
    }
  };
}

/**
 * Calculate attribute value based on particles and tier
 * @param particles The number of particles
 * @param tier The tier
 * @returns The calculated attribute value
 */
function calculateAttributeValue(particles: number, tier: Tier): number {
  // Base value is particles * 5
  const baseValue = particles * 5;

  // Tier multiplier increases with tier
  // TIER_1 = 1.0, TIER_2 = 1.2, TIER_3 = 1.4, etc.
  const tierNumber = parseInt(tier.replace('TIER_', ''));
  const tierMultiplier = 1.0 + ((tierNumber - 1) * 0.2);

  // Calculate final value
  return Math.floor(baseValue * tierMultiplier);
}

/**
 * Create an empty creature structure
 * @param blockNumber The Bitcoin block number
 * @param blockData The Bitcoin block data
 * @returns An empty creature structure
 */
export function createEmptyCreature(blockNumber: number, blockData: BlockData): Creature {
  return {
    id: uuidv4(),
    blockNumber,
    blockData,
    groups: [],
    mutations: [],
    createdAt: Date.now(),
    lastUpdatedAt: Date.now()
  };
}

/**
 * Clone a creature
 * @param creature The creature to clone
 * @returns A deep clone of the creature
 */
export function cloneCreature(creature: Creature): Creature {
  // Create deep clone via JSON serialization/deserialization
  const clone = JSON.parse(JSON.stringify(creature));

  // Generate new IDs
  clone.id = uuidv4();

  // Update timestamps
  clone.createdAt = Date.now();
  clone.lastUpdatedAt = Date.now();

  // Generate new IDs for groups
  clone.groups = clone.groups.map((group: CreatureGroup) => ({
    ...group,
    id: uuidv4()
  }));

  return clone;
}

/**
 * Validate a creature
 * @param creature The creature to validate
 * @returns An array of validation errors, or empty array if valid
 */
export function validateCreature(creature: Creature): string[] {
  const errors: string[] = [];

  // Check required fields
  if (!creature.id) errors.push('Creature id is required');
  if (!creature.blockNumber) errors.push('Block number is required');
  if (!creature.blockData) errors.push('Block data is required');
  if (!creature.groups) errors.push('Creature groups are required');
  if (!Array.isArray(creature.groups)) errors.push('Creature groups must be an array');

  // Check timestamps
  if (!creature.createdAt) errors.push('Created timestamp is required');
  if (!creature.lastUpdatedAt) errors.push('Last updated timestamp is required');

  // Validate each group
  if (creature.groups && Array.isArray(creature.groups)) {
    creature.groups.forEach((group, index) => {
      if (!group.id) errors.push(`Group ${index} id is required`);
      if (!group.role) errors.push(`Group ${index} role is required`);
      if (!group.particles) errors.push(`Group ${index} particles are required`);
      if (!group.attributeValue) errors.push(`Group ${index} attribute value is required`);
    });
  }

  return errors;
}
