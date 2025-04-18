/**
 * Ability Pool for ATTACK role - Mythic Tier (Tier 6)
 *
 * This file defines the ability pools for Mythic ATTACK creatures.
 * At this tier, creatures have unique, powerful subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Apocalypse Harbinger Subclass
export const apocalypseHarbingerSubclass = {
  name: "Apocalypse Harbinger",
  description: "A being of pure destruction that brings doom to all enemies",
  abilities: [
    {
      name: "Apocalyptic Strike",
      description: "Deals 100% max HP damage to one enemy",
      cooldown: 25,
      category: 'primary'
    },
    {
      name: "Rain of Destruction",
      description: "Deals 60% max HP damage to all enemies",
      cooldown: 35,
      category: 'secondary'
    },
    {
      name: "Avatar of Destruction",
      description: "+70% damage, +50% attack speed, and +40% critical chance for 15s",
      cooldown: 60,
      category: 'unique'
    },
    {
      name: "Cataclysm",
      description: "Stuns all enemies for 5s and deals 30% max HP damage",
      cooldown: 50,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Reality Shredder",
    description: "Particles form a pattern that tears at the fabric of reality, causing devastating damage to all nearby."
  }
};

// Void Reaper Subclass
export const voidReaperSubclass = {
  name: "Void Reaper",
  description: "A being that harvests the essence of its enemies, growing stronger with each kill",
  abilities: [
    {
      name: "Soul Harvest",
      description: "Deals 90% max HP damage to one enemy and heals for 50% of damage dealt",
      cooldown: 25,
      category: 'primary'
    },
    {
      name: "Void Tendrils",
      description: "Deals 40% max HP damage to all enemies in a line and pulls them toward you",
      cooldown: 30,
      category: 'secondary'
    },
    {
      name: "Essence Absorption",
      description: "Absorbs 5% of all nearby enemies' max HP per second for 10s",
      cooldown: 60,
      category: 'unique'
    },
    {
      name: "Dimensional Prison",
      description: "Traps one enemy in a void prison for 8s, making them invulnerable but unable to act",
      cooldown: 45,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Void Nexus",
    description: "Particles form a nexus to the void, draining life from nearby enemies and empowering the reaper."
  }
};

// Cosmic Annihilator Subclass
export const cosmicAnnihilatorSubclass = {
  name: "Cosmic Annihilator",
  description: "A being that channels the power of cosmic forces to obliterate enemies",
  abilities: [
    {
      name: "Cosmic Smite",
      description: "Deals 120% max HP damage to one enemy",
      cooldown: 30,
      category: 'primary'
    },
    {
      name: "Supernova",
      description: "Deals 70% max HP damage to all enemies in a large radius",
      cooldown: 40,
      category: 'secondary'
    },
    {
      name: "Cosmic Embodiment",
      description: "+100% damage and immunity to all negative effects for 12s",
      cooldown: 70,
      category: 'unique'
    },
    {
      name: "Gravitational Collapse",
      description: "Pulls all enemies to a point and stuns them for 6s",
      cooldown: 55,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Singularity Cannon",
    description: "Particles form a cannon that fires concentrated singularities, causing massive damage to everything in their path."
  }
};

// Complete Ability Pool for Mythic ATTACK
export const attackMythicPool = {
  tier: Tier.MYTHIC,
  role: Role.ATTACK,
  subclasses: [
    apocalypseHarbingerSubclass,
    voidReaperSubclass,
    cosmicAnnihilatorSubclass
  ]
};

export default attackMythicPool;

