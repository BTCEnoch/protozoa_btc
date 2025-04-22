/**
 * Class Model
 * 
 * This file defines the data structures for classes in the Group Domain.
 */
import { Role, Tier } from '../../../shared/types/core';
import { MainClass, SpecializedPath, Subclass } from './types';

/**
 * ClassAssignment interface
 * Defines the class assignment for a creature
 */
export interface ClassAssignment {
  mainClass: MainClass;
  subclass: Subclass;
  dominantRole: Role;
  secondaryRole?: Role;
  tier: Tier;
}

/**
 * HybridSubclass interface
 * Defines a hybrid subclass for tiers 1-2
 */
export interface HybridSubclass extends Subclass {
  primaryRole: Role;
  secondaryRole: Role;
}

/**
 * SpecializedSubclass interface
 * Defines a specialized subclass for tiers 3-6
 */
export interface SpecializedSubclass extends Subclass {
  specializedPath: SpecializedPath;
}

/**
 * SubclassEvolution interface
 * Defines the evolution of a subclass across tiers
 */
export interface SubclassEvolution {
  tier1: HybridSubclass;
  tier2: HybridSubclass;
  tier3: SpecializedSubclass;
  tier4: SpecializedSubclass;
  tier5: SpecializedSubclass;
  tier6: SpecializedSubclass;
}
