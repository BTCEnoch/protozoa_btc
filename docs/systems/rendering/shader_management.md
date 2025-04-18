
# Shader Management

## Purpose
This document provides comprehensive guidance on the creation, application, and optimization of custom shaders for visual effects in Bitcoin Protozoa. It serves as a single source of truth for developers and artists working on particle visualizations, ensuring efficient and consistent shader use within the rendering system.

## Location
`docs/rendering/shader_management.md`

## Overview
Shaders in Bitcoin Protozoa are used to create advanced visual effects for particles, such as glow, color gradients, and dynamic animations, leveraging Three.js’s `ShaderMaterial`. The shader management system is designed to be modular, performant, and deterministic, aligning with the project’s domain-driven design (DDD) principles. It ensures that visual traits (e.g., color, glow intensity) are applied consistently and optimized for rendering up to 500 particles per creature at 60 FPS.

## Shader Creation
Shaders are written in GLSL (OpenGL Shading Language) and consist of vertex and fragment shaders. The `shaderManager.ts` service handles shader creation, configuration, and integration with Three.js materials.

### Guidelines for Writing Shaders
1. **Keep Shaders Simple**: Minimize complex calculations to maintain performance.
2. **Use Uniforms for Trait Data**: Pass visual trait properties (e.g., color, glow) via uniforms.
3. **Support Instancing**: Ensure shaders work with `InstancedMesh` for efficient particle rendering.
4. **Ensure Determinism**: Avoid non-deterministic functions like `time` unless synchronized with block data.

### Example Shader Code
```glsl
// src/domains/rendering/shaders/particleVertex.glsl
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// src/domains/rendering/shaders/particleFragment.glsl
uniform vec3 particleColor;
uniform float glowIntensity;
void main() {
  gl_FragColor = vec4(particleColor, 1.0) + vec4(0.0, 0.0, glowIntensity, 0.0);
}
```

## Shader Application
Shaders are applied to particles via `ShaderMaterial` in Three.js, managed by the `shaderManager.ts` service. The service maps visual trait properties to shader uniforms and updates them dynamically based on creature state.

### Example Shader Application
```typescript
// src/domains/rendering/services/shaderManager.ts
import * as THREE from 'three';
import vertexShader from '../shaders/particleVertex.glsl';
import fragmentShader from '../shaders/particleFragment.glsl';

class ShaderManager {
  private material: THREE.ShaderMaterial;

  constructor() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        particleColor: { value: new THREE.Color(0xffffff) },
        glowIntensity: { value: 0.0 }
      }
    });
  }

  updateUniforms(trait: IVisualTrait) {
    this.material.uniforms.particleColor.value.set(trait.color);
    this.material.uniforms.glowIntensity.value = trait.glowIntensity;
  }

  getMaterial(): THREE.ShaderMaterial {
    return this.material;
  }
}

export const shaderManager = new ShaderManager();
```

## Optimization Techniques
To ensure shaders perform efficiently:
1. **Minimize Shader Complexity**: Reduce arithmetic operations in fragment shaders.
2. **Batch Uniform Updates**: Update uniforms for multiple particles in a single pass.
3. **Use Shared Materials**: Apply the same `ShaderMaterial` to multiple `InstancedMesh` instances.
4. **Profile Performance**: Use WebGL debugging tools to identify shader bottlenecks.

## Integration Points
- **Traits Domain (`src/domains/traits/`)**: Uses `IVisualTrait` from `src/domains/traits/types/visual.ts` to map visual properties to shader uniforms.
- **Creature Domain (`src/domains/creature/`)**: Provides `IParticle` data for shader-driven rendering.
- **Rendering Pipeline (`src/domains/rendering/`)**: Integrates with `particleRenderer.ts` to apply shaders during the rendering loop.

## Rules Adherence
- **Determinism**: Shaders use deterministic inputs (e.g., trait properties) to ensure consistent visuals across runs.
- **Modularity**: Shader logic is encapsulated in `shaderManager.ts`, with clear interfaces for integration.
- **Performance**: Optimized for rendering 500 particles at 60 FPS, leveraging instanced rendering and efficient uniform updates.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Shader Code**: Locate shader-related code (e.g., in `src/rendering/` or scattered files).
2. **Refactor into Shader Manager**: Move shader creation and management logic to `src/domains/rendering/services/shaderManager.ts`.
3. **Organize Shader Files**: Store GLSL files in a new `src/domains/rendering/shaders/` directory.
4. **Update Integration**: Ensure `particleRenderer.ts` and other rendering services use the new `shaderManager.ts`.
5. **Test Visuals**: Validate that particle effects (e.g., glow, color) render correctly and perform efficiently using Three.js’s `Stats` module.

## Example Integration
### Applying Shaders to Particles
```typescript
// src/domains/rendering/services/particleRenderer.ts
import { shaderManager } from 'src/domains/rendering/services/shaderManager';
import * as THREE from 'three';

class ParticleRenderer {
  private mesh: THREE.InstancedMesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    this.mesh = new THREE.InstancedMesh(geometry, shaderManager.getMaterial(), 500);
  }

  updateParticles(particles: IParticle[]) {
    particles.forEach((p, i) => {
      shaderManager.updateUniforms(p.visualTrait);
      // Update instance matrix
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

export const particleRenderer = new ParticleRenderer();
```


