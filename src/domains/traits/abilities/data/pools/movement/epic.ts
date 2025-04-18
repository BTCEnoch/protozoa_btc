/**
 * Ability Pool for MOVEMENT role - Epic Tier (Tier 4)
 *
 * This file defines the ability pools for Epic MOVEMENT creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Epic MOVEMENT creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Magnificent Swift Strike",
    description: "Deals 35% max HP damage, increases your movement speed by 50% for 6s, and has a 20% chance to strike twice",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Magnificent Dash Attack",
    description: "Dash forward and deal 40% max HP damage to the first enemy hit, 25% max HP damage to nearby enemies, and stun them for 1s",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Magnificent Momentum Strike",
    description: "Deals 30-60% max HP damage based on your movement speed, knocks the target back, and reduces their movement speed by 30% for 4s",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Magnificent Accelerate",
    description: "Increases movement speed by 70% for 10s, grants immunity to slowing and immobilizing effects, and increases attack speed by 20%",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Magnificent Evasive Maneuver",
    description: "Dash to a target location, gain 50% evasion for 6s, leave behind a trail that increases allies' movement speed by 30% for 4s, and become invisible for 2s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Magnificent Slipstream",
    description: "Ignore unit collision, gain 60% movement speed for 8s, pass through enemies dealing 20% max HP damage to those you pass through, and gain 30% attack speed for 5s",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Magnificent Agile Reflexes",
    description: "+50% evasion for 15s, +25% movement speed, and +15% attack speed",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Magnificent Momentum",
    description: "Gain 15% movement speed every second for 8s (stacks), +8% damage for each stack, and +5% critical chance for each stack",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Magnificent Rapid Recovery",
    description: "Reduces crowd control effects duration by 70%, cleanses all negative effects when activated, and grants immunity to crowd control for 3s",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Magnificent Trip Wire",
    description: "Creates a trap that roots enemies for 3s, deals 20% max HP damage, and reduces their defense by 20% for 5s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Slowing Field",
    description: "Creates an area that slows enemies by 60% for 8s, reduces their attack speed by 30%, and prevents them from using movement abilities",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Disorienting Strike",
    description: "Confuses target, causing them to move in random directions for 5s, attack random targets, and take 15% increased damage",
    cooldown: 20,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Magnificent Swift Formation",
    description: "Increases movement speed by 18%, reduces the cooldown of movement abilities by 15%, and grants a 10% chance to reset the cooldown of a movement ability when used."
  },
  {
    name: "Magnificent Evasive Pattern",
    description: "Increases evasion by 18%, grants a 10% chance to completely avoid damage, and increases movement speed by 10% for 3s when an attack is evaded."
  },
  {
    name: "Magnificent Fluid Motion",
    description: "Reduces crowd control effects duration by 30%, grants immunity to the first two crowd control effects every 15s, and increases movement speed by 15% after being affected by crowd control."
  }
];

// Complete Ability Pool for Epic MOVEMENT
export const movementEpicPool = {
  tier: Tier.EPIC,
  role: Role.MOVEMENT,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default movementEpicPool;

