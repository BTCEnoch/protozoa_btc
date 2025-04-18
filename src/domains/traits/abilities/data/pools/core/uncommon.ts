/**
 * Ability Pool for CORE role - Uncommon Tier (Tier 2)
 *
 * This file defines the ability pools for Uncommon CORE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Uncommon CORE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Enhanced Healing",
    description: "Heals self for 25% max HP",
    cooldown: 15,
    category: 'primary'
  },
  {
    name: "Reinforced Shield",
    description: "Reduces damage taken by 30% for 5s",
    cooldown: 20,
    category: 'primary'
  },
  {
    name: "Rapid Regeneration",
    description: "Heals self for 20% max HP over 5s",
    cooldown: 18,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Healing Wave",
    description: "Heals all allies for 10% max HP",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Enhanced Barrier",
    description: "Creates a barrier that absorbs 25% max HP damage",
    cooldown: 30,
    category: 'secondary'
  },
  {
    name: "Cooldown Reduction",
    description: "Reduces all ability cooldowns by 3s",
    cooldown: 35,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Vitality Boost",
    description: "+15% max HP for 10s",
    cooldown: 40,
    category: 'unique'
  },
  {
    name: "Enhanced Endurance",
    description: "+20% damage reduction for 8s",
    cooldown: 35,
    category: 'unique'
  },
  {
    name: "Improved Life Link",
    description: "Links with an ally, sharing 20% of damage taken",
    cooldown: 45,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Enhanced Repulse",
    description: "Pushes all enemies away from self with greater force",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Stronger Gravity Well",
    description: "Slows all enemies in an area by 30% for 3s",
    cooldown: 35,
    category: 'crowdControl'
  },
  {
    name: "Enhanced Energy Drain",
    description: "Reduces one enemy's attack speed by 25% for 5s",
    cooldown: 30,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Enhanced Vital Core",
    description: "Enhances healing received by 15%."
  },
  {
    name: "Improved Protective Shell",
    description: "Reduces damage taken by 8%."
  },
  {
    name: "Enhanced Energy Nexus",
    description: "Reduces ability cooldowns by 8%."
  }
];

// Complete Ability Pool for Uncommon CORE
export const coreUncommonPool = {
  tier: Tier.UNCOMMON,
  role: Role.CORE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default coreUncommonPool;

