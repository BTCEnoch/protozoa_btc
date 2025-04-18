/**
 * Core Role Ability Pools Index
 *
 * This file exports all ability pools for the CORE role.
 */

import coreCommonPool from './common';
import coreUncommonPool from './uncommon';
import coreRarePool from './rare';
import coreEpicPool from './epic';
import coreLegendaryPool from './legendary';
import coreMythicPool from './mythic';
import { Tier } from '../../../types/abilities/ability';

// Map to store all ability pools for the CORE role by tier
export const coreAbilityPools = {
  [Tier.COMMON]: coreCommonPool,
  [Tier.UNCOMMON]: coreUncommonPool,
  [Tier.RARE]: coreRarePool,
  [Tier.EPIC]: coreEpicPool,
  [Tier.LEGENDARY]: coreLegendaryPool,
  [Tier.MYTHIC]: coreMythicPool
};

export {
  coreCommonPool,
  coreUncommonPool,
  coreRarePool,
  coreEpicPool,
  coreLegendaryPool,
  coreMythicPool
};

export default coreAbilityPools;

