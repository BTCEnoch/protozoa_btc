
# Rendering Optimization

## Overview
The Rendering System in Bitcoin Protozoa is responsible for visualizing creatures and their particles in a 3D environment using Three.js. Given the need to render up to 500 particles per creature efficiently, optimization is crucial to maintain smooth performance (e.g., 60 FPS) while ensuring the system remains modular and deterministic. This document outlines key optimization strategies for the rendering system, details how to refactor the current GitHub build into the new DDD structure, and provides a single source of truth for rendering optimizations.

## Optimization Goals
- **Performance**: Achieve and maintain 60 FPS for creatures with up to 500 particles.
- **Memory Usage**: Minimize memory consumption for rendering large particle systems.
- **Determinism**: Ensure rendering is consistent and reproducible across different runs.
- **Modularity**: Keep rendering logic encapsulated within the `rendering` domain, integrating cleanly with other domains (e.g., `creature`, `traits`).

## Optimization Techniques
The following techniques are recommended for optimizing the rendering system:

### 1. Instanced Rendering
- **Purpose**: Render multiple particles with a single draw call using Three.js’s `InstancedMesh`.
- **Benefit**: Reduces GPU overhead by batching similar objects.
- **Implementation**:
  - Use `InstancedMesh` for particles sharing the same geometry and material.
  - Update particle positions and properties via instance attributes.
- **Example**:
  ```typescript
  // src/domains/rendering/services/instancedRenderer.ts
  import * as THREE from 'three';

  class InstancedRenderer {
    private mesh: THREE.InstancedMesh;

    constructor(geometry: THREE.BufferGeometry, material: THREE.Material, count: number) {
      this.mesh = new THREE.InstancedMesh(geometry, material, count);
    }

    updateParticles(particles: IParticle[]) {
      const dummy = new THREE.Object3D();
      particles.forEach((p, i) => {
        dummy.position.set(p.position[0], p.position[1], p.position[2]);
        dummy.updateMatrix();
        this.mesh.setMatrixAt(i, dummy.matrix);
      });
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  ```

### 2. Level of Detail (LOD)
- **Purpose**: Reduce rendering complexity for distant particles.
- **Benefit**: Improves frame rates by simplifying geometry or reducing particle count at a distance.
- **Implementation**:
  - Use Three.js’s `LOD` object to switch between different levels of detail based on camera distance.
- **Example**:
  ```typescript
  // src/domains/rendering/services/lodManager.ts
  import * as THREE from 'three';

  class LODManager {
    private lod: THREE.LOD;

    constructor() {
      this.lod = new THREE.LOD();
      // Add levels with different geometries or particle counts
    }

    update(camera: THREE.Camera) {
      this.lod.update(camera);
    }
  }
  ```

### 3. Efficient Scene Management
- **Purpose**: Minimize scene updates and optimize rendering pipeline.
- **Benefit**: Reduces CPU and GPU workload.
- **Implementation**:
  - Use frustum culling to skip rendering off-screen particles.
  - Batch updates to particle positions and properties.
- **Example**:
  ```typescript
  // src/domains/rendering/services/sceneManager.ts
  class SceneManager {
    private scene: THREE.Scene;

    constructor() {
      this.scene = new THREE.Scene();
    }

    updateParticles(particles: IParticle[]) {
      // Efficiently update particle positions in the scene
    }
  }
  ```

### 4. Shader Optimization
- **Purpose**: Optimize custom shaders for particle effects.
- **Benefit**: Reduces GPU computation per frame.
- **Implementation**:
  - Minimize calculations in fragment shaders.
  - Use vertex shaders for transformations where possible.
- **Example**:
  ```glsl
  // Example vertex shader
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

  // Example fragment shader
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }
  ```

## Integration with New DDD Structure
The rendering logic is centralized in the `rendering` domain under `src/domains/rendering/`, ensuring modularity and clear separation of concerns.

### Directory Structure
```
src/domains/rendering/
├── types/
│   ├── instanced.ts        # Types for instanced rendering
│   ├── shaders.ts          # Shader interface definitions
│   ├── lod.ts              # LOD type definitions
│   ├── buffers.ts          # Buffer geometry types
│   └── index.ts            # Rendering types exports
├── services/
│   ├── instancedRenderer.ts # Instanced rendering service
│   ├── particleRenderer.ts  # Particle rendering service
│   ├── shaderManager.ts     # Shader management service
│   ├── lodManager.ts        # LOD management service
│   └── index.ts             # Rendering services exports
├── components/
│   ├── ParticleRenderer/    # Particle rendering component
│   └── index.ts             # Rendering components exports
└── index.ts                 # Rendering domain exports
```

### Migration of Existing Resources
The current GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) contains rendering-related code that needs refactoring:
- **Rendering Logic**: Move Three.js rendering code (e.g., from `src/rendering/` or scattered files) into `services/*.ts` and `components/*.tsx`.
- **Optimization Logic**: Extract any existing optimization techniques (e.g., instancing, LOD) into the new services.

### Code Examples
#### Instanced Renderer Service
Handles instanced rendering for particles.
```typescript
// src/domains/rendering/services/instancedRenderer.ts
import * as THREE from 'three';

class InstancedRenderer {
  private mesh: THREE.InstancedMesh;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, count: number) {
    this.mesh = new THREE.InstancedMesh(geometry, material, count);
  }

  updateParticles(particles: IParticle[]) {
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
```

#### Particle Renderer Component
Uses the instanced renderer to display particles.
```typescript
// src/domains/rendering/components/ParticleRenderer.tsx
import React from 'react';
import { useThree } from '@react-three/fiber';
import { instancedRenderer } from 'src/domains/rendering/services/instancedRenderer';

export const ParticleRenderer = ({ particles }) => {
  const { scene } = useThree();
  useEffect(() => {
    instancedRenderer.updateParticles(particles);
    scene.add(instancedRenderer.mesh);
    return () => scene.remove(instancedRenderer.mesh);
  }, [particles]);
  return null;
};
```

## Rules Adherence
- **Determinism**: Rendering is consistent across runs, relying on static data and creature properties.
- **Modularity**: Optimization logic is encapsulated within the `rendering` domain, avoiding tight coupling.
- **Performance**: Techniques like instanced rendering and LOD are used to meet performance targets.

## Migration Steps
To transition from the current GitHub structure:
1. **Refactor Rendering Code**: Move existing Three.js rendering logic to `services/*.ts` and `components/*.tsx` under `src/domains/rendering/`.
2. **Implement Optimization Services**: Create new services (e.g., `instancedRenderer.ts`, `lodManager.ts`) based on optimization techniques.
3. **Update Integration**: Ensure the `ParticleRenderer` component uses the new services.
4. **Test Performance**: Validate that optimizations achieve the desired frame rates and memory usage with tools like Three.js’s `Stats` module.



