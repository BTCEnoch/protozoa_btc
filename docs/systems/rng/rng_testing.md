
# RNG Testing and Validation

## Purpose
This document provides strategies for testing and validating the Random Number Generation (RNG) system in Bitcoin Protozoa to ensure correctness, determinism, and performance of pseudo-random number generation using the Mulberry32 algorithm seeded by the Bitcoin block nonce. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive trait system, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/rng/rng_testing.md`

## Overview
The RNG system, implemented in `rngSystem.ts` and using the Mulberry32 algorithm, generates deterministic pseudo-random numbers seeded by the Bitcoin block nonce to drive mutation triggers, trait selection, and other gameplay mechanics, ensuring each block produces a unique but reproducible creature [Timestamp: April 4, 2025, 14:16; April 12, 2025, 12:18]. Testing validates determinism (same nonce, same sequence), distribution quality, performance (< 1ms per call, 60 FPS) [Timestamp: April 14, 2025, 19:58], and integration with evolution (`evolutionTracker.ts`), traits (`traitService.ts`), mutations (`mutationService.ts`), physics (`particleService.ts`), visualization (`visualService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines unit and integration testing strategies, sample test cases, and tools like Jest, building on our discussions about determinism, performance optimization, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Unit Testing Strategies
Unit tests focus on individual RNG system components (`rngSystem.ts`, `RNGStreamImpl`, `mulberry32.ts`) to verify their functionality in isolation.

### Key Testing Scenarios
1. **Mulberry32 Determinism**:
   - Verify that the Mulberry32 algorithm produces identical sequences for the same seed, ensuring deterministic creature generation [Timestamp: April 4, 2025, 14:16].
   - Test sequence length and quality (e.g., no short cycles).
2. **Stream Initialization**:
   - Confirm that streams (`traits`, `physics`, etc.) are initialized with derived seeds from the nonce-seeded main PRNG, maintaining determinism [Timestamp: April 12, 2025, 12:18].
   - Test fallback seed behavior for API failures.
3. **Distribution Accuracy**:
   - Validate that distribution methods (`nextInt`, `nextBool`, `nextItem`) produce expected statistical properties (e.g., uniform distribution, correct probabilities).
   - Ensure categorical distributions (e.g., trait rarity) align with thresholds (e.g., MYTHIC at 1%).
4. **Stream Isolation**:
   - Test that streams (e.g., `mutation` vs. `traits`) produce independent sequences, preventing cross-domain interference.
5. **Error Handling**:
   - Verify graceful handling of invalid inputs (e.g., empty arrays in `nextItem`, invalid ranges in `nextInt`), with appropriate logging.

### Example Unit Test
```typescript
// tests/unit/rngSystem.test.ts
describe('RNGSystem Unit Tests', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  test('Mulberry32 produces deterministic sequence', () => {
    const rng1 = mulberry32(123456);
    const rng2 = mulberry32(123456);
    const sequence1 = [rng1(), rng1(), rng1()];
    const sequence2 = [rng2(), rng2(), rng2()];
    expect(sequence1).toEqual(sequence2);
    expect(sequence1.every(x => x >= 0 && x < 1)).toBe(true);
  });

  test('Stream initialization with nonce seed', async () => {
    jest.spyOn(bitcoinService, 'fetchLatestBlock').mockResolvedValue({
      nonce: 123456,
      height: 800000
    });
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG = rngSystem.getStream('traits');
    const value1 = traitsRNG.nextInt(0, 400);
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const value2 = rngSystem.getStream('traits').nextInt(0, 400);
    expect(value1).toEqual(value2);
  });

  test('Boolean distribution accuracy', () => {
    rngSystem.createStream('test', 123456);
    const mutationRNG = rngSystem.getStream('test');
    const results = Array(1000).fill(0).map(() => mutationRNG.nextBool(0.1));
    const trueCount = results.filter(x => x).length;
    expect(trueCount).toBeGreaterThan(50); // Approx 10% probability
    expect(trueCount).toBeLessThan(150);
  });

  test('Handles invalid nextItem input', () => {
    rngSystem.createStream('test', 123456);
    const traitsRNG = rngSystem.getStream('test');
    expect(() => traitsRNG.nextItem([])).toThrow('Cannot select item from empty array');
  });
});

```

## Integration Testing Strategies
Integration tests verify interactions between the RNG system and other domains, ensuring cohesive behavior across creature generation, gameplay mechanics, and session replay.

### Key Testing Scenarios
1. **Creature Generation Consistency**:
   - Confirm that the same block nonce produces identical creatures (e.g., same traits, mutations) across sessions, validating end-to-end determinism [Timestamp: April 4, 2025, 14:16].
2. **Mutation Trigger Integration**:
   - Test that `mutationService.ts` uses the `mutation` stream to trigger mutations with correct probabilities, updating creature states consistently.
3. **Trait Selection Integration**:
   - Verify that `traitService.ts` uses the `traits` stream to select role-specific traits (e.g., MYTHIC “Ethereal Glow”) with expected rarity distributions.
4. **Physics and Visualization Integration**:
   - Ensure `particleService.ts` and `visualService.ts` use `physics` and `visual` streams for dynamic forces and effect variations, maintaining deterministic behavior [Timestamp: April 8, 2025, 19:50].
5. **Game Theory Integration**:
   - Test that `payoffMatrixService.ts` uses the `ability` stream for randomized battle outcomes, producing consistent results for the same nonce.
6. **Controller UI Integration**:
   - Validate that `inputService.ts` and `controllerUIService.ts` trigger RNG-based actions (e.g., replay creature with specific nonce) for testing traits, behaviors, and formations, ensuring reproducibility [Timestamp: April 18, 2025, 14:25].
7. **Performance Validation**:
   - Measure RNG generation (< 1ms per call), stream initialization (< 1ms), and FPS (≥ 60) during high-load scenarios (e.g., 500 particles, 10 creatures) [Timestamp: April 14, 2025, 19:58].
8. **Session Replay**:
   - Confirm that persisted seeds in `StorageService.ts` enable accurate replay of creature generation for past blocks [Timestamp: April 16, 2025, 21:41].

### Example Integration Test
```typescript
// tests/integration/rngSystem.test.ts
describe('RNGSystem Integration Tests', () => {
  beforeEach(() => {
    jest.spyOn(bitcoinService, 'fetchLatestBlock').mockResolvedValue({
      nonce: 123456,
      height: 800000
    });
    jest.spyOn(StorageService, 'save').mockResolvedValue();
    jest.spyOn(StorageService, 'load').mockResolvedValue(null);
    require('fake-indexeddb/auto');
  });

  test('Generates consistent creature across sessions', async () => {
    const creature1 = await creatureService.generateCreature(800000);
    const creature2 = await creatureService.replayCreature(800000);
    expect(creature1.attributes.value).toEqual(creature2.attributes.value);
    expect(creature1.subclass).toEqual(creature2.subclass);
    expect(creature1.abilities).toEqual(creature2.abilities);
  });

  test('Triggers mutation with deterministic probability', async () => {
    const blockData = { nonce: 123456, height: 800000, confirmations: 10 };
    const creature = createMockCreature(blockData);
    await rngSystem.initializeStream(`mutation_${creature.id}`, blockData);
    const mutation1 = await mutationService.triggerMutation(creature, blockData);
    await rngSystem.initializeStream(`mutation_${creature.id}`, blockData);
    const mutation2 = await mutationService.triggerMutation(creature, blockData);
    expect(mutation1?.id).toEqual(mutation2?.id);
  });

  test('Maintains 60 FPS during frequent RNG calls', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const physicsRNG = rngSystem.getStream('physics');
    const particles = particleService.createParticles(500, { nonce: 123456, height: 800000 });
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const adjustments = physicsRNG.nextBatch(500);
      particles.forEach((p, j) => p.forceAdjustment = adjustments[j] * 0.1);
      instancedRenderer.updateParticles(particles);
      sceneManager.render(cameraService.getCamera());
    }
    const elapsed = performance.now() - start;
    const fps = 100 / (elapsed / 1000);
    expect(fps).toBeGreaterThanOrEqual(60);
  });

  test('Replays creature via controller UI', async () => {
    const blockNumber = 800000;
    await controllerUIService.replayCreatureViaUI(blockNumber);
    const creature = await creatureService.replayCreature(blockNumber);
    expect(creature.id).toBe(`creature_${blockNumber}`);
    expect(creature.attributes.value).toBeGreaterThanOrEqual(0);
  });
});
```

## Sample Test Cases
1. **Deterministic Creature Generation**:
   - **Scenario**: Generate a creature with block nonce 123456, then replay with the same nonce.
   - **Expected Outcome**: Identical attributes, subclass, and abilities.
2. **Mutation Trigger Probability**:
   - **Scenario**: Trigger mutation with 10% probability using the `mutation` stream.
   - **Expected Outcome**: Consistent trigger outcome for same nonce, ~10% true rate over 1,000 trials.
3. **Trait Rarity Selection**:
   - **Scenario**: Select traits with `traits` stream (70% COMMON, 20% RARE, 1% MYTHIC).
   - **Expected Outcome**: Distribution matches thresholds, deterministic for same nonce.
4. **Physics Force Adjustment**:
   - **Scenario**: Apply random force adjustments to 500 particles using `physics` stream.
   - **Expected Outcome**: Consistent adjustments for same nonce, generation time < 1ms.
5. **Session Replay**:
   - **Scenario**: Replay creature generation for block 800000 after persisting seed.
   - **Expected Outcome**: Identical creature as original generation.
6. **Error Handling**:
   - **Scenario**: Request `nextItem` with empty array.
   - **Expected Outcome**: Throws error, logged via `logger.ts`, gameplay continues.
7. **Controller UI Testing**:
   - **Scenario**: Use controller UI to replay creature with block nonce 123456.
   - **Expected Outcome**: Creature matches original, UI updates correctly [Timestamp: April 18, 2025, 14:25].

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Fake IndexedDB**: Simulates IndexedDB for seed persistence tests (`fake-indexeddb`) [Timestamp: April 16, 2025, 21:41].
- **Three.js Stats**: Monitors FPS during rendering, integrated in `sceneManager.ts`.
- **Chrome DevTools**: Profiles CPU usage, RNG call latency, and worker performance in the **Performance** tab.
- **Custom Metrics**: Use `performance.now()` in `rngSystem.ts` to measure generation and initialization times.

## Integration Points
- **RNG Domain (`src/shared/services/`)**: `rngSystem.ts` provides deterministic streams for testing [Timestamp: April 4, 2025, 14:16].
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` supplies nonce seeds [Timestamp: April 12, 2025, 12:18].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists seeds for replay [Timestamp: April 16, 2025, 21:41].
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` integrates RNG for mutation triggers.
- **Trait Domain (`src/domains/traits/`)**: `traitService.ts` uses RNG for trait selection.
- **Mutation Domain (`src/domains/mutation/`)**: `mutationService.ts` uses RNG for trigger probabilities [Timestamp: April 12, 2025, 12:18].
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` uses RNG for dynamic forces [Timestamp: April 8, 2025, 19:50].
- **Visualization Domain (`src/domains/visualization/`)**: `visualService.ts` uses RNG for effect variations.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses RNG for battle randomness.
- **Input Domain (`src/domains/input/`)**: `inputService.ts` and `controllerUIService.ts` trigger RNG for testing traits, behaviors, and formations [Timestamp: April 18, 2025, 14:25].
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads RNG-intensive tasks [Timestamp: April 14, 2025, 19:58].

## Rules Adherence
- **Determinism**: Tests confirm identical sequences for the same nonce, ensuring consistent creature generation [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies [Timestamp: April 15, 2025, 21:23].
- **Performance**: Validates < 1ms generation, < 1ms initialization, and 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Ensures RNG drives evolution, traits, mutations, physics, visualization, game theory, and controller UI testing cohesively [Timestamp: April 18, 2025, 14:25].

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate RNG-related tests (e.g., in `tests/`), likely minimal or absent [Timestamp: April 4, 2025, 14:16].
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with `rngSystem.ts` and Mulberry32.
3. **Add New Tests**: Implement tests for determinism, distribution, performance, and integrations, covering all streams.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure >80% coverage, focusing on critical paths like creature generation.

