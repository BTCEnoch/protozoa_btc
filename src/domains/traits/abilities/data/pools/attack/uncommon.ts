/**
 * Ability Pool for ATTACK role - Uncommon Tier (Tier 2)
 *
 * This file defines the ability pools for Uncommon ATTACK creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Uncommon ATTACK creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Precision Strike",
    description: "Deals 22% max HP damage to one enemy",
    cooldown: 8,
    category: 'primary'
  },
  {
    name: "Blade Dance",
    description: "Deals 25% max HP damage to one enemy",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Brutal Slash",
    description: "Deals 30% max HP damage to one enemy",
    cooldown: 12,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Riposte",
    description: "Deals 15% max HP damage and blocks next attack",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Whirlwind",
    description: "Deals 15% max HP damage to all enemies in melee range",
    cooldown: 18,
    category: 'secondary'
  },
  {
    name: "Triple Cut",
    description: "Deals 10% max HP damage three times to one enemy",
    cooldown: 15,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Perfect Form",
    description: "+15% critical chance for 5s",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Blade Mastery",
    description: "+15% damage for 8s",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Savage Instinct",
    description: "+15% critical chance and +10% damage for 5s",
    cooldown: 30,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Disarm",
    description: "Disarms one enemy for 2s",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Knockback",
    description: "Knocks back one enemy 5 units",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Maim",
    description: "Reduces enemy movement speed by 30% for 3s",
    cooldown: 25,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Precise Geometry",
    description: "Enhances critical strike chance."
  },
  {
    name: "Blade Formation",
    description: "Creates a defensive perimeter of blades."
  },
  {
    name: "Predatory Swarm",
    description: "Increases damage to weakened targets."
  }
];

// Complete Ability Pool for Uncommon ATTACK
export const attackUncommonPool = {
  tier: Tier.UNCOMMON,
  role: Role.ATTACK,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default attackUncommonPool;

