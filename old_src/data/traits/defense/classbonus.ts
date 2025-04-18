// Generated from group_traits/trait_banks/class_bonus/defense_class_bonus_traits.json
// DO NOT EDIT MANUALLY - This file is generated by scripts/generate_trait_data_better.ps1

import { ClassBonusTrait } from '../../../types/traits/trait';
import { Role, Rarity } from '../../../types/core';

export const DEFENSE_CLASS_BONUS_TRAITS = [
    {
      "name": "Protective Barrier",
      "description": "Increases barrier strength of defense particles",
      "rarityTier": "Common",
      "role": "DEFENSE",
      "statType": "Barrier",
      "bonusAmount": 15,
      "physicsLogic": {
        "forceMultiplier": 1,
        "rangeMultiplier": 1,
        "speedMultiplier": 0.9,
        "stabilityMultiplier": 1.15
      },
      "visualEffects": {
        "particleGlow": false,
        "particleSize": 1.1,
        "particleColor": "#33cc33"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Resilient Shield",
          "Energy Absorption"
        ]
      }
    },
    {
      "name": "Resilient Shield",
      "description": "Increases resilience of defense particles",
      "rarityTier": "Uncommon",
      "role": "DEFENSE",
      "statType": "Resilience",
      "bonusAmount": 20,
      "physicsLogic": {
        "forceMultiplier": 1,
        "rangeMultiplier": 1.1,
        "speedMultiplier": 0.9,
        "stabilityMultiplier": 1.2
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.15,
        "particleColor": "#55dd55"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Energy Absorption",
          "Adaptive Defense"
        ]
      }
    },
    {
      "name": "Energy Absorption",
      "description": "Defense particles absorb incoming energy",
      "rarityTier": "Rare",
      "role": "DEFENSE",
      "statType": "Absorption",
      "bonusAmount": 25,
      "physicsLogic": {
        "forceMultiplier": 1.1,
        "rangeMultiplier": 1.1,
        "speedMultiplier": 0.9,
        "stabilityMultiplier": 1.25
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.2,
        "particleColor": "#77ee77"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Adaptive Defense",
          "Deflection Field"
        ]
      }
    },
    {
      "name": "Adaptive Defense",
      "description": "Defense particles adapt to threats",
      "rarityTier": "Rare",
      "role": "DEFENSE",
      "statType": "Adaptive",
      "bonusAmount": 30,
      "physicsLogic": {
        "forceMultiplier": 1.15,
        "rangeMultiplier": 1.15,
        "speedMultiplier": 0.95,
        "stabilityMultiplier": 1.3
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.25,
        "particleColor": "#99ff99"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Deflection Field",
          "Temporal Shield"
        ]
      }
    },
    {
      "name": "Deflection Field",
      "description": "Defense particles deflect incoming forces",
      "rarityTier": "Epic",
      "role": "DEFENSE",
      "statType": "Deflection",
      "bonusAmount": 35,
      "physicsLogic": {
        "forceMultiplier": 1.2,
        "rangeMultiplier": 1.2,
        "speedMultiplier": 1,
        "stabilityMultiplier": 1.35
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.3,
        "particleColor": "#aaffaa"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Temporal Shield",
          "Quantum Barrier"
        ]
      }
    },
    {
      "name": "Temporal Shield",
      "description": "Defense particles shield against temporal effects",
      "rarityTier": "Epic",
      "role": "DEFENSE",
      "statType": "Temporal",
      "bonusAmount": 40,
      "physicsLogic": {
        "forceMultiplier": 1.25,
        "rangeMultiplier": 1.25,
        "speedMultiplier": 1,
        "stabilityMultiplier": 1.4
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.35,
        "particleColor": "#bbffbb"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Quantum Barrier",
          "Reality Anchor"
        ]
      }
    },
    {
      "name": "Quantum Barrier",
      "description": "Defense particles create quantum barriers",
      "rarityTier": "Legendary",
      "role": "DEFENSE",
      "statType": "Quantum",
      "bonusAmount": 45,
      "physicsLogic": {
        "forceMultiplier": 1.3,
        "rangeMultiplier": 1.3,
        "speedMultiplier": 1.05,
        "stabilityMultiplier": 1.45
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.4,
        "particleColor": "#ccffcc"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Reality Anchor",
          "Dimensional Fortress"
        ]
      }
    },
    {
      "name": "Reality Anchor",
      "description": "Defense particles anchor reality",
      "rarityTier": "Legendary",
      "role": "DEFENSE",
      "statType": "Reality",
      "bonusAmount": 50,
      "physicsLogic": {
        "forceMultiplier": 1.35,
        "rangeMultiplier": 1.35,
        "speedMultiplier": 1.1,
        "stabilityMultiplier": 1.5
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.45,
        "particleColor": "#ddffdd"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Dimensional Fortress",
          "Cosmic Aegis"
        ]
      }
    },
    {
      "name": "Dimensional Fortress",
      "description": "Defense particles form a dimensional fortress",
      "rarityTier": "Mythic",
      "role": "DEFENSE",
      "statType": "Dimensional",
      "bonusAmount": 55,
      "physicsLogic": {
        "forceMultiplier": 1.4,
        "rangeMultiplier": 1.4,
        "speedMultiplier": 1.15,
        "stabilityMultiplier": 1.55
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.5,
        "particleColor": "#eeffee"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Cosmic Aegis"
        ]
      }
    },
    {
      "name": "Cosmic Aegis",
      "description": "Defense particles form a cosmic aegis",
      "rarityTier": "Mythic",
      "role": "DEFENSE",
      "statType": "Cosmic",
      "bonusAmount": 60,
      "physicsLogic": {
        "forceMultiplier": 1.45,
        "rangeMultiplier": 1.45,
        "speedMultiplier": 1.2,
        "stabilityMultiplier": 1.6
      },
      "visualEffects": {
        "particleGlow": true,
        "particleSize": 1.55,
        "particleColor": "#ffffff"
      },
      "evolutionParameters": {
        "mutationChance": 0.05,
        "possibleEvolutions": [
          "Dimensional Fortress"
        ]
      }
    }
  ];

export default DEFENSE_CLASS_BONUS_TRAITS;





