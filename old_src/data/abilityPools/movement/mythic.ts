/**
 * Ability Pool for MOVEMENT role - Mythic Tier (Tier 6)
 *
 * This file defines the ability pools for Mythic MOVEMENT creatures.
 * At this tier, creatures have unique, powerful subclasses with specific ability sets.
 */

import { Tier, Role } from '../../../types/abilities/ability';

// Quantum Blur Subclass
export const quantumBlurSubclass = {
  name: "Quantum Blur",
  description: "A being that exists in a state of quantum uncertainty, moving at speeds that defy the laws of physics",
  abilities: [
    {
      name: "Quantum Strike",
      description: "Exist in multiple locations simultaneously, striking all enemies within a large radius for 70% max HP damage and teleporting back to your original position",
      cooldown: 20,
      category: 'primary'
    },
    {
      name: "Probability Wave",
      description: "Transform into a wave of quantum probability for 8s, becoming untargetable, gaining 200% movement speed, and passing through all obstacles and enemies (dealing 30% max HP damage to enemies you pass through)",
      cooldown: 30,
      category: 'secondary'
    },
    {
      name: "Quantum Superposition",
      description: "Exist in all possible states simultaneously for 15s, gaining 150% movement speed, 100% evasion, immunity to all negative effects, and the ability to attack from any position within a large radius",
      cooldown: 60,
      category: 'unique'
    },
    {
      name: "Uncertainty Field",
      description: "Create a field of quantum uncertainty that causes all enemies within it to move in random directions, attack random targets, and have a 50% chance to miss with all attacks for 8s",
      cooldown: 45,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Quantum Uncertainty",
    description: "Particles exist in a state of quantum uncertainty, allowing for near-instantaneous movement and the ability to exist in multiple locations simultaneously."
  }
};

// Void Strider Subclass
export const voidStriderSubclass = {
  name: "Void Strider",
  description: "A being that can traverse the void between dimensions, moving with impossible speed and grace",
  abilities: [
    {
      name: "Void Slash",
      description: "Step into the void and emerge behind an enemy, dealing 90% max HP damage and creating a void rift that deals 30% max HP damage to all enemies near it for 5s",
      cooldown: 25,
      category: 'primary'
    },
    {
      name: "Dimensional Stride",
      description: "For 10s, gain the ability to instantly teleport to any visible location every 2s, leaving behind void rifts that pull in and damage enemies",
      cooldown: 35,
      category: 'secondary'
    },
    {
      name: "Void Embodiment",
      description: "Become one with the void for 12s, gaining immunity to damage, 300% movement speed, the ability to move through all obstacles, and dealing 20% max HP damage per second to all nearby enemies",
      cooldown: 70,
      category: 'unique'
    },
    {
      name: "Void Imprisonment",
      description: "Create a prison of void energy that traps all enemies in a large radius for 6s, making them unable to move or act, and dealing 10% max HP damage per second",
      cooldown: 50,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Void Walker",
    description: "Particles exist partially in the void between dimensions, allowing for teleportation and movement through solid objects."
  }
};

// Cosmic Velocity Subclass
export const cosmicVelocitySubclass = {
  name: "Cosmic Velocity",
  description: "A being infused with cosmic energy that can move at speeds approaching the speed of light",
  abilities: [
    {
      name: "Light Speed Strike",
      description: "Move at the speed of light, striking an enemy for 100% max HP damage and creating a shockwave that deals 50% max HP damage to all nearby enemies",
      cooldown: 30,
      category: 'primary'
    },
    {
      name: "Cosmic Acceleration",
      description: "Channel cosmic energy to accelerate to incredible speeds for 12s, gaining 250% movement speed, 100% attack speed, and leaving behind a trail of cosmic energy that damages enemies for 15% max HP per second",
      cooldown: 40,
      category: 'secondary'
    },
    {
      name: "Relativistic Existence",
      description: "Approach the speed of light for 10s, causing time to slow down for everyone else (reducing their movement and attack speed by 80%), while you gain 400% movement speed and the ability to attack 5 times per second",
      cooldown: 80,
      category: 'unique'
    },
    {
      name: "Cosmic Disruption",
      description: "Create a field of disrupted space-time that immobilizes all enemies for 7s, reduces their movement and attack speed by 90% for 10s afterward, and prevents them from using abilities for 5s",
      cooldown: 60,
      category: 'crowdControl'
    }
  ],
  formationTrait: {
    name: "Cosmic Velocity",
    description: "Particles are infused with cosmic energy, allowing for movement at speeds approaching the speed of light and manipulation of space-time."
  }
};

// Complete Ability Pool for Mythic MOVEMENT
export const movementMythicPool = {
  tier: Tier.MYTHIC,
  role: Role.MOVEMENT,
  subclasses: [
    quantumBlurSubclass,
    voidStriderSubclass,
    cosmicVelocitySubclass
  ]
};

export default movementMythicPool;

