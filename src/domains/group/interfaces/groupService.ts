/**
 * Group Service Interface
 *
 * This file defines the interface for the Group Service.
 */
import { Role, Tier } from '../../../shared/types/core';
import { ClassAssignment } from '../models/class';
import { GroupAttributes, ParticleGroups } from '../models/particleGroups';
import { GroupTraits } from '../models/traits';

/**
 * IGroupService interface
 * Defines the methods for the Group Service
 */
export interface IGroupService {
  /**
   * Creates particle groups for a creature
   * @param totalParticles The total number of particles for the creature
   * @param seed The seed for random number generation
   * @returns The particle groups for the creature
   */
  createParticleGroups(totalParticles: number, seed: string): ParticleGroups;

  /**
   * Assigns a class to a creature based on its particle groups
   * @param particleGroups The particle groups for the creature
   * @param seed The seed for random number generation
   * @returns The class assignment for the creature
   */
  assignClass(particleGroups: ParticleGroups, seed: string): ClassAssignment;

  /**
   * Assigns traits to a particle group
   * @param particleGroup The particle group to assign traits to
   * @param tier The tier of the creature
   * @param seed The seed for random number generation
   * @returns The traits for the particle group
   */
  assignTraits(role: Role, tier: Tier, seed: string): GroupTraits;

  /**
   * Calculates the tier of a creature based on its total particle count
   * @param totalParticles The total number of particles for the creature
   * @returns The tier of the creature
   */
  calculateTier(totalParticles: number): Tier;

  /**
   * Calculates the attribute for a particle group
   * @param particleCount The number of particles in the group
   * @returns The attribute for the particle group
   */
  calculateAttributes(particleCount: number): GroupAttributes;
}
