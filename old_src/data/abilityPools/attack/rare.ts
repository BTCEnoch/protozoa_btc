/**
 * Ability Pool for ATTACK role - Rare Tier (Tier 3)
 *
 * This file defines the ability pools for Rare ATTACK creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Rare ATTACK creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Devastating Strike",
    description: "Deals 35% max HP damage to one enemy",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Rending Blow",
    description: "Deals 30% max HP damage and reduces defense by 15% for 5s",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Executioner's Cut",
    description: "Deals 40% max HP damage to enemies below 30% health",
    cooldown: 15,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Blade Storm",
    description: "Deals 20% max HP damage to all enemies in a cone",
    cooldown: 18,
    category: 'secondary'
  },
  {
    name: "Vital Strike",
    description: "Deals 25% max HP damage with 25% increased critical chance",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Bleed Out",
    description: "Deals 15% max HP damage and causes target to bleed for 10% over 5s",
    cooldown: 20,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Battle Trance",
    description: "+20% damage and +10% attack speed for 8s",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Tactical Advantage",
    description: "+25% critical damage for 10s",
    cooldown: 35,
    category: 'unique'
  },
  {
    name: "Berserker Rage",
    description: "+30% damage but -15% defense for 8s",
    cooldown: 30,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Concussive Blow",
    description: "Stuns one enemy for 3s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Crippling Strike",
    description: "Reduces enemy movement and attack speed by 40% for 5s",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Intimidating Presence",
    description: "Fears all enemies in close range for 2s",
    cooldown: 35,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Piercing Formation",
    description: "Particles align in a piercing pattern, increasing armor penetration."
  },
  {
    name: "Predator's Stance",
    description: "Increases damage against isolated targets."
  },
  {
    name: "Tactical Array",
    description: "Enhances critical strike damage and precision."
  }
];

// Complete Ability Pool for Rare ATTACK
export const attackRarePool = {
  tier: Tier.RARE,
  role: Role.ATTACK,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default attackRarePool;

