/**
 * Ability Pools Index
 *
 * This file exports all ability pools for easy access.
 */

import { attackCommonPool } from './attackCommon';
import { attackUncommonPool } from './attackUncommon';
import { Tier, Role } from '../../types/abilities/ability';

// Map to store all ability pools by role and tier
const abilityPools = {
  [Role.ATTACK]: {
    [Tier.COMMON]: attackCommonPool,
    [Tier.UNCOMMON]: attackUncommonPool,
    // Higher tiers use predefined subclasses
  },
  // Other roles will be added as they are implemented
};

/**
 * Get an ability pool for a specific role and tier
 * @param role The role (CORE, ATTACK, etc.)
 * @param tier The tier (Common, Uncommon)
 * @returns The ability pool for the specified role and tier
 */
function getAbilityPool(role: Role, tier: Tier) {
  if (!abilityPools[role] || !abilityPools[role][tier]) {
    throw new Error(`No ability pool found for ${Role[role]}, Tier ${Tier[tier]}`);
  }

  return abilityPools[role][tier];
}

export { getAbilityPool };

