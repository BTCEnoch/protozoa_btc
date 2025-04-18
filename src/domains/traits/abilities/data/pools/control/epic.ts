/**
 * Ability Pool for CONTROL role - Epic Tier (Tier 4)
 *
 * This file defines the ability pools for Epic CONTROL creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Epic CONTROL creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Magnificent Mind Spike",
    description: "Deals 35% max HP damage and reduces target's ability cooldown recovery by 30% for 6s",
    cooldown: 10,
    category: 'primary'
  },
  {
    name: "Magnificent Psychic Blast",
    description: "Deals 40% max HP damage, pushes the target away with tremendous force, and stuns them for 1s",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Magnificent Neural Shock",
    description: "Deals 30% max HP damage, slows the target by 50% for 6s, and reduces their damage output by 20%",
    cooldown: 8,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Magnificent Mental Barrier",
    description: "Reduces damage taken by 45% for 8s and reflects 15% of damage back to attackers",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Magnificent Thought Leech",
    description: "Deals 25% max HP damage, restores 18% of your max HP, and steals 10% of the target's ability power for 8s",
    cooldown: 15,
    category: 'secondary'
  },
  {
    name: "Magnificent Psychic Link",
    description: "Links with an ally, increasing both units' damage by 30% for 10s and sharing 15% of damage taken",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Magnificent Mental Fortitude",
    description: "+50% resistance to crowd control effects for 12s and cleanses all current crowd control effects",
    cooldown: 30,
    category: 'unique'
  },
  {
    name: "Magnificent Psychic Amplification",
    description: "+35% ability damage for 12s and reduces ability cooldowns by 20%",
    cooldown: 25,
    category: 'unique'
  },
  {
    name: "Magnificent Mind Shield",
    description: "Immune to all crowd control effects for 6s and reduces damage taken by 25%",
    cooldown: 35,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Magnificent Confusion",
    description: "Target moves in random directions for 5s, attacks random targets, and has a 30% chance to attack allies",
    cooldown: 20,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Mental Grip",
    description: "Immobilizes target for 4s, reduces their defense by 30%, and prevents them from using abilities",
    cooldown: 18,
    category: 'crowdControl'
  },
  {
    name: "Magnificent Psychic Slow",
    description: "Reduces target's movement speed by 60%, attack speed by 40%, and ability power by 30% for 8s",
    cooldown: 15,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Magnificent Mental Nexus",
    description: "Enhances crowd control duration by 30%, increases the effectiveness of crowd control effects by 25%, and has a 10% chance to apply additional crowd control effects."
  },
  {
    name: "Magnificent Thought Web",
    description: "Increases ability damage by 20%, reduces enemy resistance to crowd control by 20%, and has a 15% chance to apply a random crowd control effect on hit."
  },
  {
    name: "Magnificent Psychic Resonance",
    description: "Reduces ability cooldowns by 20%, increases ability range by 20%, and has a 10% chance to reset an ability's cooldown when used."
  }
];

// Complete Ability Pool for Epic CONTROL
export const controlEpicPool = {
  tier: Tier.EPIC,
  role: Role.CONTROL,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default controlEpicPool;

