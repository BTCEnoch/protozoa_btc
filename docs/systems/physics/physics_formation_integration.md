
# Physics Formation Integration

## Purpose
This document details how the physics system in Bitcoin Protozoa integrates with the formation system to maintain role-specific spatial arrangements for up to 500 particles per creature, ensuring tactical coherence. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/physics/physics_formation_integration.md`

## Overview
The physics system, responsible for particle movement and interactions, integrates tightly with the formation system to enforce patterns like “Shield Wall” for DEFENSE or “Spiral Charge” for ATTACK [Timestamp: April 8, 2025, 19:50]. This integration, primarily handled in `forceWorker.ts` and coordinated by `particleService.ts`, uses spring forces to align particles with formation-defined positions, ensuring visual and strategic alignment. The process is deterministic, relying on static formation data and block nonce-seeded RNG, and optimized for performance (< 5ms updates, 60 FPS) [Timestamp: April 14, 2025, 19:58]. This document outlines the integration workflow, spring force mechanics, role-specific adjustments, and testing strategies, building on our discussions about physics and formation systems.

## Integration Workflow
The physics-formation integration ensures particles adhere to their assigned formation patterns while allowing dynamic movement under physical forces.

### Workflow
1. **Retrieve Formation Data**:
   - `particleService.ts` fetches current `IFormationPattern` for each role group from `formationService.ts` (e.g., “Spiral Charge” for ATTACK).
2. **Pass Data to Physics**:
   - `particleService.ts` sends `IParticle[]` (positions, roles) and `IFormationPattern[]` (target positions) to `forceWorker.ts` via `workerBridge.ts`.
3. **Calculate Spring Forces**:
   - `forceWorker.ts` computes spring forces to pull particles toward their formation positions, combining with attraction/repulsion forces.
4. **Update Positions**:
   - `positionWorker.ts` applies forces to update particle positions, maintaining formation alignment.
5. **Validate and Propagate**:
   - `particleService.ts` validates updated positions against formation patterns, syncing with `instancedRenderer.ts` for rendering and `payoffMatrixService.ts` for game theory impacts.

### Spring Force Mechanics
- **Purpose**: Align particles with formation positions (e.g., spiral coordinates for “Spiral Charge”).
- **Formula**: `F_spring = k_spring * (targetPos - currentPos)`, where:
  - `k_spring`: Role-specific spring constant (e.g., 0.12 for DEFENSE, 0.05 for MOVEMENT).
  - `targetPos`: Formation coordinate (e.g., `{ x: 1, y: 0, z: 0 }`).
  - `currentPos`: Particle’s current position.
- **Behavior**: Acts like a spring, pulling particles toward target positions with strength proportional to deviation.
- **Damping**: Applied in `positionWorker.ts` to prevent oscillation (e.g., damping factor 0.94 for DEFENSE).

### Role-Specific Adjustments
- **CORE**: High `k_spring` (0.1) for tight “Cluster” alignment, ensuring cohesion.
- **CONTROL**: Moderate `k_spring` (0.08) for precise “Grid” positioning.
- **MOVEMENT**: Low `k_spring` (0.05) for flexible “Swarm” or “Vortex” mobility.
- **DEFENSE**: High `k_spring` (0.12) for rigid “Shield Wall” or “Phalanx” stability.
- **ATTACK**: Moderate `k_spring` (0.07) for dynamic “Spiral Charge” or “Vanguard” aggression.

### Determinism
- Spring forces use static formation positions and particle data, ensuring deterministic outcomes.
- If dynamic formation transitions involve RNG (e.g., switching to “Spiral Charge”), `formationService.ts` uses block nonce-seeded RNG for consistency [Timestamp: April 12, 2025, 12:18].

## Implementation
The integration is implemented in `forceWorker.ts`, with `formationService.ts` providing pattern data and `particleService.ts` coordinating the workflow.

### Example Code
#### Force Worker with Formation Integration
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
  }
};

function calculateForces(particles: IParticle[], patterns: { [role: string]: IFormationPattern }, deltaTime: number): Float32Array {
  const forces = new Float32Array(particles.length * 3);
  const grid = spatialUtils.createGrid(particles, 5);

  particles.forEach((p, i) => {
    const force = new THREE.Vector3();
    const cellKey = spatialUtils.getCellKey(p.position, 5);
    const neighbors = grid.get(cellKey) || [];

    // Attraction/repulsion (simplified)
    neighbors.forEach(n => {
      if (n !== p) {
        const dist = distance(p.position, n.position);
        if (dist < 2) force.add(calculateRepulsion(p, n, dist));
      }
    });

    // Spring force for formation
    const pattern = patterns[p.role];
    if (pattern) {
      const targetPos = pattern.positions[p.index % pattern.positions.length];
      const spring = calculateSpringForce(p, targetPos);
      force.add(spring);
    }

    forces[i * 3] = force.x;
    forces[i * 3 + 1] = force.y;
    forces[i * 3 + 2] = force.z;
  });

  logger.debug(`Calculated forces with formation integration for ${particles.length} particles`);
  return forces;
}

function calculateSpringForce(p: IParticle, targetPos: { x: number, y: number, z: number }): THREE.Vector3 {
  const k_spring = {
    [Role.DEFENSE]: 0.12,
    [Role.CORE]: 0.1,
    [Role.CONTROL]: 0.08,
    [Role.ATTACK]: 0.07,
    [Role.MOVEMENT]: 0.05
  }[p.role];
  const currentPos = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
  const target = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
  return target.sub(currentPos).multiplyScalar(k_spring);
}
```

#### Particle Service Coordination
```typescript
// src/domains/creature/services/particleService.ts
import { workerBridge } from 'src/domains/workers/services/workerBridge';
import { formationService } from 'src/domains/traits/services/formationService';
import { logger } from 'src/shared/services/LoggerService';

class ParticleService {
  async updatePhysics(particles: IParticle[], deltaTime: number): Promise<IParticle[]> {
    const start = performance.now();
    const formationPatterns = formationService.getCurrentFormations(particles);
    const forces = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles, formationPatterns, deltaTime }
    });
    const updatedParticles = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles, forces, deltaTime }
    });
    logger.debug(`Physics update with formation integration completed in ${performance.now() - start}ms`);
    return updatedParticles;
  }
}

export const particleService = new ParticleService();
```

## Performance Considerations
To ensure efficient integration for 500 particles:
1. **Minimized Data Transfer**: Pass only necessary formation data (e.g., `positions`) to `forceWorker.ts` using `Float32Array` and `Transferable` objects.
2. **Batch Processing**: Compute spring forces for all particles in a single pass to reduce worker overhead.
3. **Optimized Spring Forces**: Use role-specific `k_spring` values to minimize unnecessary calculations (e.g., low `k_spring` for MOVEMENT).
4. **Spatial Partitioning**: Leverage `spatialUtils.ts` in `forceWorker.ts` to limit force calculations to nearby particles, supporting scalability [Timestamp: April 14, 2025, 19:58].
5. **Profiling**: Monitor worker CPU usage with Chrome DevTools, targeting < 3ms for force calculations with formation integration.

## Integration Points
- **Physics Domain (`src/domains/workers/`)**: `forceWorker.ts` computes spring forces, and `positionWorker.ts` applies them, coordinated by `workerBridge.ts`.
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` provides `IFormationPattern` data for spring force calculations.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` coordinates data flow between physics and formation systems.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes updated particle positions.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses formation-driven positioning (e.g., “Shield Wall” damage reduction).
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding in formation transitions.

## Rules Adherence
- **Determinism**: Spring forces use static formation positions, with RNG-seeded transitions ensuring consistency [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Integration logic is encapsulated in `forceWorker.ts` and `particleService.ts`, with clear interfaces.
- **Performance**: Optimized for < 5ms updates for 500 particles, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Enhances tactical gameplay by aligning physics with formation patterns, supporting rendering and game theory.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate physics and formation code (e.g., in `src/creatures/` or `src/lib/`), likely implicit in particle movement or formation logic.
2. **Refactor into Workers**: Ensure `forceWorker.ts` integrates formation data for spring forces, as part of the physics system refactor.
3. **Enhance Formation Service**: Update `formationService.ts` to provide `IFormationPattern` data efficiently, aligning with formation documentation [Timestamp: April 8, 2025, 19:50].
4. **Optimize Integration**: Use batch processing and `Float32Array` for data transfer to meet performance targets.
5. **Test Integration**: Validate formation adherence with Jest tests, ensuring determinism and < 5ms performance, using Chrome DevTools for profiling.

## Example Test
```typescript
// tests/integration/physicsFormation.test.ts
describe('Physics Formation Integration', () => {
  test('maintains Shield Wall formation for DEFENSE', async () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.DEFENSE, position: [0, 0, 0] });
    const pattern = { id: 'shield_wall', positions: [{ x: 1, y: 0, z: 0 }], rarity: 'RARE' };
    const forces = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles: [particle], formationPatterns: { [Role.DEFENSE]: pattern }, deltaTime: 1 / 60 }
    });
    const updated = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles: [particle], forces, deltaTime: 1 / 60 }
    });
    expect(updated[0].position[0]).toBeGreaterThan(0); // Moving toward x=1
    expect(updated[0].position[0]).toBeLessThan(1); // Not fully at target yet
  });

  test('ensures deterministic updates with same inputs', async () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.ATTACK, position: [0, 0, 0] });
    const pattern = { id: 'spiral_charge', positions: [{ x: 1, y: 0, z: 0 }], rarity: 'RARE' };
    const forces1 = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles: [particle], formationPatterns: { [Role.ATTACK]: pattern }, deltaTime: 1 / 60 }
    });
    const updated1 = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles: [particle], forces: forces1, deltaTime: 1 / 60 }
    });
    const forces2 = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles: [particle], formationPatterns: { [Role.ATTACK]: pattern }, deltaTime: 1 / 60 }
    });
    const updated2 = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles: [particle], forces: forces2, deltaTime: 1 / 60 }
    });
    expect(updated1[0].position).toEqual(updated2[0].position); // Deterministic
  });
});
```
