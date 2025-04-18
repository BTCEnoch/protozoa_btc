/**
 * Subclass Types for Bitcoin Protozoa
 *
 * This file defines the types for creature subclasses.
 */

import { Role, Tier } from '../../types/core';

/**
 * Subclass interface
 * Represents a specialization of a particle group
 */
export interface Subclass {
  name: string;
  tier?: Tier; // Added tier property which may be set at runtime
  bonuses: {
    attributeMultiplier: number;
    [key: string]: number; // Additional bonuses specific to each subclass
  };
}

/**
 * Subclass collection by role and tier
 */
export interface SubclassCollection {
  roles: {
    [key in Role]: {
      [key in Tier]?: Subclass[];
    }
  }
}

/**
 * Get subclass by role and tier
 * @param collection The subclass collection
 * @param role The role to get subclasses for
 * @param tier The tier to get subclasses for
 * @returns Array of subclasses for the specified role and tier
 */
export function getSubclassesByRoleAndTier(
  collection: SubclassCollection,
  role: Role,
  tier: Tier
): Subclass[] {
  return collection.roles[role]?.[tier] || [];
}

/**
 * Get a random subclass for role and tier
 * @param collection The subclass collection
 * @param role The role to get a subclass for
 * @param tier The tier to get a subclass for
 * @returns A random subclass for the specified role and tier, or undefined if none available
 */
export function getRandomSubclass(
  collection: SubclassCollection,
  role: Role,
  tier: Tier
): Subclass | undefined {
  const subclasses = getSubclassesByRoleAndTier(collection, role, tier);
  if (subclasses.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * subclasses.length);
  const subclass = subclasses[randomIndex];
  
  // Assign the tier to the subclass when selected
  return {
    ...subclass,
    tier
  };
}
