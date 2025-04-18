/**
 * Ability Pool for MOVEMENT role - Legendary Tier (Tier 5)
 *
 * This file defines the ability pools for Legendary MOVEMENT creatures.
 * At this tier, creatures have predefined subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Phantom Subclass
export const phantomSubclass = {
  name: "Phantom",
  description: "A spectral entity that moves with unparalleled speed and elusiveness",
  abilities: [
    {
      name: "Phantom Strike",
      description: "Teleport to an enemy, deal 50% max HP damage, and become untargetable for 2s",
      cooldown: 12,
      category: 'primary'
    },
    {
      name: "Ghost Form",
      description: "Become incorporeal for 6s, gaining 100% evasion, 70% increased movement speed, and the ability to pass through obstacles",
      cooldown: 25,
      category: 'secondary'
    },
    {
      name: "Spectral Presence",
      description: "For 12s, gain 50% evasion, 50% movement speed, and leave behind spectral copies that deal 15% max HP damage to enemies they touch",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Terrifying Visage",
      description: "Reveal your true form, fearing all enemies in a medium radius for 4s and reducing their movement speed by 50% for 6s",
      cooldown: 30,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Spectral Matrix",
    description: "Particles form an ethereal pattern that allows partial phasing through physical objects and grants exceptional evasion capabilities."
  }
};

// Windwalker Subclass
export const windwalkerSubclass = {
  name: "Windwalker",
  description: "A master of wind and air currents that moves with incredible agility",
  abilities: [
    {
      name: "Wind Slash",
      description: "Dash through an enemy, dealing 45% max HP damage and creating a gust of wind that deals 20% max HP damage to all enemies in a line",
      cooldown: 10,
      category: 'primary'
    },
    {
      name: "Cyclone Step",
      description: "Surround yourself with a cyclone for 8s, gaining 80% movement speed, immunity to slowing effects, and dealing 10% max HP damage per second to nearby enemies",
      cooldown: 20,
      category: 'secondary'
    },
    {
      name: "Wind Mastery",
      description: "For 15s, gain the ability to fly, 100% increased movement speed, and reduce the cooldown of all abilities by 50%",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Howling Gale",
      description: "Create a powerful gale that pushes all enemies away from you, slows them by 70% for 5s, and prevents them from using movement abilities for 3s",
      cooldown: 30,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Wind Current",
    description: "Particles form a pattern that rides on air currents, drastically increasing movement speed and allowing brief periods of flight."
  }
};

// Chrono Shifter Subclass
export const chronoShifterSubclass = {
  name: "Chrono Shifter",
  description: "A manipulator of time who can accelerate their own movements to incredible speeds",
  abilities: [
    {
      name: "Time Lapse Strike",
      description: "Accelerate time for yourself, striking an enemy multiple times in an instant for a total of 60% max HP damage",
      cooldown: 15,
      category: 'primary'
    },
    {
      name: "Temporal Shift",
      description: "Briefly step outside of time, becoming untargetable for 3s, then reappear at a target location with 50% increased movement and attack speed for 5s",
      cooldown: 25,
      category: 'secondary'
    },
    {
      name: "Accelerated Timeline",
      description: "Accelerate your personal timeline for 10s, gaining 100% movement speed, 50% attack speed, and reducing all ability cooldowns by 70%",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Time Stop",
      description: "Briefly stop time in a medium radius, freezing all enemies for 3s and reducing their movement and attack speed by 50% for 5s afterward",
      cooldown: 35,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Temporal Flux",
    description: "Particles exist slightly out of phase with normal time, allowing for incredible speed and occasional time manipulation."
  }
};

// Complete Ability Pool for Legendary MOVEMENT
export const movementLegendaryPool = {
  tier: Tier.LEGENDARY,
  role: Role.MOVEMENT,
  subclasses: [
    phantomSubclass,
    windwalkerSubclass,
    chronoShifterSubclass
  ]
};

export default movementLegendaryPool;

