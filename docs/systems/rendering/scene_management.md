
# Scene Management

## Purpose
This document provides a comprehensive guide for managing the Three.js scene in Bitcoin Protozoa, including object addition/removal, lighting setup, and optimization strategies. It serves as a single source of truth for developers to organize and maintain the scene, ensuring efficient rendering and consistent visuals for creatures and their particles.

## Location
`docs/rendering/scene_management.md`

## Overview
The scene management system in Bitcoin Protozoa is responsible for maintaining the Three.js `Scene` object, which contains all visual elements (e.g., particles, lights) rendered in the 3D environment. Managed by the `sceneManager.ts` service, it handles object lifecycle, lighting, and performance optimizations like frustum culling. The system is modular, deterministic, and integrates with other domains (e.g., `creature`, `traits`) to support the project’s domain-driven design (DDD) principles and performance goals (60 FPS for 500 particles).

## Scene Structure
The scene is structured as a hierarchy of objects:
- **Root Scene**: The top-level `Scene` object containing all visual elements.
- **Lights**: Ambient and directional lights to illuminate particles.
- **Particle Meshes**: `InstancedMesh` objects representing particles, grouped by creature.
- **Auxiliary Objects**: Optional elements like backgrounds or debug visuals.

### Lighting Setup
- **Ambient Light**: Provides uniform illumination to ensure all particles are visible.
  - **Settings**: Color: `0xffffff`, Intensity: 0.5
- **Directional Light**: Simulates a primary light source for depth and shadows.
  - **Settings**: Color: `0xffffff`, Intensity: 0.7, Position: (10, 10, 10)

## Implementation
The `sceneManager.ts` service manages the scene lifecycle, including initialization, object management, and rendering updates.

### Key Responsibilities
1. **Scene Initialization**:
   - Create the `Scene` object and configure initial lights.
   - Set up background (e.g., solid color or texture).
2. **Object Management**:
   - Add/remove `InstancedMesh` objects for creatures.
   - Handle auxiliary objects (e.g., debug grids).
3. **Optimization**:
   - Enable frustum culling to skip rendering off-screen objects.
   - Batch object updates to minimize CPU overhead.
4. **Rendering Loop Integration**:
   - Update scene objects and render frames in sync with the camera.

### Example Scene Setup
```typescript
// src/domains/rendering/services/sceneManager.ts
import * as THREE from 'three';

class SceneManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas') });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(ambientLight, directionalLight);
  }

  addObject(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  render(camera: THREE.Camera) {
    this.renderer.render(this.scene, camera);
  }
}

export const sceneManager = new SceneManager();
```

## Optimization Techniques
To ensure performance:
1. **Frustum Culling**: Enable by default on `InstancedMesh` to skip rendering off-screen particles.
   ```typescript
   this.mesh.frustumCulled = true;
   ```
2. **Batch Updates**: Update multiple objects in a single loop to reduce overhead.
3. **Minimize Scene Changes**: Only add/remove objects when necessary (e.g., when creatures change).
4. **Optimize Lighting**: Use a minimal number of lights (e.g., one ambient, one directional) to reduce shader complexity.

## Integration Points
- **Rendering Pipeline (`src/domains/rendering/`)**: The scene is updated and rendered in the loop managed by `sceneManager.ts`, integrating with `cameraService.ts` and `instancedRenderer.ts`.
- **Creature Domain (`src/domains/creature/`)**: Provides `IParticle` and `ICreature` data for adding particle meshes to the scene.
- **Traits Domain (`src/domains/traits/`)**: Supplies visual traits for material and shader configurations via `visualService.ts`.

## Rules Adherence
- **Determinism**: Scene content is deterministic, relying on static creature and trait data.
- **Modularity**: Scene management is encapsulated in `sceneManager.ts`, with clear interfaces for object addition/removal.
- **Performance**: Optimized with frustum culling and minimal updates to support 60 FPS for 500 particles.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Scene Logic**: Locate scene-related code (e.g., in `src/rendering/` or scattered files).
2. **Refactor into Scene Manager**: Move logic to `src/domains/rendering/services/sceneManager.ts`, consolidating scene setup and object management.
3. **Integrate with Pipeline**: Ensure `sceneManager.ts` handles rendering loop updates, coordinating with `cameraService.ts` and `instancedRenderer.ts`.
4. **Test Scene Integrity**: Validate that creatures, lights, and particle meshes render correctly, checking for performance using Three.js’s `Stats` module.

## Example Integration
### Adding Particle Mesh to Scene
```typescript
// src/domains/rendering/services/sceneManager.ts
import { instancedRenderer } from 'src/domains/rendering/services/instancedRenderer';

class SceneManager {
  private scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.add(instancedRenderer.getMesh());
  }

  updateParticles(particles: IParticle[]) {
    instancedRenderer.updateParticles(particles);
  }
}
```

