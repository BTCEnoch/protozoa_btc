/**
 * Ability Pool for CONTROL role - Rare Tier (Tier 3)
 *
 * This file defines the ability pools for Rare CONTROL creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Rare CONTROL creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Superior Mind Spike",
    description: "Deals 25% max HP damage and reduces target's ability cooldown recovery by 20% for 5s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Superior Psychic Blast",
    description: "Deals 30% max HP damage and pushes the target away with tremendous force",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Superior Neural Shock",
    description: "Deals 20% max HP damage and slows the target by 40% for 5s",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Superior Mental Barrier",
    description: "Reduces damage taken by 35% for 6s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Superior Thought Leech",
    description: "Deals 18% max HP damage and restores 12% of your max HP",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Superior Psychic Link",
    description: "Links with an ally, increasing both units' damage by 20% for 8s",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Superior Mental Fortitude",
    description: "+35% resistance to crowd control effects for 10s",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Superior Psychic Amplification",
    description: "+25% ability damage for 10s",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Superior Mind Shield",
    description: "Immune to all crowd control effects for 4s",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Superior Confusion",
    description: "Target moves in random directions for 4s and attacks random targets",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Superior Mental Grip",
    description: "Immobilizes target for 3s and reduces their defense by 20%",
    cooldown: 18,
    category: 'crowdControl'
  },
  {
    name: "Superior Psychic Slow",
    description: "Reduces target's movement speed by 50% and attack speed by 30% for 6s",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Superior Mental Nexus",
    description: "Enhances crowd control duration by 20% and increases the effectiveness of crowd control effects by 15%."
  },
  {
    name: "Superior Thought Web",
    description: "Increases ability damage by 12% and reduces enemy resistance to crowd control by 10%."
  },
  {
    name: "Superior Psychic Resonance",
    description: "Reduces ability cooldowns by 12% and increases ability range by 10%."
  }
];

// Complete Ability Pool for Rare CONTROL
export const controlRarePool = {
  tier: Tier.RARE,
  role: Role.CONTROL,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default controlRarePool;

