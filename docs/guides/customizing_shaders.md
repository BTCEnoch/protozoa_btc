
# Customizing Visual Effects with Shaders

## Purpose
This guide provides instructions for creating and modifying Three.js shaders in Bitcoin Protozoa to customize visual effects for mutation traits and formation patterns, enhancing the visual appeal of creatures with up to 500 particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/customizing_shaders.md`

## Overview
Bitcoin Protozoa uses Three.js shaders to render dynamic visual effects for particles, such as glowing mutations (e.g., “Iron Core” MYTHIC glow) and formation-specific animations (e.g., “Spiral Charge” trail). Managed by `shaderManager.ts` and integrated with `instancedRenderer.ts` in the `rendering` domain, shaders enhance the immersive experience while maintaining 60 FPS. This guide covers creating new shaders, integrating them with mutation and formation visuals, optimizing for performance, and testing, building on our discussions about dynamic visuals and performance optimization [Timestamp: April 16, 2025, 21:41; April 14, 2025, 19:58]. It empowers developers to craft visually compelling effects that align with the project’s deterministic and performant design.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Dependencies**: Ensure `three` is installed (`npm install three`).
- **Familiarity**: Knowledge of GLSL (OpenGL Shading Language), Three.js, TypeScript, and the DDD structure (`src/domains/rendering/`).
- **Tools**: Chrome DevTools for GPU profiling, Three.js Stats for FPS monitoring, and Jest for testing.

## Creating a New Shader
This example creates a new shader, `pulseShader`, for the “Quantum Shift” mutation (MOVEMENT, EPIC), adding a pulsating glow effect to enhance its speed-based visual identity.

### Steps
1. **Define Shader Files**:
   - Create vertex and fragment shader files in `src/domains/rendering/shaders/` (e.g., `pulseVertex.glsl`, `pulseFragment.glsl`).
   - Vertex shader handles particle positions; fragment shader defines color and effects.
2. **Write Shader Code**:
   - Implement GLSL code for the pulsating glow, using uniforms for customization (e.g., `glowIntensity`, `pulseSpeed`).
   - Ensure compatibility with `InstancedMesh` for efficient rendering of 500 particles.
3. **Update Shader Manager**:
   - Modify `shaderManager.ts` to load and manage the new shader, providing uniforms for mutation-specific effects.
4. **Integrate with Renderer**:
   - Update `instancedRenderer.ts` to apply the shader to particles with the “Quantum Shift” mutation.
5. **Test and Optimize**:
   - Test visuals locally, profile GPU usage, and optimize shader complexity to maintain 60 FPS.

### Example Shader Code
#### Vertex Shader
```glsl
// src/domains/rendering/shaders/pulseVertex.glsl
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
```

#### Fragment Shader
```glsl
// src/domains/rendering/shaders/pulseFragment.glsl
uniform vec3 particleColor;
uniform float glowIntensity;
uniform float pulseSpeed;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // Pulsating glow effect
  float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
  vec3 glow = particleColor * glowIntensity * pulse;
  float distance = length(vUv - vec2(0.5)); // Fade from center
  float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
  gl_FragColor = vec4(glow, alpha);
}
```

### Example Shader Manager
```typescript
// src/domains/rendering/services/shaderManager.ts
import * as THREE from 'three';
import pulseVertex from '../shaders/pulseVertex.glsl';
import pulseFragment from '../shaders/pulseFragment.glsl';

class ShaderManager {
  private materials: Map<string, THREE.ShaderMaterial> = new Map();

  getMaterial(shaderType: string = 'default'): THREE.ShaderMaterial {
    if (!this.materials.has(shaderType)) {
      const material = new THREE.ShaderMaterial({
        vertexShader: pulseVertex,
        fragmentShader: pulseFragment,
        uniforms: {
          particleColor: { value: new THREE.Color('#aaffff') }, // Quantum Shift color
          glowIntensity: { value: 0.7 },
          pulseSpeed: { value: 2.0 },
          time: { value: 0.0 }
        },
        transparent: true
      });
      this.materials.set(shaderType, material);
    }
    return this.materials.get(shaderType)!;
  }

  updateTime(delta: number) {
    this.materials.forEach(material => {
      material.uniforms.time.value += delta;
    });
  }
}

export const shaderManager = new ShaderManager();
```

### Integration with Renderer
```typescript
// src/domains/rendering/services/instancedRenderer.ts
class InstancedRenderer {
  private mesh: THREE.InstancedMesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = shaderManager.getMaterial('pulse');
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
      if (trait?.effect === 'quantum_shift') {
        this.mesh.material.uniforms.particleColor.value.set(trait.visual.color);
        this.mesh.material.uniforms.glowIntensity.value = trait.visual.glowIntensity;
      }
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  update(delta: number) {
    shaderManager.updateTime(delta); // Update time for pulse effect
  }
}
```

## Optimizing Shader Performance
Shaders must be optimized to maintain 60 FPS for 500 particles, especially with complex effects like pulsating glows.

### Techniques
1. **Minimize Uniforms**:
   - Use only essential uniforms (e.g., `particleColor`, `glowIntensity`) to reduce GPU overhead.
   - Example: Avoid redundant uniforms like unused texture samplers.
2. **Simplify Calculations**:
   - Reduce fragment shader complexity (e.g., use `sin` instead of complex noise functions).
   - Example: Limit `pulseShader` to basic trigonometric functions for pulsation.
3. **Batch Rendering**:
   - Use `InstancedMesh` in `instancedRenderer.ts` to render all particles in a single draw call.
   - Example: Ensure `pulseShader` supports instanced attributes for efficiency.
4. **Profile GPU Usage**:
   - Use Chrome DevTools **Performance** tab with **GPU** profiling enabled to identify shader bottlenecks.
   - Example: Check if `pulseFragment.glsl` causes GPU spikes during animation.
5. **Conditional Effects**:
   - Apply complex shaders only to particles with specific traits (e.g., “Quantum Shift”).
   - Example: Use a default shader for non-mutated particles.

### Example Optimization
```glsl
// Optimized pulseFragment.glsl
uniform vec3 particleColor;
uniform float glowIntensity;
uniform float time;

varying vec2 vUv;

void main() {
  float pulse = sin(time * 2.0) * 0.5 + 0.5; // Simplified pulse
  vec3 glow = particleColor * glowIntensity * pulse;
  float alpha = 1.0 - smoothstep(0.3, 0.5, length(vUv - vec2(0.5)));
  gl_FragColor = vec4(glow, alpha);
}
```

## Testing Shaders
Testing ensures shaders render correctly, perform efficiently, and integrate with mutation and formation systems.

### Steps
1. **Unit Tests**:
   - Test shader uniform updates in `tests/unit/shaderManager.test.ts`.
   - Mock `THREE.ShaderMaterial` to verify uniform values.
2. **Integration Tests**:
   - Test rendering in `tests/integration/renderingSystem.test.ts` to confirm visual effects (e.g., pulsating glow for “Quantum Shift”).
   - Verify FPS remains ≥ 60 with 500 particles.
3. **Visual Inspection**:
   - Run `npm run dev` and inspect visuals in Chrome, using **Rendering** tab’s **Paint Flashing** to check for unnecessary repaints.
4. **Performance Profiling**:
   - Use Three.js Stats to monitor FPS and DevTools **Performance** tab to profile GPU usage.

### Example Test
```typescript
// tests/integration/renderingSystem.test.ts
describe('Rendering System', () => {
  test('renders Quantum Shift pulse effect', () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData);
    const mutation = {
      id: 'quantum_shift',
      effect: 'speed_boost',
      stats: { speed: 0.2 },
      visual: { color: '#aaffff', glowIntensity: 0.7, size: 1.1 }
    };
    creature.particles[0].mutationTrait = mutation;
    instancedRenderer.updateParticles(creature.particles);
    const material = instancedRenderer.getMesh().material as THREE.ShaderMaterial;
    expect(material.uniforms.particleColor.value.getHex()).toBe(0xaaffff);
    expect(material.uniforms.glowIntensity.value).toBe(0.7);
  });

  test('maintains 60 FPS with pulse shader', () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData, { particleCount: 500 });
    creature.particles.forEach(p => {
      p.mutationTrait = { id: 'quantum_shift', visual: { color: '#aaffff', glowIntensity: 0.7 } };
    });
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

## Troubleshooting
1. **Shader Compilation Errors**:
   - **Symptom**: Three.js logs “GLSL compile error” in console.
   - **Solution**: Check GLSL syntax in `pulseVertex.glsl` and `pulseFragment.glsl` for errors (e.g., missing semicolons). Use `console.log(material.program.diagnostics)` for details.
2. **Visual Glitches**:
   - **Symptom**: Pulsating glow flickers or renders incorrectly.
   - **Solution**: Verify uniform updates in `shaderManager.ts` and instance attributes in `instancedRenderer.ts`. Ensure `time` uniform increments correctly.
   - **Debugging**: Use DevTools **Rendering** tab’s **Paint Flashing** to check repaints.
3. **Performance Drops**:
   - **Symptom**: FPS falls below 60 with “Quantum Shift” shader.
   - **Solution**: Simplify fragment shader calculations (e.g., reduce texture lookups) and profile GPU usage in DevTools **Performance** tab [Timestamp: April 14, 2025, 19:58].
4. **Incorrect Visuals**:
   - **Symptom**: Wrong color or glow for “Quantum Shift” particles.
   - **Solution**: Check `visualService.ts` for correct trait mapping and `instancedRenderer.ts` for uniform application.
   - **Debugging**: Log uniform values:
     ```typescript
     logger.debug(`Shader uniforms for particle ${p.id}:`, material.uniforms);
     ```

## Best Practices
- **Keep Shaders Simple**: Minimize GLSL operations to maintain 60 FPS (e.g., avoid complex loops).
- **Reuse Materials**: Cache `ShaderMaterial` instances in `shaderManager.ts` to reduce GPU overhead.
- **Test Across Devices**: Verify visuals on low-end devices (e.g., mobile browsers) to ensure compatibility.
- **Document Shaders**: Add comments in GLSL files and update `new_docs/systems/rendering/visualization.md` for new effects.


