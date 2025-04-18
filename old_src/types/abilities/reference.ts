/**
 * Ability Reference for Bitcoin Protozoa
 *
 * This file organizes abilities by tier and role, providing a centralized
 * reference for all abilities in the system. It implements a 6-tiered system
 * and pools abilities by tier.
 */

import { Role, Tier } from '../core';

/**
 * Ability interface
 * Defines the structure of an ability
 */
export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  category: 'primary' | 'secondary' | 'unique' | 'crowdControl';
  energyCost?: number;
  damage?: number;
  healing?: number;
  duration?: number;
  range?: number;
  area?: number;
  visualEffect?: string;
  soundEffect?: string;
}

/**
 * Formation Trait interface
 * Defines the structure of a formation trait
 */
export interface FormationTrait {
  id: string;
  name: string;
  description: string;
  visualEffect?: string;
}

/**
 * Ability Pool interface
 * Defines the structure of an ability pool for a specific role and tier
 */
export interface AbilityPool {
  tier: Tier;
  role: Role;
  primary: Ability[];
  secondary: Ability[];
  unique: Ability[];
  crowdControl: Ability[];
  formationTraits: FormationTrait[];
}

/**
 * Subclass Data interface
 * Defines the structure of a subclass with its abilities
 */
export interface SubclassData {
  id: string;
  name: string;
  tier: Tier;
  description: string;
  abilities: {
    primary: Ability;
    secondary: Ability;
    unique: Ability;
    crowdControl: Ability;
    formationTrait: FormationTrait;
  };
}

/**
 * Tier 1 (Common) ability pools
 */
export const TIER_1_ABILITIES: Record<Role, AbilityPool> = {
  // Will be populated with abilities for each role
  [Role.CORE]: {
    tier: Tier.COMMON,
    role: Role.CORE,
    primary: [
      {
        id: 'minor_heal',
        name: 'Minor Heal',
        description: 'Restores 10% HP to one ally when HP < 50%',
        cooldown: 20,
        category: 'primary',
        healing: 10
      },
      {
        id: 'weak_heal',
        name: 'Weak Heal',
        description: 'Restores 8% HP to one ally when HP < 50%',
        cooldown: 15,
        category: 'primary',
        healing: 8
      },
      {
        id: 'group_heal',
        name: 'Group Heal',
        description: 'Restores 5% HP to all allies when multiple allies < 50% HP',
        cooldown: 25,
        category: 'primary',
        healing: 5,
        area: 10
      },
      {
        id: 'sustain',
        name: 'Sustain',
        description: 'Restores 5% HP per second for 3s to one ally when HP < 50%',
        cooldown: 30,
        category: 'primary',
        healing: 5,
        duration: 3
      }
    ],
    secondary: [
      {
        id: 'minor_defense_boost',
        name: 'Minor Defense Boost',
        description: '+5% defense to one ally for 5s when HP < 50%',
        cooldown: 30,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'cleanse',
        name: 'Cleanse',
        description: 'Removes one debuff from one ally when debuffed',
        cooldown: 25,
        category: 'secondary'
      },
      {
        id: 'minor_group_defense',
        name: 'Minor Group Defense',
        description: '+3% defense to all allies for 5s when under attack',
        cooldown: 35,
        category: 'secondary',
        duration: 5,
        area: 10
      },
      {
        id: 'energy_transfer',
        name: 'Energy Transfer',
        description: 'Transfers 10% energy to one ally when energy < 30%',
        cooldown: 20,
        category: 'secondary',
        energyCost: 10
      }
    ],
    unique: [
      {
        id: 'minor_dispel',
        name: 'Minor Dispel',
        description: 'Removes one debuff from one ally when debuffed',
        cooldown: 30,
        category: 'unique'
      },
      {
        id: 'minor_shield',
        name: 'Minor Shield',
        description: 'Absorbs 10% max HP damage for one ally when HP < 30%',
        cooldown: 40,
        category: 'unique',
        duration: 5
      },
      {
        id: 'minor_regen',
        name: 'Minor Regeneration',
        description: 'Restores 2% HP per second for 5s to one ally when HP < 50%',
        cooldown: 35,
        category: 'unique',
        healing: 2,
        duration: 5
      },
      {
        id: 'minor_energy_boost',
        name: 'Minor Energy Boost',
        description: 'Restores 15% energy to one ally when energy < 30%',
        cooldown: 30,
        category: 'unique'
      }
    ],
    crowdControl: [
      {
        id: 'minor_slow',
        name: 'Minor Slow',
        description: 'Slows one enemy by 10% for 3s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'minor_weaken',
        name: 'Minor Weaken',
        description: 'Reduces one enemy damage by 10% for 3s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'minor_disrupt',
        name: 'Minor Disrupt',
        description: 'Interrupts one enemy ability with cooldown < 10s',
        cooldown: 40,
        category: 'crowdControl'
      },
      {
        id: 'minor_daze',
        name: 'Minor Daze',
        description: 'Reduces one enemy accuracy by 15% for 3s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 3
      }
    ],
    formationTraits: [
      {
        id: 'supportive_aura',
        name: 'Supportive Aura',
        description: 'Particles form a supportive formation that enhances healing effects by 5%.'
      },
      {
        id: 'protective_circle',
        name: 'Protective Circle',
        description: 'Particles arrange in a circular pattern that provides 3% damage reduction.'
      },
      {
        id: 'healing_matrix',
        name: 'Healing Matrix',
        description: 'Particles form a grid pattern that enhances healing received by 5%.'
      },
      {
        id: 'energy_flow',
        name: 'Energy Flow',
        description: 'Particles arrange in flowing patterns that reduce ability cooldowns by 3%.'
      }
    ]
  },
  [Role.ATTACK]: {
    tier: Tier.COMMON,
    role: Role.ATTACK,
    primary: [
      {
        id: 'quick_strike',
        name: 'Quick Strike',
        description: 'Deals 15% max HP damage to one enemy',
        cooldown: 8,
        category: 'primary',
        damage: 15
      },
      {
        id: 'heavy_strike',
        name: 'Heavy Strike',
        description: 'Deals 20% max HP damage to one enemy',
        cooldown: 10,
        category: 'primary',
        damage: 20
      },
      {
        id: 'swift_thrust',
        name: 'Swift Thrust',
        description: 'Deals 18% max HP damage to one enemy',
        cooldown: 8,
        category: 'primary',
        damage: 18
      },
      {
        id: 'frenzy_strike',
        name: 'Frenzy Strike',
        description: 'Deals 15-25% max HP damage based on missing health',
        cooldown: 10,
        category: 'primary',
        damage: 20
      }
    ],
    secondary: [
      {
        id: 'power_strike',
        name: 'Power Strike',
        description: 'Deals 12% max HP damage to one enemy with 10% chance to stun for 1s',
        cooldown: 12,
        category: 'secondary',
        damage: 12,
        duration: 1
      },
      {
        id: 'double_strike',
        name: 'Double Strike',
        description: 'Deals 8% max HP damage to one enemy twice',
        cooldown: 15,
        category: 'secondary',
        damage: 16
      },
      {
        id: 'reckless_attack',
        name: 'Reckless Attack',
        description: 'Deals 25% max HP damage to one enemy but takes 5% self damage',
        cooldown: 12,
        category: 'secondary',
        damage: 25
      },
      {
        id: 'precise_strike',
        name: 'Precise Strike',
        description: 'Deals 15% max HP damage to one enemy with 15% increased critical chance',
        cooldown: 10,
        category: 'secondary',
        damage: 15
      }
    ],
    unique: [
      {
        id: 'battle_fury',
        name: 'Battle Fury',
        description: '+10% attack speed for 5s',
        cooldown: 25,
        category: 'unique',
        duration: 5
      },
      {
        id: 'combat_stance',
        name: 'Combat Stance',
        description: '+15% damage for 5s',
        cooldown: 30,
        category: 'unique',
        duration: 5
      },
      {
        id: 'adrenaline_rush',
        name: 'Adrenaline Rush',
        description: '+10% movement speed and +10% attack speed for 3s',
        cooldown: 35,
        category: 'unique',
        duration: 3
      },
      {
        id: 'battle_focus',
        name: 'Battle Focus',
        description: '+20% critical damage for 5s',
        cooldown: 30,
        category: 'unique',
        duration: 5
      }
    ],
    crowdControl: [
      {
        id: 'knockback',
        name: 'Knockback',
        description: 'Pushes one enemy back 5 units',
        cooldown: 15,
        category: 'crowdControl'
      },
      {
        id: 'minor_stun',
        name: 'Minor Stun',
        description: 'Stuns one enemy for 1s',
        cooldown: 20,
        category: 'crowdControl',
        duration: 1
      },
      {
        id: 'disarm',
        name: 'Disarm',
        description: 'Prevents one enemy from using primary abilities for 2s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 2
      },
      {
        id: 'intimidate',
        name: 'Intimidate',
        description: 'Reduces one enemy damage by 15% for 3s',
        cooldown: 20,
        category: 'crowdControl',
        duration: 3
      }
    ],
    formationTraits: [
      {
        id: 'aggressive_stance',
        name: 'Aggressive Stance',
        description: 'Particles form an aggressive formation that increases damage output by 5%.'
      },
      {
        id: 'brute_force',
        name: 'Brute Force',
        description: 'Particles arrange in a dense pattern that enhances melee damage by 5%.'
      },
      {
        id: 'razors_edge',
        name: 'Razor\'s Edge',
        description: 'Particles form a tight, blade-like pattern, boosting precision and critical chance by 3%.'
      },
      {
        id: 'chaotic_swarm',
        name: 'Chaotic Swarm',
        description: 'Particles form a chaotic pattern that increases damage as formation breaks apart.'
      }
    ]
  },
  [Role.DEFENSE]: {
    tier: Tier.COMMON,
    role: Role.DEFENSE,
    primary: [
      {
        id: 'shield_bash',
        name: 'Shield Bash',
        description: 'Deals 10% max HP damage to one enemy and reduces their damage by 10% for 3s',
        cooldown: 10,
        category: 'primary',
        damage: 10,
        duration: 3
      },
      {
        id: 'defensive_strike',
        name: 'Defensive Strike',
        description: 'Deals 12% max HP damage to one enemy and increases own defense by 10% for 3s',
        cooldown: 12,
        category: 'primary',
        damage: 12,
        duration: 3
      },
      {
        id: 'taunt',
        name: 'Taunt',
        description: 'Forces one enemy to attack self for 3s and increases own defense by 15% for 3s',
        cooldown: 15,
        category: 'primary',
        duration: 3
      },
      {
        id: 'protective_strike',
        name: 'Protective Strike',
        description: 'Deals 8% max HP damage to one enemy and reduces their attack speed by 10% for 3s',
        cooldown: 10,
        category: 'primary',
        damage: 8,
        duration: 3
      }
    ],
    secondary: [
      {
        id: 'minor_barrier',
        name: 'Minor Barrier',
        description: 'Creates a barrier that absorbs 15% max HP damage for 5s',
        cooldown: 20,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'defensive_stance',
        name: 'Defensive Stance',
        description: '+20% defense for 5s',
        cooldown: 15,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'minor_reflect',
        name: 'Minor Reflect',
        description: 'Reflects 10% of damage taken back to attacker for 3s',
        cooldown: 25,
        category: 'secondary',
        duration: 3
      },
      {
        id: 'fortify',
        name: 'Fortify',
        description: 'Reduces damage taken by 15% for 5s',
        cooldown: 20,
        category: 'secondary',
        duration: 5
      }
    ],
    unique: [
      {
        id: 'last_stand',
        name: 'Last Stand',
        description: '+25% defense when HP < 30% for 5s',
        cooldown: 30,
        category: 'unique',
        duration: 5
      },
      {
        id: 'iron_will',
        name: 'Iron Will',
        description: 'Immune to crowd control effects for 2s',
        cooldown: 40,
        category: 'unique',
        duration: 2
      },
      {
        id: 'endurance',
        name: 'Endurance',
        description: 'Regenerates 2% HP per second for 5s',
        cooldown: 35,
        category: 'unique',
        duration: 5
      },
      {
        id: 'vigilance',
        name: 'Vigilance',
        description: '+15% dodge chance for 5s',
        cooldown: 30,
        category: 'unique',
        duration: 5
      }
    ],
    crowdControl: [
      {
        id: 'minor_root',
        name: 'Minor Root',
        description: 'Prevents one enemy from moving for 2s',
        cooldown: 20,
        category: 'crowdControl',
        duration: 2
      },
      {
        id: 'minor_snare',
        name: 'Minor Snare',
        description: 'Reduces one enemy movement speed by 20% for 3s',
        cooldown: 15,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'minor_knockdown',
        name: 'Minor Knockdown',
        description: 'Knocks down one enemy for 1s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 1
      },
      {
        id: 'minor_silence',
        name: 'Minor Silence',
        description: 'Prevents one enemy from using abilities for 1.5s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 1.5
      }
    ],
    formationTraits: [
      {
        id: 'defensive_wall',
        name: 'Defensive Wall',
        description: 'Particles form a wall-like formation that reduces damage taken by 5%.'
      },
      {
        id: 'phalanx',
        name: 'Phalanx',
        description: 'Particles arrange in a tight formation that increases defense by 5%.'
      },
      {
        id: 'bulwark',
        name: 'Bulwark',
        description: 'Particles form a shield-like pattern that absorbs 3% of incoming damage.'
      },
      {
        id: 'fortified_position',
        name: 'Fortified Position',
        description: 'Particles arrange in a fortified pattern that increases resistance to crowd control by 10%.'
      }
    ]
  },
  [Role.CONTROL]: {
    tier: Tier.COMMON,
    role: Role.CONTROL,
    primary: [
      {
        id: 'arcane_bolt',
        name: 'Arcane Bolt',
        description: 'Deals 12% max HP damage to one enemy',
        cooldown: 8,
        category: 'primary',
        damage: 12
      },
      {
        id: 'energy_blast',
        name: 'Energy Blast',
        description: 'Deals 10% max HP damage to one enemy and slows them by 10% for 2s',
        cooldown: 10,
        category: 'primary',
        damage: 10,
        duration: 2
      },
      {
        id: 'disruptive_pulse',
        name: 'Disruptive Pulse',
        description: 'Deals 8% max HP damage to one enemy and interrupts their current ability',
        cooldown: 12,
        category: 'primary',
        damage: 8
      },
      {
        id: 'mind_spike',
        name: 'Mind Spike',
        description: 'Deals 15% max HP damage to one enemy',
        cooldown: 10,
        category: 'primary',
        damage: 15
      }
    ],
    secondary: [
      {
        id: 'minor_slow',
        name: 'Minor Slow',
        description: 'Slows one enemy by 20% for 3s',
        cooldown: 15,
        category: 'secondary',
        duration: 3
      },
      {
        id: 'energy_drain',
        name: 'Energy Drain',
        description: 'Drains 10% energy from one enemy',
        cooldown: 20,
        category: 'secondary'
      },
      {
        id: 'minor_confusion',
        name: 'Minor Confusion',
        description: 'Reduces one enemy accuracy by 15% for 3s',
        cooldown: 18,
        category: 'secondary',
        duration: 3
      },
      {
        id: 'minor_weaken',
        name: 'Minor Weaken',
        description: 'Reduces one enemy damage by 15% for 3s',
        cooldown: 20,
        category: 'secondary',
        duration: 3
      }
    ],
    unique: [
      {
        id: 'minor_invisibility',
        name: 'Minor Invisibility',
        description: 'Becomes invisible for 3s',
        cooldown: 30,
        category: 'unique',
        duration: 3
      },
      {
        id: 'minor_teleport',
        name: 'Minor Teleport',
        description: 'Teleports 10 units in any direction',
        cooldown: 25,
        category: 'unique'
      },
      {
        id: 'energy_shield',
        name: 'Energy Shield',
        description: 'Creates a shield that absorbs 15% max HP damage for 5s',
        cooldown: 30,
        category: 'unique',
        duration: 5
      },
      {
        id: 'minor_haste',
        name: 'Minor Haste',
        description: '+15% movement speed for 5s',
        cooldown: 25,
        category: 'unique',
        duration: 5
      }
    ],
    crowdControl: [
      {
        id: 'minor_stun',
        name: 'Minor Stun',
        description: 'Stuns one enemy for 1s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 1
      },
      {
        id: 'minor_silence',
        name: 'Minor Silence',
        description: 'Prevents one enemy from using abilities for 1.5s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 1.5
      },
      {
        id: 'minor_fear',
        name: 'Minor Fear',
        description: 'Causes one enemy to flee for 2s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 2
      },
      {
        id: 'minor_root',
        name: 'Minor Root',
        description: 'Prevents one enemy from moving for 1.5s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 1.5
      }
    ],
    formationTraits: [
      {
        id: 'arcane_matrix',
        name: 'Arcane Matrix',
        description: 'Particles form a matrix pattern that increases ability power by 5%.'
      },
      {
        id: 'disruptive_field',
        name: 'Disruptive Field',
        description: 'Particles arrange in a field pattern that increases crowd control duration by 10%.'
      },
      {
        id: 'energy_web',
        name: 'Energy Web',
        description: 'Particles form a web-like pattern that reduces enemy movement speed by 5%.'
      },
      {
        id: 'mind_link',
        name: 'Mind Link',
        description: 'Particles arrange in a neural pattern that reduces ability cooldowns by 3%.'
      }
    ]
  },
  [Role.MOVEMENT]: {
    tier: Tier.COMMON,
    role: Role.MOVEMENT,
    primary: [
      {
        id: 'swift_strike',
        name: 'Swift Strike',
        description: 'Deals 12% max HP damage to one enemy and increases own movement speed by 10% for 3s',
        cooldown: 10,
        category: 'primary',
        damage: 12,
        duration: 3
      },
      {
        id: 'dash_attack',
        name: 'Dash Attack',
        description: 'Dashes 5 units forward and deals 10% max HP damage to one enemy',
        cooldown: 12,
        category: 'primary',
        damage: 10
      },
      {
        id: 'quick_jab',
        name: 'Quick Jab',
        description: 'Deals 8% max HP damage to one enemy and has a 15% chance to strike again',
        cooldown: 8,
        category: 'primary',
        damage: 8
      },
      {
        id: 'momentum_strike',
        name: 'Momentum Strike',
        description: 'Deals 10-20% max HP damage based on movement speed',
        cooldown: 15,
        category: 'primary',
        damage: 15
      }
    ],
    secondary: [
      {
        id: 'minor_speed_boost',
        name: 'Minor Speed Boost',
        description: '+20% movement speed for 5s',
        cooldown: 15,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'minor_dodge',
        name: 'Minor Dodge',
        description: '+15% dodge chance for 3s',
        cooldown: 20,
        category: 'secondary',
        duration: 3
      },
      {
        id: 'minor_dash',
        name: 'Minor Dash',
        description: 'Dashes 8 units in any direction',
        cooldown: 15,
        category: 'secondary'
      },
      {
        id: 'minor_leap',
        name: 'Minor Leap',
        description: 'Leaps 10 units in any direction',
        cooldown: 20,
        category: 'secondary'
      }
    ],
    unique: [
      {
        id: 'minor_blink',
        name: 'Minor Blink',
        description: 'Teleports 5 units in any direction',
        cooldown: 25,
        category: 'unique'
      },
      {
        id: 'minor_phase',
        name: 'Minor Phase',
        description: 'Becomes intangible for 2s, ignoring collisions',
        cooldown: 30,
        category: 'unique',
        duration: 2
      },
      {
        id: 'minor_haste',
        name: 'Minor Haste',
        description: '+25% movement speed for 3s',
        cooldown: 25,
        category: 'unique',
        duration: 3
      },
      {
        id: 'minor_agility',
        name: 'Minor Agility',
        description: '+10% movement speed and +10% dodge chance for 5s',
        cooldown: 30,
        category: 'unique',
        duration: 5
      }
    ],
    crowdControl: [
      {
        id: 'minor_slow',
        name: 'Minor Slow',
        description: 'Slows one enemy by 20% for 3s',
        cooldown: 15,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'minor_trip',
        name: 'Minor Trip',
        description: 'Knocks down one enemy for 1s',
        cooldown: 20,
        category: 'crowdControl',
        duration: 1
      },
      {
        id: 'minor_disorient',
        name: 'Minor Disorient',
        description: 'Reduces one enemy accuracy by 20% for 3s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'minor_cripple',
        name: 'Minor Cripple',
        description: 'Reduces one enemy movement speed by 30% for 2s',
        cooldown: 20,
        category: 'crowdControl',
        duration: 2
      }
    ],
    formationTraits: [
      {
        id: 'swift_formation',
        name: 'Swift Formation',
        description: 'Particles form a streamlined formation that increases movement speed by 5%.'
      },
      {
        id: 'evasive_pattern',
        name: 'Evasive Pattern',
        description: 'Particles arrange in an evasive pattern that increases dodge chance by 3%.'
      },
      {
        id: 'fluid_motion',
        name: 'Fluid Motion',
        description: 'Particles form a flowing pattern that reduces the cooldown of movement abilities by 5%.'
      },
      {
        id: 'momentum_matrix',
        name: 'Momentum Matrix',
        description: 'Particles arrange in a dynamic pattern that increases damage based on movement speed.'
      }
    ]
  }
};

/**
 * Tier 2 (Uncommon) ability pools
 */
export const TIER_2_ABILITIES: Record<Role, AbilityPool> = {
  // Will be populated with abilities for each role
  [Role.CORE]: {
    tier: Tier.UNCOMMON,
    role: Role.CORE,
    primary: [
      {
        id: 'moderate_heal',
        name: 'Moderate Heal',
        description: 'Restores 18% HP to one ally when HP < 60%',
        cooldown: 18,
        category: 'primary',
        healing: 18
      },
      {
        id: 'rejuvenate',
        name: 'Rejuvenate',
        description: 'Restores 15% HP to one ally and increases their healing received by 10% for 5s',
        cooldown: 20,
        category: 'primary',
        healing: 15,
        duration: 5
      },
      {
        id: 'enhanced_group_heal',
        name: 'Enhanced Group Heal',
        description: 'Restores 10% HP to all allies within 15 units',
        cooldown: 25,
        category: 'primary',
        healing: 10,
        area: 15
      },
      {
        id: 'healing_wave',
        name: 'Healing Wave',
        description: 'Restores 12% HP to primary target and 6% HP to nearby allies',
        cooldown: 22,
        category: 'primary',
        healing: 12,
        area: 8
      }
    ],
    secondary: [
      {
        id: 'defense_boost',
        name: 'Defense Boost',
        description: '+12% defense to one ally for 8s',
        cooldown: 25,
        category: 'secondary',
        duration: 8
      },
      {
        id: 'enhanced_cleanse',
        name: 'Enhanced Cleanse',
        description: 'Removes two debuffs from one ally and grants 5% damage reduction for 3s',
        cooldown: 30,
        category: 'secondary',
        duration: 3
      },
      {
        id: 'group_defense',
        name: 'Group Defense',
        description: '+8% defense to all allies for 5s',
        cooldown: 35,
        category: 'secondary',
        duration: 5,
        area: 12
      },
      {
        id: 'energy_infusion',
        name: 'Energy Infusion',
        description: 'Transfers 15% energy to one ally and reduces their ability cooldowns by 10%',
        cooldown: 30,
        category: 'secondary',
        energyCost: 15
      }
    ],
    unique: [
      {
        id: 'dispel',
        name: 'Dispel',
        description: 'Removes all debuffs from one ally',
        cooldown: 40,
        category: 'unique'
      },
      {
        id: 'protective_shield',
        name: 'Protective Shield',
        description: 'Absorbs 20% max HP damage for one ally for 6s',
        cooldown: 35,
        category: 'unique',
        duration: 6
      },
      {
        id: 'regeneration',
        name: 'Regeneration',
        description: 'Restores 3% HP per second for 8s to one ally',
        cooldown: 30,
        category: 'unique',
        healing: 3,
        duration: 8
      },
      {
        id: 'energy_surge',
        name: 'Energy Surge',
        description: 'Restores 25% energy to one ally and increases their energy regeneration by 10% for 5s',
        cooldown: 35,
        category: 'unique',
        duration: 5
      }
    ],
    crowdControl: [
      {
        id: 'moderate_slow',
        name: 'Moderate Slow',
        description: 'Slows one enemy by 20% for 4s',
        cooldown: 20,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'weaken',
        name: 'Weaken',
        description: 'Reduces one enemy damage by 15% for 5s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 5
      },
      {
        id: 'disrupt',
        name: 'Disrupt',
        description: 'Interrupts one enemy ability and increases its cooldown by 20%',
        cooldown: 35,
        category: 'crowdControl'
      },
      {
        id: 'daze',
        name: 'Daze',
        description: 'Reduces one enemy accuracy by 25% for 4s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 4
      }
    ],
    formationTraits: [
      {
        id: 'healing_aura',
        name: 'Healing Aura',
        description: 'Particles form a healing formation that enhances healing effects by 10% and provides 2% HP regeneration per minute.'
      },
      {
        id: 'protective_sphere',
        name: 'Protective Sphere',
        description: 'Particles arrange in a spherical pattern that provides 6% damage reduction and 5% increased healing received.'
      },
      {
        id: 'restorative_matrix',
        name: 'Restorative Matrix',
        description: 'Particles form a complex grid pattern that enhances healing received by 8% and reduces debuff duration by 10%.'
      },
      {
        id: 'energy_circuit',
        name: 'Energy Circuit',
        description: 'Particles arrange in a circuit pattern that reduces ability cooldowns by 5% and increases energy regeneration by 10%.'
      }
    ]
  },
  [Role.ATTACK]: {
    tier: Tier.UNCOMMON,
    role: Role.ATTACK,
    primary: [
      {
        id: 'fierce_strike',
        name: 'Fierce Strike',
        description: 'Deals 25% max HP damage to one enemy',
        cooldown: 10,
        category: 'primary',
        damage: 25
      },
      {
        id: 'brutal_strike',
        name: 'Brutal Strike',
        description: 'Deals 30% max HP damage to one enemy',
        cooldown: 12,
        category: 'primary',
        damage: 30
      },
      {
        id: 'rending_strike',
        name: 'Rending Strike',
        description: 'Deals 22% max HP damage to one enemy and reduces their defense by 10% for 3s',
        cooldown: 15,
        category: 'primary',
        damage: 22,
        duration: 3
      },
      {
        id: 'savage_strike',
        name: 'Savage Strike',
        description: 'Deals 20% max HP damage to one enemy with 20% chance to deal 10% additional damage',
        cooldown: 12,
        category: 'primary',
        damage: 20
      }
    ],
    secondary: [
      {
        id: 'enhanced_power_strike',
        name: 'Enhanced Power Strike',
        description: 'Deals 18% max HP damage to one enemy with 15% chance to stun for 1.5s',
        cooldown: 15,
        category: 'secondary',
        damage: 18,
        duration: 1.5
      },
      {
        id: 'triple_strike',
        name: 'Triple Strike',
        description: 'Deals 10% max HP damage to one enemy three times',
        cooldown: 18,
        category: 'secondary',
        damage: 30
      },
      {
        id: 'enhanced_reckless_attack',
        name: 'Enhanced Reckless Attack',
        description: 'Deals 35% max HP damage to one enemy but takes 8% self damage',
        cooldown: 15,
        category: 'secondary',
        damage: 35
      },
      {
        id: 'enhanced_precise_strike',
        name: 'Enhanced Precise Strike',
        description: 'Deals 22% max HP damage to one enemy with 25% increased critical chance',
        cooldown: 12,
        category: 'secondary',
        damage: 22
      }
    ],
    unique: [
      {
        id: 'enhanced_battle_fury',
        name: 'Enhanced Battle Fury',
        description: '+15% attack speed for 8s',
        cooldown: 30,
        category: 'unique',
        duration: 8
      },
      {
        id: 'enhanced_combat_stance',
        name: 'Enhanced Combat Stance',
        description: '+25% damage for 5s',
        cooldown: 35,
        category: 'unique',
        duration: 5
      },
      {
        id: 'enhanced_adrenaline_rush',
        name: 'Enhanced Adrenaline Rush',
        description: '+15% movement speed and +15% attack speed for 5s',
        cooldown: 40,
        category: 'unique',
        duration: 5
      },
      {
        id: 'enhanced_battle_focus',
        name: 'Enhanced Battle Focus',
        description: '+30% critical damage for 8s',
        cooldown: 35,
        category: 'unique',
        duration: 8
      }
    ],
    crowdControl: [
      {
        id: 'enhanced_knockback',
        name: 'Enhanced Knockback',
        description: 'Pushes one enemy back 8 units and slows them by 15% for 2s',
        cooldown: 18,
        category: 'crowdControl',
        duration: 2
      },
      {
        id: 'moderate_stun',
        name: 'Moderate Stun',
        description: 'Stuns one enemy for 1.5s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 1.5
      },
      {
        id: 'enhanced_disarm',
        name: 'Enhanced Disarm',
        description: 'Prevents one enemy from using primary and secondary abilities for 2.5s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 2.5
      },
      {
        id: 'enhanced_intimidate',
        name: 'Enhanced Intimidate',
        description: 'Reduces one enemy damage by 20% for 4s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 4
      }
    ],
    formationTraits: [
      {
        id: 'enhanced_aggressive_stance',
        name: 'Enhanced Aggressive Stance',
        description: 'Particles form an aggressive formation that increases damage output by 10% and critical chance by 5%.'
      },
      {
        id: 'enhanced_brute_force',
        name: 'Enhanced Brute Force',
        description: 'Particles arrange in a dense pattern that enhances melee damage by 12% and attack speed by 5%.'
      },
      {
        id: 'enhanced_razors_edge',
        name: 'Enhanced Razor\'s Edge',
        description: 'Particles form a tight, blade-like pattern, boosting precision, critical chance by 8% and critical damage by 15%.'
      },
      {
        id: 'enhanced_chaotic_swarm',
        name: 'Enhanced Chaotic Swarm',
        description: 'Particles form a chaotic pattern that increases damage by 5-15% as formation breaks apart.'
      }
    ]
  },
  [Role.DEFENSE]: {
    tier: Tier.UNCOMMON,
    role: Role.DEFENSE,
    primary: [
      {
        id: 'enhanced_shield_bash',
        name: 'Enhanced Shield Bash',
        description: 'Deals 15% max HP damage to one enemy and reduces their damage by 15% for 4s',
        cooldown: 12,
        category: 'primary',
        damage: 15,
        duration: 4
      },
      {
        id: 'enhanced_defensive_strike',
        name: 'Enhanced Defensive Strike',
        description: 'Deals 18% max HP damage to one enemy and increases own defense by 15% for 4s',
        cooldown: 15,
        category: 'primary',
        damage: 18,
        duration: 4
      },
      {
        id: 'enhanced_taunt',
        name: 'Enhanced Taunt',
        description: 'Forces one enemy to attack self for 4s and increases own defense by 20% for 4s',
        cooldown: 18,
        category: 'primary',
        duration: 4
      },
      {
        id: 'enhanced_protective_strike',
        name: 'Enhanced Protective Strike',
        description: 'Deals 12% max HP damage to one enemy and reduces their attack speed by 15% for 4s',
        cooldown: 12,
        category: 'primary',
        damage: 12,
        duration: 4
      }
    ],
    secondary: [
      {
        id: 'barrier',
        name: 'Barrier',
        description: 'Creates a barrier that absorbs 25% max HP damage for 6s',
        cooldown: 25,
        category: 'secondary',
        duration: 6
      },
      {
        id: 'enhanced_defensive_stance',
        name: 'Enhanced Defensive Stance',
        description: '+30% defense for 6s',
        cooldown: 20,
        category: 'secondary',
        duration: 6
      },
      {
        id: 'reflect',
        name: 'Reflect',
        description: 'Reflects 20% of damage taken back to attacker for 4s',
        cooldown: 30,
        category: 'secondary',
        duration: 4
      },
      {
        id: 'enhanced_fortify',
        name: 'Enhanced Fortify',
        description: 'Reduces damage taken by 25% for 5s',
        cooldown: 25,
        category: 'secondary',
        duration: 5
      }
    ],
    unique: [
      {
        id: 'enhanced_last_stand',
        name: 'Enhanced Last Stand',
        description: '+40% defense when HP < 30% for 6s',
        cooldown: 35,
        category: 'unique',
        duration: 6
      },
      {
        id: 'enhanced_iron_will',
        name: 'Enhanced Iron Will',
        description: 'Immune to crowd control effects for 3s',
        cooldown: 45,
        category: 'unique',
        duration: 3
      },
      {
        id: 'enhanced_endurance',
        name: 'Enhanced Endurance',
        description: 'Regenerates 3% HP per second for 6s',
        cooldown: 40,
        category: 'unique',
        duration: 6
      },
      {
        id: 'enhanced_vigilance',
        name: 'Enhanced Vigilance',
        description: '+25% dodge chance for 6s',
        cooldown: 35,
        category: 'unique',
        duration: 6
      }
    ],
    crowdControl: [
      {
        id: 'root',
        name: 'Root',
        description: 'Prevents one enemy from moving for 3s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'snare',
        name: 'Snare',
        description: 'Reduces one enemy movement speed by 30% for 4s',
        cooldown: 20,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'knockdown',
        name: 'Knockdown',
        description: 'Knocks down one enemy for 1.5s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 1.5
      },
      {
        id: 'silence',
        name: 'Silence',
        description: 'Prevents one enemy from using abilities for 2s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 2
      }
    ],
    formationTraits: [
      {
        id: 'enhanced_defensive_wall',
        name: 'Enhanced Defensive Wall',
        description: 'Particles form a wall-like formation that reduces damage taken by 10% and reflects 5% damage back to attackers.'
      },
      {
        id: 'enhanced_phalanx',
        name: 'Enhanced Phalanx',
        description: 'Particles arrange in a tight formation that increases defense by 12% and reduces critical damage taken by 15%.'
      },
      {
        id: 'enhanced_bulwark',
        name: 'Enhanced Bulwark',
        description: 'Particles form a shield-like pattern that absorbs 8% of incoming damage and increases max health by 5%.'
      },
      {
        id: 'enhanced_fortified_position',
        name: 'Enhanced Fortified Position',
        description: 'Particles arrange in a fortified pattern that increases resistance to crowd control by 20% and reduces damage taken by 5%.'
      }
    ]
  },
  [Role.CONTROL]: {
    tier: Tier.UNCOMMON,
    role: Role.CONTROL,
    primary: [
      {
        id: 'enhanced_arcane_bolt',
        name: 'Enhanced Arcane Bolt',
        description: 'Deals 18% max HP damage to one enemy',
        cooldown: 8,
        category: 'primary',
        damage: 18
      },
      {
        id: 'enhanced_energy_blast',
        name: 'Enhanced Energy Blast',
        description: 'Deals 15% max HP damage to one enemy and slows them by 15% for 3s',
        cooldown: 10,
        category: 'primary',
        damage: 15,
        duration: 3
      },
      {
        id: 'enhanced_disruptive_pulse',
        name: 'Enhanced Disruptive Pulse',
        description: 'Deals 12% max HP damage to one enemy, interrupts their current ability, and increases its cooldown by 20%',
        cooldown: 15,
        category: 'primary',
        damage: 12
      },
      {
        id: 'enhanced_mind_spike',
        name: 'Enhanced Mind Spike',
        description: 'Deals 22% max HP damage to one enemy',
        cooldown: 12,
        category: 'primary',
        damage: 22
      }
    ],
    secondary: [
      {
        id: 'moderate_slow',
        name: 'Moderate Slow',
        description: 'Slows one enemy by 30% for 4s',
        cooldown: 18,
        category: 'secondary',
        duration: 4
      },
      {
        id: 'enhanced_energy_drain',
        name: 'Enhanced Energy Drain',
        description: 'Drains 20% energy from one enemy',
        cooldown: 25,
        category: 'secondary'
      },
      {
        id: 'confusion',
        name: 'Confusion',
        description: 'Reduces one enemy accuracy by 25% for 4s',
        cooldown: 22,
        category: 'secondary',
        duration: 4
      },
      {
        id: 'weaken',
        name: 'Weaken',
        description: 'Reduces one enemy damage by 25% for 4s',
        cooldown: 25,
        category: 'secondary',
        duration: 4
      }
    ],
    unique: [
      {
        id: 'invisibility',
        name: 'Invisibility',
        description: 'Becomes invisible for 5s',
        cooldown: 35,
        category: 'unique',
        duration: 5
      },
      {
        id: 'teleport',
        name: 'Teleport',
        description: 'Teleports 15 units in any direction',
        cooldown: 30,
        category: 'unique'
      },
      {
        id: 'enhanced_energy_shield',
        name: 'Enhanced Energy Shield',
        description: 'Creates a shield that absorbs 25% max HP damage for 6s',
        cooldown: 35,
        category: 'unique',
        duration: 6
      },
      {
        id: 'haste',
        name: 'Haste',
        description: '+25% movement speed for 6s',
        cooldown: 30,
        category: 'unique',
        duration: 6
      }
    ],
    crowdControl: [
      {
        id: 'moderate_stun',
        name: 'Moderate Stun',
        description: 'Stuns one enemy for 1.5s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 1.5
      },
      {
        id: 'silence',
        name: 'Silence',
        description: 'Prevents one enemy from using abilities for 2s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 2
      },
      {
        id: 'fear',
        name: 'Fear',
        description: 'Causes one enemy to flee for 3s',
        cooldown: 40,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'root',
        name: 'Root',
        description: 'Prevents one enemy from moving for 2s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 2
      }
    ],
    formationTraits: [
      {
        id: 'enhanced_arcane_matrix',
        name: 'Enhanced Arcane Matrix',
        description: 'Particles form a matrix pattern that increases ability power by 10% and reduces ability cooldowns by 5%.'
      },
      {
        id: 'enhanced_disruptive_field',
        name: 'Enhanced Disruptive Field',
        description: 'Particles arrange in a field pattern that increases crowd control duration by 20% and reduces enemy healing by 15%.'
      },
      {
        id: 'enhanced_energy_web',
        name: 'Enhanced Energy Web',
        description: 'Particles form a web-like pattern that reduces enemy movement speed by 10% and drains 2% of their energy per second.'
      },
      {
        id: 'enhanced_mind_link',
        name: 'Enhanced Mind Link',
        description: 'Particles arrange in a neural pattern that reduces ability cooldowns by 8% and increases ability range by 15%.'
      }
    ]
  },
  [Role.MOVEMENT]: {
    tier: Tier.UNCOMMON,
    role: Role.MOVEMENT,
    primary: [
      {
        id: 'enhanced_swift_strike',
        name: 'Enhanced Swift Strike',
        description: 'Deals 18% max HP damage to one enemy and increases own movement speed by 15% for 4s',
        cooldown: 12,
        category: 'primary',
        damage: 18,
        duration: 4
      },
      {
        id: 'enhanced_dash_attack',
        name: 'Enhanced Dash Attack',
        description: 'Dashes 8 units forward and deals 15% max HP damage to one enemy',
        cooldown: 15,
        category: 'primary',
        damage: 15
      },
      {
        id: 'enhanced_quick_jab',
        name: 'Enhanced Quick Jab',
        description: 'Deals 12% max HP damage to one enemy and has a 25% chance to strike again',
        cooldown: 10,
        category: 'primary',
        damage: 12
      },
      {
        id: 'enhanced_momentum_strike',
        name: 'Enhanced Momentum Strike',
        description: 'Deals 15-30% max HP damage based on movement speed',
        cooldown: 18,
        category: 'primary',
        damage: 22
      }
    ],
    secondary: [
      {
        id: 'speed_boost',
        name: 'Speed Boost',
        description: '+30% movement speed for 6s',
        cooldown: 18,
        category: 'secondary',
        duration: 6
      },
      {
        id: 'dodge',
        name: 'Dodge',
        description: '+25% dodge chance for 4s',
        cooldown: 25,
        category: 'secondary',
        duration: 4
      },
      {
        id: 'dash',
        name: 'Dash',
        description: 'Dashes 12 units in any direction',
        cooldown: 18,
        category: 'secondary'
      },
      {
        id: 'leap',
        name: 'Leap',
        description: 'Leaps 15 units in any direction',
        cooldown: 25,
        category: 'secondary'
      }
    ],
    unique: [
      {
        id: 'blink',
        name: 'Blink',
        description: 'Teleports 8 units in any direction',
        cooldown: 30,
        category: 'unique'
      },
      {
        id: 'phase',
        name: 'Phase',
        description: 'Becomes intangible for 3s, ignoring collisions',
        cooldown: 35,
        category: 'unique',
        duration: 3
      },
      {
        id: 'haste',
        name: 'Haste',
        description: '+35% movement speed for 4s',
        cooldown: 30,
        category: 'unique',
        duration: 4
      },
      {
        id: 'agility',
        name: 'Agility',
        description: '+15% movement speed and +15% dodge chance for 6s',
        cooldown: 35,
        category: 'unique',
        duration: 6
      }
    ],
    crowdControl: [
      {
        id: 'moderate_slow',
        name: 'Moderate Slow',
        description: 'Slows one enemy by 30% for 4s',
        cooldown: 18,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'trip',
        name: 'Trip',
        description: 'Knocks down one enemy for 1.5s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 1.5
      },
      {
        id: 'disorient',
        name: 'Disorient',
        description: 'Reduces one enemy accuracy by 30% for 4s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'cripple',
        name: 'Cripple',
        description: 'Reduces one enemy movement speed by 40% for 3s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 3
      }
    ],
    formationTraits: [
      {
        id: 'enhanced_swift_formation',
        name: 'Enhanced Swift Formation',
        description: 'Particles form a streamlined formation that increases movement speed by 10% and dodge chance by 5%.'
      },
      {
        id: 'enhanced_evasive_pattern',
        name: 'Enhanced Evasive Pattern',
        description: 'Particles arrange in an evasive pattern that increases dodge chance by 8% and reduces damage taken by 5%.'
      },
      {
        id: 'enhanced_fluid_motion',
        name: 'Enhanced Fluid Motion',
        description: 'Particles form a flowing pattern that reduces the cooldown of movement abilities by 10% and increases movement speed after using abilities by 15%.'
      },
      {
        id: 'enhanced_momentum_matrix',
        name: 'Enhanced Momentum Matrix',
        description: 'Particles arrange in a dynamic pattern that increases damage by 2% for every 5% of movement speed above base speed.'
      }
    ]
  }
};

/**
 * Tier 3 (Rare) ability pools
 */
export const TIER_3_ABILITIES: Record<Role, AbilityPool> = {
  // Will be populated with abilities for each role
  [Role.CORE]: {
    tier: Tier.RARE,
    role: Role.CORE,
    primary: [
      {
        id: 'major_heal',
        name: 'Major Heal',
        description: 'Restores 30% HP to one ally',
        cooldown: 20,
        category: 'primary',
        healing: 30
      },
      {
        id: 'revitalize',
        name: 'Revitalize',
        description: 'Restores 25% HP to one ally and increases their healing received by 20% for 6s',
        cooldown: 25,
        category: 'primary',
        healing: 25,
        duration: 6
      },
      {
        id: 'mass_heal',
        name: 'Mass Heal',
        description: 'Restores 15% HP to all allies within 20 units',
        cooldown: 30,
        category: 'primary',
        healing: 15,
        area: 20
      },
      {
        id: 'healing_surge',
        name: 'Healing Surge',
        description: 'Restores 20% HP to primary target and 10% HP to nearby allies',
        cooldown: 25,
        category: 'primary',
        healing: 20,
        area: 10
      }
    ],
    secondary: [
      {
        id: 'major_defense_boost',
        name: 'Major Defense Boost',
        description: '+20% defense to one ally for 10s',
        cooldown: 30,
        category: 'secondary',
        duration: 10
      },
      {
        id: 'purify',
        name: 'Purify',
        description: 'Removes all debuffs from one ally and grants 10% damage reduction for 5s',
        cooldown: 35,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'mass_defense',
        name: 'Mass Defense',
        description: '+15% defense to all allies for 8s',
        cooldown: 40,
        category: 'secondary',
        duration: 8,
        area: 15
      },
      {
        id: 'energy_cascade',
        name: 'Energy Cascade',
        description: 'Transfers 25% energy to one ally and reduces their ability cooldowns by 20%',
        cooldown: 35,
        category: 'secondary',
        energyCost: 25
      }
    ],
    unique: [
      {
        id: 'mass_dispel',
        name: 'Mass Dispel',
        description: 'Removes all debuffs from all allies within 15 units',
        cooldown: 45,
        category: 'unique',
        area: 15
      },
      {
        id: 'divine_shield',
        name: 'Divine Shield',
        description: 'Absorbs 35% max HP damage for one ally for 8s',
        cooldown: 40,
        category: 'unique',
        duration: 8
      },
      {
        id: 'rapid_regeneration',
        name: 'Rapid Regeneration',
        description: 'Restores 5% HP per second for 10s to one ally',
        cooldown: 35,
        category: 'unique',
        healing: 5,
        duration: 10
      },
      {
        id: 'energy_fountain',
        name: 'Energy Fountain',
        description: 'Restores 40% energy to one ally and increases their energy regeneration by 20% for 8s',
        cooldown: 40,
        category: 'unique',
        duration: 8
      }
    ],
    crowdControl: [
      {
        id: 'major_slow',
        name: 'Major Slow',
        description: 'Slows one enemy by 40% for 5s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 5
      },
      {
        id: 'enfeeble',
        name: 'Enfeeble',
        description: 'Reduces one enemy damage by 25% for 6s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 6
      },
      {
        id: 'major_disrupt',
        name: 'Major Disrupt',
        description: 'Interrupts one enemy ability and increases its cooldown by 50%',
        cooldown: 40,
        category: 'crowdControl'
      },
      {
        id: 'blind',
        name: 'Blind',
        description: 'Reduces one enemy accuracy by 50% for 4s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 4
      }
    ],
    formationTraits: [
      {
        id: 'radiant_aura',
        name: 'Radiant Aura',
        description: 'Particles form a radiant formation that enhances healing effects by 20% and provides 3% HP regeneration per minute to all allies.'
      },
      {
        id: 'sanctuary_sphere',
        name: 'Sanctuary Sphere',
        description: 'Particles arrange in a spherical pattern that provides 12% damage reduction and 15% increased healing received.'
      },
      {
        id: 'life_matrix',
        name: 'Life Matrix',
        description: 'Particles form a complex grid pattern that enhances healing received by 15%, reduces debuff duration by 25%, and provides immunity to new debuffs every 30s.'
      },
      {
        id: 'mana_circuit',
        name: 'Mana Circuit',
        description: 'Particles arrange in a circuit pattern that reduces ability cooldowns by 10%, increases energy regeneration by 20%, and restores 5% energy when healing allies.'
      }
    ]
  },
  [Role.ATTACK]: {
    tier: Tier.RARE,
    role: Role.ATTACK,
    primary: [
      {
        id: 'devastating_strike',
        name: 'Devastating Strike',
        description: 'Deals 40% max HP damage to one enemy',
        cooldown: 15,
        category: 'primary',
        damage: 40
      },
      {
        id: 'crushing_blow',
        name: 'Crushing Blow',
        description: 'Deals 50% max HP damage to one enemy',
        cooldown: 18,
        category: 'primary',
        damage: 50
      },
      {
        id: 'sundering_strike',
        name: 'Sundering Strike',
        description: 'Deals 35% max HP damage to one enemy and reduces their defense by 20% for 5s',
        cooldown: 20,
        category: 'primary',
        damage: 35,
        duration: 5
      },
      {
        id: 'relentless_assault',
        name: 'Relentless Assault',
        description: 'Deals 30% max HP damage to one enemy with 30% chance to deal 15% additional damage',
        cooldown: 15,
        category: 'primary',
        damage: 30
      }
    ],
    secondary: [
      {
        id: 'mighty_blow',
        name: 'Mighty Blow',
        description: 'Deals 30% max HP damage to one enemy with 25% chance to stun for 2s',
        cooldown: 20,
        category: 'secondary',
        damage: 30,
        duration: 2
      },
      {
        id: 'flurry',
        name: 'Flurry',
        description: 'Deals 15% max HP damage to one enemy four times',
        cooldown: 25,
        category: 'secondary',
        damage: 60
      },
      {
        id: 'berserker_strike',
        name: 'Berserker Strike',
        description: 'Deals 60% max HP damage to one enemy but takes 15% self damage',
        cooldown: 20,
        category: 'secondary',
        damage: 60
      },
      {
        id: 'deadly_strike',
        name: 'Deadly Strike',
        description: 'Deals 35% max HP damage to one enemy with 40% increased critical chance',
        cooldown: 18,
        category: 'secondary',
        damage: 35
      }
    ],
    unique: [
      {
        id: 'battle_rage',
        name: 'Battle Rage',
        description: '+25% attack speed for 10s',
        cooldown: 35,
        category: 'unique',
        duration: 10
      },
      {
        id: 'bloodlust',
        name: 'Bloodlust',
        description: '+40% damage for 6s',
        cooldown: 40,
        category: 'unique',
        duration: 6
      },
      {
        id: 'frenzy',
        name: 'Frenzy',
        description: '+20% movement speed and +20% attack speed for 8s',
        cooldown: 45,
        category: 'unique',
        duration: 8
      },
      {
        id: 'deadly_precision',
        name: 'Deadly Precision',
        description: '+50% critical damage for 10s',
        cooldown: 40,
        category: 'unique',
        duration: 10
      }
    ],
    crowdControl: [
      {
        id: 'shockwave',
        name: 'Shockwave',
        description: 'Pushes all enemies within 10 units back 10 units and slows them by 20% for 3s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 3,
        area: 10
      },
      {
        id: 'major_stun',
        name: 'Major Stun',
        description: 'Stuns one enemy for 2.5s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 2.5
      },
      {
        id: 'crippling_strike',
        name: 'Crippling Strike',
        description: 'Prevents one enemy from using primary and secondary abilities for 4s',
        cooldown: 40,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'terrify',
        name: 'Terrify',
        description: 'Reduces one enemy damage by 30% for 6s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 6
      }
    ],
    formationTraits: [
      {
        id: 'battle_formation',
        name: 'Battle Formation',
        description: 'Particles form an aggressive formation that increases damage output by 20%, critical chance by 10%, and provides 5% lifesteal.'
      },
      {
        id: 'overwhelming_force',
        name: 'Overwhelming Force',
        description: 'Particles arrange in a dense pattern that enhances melee damage by 25%, attack speed by 10%, and provides 10% armor penetration.'
      },
      {
        id: 'executioner_edge',
        name: 'Executioner\'s Edge',
        description: 'Particles form a blade-like pattern, boosting precision, critical chance by 15%, critical damage by 30%, and dealing 10% bonus damage to targets below 30% health.'
      },
      {
        id: 'berserker_swarm',
        name: 'Berserker Swarm',
        description: 'Particles form a chaotic pattern that increases damage by 5% for each 10% of health missing, up to 25% at low health.'
      }
    ]
  },
  [Role.DEFENSE]: {
    tier: Tier.RARE,
    role: Role.DEFENSE,
    primary: [
      {
        id: 'shield_slam',
        name: 'Shield Slam',
        description: 'Deals 25% max HP damage to one enemy and reduces their damage by 25% for 5s',
        cooldown: 15,
        category: 'primary',
        damage: 25,
        duration: 5
      },
      {
        id: 'guardian_strike',
        name: 'Guardian Strike',
        description: 'Deals 30% max HP damage to one enemy and increases own defense by 25% for 5s',
        cooldown: 18,
        category: 'primary',
        damage: 30,
        duration: 5
      },
      {
        id: 'challenging_shout',
        name: 'Challenging Shout',
        description: 'Forces all enemies within 10 units to attack self for 5s and increases own defense by 30% for 5s',
        cooldown: 25,
        category: 'primary',
        duration: 5,
        area: 10
      },
      {
        id: 'debilitating_strike',
        name: 'Debilitating Strike',
        description: 'Deals 20% max HP damage to one enemy and reduces their attack speed by 25% for 5s',
        cooldown: 15,
        category: 'primary',
        damage: 20,
        duration: 5
      }
    ],
    secondary: [
      {
        id: 'major_barrier',
        name: 'Major Barrier',
        description: 'Creates a barrier that absorbs 40% max HP damage for 8s',
        cooldown: 30,
        category: 'secondary',
        duration: 8
      },
      {
        id: 'fortress_stance',
        name: 'Fortress Stance',
        description: '+50% defense for 8s',
        cooldown: 25,
        category: 'secondary',
        duration: 8
      },
      {
        id: 'major_reflect',
        name: 'Major Reflect',
        description: 'Reflects 35% of damage taken back to attacker for 5s',
        cooldown: 35,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'indomitable',
        name: 'Indomitable',
        description: 'Reduces damage taken by 40% for 6s',
        cooldown: 30,
        category: 'secondary',
        duration: 6
      }
    ],
    unique: [
      {
        id: 'unbreakable',
        name: 'Unbreakable',
        description: '+60% defense when HP < 30% for 8s',
        cooldown: 45,
        category: 'unique',
        duration: 8
      },
      {
        id: 'unyielding',
        name: 'Unyielding',
        description: 'Immune to crowd control effects for 5s',
        cooldown: 50,
        category: 'unique',
        duration: 5
      },
      {
        id: 'second_wind',
        name: 'Second Wind',
        description: 'Regenerates 8% HP per second for 5s',
        cooldown: 45,
        category: 'unique',
        duration: 5
      },
      {
        id: 'evasion',
        name: 'Evasion',
        description: '+40% dodge chance for 6s',
        cooldown: 40,
        category: 'unique',
        duration: 6
      }
    ],
    crowdControl: [
      {
        id: 'entangle',
        name: 'Entangle',
        description: 'Prevents one enemy from moving for 4s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'crippling_blow',
        name: 'Crippling Blow',
        description: 'Reduces one enemy movement speed by 50% for 5s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 5
      },
      {
        id: 'concussive_blow',
        name: 'Concussive Blow',
        description: 'Knocks down one enemy for 2.5s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 2.5
      },
      {
        id: 'deafening_roar',
        name: 'Deafening Roar',
        description: 'Prevents all enemies within 8 units from using abilities for 2s',
        cooldown: 40,
        category: 'crowdControl',
        duration: 2,
        area: 8
      }
    ],
    formationTraits: [
      {
        id: 'impenetrable_wall',
        name: 'Impenetrable Wall',
        description: 'Particles form a wall-like formation that reduces damage taken by 20%, reflects 10% damage back to attackers, and grants immunity to knockback effects.'
      },
      {
        id: 'iron_phalanx',
        name: 'Iron Phalanx',
        description: 'Particles arrange in a tight formation that increases defense by 25%, reduces critical damage taken by 30%, and provides 10% chance to block attacks completely.'
      },
      {
        id: 'living_fortress',
        name: 'Living Fortress',
        description: 'Particles form a fortress-like pattern that absorbs 15% of incoming damage, increases max health by 10%, and provides 5% health regeneration when below 50% health.'
      },
      {
        id: 'unbreakable_formation',
        name: 'Unbreakable Formation',
        description: 'Particles arrange in a fortified pattern that increases resistance to crowd control by 40%, reduces damage taken by 15%, and provides immunity to the first crowd control effect every 20s.'
      }
    ]
  },
  [Role.CONTROL]: {
    tier: Tier.RARE,
    role: Role.CONTROL,
    primary: [
      {
        id: 'arcane_blast',
        name: 'Arcane Blast',
        description: 'Deals 30% max HP damage to one enemy',
        cooldown: 12,
        category: 'primary',
        damage: 30
      },
      {
        id: 'energy_surge',
        name: 'Energy Surge',
        description: 'Deals 25% max HP damage to one enemy and slows them by 25% for 4s',
        cooldown: 15,
        category: 'primary',
        damage: 25,
        duration: 4
      },
      {
        id: 'mind_blast',
        name: 'Mind Blast',
        description: 'Deals 20% max HP damage to one enemy, interrupts their current ability, and increases its cooldown by 50%',
        cooldown: 18,
        category: 'primary',
        damage: 20
      },
      {
        id: 'psychic_assault',
        name: 'Psychic Assault',
        description: 'Deals 35% max HP damage to one enemy',
        cooldown: 15,
        category: 'primary',
        damage: 35
      }
    ],
    secondary: [
      {
        id: 'major_slow',
        name: 'Major Slow',
        description: 'Slows one enemy by 50% for 5s',
        cooldown: 20,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'energy_siphon',
        name: 'Energy Siphon',
        description: 'Drains 30% energy from one enemy and gains 15% energy',
        cooldown: 30,
        category: 'secondary'
      },
      {
        id: 'disorientation',
        name: 'Disorientation',
        description: 'Reduces one enemy accuracy by 40% for 5s',
        cooldown: 25,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'enfeeble',
        name: 'Enfeeble',
        description: 'Reduces one enemy damage by 35% for 5s',
        cooldown: 30,
        category: 'secondary',
        duration: 5
      }
    ],
    unique: [
      {
        id: 'greater_invisibility',
        name: 'Greater Invisibility',
        description: 'Becomes invisible for 8s and gains 20% movement speed',
        cooldown: 40,
        category: 'unique',
        duration: 8
      },
      {
        id: 'dimensional_shift',
        name: 'Dimensional Shift',
        description: 'Teleports 25 units in any direction and becomes invulnerable for 1s',
        cooldown: 35,
        category: 'unique',
        duration: 1
      },
      {
        id: 'arcane_barrier',
        name: 'Arcane Barrier',
        description: 'Creates a shield that absorbs 40% max HP damage for 8s and reflects 15% of absorbed damage',
        cooldown: 40,
        category: 'unique',
        duration: 8
      },
      {
        id: 'time_warp',
        name: 'Time Warp',
        description: '+40% movement speed for 6s and reduces ability cooldowns by 20%',
        cooldown: 35,
        category: 'unique',
        duration: 6
      }
    ],
    crowdControl: [
      {
        id: 'paralyze',
        name: 'Paralyze',
        description: 'Stuns one enemy for 3s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 3
      },
      {
        id: 'mass_silence',
        name: 'Mass Silence',
        description: 'Prevents all enemies within 10 units from using abilities for 2s',
        cooldown: 40,
        category: 'crowdControl',
        duration: 2,
        area: 10
      },
      {
        id: 'terror',
        name: 'Terror',
        description: 'Causes one enemy to flee for 4s',
        cooldown: 45,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'entangle',
        name: 'Entangle',
        description: 'Prevents one enemy from moving for 3s and deals 5% max HP damage per second',
        cooldown: 35,
        category: 'crowdControl',
        duration: 3,
        damage: 15
      }
    ],
    formationTraits: [
      {
        id: 'arcane_nexus',
        name: 'Arcane Nexus',
        description: 'Particles form a complex matrix pattern that increases ability power by 25%, reduces ability cooldowns by 10%, and provides 5% chance to cast abilities without cooldown.'
      },
      {
        id: 'reality_distortion',
        name: 'Reality Distortion',
        description: 'Particles arrange in a distortion pattern that increases crowd control duration by 30%, reduces enemy healing by 25%, and provides 15% chance to apply a random crowd control effect on hit.'
      },
      {
        id: 'psionic_web',
        name: 'Psionic Web',
        description: 'Particles form a web-like pattern that reduces enemy movement speed by 15%, drains 3% of their energy per second, and provides 10% chance to silence enemies on hit for 1s.'
      },
      {
        id: 'neural_network',
        name: 'Neural Network',
        description: 'Particles arrange in a neural pattern that reduces ability cooldowns by 15%, increases ability range by 25%, and provides 10% chance to reset the cooldown of an ability when used.'
      }
    ]
  },
  [Role.MOVEMENT]: {
    tier: Tier.RARE,
    role: Role.MOVEMENT,
    primary: [
      {
        id: 'lightning_strike',
        name: 'Lightning Strike',
        description: 'Deals 30% max HP damage to one enemy and increases own movement speed by 25% for 5s',
        cooldown: 15,
        category: 'primary',
        damage: 30,
        duration: 5
      },
      {
        id: 'blitz_attack',
        name: 'Blitz Attack',
        description: 'Dashes 12 units forward and deals 25% max HP damage to one enemy',
        cooldown: 18,
        category: 'primary',
        damage: 25
      },
      {
        id: 'rapid_strikes',
        name: 'Rapid Strikes',
        description: 'Deals 15% max HP damage to one enemy three times',
        cooldown: 20,
        category: 'primary',
        damage: 45
      },
      {
        id: 'velocity_strike',
        name: 'Velocity Strike',
        description: 'Deals 20-40% max HP damage based on movement speed',
        cooldown: 22,
        category: 'primary',
        damage: 30
      }
    ],
    secondary: [
      {
        id: 'major_speed_boost',
        name: 'Major Speed Boost',
        description: '+50% movement speed for 8s',
        cooldown: 25,
        category: 'secondary',
        duration: 8
      },
      {
        id: 'evasion',
        name: 'Evasion',
        description: '+40% dodge chance for 5s',
        cooldown: 30,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'flash',
        name: 'Flash',
        description: 'Dashes 20 units in any direction',
        cooldown: 25,
        category: 'secondary'
      },
      {
        id: 'heroic_leap',
        name: 'Heroic Leap',
        description: 'Leaps 25 units in any direction and deals 15% max HP damage to enemies at landing point',
        cooldown: 30,
        category: 'secondary',
        damage: 15,
        area: 5
      }
    ],
    unique: [
      {
        id: 'dimensional_step',
        name: 'Dimensional Step',
        description: 'Teleports 15 units in any direction and becomes invulnerable for 1s',
        cooldown: 35,
        category: 'unique',
        duration: 1
      },
      {
        id: 'ghost_form',
        name: 'Ghost Form',
        description: 'Becomes intangible for 5s, ignoring collisions and gaining 30% movement speed',
        cooldown: 40,
        category: 'unique',
        duration: 5
      },
      {
        id: 'acceleration',
        name: 'Acceleration',
        description: '+60% movement speed for 5s',
        cooldown: 35,
        category: 'unique',
        duration: 5
      },
      {
        id: 'enhanced_agility',
        name: 'Enhanced Agility',
        description: '+25% movement speed and +25% dodge chance for 8s',
        cooldown: 40,
        category: 'unique',
        duration: 8
      }
    ],
    crowdControl: [
      {
        id: 'cripple',
        name: 'Cripple',
        description: 'Slows one enemy by 60% for 5s',
        cooldown: 25,
        category: 'crowdControl',
        duration: 5
      },
      {
        id: 'leg_sweep',
        name: 'Leg Sweep',
        description: 'Knocks down one enemy for 2s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 2
      },
      {
        id: 'blind',
        name: 'Blind',
        description: 'Reduces one enemy accuracy by 50% for 4s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'hamstring',
        name: 'Hamstring',
        description: 'Reduces one enemy movement speed by 70% for 3s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 3
      }
    ],
    formationTraits: [
      {
        id: 'lightning_formation',
        name: 'Lightning Formation',
        description: 'Particles form a streamlined formation that increases movement speed by 20%, dodge chance by 10%, and provides 5% chance to teleport short distances when taking damage.'
      },
      {
        id: 'phantom_pattern',
        name: 'Phantom Pattern',
        description: 'Particles arrange in an evasive pattern that increases dodge chance by 15%, reduces damage taken by 10%, and provides 10% chance to become briefly intangible when hit.'
      },
      {
        id: 'kinetic_flow',
        name: 'Kinetic Flow',
        description: 'Particles form a flowing pattern that reduces the cooldown of movement abilities by 20%, increases movement speed after using abilities by 30%, and provides 5% energy regeneration per second while moving.'
      },
      {
        id: 'velocity_matrix',
        name: 'Velocity Matrix',
        description: 'Particles arrange in a dynamic pattern that increases damage by 3% for every 5% of movement speed above base speed and provides 15% chance to gain a burst of speed after dealing damage.'
      }
    ]
  }
};

/**
 * Tier 4 (Epic) ability pools
 */
export const TIER_4_ABILITIES: Record<Role, AbilityPool> = {
  // Will be populated with abilities for each role
  [Role.CORE]: {
    tier: Tier.EPIC,
    role: Role.CORE,
    primary: [
      {
        id: 'miraculous_heal',
        name: 'Miraculous Heal',
        description: 'Restores 50% HP to one ally and removes all debuffs',
        cooldown: 25,
        category: 'primary',
        healing: 50
      },
      {
        id: 'rejuvenation_cascade',
        name: 'Rejuvenation Cascade',
        description: 'Restores 40% HP to one ally and increases their healing received by 30% for 8s',
        cooldown: 30,
        category: 'primary',
        healing: 40,
        duration: 8
      },
      {
        id: 'divine_healing',
        name: 'Divine Healing',
        description: 'Restores 25% HP to all allies within 25 units and cleanses one debuff',
        cooldown: 35,
        category: 'primary',
        healing: 25,
        area: 25
      },
      {
        id: 'life_surge',
        name: 'Life Surge',
        description: 'Restores 35% HP to primary target and 20% HP to nearby allies, with 10% additional healing over 5s',
        cooldown: 30,
        category: 'primary',
        healing: 35,
        area: 15,
        duration: 5
      }
    ],
    secondary: [
      {
        id: 'divine_protection',
        name: 'Divine Protection',
        description: '+35% defense to one ally for 12s and 10% damage reflection',
        cooldown: 35,
        category: 'secondary',
        duration: 12
      },
      {
        id: 'mass_purification',
        name: 'Mass Purification',
        description: 'Removes all debuffs from all allies within 15 units and grants 15% damage reduction for 6s',
        cooldown: 40,
        category: 'secondary',
        duration: 6,
        area: 15
      },
      {
        id: 'aegis',
        name: 'Aegis',
        description: '+25% defense to all allies for 10s and 10% increased healing received',
        cooldown: 45,
        category: 'secondary',
        duration: 10,
        area: 20
      },
      {
        id: 'energy_wellspring',
        name: 'Energy Wellspring',
        description: 'Transfers 40% energy to one ally, reduces their ability cooldowns by 30%, and increases energy regeneration by 20% for 10s',
        cooldown: 40,
        category: 'secondary',
        energyCost: 40,
        duration: 10
      }
    ],
    unique: [
      {
        id: 'divine_intervention',
        name: 'Divine Intervention',
        description: 'Removes all debuffs from all allies within 20 units and makes them immune to debuffs for 3s',
        cooldown: 50,
        category: 'unique',
        duration: 3,
        area: 20
      },
      {
        id: 'holy_barrier',
        name: 'Holy Barrier',
        description: 'Absorbs 60% max HP damage for one ally for 10s and heals for 20% of damage absorbed',
        cooldown: 45,
        category: 'unique',
        duration: 10
      },
      {
        id: 'life_bloom',
        name: 'Life Bloom',
        description: 'Restores 8% HP per second for 12s to one ally and spreads 4% of healing to nearby allies',
        cooldown: 40,
        category: 'unique',
        healing: 8,
        duration: 12,
        area: 10
      },
      {
        id: 'mana_surge',
        name: 'Mana Surge',
        description: 'Restores 60% energy to one ally, increases their energy regeneration by 30% for 10s, and reduces all ability cooldowns by 20%',
        cooldown: 45,
        category: 'unique',
        duration: 10
      }
    ],
    crowdControl: [
      {
        id: 'time_stop',
        name: 'Time Stop',
        description: 'Slows one enemy by 70% for 6s and reduces their ability cooldown rate by 50%',
        cooldown: 30,
        category: 'crowdControl',
        duration: 6
      },
      {
        id: 'power_drain',
        name: 'Power Drain',
        description: 'Reduces one enemy damage by 40% for 8s and transfers 20% of their power to an ally',
        cooldown: 35,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'spell_lock',
        name: 'Spell Lock',
        description: 'Interrupts one enemy ability, increases its cooldown by 100%, and prevents that ability from being used for 5s',
        cooldown: 45,
        category: 'crowdControl',
        duration: 5
      },
      {
        id: 'disorienting_flash',
        name: 'Disorienting Flash',
        description: 'Reduces all enemies accuracy by 70% for 5s within 15 units',
        cooldown: 40,
        category: 'crowdControl',
        duration: 5,
        area: 15
      }
    ],
    formationTraits: [
      {
        id: 'celestial_aura',
        name: 'Celestial Aura',
        description: 'Particles form a radiant formation that enhances healing effects by 35%, provides 5% HP regeneration per minute to all allies, and grants immunity to the first fatal blow every 60s.'
      },
      {
        id: 'divine_sphere',
        name: 'Divine Sphere',
        description: 'Particles arrange in a spherical pattern that provides 20% damage reduction, 25% increased healing received, and reflects 10% of damage back to attackers.'
      },
      {
        id: 'vitality_matrix',
        name: 'Vitality Matrix',
        description: 'Particles form a complex grid pattern that enhances healing received by 30%, reduces debuff duration by 50%, provides immunity to new debuffs every 20s, and increases maximum health by 10%.'
      },
      {
        id: 'arcane_circuit',
        name: 'Arcane Circuit',
        description: 'Particles arrange in a circuit pattern that reduces ability cooldowns by 20%, increases energy regeneration by 35%, restores 10% energy when healing allies, and provides 10% chance to cast abilities at no energy cost.'
      }
    ]
  },
  [Role.ATTACK]: {
    tier: Tier.EPIC,
    role: Role.ATTACK,
    primary: [
      {
        id: 'annihilation_strike',
        name: 'Annihilation Strike',
        description: 'Deals 70% max HP damage to one enemy',
        cooldown: 20,
        category: 'primary',
        damage: 70
      },
      {
        id: 'obliteration',
        name: 'Obliteration',
        description: 'Deals 90% max HP damage to one enemy',
        cooldown: 25,
        category: 'primary',
        damage: 90
      },
      {
        id: 'armor_piercing_strike',
        name: 'Armor Piercing Strike',
        description: 'Deals 60% max HP damage to one enemy, ignores 50% of their defense, and reduces their defense by 30% for 6s',
        cooldown: 22,
        category: 'primary',
        damage: 60,
        duration: 6
      },
      {
        id: 'executioner_strike',
        name: 'Executioner Strike',
        description: 'Deals 50% max HP damage to one enemy, with 100% bonus damage if target is below 30% health',
        cooldown: 20,
        category: 'primary',
        damage: 50
      }
    ],
    secondary: [
      {
        id: 'devastating_blow',
        name: 'Devastating Blow',
        description: 'Deals 50% max HP damage to one enemy with 40% chance to stun for 3s',
        cooldown: 25,
        category: 'secondary',
        damage: 50,
        duration: 3
      },
      {
        id: 'blade_storm',
        name: 'Blade Storm',
        description: 'Deals 20% max HP damage to one enemy six times',
        cooldown: 30,
        category: 'secondary',
        damage: 120
      },
      {
        id: 'reckless_onslaught',
        name: 'Reckless Onslaught',
        description: 'Deals 100% max HP damage to one enemy but takes 25% self damage',
        cooldown: 25,
        category: 'secondary',
        damage: 100
      },
      {
        id: 'assassinate',
        name: 'Assassinate',
        description: 'Deals 60% max HP damage to one enemy with 60% increased critical chance and 100% increased critical damage',
        cooldown: 22,
        category: 'secondary',
        damage: 60
      }
    ],
    unique: [
      {
        id: 'battle_trance',
        name: 'Battle Trance',
        description: '+40% attack speed for 12s and 20% lifesteal',
        cooldown: 40,
        category: 'unique',
        duration: 12
      },
      {
        id: 'avatar_of_war',
        name: 'Avatar of War',
        description: '+60% damage for 8s and 30% damage reduction',
        cooldown: 45,
        category: 'unique',
        duration: 8
      },
      {
        id: 'berserk',
        name: 'Berserk',
        description: '+30% movement speed, +30% attack speed, and +30% damage for 10s',
        cooldown: 50,
        category: 'unique',
        duration: 10
      },
      {
        id: 'perfect_strike',
        name: 'Perfect Strike',
        description: '+80% critical damage for 12s and guarantees critical hits for the first 3s',
        cooldown: 45,
        category: 'unique',
        duration: 12
      }
    ],
    crowdControl: [
      {
        id: 'seismic_slam',
        name: 'Seismic Slam',
        description: 'Pushes all enemies within 15 units back 15 units, slows them by 30% for 4s, and deals 20% max HP damage',
        cooldown: 35,
        category: 'crowdControl',
        duration: 4,
        area: 15,
        damage: 20
      },
      {
        id: 'concussive_strike',
        name: 'Concussive Strike',
        description: 'Stuns one enemy for 4s and deals 30% max HP damage',
        cooldown: 40,
        category: 'crowdControl',
        duration: 4,
        damage: 30
      },
      {
        id: 'disabling_strike',
        name: 'Disabling Strike',
        description: 'Prevents one enemy from using any abilities for 5s and reduces their defense by 30%',
        cooldown: 45,
        category: 'crowdControl',
        duration: 5
      },
      {
        id: 'demoralizing_shout',
        name: 'Demoralizing Shout',
        description: 'Reduces all enemies damage by 40% for 8s within 12 units',
        cooldown: 40,
        category: 'crowdControl',
        duration: 8,
        area: 12
      }
    ],
    formationTraits: [
      {
        id: 'war_formation',
        name: 'War Formation',
        description: 'Particles form an aggressive formation that increases damage output by 35%, critical chance by 20%, provides 15% lifesteal, and grants 10% chance to deal double damage.'
      },
      {
        id: 'unstoppable_force',
        name: 'Unstoppable Force',
        description: 'Particles arrange in a dense pattern that enhances melee damage by 40%, attack speed by 20%, provides 25% armor penetration, and grants immunity to movement-impairing effects.'
      },
      {
        id: 'death_blade',
        name: 'Death Blade',
        description: 'Particles form a blade-like pattern, boosting precision, critical chance by 25%, critical damage by 50%, dealing 25% bonus damage to targets below 30% health, and providing 10% chance to instantly kill targets below 10% health.'
      },
      {
        id: 'bloodthirsty_swarm',
        name: 'Bloodthirsty Swarm',
        description: 'Particles form a chaotic pattern that increases damage by 10% for each 10% of health missing (up to 50%), provides 20% lifesteal, and grants 5% increased damage for 5s after each kill, stacking up to 5 times.'
      }
    ]
  },
  [Role.DEFENSE]: {
    tier: Tier.EPIC,
    role: Role.DEFENSE,
    primary: [
      {
        id: 'titan_slam',
        name: 'Titan Slam',
        description: 'Deals 40% max HP damage to one enemy, reduces their damage by 40% for 6s, and pushes them back 10 units',
        cooldown: 18,
        category: 'primary',
        damage: 40,
        duration: 6
      },
      {
        id: 'sentinel_strike',
        name: 'Sentinel Strike',
        description: 'Deals 50% max HP damage to one enemy and increases own defense by 40% for 6s',
        cooldown: 20,
        category: 'primary',
        damage: 50,
        duration: 6
      },
      {
        id: 'heroic_challenge',
        name: 'Heroic Challenge',
        description: 'Forces all enemies within 15 units to attack self for 6s, increases own defense by 50% for 6s, and reflects 20% of damage taken',
        cooldown: 30,
        category: 'primary',
        duration: 6,
        area: 15
      },
      {
        id: 'crippling_assault',
        name: 'Crippling Assault',
        description: 'Deals 35% max HP damage to one enemy, reduces their attack speed by 40% for 6s, and reduces their movement speed by 30% for 6s',
        cooldown: 18,
        category: 'primary',
        damage: 35,
        duration: 6
      }
    ],
    secondary: [
      {
        id: 'invincible_barrier',
        name: 'Invincible Barrier',
        description: 'Creates a barrier that absorbs 70% max HP damage for 10s and reflects 25% of damage absorbed',
        cooldown: 35,
        category: 'secondary',
        duration: 10
      },
      {
        id: 'bulwark_stance',
        name: 'Bulwark Stance',
        description: '+70% defense for 10s and immunity to critical hits',
        cooldown: 30,
        category: 'secondary',
        duration: 10
      },
      {
        id: 'vengeful_reflection',
        name: 'Vengeful Reflection',
        description: 'Reflects 50% of damage taken back to attacker for 6s and increases own damage by 30% for 6s',
        cooldown: 40,
        category: 'secondary',
        duration: 6
      },
      {
        id: 'stalwart_defender',
        name: 'Stalwart Defender',
        description: 'Reduces damage taken by 60% for 8s and heals for 5% of max HP per second',
        cooldown: 35,
        category: 'secondary',
        duration: 8
      }
    ],
    unique: [
      {
        id: 'immortality',
        name: 'Immortality',
        description: '+80% defense when HP < 30% for 10s and heals for 5% of max HP per second',
        cooldown: 50,
        category: 'unique',
        duration: 10
      },
      {
        id: 'indomitable_will',
        name: 'Indomitable Will',
        description: 'Immune to all crowd control effects for 8s and gains 40% damage reduction',
        cooldown: 55,
        category: 'unique',
        duration: 8
      },
      {
        id: 'phoenix_rebirth',
        name: 'Phoenix Rebirth',
        description: 'Upon taking fatal damage, instead heal to 50% HP (120s cooldown)',
        cooldown: 120,
        category: 'unique'
      },
      {
        id: 'perfect_defense',
        name: 'Perfect Defense',
        description: '+60% dodge chance for 8s and reduces damage taken by 40%',
        cooldown: 45,
        category: 'unique',
        duration: 8
      }
    ],
    crowdControl: [
      {
        id: 'imprisonment',
        name: 'Imprisonment',
        description: 'Prevents one enemy from moving for 6s and reduces their defense by 30%',
        cooldown: 35,
        category: 'crowdControl',
        duration: 6
      },
      {
        id: 'crushing_blow',
        name: 'Crushing Blow',
        description: 'Reduces one enemy movement speed by 70% for 6s and their attack speed by 40% for 6s',
        cooldown: 30,
        category: 'crowdControl',
        duration: 6
      },
      {
        id: 'earth_shatter',
        name: 'Earth Shatter',
        description: 'Knocks down all enemies within 10 units for 3s and deals 20% max HP damage',
        cooldown: 40,
        category: 'crowdControl',
        duration: 3,
        area: 10,
        damage: 20
      },
      {
        id: 'suppression',
        name: 'Suppression',
        description: 'Prevents all enemies within 10 units from using abilities for 3s and reduces their damage by 30% for 6s',
        cooldown: 45,
        category: 'crowdControl',
        duration: 6,
        area: 10
      }
    ],
    formationTraits: [
      {
        id: 'adamantine_wall',
        name: 'Adamantine Wall',
        description: 'Particles form a wall-like formation that reduces damage taken by 35%, reflects 20% damage back to attackers, grants immunity to knockback effects, and provides 10% chance to completely block attacks.'
      },
      {
        id: 'legendary_phalanx',
        name: 'Legendary Phalanx',
        description: 'Particles arrange in a tight formation that increases defense by 40%, reduces critical damage taken by 50%, provides 20% chance to block attacks completely, and grants immunity to armor reduction effects.'
      },
      {
        id: 'eternal_fortress',
        name: 'Eternal Fortress',
        description: 'Particles form a fortress-like pattern that absorbs 25% of incoming damage, increases max health by 20%, provides 10% health regeneration when below 50% health, and grants 5% chance to become invulnerable for 2s when taking damage.'
      },
      {
        id: 'immovable_object',
        name: 'Immovable Object',
        description: 'Particles arrange in a fortified pattern that increases resistance to crowd control by 70%, reduces damage taken by 25%, provides immunity to the first three crowd control effects every 30s, and grants 15% chance to reflect crowd control effects back to the attacker.'
      }
    ]
  },
  [Role.CONTROL]: {
    tier: Tier.EPIC,
    role: Role.CONTROL,
    primary: [
      {
        id: 'arcane_nova',
        name: 'Arcane Nova',
        description: 'Deals 50% max HP damage to one enemy and 25% max HP damage to nearby enemies',
        cooldown: 18,
        category: 'primary',
        damage: 50,
        area: 10
      },
      {
        id: 'psionic_blast',
        name: 'Psionic Blast',
        description: 'Deals 40% max HP damage to one enemy and slows them by 40% for 5s',
        cooldown: 15,
        category: 'primary',
        damage: 40,
        duration: 5
      },
      {
        id: 'mind_shatter',
        name: 'Mind Shatter',
        description: 'Deals 35% max HP damage to one enemy, interrupts their current ability, increases its cooldown by 100%, and silences them for 2s',
        cooldown: 20,
        category: 'primary',
        damage: 35,
        duration: 2
      },
      {
        id: 'void_lance',
        name: 'Void Lance',
        description: 'Deals 60% max HP damage to one enemy and pierces through to hit enemies behind for 30% damage',
        cooldown: 18,
        category: 'primary',
        damage: 60
      }
    ],
    secondary: [
      {
        id: 'time_dilation',
        name: 'Time Dilation',
        description: 'Slows all enemies within 15 units by 60% for 5s',
        cooldown: 25,
        category: 'secondary',
        duration: 5,
        area: 15
      },
      {
        id: 'mana_burn',
        name: 'Mana Burn',
        description: 'Drains 50% energy from one enemy and deals damage equal to 50% of energy drained',
        cooldown: 30,
        category: 'secondary'
      },
      {
        id: 'mass_confusion',
        name: 'Mass Confusion',
        description: 'Reduces all enemies accuracy by 50% for 5s within 12 units',
        cooldown: 28,
        category: 'secondary',
        duration: 5,
        area: 12
      },
      {
        id: 'power_suppression',
        name: 'Power Suppression',
        description: 'Reduces one enemy damage by 50% for 6s and their defense by 30% for 6s',
        cooldown: 30,
        category: 'secondary',
        duration: 6
      }
    ],
    unique: [
      {
        id: 'phase_shift',
        name: 'Phase Shift',
        description: 'Becomes invisible for 8s, gains 40% movement speed, and becomes immune to damage for the first 2s',
        cooldown: 45,
        category: 'unique',
        duration: 8
      },
      {
        id: 'wormhole',
        name: 'Wormhole',
        description: 'Teleports 30 units in any direction and creates a portal that allies can use for 5s',
        cooldown: 40,
        category: 'unique',
        duration: 5
      },
      {
        id: 'psionic_barrier',
        name: 'Psionic Barrier',
        description: 'Creates a shield that absorbs 60% max HP damage for 8s, reflects 30% of absorbed damage, and grants immunity to crowd control effects',
        cooldown: 45,
        category: 'unique',
        duration: 8
      },
      {
        id: 'temporal_acceleration',
        name: 'Temporal Acceleration',
        description: '+50% movement speed for 8s, reduces ability cooldowns by 30%, and increases attack speed by 30%',
        cooldown: 40,
        category: 'unique',
        duration: 8
      }
    ],
    crowdControl: [
      {
        id: 'mind_control',
        name: 'Mind Control',
        description: 'Takes control of one enemy for 4s, making them attack their allies',
        cooldown: 45,
        category: 'crowdControl',
        duration: 4
      },
      {
        id: 'vortex',
        name: 'Vortex',
        description: 'Creates a vortex that pulls all enemies within 15 units to the center and silences them for 3s',
        cooldown: 40,
        category: 'crowdControl',
        duration: 3,
        area: 15
      },
      {
        id: 'nightmare',
        name: 'Nightmare',
        description: 'Causes one enemy to flee in terror for 5s and take 10% max HP damage per second',
        cooldown: 45,
        category: 'crowdControl',
        duration: 5,
        damage: 50
      },
      {
        id: 'stasis_field',
        name: 'Stasis Field',
        description: 'Freezes one enemy in place for 4s, making them invulnerable but unable to act',
        cooldown: 40,
        category: 'crowdControl',
        duration: 4
      }
    ],
    formationTraits: [
      {
        id: 'psionic_nexus',
        name: 'Psionic Nexus',
        description: 'Particles form a complex matrix pattern that increases ability power by 40%, reduces ability cooldowns by 20%, provides 10% chance to cast abilities without cooldown, and grants 5% energy regeneration per second.'
      },
      {
        id: 'dimensional_rift',
        name: 'Dimensional Rift',
        description: 'Particles arrange in a distortion pattern that increases crowd control duration by 50%, reduces enemy healing by 40%, provides 25% chance to apply a random crowd control effect on hit, and grants immunity to crowd control effects every 15s.'
      },
      {
        id: 'astral_web',
        name: 'Astral Web',
        description: 'Particles form a web-like pattern that reduces enemy movement speed by 25%, drains 5% of their energy per second, provides 20% chance to silence enemies on hit for 2s, and increases ability range by 30%.'
      },
      {
        id: 'synaptic_network',
        name: 'Synaptic Network',
        description: 'Particles arrange in a neural pattern that reduces ability cooldowns by 25%, increases ability range by 40%, provides 20% chance to reset the cooldown of an ability when used, and grants 10% chance to duplicate the effect of any ability cast.'
      }
    ]
  },
  [Role.MOVEMENT]: {
    tier: Tier.EPIC,
    role: Role.MOVEMENT,
    primary: [
      {
        id: 'sonic_strike',
        name: 'Sonic Strike',
        description: 'Deals 50% max HP damage to one enemy, increases own movement speed by 40% for 6s, and has 20% chance to strike again',
        cooldown: 18,
        category: 'primary',
        damage: 50,
        duration: 6
      },
      {
        id: 'phantom_rush',
        name: 'Phantom Rush',
        description: 'Dashes 20 units forward and deals 40% max HP damage to all enemies in path',
        cooldown: 20,
        category: 'primary',
        damage: 40
      },
      {
        id: 'blade_dance',
        name: 'Blade Dance',
        description: 'Deals 20% max HP damage to one enemy five times, with each hit increasing movement speed by 5% for 5s',
        cooldown: 25,
        category: 'primary',
        damage: 100,
        duration: 5
      },
      {
        id: 'kinetic_strike',
        name: 'Kinetic Strike',
        description: 'Deals 30-80% max HP damage based on movement speed, with guaranteed critical hit if above 150% base speed',
        cooldown: 22,
        category: 'primary',
        damage: 55
      }
    ],
    secondary: [
      {
        id: 'hyperspeed',
        name: 'Hyperspeed',
        description: '+70% movement speed for 10s and immunity to movement-impairing effects',
        cooldown: 30,
        category: 'secondary',
        duration: 10
      },
      {
        id: 'phantom_dodge',
        name: 'Phantom Dodge',
        description: '+60% dodge chance for 6s and creates an afterimage that confuses enemies',
        cooldown: 35,
        category: 'secondary',
        duration: 6
      },
      {
        id: 'quantum_dash',
        name: 'Quantum Dash',
        description: 'Dashes 30 units in any direction, passing through obstacles and becoming invulnerable during the dash',
        cooldown: 30,
        category: 'secondary'
      },
      {
        id: 'meteor_leap',
        name: 'Meteor Leap',
        description: 'Leaps 35 units in any direction and deals 30% max HP damage to enemies at landing point in a 10-unit radius',
        cooldown: 35,
        category: 'secondary',
        damage: 30,
        area: 10
      }
    ],
    unique: [
      {
        id: 'phase_jump',
        name: 'Phase Jump',
        description: 'Teleports 25 units in any direction, becomes invulnerable for 2s, and leaves behind a damaging rift that deals 20% max HP damage per second',
        cooldown: 40,
        category: 'unique',
        duration: 2,
        damage: 20
      },
      {
        id: 'ethereal_form',
        name: 'Ethereal Form',
        description: 'Becomes intangible for 8s, ignoring collisions, gaining 50% movement speed, and 30% damage reduction',
        cooldown: 45,
        category: 'unique',
        duration: 8
      },
      {
        id: 'time_warp',
        name: 'Time Warp',
        description: '+80% movement speed for 6s and creates temporal duplicates that mimic attacks',
        cooldown: 40,
        category: 'unique',
        duration: 6
      },
      {
        id: 'perfect_agility',
        name: 'Perfect Agility',
        description: '+40% movement speed, +40% dodge chance, and +30% attack speed for 10s',
        cooldown: 45,
        category: 'unique',
        duration: 10
      }
    ],
    crowdControl: [
      {
        id: 'paralyzing_strike',
        name: 'Paralyzing Strike',
        description: 'Slows one enemy by 80% for 6s and reduces their attack speed by 40%',
        cooldown: 30,
        category: 'crowdControl',
        duration: 6
      },
      {
        id: 'sweeping_kick',
        name: 'Sweeping Kick',
        description: 'Knocks down all enemies in a 120-degree arc for 3s and deals 20% max HP damage',
        cooldown: 35,
        category: 'crowdControl',
        duration: 3,
        damage: 20
      },
      {
        id: 'flash_bomb',
        name: 'Flash Bomb',
        description: 'Blinds all enemies within 12 units for 5s, reducing their accuracy by 70%',
        cooldown: 40,
        category: 'crowdControl',
        duration: 5,
        area: 12
      },
      {
        id: 'crippling_blow',
        name: 'Crippling Blow',
        description: 'Reduces one enemy movement speed by 90% for 4s and their dodge chance by 50%',
        cooldown: 35,
        category: 'crowdControl',
        duration: 4
      }
    ],
    formationTraits: [
      {
        id: 'slipstream_formation',
        name: 'Slipstream Formation',
        description: 'Particles form a streamlined formation that increases movement speed by 35%, dodge chance by 20%, provides 15% chance to teleport short distances when taking damage, and grants immunity to movement-impairing effects every 10s.'
      },
      {
        id: 'mirage_pattern',
        name: 'Mirage Pattern',
        description: 'Particles arrange in an evasive pattern that increases dodge chance by 30%, reduces damage taken by 15%, provides 20% chance to become briefly intangible when hit, and creates afterimages that confuse enemies.'
      },
      {
        id: 'quantum_flow',
        name: 'Quantum Flow',
        description: 'Particles form a flowing pattern that reduces the cooldown of movement abilities by 35%, increases movement speed after using abilities by 50%, provides 10% energy regeneration per second while moving, and grants 15% chance to reset movement ability cooldowns when dodging.'
      },
      {
        id: 'kinetic_matrix',
        name: 'Kinetic Matrix',
        description: 'Particles arrange in a dynamic pattern that increases damage by 5% for every 5% of movement speed above base speed, provides 25% chance to gain a burst of speed after dealing damage, and grants 10% lifesteal based on movement speed.'
      }
    ]
  }
};

/**
 * Tier 5 (Legendary) ability pools
 */
export const TIER_5_ABILITIES: Record<Role, AbilityPool> = {
  // Will be populated with abilities for each role
  [Role.CORE]: {
    tier: Tier.LEGENDARY,
    role: Role.CORE,
    primary: [
      {
        id: 'divine_intervention',
        name: 'Divine Intervention',
        description: 'Restores 70% HP to one ally and grants them immunity to damage for 3s',
        cooldown: 30,
        category: 'primary',
        healing: 70,
        duration: 3
      },
      {
        id: 'mass_resurrection',
        name: 'Mass Resurrection',
        description: 'Restores 50% HP to all allies within 30 units and removes all debuffs',
        cooldown: 40,
        category: 'primary',
        healing: 50,
        area: 30
      },
      {
        id: 'celestial_blessing',
        name: 'Celestial Blessing',
        description: 'Restores 40% HP to one ally, increases their healing received by 50% for 10s, and grants them 30% damage reduction',
        cooldown: 35,
        category: 'primary',
        healing: 40,
        duration: 10
      },
      {
        id: 'fountain_of_life',
        name: 'Fountain of Life',
        description: 'Creates a healing zone that restores 10% HP per second to all allies within 15 units for 8s',
        cooldown: 45,
        category: 'primary',
        healing: 80,
        duration: 8,
        area: 15
      }
    ],
    secondary: [
      {
        id: 'holy_aegis',
        name: 'Holy Aegis',
        description: '+50% defense to one ally for 15s, 25% damage reflection, and immunity to critical hits',
        cooldown: 40,
        category: 'secondary',
        duration: 15
      },
      {
        id: 'divine_cleansing',
        name: 'Divine Cleansing',
        description: 'Removes all debuffs from all allies within 20 units, grants immunity to debuffs for 5s, and heals for 20% max HP',
        cooldown: 45,
        category: 'secondary',
        duration: 5,
        area: 20,
        healing: 20
      },
      {
        id: 'guardian_spirit',
        name: 'Guardian Spirit',
        description: '+40% defense to all allies for 12s, 15% increased healing received, and 10% damage reflection',
        cooldown: 50,
        category: 'secondary',
        duration: 12,
        area: 25
      },
      {
        id: 'mana_fountain',
        name: 'Mana Fountain',
        description: 'Restores 80% energy to one ally, reduces all their ability cooldowns by 50%, and increases their energy regeneration by 50% for 15s',
        cooldown: 45,
        category: 'secondary',
        duration: 15
      }
    ],
    unique: [
      {
        id: 'transcendence',
        name: 'Transcendence',
        description: 'Removes all debuffs from all allies within 25 units, makes them immune to debuffs for 5s, and reduces damage taken by 30%',
        cooldown: 60,
        category: 'unique',
        duration: 5,
        area: 25
      },
      {
        id: 'divine_shield',
        name: 'Divine Shield',
        description: 'Creates an invulnerable shield around one ally for 5s, after which it explodes to heal nearby allies for 30% max HP',
        cooldown: 55,
        category: 'unique',
        duration: 5,
        healing: 30,
        area: 10
      },
      {
        id: 'genesis',
        name: 'Genesis',
        description: 'Restores 10% HP per second for 15s to one ally, spreads 50% of healing to nearby allies, and grants 20% increased damage',
        cooldown: 50,
        category: 'unique',
        healing: 10,
        duration: 15,
        area: 10
      },
      {
        id: 'arcane_brilliance',
        name: 'Arcane Brilliance',
        description: 'Restores 100% energy to one ally, reduces all their ability cooldowns by 70%, and grants 20% chance to cast abilities at no energy cost for 10s',
        cooldown: 60,
        category: 'unique',
        duration: 10
      }
    ],
    crowdControl: [
      {
        id: 'temporal_stasis',
        name: 'Temporal Stasis',
        description: 'Freezes one enemy in time for 8s, making them unable to act or take damage',
        cooldown: 50,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'power_void',
        name: 'Power Void',
        description: 'Reduces one enemy damage by 70% for 10s and transfers 50% of their power to an ally',
        cooldown: 45,
        category: 'crowdControl',
        duration: 10
      },
      {
        id: 'absolute_silence',
        name: 'Absolute Silence',
        description: 'Prevents one enemy from using any abilities for 6s and increases all their ability cooldowns by 200%',
        cooldown: 55,
        category: 'crowdControl',
        duration: 6
      },
      {
        id: 'mass_disorientation',
        name: 'Mass Disorientation',
        description: 'Reduces all enemies accuracy by 90% for 6s within 20 units and causes them to attack random targets',
        cooldown: 50,
        category: 'crowdControl',
        duration: 6,
        area: 20
      }
    ],
    formationTraits: [
      {
        id: 'divine_constellation',
        name: 'Divine Constellation',
        description: 'Particles form a radiant formation that enhances healing effects by 60%, provides 8% HP regeneration per minute to all allies, grants immunity to the first fatal blow every 30s, and creates healing novas when allies fall below 30% health.'
      },
      {
        id: 'celestial_sphere',
        name: 'Celestial Sphere',
        description: 'Particles arrange in a spherical pattern that provides 35% damage reduction, 40% increased healing received, reflects 20% of damage back to attackers, and grants immunity to crowd control effects every 10s.'
      },
      {
        id: 'genesis_matrix',
        name: 'Genesis Matrix',
        description: 'Particles form a complex grid pattern that enhances healing received by 50%, reduces debuff duration by 75%, provides immunity to new debuffs every 15s, increases maximum health by 20%, and spreads 30% of healing to nearby allies.'
      },
      {
        id: 'ethereal_circuit',
        name: 'Ethereal Circuit',
        description: 'Particles arrange in a circuit pattern that reduces ability cooldowns by 40%, increases energy regeneration by 60%, restores 15% energy when healing allies, provides 20% chance to cast abilities at no energy cost, and grants 10% chance to reset all ability cooldowns when falling below 30% health.'
      }
    ]
  },
  [Role.ATTACK]: {
    tier: Tier.LEGENDARY,
    role: Role.ATTACK,
    primary: [
      {
        id: 'apocalypse_strike',
        name: 'Apocalypse Strike',
        description: 'Deals 120% max HP damage to one enemy and 40% max HP damage to nearby enemies',
        cooldown: 25,
        category: 'primary',
        damage: 120,
        area: 8
      },
      {
        id: 'annihilation',
        name: 'Annihilation',
        description: 'Deals 150% max HP damage to one enemy',
        cooldown: 30,
        category: 'primary',
        damage: 150
      },
      {
        id: 'soul_reaver',
        name: 'Soul Reaver',
        description: 'Deals 100% max HP damage to one enemy, ignores 80% of their defense, and heals for 30% of damage dealt',
        cooldown: 28,
        category: 'primary',
        damage: 100
      },
      {
        id: 'death_sentence',
        name: 'Death Sentence',
        description: 'Deals 80% max HP damage to one enemy, with 300% bonus damage if target is below 30% health',
        cooldown: 25,
        category: 'primary',
        damage: 80
      }
    ],
    secondary: [
      {
        id: 'cataclysmic_blow',
        name: 'Cataclysmic Blow',
        description: 'Deals 80% max HP damage to one enemy with 60% chance to stun for 4s',
        cooldown: 30,
        category: 'secondary',
        damage: 80,
        duration: 4
      },
      {
        id: 'thousand_cuts',
        name: 'Thousand Cuts',
        description: 'Deals 25% max HP damage to one enemy eight times, with each hit increasing damage by 10%',
        cooldown: 35,
        category: 'secondary',
        damage: 200
      },
      {
        id: 'berserker_rage',
        name: 'Berserker Rage',
        description: 'Deals 200% max HP damage to one enemy but takes 40% self damage, with damage increasing as own health decreases',
        cooldown: 30,
        category: 'secondary',
        damage: 200
      },
      {
        id: 'perfect_strike',
        name: 'Perfect Strike',
        description: 'Deals 100% max HP damage to one enemy with 100% critical chance and 200% increased critical damage',
        cooldown: 28,
        category: 'secondary',
        damage: 100
      }
    ],
    unique: [
      {
        id: 'avatar_of_destruction',
        name: 'Avatar of Destruction',
        description: '+60% attack speed for 15s, 40% lifesteal, and immunity to crowd control effects',
        cooldown: 50,
        category: 'unique',
        duration: 15
      },
      {
        id: 'godlike_power',
        name: 'Godlike Power',
        description: '+100% damage for 10s, 50% damage reduction, and 20% chance to deal double damage',
        cooldown: 60,
        category: 'unique',
        duration: 10
      },
      {
        id: 'ultimate_frenzy',
        name: 'Ultimate Frenzy',
        description: '+50% movement speed, +50% attack speed, and +50% damage for 12s, with all abilities having 30% reduced cooldown',
        cooldown: 65,
        category: 'unique',
        duration: 12
      },
      {
        id: 'death_mark',
        name: 'Death Mark',
        description: '+120% critical damage for 15s, guarantees critical hits for 5s, and marks enemies to take 30% additional damage from all sources',
        cooldown: 55,
        category: 'unique',
        duration: 15
      }
    ],
    crowdControl: [
      {
        id: 'tectonic_slam',
        name: 'Tectonic Slam',
        description: 'Knocks all enemies within 20 units back 20 units, stuns them for 3s, and deals 40% max HP damage',
        cooldown: 45,
        category: 'crowdControl',
        duration: 3,
        area: 20,
        damage: 40
      },
      {
        id: 'paralyzing_strike',
        name: 'Paralyzing Strike',
        description: 'Stuns one enemy for 5s, deals 50% max HP damage, and reduces their defense by 50% for 10s',
        cooldown: 50,
        category: 'crowdControl',
        duration: 5,
        damage: 50
      },
      {
        id: 'total_shutdown',
        name: 'Total Shutdown',
        description: 'Prevents one enemy from using any abilities for 8s, reduces their damage by 70%, and makes them vulnerable to critical hits',
        cooldown: 55,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'war_cry',
        name: 'War Cry',
        description: 'Reduces all enemies damage by 60% for 10s within 15 units, causes them to flee for 3s, and increases own damage by 40%',
        cooldown: 50,
        category: 'crowdControl',
        duration: 10,
        area: 15
      }
    ],
    formationTraits: [
      {
        id: 'apocalypse_formation',
        name: 'Apocalypse Formation',
        description: 'Particles form an aggressive formation that increases damage output by 60%, critical chance by 30%, provides 30% lifesteal, grants 20% chance to deal double damage, and causes attacks to ignore 30% of enemy defense.'
      },
      {
        id: 'juggernaut_force',
        name: 'Juggernaut Force',
        description: 'Particles arrange in a dense pattern that enhances melee damage by 70%, attack speed by 40%, provides 50% armor penetration, grants immunity to movement-impairing effects, and increases damage by 5% for each enemy within 10 units.'
      },
      {
        id: 'reaper_edge',
        name: 'Reaper Edge',
        description: 'Particles form a blade-like pattern, boosting precision, critical chance by 40%, critical damage by 100%, dealing 50% bonus damage to targets below 30% health, providing 25% chance to instantly kill targets below 15% health, and granting 10% lifesteal.'
      },
      {
        id: 'warlord_swarm',
        name: 'Warlord Swarm',
        description: 'Particles form a chaotic pattern that increases damage by 15% for each 10% of health missing (up to 75%), provides 40% lifesteal, grants 10% increased damage for 8s after each kill (stacking up to 5 times), and has 15% chance to deal area damage on hit.'
      }
    ]
  },
  [Role.DEFENSE]: {
    tier: Tier.LEGENDARY,
    role: Role.DEFENSE,
    primary: [
      {
        id: 'titan_shield_slam',
        name: 'Titan Shield Slam',
        description: 'Deals 70% max HP damage to one enemy, reduces their damage by 60% for 8s, and knocks them back 15 units',
        cooldown: 22,
        category: 'primary',
        damage: 70,
        duration: 8
      },
      {
        id: 'colossus_strike',
        name: 'Colossus Strike',
        description: 'Deals 80% max HP damage to one enemy and increases own defense by 60% for 8s',
        cooldown: 25,
        category: 'primary',
        damage: 80,
        duration: 8
      },
      {
        id: 'legendary_challenge',
        name: 'Legendary Challenge',
        description: 'Forces all enemies within 20 units to attack self for 8s, increases own defense by 80% for 8s, and reflects 40% of damage taken',
        cooldown: 35,
        category: 'primary',
        duration: 8,
        area: 20
      },
      {
        id: 'devastating_assault',
        name: 'Devastating Assault',
        description: 'Deals 60% max HP damage to one enemy, reduces their attack speed by 60% for 8s, and their movement speed by 50% for 8s',
        cooldown: 22,
        category: 'primary',
        damage: 60,
        duration: 8
      }
    ],
    secondary: [
      {
        id: 'absolute_barrier',
        name: 'Absolute Barrier',
        description: 'Creates a barrier that absorbs 100% max HP damage for 12s and reflects 50% of damage absorbed',
        cooldown: 40,
        category: 'secondary',
        duration: 12
      },
      {
        id: 'mountain_stance',
        name: 'Mountain Stance',
        description: '+100% defense for 12s, immunity to critical hits, and 30% damage reduction',
        cooldown: 35,
        category: 'secondary',
        duration: 12
      },
      {
        id: 'retribution_aura',
        name: 'Retribution Aura',
        description: 'Reflects 80% of damage taken back to attacker for 8s and increases own damage by 50% for 8s',
        cooldown: 45,
        category: 'secondary',
        duration: 8
      },
      {
        id: 'indomitable_presence',
        name: 'Indomitable Presence',
        description: 'Reduces damage taken by 80% for 10s and heals for 8% of max HP per second',
        cooldown: 40,
        category: 'secondary',
        duration: 10
      }
    ],
    unique: [
      {
        id: 'undying_rage',
        name: 'Undying Rage',
        description: '+120% defense when HP < 30% for 12s, heals for 10% of max HP per second, and increases damage by 50%',
        cooldown: 60,
        category: 'unique',
        duration: 12
      },
      {
        id: 'titan_will',
        name: 'Titan Will',
        description: 'Immune to all crowd control and damage-over-time effects for 10s and gains 60% damage reduction',
        cooldown: 65,
        category: 'unique',
        duration: 10
      },
      {
        id: 'phoenix_heart',
        name: 'Phoenix Heart',
        description: 'Upon taking fatal damage, instead heal to 70% HP and gain 50% increased damage for 10s (90s cooldown)',
        cooldown: 90,
        category: 'unique',
        duration: 10
      },
      {
        id: 'legendary_defense',
        name: 'Legendary Defense',
        description: '+80% dodge chance for 10s, reduces damage taken by 60%, and has 20% chance to completely negate attacks',
        cooldown: 50,
        category: 'unique',
        duration: 10
      }
    ],
    crowdControl: [
      {
        id: 'absolute_imprisonment',
        name: 'Absolute Imprisonment',
        description: 'Prevents one enemy from moving for 8s, reduces their defense by 50%, and makes them take 30% more damage from all sources',
        cooldown: 40,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'devastating_blow',
        name: 'Devastating Blow',
        description: 'Reduces one enemy movement speed by 90% for 8s, their attack speed by 70% for 8s, and their damage by 40% for 8s',
        cooldown: 35,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'seismic_rupture',
        name: 'Seismic Rupture',
        description: 'Knocks down all enemies within 15 units for 5s, deals 40% max HP damage, and reduces their defense by 30% for 10s',
        cooldown: 45,
        category: 'crowdControl',
        duration: 5,
        area: 15,
        damage: 40
      },
      {
        id: 'domination',
        name: 'Domination',
        description: 'Prevents all enemies within 15 units from using abilities for 5s, reduces their damage by 50% for 10s, and makes them take 20% more damage from all sources',
        cooldown: 50,
        category: 'crowdControl',
        duration: 10,
        area: 15
      }
    ],
    formationTraits: [
      {
        id: 'divine_wall',
        name: 'Divine Wall',
        description: 'Particles form a wall-like formation that reduces damage taken by 50%, reflects 35% damage back to attackers, grants immunity to knockback effects, provides 25% chance to completely block attacks, and increases maximum health by 20%.'
      },
      {
        id: 'immortal_phalanx',
        name: 'Immortal Phalanx',
        description: 'Particles arrange in a tight formation that increases defense by 70%, reduces critical damage taken by 80%, provides 40% chance to block attacks completely, grants immunity to armor reduction effects, and heals for 2% of max HP per second.'
      },
      {
        id: 'titan_fortress',
        name: 'Titan Fortress',
        description: 'Particles form a fortress-like pattern that absorbs 40% of incoming damage, increases max health by 35%, provides 20% health regeneration when below 50% health, grants 15% chance to become invulnerable for 3s when taking damage, and increases defense by 5% for each nearby ally.'
      },
      {
        id: 'mountain_formation',
        name: 'Mountain Formation',
        description: 'Particles arrange in a fortified pattern that increases resistance to crowd control by 90%, reduces damage taken by 40%, provides immunity to all crowd control effects every 15s, grants 30% chance to reflect crowd control effects back to the attacker, and increases defense by 10% for each enemy attacking.'
      }
    ]
  },
  [Role.CONTROL]: {
    tier: Tier.LEGENDARY,
    role: Role.CONTROL,
    primary: [
      {
        id: 'arcane_cataclysm',
        name: 'Arcane Cataclysm',
        description: 'Deals 80% max HP damage to one enemy and 40% max HP damage to all enemies within 15 units',
        cooldown: 30,
        category: 'primary',
        damage: 80,
        area: 15
      },
      {
        id: 'mind_annihilation',
        name: 'Mind Annihilation',
        description: 'Deals 70% max HP damage to one enemy, slows them by 70% for 6s, and reduces their defense by 40% for 6s',
        cooldown: 25,
        category: 'primary',
        damage: 70,
        duration: 6
      },
      {
        id: 'psychic_devastation',
        name: 'Psychic Devastation',
        description: 'Deals 60% max HP damage to one enemy, interrupts their current ability, increases all their ability cooldowns by 200%, and silences them for 4s',
        cooldown: 30,
        category: 'primary',
        damage: 60,
        duration: 4
      },
      {
        id: 'void_beam',
        name: 'Void Beam',
        description: 'Deals 100% max HP damage to one enemy and pierces through to hit all enemies in a line for 50% damage',
        cooldown: 28,
        category: 'primary',
        damage: 100
      }
    ],
    secondary: [
      {
        id: 'time_stop',
        name: 'Time Stop',
        description: 'Slows all enemies within 20 units by 90% for 6s and reduces their ability cooldown rate by 80%',
        cooldown: 35,
        category: 'secondary',
        duration: 6,
        area: 20
      },
      {
        id: 'energy_siphon',
        name: 'Energy Siphon',
        description: 'Drains 80% energy from one enemy, deals damage equal to 100% of energy drained, and restores 50% of own energy',
        cooldown: 40,
        category: 'secondary'
      },
      {
        id: 'psychic_assault',
        name: 'Psychic Assault',
        description: 'Reduces all enemies accuracy by 80% for 6s within 15 units and causes them to attack random targets',
        cooldown: 35,
        category: 'secondary',
        duration: 6,
        area: 15
      },
      {
        id: 'absolute_dominance',
        name: 'Absolute Dominance',
        description: 'Reduces one enemy damage by 80% for 8s, their defense by 60% for 8s, and makes them take 40% more damage from all sources',
        cooldown: 40,
        category: 'secondary',
        duration: 8
      }
    ],
    unique: [
      {
        id: 'dimensional_shift',
        name: 'Dimensional Shift',
        description: 'Becomes invisible for 10s, gains 70% movement speed, becomes immune to damage for 4s, and leaves behind a clone that explodes for 50% max HP damage',
        cooldown: 55,
        category: 'unique',
        duration: 10,
        damage: 50
      },
      {
        id: 'reality_tear',
        name: 'Reality Tear',
        description: 'Teleports 40 units in any direction, creates a portal that allies can use for 8s, and becomes invulnerable for 2s',
        cooldown: 50,
        category: 'unique',
        duration: 8
      },
      {
        id: 'arcane_fortress',
        name: 'Arcane Fortress',
        description: 'Creates a shield that absorbs 80% max HP damage for 10s, reflects 50% of absorbed damage, grants immunity to crowd control effects, and increases ability power by 40%',
        cooldown: 55,
        category: 'unique',
        duration: 10
      },
      {
        id: 'chrono_acceleration',
        name: 'Chrono Acceleration',
        description: '+70% movement speed for 10s, reduces all ability cooldowns by 50%, increases attack speed by 50%, and has 20% chance to reset ability cooldowns when casting',
        cooldown: 50,
        category: 'unique',
        duration: 10
      }
    ],
    crowdControl: [
      {
        id: 'dominate_mind',
        name: 'Dominate Mind',
        description: 'Takes control of one enemy for 6s, making them attack their allies with 50% increased damage',
        cooldown: 60,
        category: 'crowdControl',
        duration: 6
      },
      {
        id: 'black_hole',
        name: 'Black Hole',
        description: 'Creates a vortex that pulls all enemies within 20 units to the center, silences them for 4s, and deals 10% max HP damage per second',
        cooldown: 55,
        category: 'crowdControl',
        duration: 4,
        area: 20,
        damage: 40
      },
      {
        id: 'eternal_nightmare',
        name: 'Eternal Nightmare',
        description: 'Causes one enemy to flee in terror for 8s, take 15% max HP damage per second, and have 70% reduced healing',
        cooldown: 50,
        category: 'crowdControl',
        duration: 8,
        damage: 120
      },
      {
        id: 'temporal_prison',
        name: 'Temporal Prison',
        description: 'Freezes one enemy in place for 6s, making them invulnerable but unable to act, and increases all their ability cooldowns by 300% afterward',
        cooldown: 55,
        category: 'crowdControl',
        duration: 6
      }
    ],
    formationTraits: [
      {
        id: 'arcane_singularity',
        name: 'Arcane Singularity',
        description: 'Particles form a complex matrix pattern that increases ability power by 70%, reduces ability cooldowns by 40%, provides 20% chance to cast abilities without cooldown, grants 10% energy regeneration per second, and has 15% chance to duplicate any ability cast.'
      },
      {
        id: 'void_rift',
        name: 'Void Rift',
        description: 'Particles arrange in a distortion pattern that increases crowd control duration by 80%, reduces enemy healing by 70%, provides 40% chance to apply a random crowd control effect on hit, grants immunity to crowd control effects every 10s, and creates damaging void zones when using abilities.'
      },
      {
        id: 'psionic_lattice',
        name: 'Psionic Lattice',
        description: 'Particles form a web-like pattern that reduces enemy movement speed by 40%, drains 8% of their energy per second, provides 35% chance to silence enemies on hit for 3s, increases ability range by 50%, and has 20% chance to steal beneficial effects from enemies.'
      },
      {
        id: 'quantum_network',
        name: 'Quantum Network',
        description: 'Particles arrange in a neural pattern that reduces ability cooldowns by 50%, increases ability range by 70%, provides 30% chance to reset the cooldown of an ability when used, grants 20% chance to duplicate the effect of any ability cast, and increases ability power by 5% for each enemy affected by crowd control.'
      }
    ]
  },
  [Role.MOVEMENT]: {
    tier: Tier.LEGENDARY,
    role: Role.MOVEMENT,
    primary: [
      {
        id: 'lightning_assault',
        name: 'Lightning Assault',
        description: 'Deals 80% max HP damage to one enemy, increases own movement speed by 60% for 8s, and has 40% chance to strike again',
        cooldown: 22,
        category: 'primary',
        damage: 80,
        duration: 8
      },
      {
        id: 'dimensional_dash',
        name: 'Dimensional Dash',
        description: 'Dashes 30 units forward and deals 70% max HP damage to all enemies in path, leaving behind a trail that slows enemies by 40% for 5s',
        cooldown: 25,
        category: 'primary',
        damage: 70,
        duration: 5
      },
      {
        id: 'death_dance',
        name: 'Death Dance',
        description: 'Deals 30% max HP damage to one enemy eight times, with each hit increasing movement speed by 10% for 6s',
        cooldown: 30,
        category: 'primary',
        damage: 240,
        duration: 6
      },
      {
        id: 'velocity_impact',
        name: 'Velocity Impact',
        description: 'Deals 50-150% max HP damage based on movement speed, with guaranteed critical hit if above 200% base speed',
        cooldown: 28,
        category: 'primary',
        damage: 100
      }
    ],
    secondary: [
      {
        id: 'quantum_speed',
        name: 'Quantum Speed',
        description: '+100% movement speed for 12s, immunity to movement-impairing effects, and 30% chance to dodge all attacks',
        cooldown: 35,
        category: 'secondary',
        duration: 12
      },
      {
        id: 'shadow_step',
        name: 'Shadow Step',
        description: '+80% dodge chance for 8s, creates three afterimages that confuse enemies, and increases critical chance by 40%',
        cooldown: 40,
        category: 'secondary',
        duration: 8
      },
      {
        id: 'void_dash',
        name: 'Void Dash',
        description: 'Dashes 40 units in any direction, passing through obstacles, becoming invulnerable during the dash, and leaving behind a damaging trail',
        cooldown: 35,
        category: 'secondary'
      },
      {
        id: 'comet_leap',
        name: 'Comet Leap',
        description: 'Leaps 50 units in any direction and deals 50% max HP damage to enemies at landing point in a 15-unit radius, stunning them for 2s',
        cooldown: 40,
        category: 'secondary',
        damage: 50,
        area: 15,
        duration: 2
      }
    ],
    unique: [
      {
        id: 'dimensional_rift',
        name: 'Dimensional Rift',
        description: 'Teleports 35 units in any direction, becomes invulnerable for 3s, and leaves behind a damaging rift that deals 30% max HP damage per second for 5s',
        cooldown: 45,
        category: 'unique',
        duration: 3,
        damage: 150
      },
      {
        id: 'transcendent_form',
        name: 'Transcendent Form',
        description: 'Becomes intangible for 10s, ignoring collisions, gaining 80% movement speed, 50% damage reduction, and 30% increased damage',
        cooldown: 50,
        category: 'unique',
        duration: 10
      },
      {
        id: 'chrono_surge',
        name: 'Chrono Surge',
        description: '+120% movement speed for 8s, creates temporal duplicates that mimic attacks dealing 40% damage, and reduces ability cooldowns by 50%',
        cooldown: 45,
        category: 'unique',
        duration: 8
      },
      {
        id: 'legendary_agility',
        name: 'Legendary Agility',
        description: '+60% movement speed, +60% dodge chance, +50% attack speed, and +30% damage for 12s',
        cooldown: 50,
        category: 'unique',
        duration: 12
      }
    ],
    crowdControl: [
      {
        id: 'crippling_strike',
        name: 'Crippling Strike',
        description: 'Slows one enemy by 100% for 5s (immobilizing them), reduces their attack speed by 70%, and their defense by 40%',
        cooldown: 35,
        category: 'crowdControl',
        duration: 5
      },
      {
        id: 'hurricane_kick',
        name: 'Hurricane Kick',
        description: 'Knocks down all enemies in a 180-degree arc for 4s, deals 40% max HP damage, and pushes them back 15 units',
        cooldown: 40,
        category: 'crowdControl',
        duration: 4,
        damage: 40
      },
      {
        id: 'blinding_assault',
        name: 'Blinding Assault',
        description: 'Blinds all enemies within 15 units for 6s, reducing their accuracy by 90%, and deals 30% max HP damage',
        cooldown: 45,
        category: 'crowdControl',
        duration: 6,
        area: 15,
        damage: 30
      },
      {
        id: 'hamstring',
        name: 'Hamstring',
        description: 'Reduces one enemy movement speed by 100% for 5s (immobilizing them), their dodge chance by 80%, and causes them to take 40% more damage from all sources',
        cooldown: 40,
        category: 'crowdControl',
        duration: 5
      }
    ],
    formationTraits: [
      {
        id: 'quantum_slipstream',
        name: 'Quantum Slipstream',
        description: 'Particles form a streamlined formation that increases movement speed by 60%, dodge chance by 40%, provides 30% chance to teleport short distances when taking damage, grants immunity to movement-impairing effects every 5s, and increases damage by 2% for each 1% of movement speed above base speed.'
      },
      {
        id: 'phantom_formation',
        name: 'Phantom Formation',
        description: 'Particles arrange in an evasive pattern that increases dodge chance by 50%, reduces damage taken by 30%, provides 40% chance to become briefly intangible when hit, creates afterimages that confuse enemies, and grants 20% chance to counter-attack when dodging.'
      },
      {
        id: 'chrono_flow',
        name: 'Chrono Flow',
        description: 'Particles form a flowing pattern that reduces the cooldown of movement abilities by 60%, increases movement speed after using abilities by 80%, provides 20% energy regeneration per second while moving, grants 30% chance to reset movement ability cooldowns when dodging, and creates temporal duplicates that mimic attacks.'
      },
      {
        id: 'hyperdimensional_matrix',
        name: 'Hyperdimensional Matrix',
        description: 'Particles arrange in a dynamic pattern that increases damage by 8% for every 5% of movement speed above base speed, provides 40% chance to gain a burst of speed after dealing damage, grants 25% lifesteal based on movement speed, and has 15% chance to phase through attacks completely.'
      }
    ]
  }
};

/**
 * Tier 6 (Mythic) ability pools
 */
export const TIER_6_ABILITIES: Record<Role, AbilityPool> = {
  // Will be populated with abilities for each role
  [Role.CORE]: {
    tier: Tier.MYTHIC,
    role: Role.CORE,
    primary: [
      {
        id: 'miracle',
        name: 'Miracle',
        description: 'Restores 100% HP to one ally and grants them immunity to damage for 5s',
        cooldown: 40,
        category: 'primary',
        healing: 100,
        duration: 5
      },
      {
        id: 'mass_revival',
        name: 'Mass Revival',
        description: 'Restores 80% HP to all allies within 40 units, removes all debuffs, and grants 30% damage reduction for 8s',
        cooldown: 50,
        category: 'primary',
        healing: 80,
        area: 40,
        duration: 8
      },
      {
        id: 'divine_blessing',
        name: 'Divine Blessing',
        description: 'Restores 70% HP to one ally, increases their healing received by 100% for 12s, grants them 50% damage reduction, and makes them immune to crowd control effects',
        cooldown: 45,
        category: 'primary',
        healing: 70,
        duration: 12
      },
      {
        id: 'wellspring_of_life',
        name: 'Wellspring of Life',
        description: 'Creates a healing zone that restores 15% HP per second to all allies within 20 units for 10s and increases their damage by 30%',
        cooldown: 55,
        category: 'primary',
        healing: 150,
        duration: 10,
        area: 20
      }
    ],
    secondary: [
      {
        id: 'divine_protection',
        name: 'Divine Protection',
        description: '+80% defense to one ally for 20s, 50% damage reflection, immunity to critical hits, and 30% chance to completely negate attacks',
        cooldown: 50,
        category: 'secondary',
        duration: 20
      },
      {
        id: 'absolute_purification',
        name: 'Absolute Purification',
        description: 'Removes all debuffs from all allies within 30 units, grants immunity to debuffs for 8s, heals for 40% max HP, and increases their damage by 30% for 10s',
        cooldown: 55,
        category: 'secondary',
        duration: 8,
        area: 30,
        healing: 40
      },
      {
        id: 'celestial_guardian',
        name: 'Celestial Guardian',
        description: '+60% defense to all allies for 15s, 30% increased healing received, 20% damage reflection, and immunity to crowd control effects',
        cooldown: 60,
        category: 'secondary',
        duration: 15,
        area: 30
      },
      {
        id: 'infinite_energy',
        name: 'Infinite Energy',
        description: 'Restores 100% energy to all allies within 20 units, reduces all their ability cooldowns by 70%, and increases their energy regeneration by 100% for 15s',
        cooldown: 60,
        category: 'secondary',
        duration: 15,
        area: 20
      }
    ],
    unique: [
      {
        id: 'divine_ascension',
        name: 'Divine Ascension',
        description: 'Removes all debuffs from all allies within 30 units, makes them immune to debuffs for 8s, reduces damage taken by 50%, and increases their damage by 50% for 10s',
        cooldown: 70,
        category: 'unique',
        duration: 8,
        area: 30
      },
      {
        id: 'aegis_of_the_immortal',
        name: 'Aegis of the Immortal',
        description: 'Creates an invulnerable shield around one ally for 8s, after which it explodes to heal nearby allies for 50% max HP and stun enemies for 3s',
        cooldown: 65,
        category: 'unique',
        duration: 8,
        healing: 50,
        area: 15
      },
      {
        id: 'fountain_of_eternity',
        name: 'Fountain of Eternity',
        description: 'Restores 15% HP per second for 20s to one ally, spreads 70% of healing to nearby allies, grants 40% increased damage, and makes them immune to fatal damage once during this time',
        cooldown: 60,
        category: 'unique',
        healing: 15,
        duration: 20,
        area: 15
      },
      {
        id: 'omnipotence',
        name: 'Omnipotence',
        description: 'Restores 100% energy to all allies within 20 units, resets all their ability cooldowns, grants 40% chance to cast abilities at no energy cost for 15s, and increases their ability power by 50%',
        cooldown: 70,
        category: 'unique',
        duration: 15,
        area: 20
      }
    ],
    crowdControl: [
      {
        id: 'time_freeze',
        name: 'Time Freeze',
        description: 'Freezes all enemies in time for 5s within 15 units, making them unable to act or take damage',
        cooldown: 60,
        category: 'crowdControl',
        duration: 5,
        area: 15
      },
      {
        id: 'absolute_nullification',
        name: 'Absolute Nullification',
        description: 'Reduces one enemy damage by 90% for 12s and transfers 80% of their power to an ally',
        cooldown: 55,
        category: 'crowdControl',
        duration: 12
      },
      {
        id: 'eternal_silence',
        name: 'Eternal Silence',
        description: 'Prevents one enemy from using any abilities for 8s, increases all their ability cooldowns by 300%, and reduces their energy regeneration by 100%',
        cooldown: 65,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'mind_shatter',
        name: 'Mind Shatter',
        description: 'Reduces all enemies accuracy by 100% for 8s within 25 units, causes them to attack random targets, and reduces their defense by 50%',
        cooldown: 60,
        category: 'crowdControl',
        duration: 8,
        area: 25
      }
    ],
    formationTraits: [
      {
        id: 'celestial_constellation',
        name: 'Celestial Constellation',
        description: 'Particles form a radiant formation that enhances healing effects by 100%, provides 12% HP regeneration per minute to all allies, grants immunity to the first three fatal blows every 30s, creates healing novas when allies fall below 30% health, and increases maximum health by 30%.'
      },
      {
        id: 'divine_sphere',
        name: 'Divine Sphere',
        description: 'Particles arrange in a spherical pattern that provides 50% damage reduction, 70% increased healing received, reflects 40% of damage back to attackers, grants immunity to crowd control effects every 5s, and has 20% chance to completely negate attacks.'
      },
      {
        id: 'eternal_matrix',
        name: 'Eternal Matrix',
        description: 'Particles form a complex grid pattern that enhances healing received by 80%, reduces debuff duration by 100% (immunity), provides immunity to new debuffs every 10s, increases maximum health by 40%, spreads 50% of healing to nearby allies, and grants 10% chance to resurrect with 50% health upon death.'
      },
      {
        id: 'transcendent_circuit',
        name: 'Transcendent Circuit',
        description: 'Particles arrange in a circuit pattern that reduces ability cooldowns by 70%, increases energy regeneration by 100%, restores 25% energy when healing allies, provides 40% chance to cast abilities at no energy cost, grants 20% chance to reset all ability cooldowns when falling below 30% health, and increases ability power by 50%.'
      }
    ]
  },
  [Role.ATTACK]: {
    tier: Tier.MYTHIC,
    role: Role.ATTACK,
    primary: [
      {
        id: 'armageddon_strike',
        name: 'Armageddon Strike',
        description: 'Deals 200% max HP damage to one enemy and 80% max HP damage to all enemies within 15 units',
        cooldown: 35,
        category: 'primary',
        damage: 200,
        area: 15
      },
      {
        id: 'oblivion',
        name: 'Oblivion',
        description: 'Deals 250% max HP damage to one enemy and has 20% chance to instantly defeat them if below 30% health',
        cooldown: 40,
        category: 'primary',
        damage: 250
      },
      {
        id: 'soul_devourer',
        name: 'Soul Devourer',
        description: 'Deals 150% max HP damage to one enemy, ignores 100% of their defense, heals for 50% of damage dealt, and steals 30% of their stats for 10s',
        cooldown: 35,
        category: 'primary',
        damage: 150,
        duration: 10
      },
      {
        id: 'final_judgment',
        name: 'Final Judgment',
        description: 'Deals 120% max HP damage to one enemy, with 500% bonus damage if target is below 30% health, and resets cooldown if it defeats an enemy',
        cooldown: 30,
        category: 'primary',
        damage: 120
      }
    ],
    secondary: [
      {
        id: 'world_ender',
        name: 'World Ender',
        description: 'Deals 120% max HP damage to one enemy with 100% chance to stun for 5s and reduces their defense by 70% for 10s',
        cooldown: 40,
        category: 'secondary',
        damage: 120,
        duration: 5
      },
      {
        id: 'infinite_blades',
        name: 'Infinite Blades',
        description: 'Deals 30% max HP damage to one enemy twelve times, with each hit increasing damage by 15% and having 10% chance to critically strike for 300% damage',
        cooldown: 45,
        category: 'secondary',
        damage: 360
      },
      {
        id: 'demonic_fury',
        name: 'Demonic Fury',
        description: 'Deals 300% max HP damage to one enemy but takes 50% self damage, with damage increasing by 100% as own health decreases below 50%',
        cooldown: 40,
        category: 'secondary',
        damage: 300
      },
      {
        id: 'godslayer',
        name: 'Godslayer',
        description: 'Deals 150% max HP damage to one enemy with 100% critical chance, 300% increased critical damage, and ignores 50% of their defense',
        cooldown: 35,
        category: 'secondary',
        damage: 150
      }
    ],
    unique: [
      {
        id: 'ascended_form',
        name: 'Ascended Form',
        description: '+100% attack speed for 15s, 60% lifesteal, immunity to crowd control effects, and 30% chance to deal triple damage',
        cooldown: 60,
        category: 'unique',
        duration: 15
      },
      {
        id: 'divine_power',
        name: 'Divine Power',
        description: '+150% damage for 12s, 70% damage reduction, 40% chance to deal double damage, and immunity to debuffs',
        cooldown: 70,
        category: 'unique',
        duration: 12
      },
      {
        id: 'transcendent_fury',
        name: 'Transcendent Fury',
        description: '+80% movement speed, +80% attack speed, and +80% damage for 15s, with all abilities having 50% reduced cooldown and 30% chance to reset on use',
        cooldown: 75,
        category: 'unique',
        duration: 15
      },
      {
        id: 'harbinger_of_doom',
        name: 'Harbinger of Doom',
        description: '+200% critical damage for 20s, guarantees critical hits for 8s, marks enemies to take 50% additional damage from all sources, and grants 20% of damage dealt as healing',
        cooldown: 65,
        category: 'unique',
        duration: 20
      }
    ],
    crowdControl: [
      {
        id: 'cataclysm',
        name: 'Cataclysm',
        description: 'Knocks all enemies within 30 units back 30 units, stuns them for 5s, deals 60% max HP damage, and reduces their defense by 50% for 10s',
        cooldown: 55,
        category: 'crowdControl',
        duration: 5,
        area: 30,
        damage: 60
      },
      {
        id: 'eternal_stun',
        name: 'Eternal Stun',
        description: 'Stuns one enemy for 8s, deals 80% max HP damage, reduces their defense by 70% for 15s, and makes them vulnerable to critical hits (100% increased critical damage taken)',
        cooldown: 60,
        category: 'crowdControl',
        duration: 8,
        damage: 80
      },
      {
        id: 'complete_suppression',
        name: 'Complete Suppression',
        description: 'Prevents one enemy from using any abilities for 10s, reduces their damage by 90%, makes them vulnerable to critical hits, and reduces their healing received by 100%',
        cooldown: 65,
        category: 'crowdControl',
        duration: 10
      },
      {
        id: 'battle_hymn',
        name: 'Battle Hymn',
        description: 'Reduces all enemies damage by 80% for 12s within 20 units, causes them to flee for 5s, increases own damage by 60%, and grants 30% lifesteal to all allies',
        cooldown: 60,
        category: 'crowdControl',
        duration: 12,
        area: 20
      }
    ],
    formationTraits: [
      {
        id: 'divine_wrath',
        name: 'Divine Wrath',
        description: 'Particles form an aggressive formation that increases damage output by 100%, critical chance by 50%, provides 50% lifesteal, grants 30% chance to deal triple damage, causes attacks to ignore 50% of enemy defense, and has 10% chance to instantly defeat enemies below 20% health.'
      },
      {
        id: 'titan_force',
        name: 'Titan Force',
        description: 'Particles arrange in a dense pattern that enhances melee damage by 120%, attack speed by 60%, provides 80% armor penetration, grants immunity to movement-impairing effects, increases damage by 10% for each enemy within 15 units, and has 20% chance to stun enemies for 2s on hit.'
      },
      {
        id: 'god_slayer_edge',
        name: 'God Slayer Edge',
        description: 'Particles form a blade-like pattern, boosting precision, critical chance by 70%, critical damage by 200%, dealing 100% bonus damage to targets below 30% health, providing 50% chance to instantly kill targets below 20% health, granting 25% lifesteal, and increasing damage by 5% for each consecutive hit on the same target (stacking up to 10 times).'
      },
      {
        id: 'apocalypse_swarm',
        name: 'Apocalypse Swarm',
        description: 'Particles form a chaotic pattern that increases damage by 25% for each 10% of health missing (up to 125%), provides 60% lifesteal, grants 20% increased damage for 10s after each kill (stacking up to 5 times), has 30% chance to deal area damage on hit, and increases attack speed by 5% for each enemy defeated (stacking up to 50%).'
      }
    ]
  },
  [Role.DEFENSE]: {
    tier: Tier.MYTHIC,
    role: Role.DEFENSE,
    primary: [
      {
        id: 'divine_shield_slam',
        name: 'Divine Shield Slam',
        description: 'Deals 100% max HP damage to one enemy, reduces their damage by 80% for 10s, and knocks them back 20 units',
        cooldown: 25,
        category: 'primary',
        damage: 100,
        duration: 10
      },
      {
        id: 'titan_strike',
        name: 'Titan Strike',
        description: 'Deals 120% max HP damage to one enemy and increases own defense by 100% for 10s',
        cooldown: 30,
        category: 'primary',
        damage: 120,
        duration: 10
      },
      {
        id: 'mythic_challenge',
        name: 'Mythic Challenge',
        description: 'Forces all enemies within 30 units to attack self for 10s, increases own defense by 120% for 10s, and reflects 60% of damage taken',
        cooldown: 40,
        category: 'primary',
        duration: 10,
        area: 30
      },
      {
        id: 'annihilating_assault',
        name: 'Annihilating Assault',
        description: 'Deals 90% max HP damage to one enemy, reduces their attack speed by 80% for 10s, their movement speed by 70% for 10s, and their defense by 50% for 10s',
        cooldown: 25,
        category: 'primary',
        damage: 90,
        duration: 10
      }
    ],
    secondary: [
      {
        id: 'divine_barrier',
        name: 'Divine Barrier',
        description: 'Creates a barrier that absorbs 150% max HP damage for 15s, reflects 70% of damage absorbed, and makes immune to crowd control effects',
        cooldown: 45,
        category: 'secondary',
        duration: 15
      },
      {
        id: 'godlike_stance',
        name: 'Godlike Stance',
        description: '+150% defense for 15s, immunity to critical hits, 50% damage reduction, and 20% chance to completely negate attacks',
        cooldown: 40,
        category: 'secondary',
        duration: 15
      },
      {
        id: 'divine_retribution',
        name: 'Divine Retribution',
        description: 'Reflects 100% of damage taken back to attacker for 10s, increases own damage by 80% for 10s, and deals 30% of reflected damage to all nearby enemies',
        cooldown: 50,
        category: 'secondary',
        duration: 10
      },
      {
        id: 'eternal_guardian',
        name: 'Eternal Guardian',
        description: 'Reduces damage taken by 90% for 12s, heals for 10% of max HP per second, and increases nearby allies defense by 50%',
        cooldown: 45,
        category: 'secondary',
        duration: 12
      }
    ],
    unique: [
      {
        id: 'immortal_rage',
        name: 'Immortal Rage',
        description: '+200% defense when HP < 30% for 15s, heals for 15% of max HP per second, increases damage by 80%, and becomes immune to crowd control effects',
        cooldown: 70,
        category: 'unique',
        duration: 15
      },
      {
        id: 'divine_will',
        name: 'Divine Will',
        description: 'Immune to all damage and crowd control effects for 5s, then gains 80% damage reduction and 100% increased damage for 10s',
        cooldown: 75,
        category: 'unique',
        duration: 15
      },
      {
        id: 'eternal_phoenix',
        name: 'Eternal Phoenix',
        description: 'Upon taking fatal damage, instead heal to 100% HP, gain 100% increased damage for 15s, and deal 50% max HP damage to all nearby enemies (60s cooldown)',
        cooldown: 60,
        category: 'unique',
        duration: 15,
        damage: 50,
        area: 15
      },
      {
        id: 'perfect_defense',
        name: 'Perfect Defense',
        description: '+100% dodge chance for 12s, reduces damage taken by 80%, has 40% chance to completely negate attacks, and reflects 50% of damage that would have been taken',
        cooldown: 60,
        category: 'unique',
        duration: 12
      }
    ],
    crowdControl: [
      {
        id: 'divine_imprisonment',
        name: 'Divine Imprisonment',
        description: 'Prevents one enemy from moving for 10s, reduces their defense by 80%, makes them take 50% more damage from all sources, and silences them',
        cooldown: 45,
        category: 'crowdControl',
        duration: 10
      },
      {
        id: 'crippling_blow',
        name: 'Crippling Blow',
        description: 'Reduces one enemy movement speed by 100% for 10s (immobilizing them), their attack speed by 90% for 10s, their damage by 70% for 10s, and their healing received by 100%',
        cooldown: 40,
        category: 'crowdControl',
        duration: 10
      },
      {
        id: 'tectonic_rupture',
        name: 'Tectonic Rupture',
        description: 'Knocks down all enemies within 20 units for 6s, deals 60% max HP damage, reduces their defense by 50% for 12s, and slows them by 50% for 6s after the knockdown ends',
        cooldown: 50,
        category: 'crowdControl',
        duration: 6,
        area: 20,
        damage: 60
      },
      {
        id: 'absolute_dominance',
        name: 'Absolute Dominance',
        description: 'Prevents all enemies within 20 units from using abilities for 6s, reduces their damage by 80% for 12s, makes them take 40% more damage from all sources, and reduces their healing received by 80%',
        cooldown: 55,
        category: 'crowdControl',
        duration: 12,
        area: 20
      }
    ],
    formationTraits: [
      {
        id: 'godly_wall',
        name: 'Godly Wall',
        description: 'Particles form a wall-like formation that reduces damage taken by 70%, reflects 50% damage back to attackers, grants immunity to knockback and displacement effects, provides 40% chance to completely block attacks, increases maximum health by 40%, and heals for 3% of maximum health per second.'
      },
      {
        id: 'divine_phalanx',
        name: 'Divine Phalanx',
        description: 'Particles arrange in a tight formation that increases defense by 100%, reduces critical damage taken by 100% (immunity), provides 60% chance to block attacks completely, grants immunity to armor reduction effects, heals for 5% of max HP per second, and increases nearby allies defense by 30%.'
      },
      {
        id: 'immortal_fortress',
        name: 'Immortal Fortress',
        description: 'Particles form a fortress-like pattern that absorbs 60% of incoming damage, increases max health by 60%, provides 30% health regeneration when below 50% health, grants 25% chance to become invulnerable for 5s when taking damage, increases defense by 10% for each nearby ally, and has 10% chance to fully heal when falling below 10% health.'
      },
      {
        id: 'divine_mountain',
        name: 'Divine Mountain',
        description: 'Particles arrange in a fortified pattern that increases resistance to crowd control by 100% (immunity), reduces damage taken by 60%, provides immunity to all crowd control effects, grants 50% chance to reflect crowd control effects back to the attacker, increases defense by 15% for each enemy attacking, and creates a damaging aura that deals 5% max HP damage per second to nearby enemies.'
      }
    ]
  },
  [Role.CONTROL]: {
    tier: Tier.MYTHIC,
    role: Role.CONTROL,
    primary: [
      {
        id: 'arcane_apocalypse',
        name: 'Arcane Apocalypse',
        description: 'Deals 120% max HP damage to one enemy and 60% max HP damage to all enemies within 20 units',
        cooldown: 35,
        category: 'primary',
        damage: 120,
        area: 20
      },
      {
        id: 'void_obliteration',
        name: 'Void Obliteration',
        description: 'Deals 100% max HP damage to one enemy, slows them by 90% for 8s, reduces their defense by 70% for 8s, and silences them for 4s',
        cooldown: 30,
        category: 'primary',
        damage: 100,
        duration: 8
      },
      {
        id: 'mental_collapse',
        name: 'Mental Collapse',
        description: 'Deals 90% max HP damage to one enemy, interrupts all their abilities, increases all their ability cooldowns by 300%, silences them for 6s, and reduces their energy regeneration by 100% for 10s',
        cooldown: 40,
        category: 'primary',
        damage: 90,
        duration: 10
      },
      {
        id: 'cosmic_ray',
        name: 'Cosmic Ray',
        description: 'Deals 150% max HP damage to one enemy and pierces through to hit all enemies in a line for 75% damage, ignoring 50% of their defense',
        cooldown: 35,
        category: 'primary',
        damage: 150
      }
    ],
    secondary: [
      {
        id: 'temporal_stasis',
        name: 'Temporal Stasis',
        description: 'Slows all enemies within 25 units by 100% for 5s (immobilizing them) and reduces their ability cooldown rate by 100% (preventing ability use)',
        cooldown: 45,
        category: 'secondary',
        duration: 5,
        area: 25
      },
      {
        id: 'mana_void',
        name: 'Mana Void',
        description: 'Drains 100% energy from one enemy, deals damage equal to 200% of energy drained, restores 100% of own energy, and reduces their energy regeneration by 100% for 10s',
        cooldown: 50,
        category: 'secondary',
        duration: 10
      },
      {
        id: 'mind_domination',
        name: 'Mind Domination',
        description: 'Reduces all enemies accuracy by 100% for 8s within 20 units, causes them to attack random targets including their allies, and reduces their defense by 50%',
        cooldown: 45,
        category: 'secondary',
        duration: 8,
        area: 20
      },
      {
        id: 'complete_subjugation',
        name: 'Complete Subjugation',
        description: 'Reduces one enemy damage by 100% for 10s, their defense by 80% for 10s, makes them take 70% more damage from all sources, and prevents them from being healed',
        cooldown: 50,
        category: 'secondary',
        duration: 10
      }
    ],
    unique: [
      {
        id: 'astral_projection',
        name: 'Astral Projection',
        description: 'Becomes invisible for 12s, gains 100% movement speed, becomes immune to damage for 6s, leaves behind a clone that explodes for 80% max HP damage, and can cast abilities without breaking invisibility',
        cooldown: 65,
        category: 'unique',
        duration: 12,
        damage: 80
      },
      {
        id: 'dimensional_gate',
        name: 'Dimensional Gate',
        description: 'Teleports 50 units in any direction, creates a portal that allies can use for 10s, becomes invulnerable for 3s, and creates a damaging zone at the origin dealing 20% max HP damage per second for 5s',
        cooldown: 60,
        category: 'unique',
        duration: 10,
        damage: 100
      },
      {
        id: 'divine_aegis',
        name: 'Divine Aegis',
        description: 'Creates a shield that absorbs 100% max HP damage for 12s, reflects 80% of absorbed damage, grants immunity to crowd control effects, increases ability power by 70%, and makes nearby allies take 30% reduced damage',
        cooldown: 65,
        category: 'unique',
        duration: 12
      },
      {
        id: 'time_lord',
        name: 'Time Lord',
        description: '+100% movement speed for 12s, reduces all ability cooldowns by 80%, increases attack speed by 80%, has 40% chance to reset ability cooldowns when casting, and creates temporal duplicates that mimic abilities at 50% effectiveness',
        cooldown: 60,
        category: 'unique',
        duration: 12
      }
    ],
    crowdControl: [
      {
        id: 'mind_enslavement',
        name: 'Mind Enslavement',
        description: 'Takes control of one enemy for 8s, making them attack their allies with 100% increased damage and using their abilities against their team',
        cooldown: 70,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'singularity',
        name: 'Singularity',
        description: 'Creates a vortex that pulls all enemies within 25 units to the center, silences them for 5s, deals 20% max HP damage per second, and reduces their defense by 50% for 10s',
        cooldown: 65,
        category: 'crowdControl',
        duration: 5,
        area: 25,
        damage: 100
      },
      {
        id: 'eternal_torment',
        name: 'Eternal Torment',
        description: 'Causes one enemy to flee in terror for 10s, take 20% max HP damage per second, have 100% reduced healing, and spread 50% of the fear effect to nearby enemies',
        cooldown: 60,
        category: 'crowdControl',
        duration: 10,
        damage: 200
      },
      {
        id: 'chronostasis',
        name: 'Chronostasis',
        description: 'Freezes one enemy in time for 8s, making them invulnerable but unable to act, and increases all their ability cooldowns by 500% afterward, effectively resetting all their abilities',
        cooldown: 65,
        category: 'crowdControl',
        duration: 8
      }
    ],
    formationTraits: [
      {
        id: 'cosmic_nexus',
        name: 'Cosmic Nexus',
        description: 'Particles form a complex matrix pattern that increases ability power by 100%, reduces ability cooldowns by 60%, provides 30% chance to cast abilities without cooldown, grants 20% energy regeneration per second, has 25% chance to duplicate any ability cast, and increases ability range by 50%.'
      },
      {
        id: 'dimensional_rift',
        name: 'Dimensional Rift',
        description: 'Particles arrange in a distortion pattern that increases crowd control duration by 100%, reduces enemy healing by 100%, provides 60% chance to apply a random crowd control effect on hit, grants immunity to crowd control effects every 5s, creates damaging void zones when using abilities, and has 20% chance to banish enemies hit by crowd control effects for 3s.'
      },
      {
        id: 'cosmic_web',
        name: 'Cosmic Web',
        description: 'Particles form a web-like pattern that reduces enemy movement speed by 60%, drains 12% of their energy per second, provides 50% chance to silence enemies on hit for 4s, increases ability range by 80%, has 30% chance to steal beneficial effects from enemies, and creates a field that reduces enemy energy regeneration by 50%.'
      },
      {
        id: 'divine_network',
        name: 'Divine Network',
        description: 'Particles arrange in a neural pattern that reduces ability cooldowns by 70%, increases ability range by 100%, provides 50% chance to reset the cooldown of an ability when used, grants 30% chance to duplicate the effect of any ability cast, increases ability power by 10% for each enemy affected by crowd control, and has 5% chance to cast a random ultimate ability when using any ability.'
      }
    ]
  },
  [Role.MOVEMENT]: {
    tier: Tier.MYTHIC,
    role: Role.MOVEMENT,
    primary: [
      {
        id: 'divine_strike',
        name: 'Divine Strike',
        description: 'Deals 120% max HP damage to one enemy, increases own movement speed by 100% for 10s, and has 60% chance to strike again',
        cooldown: 25,
        category: 'primary',
        damage: 120,
        duration: 10
      },
      {
        id: 'cosmic_dash',
        name: 'Cosmic Dash',
        description: 'Dashes 40 units forward and deals 100% max HP damage to all enemies in path, leaving behind a trail that slows enemies by 70% for 8s and deals 10% max HP damage per second',
        cooldown: 30,
        category: 'primary',
        damage: 100,
        duration: 8
      },
      {
        id: 'celestial_dance',
        name: 'Celestial Dance',
        description: 'Deals 40% max HP damage to one enemy ten times, with each hit increasing movement speed by 15% for 8s and having 20% chance to critically strike for 200% damage',
        cooldown: 35,
        category: 'primary',
        damage: 400,
        duration: 8
      },
      {
        id: 'divine_impact',
        name: 'Divine Impact',
        description: 'Deals 80-200% max HP damage based on movement speed, with guaranteed critical hit if above 250% base speed and 30% chance to stun for 3s',
        cooldown: 30,
        category: 'primary',
        damage: 140,
        duration: 3
      }
    ],
    secondary: [
      {
        id: 'divine_speed',
        name: 'Divine Speed',
        description: '+150% movement speed for 15s, immunity to movement-impairing effects, 50% chance to dodge all attacks, and 30% increased damage',
        cooldown: 40,
        category: 'secondary',
        duration: 15
      },
      {
        id: 'phantom_form',
        name: 'Phantom Form',
        description: '+100% dodge chance for 10s, creates five afterimages that confuse enemies and deal 20% max HP damage when they expire, and increases critical chance by 70%',
        cooldown: 45,
        category: 'secondary',
        duration: 10,
        damage: 100
      },
      {
        id: 'cosmic_dash',
        name: 'Cosmic Dash',
        description: 'Dashes 60 units in any direction, passing through obstacles, becoming invulnerable during the dash, leaving behind a damaging trail, and gaining 80% movement speed for 5s afterward',
        cooldown: 40,
        category: 'secondary',
        duration: 5
      },
      {
        id: 'divine_leap',
        name: 'Divine Leap',
        description: 'Leaps 70 units in any direction and deals 80% max HP damage to enemies at landing point in a 20-unit radius, stunning them for 4s and reducing their defense by 50% for 8s',
        cooldown: 45,
        category: 'secondary',
        damage: 80,
        area: 20,
        duration: 4
      }
    ],
    unique: [
      {
        id: 'cosmic_rift',
        name: 'Cosmic Rift',
        description: 'Teleports 50 units in any direction, becomes invulnerable for 5s, and leaves behind a damaging rift that deals 40% max HP damage per second for 8s and slows enemies by 70%',
        cooldown: 50,
        category: 'unique',
        duration: 5,
        damage: 320
      },
      {
        id: 'divine_form',
        name: 'Divine Form',
        description: 'Becomes intangible for 12s, ignoring collisions, gaining 120% movement speed, 70% damage reduction, 50% increased damage, and immunity to crowd control effects',
        cooldown: 55,
        category: 'unique',
        duration: 12
      },
      {
        id: 'time_acceleration',
        name: 'Time Acceleration',
        description: '+150% movement speed for 10s, creates temporal duplicates that mimic attacks dealing 60% damage, reduces ability cooldowns by 70%, and increases attack speed by 80%',
        cooldown: 50,
        category: 'unique',
        duration: 10
      },
      {
        id: 'divine_agility',
        name: 'Divine Agility',
        description: '+100% movement speed, +100% dodge chance, +80% attack speed, +50% damage, and immunity to crowd control effects for 15s',
        cooldown: 60,
        category: 'unique',
        duration: 15
      }
    ],
    crowdControl: [
      {
        id: 'divine_paralysis',
        name: 'Divine Paralysis',
        description: 'Immobilizes one enemy for 8s, reduces their attack speed by 90%, their defense by 70%, and causes them to take 60% more damage from all sources',
        cooldown: 40,
        category: 'crowdControl',
        duration: 8
      },
      {
        id: 'divine_cyclone',
        name: 'Divine Cyclone',
        description: 'Knocks down all enemies in a 360-degree area for 5s, deals 60% max HP damage, pushes them back 25 units, and reduces their movement speed by 70% for 8s after the knockdown ends',
        cooldown: 45,
        category: 'crowdControl',
        duration: 5,
        damage: 60,
        area: 20
      },
      {
        id: 'divine_flash',
        name: 'Divine Flash',
        description: 'Blinds all enemies within 20 units for 8s, reducing their accuracy by 100%, deals 50% max HP damage, and silences them for 4s',
        cooldown: 50,
        category: 'crowdControl',
        duration: 8,
        area: 20,
        damage: 50
      },
      {
        id: 'divine_cripple',
        name: 'Divine Cripple',
        description: 'Immobilizes one enemy for 8s, reduces their dodge chance by 100%, causes them to take 80% more damage from all sources, and prevents them from being healed',
        cooldown: 45,
        category: 'crowdControl',
        duration: 8
      }
    ],
    formationTraits: [
      {
        id: 'divine_slipstream',
        name: 'Divine Slipstream',
        description: 'Particles form a streamlined formation that increases movement speed by 100%, dodge chance by 70%, provides 50% chance to teleport short distances when taking damage, grants immunity to movement-impairing effects, increases damage by 3% for each 1% of movement speed above base speed, and has 20% chance to become invulnerable for 2s when dropping below 30% health.'
      },
      {
        id: 'divine_mirage',
        name: 'Divine Mirage',
        description: 'Particles arrange in an evasive pattern that increases dodge chance by 80%, reduces damage taken by 50%, provides 60% chance to become briefly intangible when hit, creates afterimages that confuse enemies and deal damage when they expire, grants 40% chance to counter-attack when dodging, and has 15% chance to teleport behind attackers and stun them for 2s.'
      },
      {
        id: 'divine_flow',
        name: 'Divine Flow',
        description: 'Particles form a flowing pattern that reduces the cooldown of movement abilities by 80%, increases movement speed after using abilities by 120%, provides 30% energy regeneration per second while moving, grants 50% chance to reset movement ability cooldowns when dodging, creates temporal duplicates that mimic attacks, and increases attack speed by 5% for each 1% of movement speed above base speed.'
      },
      {
        id: 'divine_matrix',
        name: 'Divine Matrix',
        description: 'Particles arrange in a dynamic pattern that increases damage by 12% for every 5% of movement speed above base speed, provides 60% chance to gain a burst of speed after dealing damage, grants 40% lifesteal based on movement speed, has 30% chance to phase through attacks completely, increases critical chance by 5% for each 10% of movement speed above base speed, and creates damaging afterimages when moving at high speeds.'
      }
    ]
  }
};

/**
 * All ability pools organized by tier
 */
export const ALL_ABILITY_POOLS: Record<Tier, Record<Role, AbilityPool>> = {
  [Tier.COMMON]: TIER_1_ABILITIES,
  [Tier.UNCOMMON]: TIER_2_ABILITIES,
  [Tier.RARE]: TIER_3_ABILITIES,
  [Tier.EPIC]: TIER_4_ABILITIES,
  [Tier.LEGENDARY]: TIER_5_ABILITIES,
  [Tier.MYTHIC]: TIER_6_ABILITIES
};

/**
 * Get an ability pool for a specific role and tier
 * @param role The role
 * @param tier The tier
 * @returns The ability pool for the specified role and tier
 */
export function getAbilityPool(role: Role, tier: Tier): AbilityPool {
  if (!ALL_ABILITY_POOLS[tier] || !ALL_ABILITY_POOLS[tier][role]) {
    throw new Error(`No ability pool found for ${Role[role]}, Tier ${Tier[tier]}`);
  }

  return ALL_ABILITY_POOLS[tier][role];
}

/**
 * Get all abilities for a specific role across all tiers
 * @param role The role
 * @returns All abilities for the specified role
 */
export function getAllAbilitiesForRole(role: Role): AbilityPool[] {
  return Object.values(Tier)
    .filter(tier => typeof tier === 'number')
    .map(tier => getAbilityPool(role, tier as Tier));
}

/**
 * Get all abilities for a specific tier across all roles
 * @param tier The tier
 * @returns All abilities for the specified tier
 */
export function getAllAbilitiesForTier(tier: Tier): AbilityPool[] {
  return Object.values(Role)
    .filter(role => typeof role === 'number')
    .map(role => getAbilityPool(role as Role, tier));
}
