/**
 * Ability Pool for CORE role - Rare Tier (Tier 3)
 *
 * This file defines the ability pools for Rare CORE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Rare CORE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Superior Healing",
    description: "Heals self for 35% max HP",
    cooldown: 15,
    category: 'primary'
  },
  {
    name: "Advanced Shield",
    description: "Reduces damage taken by 40% for 6s",
    cooldown: 20,
    category: 'primary'
  },
  {
    name: "Accelerated Regeneration",
    description: "Heals self for 30% max HP over 5s",
    cooldown: 18,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Healing Surge",
    description: "Heals all allies for 15% max HP",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Superior Barrier",
    description: "Creates a barrier that absorbs 35% max HP damage",
    cooldown: 30,
    category: 'secondary'
  },
  {
    name: "Energy Infusion",
    description: "Reduces all ability cooldowns by 5s and increases energy regeneration by 20% for 5s",
    cooldown: 40,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Superior Vitality",
    description: "+25% max HP for 12s",
    cooldown: 45,
    category: 'unique'
  },
  {
    name: "Superior Endurance",
    description: "+30% damage reduction for 10s",
    cooldown: 40,
    category: 'unique'
  },
  {
    name: "Superior Life Link",
    description: "Links with an ally, sharing 25% of damage taken and healing both for 5% max HP every 2s",
    cooldown: 50,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Superior Repulse",
    description: "Pushes all enemies away from self with greater force and stuns them for 1s",
    cooldown: 35,
    category: 'crowdControl'
  },
  {
    name: "Superior Gravity Well",
    description: "Slows all enemies in an area by 40% for 4s",
    cooldown: 40,
    category: 'crowdControl'
  },
  {
    name: "Superior Energy Drain",
    description: "Reduces one enemy's attack and movement speed by 30% for 6s",
    cooldown: 35,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Superior Vital Core",
    description: "Enhances healing received by 20% and increases max HP by 10%."
  },
  {
    name: "Superior Protective Shell",
    description: "Reduces damage taken by 12% and reflects 5% damage back to attackers."
  },
  {
    name: "Superior Energy Nexus",
    description: "Reduces ability cooldowns by 12% and increases energy regeneration by 10%."
  }
];

// Complete Ability Pool for Rare CORE
export const coreRarePool = {
  tier: Tier.RARE,
  role: Role.CORE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default coreRarePool;

