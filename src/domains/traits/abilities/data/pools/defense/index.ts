/**
 * Defense Role Ability Pools Index
 *
 * This file exports all ability pools for the DEFENSE role.
 */

import defenseCommonPool from './common';
import defenseUncommonPool from './uncommon';
import defenseRarePool from './rare';
import defenseEpicPool from './epic';
import defenseLegendaryPool from './legendary';
import defenseMythicPool from './mythic';
import { Tier } from '../../../types/abilities/ability';

// Map to store all ability pools for the DEFENSE role by tier
export const defenseAbilityPools = {
  [Tier.COMMON]: defenseCommonPool,
  [Tier.UNCOMMON]: defenseUncommonPool,
  [Tier.RARE]: defenseRarePool,
  [Tier.EPIC]: defenseEpicPool,
  [Tier.LEGENDARY]: defenseLegendaryPool,
  [Tier.MYTHIC]: defenseMythicPool
};

export {
  defenseCommonPool,
  defenseUncommonPool,
  defenseRarePool,
  defenseEpicPool,
  defenseLegendaryPool,
  defenseMythicPool
};

export default defenseAbilityPools;

