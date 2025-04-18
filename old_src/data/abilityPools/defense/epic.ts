/**
 * Ability Pool for DEFENSE role - Epic Tier (Tier 4)
 *
 * This file defines the ability pools for Epic DEFENSE creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Epic DEFENSE creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Magnificent Shield Bash",
    description: "Deals 30% max HP damage, reduces target's damage by 30% for 6s, and stuns them for 1.5s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Magnificent Defensive Strike",
    description: "Deals 35% max HP damage, increases your defense by 30% for 6s, and heals for 10% max HP",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Magnificent Taunt",
    description: "Forces target to attack you for 6s, reduces damage taken from them by 35%, increases your damage against them by 25%, and heals for 5% max HP per second while active",
    cooldown: 15,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Magnificent Protective Barrier",
    description: "Creates a shield that absorbs 60% max HP damage, lasts for 10s, and reflects 15% of damage back to attackers",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Magnificent Fortify",
    description: "Increases defense by 50% for 10s, reduces crowd control duration by 30%, and grants immunity to the next crowd control effect",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Magnificent Deflection",
    description: "50% chance to block attacks for 10s, reflects 20% of blocked damage back to attackers, and increases your damage by 20% for 6s",
    cooldown: 30,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Magnificent Unbreakable",
    description: "Reduces damage taken by 60% for 10s, heals for 8% max HP per second, and cleanses all negative effects",
    cooldown: 35,
    category: 'unique'
  },
  {
    name: "Magnificent Last Stand",
    description: "When below 30% HP, increases defense by 70% for 10s, heals for 30% max HP, and becomes immune to crowd control effects for 5s",
    cooldown: 40,
    trigger: "When HP < 30%",
    category: 'unique'
  },
  {
    name: "Magnificent Retribution",
    description: "Reflects 30% of damage taken back to attacker for 15s, increases your damage by 25%, and has a 10% chance to stun attackers for 1s",
    cooldown: 30,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Magnificent Ground Slam",
    description: "Stuns all enemies in close range for 3s, reduces their defense by 25% for 5s, and deals 15% max HP damage",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Intimidate",
    description: "Reduces nearby enemies' attack speed by 35% for 8s, their damage by 25% for 6s, and forces them to attack you for 3s",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Disrupt",
    description: "Interrupts one enemy's ability cast, prevents ability usage for 4s, reduces their ability power by 30% for 6s, and silences them for 2s",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Magnificent Defensive Formation",
    description: "Reduces damage taken by 18%, has a 10% chance to completely block attacks, and heals for 1% max HP per second."
  },
  {
    name: "Magnificent Bulwark Stance",
    description: "Increases maximum health by 18%, reduces crowd control duration by 20%, and has a 10% chance to reflect crowd control effects back to the caster."
  },
  {
    name: "Magnificent Protective Aura",
    description: "Nearby allies take 12% less damage, have 10% increased maximum health, and regenerate 1% max HP per second."
  }
];

// Complete Ability Pool for Epic DEFENSE
export const defenseEpicPool = {
  tier: Tier.EPIC,
  role: Role.DEFENSE,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default defenseEpicPool;

