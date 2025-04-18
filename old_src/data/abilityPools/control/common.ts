/**
 * Ability Pool for CONTROL role - Common Tier (Tier 1)
 *
 * This file defines the ability pools for Common CONTROL creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Common CONTROL creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Mind Spike",
    description: "Deals 12% max HP damage and reduces target's ability cooldown recovery by 10% for 3s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Psychic Blast",
    description: "Deals 15% max HP damage and pushes the target away",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Neural Shock",
    description: "Deals 10% max HP damage and slows the target by 20% for 3s",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Mental Barrier",
    description: "Reduces damage taken by 15% for 5s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Thought Leech",
    description: "Deals 8% max HP damage and restores 5% of your max HP",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Psychic Link",
    description: "Links with an ally, increasing both units' damage by 10% for 5s",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Mental Fortitude",
    description: "+15% resistance to crowd control effects for 8s",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Psychic Amplification",
    description: "+12% ability damage for 6s",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Mind Shield",
    description: "Immune to the next crowd control effect within 5s",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Confusion",
    description: "Target moves in random directions for 2s",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Mental Grip",
    description: "Immobilizes target for 1.5s",
    cooldown: 18,
    category: 'crowdControl'
  },
  {
    name: "Psychic Slow",
    description: "Reduces target's movement speed by 30% for 4s",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Mental Nexus",
    description: "Enhances crowd control duration by 10%."
  },
  {
    name: "Thought Web",
    description: "Increases ability damage by 5%."
  },
  {
    name: "Psychic Resonance",
    description: "Reduces ability cooldowns by 5%."
  }
];

// Complete Ability Pool for Common CONTROL
export const controlCommonPool = {
  tier: Tier.COMMON,
  role: Role.CONTROL,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default controlCommonPool;

