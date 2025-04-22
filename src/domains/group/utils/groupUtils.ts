/**
 * Group Utilities
 * 
 * This file provides utility functions for group operations in the Group Domain.
 */
import { Role, Tier } from '../../../shared/types/core';
import { TIER_PARTICLE_RANGES } from '../constants/distribution';
import { ParticleGroups } from '../models/particleGroups';

/**
 * Calculates the tier of a creature based on its total particle count
 * @param totalParticles The total number of particles for the creature
 * @returns The tier of the creature
 */
export const calculateTier = (totalParticles: number): Tier => {
  for (const [tier, [min, max]] of Object.entries(TIER_PARTICLE_RANGES)) {
    if (totalParticles >= min && totalParticles <= max) {
      return tier as Tier;
    }
  }
  
  // Default to TIER_1 if no match is found
  return Tier.TIER_1;
};

/**
 * Calculates the dominant role based on the particle distribution
 * @param particleGroups The particle groups for the creature
 * @returns The dominant role
 */
export const calculateDominantRole = (particleGroups: ParticleGroups): Role => {
  let maxParticles = 0;
  let dominantRole = Role.CORE;
  
  // Find the role with the most particles
  for (const role of Object.values(Role)) {
    const particleCount = particleGroups[role].particleCount;
    if (particleCount > maxParticles) {
      maxParticles = particleCount;
      dominantRole = role;
    }
  }
  
  return dominantRole;
};

/**
 * Calculates the secondary role based on the particle distribution
 * @param particleGroups The particle groups for the creature
 * @param dominantRole The dominant role
 * @returns The secondary role
 */
export const calculateSecondaryRole = (
  particleGroups: ParticleGroups,
  dominantRole: Role
): Role => {
  let maxParticles = 0;
  let secondaryRole = dominantRole === Role.CORE ? Role.CONTROL : Role.CORE;
  
  // Find the role with the second most particles
  for (const role of Object.values(Role)) {
    if (role === dominantRole) continue;
    
    const particleCount = particleGroups[role].particleCount;
    if (particleCount > maxParticles) {
      maxParticles = particleCount;
      secondaryRole = role;
    }
  }
  
  return secondaryRole;
};
