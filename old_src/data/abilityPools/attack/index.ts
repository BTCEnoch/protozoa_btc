/**
 * Attack Role Ability Pools Index
 *
 * This file exports all ability pools for the ATTACK role.
 */

import attackCommonPool from './common';
import attackUncommonPool from './uncommon';
import attackRarePool from './rare';
import attackEpicPool from './epic';
import attackLegendaryPool from './legendary';
import attackMythicPool from './mythic';
import { Tier } from '../../../types/abilities/ability';

// Map to store all ability pools for the ATTACK role by tier
export const attackAbilityPools = {
  [Tier.COMMON]: attackCommonPool,
  [Tier.UNCOMMON]: attackUncommonPool,
  [Tier.RARE]: attackRarePool,
  [Tier.EPIC]: attackEpicPool,
  [Tier.LEGENDARY]: attackLegendaryPool,
  [Tier.MYTHIC]: attackMythicPool
};

export {
  attackCommonPool,
  attackUncommonPool,
  attackRarePool,
  attackEpicPool,
  attackLegendaryPool,
  attackMythicPool
};

export default attackAbilityPools;

