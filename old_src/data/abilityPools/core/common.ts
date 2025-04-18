/**
 * Ability Pool for CORE role - Common Tier (Tier 1)
 *
 * This file defines the ability pools for Common CORE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Common CORE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Vital Pulse",
    description: "Heals self for 15% max HP",
    cooldown: 15,
    category: 'primary'
  },
  {
    name: "Energy Shield",
    description: "Reduces damage taken by 20% for 5s",
    cooldown: 20,
    category: 'primary'
  },
  {
    name: "Rejuvenation",
    description: "Heals self for 10% max HP over 5s",
    cooldown: 18,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Vitality Aura",
    description: "Heals all allies for 5% max HP",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Protective Barrier",
    description: "Creates a barrier that absorbs 15% max HP damage",
    cooldown: 30,
    category: 'secondary'
  },
  {
    name: "Energy Boost",
    description: "Reduces all ability cooldowns by 2s",
    cooldown: 35,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Vital Surge",
    description: "+10% max HP for 10s",
    cooldown: 40,
    category: 'unique'
  },
  {
    name: "Endurance",
    description: "+15% damage reduction for 8s",
    cooldown: 35,
    category: 'unique'
  },
  {
    name: "Life Link",
    description: "Links with an ally, sharing 15% of damage taken",
    cooldown: 45,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Repulse",
    description: "Pushes all enemies away from self",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Gravity Well",
    description: "Slows all enemies in an area by 20% for 3s",
    cooldown: 35,
    category: 'crowdControl'
  },
  {
    name: "Energy Drain",
    description: "Reduces one enemy's attack speed by 15% for 5s",
    cooldown: 30,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Vital Core",
    description: "Enhances healing received by 10%."
  },
  {
    name: "Protective Shell",
    description: "Reduces damage taken by 5%."
  },
  {
    name: "Energy Nexus",
    description: "Reduces ability cooldowns by 5%."
  }
];

// Complete Ability Pool for Common CORE
export const coreCommonPool = {
  tier: Tier.COMMON,
  role: Role.CORE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default coreCommonPool;

