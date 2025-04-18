
# Evolution Visualization

## Purpose
This document explains how evolutionary changes in Bitcoin Protozoa are visualized in the 3D environment, focusing on rendering mutation-driven visual traits and formation shifts for creatures with up to 500 particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and deterministic processes driven by Bitcoin block data, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework, building on our discussions about dynamic visual effects [Timestamp: April 12, 2025, 12:18].

## Location
`new_docs/systems/evolution/evolution_visualization.md`

## Overview
The evolution system drives creature adaptation through mutations, which alter stats, behaviors, and visuals (e.g., glowing particles for MYTHIC mutations). Visualization, managed by `instancedRenderer.ts` in the `rendering` domain and supported by `visualService.ts` in the `traits` domain, uses Three.js to render these changes with instanced rendering for efficiency and custom shaders for dynamic effects. The process is deterministic, relying on static particle states and mutation traits, ensuring consistent visuals across runs. This document outlines the rendering workflow, optimization techniques, and integration points, ensuring modularity and performance (60 FPS for 500 particles).

## Visualization Workflow
The evolution visualization process renders mutation-driven changes and formation shifts, with the following steps:

1. **Retrieve Evolution State**:
   - Access `ICreature` and `IParticle` data from `evolutionTracker.ts`, including mutation traits and updated stats.
2. **Map Mutation Visuals**:
   - Use `visualService.ts` to translate `IMutation` visual properties (e.g., color, glowIntensity, size) to Three.js attributes.
3. **Update Formation Positions**:
   - Adjust particle positions via `formationService.ts` if mutations trigger formation changes (e.g., “Adaptive Camouflage” shifts to “Spread”).
4. **Configure InstancedMesh**:
   - Update `InstancedMesh` instance attributes (e.g., position, color, scale) in `instancedRenderer.ts` to reflect mutation effects and positions.
5. **Apply Shaders**:
   - Use `shaderManager.ts` to apply custom shaders for mutation-specific effects (e.g., pulsating glow for MYTHIC mutations).
6. **Render Scene**:
   - Integrate with `sceneManager.ts` to render the scene, ensuring evolutionary changes are displayed in real-time.

### Visual Trait Mapping
- **Color**: Sets `InstancedMesh` instance color or shader uniform (e.g., `#ff4500` for “Fury Strike” on ATTACK particles).
- **Glow Intensity**: Configures shader uniform for glow effects (0 to 1, e.g., 0.9 for MYTHIC “Iron Core”).
- **Size**: Scales instance matrix (e.g., 1.3x for “Reinforced Shell” on DEFENSE particles).
- **Role-Specific Visuals**: Mutations enhance role cues (e.g., CORE particles in “Cluster” glow brighter with “Iron Core”).
- **Dynamic Effects**: Shaders animate effects (e.g., pulsating glow for “Swift Stride” on MOVEMENT particles).

### Example Mutation Trait
```json
// src/domains/traits/data/mutationPatterns/core.ts
{
  "id": "iron_core",
  "name": "Iron Core",
  "rarity": "MYTHIC",
  "effect": "Increases health by 20%",
  "stats": { "health": 20 },
  "visual": { "color": "#00ff00", "glowIntensity": 0.9, "size": 1.2 }
}
```

## Implementation
Visualization is handled by `instancedRenderer.ts`, `visualService.ts`, and `shaderManager.ts`.

### Example Visualization Code
#### Visual Service
Maps mutation visual traits to rendering attributes.
```typescript
// src/domains/traits/services/visualService.ts
import * as THREE from 'three';
import { IVisualTrait, IMutation } from 'src/domains/traits/types/trait';

class VisualService {
  getColor(trait: IVisualTrait | IMutation): THREE.Color {
    return new THREE.Color(trait.visual?.color || '#ffffff');
  }

  getScale(trait: IVisualTrait | IMutation): number {
    return trait.visual?.size || 1;
  }

  getUniforms(trait: IVisualTrait | IMutation): { [key: string]: any } {
    return {
      particleColor: { value: new THREE.Color(trait.visual?.color || '#ffffff') },
      glowIntensity: { value: trait.visual?.glowIntensity || 0 }
    };
  }
}

export const visualService = new VisualService();
```

#### Instanced Renderer
Renders particles with mutation-driven visuals.
```typescript
// src/domains/rendering/services/instancedRenderer.ts
import * as THREE from 'three';
import { visualService } from 'src/domains/traits/services/visualService';
import { shaderManager } from 'src/domains/rendering/services/shaderManager';

class InstancedRenderer {
  private mesh: THREE.InstancedMesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = shaderManager.getMaterial();
    this.mesh = new THREE.InstancedMesh(geometry, material, 500);
  }

  updateParticles(particles: IParticle[]) {
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      const trait = p.mutationTrait || p.visualTrait;
      dummy.scale.setScalar(visualService.getScale(trait));
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.mesh.setColorAt(i, visualService.getColor(trait));
      this.mesh.material.uniforms = visualService.getUniforms(trait);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }

  getMesh(): THREE.InstancedMesh {
    return this.mesh;
  }
}

export const instancedRenderer = new InstancedRenderer();
```

## Optimization Techniques
To ensure efficient visualization for 500 particles:
1. **Instanced Rendering**: Use `InstancedMesh` to render all particles in a single draw call, minimizing GPU overhead.
2. **Batch Updates**: Update instance attributes in a single loop to reduce CPU usage.
3. **Level of Detail (LOD)**: Apply simpler geometries for distant particles via `lodManager.ts`.
4. **Shader Optimization**: Minimize shader complexity in `shaderManager.ts` to reduce GPU workload.

## Performance Metrics
- **FPS**: Target ≥ 60 FPS for 500 particles.
- **Draw Calls**: Target ≤ 1 per creature using instanced rendering.
- **Frame Time**: Target ≤ 16.67ms per frame.
- **GPU Memory Usage**: Target < 50 MB for mutation visuals.

## Integration Points
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts`, `shaderManager.ts`, and `sceneManager.ts` handle visualization.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` provides mutation and state data.
- **Traits Domain (`src/domains/traits/`)**: `visualService.ts` maps `IMutation` visual properties.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data with mutation effects.
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` adjusts positions for mutation-driven pattern changes.

## Rules Adherence
- **Determinism**: Visuals are deterministic, based on static mutation traits and particle states.
- **Modularity**: Visualization logic is encapsulated in `instancedRenderer.ts` and `visualService.ts`.
- **Performance**: Optimized for 60 FPS with 500 particles, using instanced rendering and LOD.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Visualization Code**: Locate mutation rendering code (e.g., in `src/rendering/` or `src/creatures/`).
2. **Refactor into Renderer**: Move logic to `src/domains/rendering/services/instancedRenderer.ts` and `visualService.ts`.
3. **Integrate Evolution State**: Ensure `evolutionTracker.ts` provides mutation data for rendering.
4. **Test Visuals**: Validate mutation effects (e.g., MYTHIC glow) and performance using Three.js’s `Stats` module.
5. **Optimize Rendering**: Implement instanced rendering and LOD to meet performance targets.

## Example Test
```typescript
// tests/integration/evolutionVisualization.test.ts
describe('Evolution Visualization', () => {
  test('renders MYTHIC mutation glow for CORE particles', () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData);
    const mutation = { id: 'iron_core', rarity: Rarity.MYTHIC, visual: { color: '#00ff00', glowIntensity: 0.9, size: 1.2 } };
    creature.particles[0].mutationTrait = mutation;
    instancedRenderer.updateParticles(creature.particles);
    const color = new THREE.Color();
    instancedRenderer.getMesh().getColorAt(0, color);
    expect(color.getHex()).toBe(0x00ff00);
  });

  test('maintains 60 FPS for 500 particles with mutations', () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData, { particleCount: 500 });
    const mutation = { id: 'swift_stride', visual: { color: '#ff4500', glowIntensity: 0.7, size: 1.1 } };
    creature.particles.forEach(p => p.mutationTrait = mutation);
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      instancedRenderer.updateParticles(creature.particles);
      sceneManager.render(cameraService.getCamera());
    }
    const elapsed = performance.now() - start;
    const fps = 100 / (elapsed / 1000);
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```

