/**
 * Ability Pool for CONTROL role - Mythic Tier (Tier 6)
 *
 * This file defines the ability pools for Mythic CONTROL creatures.
 * At this tier, creatures have unique, powerful subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Mind Lord Subclass
export const mindLordSubclass = {
  name: "Mind Lord",
  description: "A transcendent being of pure mental energy that can bend reality with thought alone",
  abilities: [
    {
      name: "Psychic Annihilation",
      description: "Deals 100% max HP damage to one enemy, silences them for 8s, and reduces their ability power to zero for 10s",
      cooldown: 30,
      category: 'primary'
    },
    {
      name: "Mental Dominance",
      description: "Takes control of up to three enemies for 6s, forcing them to attack their allies with 50% increased damage",
      cooldown: 45,
      category: 'secondary'
    },
    {
      name: "Transcendent Mind",
      description: "+100% ability power, +50% ability range, -50% ability cooldowns, and immunity to all mental effects for 15s",
      cooldown: 60,
      category: 'unique'
    },
    {
      name: "Psychic Maelstrom",
      description: "Creates a psychic maelstrom that confuses all enemies in a large radius for 8s, makes them attack each other, and deals 10% max HP damage per second",
      cooldown: 50,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Mind Dominion",
    description: "Particles form a pattern that projects overwhelming mental energy, dominating the minds of enemies and enhancing the mental powers of allies."
  }
};

// Temporal Archon Subclass
export const temporalArchonSubclass = {
  name: "Temporal Archon",
  description: "A master of time who exists simultaneously across multiple timelines",
  abilities: [
    {
      name: "Temporal Convergence",
      description: "Summons versions of self from different timelines to attack an enemy, dealing 120% max HP damage and erasing them from time for 5s",
      cooldown: 35,
      category: 'primary'
    },
    {
      name: "Chronosphere",
      description: "Creates a sphere where time flows differently: allies act twice as fast and enemies act at half speed for 12s",
      cooldown: 50,
      category: 'secondary'
    },
    {
      name: "Time Lord",
      description: "Gains complete mastery over time, reducing all ability cooldowns to 1s and increasing attack and movement speed by 200% for 10s",
      cooldown: 70,
      category: 'unique'
    },
    {
      name: "Temporal Stasis Field",
      description: "Creates a field that freezes all enemies in time for 8s, making them unable to act or take damage",
      cooldown: 60,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Temporal Nexus",
    description: "Particles form a nexus that exists across multiple timelines, allowing manipulation of time and probability."
  }
};

// Reality Weaver Subclass
export const realityWeaverSubclass = {
  name: "Reality Weaver",
  description: "A being that can manipulate the fabric of reality itself",
  abilities: [
    {
      name: "Reality Fracture",
      description: "Creates a fracture in reality that deals 80% max HP damage to all enemies in a line and has a 30% chance to banish them to another dimension for 4s",
      cooldown: 30,
      category: 'primary'
    },
    {
      name: "Dimensional Shift",
      description: "Shifts self and allies to another dimension for 6s, making them untargetable and healing them for 5% max HP per second",
      cooldown: 45,
      category: 'secondary'
    },
    {
      name: "Reality Manipulation",
      description: "Rewrites reality in a large area, transforming the battlefield to your advantage, increasing ally stats by 50% and reducing enemy stats by 50% for 12s",
      cooldown: 60,
      category: 'unique'
    },
    {
      name: "Existential Crisis",
      description: "Forces enemies to question their existence, stunning them for 6s and reducing their max HP by 30% for 15s",
      cooldown: 55,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Reality Matrix",
    description: "Particles form a pattern that warps reality around them, creating impossible geometries and bending the laws of physics."
  }
};

// Complete Ability Pool for Mythic CONTROL
export const controlMythicPool = {
  tier: Tier.MYTHIC,
  role: Role.CONTROL,
  subclasses: [
    mindLordSubclass,
    temporalArchonSubclass,
    realityWeaverSubclass
  ]
};

export default controlMythicPool;

