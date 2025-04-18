
# Formation Visualization

## Purpose
This document explains how formation patterns in Bitcoin Protozoa are visualized in the 3D environment, focusing on their integration with the rendering system to display role-specific arrangements (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE) for up to 500 particles per creature. It serves as a single source of truth for developers, tailored to the project’s particle-based design, role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and deterministic processes driven by Bitcoin block data, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/formation/formation_visualization.md`

## Overview
The formation system organizes particles into role-specific patterns, which are visualized using Three.js to create immersive 3D representations of creature structures. Managed by `instancedRenderer.ts` in the `rendering` domain and supported by `formationService.ts` in the `traits` domain, visualization leverages instanced rendering for efficiency and integrates visual traits (e.g., color, glow) to enhance formation appearance. The process is deterministic, relying on static particle positions and trait data, ensuring consistent visuals across runs. This document outlines the rendering workflow, optimization techniques, and integration points, ensuring modularity and performance (60 FPS for 500 particles).

## Visualization Workflow
The formation visualization process involves rendering particle positions defined by formation patterns, with the following steps:

1. **Retrieve Particle Data**:
   - Access `IParticle[]` data from the `creature` domain, including positions set by `formationService.ts` and visual traits.
2. **Map Formation Positions**:
   - Use `formationService.ts` to confirm particle positions align with the current `IFormationPattern` (e.g., “Shield Wall” positions DEFENSE particles in a ring).
3. **Apply Visual Traits**:
   - Use `visualService.ts` to map `IVisualTrait` properties (e.g., color, glowIntensity, size) to Three.js attributes.
4. **Configure InstancedMesh**:
   - Update `InstancedMesh` instance attributes (e.g., position, color, scale) in `instancedRenderer.ts` to reflect formation positions.
5. **Apply Shaders**:
   - Use `shaderManager.ts` to apply custom shaders for formation-specific effects (e.g., glowing CORE particles in “Cluster”).
6. **Render Scene**:
   - Integrate with `sceneManager.ts` to render the scene, ensuring formations are displayed in the rendering loop.

### Visual Trait Mapping
- **Color**: Sets `InstancedMesh` instance color or shader uniform (e.g., `#ff4500` for ATTACK particles in “Vanguard”).
- **Glow Intensity**: Configures shader uniform for glow effects (0 to 1, e.g., 0.8 for CORE in “Cluster”).
- **Size**: Scales instance matrix (e.g., 1.2x for DEFENSE in “Shield Wall”).
- **Role-Specific Visuals**: Each role has distinct cues (e.g., DEFENSE particles in “Shield Wall” have a metallic sheen).

### Example Formation Pattern
```json
// src/domains/traits/data/formationPatterns/defense.ts
{
  "id": "shield_wall",
  "name": "Shield Wall",
  "rarity": "RARE",
  "positions": [
    { "x": 1, "y": 0, "z": 0 },
    { "x": -1, "y": 0, "z": 0 },
    { "x": 0, "y": 1, "z": 0 },
    { "x": 0, "y": -1, "z": 0 }
  ]
}
```

## Implementation
The visualization is handled by `instancedRenderer.ts` and `visualService.ts`, with support from `shaderManager.ts` for advanced effects.

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
Renders particles with formation positions.
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
2. **Batch Updates**: Update instance attributes in a single loop to reduce CPU usage.
3. **Level of Detail (LOD)**: Apply simpler geometries for distant formations via `lodManager.ts`.
4. **Shader Optimization**: Minimize shader complexity in `shaderManager.ts` to reduce GPU workload.

## Performance Metrics
- **FPS**: Target ≥ 60 FPS for 500 particles.
- **Draw Calls**: Target ≤ 1 per creature using instanced rendering.
- **Frame Time**: Target ≤ 16.67ms per frame.
- **GPU Memory Usage**: Target < 50 MB for formation visuals.

## Integration Points
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts`, `shaderManager.ts`, and `sceneManager.ts` handle visualization.
- **Traits Domain (`src/domains/traits/`)**: `visualService.ts` applies `IVisualTrait` for formation-specific visuals.
- **Creature Domain (`src/domains/creature/`)**: Provides `IParticle` data with formation-defined positions.
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` supplies `IFormationPattern` for position data.

## Rules Adherence
- **Determinism**: Visuals are deterministic, based on static particle positions and trait data.
- **Modularity**: Visualization logic is encapsulated in `instancedRenderer.ts` and `visualService.ts`.
- **Performance**: Optimized for 60 FPS with 500 particles, using instanced rendering and LOD.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Visualization Code**: Locate particle rendering code (e.g., in `src/rendering/` or `src/creatures/`).
2. **Refactor into Renderer**: Move logic to `src/domains/rendering/services/instancedRenderer.ts` and `visualService.ts`.
3. **Integrate Formation Data**: Ensure `formationService.ts` provides position data for rendering.
4. **Test Visuals**: Validate formation appearances (e.g., “Shield Wall” ring) and performance using Three.js’s `Stats` module.
5. **Optimize Rendering**: Implement instanced rendering and LOD to meet performance targets.

## Example Test
```typescript
// tests/integration/formationVisualization.test.ts
describe('Formation Visualization', () => {
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

