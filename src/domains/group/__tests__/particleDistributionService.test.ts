/**
 * Particle Distribution Service Tests
 *
 * This file contains tests for the Particle Distribution Service.
 */
import { Rarity, Role } from '../../../shared/types/core';
import { ParticleDistributionService } from '../services/particleDistributionService';
import { MIN_PARTICLES_PER_GROUP } from '../constants/distribution';

import { MockRNGService } from './mocks/mockRngService';

describe('ParticleDistributionService', () => {
  let particleDistributionService: ParticleDistributionService;

  let mockRngService: MockRNGService;

  beforeEach(() => {
    mockRngService = new MockRNGService(0.5);
    particleDistributionService = new ParticleDistributionService(mockRngService);
    jest.clearAllMocks();
  });

  describe('distributeParticles', () => {
    it('should distribute particles across all roles', () => {
      // Arrange
      const totalParticles = 500;
      const seed = 'test-seed';

      // Act
      const result = particleDistributionService.distributeParticles(totalParticles, seed);

      // Assert
      expect(result.totalParticles).toBe(totalParticles);
      expect(result[Role.CORE]).toBeDefined();
      expect(result[Role.CONTROL]).toBeDefined();
      expect(result[Role.MOVEMENT]).toBeDefined();
      expect(result[Role.DEFENSE]).toBeDefined();
      expect(result[Role.ATTACK]).toBeDefined();

      // Check that the sum of particle counts equals the total
      const sum = Object.values(Role).reduce(
        (acc, role) => acc + result[role].particleCount,
        0
      );
      expect(sum).toBe(totalParticles);
    });

    it('should ensure each group has at least the minimum number of particles', () => {
      // Arrange
      const totalParticles = 500;
      const seed = 'test-seed';

      // Act
      const result = particleDistributionService.distributeParticles(totalParticles, seed);

      // Assert
      for (const role of Object.values(Role)) {
        expect(result[role].particleCount).toBeGreaterThanOrEqual(MIN_PARTICLES_PER_GROUP);
      }
    });

    it('should calculate attributes for each group', () => {
      // Arrange
      const totalParticles = 500;
      const seed = 'test-seed';

      // Act
      const result = particleDistributionService.distributeParticles(totalParticles, seed);

      // Assert
      for (const role of Object.values(Role)) {
        expect(result[role].attributes).toBeDefined();
        expect(result[role].attributes.attribute).toBeDefined();
        expect(result[role].attributes.attribute).toBe(result[role].particleCount);
        expect(result[role].rarity).toBeDefined();
      }
    });
  });

  describe('calculateDominantRole', () => {
    it('should return the role with the most particles', () => {
      // Arrange
      const particleGroups = {
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
        totalParticles: 500
      };

      // Act
      const result = particleDistributionService.calculateDominantRole(particleGroups);

      // Assert
      expect(result).toBe(Role.MOVEMENT);
    });
  });

  describe('calculateSecondaryRole', () => {
    it('should return the role with the second most particles', () => {
      // Arrange
      const particleGroups = {
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
        totalParticles: 500
      };
      const dominantRole = Role.MOVEMENT;

      // Act
      const result = particleDistributionService.calculateSecondaryRole(particleGroups, dominantRole);

      // Assert
      expect(result).toBe(Role.ATTACK);
    });
  });
});
