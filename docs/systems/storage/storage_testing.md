
# Storage Testing and Validation

## Purpose
This document provides strategies for testing and validating the storage system in Bitcoin Protozoa to ensure correctness, reliability, and performance of save and load operations for creature and particle states in IndexedDB. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/storage/storage_testing.md`

## Overview
The storage system, managed by `StorageService.ts` and `storageWorker.ts`, persists creature states (e.g., mutation counts, tiers), particle states (e.g., positions, mutations), and simulation progress to IndexedDB, ensuring continuity across sessions [Timestamp: April 16, 2025, 21:41]. Testing ensures data integrity, deterministic persistence, and performance (< 10ms writes, < 5ms reads, 60 FPS) [Timestamp: April 14, 2025, 19:58], validating integration with evolution (`evolutionTracker.ts`), physics (`particleService.ts`), rendering (`instancedRenderer.ts`), and game theory (`payoffMatrixService.ts`). This document outlines unit and integration testing strategies, sample test cases, and tools like Jest, building on our discussions about state persistence, performance optimization, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Unit Testing Strategies
Unit tests focus on individual storage system components (`StorageService.ts`, `storageWorker.ts`) to verify their functionality in isolation.

### Key Testing Scenarios
1. **Save Operations**:
   - Verify that `StorageService.ts` correctly saves data to `creatureState`, `particleState`, and `simulationState` stores using key paths (e.g., `creatureId`, `particleId`).
   - Ensure batch saves handle multiple items efficiently.
2. **Load Operations**:
   - Test that `StorageService.ts` retrieves data by key, returning `undefined` for non-existent entries.
   - Confirm cached reads via Zustand stores minimize IndexedDB access.
3. **Schema Compliance**:
   - Validate that saved data conforms to the schema (e.g., `ICreatureState`, `IParticleState`) defined in `database_schema.md`.
4. **Worker Operations**:
   - Ensure `storageWorker.ts` correctly processes batch writes off-thread, maintaining data integrity.
5. **Error Handling**:
   - Test handling of IndexedDB errors (e.g., quota exceeded, transaction aborts).

### Example Unit Test
```typescript
// tests/unit/StorageService.test.ts
describe('StorageService', () => {
  beforeEach(() => {
    // Reset IndexedDB mock (using fake-indexeddb)
    jest.resetModules();
    require('fake-indexeddb/auto');
  });

  test('saves and loads creature state', async () => {
    const creatureState = {
      creatureId: 'creature_123',
      tier: 2,
      mutationCount: 5,
      subclass: 'Guardian',
      lastTriggerBlock: 800000
    };
    await storageService.save('creatureState', creatureState.creatureId, creatureState);
    const loaded = await storageService.load('creatureState', creatureState.creatureId);
    expect(loaded).toEqual(creatureState);
  });

  test('handles non-existent load gracefully', async () => {
    const loaded = await storageService.load('creatureState', 'non_existent_id');
    expect(loaded).toBeUndefined();
  });

  test('batch saves particle states', async () => {
    const particleStates = [
      { particleId: 'creature_123_0', creatureId: 'creature_123', role: Role.ATTACK, position: [1, 0, 0], velocity: [0, 0, 0], mutations: [], stats: { health: 100, damage: 10, speed: 1 } },
      { particleId: 'creature_123_1', creatureId: 'creature_123', role: Role.ATTACK, position: [0, 1, 0], velocity: [0, 0, 0], mutations: [], stats: { health: 100, damage: 10, speed: 1 } }
    ];
    await storageService.batchSave('particleState', particleStates);
    const loaded = await storageService.load('particleState', particleStates[0].particleId);
    expect(loaded).toEqual(particleStates[0]);
  });
});
```

## Integration Testing Strategies
Integration tests verify interactions between the storage system and other domains, ensuring cohesive behavior across state persistence, evolution, physics, rendering, and game theory.

### Key Testing Scenarios
1. **Evolution Persistence**:
   - Confirm that `evolutionTracker.ts` saves and loads `ICreatureState` and `IParticleState` correctly, preserving mutation counts and tiers.
2. **Physics Persistence**:
   - Test that `particleService.ts` persists particle positions and velocities, restoring them accurately on load.
3. **Rendering Consistency**:
   - Verify that loaded particle states are correctly visualized by `instancedRenderer.ts`, maintaining 60 FPS.
4. **Game Theory Integration**:
   - Ensure persistent state (e.g., mutation traits) influences payoff matrices in `payoffMatrixService.ts` accurately.
5. **Performance Validation**:
   - Measure write times (< 10ms for 500 particles), read times (< 5ms), and FPS (≥ 60) during storage operations.
6. **Deterministic Behavior**:
   - Confirm that state persistence is consistent across sessions with the same inputs [Timestamp: April 12, 2025, 12:18].

### Example Integration Test
```typescript
// tests/integration/storageSystem.test.ts
describe('Storage System Integration', () => {
  beforeEach(() => {
    jest.resetModules();
    require('fake-indexeddb/auto');
  });

  test('persists and restores creature state with mutations', async () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData, { attackParticles: 10 });
    const mutation = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 0.25 }, visual: {} };
    await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
    const store = useEvolutionStore.getState();
    expect(store.creatures[creature.id].mutationCount).toBe(1);

    // Simulate new session
    useEvolutionStore.setState({ creatures: {}, particles: {} });
    await evolutionTracker.initializeCreature(creature);
    const restored = useEvolutionStore.getState().creatures[creature.id];
    expect(restored.mutationCount).toBe(1);
  });

  test('batch saves particle states within 10ms', async () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData, { particleCount: 500 });
    const particleStates = creature.particles.map((p, i) => ({
      particleId: `${creature.id}_${i}`,
      creatureId: creature.id,
      role: p.role,
      position: p.position,
      velocity: p.velocity,
      mutations: [],
      stats: p.stats
    }));
    const start = performance.now();
    await storageService.batchSave('particleState', particleStates);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });

  test('maintains 60 FPS during storage operations', async () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData, { particleCount: 500 });
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      await particleService.saveParticleStates(creature);
      instancedRenderer.updateParticles(creature.particles);
      sceneManager.render(cameraService.getCamera());
    }
    const elapsed = performance.now() - start;
    const fps = 100 / (elapsed / 1000);
    expect(fps).toBeGreaterThanOrEqual(60);
  });

  test('persistent state influences game theory payoffs', async () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const mutation = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 0.25 }, visual: {} };
    await evolutionTracker.updateEvolutionState(creature1, mutation, blockData);
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(50); // Increased damage due to persisted mutation
  });
});
```

## Sample Test Cases
1. **Creature State Persistence**:
   - **Scenario**: Save a creature with 5 mutations and tier 2, then load in a new session.
   - **Expected Outcome**: Loaded state matches saved state (mutationCount: 5, tier: 2).
2. **Particle State Persistence**:
   - **Scenario**: Save 500 particle states with positions and mutations, then load.
   - **Expected Outcome**: All particle states restored accurately.
3. **Batch Write Performance**:
   - **Scenario**: Batch save 500 particle states.
   - **Expected Outcome**: Write time < 10ms, FPS ≥ 60.
4. **Read Performance**:
   - **Scenario**: Load a creature’s state (500 particles) on session start.
   - **Expected Outcome**: Read time < 5ms.
5. **Error Handling**:
   - **Scenario**: Attempt to save with invalid data (e.g., missing `creatureId`).
   - **Expected Outcome**: Graceful error logged, no data corruption.
6. **Worker Batch Write**:
   - **Scenario**: Offload batch write of 1000 particle states to `storageWorker.ts`.
   - **Expected Outcome**: Successful write, main thread unaffected.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Fake IndexedDB**: Simulates IndexedDB for testing (`fake-indexeddb`), avoiding real database interactions.
- **Three.js Stats**: Monitors FPS during rendering, integrated in `sceneManager.ts`.
- **Chrome DevTools**: Profiles CPU usage and storage performance in the **Performance** tab.
- **Custom Metrics**: Use `performance.now()` in `StorageService.ts` to measure read/write times.

## Integration Points
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` handles persistence, with `storageWorker.ts` for off-thread tasks [Timestamp: April 14, 2025, 19:58].
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` persists `ICreatureState` and `IParticleState` [Timestamp: April 16, 2025, 21:41].
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` saves particle states.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` uses loaded state for visuals.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` leverages persistent state.
- **Workers Domain (`src/domains/workers/`)**: `storageWorker.ts` offloads batch writes, coordinated by `workerBridge.ts`.

## Rules Adherence
- **Determinism**: Tests confirm consistent state persistence with fixed inputs [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies [Timestamp: April 15, 2025, 21:23].
- **Performance**: Validates < 10ms writes, < 5ms reads, and 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Ensures storage supports evolution, physics, rendering, and game theory for cohesive gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate state persistence tests (e.g., in `tests/`), likely minimal or using localStorage.
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with `StorageService.ts` and `storageWorker.ts`.
3. **Add New Tests**: Implement tests for save/load operations, batch writes, and integrations, covering all stores.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing, targeting >80% coverage.


