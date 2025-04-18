/**
 * Ability Pool for CONTROL role - Legendary Tier (Tier 5)
 *
 * This file defines the ability pools for Legendary CONTROL creatures.
 * At this tier, creatures have predefined subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Psionicist Subclass
export const psionicistSubclass = {
  name: "Psionicist",
  description: "A master of mental powers and psychic manipulation",
  abilities: [
    {
      name: "Mind Crush",
      description: "Deals 60% max HP damage to one enemy and reduces their ability power by 50% for 8s",
      cooldown: 15,
      category: 'primary'
    },
    {
      name: "Psychic Storm",
      description: "Creates a psychic storm that deals 30% max HP damage to all enemies in the area and confuses them for 3s",
      cooldown: 25,
      category: 'secondary'
    },
    {
      name: "Mental Mastery",
      description: "+50% ability power, +30% ability range, and -30% ability cooldowns for 12s",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Mind Control",
      description: "Takes control of an enemy for 5s, forcing them to attack their allies",
      cooldown: 40,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Psionic Matrix",
    description: "Particles form a psionic matrix pattern that enhances mental abilities and creates psychic disturbances around enemies."
  }
};

// Chronomancer Subclass
export const chronomancerSubclass = {
  name: "Chronomancer",
  description: "A manipulator of time and space",
  abilities: [
    {
      name: "Temporal Strike",
      description: "Deals 50% max HP damage to one enemy and slows their time, reducing movement and attack speed by 60% for 6s",
      cooldown: 15,
      category: 'primary'
    },
    {
      name: "Time Dilation",
      description: "Creates a field where allies move 50% faster and enemies move 50% slower for 8s",
      cooldown: 30,
      category: 'secondary'
    },
    {
      name: "Temporal Acceleration",
      description: "Accelerates time for self, gaining 100% increased attack speed and ability cooldown recovery for 10s",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Time Stop",
      description: "Freezes an enemy in time for 4s, making them unable to act or take damage",
      cooldown: 35,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Temporal Flux",
    description: "Particles form a pattern that distorts time around them, accelerating allies and slowing enemies."
  }
};

// Illusionist Subclass
export const illusionistSubclass = {
  name: "Illusionist",
  description: "A master of deception and illusion",
  abilities: [
    {
      name: "Phantom Strike",
      description: "Creates three illusory copies that each deal 20% max HP damage to one enemy",
      cooldown: 15,
      category: 'primary'
    },
    {
      name: "Mirror Image",
      description: "Creates five illusory copies of self that last for 10s and each have 30% of your stats",
      cooldown: 30,
      category: 'secondary'
    },
    {
      name: "Grand Illusion",
      description: "Becomes invisible for 8s and creates an illusory battlefield that confuses all enemies",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Phantasmal Terror",
      description: "Causes an enemy to see terrifying illusions, fearing them for 5s and reducing their damage by 40%",
      cooldown: 35,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Illusory Pattern",
    description: "Particles form constantly shifting patterns that create illusions and confuse enemies."
  }
};

// Complete Ability Pool for Legendary CONTROL
export const controlLegendaryPool = {
  tier: Tier.LEGENDARY,
  role: Role.CONTROL,
  subclasses: [
    psionicistSubclass,
    chronomancerSubclass,
    illusionistSubclass
  ]
};

export default controlLegendaryPool;

