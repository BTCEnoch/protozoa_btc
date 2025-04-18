/**
 * Ability Pool for MOVEMENT role - Rare Tier (Tier 3)
 *
 * This file defines the ability pools for Rare MOVEMENT creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Rare MOVEMENT creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Superior Swift Strike",
    description: "Deals 25% max HP damage and increases your movement speed by 40% for 5s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Superior Dash Attack",
    description: "Dash forward and deal 30% max HP damage to the first enemy hit and 15% max HP damage to nearby enemies",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Superior Momentum Strike",
    description: "Deals 20-40% max HP damage based on your movement speed and knocks the target back",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Superior Accelerate",
    description: "Increases movement speed by 50% for 8s and grants immunity to slowing effects",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Superior Evasive Maneuver",
    description: "Dash to a target location, gain 40% evasion for 5s, and leave behind a trail that increases allies' movement speed by 20% for 3s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Superior Slipstream",
    description: "Ignore unit collision, gain 45% movement speed for 6s, and pass through enemies, dealing 10% max HP damage to those you pass through",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Superior Agile Reflexes",
    description: "+35% evasion for 12s and +15% movement speed",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Superior Momentum",
    description: "Gain 10% movement speed every second for 6s (stacks) and +5% damage for each stack",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Superior Rapid Recovery",
    description: "Reduces crowd control effects duration by 50% and cleanses all movement-impairing effects when activated",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Superior Trip Wire",
    description: "Creates a trap that roots enemies for 2.5s and deals 10% max HP damage",
    cooldown: 25,
    category: 'crowdControl'
  },
  {
    name: "Superior Slowing Field",
    description: "Creates an area that slows enemies by 50% for 6s and reduces their attack speed by 20%",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Superior Disorienting Strike",
    description: "Confuses target, causing them to move in random directions for 4s and attack random targets",
    cooldown: 20,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Superior Swift Formation",
    description: "Increases movement speed by 12% and reduces the cooldown of movement abilities by 10%."
  },
  {
    name: "Superior Evasive Pattern",
    description: "Increases evasion by 12% and grants a 5% chance to completely avoid damage."
  },
  {
    name: "Superior Fluid Motion",
    description: "Reduces crowd control effects duration by 20% and grants immunity to the first crowd control effect every 15s."
  }
];

// Complete Ability Pool for Rare MOVEMENT
export const movementRarePool = {
  tier: Tier.RARE,
  role: Role.MOVEMENT,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default movementRarePool;

