
# Testing Traits

## Purpose
This document provides guidance on testing the trait system in Bitcoin Protozoa to ensure correctness, reliability, and determinism. It outlines unit testing strategies for trait assignment, integration tests for trait interactions, and sample test cases to verify critical aspects like rarity distribution and consistency across runs. By following these strategies, developers can guarantee that the trait system behaves as expected under all conditions.

## Location
`docs/traits/testing_traits.md`

## Overview
Testing the trait system is essential due to its complexity and the need for deterministic behavior. Traits are assigned to particles based on role and rarity, using a seeded random number generator (RNG) tied to Bitcoin block data. The system must ensure that trait assignments are consistent across instances and that trait interactions (e.g., synergies, conflicts) are correctly applied. This document covers testing strategies for both unit-level and integration-level scenarios, with examples using a testing framework like Jest.

## Unit Testing Strategies for Trait Assignment
Unit tests focus on verifying the correctness of individual components, such as the `assignTrait` method in `traitService.ts`. These tests ensure that traits are assigned deterministically based on the seeded RNG and adhere to role-based and rarity-based rules.

### Key Testing Scenarios
1. **Deterministic Assignment**:
   - Verify that the same block nonce and particle role always result in the same trait assignment.
2. **Role-Based Allocation**:
   - Ensure that only traits from the correct role's pool are assigned to a particle.
3. **Rarity Distribution**:
   - Confirm that traits are assigned with the correct probability distribution for each rarity level.

### Example Unit Test
```typescript
// tests/unit/traitService.test.ts
import { traitService } from 'src/domains/traits/services/traitService';
import { Role, Rarity } from 'src/shared/types/core';
import { createMockParticle, createMockBlockData } from 'tests/mocks';

describe('Trait Assignment', () => {
  test('assigns the same trait for the same block nonce and role', () => {
    const particle = createMockParticle(Role.ATTACK);
    const blockData = createMockBlockData(12345);
    const trait1 = traitService.assignTrait(particle, blockData);
    const trait2 = traitService.assignTrait(particle, blockData);
    expect(trait1).toEqual(trait2);
  });

  test('assigns trait from correct role pool', () => {
    const particle = createMockParticle(Role.DEFENSE);
    const blockData = createMockBlockData(54321);
    const trait = traitService.assignTrait(particle, blockData);
    expect(trait.role).toBe(Role.DEFENSE);
  });

  test('assigns traits with correct rarity distribution', () => {
    const particle = createMockParticle(Role.CONTROL);
    const blockData = createMockBlockData(98765);
    const traits = Array(1000).fill(null).map(() => traitService.assignTrait(particle, blockData));
    const rarityCounts = traits.reduce((acc, trait) => {
      acc[trait.rarity] = (acc[trait.rarity] || 0) + 1;
      return acc;
    }, {});
    // Verify rarity distribution matches expected probabilities (40%, 30%, 20%, 8%, 1.5%, 0.5%)
    expect(rarityCounts[Rarity.COMMON]).toBeGreaterThan(350);    // ~400 expected
    expect(rarityCounts[Rarity.UNCOMMON]).toBeGreaterThan(250);  // ~300 expected
    expect(rarityCounts[Rarity.RARE]).toBeGreaterThan(150);      // ~200 expected
    expect(rarityCounts[Rarity.EPIC]).toBeGreaterThan(50);       // ~80 expected
    expect(rarityCounts[Rarity.LEGENDARY]).toBeGreaterThan(5);   // ~15 expected
    expect(rarityCounts[Rarity.MYTHIC]).toBeLessThan(10);        // ~5 expected
  });
});
```

## Integration Tests for Trait Interactions
Integration tests verify how traits interact with each other and with other systems, such as the battle or rendering domains. These tests ensure that combined trait effects are correctly applied and that interactions like synergies or conflicts are resolved as expected.

### Key Testing Scenarios
1. **Synergy Effects**:
   - Test scenarios where multiple traits combine to produce enhanced effects (e.g., a "speed" ability boosting a "strike" behavior).
2. **Conflict Resolution**:
   - Verify that conflicts between traits are resolved according to predefined rules (e.g., higher rarity traits overriding lower ones).
3. **Cross-Domain Interactions**:
   - Ensure that traits correctly influence other domains, such as rendering visual traits or applying stat modifiers in battles.

### Example Integration Test
```typescript
// tests/integration/traitInteractions.test.ts
import { creatureGenerator } from 'src/domains/creature/services/creatureGenerator';
import { battleService } from 'src/domains/gameTheory/services/battleService';
import { createMockBlockData } from 'tests/mocks';

describe('Trait Interactions', () => {
  test('synergy between speed ability and strike behavior increases attack frequency', () => {
    const blockData = createMockBlockData(12345);
    const creature = creatureGenerator.generateCreature(blockData);
    // Assign specific traits for testing synergy
    creature.particles[0].traits = ['speed_ability', 'strike_behavior'];
    const battleOutcome = battleService.simulateBattle(creature, anotherCreature);
    // Verify increased attack frequency or damage
    expect(battleOutcome.attackFrequency).toBeGreaterThan(normalFrequency);
  });

  test('higher rarity trait overrides lower rarity trait in conflict', () => {
    const particle = createMockParticle(Role.ATTACK);
    particle.traits = ['common_trait', 'rare_trait'];
    // Assume a conflict where both traits modify the same stat
    const statValue = calculateStat(particle);
    // Verify that the rare trait's effect takes precedence
    expect(statValue).toEqual(rareTraitEffect);
  });
});
```

## Sample Test Cases
The following sample test cases cover critical aspects of the trait system:

### 1. Verifying Rarity Distribution
- **Scenario**: Generate 1,000 traits for a specific role and verify that the rarity distribution matches the expected probabilities (e.g., 50% COMMON, 0.1% MYTHIC).
- **Expected Outcome**: The number of traits per rarity falls within an acceptable range based on the probabilities.

### 2. Ensuring Determinism
- **Scenario**: Assign traits to multiple particles using the same block nonce and verify that the same traits are assigned each time.
- **Expected Outcome**: Identical trait assignments for the same input across multiple runs.

### 3. Testing Trait Application
- **Scenario**: Apply a trait that modifies a particle's stats (e.g., +10 attack) and verify that the particle's stats are updated correctly.
- **Expected Outcome**: The particle's attack stat increases by 10 after trait application.

## Integration with Other Domains
The trait system integrates with several other domains, and tests should cover these interactions:
- **Creature Domain (`src/domains/creature/`)**: Ensure traits are correctly assigned during creature generation.
- **Rendering Domain (`src/domains/rendering/`)**: Verify that visual traits are applied correctly in the rendering pipeline.
- **Game Theory Domain (`src/domains/gameTheory/`)**: Confirm that trait effects are factored into battle simulations and decision-making processes.

## Why Testing is Critical
Thorough testing of the trait system is essential for:
- **Correctness**: Ensuring traits are assigned and applied as intended.
- **Reliability**: Guaranteeing consistent behavior across different runs and scenarios.
- **Determinism**: Verifying that the system adheres to the project's deterministic requirements, especially given the use of seeded RNG.

This document provides a clear, structured approach to testing the trait system in Bitcoin Protozoa, ensuring it meets the project's high standards for quality and consistency.
