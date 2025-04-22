/**
 * Particle Distribution Service Interface
 * 
 * This file defines the interface for the Particle Distribution Service.
 */
import { Role } from '../../../shared/types/core';
import { ParticleGroups } from '../models/particleGroups';

/**
 * IParticleDistributionService interface
 * Defines the methods for the Particle Distribution Service
 */
export interface IParticleDistributionService {
  /**
   * Distributes particles across the five roles using the Dirichlet distribution
   * @param totalParticles The total number of particles to distribute
   * @param seed The seed for random number generation
   * @returns The distribution of particles across the five roles
   */
  distributeParticles(totalParticles: number, seed: string): ParticleGroups;

  /**
   * Calculates the dominant role based on the particle distribution
   * @param particleGroups The particle groups for the creature
   * @returns The dominant role
   */
  calculateDominantRole(particleGroups: ParticleGroups): Role;

  /**
   * Calculates the secondary role based on the particle distribution
   * @param particleGroups The particle groups for the creature
   * @param dominantRole The dominant role
   * @returns The secondary role
   */
  calculateSecondaryRole(particleGroups: ParticleGroups, dominantRole: Role): Role;
}
