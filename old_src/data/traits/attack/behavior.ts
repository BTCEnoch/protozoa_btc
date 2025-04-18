// Attack Behavior Traits

import { BehaviorTrait } from '../../../types/traits/trait';
import { Role, Rarity, BehaviorType } from '../../../types/core';

export const ATTACK_BEHAVIOR_TRAITS: BehaviorTrait[] = [
  {
    name: "Aggressive Strike",
    description: "Particles aggressively strike at targets",
    id: "attack_behavior_aggressive_strike",
    rarityTier: Rarity.COMMON,
    role: Role.ATTACK,
    type: BehaviorType.PREDATOR,
    physicsLogic: {
      strength: 0.7,
      range: 15,
      priority: 0.8,
      persistence: 0.7,
      frequency: 0.5,
      additionalParameters: {
        strikeSpeed: 0.8,
        impactForce: 0.7
      }
    },
    visualEffects: {
      particleEffect: "strike_flash",
      trailEffect: "attack_trail",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Precision Strike",
        "Swarm Assault"
      ]
    }
  },
  {
    name: "Precision Strike",
    description: "Particles strike with precision and accuracy",
    id: "attack_behavior_precision_strike",
    rarityTier: Rarity.UNCOMMON,
    role: Role.ATTACK,
    type: BehaviorType.PREDATOR,
    physicsLogic: {
      strength: 0.75,
      range: 18,
      priority: 0.85,
      persistence: 0.75,
      frequency: 0.4,
      additionalParameters: {
        accuracy: 0.9,
        criticalHitChance: 0.2
      }
    },
    visualEffects: {
      particleEffect: "precision_glow",
      trailEffect: "targeting_trail",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Swarm Assault",
        "Blade Vortex"
      ]
    }
  },
  {
    name: "Swarm Assault",
    description: "Particles swarm and overwhelm targets",
    id: "attack_behavior_swarm_assault",
    rarityTier: Rarity.RARE,
    role: Role.ATTACK,
    type: BehaviorType.SWARM,
    physicsLogic: {
      strength: 0.8,
      range: 20,
      priority: 0.9,
      persistence: 0.8,
      frequency: 0.6,
      additionalParameters: {
        swarmDensity: 0.8,
        overwhelmFactor: 0.7
      }
    },
    visualEffects: {
      particleEffect: "swarm_cloud",
      trailEffect: "swarm_trail",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Blade Vortex",
        "Orbital Strike"
      ]
    }
  },
  {
    name: "Blade Vortex",
    description: "Particles form a vortex of cutting blades",
    id: "attack_behavior_blade_vortex",
    rarityTier: Rarity.RARE,
    role: Role.ATTACK,
    type: BehaviorType.PATTERN,
    physicsLogic: {
      strength: 0.85,
      range: 22,
      priority: 0.95,
      persistence: 0.85,
      frequency: 0.5,
      additionalParameters: {
        rotationSpeed: 0.9,
        bladeSharpness: 0.8
      }
    },
    visualEffects: {
      particleEffect: "blade_flash",
      trailEffect: "cutting_edge",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Orbital Strike",
        "Nova Burst"
      ]
    }
  },
  {
    name: "Orbital Strike",
    description: "Particles orbit and strike from multiple angles",
    id: "attack_behavior_orbital_strike",
    rarityTier: Rarity.EPIC,
    role: Role.ATTACK,
    type: BehaviorType.PATTERN,
    physicsLogic: {
      strength: 0.9,
      range: 25,
      priority: 1,
      persistence: 0.9,
      frequency: 0.4,
      additionalParameters: {
        orbitCount: 3,
        strikeAngle: 120
      }
    },
    visualEffects: {
      particleEffect: "orbital_flash",
      trailEffect: "strike_path",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Nova Burst",
        "Phantom Blades"
      ]
    }
  },
  {
    name: "Nova Burst",
    description: "Particles explode outward in a devastating nova",
    id: "attack_behavior_nova_burst",
    rarityTier: Rarity.EPIC,
    role: Role.ATTACK,
    type: BehaviorType.PATTERN,
    physicsLogic: {
      strength: 0.95,
      range: 30,
      priority: 1,
      persistence: 0.95,
      frequency: 0.3,
      additionalParameters: {
        burstRadius: 25,
        explosiveForce: 0.9
      }
    },
    visualEffects: {
      particleEffect: "nova_explosion",
      trailEffect: "energy_wave",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Phantom Blades",
        "Singularity Cannon"
      ]
    }
  },
  {
    name: "Phantom Blades",
    description: "Particles form ethereal blades that phase through defenses",
    id: "attack_behavior_phantom_blades",
    rarityTier: Rarity.LEGENDARY,
    role: Role.ATTACK,
    type: BehaviorType.QUANTUM_FLUCTUATION,
    physicsLogic: {
      strength: 1,
      range: 35,
      priority: 1,
      persistence: 1,
      frequency: 0.2,
      additionalParameters: {
        phaseChance: 0.8,
        etherealDamage: 0.9
      }
    },
    visualEffects: {
      particleEffect: "phantom_glow",
      trailEffect: "ethereal_trail",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Singularity Cannon",
        "Reality Shredder"
      ]
    }
  },
  {
    name: "Singularity Cannon",
    description: "Particles form a cannon that fires miniature singularities",
    id: "attack_behavior_singularity_cannon",
    rarityTier: Rarity.LEGENDARY,
    role: Role.ATTACK,
    type: BehaviorType.QUANTUM_FLUCTUATION,
    physicsLogic: {
      strength: 1.05,
      range: 40,
      priority: 1,
      persistence: 1,
      frequency: 0.15,
      additionalParameters: {
        singularityRadius: 5,
        gravitationalPull: 0.9
      }
    },
    visualEffects: {
      particleEffect: "singularity_core",
      trailEffect: "gravity_distortion",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Reality Shredder",
        "Apocalypse Engine"
      ]
    }
  },
  {
    name: "Reality Shredder",
    description: "Particles tear at the fabric of reality to attack",
    id: "attack_behavior_reality_shredder",
    rarityTier: Rarity.MYTHIC,
    role: Role.ATTACK,
    type: BehaviorType.QUANTUM_FLUCTUATION,
    physicsLogic: {
      strength: 1.1,
      range: 45,
      priority: 1,
      persistence: 1,
      frequency: 0.1,
      additionalParameters: {
        realityTearSize: 10,
        dimensionalDamage: 1
      }
    },
    visualEffects: {
      particleEffect: "reality_tear",
      trailEffect: "void_wake",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Apocalypse Engine"
      ]
    }
  },
  {
    name: "Apocalypse Engine",
    description: "Particles form an engine of pure destruction",
    id: "attack_behavior_apocalypse_engine",
    rarityTier: Rarity.MYTHIC,
    role: Role.ATTACK,
    type: BehaviorType.QUANTUM_FLUCTUATION,
    physicsLogic: {
      strength: 1.2,
      range: 50,
      priority: 1,
      persistence: 1,
      frequency: 0.05,
      additionalParameters: {
        destructionRadius: 30,
        annihilationPower: 1
      }
    },
    visualEffects: {
      particleEffect: "apocalypse_aura",
      trailEffect: "destruction_wake",
      colorModulation: true
    },
    evolutionParameters: {
      mutationChance: 0.05,
      possibleEvolutions: [
        "Reality Shredder"
      ]
    }
  }
];

export default ATTACK_BEHAVIOR_TRAITS;

