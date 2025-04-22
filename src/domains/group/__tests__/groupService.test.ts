/**
 * Group Service Tests
 *
 * This file contains tests for the Group Service.
 */
import { Rarity, Role, Tier } from '../../../shared/types/core';
import { GroupService } from '../services/groupService';
import { ParticleDistributionService } from '../services/particleDistributionService';
import { ClassAssignmentService } from '../services/classAssignmentService';
import { TraitAssignmentService } from '../services/traitAssignmentService';
import { MainClass } from '../models/types';

import { MockRNGService } from './mocks/mockRngService';
import { MockTraitRepository } from './mocks/mockTraitRepository';

describe('GroupService', () => {
  let groupService: GroupService;

  let mockRngService: MockRNGService;
  let mockTraitRepository: MockTraitRepository;

  beforeEach(() => {
    // Create mocks
    mockRngService = new MockRNGService(0.5);
    mockTraitRepository = new MockTraitRepository();

    // Create services
    const particleDistributionService = new ParticleDistributionService(mockRngService);
    const classAssignmentService = new ClassAssignmentService(mockRngService);
    const traitAssignmentService = new TraitAssignmentService(mockRngService, mockTraitRepository);

    // Create the Group Service
    groupService = new GroupService(
      particleDistributionService,
      classAssignmentService,
      traitAssignmentService
    );

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createParticleGroups', () => {
    it('should create particle groups with the correct total particles', () => {
      // Arrange
      const totalParticles = 500;
      const seed = 'test-seed';

      // Act
      const result = groupService.createParticleGroups(totalParticles, seed);

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
  });

  describe('assignClass', () => {
    it('should assign a class based on particle groups', () => {
      // Arrange
      const particleGroups = {
        [Role.CORE]: {
          role: Role.CORE,
          particleCount: 20,
          attributes: {
            attribute: 20
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
          particleCount: 20,
          attributes: {
            attribute: 20
          },
          rarity: Rarity.COMMON
        },
        [Role.DEFENSE]: {
          role: Role.DEFENSE,
          particleCount: 20,
          attributes: {
            attribute: 20
          },
          rarity: Rarity.COMMON
        },
        [Role.ATTACK]: {
          role: Role.ATTACK,
          particleCount: 20,
          attributes: {
            attribute: 20
          },
          rarity: Rarity.COMMON
        },
        totalParticles: 500
      };
      const seed = 'test-seed';

      // Act
      const result = groupService.assignClass(particleGroups, seed);

      // Assert
      expect(result).toBeDefined();
      expect(result.mainClass).toBeDefined();
      expect(result.subclass).toBeDefined();
      expect(result.dominantRole).toBeDefined();
      expect(result.tier).toBeDefined();
    });
  });

  describe('assignTraits', () => {
    it('should assign traits based on role and tier', () => {
      // Arrange
      const role = Role.CORE;
      const tier = Tier.TIER_3;
      const seed = 'test-seed';

      // Act
      const result = groupService.assignTraits(role, tier, seed);

      // Assert
      expect(result).toBeDefined();

      // Check that the correct number of traits are assigned
      // Using type assertion to avoid TypeScript's type narrowing issue
      if ([Tier.TIER_1, Tier.TIER_2].includes(tier as Tier)) {
        expect(result.primary).toBeDefined();
        expect(result.secondary).toBeUndefined();
        expect(result.tertiary).toBeUndefined();
      } else if ([Tier.TIER_3, Tier.TIER_4].includes(tier as Tier)) {
        expect(result.primary).toBeDefined();
        expect(result.secondary).toBeDefined();
        expect(result.tertiary).toBeUndefined();
      } else {
        expect(result.primary).toBeDefined();
        expect(result.secondary).toBeDefined();
        expect(result.tertiary).toBeDefined();
      }
    });
  });

  describe('calculateTier', () => {
    it('should calculate the correct tier for each particle range', () => {
      // Arrange & Act & Assert
      expect(groupService.calculateTier(60)).toBe(Tier.TIER_1);
      expect(groupService.calculateTier(116)).toBe(Tier.TIER_1);
      expect(groupService.calculateTier(117)).toBe(Tier.TIER_2);
      expect(groupService.calculateTier(200)).toBe(Tier.TIER_2);
      expect(groupService.calculateTier(201)).toBe(Tier.TIER_3);
      expect(groupService.calculateTier(250)).toBe(Tier.TIER_3);
      expect(groupService.calculateTier(251)).toBe(Tier.TIER_4);
      expect(groupService.calculateTier(300)).toBe(Tier.TIER_4);
      expect(groupService.calculateTier(301)).toBe(Tier.TIER_5);
      expect(groupService.calculateTier(350)).toBe(Tier.TIER_5);
      expect(groupService.calculateTier(351)).toBe(Tier.TIER_6);
      expect(groupService.calculateTier(400)).toBe(Tier.TIER_6);
    });
  });

  describe('calculateAttributes', () => {
    it('should calculate attribute based on particle count', () => {
      // Arrange
      const particleCount = 100;

      // Act
      const result = groupService.calculateAttributes(particleCount);

      // Assert
      expect(result).toBeDefined();
      expect(result.attribute).toBeDefined();
      expect(result.attribute).toBe(particleCount);
    });
  });
});
