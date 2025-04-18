/**
 * Ability Pool for CORE role - Legendary Tier (Tier 5)
 *
 * This file defines the ability pools for Legendary CORE creatures.
 * At this tier, creatures have predefined subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Lifeweaver Subclass
export const lifeweaverSubclass = {
  name: "Lifeweaver",
  description: "A master of healing and life energy manipulation",
  abilities: [
    {
      name: "Lifebloom",
      description: "Heals self for 70% max HP and nearby allies for 40% max HP",
      cooldown: 20,
      category: 'primary'
    },
    {
      name: "Rejuvenation Cascade",
      description: "Creates a healing field that restores 10% max HP per second to all allies within it for 8s",
      cooldown: 30,
      category: 'secondary'
    },
    {
      name: "Life Essence",
      description: "Increases max HP by 50% and healing output by 40% for 15s",
      cooldown: 45,
      category: 'unique'
    },
    {
      name: "Enervating Touch",
      description: "Drains 30% max HP from an enemy over 5s, healing self for the amount drained",
      cooldown: 35,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Healing Matrix",
    description: "Particles form a matrix pattern that continuously pulses with healing energy, restoring health to nearby allies."
  }
};

// Guardian Subclass
export const guardianSubclass = {
  name: "Guardian",
  description: "A stalwart protector with exceptional defensive capabilities",
  abilities: [
    {
      name: "Impenetrable Shield",
      description: "Reduces damage taken by 70% for 10s and reflects 20% of damage back to attackers",
      cooldown: 25,
      category: 'primary'
    },
    {
      name: "Protective Dome",
      description: "Creates a dome that reduces damage taken by all allies inside by 40% for 8s",
      cooldown: 35,
      category: 'secondary'
    },
    {
      name: "Unbreakable",
      description: "Becomes immune to damage and crowd control effects for 5s",
      cooldown: 60,
      category: 'unique'
    },
    {
      name: "Shockwave",
      description: "Knocks back all enemies in a large radius and stuns them for 3s",
      cooldown: 40,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Fortress Configuration",
    description: "Particles form a fortress-like pattern that creates a physical barrier, absorbing incoming damage."
  }
};

// Energist Subclass
export const energistSubclass = {
  name: "Energist",
  description: "A master of energy manipulation and enhancement",
  abilities: [
    {
      name: "Energy Surge",
      description: "Instantly refreshes all ability cooldowns for self and reduces cooldowns by 50% for nearby allies",
      cooldown: 30,
      category: 'primary'
    },
    {
      name: "Power Infusion",
      description: "Increases damage and healing output of all allies by 30% for 10s",
      cooldown: 40,
      category: 'secondary'
    },
    {
      name: "Energy Mastery",
      description: "Reduces all ability cooldowns by 70% and increases energy regeneration by 100% for 12s",
      cooldown: 60,
      category: 'unique'
    },
    {
      name: "Energy Vacuum",
      description: "Drains energy from all enemies in a large radius, silencing them for 4s",
      cooldown: 45,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Energy Nexus",
    description: "Particles form a nexus pattern that channels and amplifies energy, enhancing ability effectiveness and reducing cooldowns."
  }
};

// Complete Ability Pool for Legendary CORE
export const coreLegendaryPool = {
  tier: Tier.LEGENDARY,
  role: Role.CORE,
  subclasses: [
    lifeweaverSubclass,
    guardianSubclass,
    energistSubclass
  ]
};

export default coreLegendaryPool;

