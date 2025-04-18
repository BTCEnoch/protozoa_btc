
# Rendering Integration with Traits

## Purpose
This document explains how the rendering system in Bitcoin Protozoa integrates with the trait system to apply visual traits, such as colors, glow effects, and particle sizes, to creatures and their particles. It serves as a single source of truth for developers, ensuring seamless integration between the `rendering` and `traits` domains, maintaining visual consistency, and supporting performance goals (60 FPS for 500 particles).

## Location
`docs/rendering/trait_integration.md`

## Overview
The trait system in Bitcoin Protozoa defines properties for particles, with visual traits controlling their appearance (e.g., color, glow intensity, size). The rendering system, built with Three.js, uses these traits to customize particle visuals, ensuring that each particle reflects its assigned characteristics. This integration is managed through services like `visualService.ts` and `instancedRenderer.ts`, designed to be modular, deterministic, and optimized within the project’s domain-driven design (DDD) framework.

## Mapping Visual Traits to Rendering Attributes
Visual traits are defined in `src/domains/traits/types/visual.ts` and include properties like:
- `color`: Hex or RGB color value for particle appearance.
- `glowIntensity`: Strength of glow effect (0 to 1).
- `size`: Scale factor for particle geometry.

These properties are mapped to Three.js rendering attributes:
- **Color**: Applied to `InstancedMesh` instance colors or material uniforms.
- **Glow Intensity**: Passed to custom shaders as a uniform for glow effects.
- **Size**: Used to scale instance matrices or adjust geometry.

### Example Visual Trait
```typescript
// src/domains/traits/types/visual.ts
export interface IVisualTrait {
  id: string;
  name: string;
  rarity: Rarity;
  color: string; // e.g., "#ff4500"
  glowIntensity: number; // e.g., 0.8
  size: number; // e.g., 1.2
}
```

## Integration Workflow
The integration process involves the following steps:
1. **Trait Assignment**: During creature generation, particles are assigned visual traits via `traitService.ts`.
2. **Data Retrieval**: The rendering system retrieves visual trait data from particles (`IParticle`) provided by the `creature` domain.
3. **Attribute Mapping**: The `visualService.ts` maps trait properties to Three.js attributes (e.g., color, uniforms).
4. **Rendering Update**: The `instancedRenderer.ts` applies these attributes to `InstancedMesh` instances during the rendering loop.

### Example Integration Code
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

  getUniforms(trait: IVisualTrait): { [key: string]: any } {
    return {
      particleColor: { value: new THREE.Color(trait.color) },
      glowIntensity: { value: trait.glowIntensity }
    };
  }

  getScale(trait: IVisualTrait): number {
    return trait.size || 1;
  }
}

export const visualService = new VisualService();
```

#### Instanced Renderer
Applies visual traits to particle instances.
```typescript
// src/domains/rendering/services/instancedRenderer.ts
import * as THREE from 'three';
import { visualService } from 'src/domains/traits/services/visualService';

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

  getMesh(): THREE.InstancedMesh {
    return this.mesh;
  }
}

export const instancedRenderer = new InstancedRenderer();
```

## Performance Considerations
To ensure performance while integrating traits:
1. **Batch Trait Updates**: Update all instance attributes in a single pass to minimize CPU overhead.
2. **Cache Trait Mappings**: Store frequently accessed trait-to-attribute mappings in `visualService.ts` to avoid redundant calculations.
3. **Optimize Shader Uniforms**: Use shared uniforms for particles with similar traits to reduce GPU workload.
4. **Limit Dynamic Updates**: Only update instance colors or scales when traits change, using dirty flags.

## Integration Points
- **Traits Domain (`src/domains/traits/`)**: Provides `IVisualTrait` data via `visualService.ts` for rendering attributes.
- **Creature Domain (`src/domains/creature/`)**: Supplies `IParticle` objects containing visual trait references.
- **Rendering Pipeline (`src/domains/rendering/`)**: Integrates with `sceneManager.ts` and `shaderManager.ts` to apply trait-driven visuals in the rendering loop.

## Rules Adherence
- **Determinism**: Visual traits are applied consistently based on static particle and trait data, ensuring identical visuals across runs.
- **Modularity**: Trait integration is encapsulated in `visualService.ts` and `instancedRenderer.ts`, with clear interfaces.
- **Performance**: Optimized for minimal draw calls and efficient attribute updates, supporting the 60 FPS target.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Trait Rendering Code**: Locate code applying visual traits (e.g., in `src/rendering/` or `src/traits/`).
2. **Refactor into Visual Service**: Move trait-to-rendering logic to `src/domains/traits/services/visualService.ts`.
3. **Update Instanced Renderer**: Ensure `instancedRenderer.ts` uses `visualService.ts` for trait mappings.
4. **Integrate with Pipeline**: Update `sceneManager.ts` to include trait-driven updates in the rendering loop.
5. **Test Visuals**: Validate that particle appearances (e.g., colors, glows) match assigned traits using Three.js’s `Stats` for performance checks.

## Example Full Integration
### Scene Manager with Trait Integration
```typescript
// src/domains/rendering/services/sceneManager.ts
import * as THREE from 'three';
import { instancedRenderer } from 'src/domains/rendering/services/instancedRenderer';
import { cameraService } from 'src/domains/rendering/services/cameraService';

class SceneManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas') });
    this.scene.add(instancedRenderer.getMesh());
  }

  updateParticles(particles: IParticle[]) {
    instancedRenderer.updateParticles(particles);
  }

  render() {
    this.renderer.render(this.scene, cameraService.getCamera());
  }
}

export const sceneManager = new SceneManager();
```

