
# Particle Physics and Forces

## Purpose
This document describes the physics system governing particle movement and interactions in Bitcoin Protozoa, focusing on force calculations that drive role-specific dynamics. It serves as a single source of truth for developers, ensuring that the physics system is deterministic, efficient, and aligned with the project’s domain-driven design (DDD) principles.

## Location
`new_docs/systems/particle/particle_physics.md`

## Overview
The particle physics system in Bitcoin Protozoa manages the movement and interactions of up to 500 particles per creature, simulating behaviors like attraction, repulsion, and role-specific forces (e.g., CORE particles stabilizing the group, ATTACK particles pursuing targets). Implemented using a custom physics engine with Euler integration, the system runs off-thread via Web Workers (`forceWorker.ts`, `positionWorker.ts`) to optimize performance. Forces are calculated deterministically, influenced by Bitcoin block data through seeded RNG, ensuring consistent behavior across runs. This document outlines the physics mechanics, force calculations, and integration points, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Physics Mechanics
The physics system uses Euler integration to update particle positions and velocities based on applied forces. Each particle’s state (`IParticle`) includes:
- **Position**: 3D coordinates (x, y, z).
- **Velocity**: Movement direction and speed.
- **Role**: Determines force interactions (e.g., CORE, ATTACK).

### Force Types
1. **Attraction**: Pulls particles toward a target (e.g., CORE particles stabilizing group cohesion).
   - **Formula**: `F = k * (targetPos - particlePos)`, where `k` is a constant (e.g., 0.1).
2. **Repulsion**: Pushes particles away to avoid collisions.
   - **Formula**: `F = -k / distance^2`, capped at a minimum distance to prevent singularities.
3. **Role-Specific Forces**:
   - **CORE**: Strong attraction to maintain group center.
   - **CONTROL**: Steering forces to align group movement.
   - **MOVEMENT**: High velocity for rapid repositioning.
   - **DEFENSE**: Repulsion to protect allies.
   - **ATTACK**: Attraction toward enemies or targets.

### Euler Integration
- **Update**: `velocity += force * deltaTime; position += velocity * deltaTime`.
- **Delta Time**: Fixed timestep (e.g., 1/60s) for consistent updates.
- **Determinism**: Forces are calculated using static inputs (e.g., particle roles, trait effects) and seeded RNG for dynamic behaviors.

## Implementation
The physics system is implemented primarily through the `forceWorker.ts` and `positionWorker.ts` in the `workers` domain, with coordination from `particleService.ts` in the `creature` domain.

### Example Physics Implementation
```typescript
// src/domains/workers/services/physics/forceWorker.ts
self.onmessage = function (e) {
  const { particles, deltaTime } = e.data;
  const forces = particles.map(p => calculateForces(p, particles));
  postMessage(forces);
};

function calculateForces(particle: IParticle, particles: IParticle[]): THREE.Vector3 {
  let force = new THREE.Vector3();
  if (particle.role === Role.CORE) {
    const center = particles.reduce((acc, p) => acc.add(p.position), new THREE.Vector3()).divideScalar(particles.length);
    force.add(center.sub(particle.position).multiplyScalar(0.1)); // Attraction to center
  }
  // Add repulsion and role-specific forces
  particles.forEach(p => {
    if (p !== particle) {
      const dist = distance(p.position, particle.position);
      if (dist < 2) {
        force.add(particle.position.sub(p.position).normalize().multiplyScalar(0.1 / (dist * dist))); // Repulsion
      }
    }
  });
  return force;
}
```

### Position Update
```typescript
// src/domains/workers/services/physics/positionWorker.ts
self.onmessage = function (e) {
  const { particles, forces, deltaTime } = e.data;
  const updated = particles.map((p, i) => {
    const velocity = p.velocity.add(forces[i].multiplyScalar(deltaTime));
    const position = p.position.add(velocity.multiplyScalar(deltaTime));
    return { ...p, position, velocity };
  });
  postMessage(updated);
};
```

## Performance Considerations
To handle 500 particles efficiently:
1. **Off-Thread Processing**: Use `forceWorker.ts` and `positionWorker.ts` to compute physics off the main thread, reducing UI lag.
2. **Spatial Partitioning**: Implement a grid or octree via `spatialUtils.ts` to limit force calculations to nearby particles.
3. **Batch Updates**: Process all particles in a single worker message to minimize communication overhead.
4. **Fixed Timestep**: Use a fixed `deltaTime` (e.g., 1/60s) to ensure consistent updates and avoid instability.

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `forceWorker.ts` and `positionWorker.ts` handle physics computations, coordinated by `workerBridge.ts`.
- **Creature Domain (`src/domains/creature/`)**: `particleService.ts` manages particle state updates based on worker outputs.
- **Traits Domain (`src/domains/traits/`)**: Behavior traits (`IBehavior`) influence force calculations (e.g., flocking strength).
- **Rendering Domain (`src/domains/rendering/`)**: Updated particle positions are reflected in visuals via `instancedRenderer.ts`.

## Rules Adherence
- **Determinism**: Forces are calculated using deterministic inputs (e.g., particle positions, trait effects) and seeded RNG.
- **Modularity**: Physics logic is encapsulated in Web Workers, with clear interfaces via `workerBridge.ts`.
- **Performance**: Optimized for < 10ms updates for 500 particles, leveraging off-thread processing and spatial partitioning.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Physics Logic**: Locate physics-related code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Workers**: Move force and position calculations to `src/domains/workers/services/physics/forceWorker.ts` and `positionWorker.ts`.
3. **Integrate with Particle Service**: Update `particleService.ts` to use worker outputs for state updates.
4. **Optimize with Spatial Partitioning**: Implement grid-based calculations in `spatialUtils.ts` to reduce force computation overhead.
5. **Test Physics**: Validate particle movements (e.g., CORE attraction) and performance using Jest and profiling tools.

## Example Integration
### Coordinating Physics Updates
```typescript
// src/domains/creature/services/particleService.ts
import { workerBridge } from 'src/domains/workers/services/workerBridge';

class ParticleService {
  async updatePhysics(particles: IParticle[], deltaTime: number): Promise<IParticle[]> {
    const forces = await workerBridge.sendMessage('forceWorker', { particles, deltaTime });
    const updated = await workerBridge.sendMessage('positionWorker', { particles, forces, deltaTime });
    return updated;
  }
}

export const particleService = new ParticleService();
```

## Testing Particle Physics
To ensure correctness:
- **Unit Test**: Verify that `calculateForces` produces expected forces for a given role and particle configuration.
- **Integration Test**: Confirm that physics updates correctly influence particle positions and rendering.
- **Example**:
  ```typescript
  // tests/unit/forceWorker.test.ts
  describe('ForceWorker', () => {
    test('calculates attraction force for CORE particle', () => {
      const particle = createMockParticle({ role: Role.CORE, position: [0, 0, 0] });
      const others = [createMockParticle({ position: [2, 0, 0] })];
      const force = calculateForces(particle, others);
      expect(force.x).toBeGreaterThan(0); // Attracted toward other particle
    });
  });
  ```


