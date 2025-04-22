/**
 * Utility Tests
 *
 * This file contains tests for the utility functions in the Group Domain.
 */
import { Rarity, Role, Tier } from '../../../shared/types/core';
import { ATTRIBUTE_RANGE, PARTICLE_RANGE, TIER_PARTICLE_RANGES } from '../constants/distribution';
import { ParticleGroups } from '../models/particleGroups';
import { calculateAttributes, lerp, mapParticlesToAttribute } from '../utils/attributeUtils';
import { calculateDominantRole, calculateSecondaryRole, calculateTier } from '../utils/groupUtils';

describe('Attribute Utilities', () => {
  describe('lerp', () => {
    it('should interpolate correctly', () => {
      // Arrange & Act & Assert
      expect(lerp(0, 0, 10, 0, 100)).toBe(0);
      expect(lerp(5, 0, 10, 0, 100)).toBe(50);
      expect(lerp(10, 0, 10, 0, 100)).toBe(100);

      // Test clamping
      expect(lerp(-5, 0, 10, 0, 100)).toBe(0);
      expect(lerp(15, 0, 10, 0, 100)).toBe(100);
    });
  });

  describe('mapParticlesToAttribute', () => {
    it('should map particles to attributes correctly', () => {
      // Arrange
      const { MIN: minParticles, MAX: maxParticles } = PARTICLE_RANGE;
      const { MIN: minAttribute, MAX: maxAttribute } = ATTRIBUTE_RANGE;

      // Act & Assert
      // Test minimum particles
      expect(mapParticlesToAttribute(minParticles)).toBe(minAttribute);

      // Test maximum particles
      expect(mapParticlesToAttribute(maxParticles)).toBe(maxAttribute);

      // Test middle particles
      const middleParticles = (minParticles + maxParticles) / 2;
      const middleAttribute = (minAttribute + maxAttribute) / 2;
      expect(mapParticlesToAttribute(middleParticles)).toBeCloseTo(middleAttribute, 0);
    });
  });

  describe('calculateAttributes', () => {
    it('should calculate attributes correctly', () => {
      // Arrange
      const particleCount = 100;

      // Act
      const result = calculateAttributes(particleCount);

      // Assert
      expect(result).toBeDefined();
      expect(result.attribute).toBeDefined();
      expect(result.attribute).toBe(particleCount);
    });
  });
});

describe('Group Utilities', () => {
  describe('calculateTier', () => {
    it('should calculate the correct tier for each particle range', () => {
      // Arrange & Act & Assert
      for (const [tier, [min, max]] of Object.entries(TIER_PARTICLE_RANGES)) {
        expect(calculateTier(min)).toBe(tier as Tier);
        expect(calculateTier(max)).toBe(tier as Tier);

        if (min > PARTICLE_RANGE.MIN) {
          expect(calculateTier(min - 1)).not.toBe(tier as Tier);
        }

        if (max < PARTICLE_RANGE.MAX) {
          expect(calculateTier(max + 1)).not.toBe(tier as Tier);
        }
      }
    });
  });

  describe('calculateDominantRole', () => {
    it('should return the role with the most particles', () => {
      // Arrange
      const particleGroups: ParticleGroups = {
        [Role.CORE]: {
          role: Role.CORE,
          particleCount: 10,
          attributes: {
            attribute: 10
          },
          rarity: Rarity.COMMON
        },
        [Role.CONTROL]: {
          role: Role.CONTROL,
          particleCount: 20,
          attributes: {
            attribute: 20
          },
          rarity: Rarity.COMMON
        },
        [Role.MOVEMENT]: {
          role: Role.MOVEMENT,
          particleCount: 30,
          attributes: {
            attribute: 30
          },
          rarity: Rarity.COMMON
        },
        [Role.DEFENSE]: {
          role: Role.DEFENSE,
          particleCount: 15,
          attributes: {
            attribute: 15
          },
          rarity: Rarity.COMMON
        },
        [Role.ATTACK]: {
          role: Role.ATTACK,
          particleCount: 25,
          attributes: {
            attribute: 25
          },
          rarity: Rarity.COMMON
        },
        totalParticles: 100
      };

      // Act
      const result = calculateDominantRole(particleGroups);

      // Assert
      expect(result).toBe(Role.MOVEMENT);
    });
  });

  describe('calculateSecondaryRole', () => {
    it('should return the role with the second most particles', () => {
      // Arrange
      const particleGroups: ParticleGroups = {
        [Role.CORE]: {
          role: Role.CORE,
          particleCount: 10,
          attributes: {
            attribute: 10
          },
          rarity: Rarity.COMMON
        },
        [Role.CONTROL]: {
          role: Role.CONTROL,
          particleCount: 20,
          attributes: {
            attribute: 20
          },
          rarity: Rarity.COMMON
        },
        [Role.MOVEMENT]: {
          role: Role.MOVEMENT,
          particleCount: 30,
          attributes: {
            attribute: 30
          },
          rarity: Rarity.COMMON
        },
        [Role.DEFENSE]: {
          role: Role.DEFENSE,
          particleCount: 15,
          attributes: {
            attribute: 15
          },
          rarity: Rarity.COMMON
        },
        [Role.ATTACK]: {
          role: Role.ATTACK,
          particleCount: 25,
          attributes: {
            attribute: 25
          },
          rarity: Rarity.COMMON
        },
        totalParticles: 100
      };
      const dominantRole = Role.MOVEMENT;

      // Act
      const result = calculateSecondaryRole(particleGroups, dominantRole);

      // Assert
      expect(result).toBe(Role.ATTACK);
    });
  });
});
