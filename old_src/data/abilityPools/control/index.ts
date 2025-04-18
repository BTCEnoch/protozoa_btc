/**
 * Control Role Ability Pools Index
 *
 * This file exports all ability pools for the CONTROL role.
 */

import controlCommonPool from './common';
import controlUncommonPool from './uncommon';
import controlRarePool from './rare';
import controlEpicPool from './epic';
import controlLegendaryPool from './legendary';
import controlMythicPool from './mythic';
import { Tier } from '../../../types/abilities/ability';

// Map to store all ability pools for the CONTROL role by tier
export const controlAbilityPools = {
  [Tier.COMMON]: controlCommonPool,
  [Tier.UNCOMMON]: controlUncommonPool,
  [Tier.RARE]: controlRarePool,
  [Tier.EPIC]: controlEpicPool,
  [Tier.LEGENDARY]: controlLegendaryPool,
  [Tier.MYTHIC]: controlMythicPool
};

export {
  controlCommonPool,
  controlUncommonPool,
  controlRarePool,
  controlEpicPool,
  controlLegendaryPool,
  controlMythicPool
};

export default controlAbilityPools;

