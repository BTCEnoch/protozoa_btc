
# Particle Visualization and Rendering

## Purpose
This document explains how particles in Bitcoin Protozoa are visualized in the 3D environment, focusing on their integration with the rendering system to display role-specific and trait-driven appearances. It serves as a single source of truth for developers, ensuring that particle visualization is deterministic, performant, and visually consistent, supporting the project’s domain-driven design (DDD) principles.

## Location
`new_docs/systems/particle/particle_visualization.md`

## Overview
Particles in Bitcoin Protozoa, forming creatures with up to 500 particles, are visualized using Three.js, leveraging instanced rendering for efficiency and custom shaders for dynamic effects. The visualization process, managed by `instancedRenderer.ts` and `visualService.ts`, applies visual traits (e.g., color, glow, size) to particles based on their roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and ensures deterministic rendering tied to Bitcoin block data. This document details the rendering workflow, optimization techniques, and integration points, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Visualization Workflow
The particle visualization process involves the following steps:

1. **Retrieve Particle Data**:
   - Access `IParticle` data from the `creature` domain, including position, role, and visual traits.
2. **Map Visual Traits**:
   - Use `visualService.ts` to translate `IVisualTrait` properties (e.g., color, glowIntensity) to Three.js attributes.
3. **Configure InstancedMesh**:
   - Update `InstancedMesh` instance attributes (e.g., position, color, scale) in `instancedRenderer.ts`.
4. **Apply Shaders**:
   - Use `shaderManager.ts` to apply custom shaders for effects like glow or color gradients.
5. **Render Scene**:
   - Integrate with `sceneManager.ts` to render the scene, ensuring particles are displayed in the rendering loop.

### Visual Trait Mapping
- **Color**: Sets `InstancedMesh` instance color or shader uniform (e.g., `#ff4500` for fiery particles).
- **Glow Intensity**: Configures shader uniform for glow effect (0 to 1).
- **Size**: Scales instance matrix or geometry (e.g., 1.2x default size).
- **Role-Specific Visuals**: Each role has distinct visual cues (e.g., CORE particles may have a brighter glow).

### Example Visual Trait
```json
// src/domains/traits/data/visualPatterns/core.ts
{
  "id": "visual_001",
  "name": "Core Glow",
  "rarity": "RARE",
  "color": "#00ff00",
  "glowIntensity": 0.8,
  "size": 1.2
}
```

## Implementation
The visualization is primarily handled by `instancedRenderer.ts` and `visualService.ts`, with support from `shaderManager.ts` for advanced effects.

### Example Visualization Code
#### Visual Service
Maps visual traits to rendering attributes.
```typescript
// src/domains/traits/services/visualService.ts
import * as THREE from 'three';
import { IVisualTrait } from 'src/domains/traits/types/visual';

class VisualService {
  getColor(trait: IVisualTrait): THREE.Color {
    return new THREE.Color(trait.color);
  }

  getScale(trait: IVisualTrait): number {
    return trait.size || 1;
  }

  getUniforms(trait: IVisualTrait): { [key: string]: any } {
    return {
      particleColor: { value: new THREE.Color(trait.color) },
      glowIntensity: { value: trait.glowIntensity || 0 }
    };
  }
}

export const visualService = new VisualService();
```

#### Instanced Renderer
Applies particle visuals to `InstancedMesh`.
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
      dummy.scale.setScalar(visualService.getScale(p.visualTrait));
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.mesh.setColorAt(i, visualService.getColor(p.visualTrait));
      // Update shader uniforms if needed
      this.mesh.material.uniforms = visualService.getUniforms(p.visualTrait);
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
2. **Batch Updates**: Update instance attributes (e.g., position, color) in a single loop to reduce CPU usage.
3. **Level of Detail (LOD)**: Apply simpler geometries or shaders for distant particles via `lodManager.ts`.
4. **Shader Optimization**: Minimize shader complexity in `shaderManager.ts` to reduce GPU workload.

## Performance Metrics
- **FPS**: Target ≥ 60 FPS for 500 particles.
- **Draw Calls**: Target ≤ 1 per creature using instanced rendering.
- **Frame Time**: Target ≤ 16.67ms per frame.
- **GPU Memory Usage**: Target < 50 MB for particle visuals.

## Integration Points
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts`, `shaderManager.ts`, and `sceneManager.ts` handle visualization.
- **Creature Domain (`src/domains/creature/`)**: Provides `IParticle` data with position and trait references.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IVisualTrait` data via `visualService.ts` for rendering attributes.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: Ensures deterministic trait assignment via block nonce.

## Rules Adherence
- **Determinism**: Visuals are deterministic, based on static particle and trait data.
- **Modularity**: Visualization logic is encapsulated in `instancedRenderer.ts` and `visualService.ts`.
- **Performance**: Optimized for 60 FPS with 500 particles, using instanced rendering and batch updates.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Visualization Code**: Locate particle rendering code (e.g., in `src/rendering/` or `src/creatures/`).
2. **Refactor into Renderer**: Move logic to `src/domains/rendering/services/instancedRenderer.ts` and `visualService.ts`.
3. **Integrate with Pipeline**: Update `sceneManager.ts` to use `instancedRenderer.ts` for particle updates.
4. **Test Visuals**: Validate particle appearances (e.g., colors, glows) and performance using Three.js’s `Stats` module.
5. **Optimize Rendering**: Ensure instanced rendering and LOD are fully implemented to meet performance targets.

## Example Test
```typescript
// tests/integration/particleVisualization.test.ts
describe('Particle Visualization', () => {
  test('renders particle with correct visual trait', () => {
    const blockData = createMockBlockData(12345);
    const particle = particleService.createParticles(1, blockData)[0];
    instancedRenderer.updateParticles([particle]);
    const color = new THREE.Color();
    instancedRenderer.getMesh().getColorAt(0, color);
    expect(color.getHex()).toBe(particle.visualTrait.color);
  });

  test('maintains 60 FPS for 500 particles', () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      instancedRenderer.updateParticles(particles);
      sceneManager.render(cameraService.getCamera());
    }
    const elapsed = performance.now() - start;
    const fps = 100 / (elapsed / 1000);
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```


