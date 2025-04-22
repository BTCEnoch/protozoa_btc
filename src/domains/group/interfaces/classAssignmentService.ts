/**
 * Class Assignment Service Interface
 * 
 * This file defines the interface for the Class Assignment Service.
 */
import { Role, Tier } from '../../../shared/types/core';
import { ClassAssignment, HybridSubclass, SpecializedSubclass } from '../models/class';
import { MainClass, SpecializedPath } from '../models/types';
import { ParticleGroups } from '../models/particleGroups';

/**
 * IClassAssignmentService interface
 * Defines the methods for the Class Assignment Service
 */
export interface IClassAssignmentService {
  /**
   * Assigns a class to a creature based on its particle groups
   * @param particleGroups The particle groups for the creature
   * @param seed The seed for random number generation
   * @returns The class assignment for the creature
   */
  assignClass(particleGroups: ParticleGroups, seed: string): ClassAssignment;

  /**
   * Creates a hybrid subclass for tiers 1-2
   * @param mainClass The main class of the creature
   * @param primaryRole The primary role of the creature
   * @param secondaryRole The secondary role of the creature
   * @param tier The tier of the creature
   * @returns The hybrid subclass
   */
  createHybridSubclass(
    mainClass: MainClass,
    primaryRole: Role,
    secondaryRole: Role,
    tier: Tier
  ): HybridSubclass;

  /**
   * Creates a specialized subclass for tiers 3-6
   * @param mainClass The main class of the creature
   * @param specializedPath The specialized path of the creature
   * @param tier The tier of the creature
   * @returns The specialized subclass
   */
  createSpecializedSubclass(
    mainClass: MainClass,
    specializedPath: SpecializedPath,
    tier: Tier
  ): SpecializedSubclass;

  /**
   * Determines the specialized path for a creature based on its dominant and secondary roles
   * @param mainClass The main class of the creature
   * @param secondaryRole The secondary role of the creature
   * @param seed The seed for random number generation
   * @returns The specialized path
   */
  determineSpecializedPath(
    mainClass: MainClass,
    secondaryRole: Role,
    seed: string
  ): SpecializedPath;
}
