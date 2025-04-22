/**
 * Distribution Utilities
 *
 * This file provides utility functions for particle distribution in the Group Domain.
 */
import { Rarity, Role } from '../../../shared/types/core';
import { BASE_PARTICLES_PER_GROUP, MIN_PARTICLES_PER_GROUP, PARTICLE_RANGE, PARTICLE_RARITY_RANGES } from '../constants/distribution';

/**
 * Normalized Random Split
 * Distributes particles using a normalized random split method
 *
 * @param roles The roles to distribute particles to
 * @param totalParticles The total number of particles to distribute
 * @param rngService The RNG service to use for random number generation
 * @param seed The seed for random number generation
 * @returns The distribution of particles across the roles
 */
export const normalizedRandomSplit = (
  roles: Role[],
  totalParticles: number,
  rngService: any,
  seed: string
): Record<Role, number> => {
  // Calculate distributable particles (after base allocation)
  const baseParticles = BASE_PARTICLES_PER_GROUP * roles.length;
  const distributableParticles = totalParticles - baseParticles;

  if (distributableParticles < 0) {
    throw new Error(`Total particles (${totalParticles}) is less than base allocation (${baseParticles})`);
  }

  // Generate random values for each role
  const randomValues = roles.map((_, index) => {
    return rngService.getRandomNumber(`${seed}-${index}`);
  });

  // Calculate the sum of random values
  const sum = randomValues.reduce((a, b) => a + b, 0);

  // Normalize random values to get proportions
  const proportions = randomValues.map(value => value / sum);

  // Calculate initial particle counts (base + proportion of distributable)
  const initialCounts = proportions.map(proportion =>
    BASE_PARTICLES_PER_GROUP + Math.floor(proportion * distributableParticles)
  );

  // Create distribution object
  const distribution: Record<Role, number> = {} as Record<Role, number>;
  let remainingParticles = totalParticles;

  // Assign initial counts with constraints
  roles.forEach((role, index) => {
    const { MIN: minParticles, MAX: maxParticles } = PARTICLE_RANGE;

    // Apply constraints (min/max)
    let count = Math.max(minParticles, Math.min(initialCounts[index], maxParticles));

    distribution[role] = count;
    remainingParticles -= count;
  });

  // Distribute remaining particles (if any)
  if (remainingParticles > 0) {
    // Sort roles by particle count (ascending)
    const sortedRoles = [...roles].sort((a, b) => distribution[a] - distribution[b]);

    // Distribute remaining particles to roles with the fewest particles first
    for (let i = 0; i < sortedRoles.length && remainingParticles > 0; i++) {
      const role = sortedRoles[i];

      if (distribution[role] < PARTICLE_RANGE.MAX) {
        const addCount = Math.min(remainingParticles, PARTICLE_RANGE.MAX - distribution[role]);
        distribution[role] += addCount;
        remainingParticles -= addCount;
      }
    }

    // If we still have remaining particles, distribute them to any role that can take more
    if (remainingParticles > 0) {
      for (let i = 0; i < roles.length && remainingParticles > 0; i++) {
        const role = roles[i];

        if (distribution[role] < PARTICLE_RANGE.MAX) {
          const addCount = Math.min(remainingParticles, PARTICLE_RANGE.MAX - distribution[role]);
          distribution[role] += addCount;
          remainingParticles -= addCount;
        }
      }
    }
  }

  // Handle negative remaining (if we've allocated too many)
  if (remainingParticles < 0) {
    // Sort roles by particle count (descending)
    const sortedRoles = [...roles].sort((a, b) => distribution[b] - distribution[a]);

    // Remove particles from roles with the most particles first
    for (let i = 0; i < sortedRoles.length && remainingParticles < 0; i++) {
      const role = sortedRoles[i];

      if (distribution[role] > MIN_PARTICLES_PER_GROUP) {
        const removeCount = Math.min(-remainingParticles, distribution[role] - MIN_PARTICLES_PER_GROUP);
        distribution[role] -= removeCount;
        remainingParticles += removeCount;
      }
    }
  }

  return distribution;
};

/**
 * Determines the rarity of a particle count
 * @param particleCount The number of particles
 * @returns The rarity of the particle count
 */
export const determineParticleRarity = (particleCount: number): Rarity => {
  if (particleCount >= PARTICLE_RARITY_RANGES.MYTHIC[0] && particleCount <= PARTICLE_RARITY_RANGES.MYTHIC[1]) {
    return Rarity.MYTHIC;
  } else if (particleCount >= PARTICLE_RARITY_RANGES.LEGENDARY[0] && particleCount <= PARTICLE_RARITY_RANGES.LEGENDARY[1]) {
    return Rarity.LEGENDARY;
  } else if (particleCount >= PARTICLE_RARITY_RANGES.EPIC[0] && particleCount <= PARTICLE_RARITY_RANGES.EPIC[1]) {
    return Rarity.EPIC;
  } else if (particleCount >= PARTICLE_RARITY_RANGES.RARE[0] && particleCount <= PARTICLE_RARITY_RANGES.RARE[1]) {
    return Rarity.RARE;
  } else if (particleCount >= PARTICLE_RARITY_RANGES.UNCOMMON[0] && particleCount <= PARTICLE_RARITY_RANGES.UNCOMMON[1]) {
    return Rarity.UNCOMMON;
  } else {
    return Rarity.COMMON;
  }
};
