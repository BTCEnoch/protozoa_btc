/**
 * Integration Tests
 *
 * This file contains integration tests for the Group Domain.
 */
import { Rarity, Role, Tier } from '../../../shared/types/core';
import { createGroupService } from '..';
import { IGroupService } from '../interfaces/groupService';
import { MainClass } from '../models/types';
import { GroupTraits } from '../models/traits';

import { MockRNGService } from './mocks/mockRngService';
import { MockTraitRepository } from './mocks/mockTraitRepository';

describe('Group Domain Integration', () => {
  let groupService: IGroupService;

  let mockRngService: MockRNGService;
  let mockTraitRepository: MockTraitRepository;

  beforeEach(() => {
    mockRngService = new MockRNGService(0.5);
    mockTraitRepository = new MockTraitRepository();
    groupService = createGroupService(mockRngService, mockTraitRepository);
    jest.clearAllMocks();
  });

  describe('End-to-End Flow', () => {
    it('should create a creature with particle groups, class, and traits', () => {
      // Arrange
      const totalParticles = 500;
      const seed = 'test-seed';

      // Act
      // Step 1: Create particle groups
      const particleGroups = groupService.createParticleGroups(totalParticles, seed);

      // Step 2: Assign class
      const classAssignment = groupService.assignClass(particleGroups, seed);

      // Step 3: Assign traits to each group
      const traits: Record<Role, GroupTraits> = {} as Record<Role, GroupTraits>;
      for (const role of Object.values(Role)) {
        traits[role] = groupService.assignTraits(role, classAssignment.tier, `${seed}-${role}`);
      }

      // Assert
      // Check particle groups
      expect(particleGroups.totalParticles).toBe(totalParticles);
      for (const role of Object.values(Role)) {
        expect(particleGroups[role]).toBeDefined();
        expect(particleGroups[role].particleCount).toBeGreaterThan(0);
        expect(particleGroups[role].attributes).toBeDefined();
        expect(particleGroups[role].attributes.attribute).toBe(particleGroups[role].particleCount);
        expect(particleGroups[role].rarity).toBeDefined();
      }

      // Check class assignment
      expect(classAssignment).toBeDefined();
      expect(classAssignment.mainClass).toBeDefined();
      expect(classAssignment.subclass).toBeDefined();
      expect(classAssignment.dominantRole).toBeDefined();
      expect(classAssignment.tier).toBeDefined();

      // Check traits
      for (const role of Object.values(Role)) {
        expect(traits[role]).toBeDefined();

        // Check that the correct number of traits are assigned
        if (classAssignment.tier === Tier.TIER_1 || classAssignment.tier === Tier.TIER_2) {
          expect(traits[role].primary).toBeDefined();
          expect(traits[role].secondary).toBeUndefined();
          expect(traits[role].tertiary).toBeUndefined();
        } else if (classAssignment.tier === Tier.TIER_3 || classAssignment.tier === Tier.TIER_4) {
          expect(traits[role].primary).toBeDefined();
          expect(traits[role].secondary).toBeDefined();
          expect(traits[role].tertiary).toBeUndefined();
        } else {
          expect(traits[role].primary).toBeDefined();
          expect(traits[role].secondary).toBeDefined();
          expect(traits[role].tertiary).toBeDefined();
        }
      }
    });
  });

  describe('Tier Progression', () => {
    it('should create creatures with different tiers based on particle count', () => {
      // Skip this test for now as we need to implement mutations to reach higher tiers
      // In a real implementation, we would need to apply mutations to reach Tier 3 and above

      // For now, let's just test Tier 1 and Tier 2
      const tier1MockRng = new MockRNGService(0.1); // Will create low particle counts
      const tier2MockRng = new MockRNGService(0.8); // Will create high particle counts

      // Create services with controlled RNG
      const tier1GroupService = createGroupService(tier1MockRng, mockTraitRepository);
      const tier2GroupService = createGroupService(tier2MockRng, mockTraitRepository);

      // Test Tier 1
      const tier1ParticleGroups = tier1GroupService.createParticleGroups(500, 'tier1-seed');

      // Manually set the dominant role's particle count to ensure Tier 1
      tier1ParticleGroups[Role.CORE].particleCount = 100; // Tier 1 range

      const tier1ClassAssignment = tier1GroupService.assignClass(tier1ParticleGroups, 'tier1-seed');
      expect(tier1ClassAssignment.tier).toBe(Tier.TIER_1);
      expect(tier1ClassAssignment.subclass).toBeDefined();
      expect(tier1ClassAssignment.subclass.specializedPath).toBeUndefined(); // Hybrid subclass

      // Test Tier 2
      const tier2ParticleGroups = tier2GroupService.createParticleGroups(500, 'tier2-seed');

      // Manually set the dominant role's particle count to ensure Tier 2
      tier2ParticleGroups[Role.CORE].particleCount = 150; // Tier 2 range

      const tier2ClassAssignment = tier2GroupService.assignClass(tier2ParticleGroups, 'tier2-seed');
      expect(tier2ClassAssignment.tier).toBe(Tier.TIER_2);
      expect(tier2ClassAssignment.subclass).toBeDefined();
      expect(tier2ClassAssignment.subclass.specializedPath).toBeUndefined(); // Hybrid subclass
    });
  });

  describe('Class Specialization', () => {
    it('should create creatures with different main classes based on dominant role', () => {
      // Arrange
      const seed = 'class-seed';
      const totalParticles = 500;

      // Test each role as dominant
      const roleToMainClass = {
        [Role.CORE]: MainClass.HEALER,
        [Role.CONTROL]: MainClass.CASTER,
        [Role.MOVEMENT]: MainClass.ROGUE,
        [Role.DEFENSE]: MainClass.TANK,
        [Role.ATTACK]: MainClass.STRIKER
      };

      // Act & Assert
      for (const dominantRole of Object.values(Role)) {
        // Create a mock distribution that makes this role dominant
        const mockRngForRole = new MockRNGService(0.5);

        // Set up the mock to distribute particles in a way that makes this role dominant
        // We'll use a simple approach: give this role 50% of particles, and distribute the rest evenly
        mockRngForRole.setMockValue(`${seed}-${dominantRole}`, [0.5, 0.5, 0.5, 0.5, 0.5]);

        // Create a new group service with this mock
        const roleGroupService = createGroupService(mockRngForRole, mockTraitRepository);

        // Create particle groups
        const particleGroups = roleGroupService.createParticleGroups(totalParticles, `${seed}-${dominantRole}`);

        // Manually set the particle counts to ensure the desired role is dominant
        particleGroups[dominantRole].particleCount = 50;
        for (const role of Object.values(Role)) {
          if (role !== dominantRole) {
            particleGroups[role].particleCount = 10;
          }
        }

        // Assign class
        const classAssignment = roleGroupService.assignClass(particleGroups, `${seed}-${dominantRole}`);

        // Check dominant role
        expect(classAssignment.dominantRole).toBe(dominantRole);

        // Check main class
        expect(classAssignment.mainClass).toBe(roleToMainClass[dominantRole]);
      }
    });
  });
});
