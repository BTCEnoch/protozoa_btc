/**
 * Ability Pool for CORE role - Mythic Tier (Tier 6)
 *
 * This file defines the ability pools for Mythic CORE creatures.
 * At this tier, creatures have unique, powerful subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Eternal Sovereign Subclass
export const eternalSovereignSubclass = {
  name: "Eternal Sovereign",
  description: "A transcendent being of pure life energy that can manipulate the very essence of existence",
  abilities: [
    {
      name: "Divine Restoration",
      description: "Fully heals self and all allies, and grants immunity to damage for 5s",
      cooldown: 45,
      category: 'primary'
    },
    {
      name: "Eternal Sanctuary",
      description: "Creates a sanctuary that heals all allies within it for 20% max HP per second and makes them immune to crowd control effects for 10s",
      cooldown: 60,
      category: 'secondary'
    },
    {
      name: "Transcendence",
      description: "Increases max HP by 100%, healing output by 100%, and grants immunity to all negative effects for 15s",
      cooldown: 90,
      category: 'unique'
    },
    {
      name: "Life Drain",
      description: "Drains 50% max HP from all enemies in a large radius over 5s, healing self and allies for the amount drained",
      cooldown: 70,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Divine Matrix",
    description: "Particles form a divine matrix pattern that radiates with pure life energy, continuously healing allies and weakening enemies."
  }
};

// Cosmic Guardian Subclass
export const cosmicGuardianSubclass = {
  name: "Cosmic Guardian",
  description: "A celestial protector that harnesses the power of cosmic forces to defend against any threat",
  abilities: [
    {
      name: "Cosmic Shield",
      description: "Creates an impenetrable shield that absorbs all damage for 8s and heals for 50% of damage absorbed afterward",
      cooldown: 50,
      category: 'primary'
    },
    {
      name: "Celestial Aegis",
      description: "Surrounds all allies with a celestial barrier that absorbs 70% of damage taken and reflects 30% back to attackers for 12s",
      cooldown: 65,
      category: 'secondary'
    },
    {
      name: "Avatar of Protection",
      description: "Transforms into an avatar of cosmic protection, becoming immune to damage and crowd control, and reducing damage taken by all allies by 70% for 10s",
      cooldown: 90,
      category: 'unique'
    },
    {
      name: "Cosmic Disruption",
      description: "Creates a cosmic anomaly that pulls all enemies toward its center, stuns them for 5s, and reduces their damage by 50% for 10s",
      cooldown: 75,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Cosmic Bastion",
    description: "Particles form a cosmic bastion pattern that creates an impenetrable barrier of cosmic energy, absorbing and nullifying incoming damage."
  }
};

// Primordial Essence Subclass
export const primordialEssenceSubclass = {
  name: "Primordial Essence",
  description: "A being of pure primordial energy that exists at the fundamental level of reality",
  abilities: [
    {
      name: "Reality Manipulation",
      description: "Alters reality to instantly reset all ability cooldowns for self and all allies, and grants a 50% chance for abilities to cost no cooldown for 10s",
      cooldown: 60,
      category: 'primary'
    },
    {
      name: "Essence Infusion",
      description: "Infuses all allies with primordial essence, increasing their damage, healing, and movement speed by 50% for 15s",
      cooldown: 70,
      category: 'secondary'
    },
    {
      name: "Primordial Ascension",
      description: "Ascends to a higher state of existence, gaining 200% increased stats and the ability to cast abilities without cooldowns for 12s",
      cooldown: 120,
      category: 'unique'
    },
    {
      name: "Temporal Stasis",
      description: "Creates a field of temporal stasis that freezes all enemies in time for 6s, making them unable to act or take damage",
      cooldown: 80,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Primordial Matrix",
    description: "Particles form a primordial matrix pattern that exists partially outside normal reality, granting extraordinary power and resilience."
  }
};

// Complete Ability Pool for Mythic CORE
export const coreMythicPool = {
  tier: Tier.MYTHIC,
  role: Role.CORE,
  subclasses: [
    eternalSovereignSubclass,
    cosmicGuardianSubclass,
    primordialEssenceSubclass
  ]
};

export default coreMythicPool;

