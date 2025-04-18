/**
 * Ability Pool for MOVEMENT role - Common Tier (Tier 1)
 *
 * This file defines the ability pools for Common MOVEMENT creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Common MOVEMENT creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Swift Strike",
    description: "Deals 12% max HP damage and increases your movement speed by 20% for 3s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Dash Attack",
    description: "Dash forward and deal 15% max HP damage to the first enemy hit",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Momentum Strike",
    description: "Deals 10-20% max HP damage based on your movement speed",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Accelerate",
    description: "Increases movement speed by 30% for 5s",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Evasive Maneuver",
    description: "Dash to a target location and gain 20% evasion for 3s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Slipstream",
    description: "Ignore unit collision and gain 25% movement speed for 4s",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Agile Reflexes",
    description: "+15% evasion for 8s",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Momentum",
    description: "Gain 5% movement speed every second for 5s (stacks)",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Rapid Recovery",
    description: "Reduces crowd control effects duration by 30%",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Trip Wire",
    description: "Creates a trap that roots enemies for 1.5s",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Slowing Field",
    description: "Creates an area that slows enemies by 30% for 4s",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Disorienting Strike",
    description: "Confuses target, causing them to move in random directions for 2s",
    cooldown: 20,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Swift Formation",
    description: "Increases movement speed by 5%."
  },
  {
    name: "Evasive Pattern",
    description: "Increases evasion by 5%."
  },
  {
    name: "Fluid Motion",
    description: "Reduces crowd control effects duration by 10%."
  }
];

// Complete Ability Pool for Common MOVEMENT
export const movementCommonPool = {
  tier: Tier.COMMON,
  role: Role.MOVEMENT,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default movementCommonPool;

