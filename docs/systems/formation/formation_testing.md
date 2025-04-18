
# Formation Testing and Validation

## Purpose
This document provides strategies for testing the formation system in Bitcoin Protozoa to ensure correctness, determinism, and performance in assigning and updating role-specific formation patterns (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE) for up to 500 particles per creature. It serves as a single source of truth for developers, tailored to the project’s particle-based design, role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and deterministic RNG driven by Bitcoin block data, ensuring reliability during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/formation/formation_testing.md`

## Overview
The formation system organizes particles into spatial patterns that influence behavior, visuals, and strategic outcomes, managed by `formationService.ts` in the `traits` domain. Testing is critical to verify deterministic pattern assignment, correct dynamic updates, and efficient performance (< 5ms updates for 500 particles). This document covers unit and integration testing strategies, sample test cases, and tools like Jest, ensuring the formation system integrates seamlessly with physics, rendering, and game theory, maintaining balance and consistency.

## Unit Testing Strategies
Unit tests focus on individual formation system components, such as `formationService.ts`, to verify their functionality in isolation.

### Key Testing Scenarios
1. **Pattern Assignment**:
   - Verify that `assignFormation` selects the correct pattern based on role and seeded RNG (e.g., “Cluster” for CORE).
   - Ensure determinism with fixed block nonce inputs.
2. **Dynamic Updates**:
   - Test that `updateFormation` triggers appropriate transitions (e.g., DEFENSE to “Shield Wall” under attack).
   - Confirm consistent transitions for identical conditions.
3. **Position Interpolation**:
   - Check that particle positions interpolate smoothly to target pattern coordinates.
   - Validate role-specific constraints (e.g., DEFENSE particles maintain tight “Shield Wall” positions).

### Example Unit Test
```typescript
// tests/unit/formationService.test.ts
import { formationService } from 'src/domains/traits/services/formationService';
import { Role, Rarity } from 'src/shared/types/core';
import { createMockBlockData, createMockParticle } from 'tests/mocks';

describe('FormationService', () => {
  test('assigns Cluster pattern to CORE particles deterministically', () => {
    const blockData = createMockBlockData(12345);
    const group = { role: Role.CORE, particles: [createMockParticle({ role: Role.CORE })] };
    formationService.assignFormation(group, blockData);
    const position1 = group.particles[0].position;
    formationService.assignFormation(group, blockData);
    const position2 = group.particles[0].position;
    expect(position1).toEqual(position2); // Deterministic
    expect(position1).toEqual([0, 0, 0]); // Cluster center
  });

  test('transitions DEFENSE to Shield Wall under attack', () => {
    const blockData = createMockBlockData(12345);
    const group = {
      role: Role.DEFENSE,
      particles: [createMockParticle({ role: Role.DEFENSE })],
      currentPattern: { id: 'spread', positions: [{ x: 2, y: 0, z: 0 }], rarity: Rarity.COMMON }
    };
    const conditions = { enemyProximity: 5 };
    formationService.updateFormation(group, blockData, conditions);
    expect(group.currentPattern.id).toBe('shield_wall');
  });
});
```

## Integration Testing Strategies
Integration tests verify interactions between the formation system and other domains, ensuring cohesive behavior in rendering, physics, and game theory.

### Key Testing Scenarios
1. **Rendering Integration**:
   - Confirm that formation patterns (e.g., “Shield Wall”) are correctly visualized via `instancedRenderer.ts`.
   - Test visual trait application (e.g., DEFENSE particles in “Shield Wall” have metallic sheen).
2. **Physics Integration**:
   - Validate that formation constraints maintain pattern integrity under physics forces (e.g., repulsion in `forceWorker.ts`).
   - Ensure smooth position updates during dynamic transitions.
3. **Game Theory Integration**:
   - Verify that formations influence battle payoffs (e.g., “Shield Wall” boosts DEFENSE payoffs in `payoffMatrixService.ts`).
   - Test strategic decisions reflecting formation changes.
4. **Deterministic Behavior**:
   - Ensure identical formation assignments and updates for the same block nonce and creature data.
5. **Performance Validation**:
   - Measure assignment and update times, targeting < 5ms for 500 particles, with FPS ≥ 60.

### Example Integration Test
```typescript
// tests/integration/formationSystem.test.ts
import { formationService } from 'src/domains/traits/services/formationService';
import { instancedRenderer } from 'src/domains/rendering/services/instancedRenderer';
import { particleService } from 'src/domains/creature/services/particleService';
import { createMockBlockData, createMockParticle } from 'tests/mocks';
import * as THREE from 'three';

describe('Formation System Integration', () => {
  test('renders Shield Wall for DEFENSE particles', () => {
    const blockData = createMockBlockData(12345);
    const group = { role: Role.DEFENSE, particles: [createMockParticle({ role: Role.DEFENSE })] };
    formationService.assignFormation(group, blockData);
    instancedRenderer.updateParticles(group.particles);
    const matrix = new THREE.Matrix4();
    instancedRenderer.getMesh().getMatrixAt(0, matrix);
    const position = new THREE.Vector3().setFromMatrixPosition(matrix);
    expect(position.x).toBeCloseTo(1, 1); // Shield Wall position
  });

  test('maintains formation under physics forces', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(10, blockData).map(p => ({ ...p, role: Role.DEFENSE }));
    const group = { role: Role.DEFENSE, particles, currentPattern: { id: 'shield_wall', positions: [{ x: 1, y: 0, z: 0 }], rarity: Rarity.COMMON } };
    formationService.assignFormation(group, blockData);
    await particleService.updatePhysics(particles, 1 / 60); // Apply physics with formation constraints
    expect(particles[0].position[0]).toBeCloseTo(1, 1); // Maintains Shield Wall
  });

  test('updates formations within 5ms', () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const group = { role: Role.MOVEMENT, particles, currentPattern: { id: 'swarm', positions: [{ x: 0, y: 0, z: 0 }], rarity: Rarity.COMMON } };
    const conditions = { enemyProximity: 10 };
    const start = performance.now();
    formationService.updateFormation(group, blockData, conditions);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
  });
});
```

## Sample Test Cases
1. **Pattern Assignment**:
   - **Scenario**: Assign a formation to 100 CORE particles and verify “Cluster” pattern positions.
   - **Expected Outcome**: Particles centered at [0, 0, 0].
2. **Dynamic Transition**:
   - **Scenario**: Update DEFENSE formation to “Shield Wall” when enemy proximity < 10 units.
   - **Expected Outcome**: Particles form a protective ring.
3. **Physics Stability**:
   - **Scenario**: Apply repulsion forces to “Shield Wall” and verify particles maintain positions.
   - **Expected Outcome**: Positions deviate < 0.1 units from target.
4. **Rendering Accuracy**:
   - **Scenario**: Render “Vanguard” for ATTACK particles and check forward positions.
   - **Expected Outcome**: Particles positioned at [1, 0, 0] or similar.
5. **Performance Benchmark**:
   - **Scenario**: Update formations for 500 particles and measure time.
   - **Expected Outcome**: Update time < 5ms, FPS ≥ 60.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Three.js Stats**: Monitors FPS to ensure formation updates don’t impact rendering.
- **Chrome DevTools**: Profiles CPU usage for update performance.
- **Custom Metrics**: Use `performance.now()` in `formationService.ts` to measure assignment and update times.

## Integration Points
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` manages pattern assignment and updates.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for formation positions.
- **Physics Domain (`src/domains/workers/`)**: `forceWorker.ts` and `positionWorker.ts` ensure formation stability.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes formation positions.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses formations for payoff calculations.

## Rules Adherence
- **Determinism**: Tests confirm consistent assignments and updates with fixed block nonce.
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies.
- **Performance**: Validates < 5ms updates and 60 FPS.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate formation-related tests (e.g., in `tests/` or scattered files).
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with `formationService.ts`.
3. **Add New Tests**: Implement tests for assignment, dynamics, and integrations.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing.


