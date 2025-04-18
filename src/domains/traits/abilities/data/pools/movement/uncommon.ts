/**
 * Ability Pool for MOVEMENT role - Uncommon Tier (Tier 2)
 *
 * This file defines the ability pools for Uncommon MOVEMENT creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Uncommon MOVEMENT creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Enhanced Swift Strike",
    description: "Deals 18% max HP damage and increases your movement speed by 30% for 4s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Enhanced Dash Attack",
    description: "Dash forward and deal 22% max HP damage to the first enemy hit",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Enhanced Momentum Strike",
    description: "Deals 15-30% max HP damage based on your movement speed",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Enhanced Accelerate",
    description: "Increases movement speed by 40% for 6s",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Enhanced Evasive Maneuver",
    description: "Dash to a target location and gain 30% evasion for 4s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Enhanced Slipstream",
    description: "Ignore unit collision and gain 35% movement speed for 5s",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Enhanced Agile Reflexes",
    description: "+25% evasion for 10s",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Enhanced Momentum",
    description: "Gain 8% movement speed every second for 5s (stacks)",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Enhanced Rapid Recovery",
    description: "Reduces crowd control effects duration by 40%",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Enhanced Trip Wire",
    description: "Creates a trap that roots enemies for 2s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Enhanced Slowing Field",
    description: "Creates an area that slows enemies by 40% for 5s",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Enhanced Disorienting Strike",
    description: "Confuses target, causing them to move in random directions for 3s",
    cooldown: 20,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Enhanced Swift Formation",
    description: "Increases movement speed by 8%."
  },
  {
    name: "Enhanced Evasive Pattern",
    description: "Increases evasion by 8%."
  },
  {
    name: "Enhanced Fluid Motion",
    description: "Reduces crowd control effects duration by 15%."
  }
];

// Complete Ability Pool for Uncommon MOVEMENT
export const movementUncommonPool = {
  tier: Tier.UNCOMMON,
  role: Role.MOVEMENT,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default movementUncommonPool;

