/**
 * Core types for the Group Domain
 */
import { Role, Tier } from '../../../shared/types/core';

/**
 * MainClass enum
 * Defines the main classes that creatures can have based on their dominant role
 */
export enum MainClass {
  HEALER = 'Healer',     // CORE dominant
  CASTER = 'Caster',     // CONTROL dominant
  ROGUE = 'Rogue',       // MOVEMENT dominant
  TANK = 'Tank',         // DEFENSE dominant
  STRIKER = 'Striker'    // ATTACK dominant
}

/**
 * SpecializedPath enum
 * Defines the specialized paths that creatures can follow at higher tiers
 */
export enum SpecializedPath {
  // Healer Paths
  RESTORATION_SPECIALIST = 'RestorationSpecialist',
  FIELD_MEDIC = 'FieldMedic',

  // Caster Paths
  ARCHMAGE = 'Archmage',
  ENCHANTER = 'Enchanter',

  // Rogue Paths
  ASSASSIN_ROGUE = 'AssassinRogue',
  ACROBAT = 'Acrobat',

  // Tank Paths
  SENTINEL = 'Sentinel',
  GUARDIAN = 'Guardian',

  // Striker Paths
  BERSERKER = 'Berserker',
  ASSASSIN_STRIKER = 'AssassinStriker'
}

/**
 * Subclass interface
 * Defines a subclass with its name, main class, tier, and specialized path
 */
export interface Subclass {
  name: string;
  mainClass: MainClass;
  tier: Tier;
  specializedPath?: SpecializedPath;
}

/**
 * RoleToMainClass mapping
 * Maps roles to their corresponding main classes
 */
export const RoleToMainClass: Record<Role, MainClass> = {
  [Role.CORE]: MainClass.HEALER,
  [Role.CONTROL]: MainClass.CASTER,
  [Role.MOVEMENT]: MainClass.ROGUE,
  [Role.DEFENSE]: MainClass.TANK,
  [Role.ATTACK]: MainClass.STRIKER
};

/**
 * SubclassPrefix mapping
 * Maps roles to their corresponding subclass prefixes
 */
export const SubclassPrefix: Record<Role, string> = {
  [Role.CORE]: 'Vital',
  [Role.CONTROL]: 'Arcane',
  [Role.MOVEMENT]: 'Swift',
  [Role.DEFENSE]: 'Guardian',
  [Role.ATTACK]: 'Battle'
};

/**
 * TierToParticleRange mapping
 * Maps tiers to their corresponding particle count ranges
 */
export const TierToParticleRange: Record<Tier, [number, number]> = {
  [Tier.TIER_1]: [43, 95],    // Common
  [Tier.TIER_2]: [96, 110],   // Uncommon
  [Tier.TIER_3]: [111, 125],  // Rare
  [Tier.TIER_4]: [126, 141],  // Epic
  [Tier.TIER_5]: [142, 151],  // Legendary
  [Tier.TIER_6]: [152, 220]   // Mythic
};

/**
 * MainClassToSpecializedPaths mapping
 * Maps main classes to their corresponding specialized paths
 */
export const MainClassToSpecializedPaths: Record<MainClass, SpecializedPath[]> = {
  [MainClass.HEALER]: [SpecializedPath.RESTORATION_SPECIALIST, SpecializedPath.FIELD_MEDIC],
  [MainClass.CASTER]: [SpecializedPath.ARCHMAGE, SpecializedPath.ENCHANTER],
  [MainClass.ROGUE]: [SpecializedPath.ASSASSIN_ROGUE, SpecializedPath.ACROBAT],
  [MainClass.TANK]: [SpecializedPath.SENTINEL, SpecializedPath.GUARDIAN],
  [MainClass.STRIKER]: [SpecializedPath.BERSERKER, SpecializedPath.ASSASSIN_STRIKER]
};

/**
 * SpecializedPathToEvolution mapping
 * Maps specialized paths to their evolution names at each tier
 */
export const SpecializedPathToEvolution: Record<SpecializedPath, Record<Tier, string>> = {
  [SpecializedPath.RESTORATION_SPECIALIST]: {
    [Tier.TIER_3]: 'Lifebinder',
    [Tier.TIER_4]: 'Vitalizer',
    [Tier.TIER_5]: 'Soulweaver',
    [Tier.TIER_6]: 'Eternal Guardian',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.FIELD_MEDIC]: {
    [Tier.TIER_3]: 'Mender',
    [Tier.TIER_4]: 'Rejuvenator',
    [Tier.TIER_5]: 'Lifebloom',
    [Tier.TIER_6]: 'Divine Caretaker',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.ARCHMAGE]: {
    [Tier.TIER_3]: 'Spellweaver',
    [Tier.TIER_4]: 'Arcanist',
    [Tier.TIER_5]: 'Archmage',
    [Tier.TIER_6]: 'Arcane Master',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.ENCHANTER]: {
    [Tier.TIER_3]: 'Illusionist',
    [Tier.TIER_4]: 'Enchanter',
    [Tier.TIER_5]: 'Mystic',
    [Tier.TIER_6]: 'Reality Bender',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.ASSASSIN_ROGUE]: {
    [Tier.TIER_3]: 'Stalker',
    [Tier.TIER_4]: 'Shadowblade',
    [Tier.TIER_5]: 'Assassin',
    [Tier.TIER_6]: "Death's Shadow",
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.ACROBAT]: {
    [Tier.TIER_3]: 'Tumbler',
    [Tier.TIER_4]: 'Acrobat',
    [Tier.TIER_5]: 'Windwalker',
    [Tier.TIER_6]: 'Phantom Dancer',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.SENTINEL]: {
    [Tier.TIER_3]: 'Bulwark',
    [Tier.TIER_4]: 'Sentinel',
    [Tier.TIER_5]: 'Juggernaut',
    [Tier.TIER_6]: 'Living Fortress',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.GUARDIAN]: {
    [Tier.TIER_3]: 'Protector',
    [Tier.TIER_4]: 'Guardian',
    [Tier.TIER_5]: 'Aegis',
    [Tier.TIER_6]: 'Divine Shield',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.BERSERKER]: {
    [Tier.TIER_3]: 'Warrior',
    [Tier.TIER_4]: 'Berserker',
    [Tier.TIER_5]: 'Warlord',
    [Tier.TIER_6]: 'Godslayer',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  },
  [SpecializedPath.ASSASSIN_STRIKER]: {
    [Tier.TIER_3]: 'Duelist',
    [Tier.TIER_4]: 'Blademaster',
    [Tier.TIER_5]: 'Deathbringer',
    [Tier.TIER_6]: 'Reaper',
    [Tier.TIER_1]: '',  // Not used at Tier 1
    [Tier.TIER_2]: ''   // Not used at Tier 2
  }
};
