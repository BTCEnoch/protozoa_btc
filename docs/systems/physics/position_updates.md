
# Position Updates

## Purpose
This document details the position update mechanisms in Bitcoin Protozoa’s physics system, which apply calculated forces to update the positions and velocities of up to 500 particles per creature. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/physics/position_updates.md`

## Overview
Position updates are a critical component of Bitcoin Protozoa’s physics system, translating forces (e.g., attraction, repulsion, spring forces) into particle movements to maintain role-specific formations (e.g., “Shield Wall” for DEFENSE, “Spiral Charge” for ATTACK) [Timestamp: April 8, 2025, 19:50]. Implemented in `positionWorker.ts` within the `workers` domain, updates use Euler integration to ensure smooth, deterministic motion, executed off-thread for performance (< 5ms for 500 particles, 60 FPS) [Timestamp: April 14, 2025, 19:58]. The system integrates with force calculations (`forceWorker.ts`), formations (`formationService.ts`), rendering (`instancedRenderer.ts`), and game theory (`payoffMatrixService.ts`). This document outlines the update logic, integration points, performance optimizations, and testing strategies, building on our discussions about physics and performance optimization.

## Position Update Logic
Position updates apply forces to particles using Euler integration, a simple yet effective method for real-time simulations, updating velocities and positions based on time steps.

### Workflow
1. **Input Collection**:
   - Receive `IParticle[]` (positions, velocities, roles), force vectors from `forceWorker.ts`, and `deltaTime` (e.g., 1/60s for 60 FPS) via `workerBridge.ts`.
2. **Velocity Update**:
   - Calculate new velocity: `velocity += force * deltaTime`.
   - Apply damping to prevent runaway acceleration: `velocity *= dampingFactor` (e.g., 0.98).
3. **Position Update**:
   - Update position: `position += velocity * deltaTime`.
   - Enforce boundaries (e.g., keep particles within a 100-unit cube) to maintain simulation stability.
4. **Role-Specific Adjustments**:
   - Adjust damping or velocity caps based on role (e.g., higher cap for MOVEMENT, lower for DEFENSE).
5. **Output**:
   - Return updated `IParticle[]` with new positions and velocities to `workerBridge.ts`, passed to `particleService.ts` for integration.

### Euler Integration
- **Formula**:
  - Velocity: `v(t + Δt) = v(t) + F(t) * Δt`
  - Position: `p(t + Δt) = p(t) + v(t + Δt) * Δt`
- **Advantages**: Simple, fast, suitable for real-time simulations with small `deltaTime` (e.g., 1/60s).
- **Limitations**: Less accurate for large time steps; mitigated by fixed `deltaTime` and damping.

### Role-Specific Adjustments
- **CORE**: High damping (0.95) to maintain stable “Cluster” formations.
- **CONTROL**: Moderate damping (0.97) for precise “Grid” movements.
- **MOVEMENT**: Low damping (0.99) and high velocity cap (5 units/s) for fluid “Swarm” mobility.
- **DEFENSE**: High damping (0.94) and low velocity cap (2 units/s) for rigid “Shield Wall” stability.
- **ATTACK**: Moderate damping (0.98) and moderate velocity cap (4 units/s) for dynamic “Spiral Charge” aggression.

### Determinism
- Updates use static inputs (forces, `deltaTime`) and deterministic force vectors from `forceWorker.ts`, ensuring consistent outcomes for the same block nonce [Timestamp: April 12, 2025, 12:18].
- No RNG is used directly in position updates, as randomization is handled in force calculations if needed.

## Implementation
The position update logic is implemented in `positionWorker.ts`, using Three.js for vector operations and optimized for performance with batch processing.

### Example Code
```typescript
// src/domains/workers/services/positionWorker.ts
import * as THREE from 'three';
import { logger } from 'src/shared/services/LoggerService';

self.onmessage = function (e: MessageEvent) {
  const { task, data } = e.data;
  if (task === 'updatePositions') {
    const updatedParticles = updatePositions(data.particles, data.forces, data.deltaTime);
    postMessage(updatedParticles, [updatedParticles.buffer]);
  } else {
    postMessage({ error: 'Unknown task' });
  }
};

function updatePositions(particles: IParticle[], forces: Float32Array, deltaTime: number): IParticle[] {
  const dampingFactors = {
    [Role.CORE]: 0.95,
    [Role.CONTROL]: 0.97,
    [Role.MOVEMENT]: 0.99,
    [Role.DEFENSE]: 0.94,
    [Role.ATTACK]: 0.98
  };
  const velocityCaps = {
    [Role.CORE]: 3,
    [Role.CONTROL]: 3,
    [Role.MOVEMENT]: 5,
    [Role.DEFENSE]: 2,
    [Role.ATTACK]: 4
  };

  return particles.map((p, i) => {
    const force = new THREE.Vector3(forces[i * 3], forces[i * 3 + 1], forces[i * 3 + 2]);
    const velocity = new THREE.Vector3(p.velocity[0], p.velocity[1], p.velocity[2]);
    const position = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);

    // Update velocity
    velocity.add(force.multiplyScalar(deltaTime));
    velocity.multiplyScalar(dampingFactors[p.role]);
    const speed = velocity.length();
    if (speed > velocityCaps[p.role]) {
      velocity.multiplyScalar(velocityCaps[p.role] / speed); // Cap velocity
    }

    // Update position
    position.add(velocity.multiplyScalar(deltaTime));

    // Enforce boundaries (e.g., 100-unit cube)
    position.clamp(new THREE.Vector3(-100, -100, -100), new THREE.Vector3(100, 100, 100));

    return {
      ...p,
      velocity: [velocity.x, velocity.y, velocity.z],
      position: [position.x, position.y, position.z]
    };
  });
}
```

## Performance Considerations
To ensure position updates are efficient for 500 particles:
1. **Batch Processing**: Update all particles in a single pass to minimize worker overhead.
2. **Optimized Data Structures**: Use `Float32Array` for forces and `THREE.Vector3` for calculations to reduce memory usage and improve performance.
3. **Minimized Data Transfer**: Transfer only updated positions and velocities using `Transferable` objects (e.g., `ArrayBuffer`) to reduce main thread-worker latency.
4. **Efficient Vector Operations**: Leverage Three.js for fast vector math, avoiding manual loops where possible [Timestamp: April 14, 2025, 19:58].
5. **Profiling**: Monitor worker CPU usage with Chrome DevTools, targeting < 2ms for position updates.

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `positionWorker.ts` performs updates, coordinated by `workerBridge.ts`.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` provides `IParticle[]` and force vectors, receiving updated particles.
- **Force Calculation (`src/domains/workers/`)**: `forceWorker.ts` supplies force vectors for integration.
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` validates updated positions against patterns (e.g., “Spiral Charge”).
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` uses updated positions for visualization.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` incorporates movement data (e.g., particle spacing in “Swarm”).

## Rules Adherence
- **Determinism**: Updates use deterministic inputs (forces, `deltaTime`), ensuring consistent outcomes for the same block nonce [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Update logic is encapsulated in `positionWorker.ts`, with clear interfaces.
- **Performance**: Optimized for < 2ms updates for 500 particles, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports formations, rendering, and game theory, ensuring cohesive gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate position update code (e.g., in `src/creatures/` or `src/lib/`), likely implicit in particle movement logic.
2. **Refactor into Position Worker**: Move logic to `src/domains/workers/services/positionWorker.ts`, ensuring off-thread execution.
3. **Integrate with Force Worker**: Use force vectors from `forceWorker.ts` for updates, aligning with physics architecture.
4. **Optimize Performance**: Implement batch processing and `Float32Array` for efficiency.
5. **Test Updates**: Validate updates with Jest tests, ensuring determinism, stability, and < 2ms performance, using Chrome DevTools for profiling.

## Example Test
```typescript
// tests/unit/positionWorker.test.ts
describe('PositionWorker', () => {
  test('updates position with force for MOVEMENT', async () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.MOVEMENT, position: [0, 0, 0], velocity: [0, 0, 0] });
    const forces = new Float32Array([1, 0, 0]); // Force along x-axis
    const deltaTime = 1 / 60;
    const updated = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles: [particle], forces, deltaTime }
    });
    expect(updated[0].velocity[0]).toBeGreaterThan(0); // Velocity increased
    expect(updated[0].position[0]).toBeGreaterThan(0); // Position shifted
  });

  test('ensures deterministic updates with same inputs', async () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.DEFENSE, position: [0, 0, 0], velocity: [0, 0, 0] });
    const forces = new Float32Array([0, 1, 0]);
    const deltaTime = 1 / 60;
    const updated1 = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles: [particle], forces, deltaTime }
    });
    const updated2 = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles: [particle], forces, deltaTime }
    });
    expect(updated1[0].position).toEqual(updated2[0].position); // Deterministic
  });
});
```

