
# Force Calculation

## Purpose
This document details the force calculation mechanisms in Bitcoin Protozoa’s physics system, which determine the interactions and movements of up to 500 particles per creature. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/physics/force_calculation.md`

## Overview
Force calculation is a core component of Bitcoin Protozoa’s physics system, responsible for computing forces like attraction, repulsion, and spring forces to drive particle dynamics and maintain role-specific formations (e.g., “Shield Wall” for DEFENSE, “Spiral Charge” for ATTACK) [Timestamp: April 8, 2025, 19:50]. Implemented in `forceWorker.ts` within the `workers` domain, calculations are performed off-thread to ensure performance (< 5ms for 500 particles, 60 FPS) [Timestamp: April 14, 2025, 19:58]. Forces are deterministic, using static inputs or block nonce-seeded RNG, and integrate with formations (`formationService.ts`), rendering (`instancedRenderer.ts`), and game theory (`payoffMatrixService.ts`). This document outlines the types of forces, their calculation logic, role-specific adjustments, and integration points, building on our discussions about physics and performance optimization.

## Force Types
The physics system calculates three primary force types, each serving a specific purpose in particle dynamics:

1. **Attraction Forces**:
   - **Purpose**: Pull particles together to maintain group cohesion, especially for CORE and CONTROL roles.
   - **Behavior**: Proportional to distance between particles, capped to prevent collapse.
   - **Formula**: `F_attraction = k_attraction * (distance - idealDistance)`, where `k_attraction` is a role-specific constant (e.g., 0.05 for CORE), and `idealDistance` is the desired spacing (e.g., 1 unit).
2. **Repulsion Forces**:
   - **Purpose**: Push particles apart to avoid overlap, critical for MOVEMENT and ATTACK roles.
   - **Behavior**: Inversely proportional to distance, applied only when particles are too close.
   - **Formula**: `F_repulsion = k_repulsion / (distance^2)`, where `k_repulsion` is role-specific (e.g., 0.1 for MOVEMENT), capped at a maximum distance (e.g., 2 units).
3. **Spring Forces**:
   - **Purpose**: Align particles with formation pattern positions (e.g., “Cluster” for CORE), ensuring tactical coherence.
   - **Behavior**: Proportional to deviation from target position, acting like a spring.
   - **Formula**: `F_spring = k_spring * (targetPos - currentPos)`, where `k_spring` is role-specific (e.g., 0.12 for DEFENSE), and `targetPos` is the formation coordinate.

## Calculation Logic
Force calculations are performed in `forceWorker.ts`, which processes particle data and formation patterns to compute net forces per particle.

### Workflow
1. **Input Collection**:
   - Receive `IParticle[]` (positions, roles, velocities), `IFormationPattern[]` (target positions), and `deltaTime` from `particleService.ts` via `workerBridge.ts`.
2. **Spatial Partitioning**:
   - Use `spatialUtils.ts` to divide particles into a grid (e.g., 5-unit cells), limiting force calculations to nearby particles (within 2 units).
   - Reduces complexity from O(n²) to O(n) [Timestamp: April 14, 2025, 19:58].
3. **Force Computation**:
   - For each particle:
     - Calculate **attraction** and **repulsion** forces with nearby particles based on role-specific constants.
     - Compute **spring force** to align with the particle’s assigned formation position.
     - Sum forces to produce a net force vector.
4. **Output**:
   - Return an array of force vectors to `workerBridge.ts`, passed to `positionWorker.ts` for position updates.

### Role-Specific Adjustments
Force constants are tuned for each role to reflect tactical behavior:
- **CORE**: High `k_attraction` (0.05) and moderate `k_spring` (0.1) for tight cohesion in “Cluster.”
- **CONTROL**: Balanced `k_attraction` (0.03) and `k_spring` (0.08) for precise “Grid” alignment.
- **MOVEMENT**: High `k_repulsion` (0.1) and low `k_spring` (0.05) for fluid “Swarm” mobility.
- **DEFENSE**: High `k_spring` (0.12) and low `k_repulsion` (0.02) for rigid “Shield Wall” stability.
- **ATTACK**: Moderate `k_repulsion` (0.08) and `k_spring` (0.07) for dynamic “Spiral Charge” aggression.

### Determinism
- Forces are computed using static inputs (e.g., particle positions, formation patterns).
- For dynamic adjustments (e.g., randomized repulsion for MOVEMENT), use block nonce-seeded RNG from `rngSystem.ts` to ensure consistent outcomes [Timestamp: April 12, 2025, 12:18].

## Implementation
The force calculation logic is implemented in `forceWorker.ts`, leveraging Three.js for vector operations and `spatialUtils.ts` for optimization.

### Example Code
```typescript
// src/domains/workers/services/forceWorker.ts
import * as THREE from 'three';
import { spatialUtils } from 'src/shared/lib/spatialUtils';
import { logger } from 'src/shared/services/LoggerService';

self.onmessage = function (e: MessageEvent) {
  const { task, data } = e.data;
  if (task === 'calculateForces') {
    const forces = calculateForces(data.particles, data.formationPatterns, data.deltaTime);
    postMessage(forces, [forces.buffer]);
  } else {
    postMessage({ error: 'Unknown task' });
  }
};

function calculateForces(particles: IParticle[], patterns: { [role: string]: IFormationPattern }, deltaTime: number): Float32Array {
  const forces = new Float32Array(particles.length * 3); // x, y, z per particle
  const grid = spatialUtils.createGrid(particles, 5); // 5-unit cells

  particles.forEach((p, i) => {
    const force = new THREE.Vector3();
    const cellKey = spatialUtils.getCellKey(p.position, 5);
    const neighbors = grid.get(cellKey) || [];

    // Attraction and repulsion with neighbors
    neighbors.forEach(n => {
      if (n !== p) {
        const dist = distance(p.position, n.position);
        if (dist < 2) {
          const repulsion = calculateRepulsion(p, n, dist);
          force.add(repulsion);
        }
        if (dist > 1 && dist < 3) {
          const attraction = calculateAttraction(p, n, dist);
          force.add(attraction);
        }
      }
    });

    // Spring force for formation
    const pattern = patterns[p.role];
    if (pattern) {
      const spring = calculateSpringForce(p, pattern.positions[p.index % pattern.positions.length]);
      force.add(spring);
    }

    forces[i * 3] = force.x;
    forces[i * 3 + 1] = force.y;
    forces[i * 3 + 2] = force.z;
  });

  logger.debug(`Calculated forces for ${particles.length} particles`, { deltaTime });
  return forces;
}

function calculateRepulsion(p1: IParticle, p2: IParticle, dist: number): THREE.Vector3 {
  const k_repulsion = { [Role.MOVEMENT]: 0.1, [Role.ATTACK]: 0.08, [Role.DEFENSE]: 0.02, [Role.CORE]: 0.03, [Role.CONTROL]: 0.03 }[p1.role];
  const direction = new THREE.Vector3().subVectors(p1.position, p2.position).normalize();
  return direction.multiplyScalar(k_repulsion / (dist * dist));
}

function calculateAttraction(p1: IParticle, p2: IParticle, dist: number): THREE.Vector3 {
  const k_attraction = { [Role.CORE]: 0.05, [Role.CONTROL]: 0.03, [Role.MOVEMENT]: 0.01, [Role.DEFENSE]: 0.02, [Role.ATTACK]: 0.02 }[p1.role];
  const idealDistance = 1.5;
  const direction = new THREE.Vector3().subVectors(p2.position, p1.position).normalize();
  return direction.multiplyScalar(k_attraction * (dist - idealDistance));
}

function calculateSpringForce(p: IParticle, targetPos: { x: number, y: number, z: number }): THREE.Vector3 {
  const k_spring = { [Role.DEFENSE]: 0.12, [Role.CORE]: 0.1, [Role.CONTROL]: 0.08, [Role.ATTACK]: 0.07, [Role.MOVEMENT]: 0.05 }[p.role];
  const currentPos = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
  const target = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
  return target.sub(currentPos).multiplyScalar(k_spring);
}

function distance(p1: number[], p2: number[]): number {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 +
    (p1[1] - p2[1]) ** 2 +
    (p1[2] - p2[2]) ** 2
  );
}
```

## Performance Considerations
To ensure force calculations are efficient for 500 particles:
1. **Spatial Partitioning**: Use `spatialUtils.ts` to limit neighbor checks to nearby particles, reducing complexity to O(n) [Timestamp: April 14, 2025, 19:58].
2. **Batch Processing**: Compute forces for all particles in a single pass to minimize worker overhead.
3. **Optimized Data Transfer**: Use `Float32Array` with `Transferable` objects to reduce main thread-worker communication latency.
4. **Role-Specific Tuning**: Adjust force constants (e.g., `k_spring`) to minimize unnecessary calculations (e.g., low `k_repulsion` for DEFENSE).
5. **Profiling**: Monitor worker CPU usage with Chrome DevTools, targeting < 3ms for force calculations.

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `forceWorker.ts` performs calculations, coordinated by `workerBridge.ts`.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` provides `IParticle[]` data and receives force vectors.
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` supplies `IFormationPattern` for spring forces.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` uses updated positions driven by forces.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` incorporates particle spacing and movement (e.g., “Spiral Charge” damage boost).
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding in dynamic force adjustments.

## Rules Adherence
- **Determinism**: Forces use static inputs or seeded RNG, ensuring consistent outcomes for the same block nonce [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Calculation logic is encapsulated in `forceWorker.ts`, with clear interfaces.
- **Performance**: Optimized for < 3ms calculations for 500 particles, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports formations, rendering, and game theory, enhancing tactical gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate physics-related code (e.g., in `src/creatures/` or `src/lib/`), likely implicit in particle movement.
2. **Refactor into Force Worker**: Move force calculations to `src/domains/workers/services/forceWorker.ts`, ensuring off-thread execution.
3. **Implement Spatial Partitioning**: Add `spatialUtils.ts` to optimize neighbor queries.
4. **Integrate with Formations**: Use `formationService “‘Spiral Charge’ damage boost”).ts` to provide pattern data for spring forces [Timestamp: April 8, 2025, 19:50].
5. **Test and Optimize**: Validate force calculations with Jest tests, ensuring determinism and < 3ms performance, using Chrome DevTools for profiling.

## Example Test
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
    expect(forces[0]).toBeCloseTo(0.12, 2); // Spring force: k_spring * (1 - 0)
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
```

