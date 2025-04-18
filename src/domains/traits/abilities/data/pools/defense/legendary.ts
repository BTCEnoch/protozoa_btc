/**
 * Ability Pool for DEFENSE role - Legendary Tier (Tier 5)
 *
 * This file defines the ability pools for Legendary DEFENSE creatures.
 * At this tier, creatures have predefined subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Juggernaut Subclass
export const juggernautSubclass = {
  name: "Juggernaut",
  description: "An unstoppable force of pure defensive power",
  abilities: [
    {
      name: "Unstoppable Force",
      description: "Charges forward, dealing 40% max HP damage to all enemies hit, knocking them back, and becoming immune to crowd control for 5s",
      cooldown: 15,
      category: 'primary'
    },
    {
      name: "Impenetrable Defense",
      description: "Reduces damage taken by 70% for 12s and reflects 25% of damage back to attackers",
      cooldown: 25,
      category: 'secondary'
    },
    {
      name: "Indomitable Will",
      description: "Becomes immune to damage and crowd control effects for 5s, then heals for 40% max HP",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Seismic Slam",
      description: "Slams the ground, stunning all enemies in a large radius for 4s and reducing their damage by 30% for 6s",
      cooldown: 30,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Immovable Object",
    description: "Particles form a dense, immovable pattern that drastically reduces damage taken and makes the Juggernaut resistant to displacement effects."
  }
};

// Sentinel Subclass
export const sentinelSubclass = {
  name: "Sentinel",
  description: "A vigilant guardian that protects allies with powerful defensive abilities",
  abilities: [
    {
      name: "Guardian's Strike",
      description: "Deals 35% max HP damage to one enemy and creates a protective barrier around all nearby allies that absorbs 30% max HP damage",
      cooldown: 15,
      category: 'primary'
    },
    {
      name: "Aegis of Protection",
      description: "Creates a dome that reduces damage taken by all allies inside by 50% for 10s",
      cooldown: 30,
      category: 'secondary'
    },
    {
      name: "Selfless Guardian",
      description: "Redirects 50% of damage taken by allies to self for 12s and increases defense by 60%",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Protective Surge",
      description: "Pushes all enemies away from allies and taunts them for 5s, forcing them to attack you",
      cooldown: 25,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Guardian's Bastion",
    description: "Particles form a protective formation that extends to nearby allies, reducing damage they take and increasing their maximum health."
  }
};

// Paladin Subclass
export const paladinSubclass = {
  name: "Paladin",
  description: "A holy warrior that combines defensive prowess with healing abilities",
  abilities: [
    {
      name: "Righteous Strike",
      description: "Deals 30% max HP damage to one enemy, heals self for 20% max HP, and increases defense by 25% for 6s",
      cooldown: 12,
      category: 'primary'
    },
    {
      name: "Divine Barrier",
      description: "Creates a holy barrier that absorbs 50% max HP damage and heals nearby allies for 5% max HP per second for 8s",
      cooldown: 25,
      category: 'secondary'
    },
    {
      name: "Divine Intervention",
      description: "Becomes immune to damage for 4s and heals all allies for 40% max HP",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Holy Judgment",
      description: "Stuns all enemies in a medium radius for 3s and reduces their damage by 25% for 8s",
      cooldown: 30,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Divine Protection",
    description: "Particles form a radiant pattern that emanates healing energy, continuously restoring health to nearby allies and reducing damage taken."
  }
};

// Complete Ability Pool for Legendary DEFENSE
export const defenseLegendaryPool = {
  tier: Tier.LEGENDARY,
  role: Role.DEFENSE,
  subclasses: [
    juggernautSubclass,
    sentinelSubclass,
    paladinSubclass
  ]
};

export default defenseLegendaryPool;

