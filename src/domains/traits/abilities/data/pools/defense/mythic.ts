/**
 * Ability Pool for DEFENSE role - Mythic Tier (Tier 6)
 *
 * This file defines the ability pools for Mythic DEFENSE creatures.
 * At this tier, creatures have unique, powerful subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Immortal Colossus Subclass
export const immortalColossusSubclass = {
  name: "Immortal Colossus",
  description: "A titanic being of nearly indestructible constitution",
  abilities: [
    {
      name: "Titan's Wrath",
      description: "Deals 60% max HP damage to all enemies in a large radius, knocks them back, and stuns them for 3s",
      cooldown: 25,
      category: 'primary'
    },
    {
      name: "Colossal Endurance",
      description: "Reduces damage taken by 80% for 15s, reflects 40% of damage back to attackers, and becomes immune to crowd control effects",
      cooldown: 40,
      category: 'secondary'
    },
    {
      name: "Immortality",
      description: "Upon taking fatal damage, instead becomes invulnerable for 8s and heals to 50% max HP",
      cooldown: 120,
      trigger: "When fatal damage would be taken",
      category: 'unique'
    },
    {
      name: "Earth Shatter",
      description: "Creates a massive shockwave that stuns all enemies for 5s, reduces their defense by 40% for 10s, and deals 30% max HP damage",
      cooldown: 45,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Titanic Presence",
    description: "Particles form a colossal pattern that makes the creature virtually indestructible, drastically reducing damage taken and making it immune to most crowd control effects."
  }
};

// Divine Protector Subclass
export const divineProtectorSubclass = {
  name: "Divine Protector",
  description: "A celestial guardian blessed with divine protection",
  abilities: [
    {
      name: "Divine Judgment",
      description: "Deals 50% max HP damage to one enemy, heals self for 30% max HP, and creates a barrier that absorbs 40% max HP damage",
      cooldown: 20,
      category: 'primary'
    },
    {
      name: "Celestial Aegis",
      description: "Creates a divine shield around all allies that absorbs 70% of damage taken and heals them for 10% max HP per second for 12s",
      cooldown: 35,
      category: 'secondary'
    },
    {
      name: "Divine Ascension",
      description: "Transforms into a divine being for 15s, becoming immune to damage, increasing healing output by 100%, and redirecting all damage from allies to self (which is nullified)",
      cooldown: 90,
      category: 'unique'
    },
    {
      name: "Divine Retribution",
      description: "Calls down divine judgment on all enemies, stunning them for 6s, reducing their damage by 50% for 12s, and dealing 20% max HP damage",
      cooldown: 50,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Divine Bastion",
    description: "Particles form a divine pattern that creates an impenetrable barrier of holy energy, protecting allies from harm and continuously healing them."
  }
};

// Quantum Guardian Subclass
export const quantumGuardianSubclass = {
  name: "Quantum Guardian",
  description: "A being that exists across multiple dimensions, capable of manipulating reality to protect allies",
  abilities: [
    {
      name: "Quantum Strike",
      description: "Attacks from multiple dimensions simultaneously, dealing 70% max HP damage to one enemy and creating quantum echoes that absorb 20% max HP damage for all allies",
      cooldown: 25,
      category: 'primary'
    },
    {
      name: "Dimensional Barrier",
      description: "Creates a barrier that exists across multiple dimensions, making all allies invulnerable to damage for 6s",
      cooldown: 45,
      category: 'secondary'
    },
    {
      name: "Quantum Superposition",
      description: "Exists in all possible defensive states simultaneously for 12s, becoming immune to damage and crowd control, reflecting 100% of damage back to attackers, and healing for 10% max HP per second",
      cooldown: 90,
      category: 'unique'
    },
    {
      name: "Reality Distortion",
      description: "Warps reality around enemies, stunning them for 8s, reducing their damage by 60% for 15s, and preventing them from using abilities for 10s",
      cooldown: 60,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Quantum Matrix",
    description: "Particles exist in quantum superposition, creating an impenetrable defense that adapts to any attack and exists partially outside normal reality."
  }
};

// Complete Ability Pool for Mythic DEFENSE
export const defenseMythicPool = {
  tier: Tier.MYTHIC,
  role: Role.DEFENSE,
  subclasses: [
    immortalColossusSubclass,
    divineProtectorSubclass,
    quantumGuardianSubclass
  ]
};

export default defenseMythicPool;

