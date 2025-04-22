/**
 * Group Traits Model
 * 
 * This file defines the data structures for group traits in the Group Domain.
 */
import { Rarity } from '../../../shared/types/core';

/**
 * GroupTraitType enum
 * Defines the types of traits that a group can have
 */
export enum GroupTraitType {
  OFFENSIVE = 'Offensive',
  DEFENSIVE = 'Defensive',
  UTILITY = 'Utility',
  PASSIVE = 'Passive',
  ACTIVE = 'Active'
}

/**
 * GroupTrait interface
 * Defines a trait that a group can have
 */
export interface GroupTrait {
  id: string;
  name: string;
  description: string;
  type: GroupTraitType;
  rarity: Rarity;
  effect: string;
  modifiers?: Record<string, number>;
}

/**
 * GroupTraits interface
 * Defines the traits that a group has
 */
export interface GroupTraits {
  primary?: GroupTrait;
  secondary?: GroupTrait;
  tertiary?: GroupTrait;
}

/**
 * TraitRarityDistribution interface
 * Defines the distribution of trait rarities based on the tier
 */
export interface TraitRarityDistribution {
  [Rarity.COMMON]: number;
  [Rarity.UNCOMMON]: number;
  [Rarity.RARE]: number;
  [Rarity.EPIC]: number;
  [Rarity.LEGENDARY]: number;
  [Rarity.MYTHIC]: number;
}
