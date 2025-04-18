
# Instanced Rendering Techniques

## Purpose
This document provides in-depth guidance on implementing instanced rendering in Bitcoin Protozoa to efficiently render multiple particles with a single draw call, optimizing performance for creatures with up to 500 particles. It serves as a single source of truth for developers, ensuring consistent and high-performance rendering while maintaining visual quality.

## Location
`docs/rendering/instanced_rendering.md`

## Overview
Instanced rendering is a performance optimization technique that allows rendering multiple instances of the same geometry with a single draw call, leveraging Three.js’s `InstancedMesh`. In Bitcoin Protozoa, instanced rendering is critical for rendering large numbers of particles efficiently, achieving the target of 60 FPS. The implementation is modular, deterministic, and integrated with the rendering pipeline, aligning with the project’s domain-driven design (DDD) principles.

## Instanced Rendering Concepts
- **Principle**: Instead of rendering each particle as a separate mesh, instanced rendering uses a single mesh with instance-specific data (e.g., position, color) stored in buffers.
- **Benefits**: Reduces draw calls, minimizes GPU overhead, and lowers CPU-to-GPU data transfer, significantly improving performance for large particle systems.
- **Use Case**: Ideal for rendering 500 particles per creature, where each particle shares the same base geometry but varies in position, scale, or color.

## Implementation
The instanced rendering system is implemented within the `rendering` domain, primarily through the `instancedRenderer.ts` service, which manages `InstancedMesh` objects for particles. The implementation focuses on initializing, updating, and optimizing instance data.

### Steps to Implement Instanced Rendering
1. **Initialize InstancedMesh**:
   - Create a single `InstancedMesh` with a shared geometry (e.g., sphere) and material.
   - Set the instance count to match the maximum number of particles (e.g., 500).
2. **Configure Instance Attributes**:
   - Store per-instance data (e.g., position, color) in buffers or matrices.
   - Use custom attributes for dynamic properties like glow intensity.
3. **Update Instances**:
   - Update instance matrices or attributes based on particle data changes.
   - Minimize updates by batching or only updating changed instances.
4. **Integrate with Scene**:
   - Add the `InstancedMesh` to the scene and synchronize with the rendering loop.

### Example Instanced Rendering Setup
```typescript
// src/domains/rendering/services/instancedRenderer.ts
import * as THREE from 'three';

class InstancedRenderer {
  private mesh: THREE.InstancedMesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.InstancedMesh(geometry, material, 500);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Allow updates
  }

  updateParticles(particles: IParticle[]) {
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      dummy.scale.setScalar(p.scale || 1);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.mesh.setColorAt(i, new THREE.Color(p.color || 0xffffff));
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
To maximize performance:
1. **Minimize Instance Updates**: Only update instance data when particle properties change, using flags or dirty checks.
2. **Batch Updates**: Process all instance updates in a single loop to reduce CPU overhead.
3. **Use Efficient Attributes**: Store custom attributes (e.g., color) in buffers to avoid per-instance material changes.
4. **Optimize Geometry**: Use low-polygon geometries (e.g., 16x16 sphere segments) for particles.

## Integration Points
- **Rendering Pipeline (`src/domains/rendering/`)**: The `instancedRenderer.ts` integrates with `sceneManager.ts` to add the `InstancedMesh` to the scene and update it in the rendering loop.
- **Creature Domain (`src/domains/creature/`)**: Provides `IParticle` data for instance attributes like position and scale.
- **Traits Domain (`src/domains/traits/`)**: Supplies visual traits (e.g., color, glow) via `visualService.ts` to customize instance appearances.

## Rules Adherence
- **Determinism**: Instance data is derived from static particle and trait properties, ensuring consistent visuals across runs.
- **Modularity**: Instanced rendering logic is encapsulated in `instancedRenderer.ts`, with clear interfaces for integration.
- **Performance**: Reduces draw calls to a single call per creature, critical for achieving 60 FPS with 500 particles.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Rendering Code**: Locate particle rendering code (e.g., in `src/rendering/` or scattered files) that may use individual meshes or partial instancing.
2. **Implement Instanced Renderer**: Create `src/domains/rendering/services/instancedRenderer.ts` to centralize instanced rendering logic.
3. **Refactor Particle Rendering**: Replace individual mesh rendering with `InstancedMesh` usage, updating particle data handling.
4. **Integrate with Pipeline**: Ensure `sceneManager.ts` adds and updates the `InstancedMesh` in the rendering loop.
5. **Test Performance**: Use Three.js’s `Stats` module to verify FPS improvements and check for visual consistency.

## Performance Metrics
- **Draw Calls**: Reduced from 500 (one per particle) to 1 per creature with instanced rendering.
- **FPS Improvement**: Expect a 50-70% FPS increase for scenes with 500 particles.
- **Testing**: Profile with WebGL tools to confirm reduced GPU load and stable 60 FPS.

## Example Integration
### Adding InstancedMesh to Scene
```typescript
// src/domains/rendering/services/sceneManager.ts
import * as THREE from 'three';
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

export const sceneManager = new SceneManager();
```

