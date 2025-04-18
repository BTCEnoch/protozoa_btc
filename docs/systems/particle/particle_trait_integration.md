
# Particle Trait Integration

## Purpose
This document explains how the particle system in Bitcoin Protozoa integrates with the trait system to apply abilities, formations, behaviors, visuals, and mutations to particles. It serves as a single source of truth for developers, ensuring that traits are correctly assigned and utilized, maintaining determinism and performance for up to 500 particles per creature.

## Location
`new_docs/systems/particle/particle_trait_integration.md`

## Overview
The particle system manages the creation, behavior, and state of particles within creatures, while the trait system defines their properties and capabilities. Integration between these systems ensures that each particle reflects its assigned traits, influencing its appearance, movement, and interactions. This process, coordinated by services like `traitService.ts` and `particleService.ts`, relies on deterministic RNG seeded by Bitcoin block data to ensure consistency across runs. This document details the integration workflow, mapping of traits to particle properties, and optimization strategies, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Trait Categories and Particle Mapping
Traits are categorized into five types, each affecting particles differently:
1. **Abilities**: Define skills or effects (e.g., “Fire Blast” increases damage).
   - **Mapping**: Stored in `IParticle.abilityTrait`, modifies stats (e.g., `damage`).
2. **Formations**: Control spatial arrangements (e.g., “Shield Wall”).
   - **Mapping**: Influences `IParticle.position` via formation patterns.
3. **Behaviors**: Dictate actions (e.g., “Flocking” for group cohesion).
   - **Mapping**: Stored in `IParticle.behaviorTrait`, affects `velocity` and `position`.
4. **Visuals**: Define appearance (e.g., color, glow).
   - **Mapping**: Stored in `IParticle.visualTrait`, sets `color`, `scale`, or shader uniforms.
5. **Mutations**: Enable evolutionary changes (e.g., “Enhanced Reflexes”).
   - **Mapping**: Stored in `IParticle.mutationTrait`, modifies stats or triggers new behaviors.

### Example Particle with Traits
```typescript
// src/domains/creature/types/particle.ts
export interface IParticle {
  id: string;
  role: Role;
  position: number[];
  velocity: number[];
  color: number;
  scale: number;
  abilityTrait?: IAbility;
  behaviorTrait?: IBehavior;
  visualTrait?: IVisual;
  mutationTrait?: IMutation;
}
```

## Integration Workflow
The integration process involves the following steps:

1. **Trait Assignment During Creation**:
   - The `particleService.ts` calls `traitService.ts` to assign traits based on particle role and block nonce.
2. **Trait Data Retrieval**:
   - The `traitService.ts` retrieves trait details from `src/domains/traits/data/` (e.g., `abilityPools/`, `visualPatterns/`).
3. **Apply Trait Effects**:
   - Each trait category’s service (e.g., `behaviorService.ts`, `visualService.ts`) applies effects to particle properties.
4. **Update Particle State**:
   - Particle properties (e.g., `position`, `color`) are updated in `IParticle` and propagated to rendering or physics systems.
5. **Continuous Updates**:
   - Behaviors and mutations may trigger ongoing updates (e.g., position changes for flocking, stat changes for evolution).

### Example Integration Code
#### Trait Assignment
```typescript
// src/domains/creature/services/particleService.ts
import { traitService } from 'src/domains/traits/services/traitService';
import { Role } from 'src/shared/types/core';
import { IParticle } from 'src/domains/creature/types/particle';

class ParticleService {
  createParticles(count: number, blockData: IBlockData): IParticle[] {
    const rng = createRNGFromBlock(blockData.nonce).getStream('particles');
    const particles: IParticle[] = [];
    for (let i = 0; i < count; i++) {
      const role = this.assignRole(rng);
      const particle: IParticle = {
        id: `particle-${i}`,
        role,
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: 0xffffff,
        scale: 1,
        visualTrait: traitService.assignTrait({ id: `particle-${i}`, role }, blockData, 'visual'),
        behaviorTrait: traitService.assignTrait({ id: `particle-${i}`, role }, blockData, 'behavior')
      };
      particles.push(particle);
    }
    return particles;
  }

  private assignRole(rng: () => number): Role {
    // Role assignment logic
    return Role.CORE;
  }
}

export const particleService = new ParticleService();
```

#### Applying Visual Trait
```typescript
// src/domains/rendering/services/instancedRenderer.ts
import { visualService } from 'src/domains/traits/services/visualService';
import * as THREE from 'three';

class InstancedRenderer {
  private mesh: THREE.InstancedMesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.InstancedMesh(geometry, material, 500);
  }

  updateParticles(particles: IParticle[]) {
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      dummy.scale.setScalar(visualService.getScale(p.visualTrait));
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.mesh.setColorAt(i, visualService.getColor(p.visualTrait));
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }
}
```

## Performance Considerations
To ensure efficient trait integration for 500 particles:
1. **Batch Trait Assignment**: Assign traits in a single pass to minimize RNG calls.
2. **Cache Trait Data**: Store frequently accessed trait pools in `traitService.ts` to avoid redundant lookups.
3. **Optimize Updates**: Apply trait effects only when necessary (e.g., when behaviors trigger or mutations evolve).
4. **Off-Thread Processing**: Use `behavior/flockingWorker.ts` for complex behavior updates to reduce main thread load.

## Integration Points
- **Traits Domain (`src/domains/traits/`)**: Provides trait data (`IAbility`, `IBehavior`, etc.) via `traitService.ts` and category-specific services.
- **Creature Domain (`src/domains/creature/`)**: Supplies `IParticle` objects for trait assignment and state updates.
- **Rendering Domain (`src/domains/rendering/`)**: Uses visual traits for rendering via `instancedRenderer.ts`.
- **Workers Domain (`src/domains/workers/`)**: Offloads behavior and physics updates to `flockingWorker.ts` or `positionWorker.ts`.

## Rules Adherence
- **Determinism**: Trait assignment and application are deterministic, using RNG seeded by block nonce.
- **Modularity**: Integration logic is encapsulated in `traitService.ts` and `particleService.ts`, with clear interfaces.
- **Performance**: Optimized for < 10ms trait application for 500 particles, leveraging caching and batch processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Integration Code**: Locate trait assignment and application code (e.g., in `src/creatures/`, `src/traits/`).
2. **Refactor into Services**: Move logic to `src/domains/traits/services/traitService.ts` and `src/domains/creature/services/particleService.ts`.
3. **Update Rendering Integration**: Ensure `instancedRenderer.ts` uses `visualService.ts` for trait-driven visuals.
4. **Test Integration**: Validate that traits are correctly assigned and rendered, using Jest to check determinism and performance.
5. **Optimize Performance**: Implement caching and batch processing to meet performance targets.

## Example Test
```typescript
// tests/integration/particleTrait.test.ts
describe('Particle Trait Integration', () => {
  test('applies visual trait correctly', () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.CORE });
    const trait = traitService.assignTrait(particle, blockData, 'visual');
    particle.visualTrait = trait;
    instancedRenderer.updateParticles([particle]);
    const color = new THREE.Color();
    instancedRenderer.getMesh().getColorAt(0, color);
    expect(color.getHex()).toBe(trait.color);
  });
});
```


