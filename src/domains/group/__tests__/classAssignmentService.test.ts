/**
 * Class Assignment Service Tests
 *
 * This file contains tests for the Class Assignment Service.
 */
import { Rarity, Role, Tier } from '../../../shared/types/core';
import { ClassAssignmentService } from '../services/classAssignmentService';
import { MainClass, SpecializedPath } from '../models/types';

import { MockRNGService } from './mocks/mockRngService';

describe('ClassAssignmentService', () => {
  let classAssignmentService: ClassAssignmentService;

  let mockRngService: MockRNGService;

  beforeEach(() => {
    mockRngService = new MockRNGService(0.5);
    classAssignmentService = new ClassAssignmentService(mockRngService);
    jest.clearAllMocks();
  });

  describe('assignClass', () => {
    it('should assign a class based on particle groups', () => {
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
      const seed = 'test-seed';

      // Act
      const result = classAssignmentService.assignClass(particleGroups, seed);

      // Assert
      expect(result).toBeDefined();
      expect(result.mainClass).toBe(MainClass.ROGUE);
      expect(result.subclass).toBeDefined();
      expect(result.dominantRole).toBe(Role.MOVEMENT);
      expect(result.secondaryRole).toBe(Role.ATTACK);
      expect(result.tier).toBe(Tier.TIER_1);
    });
  });

  describe('createHybridSubclass', () => {
    it('should create a hybrid subclass for tiers 1-2', () => {
      // Arrange
      const mainClass = MainClass.HEALER;
      const primaryRole = Role.CORE;
      const secondaryRole = Role.CONTROL;
      const tier = Tier.TIER_1;

      // Act
      const result = classAssignmentService.createHybridSubclass(
        mainClass,
        primaryRole,
        secondaryRole,
        tier
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Vital Arcane Healer');
      expect(result.mainClass).toBe(mainClass);
      expect(result.tier).toBe(tier);
      expect(result.primaryRole).toBe(primaryRole);
      expect(result.secondaryRole).toBe(secondaryRole);
    });
  });

  describe('createSpecializedSubclass', () => {
    it('should create a specialized subclass for tiers 3-6', () => {
      // Arrange
      const mainClass = MainClass.HEALER;
      const specializedPath = SpecializedPath.RESTORATION_SPECIALIST;
      const tier = Tier.TIER_3;

      // Act
      const result = classAssignmentService.createSpecializedSubclass(
        mainClass,
        specializedPath,
        tier
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Lifebinder');
      expect(result.mainClass).toBe(mainClass);
      expect(result.tier).toBe(tier);
      expect(result.specializedPath).toBe(specializedPath);
    });
  });

  describe('determineSpecializedPath', () => {
    it('should determine a specialized path based on main class and secondary role', () => {
      // Arrange
      const mainClass = MainClass.HEALER;
      const secondaryRole = Role.CONTROL;
      const seed = 'test-seed';

      // Set up the mock RNG service to return different values
      mockRngService.setMockValue(seed, [0.2, 0.8]);

      // Act
      const result = classAssignmentService.determineSpecializedPath(
        mainClass,
        secondaryRole,
        seed
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toBe(SpecializedPath.RESTORATION_SPECIALIST);

      // Create a new instance with a different mock value
      mockRngService = new MockRNGService(0.8);
      classAssignmentService = new ClassAssignmentService(mockRngService);

      // Act
      const result2 = classAssignmentService.determineSpecializedPath(
        mainClass,
        secondaryRole,
        `${seed}-2`
      );

      // Assert
      expect(result2).toBeDefined();
      expect(result2).toBe(SpecializedPath.FIELD_MEDIC);
    });
  });
});
