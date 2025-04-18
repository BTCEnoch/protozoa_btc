/**
 * Ability Pool for DEFENSE role - Rare Tier (Tier 3)
 *
 * This file defines the ability pools for Rare DEFENSE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Rare DEFENSE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Superior Shield Bash",
    description: "Deals 20% max HP damage and reduces target's damage by 20% for 5s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Superior Defensive Strike",
    description: "Deals 25% max HP damage and increases your defense by 20% for 5s",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Superior Taunt",
    description: "Forces target to attack you for 5s, reduces damage taken from them by 25%, and increases your damage against them by 15%",
    cooldown: 15,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Superior Protective Barrier",
    description: "Creates a shield that absorbs 40% max HP damage and lasts for 8s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Superior Fortify",
    description: "Increases defense by 40% for 8s and reduces crowd control duration by 20%",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Superior Deflection",
    description: "35% chance to block attacks for 8s and reflects 10% of blocked damage back to attackers",
    cooldown: 30,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Superior Unbreakable",
    description: "Reduces damage taken by 45% for 8s and heals for 5% max HP per second",
    cooldown: 35,
    category: 'unique'
  },
  {
    name: "Superior Last Stand",
    description: "When below 30% HP, increases defense by 50% for 8s and heals for 20% max HP",
    cooldown: 40,
    trigger: "When HP < 30%",
    category: 'unique'
  },
  {
    name: "Superior Retribution",
    description: "Reflects 20% of damage taken back to attacker for 12s and increases your damage by 15%",
    cooldown: 30,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Superior Ground Slam",
    description: "Stuns all enemies in close range for 2.5s and reduces their defense by 15% for 4s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Superior Intimidate",
    description: "Reduces nearby enemies' attack speed by 25% for 6s and their damage by 15% for 4s",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Superior Disrupt",
    description: "Interrupts one enemy's ability cast, prevents ability usage for 3s, and reduces their ability power by 20% for 5s",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Superior Defensive Formation",
    description: "Reduces damage taken by 12% and has a 5% chance to completely block attacks."
  },
  {
    name: "Superior Bulwark Stance",
    description: "Increases maximum health by 12% and reduces crowd control duration by 10%."
  },
  {
    name: "Superior Protective Aura",
    description: "Nearby allies take 8% less damage and have 5% increased maximum health."
  }
];

// Complete Ability Pool for Rare DEFENSE
export const defenseRarePool = {
  tier: Tier.RARE,
  role: Role.DEFENSE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default defenseRarePool;

