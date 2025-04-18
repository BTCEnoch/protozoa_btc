/**
 * Ability Pool for CONTROL role - Uncommon Tier (Tier 2)
 *
 * This file defines the ability pools for Uncommon CONTROL creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Uncommon CONTROL creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Enhanced Mind Spike",
    description: "Deals 18% max HP damage and reduces target's ability cooldown recovery by 15% for 4s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Enhanced Psychic Blast",
    description: "Deals 22% max HP damage and pushes the target away with greater force",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Enhanced Neural Shock",
    description: "Deals 15% max HP damage and slows the target by 30% for 4s",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Enhanced Mental Barrier",
    description: "Reduces damage taken by 25% for 5s",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Enhanced Thought Leech",
    description: "Deals 12% max HP damage and restores 8% of your max HP",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Enhanced Psychic Link",
    description: "Links with an ally, increasing both units' damage by 15% for 6s",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Enhanced Mental Fortitude",
    description: "+25% resistance to crowd control effects for 8s",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Enhanced Psychic Amplification",
    description: "+18% ability damage for 8s",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Enhanced Mind Shield",
    description: "Immune to the next two crowd control effects within 6s",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Enhanced Confusion",
    description: "Target moves in random directions for 3s",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Enhanced Mental Grip",
    description: "Immobilizes target for 2s",
    cooldown: 18,
    category: 'crowdControl'
  },
  {
    name: "Enhanced Psychic Slow",
    description: "Reduces target's movement speed by 40% for 5s",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Enhanced Mental Nexus",
    description: "Enhances crowd control duration by 15%."
  },
  {
    name: "Enhanced Thought Web",
    description: "Increases ability damage by 8%."
  },
  {
    name: "Enhanced Psychic Resonance",
    description: "Reduces ability cooldowns by 8%."
  }
];

// Complete Ability Pool for Uncommon CONTROL
export const controlUncommonPool = {
  tier: Tier.UNCOMMON,
  role: Role.CONTROL,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default controlUncommonPool;

