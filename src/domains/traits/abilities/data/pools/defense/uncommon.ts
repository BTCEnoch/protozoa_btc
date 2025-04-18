/**
 * Ability Pool for DEFENSE role - Uncommon Tier (Tier 2)
 *
 * This file defines the ability pools for Uncommon DEFENSE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Uncommon DEFENSE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Enhanced Shield Bash",
    description: "Deals 15% max HP damage and reduces target's damage by 15% for 4s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Enhanced Defensive Strike",
    description: "Deals 18% max HP damage and increases your defense by 15% for 4s",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Enhanced Taunt",
    description: "Forces target to attack you for 4s and reduces damage taken from them by 20%",
    cooldown: 15,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Enhanced Protective Barrier",
    description: "Creates a shield that absorbs 30% max HP damage",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Enhanced Fortify",
    description: "Increases defense by 30% for 6s",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Enhanced Deflection",
    description: "25% chance to block attacks for 6s",
    cooldown: 30,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Enhanced Unbreakable",
    description: "Reduces damage taken by 35% for 6s",
    cooldown: 35,
    category: 'unique'
  },
  {
    name: "Enhanced Last Stand",
    description: "When below 30% HP, increases defense by 40% for 6s",
    cooldown: 40,
    trigger: "When HP < 30%",
    category: 'unique'
  },
  {
    name: "Enhanced Retribution",
    description: "Reflects 15% of damage taken back to attacker for 10s",
    cooldown: 30,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Enhanced Ground Slam",
    description: "Stuns all enemies in close range for 2s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Enhanced Intimidate",
    description: "Reduces nearby enemies' attack speed by 20% for 5s",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Enhanced Disrupt",
    description: "Interrupts one enemy's ability cast and prevents ability usage for 2s",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Enhanced Defensive Formation",
    description: "Reduces damage taken by 8%."
  },
  {
    name: "Enhanced Bulwark Stance",
    description: "Increases maximum health by 8%."
  },
  {
    name: "Enhanced Protective Aura",
    description: "Nearby allies take 5% less damage."
  }
];

// Complete Ability Pool for Uncommon DEFENSE
export const defenseUncommonPool = {
  tier: Tier.UNCOMMON,
  role: Role.DEFENSE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default defenseUncommonPool;

