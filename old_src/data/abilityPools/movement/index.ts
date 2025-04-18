/**
 * Movement Role Ability Pools Index
 *
 * This file exports all ability pools for the MOVEMENT role.
 */

import movementCommonPool from './common';
import movementUncommonPool from './uncommon';
import movementRarePool from './rare';
import movementEpicPool from './epic';
import movementLegendaryPool from './legendary';
import movementMythicPool from './mythic';
import { Tier } from '../../../types/abilities/ability';

// Map to store all ability pools for the MOVEMENT role by tier
export const movementAbilityPools = {
  [Tier.COMMON]: movementCommonPool,
  [Tier.UNCOMMON]: movementUncommonPool,
  [Tier.RARE]: movementRarePool,
  [Tier.EPIC]: movementEpicPool,
  [Tier.LEGENDARY]: movementLegendaryPool,
  [Tier.MYTHIC]: movementMythicPool
};

export {
  movementCommonPool,
  movementUncommonPool,
  movementRarePool,
  movementEpicPool,
  movementLegendaryPool,
  movementMythicPool
};

export default movementAbilityPools;

