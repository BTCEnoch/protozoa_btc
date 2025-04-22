/**
 * Trait Assignment Service Tests
 *
 * This file contains tests for the Trait Assignment Service.
 */
import { Role, Tier, Rarity } from '../../../shared/types/core';
import { TraitAssignmentService } from '../services/traitAssignmentService';
import { TRAIT_RARITY_DISTRIBUTIONS } from '../constants/distribution';

import { MockRNGService } from './mocks/mockRngService';
import { MockTraitRepository } from './mocks/mockTraitRepository';

describe('TraitAssignmentService', () => {
  let traitAssignmentService: TraitAssignmentService;

  let mockRngService: MockRNGService;
  let mockTraitRepository: MockTraitRepository;

  beforeEach(() => {
    mockRngService = new MockRNGService(0.5);
    mockTraitRepository = new MockTraitRepository();
    traitAssignmentService = new TraitAssignmentService(mockRngService, mockTraitRepository);
    jest.clearAllMocks();
  });

  describe('assignTraits', () => {
    it('should assign the correct number of traits for tier 1', () => {
      // Arrange
      const role = Role.CORE;
      const tier = Tier.TIER_1;
      const seed = 'test-seed';

      // Act
      const result = traitAssignmentService.assignTraits(role, tier, seed);

      // Assert
      expect(result).toBeDefined();
      expect(result.primary).toBeDefined();
      expect(result.secondary).toBeUndefined();
      expect(result.tertiary).toBeUndefined();
    });

    it('should assign the correct number of traits for tier 3', () => {
      // Arrange
      const role = Role.CORE;
      const tier = Tier.TIER_3;
      const seed = 'test-seed';

      // Act
      const result = traitAssignmentService.assignTraits(role, tier, seed);

      // Assert
      expect(result).toBeDefined();
      expect(result.primary).toBeDefined();
      expect(result.secondary).toBeDefined();
      expect(result.tertiary).toBeUndefined();
    });

    it('should assign the correct number of traits for tier 5', () => {
      // Arrange
      const role = Role.CORE;
      const tier = Tier.TIER_5;
      const seed = 'test-seed';

      // Act
      const result = traitAssignmentService.assignTraits(role, tier, seed);

      // Assert
      expect(result).toBeDefined();
      expect(result.primary).toBeDefined();
      expect(result.secondary).toBeDefined();
      expect(result.tertiary).toBeDefined();
    });
  });

  describe('getTraitRarityDistribution', () => {
    it('should return the correct trait rarity distribution for each tier', () => {
      // Arrange & Act & Assert
      for (const tier of Object.values(Tier)) {
        const result = traitAssignmentService.getTraitRarityDistribution(tier);
        expect(result).toEqual(TRAIT_RARITY_DISTRIBUTIONS[tier]);
      }
    });
  });

  describe('getRandomTrait', () => {
    it('should return a trait with the correct role and rarity', () => {
      // Arrange
      const role = Role.CORE;
      const rarity = Rarity.RARE;
      const seed = 'test-seed';

      // Act
      const result = traitAssignmentService.getRandomTrait(role, rarity, seed);

      // Assert
      expect(result).toBeDefined();
      expect(result.rarity).toBe(rarity);
      expect(result.type).toBeDefined();
      expect(result.effect).toBeDefined();
      expect(result.modifiers).toBeDefined();
    });
  });

  describe('getRandomRarity', () => {
    it('should return a rarity based on the distribution', () => {
      // Arrange
      const distribution = TRAIT_RARITY_DISTRIBUTIONS[Tier.TIER_1];
      const seed = 'test-seed';

      // Set up the mock RNG service to return different values
      mockRngService.setMockValue(seed, [0.1]);

      // Act
      const result = traitAssignmentService.getRandomRarity(distribution, seed);

      // Assert
      expect(result).toBe(Rarity.COMMON);

      // Create a new instance with a different mock value
      mockRngService = new MockRNGService(0.8);
      traitAssignmentService = new TraitAssignmentService(mockRngService, mockTraitRepository);

      // Act
      const result2 = traitAssignmentService.getRandomRarity(distribution, `${seed}-2`);

      // Assert
      expect(result2).toBe(Rarity.UNCOMMON);

      // Create a new instance with a different mock value
      mockRngService = new MockRNGService(0.98);
      traitAssignmentService = new TraitAssignmentService(mockRngService, mockTraitRepository);

      // Act
      const result3 = traitAssignmentService.getRandomRarity(distribution, `${seed}-3`);

      // Assert
      expect(result3).toBe(Rarity.RARE);
    });
  });
});
