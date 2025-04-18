/**
 * Ability Pool for ATTACK role - Epic Tier (Tier 4)
 *
 * This file defines the ability pools for Epic ATTACK creatures.
 * Abilities are categorized into Primary, Secondary, Unique, Crowd Control, and Formation Traits.
 * These abilities will be randomly assigned to Epic ATTACK creatures.
 */

import { Ability, FormationTrait, Tier, Role } from '../../../types/abilities/ability';

// Primary Abilities Pool
export const primaryAbilities: Ability[] = [
  {
    name: "Annihilating Strike",
    description: "Deals 45% max HP damage to one enemy",
    cooldown: 12,
    category: 'primary'
  },
  {
    name: "Soul Reaper",
    description: "Deals 40% max HP damage and heals for 15% of damage dealt",
    cooldown: 15,
    category: 'primary'
  },
  {
    name: "Obliteration",
    description: "Deals 50% max HP damage with 20% chance to instantly kill targets below 20% health",
    cooldown: 20,
    category: 'primary'
  }
];

// Secondary Abilities Pool
export const secondaryAbilities: Ability[] = [
  {
    name: "Death Blossom",
    description: "Deals 30% max HP damage to all surrounding enemies",
    cooldown: 25,
    category: 'secondary'
  },
  {
    name: "Phantom Strikes",
    description: "Deals 15% max HP damage five times to one enemy",
    cooldown: 20,
    category: 'secondary'
  },
  {
    name: "Arterial Strike",
    description: "Deals 25% max HP damage and causes target to bleed for 20% over 8s",
    cooldown: 25,
    category: 'secondary'
  }
];

// Unique Abilities Pool
export const uniqueAbilities: Ability[] = [
  {
    name: "Avatar of War",
    description: "+30% damage, +20% attack speed, and +15% critical chance for 10s",
    cooldown: 45,
    category: 'unique'
  },
  {
    name: "Unstoppable Force",
    description: "Immune to crowd control and +25% damage for 8s",
    cooldown: 40,
    category: 'unique'
  },
  {
    name: "Bloodthirst",
    description: "Heals for 30% of damage dealt for 12s",
    cooldown: 45,
    category: 'unique'
  }
];

// Crowd Control Abilities Pool
export const crowdControlAbilities: Ability[] = [
  {
    name: "Paralyzing Strike",
    description: "Stuns one enemy for 4s",
    cooldown: 30,
    category: 'crowdControl'
  },
  {
    name: "Overwhelming Force",
    description: "Knocks back all enemies in a cone and stuns them for 2s",
    cooldown: 35,
    category: 'crowdControl'
  },
  {
    name: "Terror",
    description: "Fears all enemies in medium range for 3s",
    cooldown: 40,
    category: 'crowdControl'
  }
];

// Formation Traits Pool
export const formationTraits: FormationTrait[] = [
  {
    name: "Death's Embrace",
    description: "Particles form a deadly aura that damages nearby enemies."
  },
  {
    name: "Executioner's Formation",
    description: "Greatly increases damage against weakened targets."
  },
  {
    name: "Phantom Blades",
    description: "Creates illusory blades that strike independently."
  }
];

// Complete Ability Pool for Epic ATTACK
export const attackEpicPool = {
  tier: Tier.EPIC,
  role: Role.ATTACK,
  primary: primaryAbilities,
  secondary: secondaryAbilities,
  unique: uniqueAbilities,
  crowdControl: crowdControlAbilities,
  formationTraits: formationTraits
};

export default attackEpicPool;

