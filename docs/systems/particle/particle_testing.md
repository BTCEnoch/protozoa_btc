
# Particle System Testing and Validation

## Purpose
This document provides strategies for testing the particle system in Bitcoin Protozoa to ensure correctness, determinism, and performance. It serves as a single source of truth for developers, outlining unit and integration testing approaches, sample test cases, and tools to validate the system’s behavior under various conditions, ensuring reliability for up to 500 particles per creature.

## Location
`new_docs/systems/particle/particle_testing.md`

## Overview
The particle system in Bitcoin Protozoa manages the creation, behavior, and physics of particles, integral to creature dynamics and gameplay. Testing is critical to verify deterministic role assignment, correct trait application, and efficient performance (< 10ms updates for 500 particles). This document covers unit and integration testing strategies, leveraging Jest for execution, and aligns with the project’s domain-driven design (DDD) principles, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new framework.

## Unit Testing Strategies
Unit tests focus on individual components, such as `particleService.ts`, `behaviorService.ts`, and `forceWorker.ts`, to verify their functionality in isolation.

### Key Testing Scenarios
1. **Particle Creation**:
   - Verify that particles are created with correct role distribution and initial properties.
   - Ensure determinism with fixed block nonce.
2. **Behavior Application**:
   - Test that behaviors (e.g., flocking) correctly modify particle state (e.g., position).
   - Confirm role-specific behaviors align with trait definitions.
3. **Physics Calculations**:
   - Validate force calculations (e.g., attraction, repulsion) for accuracy.
   - Ensure physics updates maintain deterministic outcomes.

### Example Unit Test
```typescript
// tests/unit/particleService.test.ts
import { particleService } from 'src/domains/creature/services/particleService';
import { Role } from 'src/shared/types/core';
import { createMockBlockData } from 'tests/mocks';

describe('ParticleService', () => {
  test('creates 500 particles with deterministic role distribution', () => {
    const blockData = createMockBlockData(12345);
    const particles1 = particleService.createParticles(500, blockData);
    const particles2 = particleService.createParticles(500, blockData);
    const roleCounts1 = particles1.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {});
    const roleCounts2 = particles2.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {});
    expect(roleCounts1).toEqual(roleCounts2); // Deterministic
    expect(roleCounts1[Role.CORE]).toBeCloseTo(100, -1); // ~20% of 500
  });

  test('applies flocking behavior correctly', () => {
    const particle = createMockParticle({ role: Role.MOVEMENT, position: [0, 0, 0], behaviorTrait: { action: 'Flocking' } });
    const nearby = [createMockParticle({ position: [2, 0, 0] })];
    behaviorService.applyBehavior(particle, particle.behaviorTrait, nearby);
    expect(particle.position[0]).toBeGreaterThan(0); // Moved toward nearby
  });
});

```

## Integration Testing Strategies
Integration tests verify interactions between the particle system and other domains, ensuring traits, physics, and rendering work cohesively.

### Key Testing Scenarios
1. **Trait Integration**:
   - Confirm that visual and behavior traits are correctly applied and rendered.
   - Test trait-driven changes (e.g., position updates from flocking).
2. **Physics and Rendering**:
   - Validate that physics updates (e.g., force calculations) correctly influence particle positions and visuals.
   - Ensure updates are performant (< 10ms for 500 particles).
3. **Deterministic Behavior**:
   - Verify that particle states (e.g., positions, roles) are identical across runs with the same block nonce.

### Example Integration Test
```typescript
// tests/integration/particleSystem.test.ts
import { particleService } from 'src/domains/creature/services/particleService';
import { instancedRenderer } from 'src/domains/rendering/services/instancedRenderer';
import { createMockBlockData } from 'tests/mocks';

describe('Particle System Integration', () => {
  test('applies visual trait and renders correctly', () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(1, blockData);
    instancedRenderer.updateParticles(particles);
    const color = new THREE.Color();
    instancedRenderer.getMesh().getColorAt(0, color);
    expect(color.getHex()).toBe(particles[0].visualTrait.color);
  });

  test('maintains performance for 500 particles', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const start = performance.now();
    await particleService.updatePhysics(particles, 1 / 60);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10); // < 10ms update
  });

  test('ensures deterministic physics updates', async () => {
    const blockData = createMockBlockData(12345);
    const particles1 = particleService.createParticles(10, blockData);
    const particles2 = particleService.createParticles(10, blockData);
    const updated1 = await particleService.updatePhysics(particles1, 1 / 60);
    const updated2 = await particleService.updatePhysics(particles2, 1 / 60);
    expect(updated1[0].position).toEqual(updated2[0].position);
  });
});
```

## Sample Test Cases
1. **Role Assignment**:
   - **Scenario**: Create 500 particles and verify ~20% are CORE.
   - **Expected Outcome**: Approximately 100 CORE particles.
2. **Behavior Application**:
   - **Scenario**: Apply a flocking behavior and check if the particle moves toward nearby particles.
   - **Expected Outcome**: Particle’s position shifts toward the group’s average position.
3. **Physics Update**:
   - **Scenario**: Apply attraction forces to a CORE particle and verify position update.
   - **Expected Outcome**: Particle moves toward the group center.
4. **Performance Benchmark**:
   - **Scenario**: Update 500 particles and measure time.
   - **Expected Outcome**: Update time < 10ms, FPS ≥ 60.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Three.js Stats**: Monitors FPS and frame time for rendering impact.
- **Chrome DevTools**: Profiles CPU usage and worker thread performance.
- **Custom Metrics**: Use `performance.now()` to measure update times in `particleService.ts`.

## Integration Points
- **Creature Domain (`src/domains/creature/`)**: Tests validate `particleService.ts` for creation and updates.
- **Traits Domain (`src/domains/traits/`)**: Ensures `traitService.ts` and `behaviorService.ts` apply traits correctly.
- **Workers Domain (`src/domains/workers/`)**: Verifies `forceWorker.ts` and `positionWorker.ts` for physics calculations.
- **Rendering Domain (`src/domains/rendering/`)**: Confirms `instancedRenderer.ts` reflects particle state changes.

## Rules Adherence
- **Determinism**: Tests confirm consistent behavior with fixed block nonce.
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies.
- **Performance**: Performance tests validate < 10ms updates and 60 FPS.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate particle-related tests (e.g., in `tests/` or scattered files).
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with new services like `particleService.ts`.
3. **Add New Tests**: Implement tests for role assignment, behaviors, and physics.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing.

## Example Performance Test
```typescript
// tests/integration/particlePerformance.test.ts
describe('Particle Performance', () => {
  test('updates 500 particles within 10ms', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const start = performance.now();
    await particleService.updatePhysics(particles, 1 / 60);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });
});
```


