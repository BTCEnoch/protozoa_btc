/**
 * Ability Pool for ATTACK role - Legendary Tier (Tier 5)
 *
 * This file defines the ability pools for Legendary ATTACK creatures.
 * At this tier, creatures have predefined subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Berserker Subclass
export const berserkerSubclass = {
  name: "Berserker",
  description: "A frenzied warrior that deals massive damage at the cost of defense",
  abilities: [
    {
      name: "Frenzied Assault",
      description: "Deals 60% max HP damage to one enemy, increases damage taken by 20% for 5s",
      cooldown: 15,
      category: 'primary'
    },
    {
      name: "Whirlwind of Death",
      description: "Deals 40% max HP damage to all surrounding enemies",
      cooldown: 25,
      category: 'secondary'
    },
    {
      name: "Bloodlust",
      description: "+50% damage, +30% attack speed, but -30% defense for 12s",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Intimidating Roar",
      description: "Fears all enemies in large range for 3s",
      cooldown: 40,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Chaotic Maelstrom",
    description: "Particles form a chaotic, swirling pattern that increases damage as the berserker takes damage."
  }
};

// Assassin Subclass
export const assassinSubclass = {
  name: "Assassin",
  description: "A precision striker that deals massive damage to single targets",
  abilities: [
    {
      name: "Death Strike",
      description: "Deals 80% max HP damage to one enemy",
      cooldown: 20,
      category: 'primary'
    },
    {
      name: "Phantom Blades",
      description: "Deals 20% max HP damage five times to one enemy",
      cooldown: 25,
      category: 'secondary'
    },
    {
      name: "Shadow Form",
      description: "+50% evasion and +40% critical chance for 10s",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Paralyzing Venom",
      description: "Stuns one enemy for 5s",
      cooldown: 35,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Phantom Geometry",
    description: "Particles form an elusive pattern that increases critical damage and evasion."
  }
};

// Warlord Subclass
export const warlordSubclass = {
  name: "Warlord",
  description: "A tactical fighter that combines damage with battlefield control",
  abilities: [
    {
      name: "Commanding Strike",
      description: "Deals 50% max HP damage to one enemy and increases all allies' damage by 20% for 8s",
      cooldown: 20,
      category: 'primary'
    },
    {
      name: "Battle Cry",
      description: "Deals 30% max HP damage to all enemies in a cone and reduces their attack by 25% for 5s",
      cooldown: 30,
      category: 'secondary'
    },
    {
      name: "Tactical Mastery",
      description: "+30% damage, +20% defense, and +20% critical chance for 15s",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Overwhelming Presence",
      description: "Stuns all enemies in medium range for 3s",
      cooldown: 40,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Strategic Array",
    description: "Particles form a tactical pattern that enhances both offensive and defensive capabilities."
  }
};

// Complete Ability Pool for Legendary ATTACK
export const attackLegendaryPool = {
  tier: Tier.LEGENDARY,
  role: Role.ATTACK,
  subclasses: [
    berserkerSubclass,
    assassinSubclass,
    warlordSubclass
  ]
};

export default attackLegendaryPool;

