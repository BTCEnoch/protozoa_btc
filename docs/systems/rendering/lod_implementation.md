
# Level of Detail (LOD) Implementation

## Purpose
This document provides detailed guidance on implementing Level of Detail (LOD) techniques in Bitcoin Protozoa to optimize rendering performance for distant or less critical particles. It serves as a single source of truth for developers, ensuring efficient rendering of up to 500 particles per creature while maintaining visual quality and achieving the target of 60 FPS.

## Location
`docs/rendering/lod_implementation.md`

## Overview
Level of Detail (LOD) is a performance optimization technique that reduces the complexity of rendered objects based on their distance from the camera. In Bitcoin Protozoa, LOD is applied to particles to simplify geometries or reduce rendering fidelity for distant particles, thereby improving frame rates and reducing GPU load. The implementation leverages Three.js’s `LOD` object and is designed to be modular, deterministic, and integrated with the rendering pipeline.

## LOD Concepts
- **Principle**: Objects farther from the camera require less detail, as they occupy fewer pixels on the screen.
- **Application**: For each particle, multiple levels of detail are defined (e.g., high-detail, medium-detail, low-detail), with simpler geometries or materials used at greater distances.
- **Benefits**: Reduces draw calls, vertex processing, and shader complexity, improving performance without significant visual degradation.

## Implementation
The LOD system is implemented within the `rendering` domain, primarily through the `lodManager.ts` service, which manages `LOD` objects for particles. Each particle has multiple representations, switched based on camera distance.

### Steps to Implement LOD
1. **Define LOD Levels**:
   - Create multiple geometries for particles (e.g., high-detail sphere with 32 segments, low-detail sphere with 8 segments).
   - Assign materials with varying complexity (e.g., detailed shader vs. basic color).
2. **Configure LOD Object**:
   - Use Three.js’s `LOD` class to associate geometries and materials with distance thresholds.
3. **Integrate with Rendering Pipeline**:
   - Add `LOD` objects to the scene and update them based on camera position.
4. **Optimize Updates**:
   - Minimize updates to `LOD` objects by batching or caching distance calculations.

### Example LOD Setup
```typescript
// src/domains/rendering/services/lodManager.ts
import * as THREE from 'three';

class LODManager {
  private lod: THREE.LOD;

  constructor() {
    this.lod = new THREE.LOD();
    // High-detail level
    const highDetail = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    // Low-detail level
    const lowDetail = new THREE.Mesh(
      new THREE.SphereGeometry(1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.lod.addLevel(highDetail, 0); // Close (0-10 units)
    this.lod.addLevel(lowDetail, 10); // Far (10+ units)
  }

  update(camera: THREE.Camera) {
    this.lod.update(camera);
  }

  getLOD(): THREE.LOD {
    return this.lod;
  }
}

export const lodManager = new LODManager();
```

## Integration Points
- **Rendering Pipeline (`src/domains/rendering/`)**: The `lodManager.ts` updates `LOD` objects in the rendering loop, synchronized with `sceneManager.ts` and `cameraService.ts`.
- **Creature Domain (`src/domains/creature/`)**: Provides `IParticle` data to configure `LOD` levels for each particle.
- **Traits Domain (`src/domains/traits/`)**: Supplies visual traits (e.g., color, glow) to customize materials at different LOD levels.

## Rules Adherence
- **Determinism**: LOD levels are based on static distances and trait properties, ensuring consistent visuals across runs.
- **Modularity**: LOD logic is encapsulated in `lodManager.ts`, with clear interfaces for integration.
- **Performance**: Reduces rendering complexity for distant particles, contributing to the 60 FPS target.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Rendering Code**: Locate any rendering optimization code (e.g., in `src/rendering/` or related files) that may include LOD-like techniques.
2. **Implement LOD Manager**: Create `src/domains/rendering/services/lodManager.ts` to handle LOD configuration and updates.
3. **Integrate with Pipeline**: Update `sceneManager.ts` to add and update `LOD` objects in the rendering loop.
4. **Test Performance**: Use Three.js’s `Stats` module to measure FPS improvements with LOD enabled, ensuring no visual artifacts.

## Performance Metrics
- **FPS Improvement**: Expect a 20-30% FPS increase for scenes with many particles at varying distances.
- **Draw Calls**: Reduced by up to 50% for distant particles using simpler geometries.
- **Testing**: Profile with WebGL tools to confirm reduced GPU load.

## Example Integration
### Adding LOD to Scene
```typescript
// src/domains/rendering/services/sceneManager.ts
import * as THREE from 'three';
import { lodManager } from 'src/domains/rendering/services/lodManager';
import { cameraService } from 'src/domains/rendering/services/cameraService';

class SceneManager {
  private scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.add(lodManager.getLOD());
  }

  render() {
    lodManager.update(cameraService.getCamera());
    // Render scene
  }
}

export const sceneManager = new SceneManager();
```

