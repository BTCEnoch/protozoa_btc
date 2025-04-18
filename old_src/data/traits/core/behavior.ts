// Generated from group_traits/trait_banks/behavior/core_behavior_traits.json
// DO NOT EDIT MANUALLY - This file is generated by scripts/generate_trait_data_better.ps1

import { BehaviorTrait } from '../../../types/traits/trait';
import { Role, Rarity, BehaviorType } from '../../../types/core';

export const CORE_BEHAVIOR_TRAITS = [
    {
      "name": "Stable Orbit",
      "description": "Particles maintain a stable orbital pattern",
      "rarityTier": "Common",
      "role": "CORE",
      "type": "Flocking",
      "physicsLogic": {
        "strength": 0.6,
        "range": 15,
        "priority": 0.7,
        "persistence": 0.8,
        "frequency": 0.2,
        "additionalParameters": {
          "orbitRadius": 8,
          "orbitStability": 0.9
        }
      },
      "visualEffects": {
        "particleEffect": "subtle_glow",
        "trailEffect": "none",
        "colorModulation": false
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Pulsating Core",
          "Harmonic Resonance"
        ]
      }
    },
    {
      "name": "Pulsating Core",
      "description": "Core particles pulsate rhythmically",
      "rarityTier": "Uncommon",
      "role": "CORE",
      "type": "Pulsation",
      "physicsLogic": {
        "strength": 0.65,
        "range": 12,
        "priority": 0.75,
        "persistence": 0.7,
        "frequency": 0.4,
        "additionalParameters": {
          "pulsationAmplitude": 3,
          "pulsationPhase": 0
        }
      },
      "visualEffects": {
        "particleEffect": "pulse_glow",
        "trailEffect": "none",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Harmonic Resonance",
          "Quantum Fluctuation"
        ]
      }
    },
    {
      "name": "Harmonic Resonance",
      "description": "Particles resonate harmonically with each other",
      "rarityTier": "Rare",
      "role": "CORE",
      "type": "Oscillation",
      "physicsLogic": {
        "strength": 0.7,
        "range": 18,
        "priority": 0.8,
        "persistence": 0.75,
        "frequency": 0.5,
        "additionalParameters": {
          "harmonics": [
            1,
            2,
            3
          ],
          "resonanceQuality": 0.8
        }
      },
      "visualEffects": {
        "particleEffect": "harmonic_rings",
        "trailEffect": "subtle_trail",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Quantum Fluctuation",
          "Energy Nexus"
        ]
      }
    },
    {
      "name": "Quantum Fluctuation",
      "description": "Particles exhibit quantum fluctuation behavior",
      "rarityTier": "Rare",
      "role": "CORE",
      "type": "Quantum Fluctuation",
      "physicsLogic": {
        "strength": 0.75,
        "range": 20,
        "priority": 0.85,
        "persistence": 0.7,
        "frequency": 0.6,
        "additionalParameters": {
          "quantumStates": 4,
          "uncertaintyFactor": 0.3
        }
      },
      "visualEffects": {
        "particleEffect": "quantum_blur",
        "trailEffect": "probability_trail",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Energy Nexus",
          "Dimensional Anchor"
        ]
      }
    },
    {
      "name": "Energy Nexus",
      "description": "Particles channel and distribute energy",
      "rarityTier": "Epic",
      "role": "CORE",
      "type": "Flowing",
      "physicsLogic": {
        "strength": 0.8,
        "range": 25,
        "priority": 0.9,
        "persistence": 0.8,
        "frequency": 0.3,
        "additionalParameters": {
          "energyFlowRate": 0.7,
          "channelEfficiency": 0.8
        }
      },
      "visualEffects": {
        "particleEffect": "energy_flow",
        "trailEffect": "energy_stream",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Dimensional Anchor",
          "Temporal Nexus"
        ]
      }
    },
    {
      "name": "Dimensional Anchor",
      "description": "Particles anchor the creature to this dimension",
      "rarityTier": "Epic",
      "role": "CORE",
      "type": "Oscillation",
      "physicsLogic": {
        "strength": 0.85,
        "range": 30,
        "priority": 0.95,
        "persistence": 0.85,
        "frequency": 0.2,
        "additionalParameters": {
          "dimensionalStability": 0.9,
          "anchorStrength": 0.8
        }
      },
      "visualEffects": {
        "particleEffect": "dimensional_ripple",
        "trailEffect": "reality_anchor",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Temporal Nexus",
          "Reality Core"
        ]
      }
    },
    {
      "name": "Temporal Nexus",
      "description": "Particles manipulate local time flow",
      "rarityTier": "Legendary",
      "role": "CORE",
      "type": "Quantum Fluctuation",
      "physicsLogic": {
        "strength": 0.9,
        "range": 35,
        "priority": 1,
        "persistence": 0.9,
        "frequency": 0.1,
        "additionalParameters": {
          "temporalField": 15,
          "timeWarpFactor": 0.5
        }
      },
      "visualEffects": {
        "particleEffect": "time_distortion",
        "trailEffect": "temporal_echo",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Reality Core",
          "Cosmic Heart"
        ]
      }
    },
    {
      "name": "Reality Core",
      "description": "Particles stabilize and manipulate reality",
      "rarityTier": "Legendary",
      "role": "CORE",
      "type": "Quantum Fluctuation",
      "physicsLogic": {
        "strength": 0.95,
        "range": 40,
        "priority": 1,
        "persistence": 0.95,
        "frequency": 0.05,
        "additionalParameters": {
          "realityWarpFactor": 0.7,
          "stabilityField": 20
        }
      },
      "visualEffects": {
        "particleEffect": "reality_warp",
        "trailEffect": "dimensional_tear",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Cosmic Heart",
          "Primordial Essence"
        ]
      }
    },
    {
      "name": "Cosmic Heart",
      "description": "Particles channel cosmic energy",
      "rarityTier": "Mythic",
      "role": "CORE",
      "type": "Flowing",
      "physicsLogic": {
        "strength": 1,
        "range": 45,
        "priority": 1,
        "persistence": 1,
        "frequency": 0.1,
        "additionalParameters": {
          "cosmicEnergyLevel": 0.9,
          "universalHarmonic": 0.8
        }
      },
      "visualEffects": {
        "particleEffect": "cosmic_pulse",
        "trailEffect": "star_dust",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Primordial Essence"
        ]
      }
    },
    {
      "name": "Primordial Essence",
      "description": "Particles embody the primordial essence of creation",
      "rarityTier": "Mythic",
      "role": "CORE",
      "type": "Quantum Fluctuation",
      "physicsLogic": {
        "strength": 1,
        "range": 50,
        "priority": 1,
        "persistence": 1,
        "frequency": 0.05,
        "additionalParameters": {
          "creationEnergy": 1,
          "existentialStability": 0.9
        }
      },
      "visualEffects": {
        "particleEffect": "creation_aura",
        "trailEffect": "genesis_wake",
        "colorModulation": true
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Cosmic Heart"
        ]
      }
    }
  ];

export default CORE_BEHAVIOR_TRAITS;





