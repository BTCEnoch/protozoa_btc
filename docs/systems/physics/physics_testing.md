
# Physics Testing and Validation

## Purpose
This document provides strategies for testing and validating the physics system in Bitcoin Protozoa to ensure correctness, determinism, and performance in force calculations and position updates for up to 500 particles per creature. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/physics/physics_testing.md`

## Overview
The physics system, handling force calculations (`forceWorker.ts`) and position updates (`positionWorker.ts`), is critical for realistic particle dynamics and formation adherence (e.g., “Shield Wall” for DEFENSE, “Spiral Charge” for ATTACK) [Timestamp: April 8, 2025, 19:50]. Testing ensures deterministic behavior, stability (no oscillation or divergence), and performance (< 5ms updates, 60 FPS) [Timestamp: April 14, 2025, 19:58]. This document outlines unit and integration testing strategies, sample test cases, and tools like Jest, covering integration with formations (`formationService.ts`), rendering (`instancedRenderer.ts`), and game theory (`payoffMatrixService.ts`). It builds on our discussions about physics, performance optimization, and deterministic RNG [Timestamp: April 12, 2025, 12:18; April 14, 2025, 19:58].

## Unit Testing Strategies
Unit tests focus on individual physics components (`forceWorker.ts`, `positionWorker.ts`, `spatialUtils.ts`) to verify their functionality in isolation.

### Key Testing Scenarios
1. **Force Calculations**:
   - Verify attraction, repulsion, and spring forces in `forceWorker.ts` match expected values for role-specific constants (e.g., `k_spring = 0.12` for DEFENSE).
   - Ensure determinism with fixed block nonce inputs for dynamic forces.
2. **Position Updates**:
   - Test Euler integration in `positionWorker.ts` for correct velocity and position changes based on forces.
   - Confirm role-specific damping and velocity caps (e.g., 5 units/s for MOVEMENT).
3. **Spatial Partitioning**:
   - Validate `spatialUtils.ts` correctly groups particles into grid cells, limiting force calculations to nearby particles.
4. **Determinism**:
   - Ensure identical inputs (e.g., particle positions, block nonce) produce consistent outputs across runs.

### Example Unit Test
```typescript
// tests/unit/forceWorker.test.ts
describe('ForceWorker', () => {
  test('calculates spring force for DEFENSE in Shield Wall', async () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.DEFENSE, position: [0, 0, 0] });
    const pattern = { id: 'shield_wall', positions: [{ x: 1, y: 0, z: 0 }], rarity: 'RARE' };
    const forces = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles: [particle], formationPatterns: { [Role.DEFENSE]: pattern }, deltaTime: 1 / 60 }
    });
    expect(forces[0]).toBeCloseTo(0.12, 2); // k_spring * (1 - 0)
  });

  test('ensures deterministic forces with same nonce', async () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.MOVEMENT, position: [0, 0, 0] });
    const forces1 = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles: [particle], formationPatterns: {}, deltaTime: 1 / 60 }
    });
    const forces2 = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles: [particle], formationPatterns: {}, deltaTime: 1 / 60 }
    });
    expect(forces1).toEqual(forces2); // Deterministic
  });
});

describe('PositionWorker', () => {
  test('applies force to update MOVEMENT position', async () => {
    const particle = createMockParticle({ role: Role.MOVEMENT, position: [0, 0, 0], velocity: [0, 0, 0] });
    const forces = new Float32Array([1, 0, 0]); // Force along x-axis
    const updated = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles: [particle], forces, deltaTime: 1 / 60 }
    });
    expect(updated[0].position[0]).toBeGreaterThan(0); // Position shifted
    expect(updated[0].velocity[0]).toBeGreaterThan(0); // Velocity increased
  });
});
```

## Integration Testing Strategies
Integration tests verify interactions between the physics system and other domains, ensuring cohesive behavior across force calculations, position updates, formations, rendering, and game theory.

### Key Testing Scenarios
1. **Physics-Formation Integration**:
   - Confirm particles align with formation patterns (e.g., “Spiral Charge” spiral positions) after physics updates.
   - Test spring force stability (e.g., no oscillation in “Shield Wall”).
2. **Physics-Rendering Integration**:
   - Verify updated particle positions are correctly visualized by `instancedRenderer.ts`.
   - Ensure rendering maintains 60 FPS during physics updates.
3. **Physics-Game Theory Integration**:
   - Check that particle movements (e.g., “Swarm” spacing) influence payoff matrices in `payoffMatrixService.ts`.
   - Validate tactical impacts (e.g., “Spiral Charge” damage boost).
4. **Deterministic Behavior**:
   - Ensure identical physics outcomes for the same block nonce and creature data across runs.
5. **Performance Validation**:
   - Measure physics update times, targeting < 5ms for 500 particles, with FPS ≥ 60.

### Example Integration Test
```typescript
// tests/integration/physicsSystem.test.ts
describe('Physics System Integration', () => {
  test('maintains Spiral Charge formation for ATTACK', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(10, blockData).map(p => ({ ...p, role: Role.ATTACK }));
    const pattern = { id: 'spiral_charge', positions: [{ x: 1, y: 0, z: 0 }], rarity: 'RARE' };
    formationService.assignFormation({ role: Role.ATTACK, particles, currentPattern: pattern }, blockData);
    const updated = await particleService.updatePhysics(particles, 1 / 60);
    expect(updated[0].position[0]).toBeGreaterThan(0); // Moving toward x=1
    expect(updated[0].position[0]).toBeLessThan(1); // Not fully at target
  });

  test('renders physics updates at 60 FPS', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const updated = await particleService.updatePhysics(particles, 1 / 60);
      instancedRenderer.updateParticles(updated);
      sceneManager.render(cameraService.getCamera());
      particles = updated;
    }
    const elapsed = performance.now() - start;
    const fps = 100 / (elapsed / 1000);
    expect(fps).toBeGreaterThanOrEqual(60);
  });

  test('physics influences game theory payoffs', async () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const group = { role: Role.ATTACK, particles: creature1.particles.filter(p => p.role === Role.ATTACK) };
    formationService.assignFormation(group, blockData); // Spiral Charge
    const updated = await particleService.updatePhysics(creature1.particles, 1 / 60);
    creature1.particles = updated;
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(50); // Increased damage due to Spiral Charge
  });
});
```

## Sample Test Cases
1. **Spring Force Accuracy**:
   - **Scenario**: Apply a spring force to a DEFENSE particle in “Shield Wall” with target position [1, 0, 0].
   - **Expected Outcome**: Force vector ≈ [0.12, 0, 0] (k_spring * (1 - 0)).
2. **Position Update Stability**:
   - **Scenario**: Update a MOVEMENT particle with a constant force [1, 0, 0] for 1/60s.
   - **Expected Outcome**: Position shifts positively along x-axis, velocity capped at 5 units/s.
3. **Formation Adherence**:
   - **Scenario**: Run physics for 10 ATTACK particles in “Spiral Charge” for 10 frames.
   - **Expected Outcome**: Particles approach spiral positions (e.g., [1, 0, 0]) within 0.1 units.
4. **Rendering Performance**:
   - **Scenario**: Update and render 500 particles for 100 frames.
   - **Expected Outcome**: FPS ≥ 60, update time < 5ms per frame.
5. **Game Theory Impact**:
   - **Scenario**: Simulate a battle with “Swarm” formation for MOVEMENT particles.
   - **Expected Outcome**: Payoff matrix reflects increased attack speed due to loose spacing.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Three.js Stats**: Monitors FPS during rendering, integrated in `sceneManager.ts`.
- **Chrome DevTools**: Profiles CPU usage and worker performance in the **Performance** tab.
- **Custom Metrics**: Use `performance.now()` in `particleService.ts` to measure update times.
- **Mock Data**: Use `tests/mocks.ts` to simulate particle and block data, avoiding live API calls.

## Integration Points
- **Physics Domain (`src/domains/workers/`)**: `forceWorker.ts` and `positionWorker.ts` handle calculations, coordinated by `workerBridge.ts`.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` manages physics updates and data flow.
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` provides pattern data for spring forces [Timestamp: April 8, 2025, 19:50].
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes updated positions.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` incorporates movement data.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding.

## Rules Adherence
- **Determinism**: Tests confirm consistent outcomes with fixed block nonce and inputs [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies.
- **Performance**: Validates < 5ms updates and 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Ensures physics supports formations, rendering, and game theory for cohesive gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate physics-related tests (e.g., in `tests/`), likely scattered or implicit.
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with `forceWorker.ts` and `positionWorker.ts`.
3. **Add New Tests**: Implement tests for force calculations, position updates, and integrations, covering all roles and formations.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing, targeting >80% coverage.


