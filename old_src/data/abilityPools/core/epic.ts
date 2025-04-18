/**
 * Ability Pool for CORE role - Epic Tier (Tier 4)
 *
 * This file defines the ability pools for Epic CORE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Epic CORE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Magnificent Healing",
    description: "Heals self for 50% max HP",
    cooldown: 15,
    category: 'primary'
  },
  {
    name: "Magnificent Shield",
    description: "Reduces damage taken by 50% for 8s",
    cooldown: 25,
    category: 'primary'
  },
  {
    name: "Magnificent Regeneration",
    description: "Heals self for 40% max HP over 5s and cleanses all negative effects",
    cooldown: 20,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Magnificent Healing Wave",
    description: "Heals all allies for 25% max HP and increases their healing received by 20% for 5s",
    cooldown: 30,
    category: 'secondary'
  },
  {
    name: "Magnificent Barrier",
    description: "Creates a barrier that absorbs 50% max HP damage and reflects 10% damage back to attackers",
    cooldown: 35,
    category: 'secondary'
  },
  {
    name: "Magnificent Energy Infusion",
    description: "Reduces all ability cooldowns by 8s and increases energy regeneration by 30% for 8s",
    cooldown: 45,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Magnificent Vitality",
    description: "+40% max HP for 15s and regenerates 2% max HP per second",
    cooldown: 50,
    category: 'unique'
  },
  {
    name: "Magnificent Endurance",
    description: "+40% damage reduction for 12s and immunity to crowd control effects",
    cooldown: 45,
    category: 'unique'
  },
  {
    name: "Magnificent Life Link",
    description: "Links with all allies, sharing 30% of damage taken and healing all for 8% max HP every 2s",
    cooldown: 60,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Magnificent Repulse",
    description: "Pushes all enemies away from self with tremendous force, stuns them for 2s, and reduces their damage by 20% for 4s",
    cooldown: 40,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Gravity Well",
    description: "Slows all enemies in a large area by 50% for 5s and pulls them toward the center",
    cooldown: 45,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Energy Drain",
    description: "Reduces one enemy's attack and movement speed by 40% for 8s and silences them for 2s",
    cooldown: 40,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Magnificent Vital Core",
    description: "Enhances healing received by 30%, increases max HP by 15%, and regenerates 1% max HP per second."
  },
  {
    name: "Magnificent Protective Shell",
    description: "Reduces damage taken by 20%, reflects 10% damage back to attackers, and has a 10% chance to completely block attacks."
  },
  {
    name: "Magnificent Energy Nexus",
    description: "Reduces ability cooldowns by 20%, increases energy regeneration by 20%, and has a 10% chance to reset an ability's cooldown when used."
  }
];

// Complete Ability Pool for Epic CORE
export const coreEpicPool = {
  tier: Tier.EPIC,
  role: Role.CORE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default coreEpicPool;

