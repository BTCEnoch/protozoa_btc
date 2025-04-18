
# Workers Testing and Validation

## Purpose
This document provides strategies for testing and validating the workers system in Bitcoin Protozoa to ensure correctness, reliability, and performance of off-thread task execution and data transfer for creatures with up to 500 particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/workers/workers_testing.md`

## Overview
The workers system, managed by `workerBridge.ts` and executed by workers like `forceWorker.ts`, `positionWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`, offloads tasks such as physics calculations, game theory simulations, and storage operations to maintain 60 FPS and < 5ms task cycles [Timestamp: April 14, 2025, 19:58]. Testing ensures deterministic behavior, efficient data transfer (< 1ms), and reliable integration with physics (`particleService.ts`), storage (`StorageService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines unit and integration testing strategies, sample test cases, and tools like Jest, building on our discussions about performance optimization, determinism, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Unit Testing Strategies
Unit tests focus on individual workers system components (`workerBridge.ts`, `forceWorker.ts`, `computeWorker.ts`, `storageWorker.ts`) to verify their functionality in isolation.

### Key Testing Scenarios
1. **Worker Bridge Dispatching**:
   - Verify that `workerBridge.ts` correctly dispatches tasks to the appropriate worker type (e.g., `force`, `compute`) and reuses pooled workers.
   - Ensure error handling for invalid tasks or worker failures.
2. **Physics Workers**:
   - Test `forceWorker.ts` for accurate force calculations (e.g., spring forces for DEFENSE) and `positionWorker.ts` for correct position updates [Timestamp: April 8, 2025, 19:50].
   - Confirm deterministic outputs with fixed inputs or seeded RNG.
3. **Compute Worker**:
   - Validate `computeWorker.ts` for correct game theory simulations (e.g., payoff matrices) and evolution trigger evaluations.
   - Ensure deterministic results with block nonce seeding [Timestamp: April 12, 2025, 12:18].
4. **Storage Worker**:
   - Test `storageWorker.ts` for reliable batch IndexedDB writes, ensuring data integrity [Timestamp: April 16, 2025, 21:41].
5. **Data Transfer**:
   - Verify efficient use of `Transferable` objects (e.g., `Float32Array`) for large datasets (e.g., particle positions).
   - Ensure proper serialization/deserialization for JSON payloads.

### Example Unit Test
```typescript
// tests/unit/workerBridge.test.ts
describe('WorkerBridge', () => {
  beforeEach(() => {
    jest.spyOn(Worker.prototype, 'postMessage').mockImplementation(() => {});
    jest.spyOn(Worker.prototype, 'onmessage').mockImplementation((callback: any) => {
      callback({ data: new Float32Array([1, 0, 0]) }); // Mock result
    });
    jest.spyOn(Worker.prototype, 'onerror').mockImplementation(() => {});
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  test('dispatches force calculation task', async () => {
    const data = { task: 'calculateForces', data: { particles: [], formationPatterns: {}, deltaTime: 1 / 60 } };
    const result = await workerBridge.sendMessage('force', data);
    expect(Worker.prototype.postMessage).toHaveBeenCalledWith(data, [data.buffer].filter(Boolean));
    expect(result).toBeInstanceOf(Float32Array);
  });

  test('reuses worker from pool', async () => {
    const data = { task: 'calculateForces', data: { particles: [], formationPatterns: {}, deltaTime: 1 / 60 } };
    await workerBridge.sendMessage('force', data);
    await workerBridge.sendMessage('force', data);
    expect(Worker.prototype.postMessage).toHaveBeenCalledTimes(2);
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Reusing existing force worker'));
  });

  test('handles worker error', async () => {
    jest.spyOn(Worker.prototype, 'onerror').mockImplementation((callback: any) => {
      callback(new ErrorEvent('error', { message: 'Worker failed' }));
    });
    const data = { task: 'calculateForces', data: {} };
    await expect(workerBridge.sendMessage('force', data)).rejects.toThrow('Worker failed');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Worker error'));
  });
});

describe('ForceWorker', () => {
  test('calculates spring force for DEFENSE', async () => {
    const particle = createMockParticle({ role: Role.DEFENSE, position: [0, 0, 0] });
    const pattern = { id: 'shield_wall', positions: [{ x: 1, y: 0, z: 0 }], rarity: 'RARE' };
    const data = { task: 'calculateForces', data: { particles: [particle], formationPatterns: { [Role.DEFENSE]: pattern }, deltaTime: 1 / 60 } };
    const forces = await simulateWorkerTask('force', data);
    expect(forces[0]).toBeCloseTo(0.12, 2); // k_spring * (1 - 0)
  });
});
```

## Integration Testing Strategies
Integration tests verify interactions between the workers system and other domains, ensuring cohesive behavior across task offloading, data transfer, and system updates.

### Key Testing Scenarios
1. **Physics Integration**:
   - Confirm that `particleService.ts` offloads force and position calculations to `forceWorker.ts` and `positionWorker.ts`, updating particle states correctly [Timestamp: April 8, 2025, 19:50].
   - Verify FPS remains ≥ 60 during physics updates.
2. **Storage Integration**:
   - Test that `StorageService.ts` offloads batch writes to `storageWorker.ts`, ensuring data persistence without main thread blocking [Timestamp: April 16, 2025, 21:41].
3. **Game Theory Integration**:
   - Validate that `gameTheoryStrategyService.ts` offloads battle simulations to `computeWorker.ts`, updating UI with results via `uiService.ts`.
4. **Input Integration**:
   - Ensure user inputs (e.g., battle triggers) from `inputService.ts` correctly initiate offloaded tasks (e.g., game theory simulations).
5. **Deterministic Behavior**:
   - Confirm consistent task outcomes across sessions with identical inputs or block nonce [Timestamp: April 12, 2025, 12:18].
6. **Performance Validation**:
   - Measure task execution (< 5ms), data transfer (< 1ms), and FPS (≥ 60) during high-load scenarios (e.g., 500 particles).

### Example Integration Test
```typescript
// tests/integration/workersSystem.test.ts
describe('Workers System Integration', () => {
  beforeEach(() => {
    jest.spyOn(Worker.prototype, 'postMessage').mockImplementation(() => {});
    jest.spyOn(Worker.prototype, 'onmessage').mockImplementation((callback: any) => {
      callback({ data: new Float32Array(1500) }); // Mock 500 particles' forces
    });
    require('fake-indexeddb/auto');
  });

  test('offloads physics calculations and updates particles', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const start = performance.now();
    const updated = await particleService.updatePhysics(particles, 1 / 60);
    const elapsed = performance.now() - start;
    expect(updated.length).toBe(500);
    expect(elapsed).toBeLessThan(5);
    expect(Worker.prototype.postMessage).toHaveBeenCalledTimes(2); // Force + Position
  });

  test('offloads battle simulation and updates UI', async () => {
    const creatureIds = ['creature_123', 'creature_456'];
    jest.spyOn(Worker.prototype, 'onmessage').mockImplementation((callback: any) => {
      callback({ data: { winner: creatureIds[0], scores: { [creatureIds[0]]: 100, [creatureIds[1]]: 50 } } });
    });
    await gameTheoryStrategyService.simulateBattle(creatureIds);
    const wrapper = shallow(<BattlePanel battleResult={uiService.battleResult} />);
    expect(wrapper.find('p').at(0).text()).toBe(`Winner: ${creatureIds[0]}`);
  });

  test('maintains 60 FPS during worker tasks', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      await particleService.updatePhysics(particles, 1 / 60);
      instancedRenderer.updateParticles(particles);
      sceneManager.render(cameraService.getCamera());
    }
    const elapsed = performance.now() - start;
    const fps = 100 / (elapsed / 1000);
    expect(fps).toBeGreaterThanOrEqual(60);
  });

  test('ensures deterministic physics results', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(10, blockData);
    const result1 = await particleService.updatePhysics(particles, 1 / 60);
    const result2 = await particleService.updatePhysics(particles, 1 / 60);
    expect(result1[0].position).toEqual(result2[0].position); // Deterministic
  });
});
```

## Sample Test Cases
1. **Force Calculation Accuracy**:
   - **Scenario**: Offload force calculation for a DEFENSE particle in “Shield Wall” to `forceWorker.ts`.
   - **Expected Outcome**: Force vector ≈ [0.12, 0, 0] for target position [1, 0, 0].
2. **Battle Simulation**:
   - **Scenario**: Offload battle simulation for two creatures to `computeWorker.ts`.
   - **Expected Outcome**: Consistent winner and scores with same block nonce, UI updated with results.
3. **Batch Storage Write**:
   - **Scenario**: Offload 500 particle state writes to `storageWorker.ts`.
   - **Expected Outcome**: Write completes in < 10ms, data persisted correctly.
4. **Performance Under Load**:
   - **Scenario**: Offload physics updates for 500 particles over 100 frames.
   - **Expected Outcome**: Task execution < 5ms per cycle, FPS ≥ 60.
5. **Error Handling**:
   - **Scenario**: Offload a task with invalid data (e.g., null particles).
   - **Expected Outcome**: Error logged, worker terminated, main thread unaffected.
6. **Data Transfer Efficiency**:
   - **Scenario**: Transfer 500 particles’ positions to `forceWorker.ts`.
   - **Expected Outcome**: Transfer time < 1ms using `Float32Array`.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Fake IndexedDB**: Simulates IndexedDB for storage worker tests (`fake-indexeddb`) [Timestamp: April 16, 2025, 21:41].
- **Three.js Stats**: Monitors FPS during rendering, integrated in `sceneManager.ts`.
- **Chrome DevTools**: Profiles worker CPU usage, task execution, and transfer latency in the **Performance** tab.
- **Custom Metrics**: Use `performance.now()` in `workerBridge.ts` to measure task and transfer times.

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `workerBridge.ts` coordinates tasks for `forceWorker.ts`, `positionWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`.
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` offloads physics calculations [Timestamp: April 8, 2025, 19:50].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` offloads batch writes [Timestamp: April 16, 2025, 21:41].
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers offloaded tasks.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` offloads calculations.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` uses worker results.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` processes worker results.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding [Timestamp: April 12, 2025, 12:18].

## Rules Adherence
- **Determinism**: Tests confirm consistent task outcomes with fixed inputs or seeded RNG [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies [Timestamp: April 15, 2025, 21:23].
- **Performance**: Validates < 5ms task execution, < 1ms transfers, and 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Ensures workers support physics, storage, input, and game theory for cohesive gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate computation-related tests (e.g., in `tests/`), likely minimal or main-thread-focused.
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with `workerBridge.ts` and workers.
3. **Add New Tests**: Implement tests for task execution, data transfer, and integrations, covering all worker types.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing, targeting >80% coverage.


