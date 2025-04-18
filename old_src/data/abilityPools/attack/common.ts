/**
 * Ability Pool for ATTACK role - Common Tier (Tier 1)
 *
 * This file defines the ability pools for Common ATTACK creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Common ATTACK creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Quick Strike",
    description: "Deals 15% max HP damage to one enemy",
    cooldown: 8,
    category: 'primary'
  },
  {
    name: "Heavy Strike",
    description: "Deals 20% max HP damage to one enemy",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Swift Thrust",
    description: "Deals 18% max HP damage to one enemy",
    cooldown: 8,
    category: 'primary'
  },
  {
    name: "Frenzy Strike",
    description: "Deals 15-25% max HP damage based on missing health",
    cooldown: 10,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Flurry",
    description: "Deals 5% max HP damage three times to one enemy",
    cooldown: 12,
    category: 'secondary'
  },
  {
    name: "Slam",
    description: "Deals 15% max HP damage and pushes enemy back",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Feint Strike",
    description: "Deals 12% max HP damage to one enemy",
    cooldown: 10,
    category: 'secondary'
  },
  {
    name: "Blood Rage",
    description: "+15% attack speed for 5s, costs 5% HP",
    cooldown: 20,
    trigger: "Manual activation",
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Combat Focus",
    description: "+10% damage for 5s",
    cooldown: 20,
    category: 'unique'
  },
  {
    name: "Toughness",
    description: "+10% defense for 5s",
    cooldown: 20,
    category: 'unique'
  },
  {
    name: "Parrying Stance",
    description: "+10% evasion for 5s",
    cooldown: 20,
    category: 'unique'
  },
  {
    name: "Battle Fury",
    description: "+10% damage when HP < 50%",
    cooldown: 25,
    trigger: "When HP < 50%",
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Trip",
    description: "Knocks down one enemy for 1s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Stun",
    description: "Stuns one enemy for 2s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Minor Disarm",
    description: "Disarms one enemy for 2s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Intimidate",
    description: "Fears one enemy for 2s",
    cooldown: 25,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Aggressive Stance",
    description: "Increases damage output of formation."
  },
  {
    name: "Brute Force",
    description: "Enhances melee damage."
  },
  {
    name: "Razor's Edge",
    description: "Particles form a tight, blade-like pattern, boosting precision and critical chance."
  },
  {
    name: "Chaotic Swarm",
    description: "Increases damage as formation breaks apart."
  }
];

// Complete Ability Pool for Common ATTACK
export const attackCommonPool = {
  tier: Tier.COMMON,
  role: Role.ATTACK,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default attackCommonPool;

