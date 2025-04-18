
# Rendering Debugging and Profiling

## Purpose
This document outlines strategies and tools for debugging rendering issues and profiling performance in the Bitcoin Protozoa rendering system. It serves as a single source of truth for developers to diagnose and resolve problems, ensuring the system maintains visual quality, determinism, and performance (targeting 60 FPS for 500 particles per creature).

## Location
`docs/rendering/rendering_debugging.md`

## Overview
The rendering system in Bitcoin Protozoa, built with Three.js, is responsible for visualizing creatures and particles in a 3D environment. Debugging and profiling are critical to identify and fix issues like visual artifacts, performance bottlenecks, and inconsistent rendering. This document provides a structured approach to debugging common rendering problems, profiling performance, and validating visual consistency, aligning with the project’s domain-driven design (DDD) principles and performance goals.

## Common Rendering Issues
Below are common rendering issues, their causes, and solutions:

1. **Z-Fighting**
   - **Cause**: Overlapping geometry at the same depth causes flickering.
   - **Solution**: Adjust particle positions slightly or increase the camera’s near clipping plane in `cameraService.ts`.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/cameraService.ts
     this.camera.near = 0.2; // Increase from 0.1 to reduce z-fighting
     this.camera.updateProjectionMatrix();
     ```

2. **Texture Artifacts**
   - **Cause**: Incorrect texture sampling or mipmapping in shaders.
   - **Solution**: Ensure proper texture filtering in `shaderManager.ts` or adjust mipmap settings.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/shaderManager.ts
     texture.minFilter = THREE.LinearMipmapLinearFilter;
     ```

3. **Performance Bottlenecks**
   - **Cause**: Excessive draw calls, unoptimized shaders, or frequent instance updates.
   - **Solution**: Use instanced rendering (`instancedRenderer.ts`), simplify shaders, or batch updates.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/instancedRenderer.ts
     if (particlesChanged) {
       this.updateParticles(particles); // Only update when necessary
     }
     ```

4. **Inconsistent Visuals**
   - **Cause**: Non-deterministic shader inputs or incorrect trait application.
   - **Solution**: Verify trait data in `visualService.ts` and ensure deterministic inputs in `shaderManager.ts`.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/shaderManager.ts
     material.uniforms.particleColor.value.set(trait.color); // Use deterministic trait color
     ```

## Debugging Tools
The following tools are recommended for debugging rendering issues:
1. **Three.js Inspector**: A Chrome extension for inspecting scenes, objects, and materials in real-time.
   - **Usage**: Enable in Chrome DevTools to view the scene hierarchy and debug object properties.
2. **Browser DevTools**: Use the Performance tab to record rendering timelines and identify bottlenecks.
   - **Usage**: Record a session while interacting with the scene to analyze frame times.
3. **WebGL Debug Tools**: Use `WEBGL_debug_shaders` to inspect compiled shader code.
   - **Usage**: Enable in browser settings to debug shader compilation errors.

## Profiling Performance
Profiling helps identify and optimize performance bottlenecks. Key metrics include:
- **Frame Rate (FPS)**: Target 60 FPS for 500 particles.
- **Draw Calls**: Aim for minimal draw calls (e.g., 1 per creature with instanced rendering).
- **GPU Memory Usage**: Keep memory usage low to avoid crashes on lower-end devices.

### Profiling Tools
1. **Three.js Stats Module**:
   - Measures FPS, frame time, and memory usage.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/sceneManager.ts
     import Stats from 'three/examples/jsm/libs/stats.module.js';

     class SceneManager {
       private stats: Stats;

       constructor() {
         this.stats = new Stats();
         document.body.appendChild(this.stats.dom);
       }

       render() {
         this.stats.begin();
         // Rendering code
         this.stats.end();
       }
     }
     ```
2. **Chrome DevTools Performance Tab**:
   - Records detailed performance timelines, including CPU and GPU usage.
   - **Usage**: Start a recording, interact with the scene, and analyze frame drops.
3. **Spectra.js**: A WebGL debugging tool for profiling shader performance.
   - **Usage**: Integrate with Three.js to measure shader execution times.

### Example Workflow for Profiling
1. Enable the Three.js `Stats` module to monitor FPS.
2. Record a performance session in Chrome DevTools while rendering a creature with 500 particles.
3. Analyze the timeline for high frame times, focusing on rendering-related functions (e.g., `updateParticles`).
4. Optimize identified bottlenecks (e.g., reduce shader complexity, batch instance updates).
5. Repeat profiling to confirm improvements.

## Validating Visual Consistency
To ensure deterministic rendering:
1. **Test with Fixed Inputs**: Use the same block nonce and creature data to verify identical visuals across runs.
   - **Example**: Test with a known block nonce (e.g., 12345) and check particle colors and positions.
2. **Compare Screenshots**: Capture screenshots from different runs and compare pixel differences.
3. **Log Shader Uniforms**: Log uniform values in `shaderManager.ts` to confirm consistency.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/shaderManager.ts
     console.log('Uniforms:', material.uniforms.particleColor.value);
     ```

## Integration Points
- **Rendering Pipeline (`src/domains/rendering/`)**: Debugging integrates with `sceneManager.ts`, `cameraService.ts`, and `instancedRenderer.ts` to trace issues through the pipeline.
- **Creature Domain (`src/domains/creature/`)**: Validates particle data (`IParticle`) for rendering issues.
- **Traits Domain (`src/domains/traits/`)**: Checks visual traits (`IVisualTrait`) for correct application in shaders.

## Rules Adherence
- **Determinism**: Debugging ensures visuals remain consistent by verifying deterministic inputs.
- **Modularity**: Debugging tools and strategies are encapsulated within the rendering domain, with clear interfaces.
- **Performance**: Profiling identifies bottlenecks to maintain the 60 FPS target.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Debugging Code**: Locate any rendering debugging or profiling logic (e.g., in `src/rendering/` or scattered files).
2. **Integrate Debugging Tools**: Add support for Three.js `Stats` and WebGL debug tools in `sceneManager.ts` or a dedicated debugging service.
3. **Refactor for New Structure**: Move debugging logic to `src/domains/rendering/` and update references to use new services like `instancedRenderer.ts`.
4. **Test Debugging Workflow**: Validate that issues like z-fighting or performance drops can be identified and resolved using the documented tools.

## Example Debugging Session
```typescript
// src/domains/rendering/services/sceneManager.ts
import Stats from 'three/examples/jsm/libs/stats.module.js';

class SceneManager {
  private stats: Stats;
  private debug: boolean = false;

  constructor() {
    this.stats = new Stats();
    if (this.debug) {
      document.body.appendChild(this.stats.dom);
    }
  }

  render() {
    if (this.debug) {
      this.stats.begin();
      console.log('Rendering frame with', this.scene.children.length, 'objects');
    }
    // Rendering code
    if (this.debug) {
      this.stats.end();
    }
  }
}

export const sceneManager = new SceneManager();
```


