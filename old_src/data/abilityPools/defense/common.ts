/**
 * Ability Pool for DEFENSE role - Common Tier (Tier 1)
 *
 * This file defines the ability pools for Common DEFENSE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Common DEFENSE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Shield Bash",
    description: "Deals 10% max HP damage and reduces target's damage by 10% for 3s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Defensive Strike",
    description: "Deals 12% max HP damage and increases your defense by 10% for 3s",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Taunt",
    description: "Forces target to attack you for 3s and reduces damage taken from them by 15%",
    cooldown: 15,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Protective Barrier",
    description: "Creates a shield that absorbs 20% max HP damage",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Fortify",
    description: "Increases defense by 20% for 5s",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Deflection",
    description: "15% chance to block attacks for 5s",
    cooldown: 30,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Unbreakable",
    description: "Reduces damage taken by 25% for 5s",
    cooldown: 35,
    category: 'unique'
  },
  {
    name: "Last Stand",
    description: "When below 30% HP, increases defense by 30% for 5s",
    cooldown: 40,
    trigger: "When HP < 30%",
    category: 'unique'
  },
  {
    name: "Retribution",
    description: "Reflects 10% of damage taken back to attacker for 8s",
    cooldown: 30,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Ground Slam",
    description: "Stuns all enemies in close range for 1.5s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Intimidate",
    description: "Reduces nearby enemies' attack speed by 15% for 4s",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Disrupt",
    description: "Interrupts one enemy's ability cast",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Defensive Formation",
    description: "Reduces damage taken by 5%."
  },
  {
    name: "Bulwark Stance",
    description: "Increases maximum health by 5%."
  },
  {
    name: "Protective Aura",
    description: "Nearby allies take 3% less damage."
  }
];

// Complete Ability Pool for Common DEFENSE
export const defenseCommonPool = {
  tier: Tier.COMMON,
  role: Role.DEFENSE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default defenseCommonPool;

