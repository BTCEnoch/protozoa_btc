
# Formation Physics Integration

## Purpose
This document describes how the formation system in Bitcoin Protozoa integrates with the physics system to maintain particle arrangements under forces like attraction or repulsion, ensuring stable and realistic role-specific formations (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE). It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and deterministic processes driven by Bitcoin block data, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/formation/formation_physics_integration.md`

## Overview
The formation system organizes up to 500 particles per creature into role-specific patterns, while the physics system, implemented with Euler integration in Web Workers (`forceWorker.ts`, `positionWorker.ts`), governs particle movement through forces like attraction, repulsion, and role-specific dynamics. Integration ensures that formations remain intact under physical forces, with particles adhering to pattern positions while responding to external stimuli (e.g., enemy attacks). Managed by `formationService.ts` and coordinated with `forceWorker.ts`, this integration maintains determinism using seeded RNG and optimizes performance for real-time updates. This document outlines the integration workflow, rules for force adjustments, and performance considerations.

## Integration Workflow
The formation-physics integration process ensures particles maintain their assigned formation patterns while allowing dynamic movement. The workflow includes:

1. **Retrieve Formation Data**:
   - Access the current `IFormationPattern` for each role group from `formationService.ts`.
2. **Calculate Base Forces**:
   - Compute physics forces (e.g., attraction, repulsion) in `forceWorker.ts` based on particle positions and roles.
3. **Apply Formation Constraints**:
   - Adjust forces to pull particles toward their target formation positions, using spring-like forces to maintain pattern integrity.
4. **Update Particle Positions**:
   - Apply modified forces in `positionWorker.ts` to update `IParticle` positions via Euler integration.
5. **Propagate Updates**:
   - Sync updated positions to the main thread via `workerBridge.ts`, updating rendering and game state.

### Rules for Force Adjustments
- **Deterministic Forces**: All force calculations use static inputs (e.g., particle roles, trait effects) or seeded RNG for dynamic behaviors.
- **Role-Specific Constraints**:
  - **CORE**: Strong attraction to pattern center (e.g., “Cluster” position) to maintain cohesion.
  - **CONTROL**: Moderate forces to align with “Grid” positions, allowing flexibility for steering.
  - **MOVEMENT**: Light constraints for “Swarm” to prioritize mobility.
  - **DEFENSE**: High spring forces to hold “Shield Wall” positions against external forces.
  - **ATTACK**: Flexible forces for “Vanguard” to allow aggressive movement.
- **Spring-Like Forces**: For each particle, a force `F = k * (targetPos - currentPos)` (where `k` is a stiffness constant, e.g., 0.1) pulls it toward its formation position.
- **Trait Influence**: Behavior traits (e.g., “Flocking”) modify force magnitudes (e.g., +10% attraction for MOVEMENT particles).
- **Balance with Physics**: Formation forces are balanced with physics forces (e.g., repulsion) to avoid oscillation or instability.

### Example Integration Code
#### Force Calculation with Formation Constraints
```typescript
// src/domains/workers/services/physics/forceWorker.ts
self.onmessage = function (e) {
  const { particles, formationPatterns, deltaTime } = e.data;
  const forces = particles.map(p => calculateForces(p, particles, formationPatterns[p.role]));
  postMessage(forces);
};

function calculateForces(particle: IParticle, particles: IParticle[], pattern: IFormationPattern): THREE.Vector3 {
  let force = new THREE.Vector3();
  
  // Base physics forces (e.g., repulsion)
  particles.forEach(p => {
    if (p !== particle) {
      const dist = distance(p.position, particle.position);
      if (dist < 2) {
        force.add(particle.position.sub(p.position).normalize().multiplyScalar(0.1 / (dist * dist)));
      }
    }
  });

  // Formation constraint force
  const targetPos = pattern.positions[particle.index % pattern.positions.length];
  const currentPos = new THREE.Vector3(particle.position[0], particle.position[1], particle.position[2]);
  const formationForce = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z).sub(currentPos).multiplyScalar(0.1);
  force.add(formationForce);

  // Role-specific adjustment
  if (particle.role === Role.DEFENSE) {
    force.multiplyScalar(1.5); // Stronger constraint for Shield Wall
  }

  // Trait influence
  if (particle.behaviorTrait?.action === 'Flocking') {
    force.add(this.calculateFlockingForce(particle, particles).multiplyScalar(0.1));
  }

  return force;
}
```

#### Position Update
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
To ensure efficient integration for 500 particles:
1. **Batch Force Calculations**: Compute all forces in a single worker pass to minimize communication overhead.
2. **Spatial Partitioning**: Use `spatialUtils.ts` to limit force calculations to nearby particles, reducing complexity from O(n²) to O(n).
3. **Throttle Updates**: Apply formation constraints only when necessary (e.g., when particles deviate > 1 unit from target positions).
4. **Off-Thread Processing**: Leverage `forceWorker.ts` and `positionWorker.ts` to offload calculations from the main thread.

## Integration Points
- **Physics Domain (`src/domains/workers/`)**: `forceWorker.ts` and `positionWorker.ts` calculate forces and update positions, integrating formation constraints.
- **Traits Domain (`src/domains/traits/`)**: `formationService.ts` uses `IFormationPattern` and `IBehavior` traits to guide force adjustments.
- **Creature Domain (`src/domains/creature/`)**: `particleService.ts` coordinates particle state updates with physics outputs.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` reflects updated `IParticle` positions.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: Provides `IBlockData` for RNG seeding in dynamic transitions.

## Rules Adherence
- **Determinism**: Force calculations use static inputs and seeded RNG, ensuring consistent behavior.
- **Modularity**: Integration logic is encapsulated in `formationService.ts` and Web Workers, with clear interfaces.
- **Performance**: Targets < 5ms for physics updates with formation constraints for 500 particles, leveraging off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate formation and physics code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Workers**: Move physics calculations to `src/domains/workers/services/physics/forceWorker.ts` and `positionWorker.ts`.
3. **Integrate Formation Constraints**: Update `forceWorker.ts` to include formation-specific forces.
4. **Test Integration**: Validate that formations (e.g., “Shield Wall”) remain stable under physics forces using Jest and visual inspections.
5. **Optimize Performance**: Implement spatial partitioning and batch processing to meet performance targets.

## Example Test
```typescript
// tests/integration/formationPhysics.test.ts
describe('Formation Physics Integration', () => {
  test('DEFENSE particles maintain Shield Wall under repulsion', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(10, blockData).map(p => ({ ...p, role: Role.DEFENSE }));
    const pattern = { id: 'shield_wall', positions: [{ x: 1, y: 0, z: 0 }], rarity: Rarity.COMMON };
    const group = { role: Role.DEFENSE, particles, currentPattern: pattern };
    formationService.assignFormation(group, blockData);
    const conditions = { enemyProximity: 5 };
    await particleService.updatePhysics(particles, 1 / 60); // Apply physics with formation constraints
    expect(particles[0].position[0]).toBeCloseTo(1, 1); // Maintains Shield Wall position
  });
});
```

