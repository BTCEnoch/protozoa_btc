
# Evolution Testing and Validation

## Purpose
This document provides strategies for testing the evolution system in Bitcoin Protozoa to ensure correctness, determinism, and performance in triggering, generating, and applying evolutionary changes, such as mutations, for creatures with up to 500 particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and deterministic RNG driven by Bitcoin block data, ensuring reliability during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/evolution/evolution_testing.md`

## Overview
The evolution system drives creature adaptation through triggers (e.g., block confirmations), mutation trait generation, and state management, managed by `evolutionService.ts`, `traitService.ts`, and `evolutionTracker.ts`. Testing is critical to verify deterministic trigger activation, correct trait application, robust state persistence via Zustand and IndexedDB [Timestamp: April 16, 2025, 21:41], and efficient performance (< 5ms updates for 500 particles). This document covers unit and integration testing strategies, sample test cases, and tools like Jest, ensuring seamless integration with traits, rendering, physics, and game theory.

## Unit Testing Strategies
Unit tests focus on individual evolution system components, such as `evolutionService.ts`, `traitService.ts`, and `evolutionTracker.ts`, to verify their functionality in isolation.

### Key Testing Scenarios
1. **Trigger Activation**:
   - Verify that `evolutionService.ts` correctly activates triggers based on conditions (e.g., block confirmations, particle health).
   - Ensure determinism with fixed block nonce inputs.
2. **Mutation Trait Generation**:
   - Test that `traitService.ts` selects role-specific mutation traits by rarity (e.g., MYTHIC for DEFENSE).
   - Confirm consistent trait selection for identical nonce inputs.
3. **State Management**:
   - Check that `evolutionTracker.ts` accurately updates creature tiers, mutation counts, and particle stats.
   - Validate state persistence to IndexedDB and reactivity via Zustand.

### Example Unit Test
```typescript
// tests/unit/evolutionService.test.ts
import { evolutionService } from 'src/domains/evolution/services/evolutionService';
import { Role } from 'src/shared/types/core';
import { createMockBlockData, createMockCreature } from 'tests/mocks';

describe('EvolutionService', () => {
  test('triggers mutation for DEFENSE on damage absorption', async () => {
    const blockData = createMockBlockData(12345, { confirmations: 1 });
    const creature = createMockCreature(blockData, { defenseParticles: 10 });
    creature.particles[0].damageAbsorbed = 60; // Trigger condition
    await evolutionService.evaluateTriggers(creature, blockData);
    expect(creature.particles[0].mutationTrait).toBeDefined();
  });

  test('ensures deterministic mutation with same nonce', async () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData);
    const creature2 = createMockCreature(blockData);
    await evolutionService.evaluateTriggers(creature1, blockData);
    await evolutionService.evaluateTriggers(creature2, blockData);
    expect(creature1.particles[0].mutationTrait?.id).toEqual(creature2.particles[0].mutationTrait?.id);
  });
});

describe('EvolutionTracker', () => {
  test('increments creature tier after 10 mutations', async () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData);
    const mutation = { id: 'mutation_001', effect: 'health_boost', stats: { health: 10 } };
    for (let i = 0; i < 10; i++) {
      await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
    }
    const store = useEvolutionStore.getState();
    expect(store.creatures[creature.id].tier).toBe(2);
  });
});
```

## Integration Testing Strategies
Integration tests verify interactions between the evolution system and other domains, ensuring cohesive behavior in trait application, state persistence, rendering, and game theory.

### Key Testing Scenarios
1. **Trait Application**:
   - Confirm that mutation traits are correctly applied to particles and reflected in stats (e.g., “Iron Core” increases health).
   - Test integration with `traitService.ts` and `evolutionTracker.ts`.
2. **State Persistence and Reactivity**:
   - Validate that state changes are persisted to IndexedDB via `StorageService.ts` and propagated to the Zustand store.
   - Ensure UI and gameplay systems react to state updates (e.g., rendering mutation visuals).
3. **Rendering Integration**:
   - Verify that mutation-driven visual traits (e.g., MYTHIC glow) are rendered correctly via `instancedRenderer.ts`.
   - Test formation shifts triggered by mutations (e.g., “Adaptive Camouflage” to “Spread”).
4. **Game Theory Integration**:
   - Check that mutations influence battle payoffs (e.g., “Fury Strike” boosts damage) in `payoffMatrixService.ts`.
   - Ensure strategic decisions reflect updated creature states.
5. **Deterministic Behavior**:
   - Ensure identical evolutionary outcomes for the same block nonce and creature data.
6. **Performance Validation**:
   - Measure trigger evaluation, trait generation, and state update times, targeting < 5ms for 500 particles, with FPS ≥ 60.

### Example Integration Test
```typescript
// tests/integration/evolutionSystem.test.ts
import { evolutionService } from 'src/domains/evolution/services/evolutionService';
import { evolutionTracker } from 'src/domains/evolution/services/evolutionTracker';
import { instancedRenderer } from 'src/domains/rendering/services/instancedRenderer';
import { payoffMatrixService } from 'src/domains/gameTheory/services/payoffMatrixService';
import { createMockBlockData, createMockCreature } from 'tests/mocks';
import * as THREE from 'three';

describe('Evolution System Integration', () => {
  test('applies MYTHIC mutation and renders glow', async () => {
    const blockData = createMockBlockData(12345, { confirmations: 10 });
    const creature = createMockCreature(blockData);
    creature.particles[0].damageAbsorbed = 60; // Trigger condition
    await evolutionService.evaluateTriggers(creature, blockData);
    const mutation = creature.particles[0].mutationTrait;
    expect(mutation?.rarity).toBe(Rarity.MYTHIC);
    instancedRenderer.updateParticles(creature.particles);
    const color = new THREE.Color();
    instancedRenderer.getMesh().getColorAt(0, color);
    expect(color.getHex()).toBe(mutation?.visual?.color);
  });

  test('persists state and updates battle payoffs', async () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const mutation = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 25 }, visual: {} };
    await evolutionTracker.updateEvolutionState(creature1, mutation, blockData);
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(50); // Increased damage due to mutation
    const stored = await StorageService.load('creatureState', creature1.id);
    expect(stored.mutationCount).toBe(1);
  });

  test('processes evolution updates within 5ms', async () => {
    const blockData = createMockBlockData(12345, { confirmations: 1 });
    const creature = createMockCreature(blockData, { particleCount: 500 });
    const start = performance.now();
    await evolutionService.evaluateTriggers(creature, blockData);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
  });
});
```

## Sample Test Cases
1. **Trigger Activation**:
   - **Scenario**: Simulate 10 block confirmations and verify a MYTHIC mutation for DEFENSE particles.
   - **Expected Outcome**: Mutation applied with correct rarity and stats.
2. **Trait Application**:
   - **Scenario**: Apply “Fury Strike” to ATTACK particles and check damage stat increase.
   - **Expected Outcome**: Particle damage stat increases by 25.
3. **State Persistence**:
   - **Scenario**: Update creature tier and verify persistence in IndexedDB.
   - **Expected Outcome**: Tier stored and retrievable across sessions.
4. **Rendering Accuracy**:
   - **Scenario**: Render “Iron Core” mutation and check MYTHIC glow effect.
   - **Expected Outcome**: Particle color matches `#00ff00` with 0.9 glow intensity.
5. **Game Theory Impact**:
   - **Scenario**: Apply “Enhanced Reflexes” and verify reduced damage in payoff matrix.
   - **Expected Outcome**: Payoff matrix reflects 20% damage reduction.
6. **Performance Benchmark**:
   - **Scenario**: Trigger evolution for 500 particles and measure time.
   - **Expected Outcome**: Update time < 5ms, FPS ≥ 60.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Three.js Stats**: Monitors FPS to ensure evolution updates don’t impact rendering.
- **Chrome DevTools**: Profiles CPU usage for trigger and state update performance.
- **Custom Metrics**: Use `performance.now()` in `evolutionService.ts` to measure processing times.
- **IndexedDB Testing**: Use mock IndexedDB libraries (e.g., `fake-indexeddb`) to test persistence.

## Integration Points
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionService.ts` and `evolutionTracker.ts` manage triggers and state.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` generates mutation traits.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for state updates.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes mutation effects.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` incorporates mutation-driven stats.
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists state to IndexedDB.

## Rules Adherence
- **Determinism**: Tests confirm consistent outcomes with fixed block nonce and creature data.
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies.
- **Performance**: Validates < 5ms updates and 60 FPS.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate evolution-related tests (e.g., in `tests/` or scattered files).
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with `evolutionService.ts` and `evolutionTracker.ts`.
3. **Add New Tests**: Implement tests for triggers, trait generation, state management, and integrations.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing.


