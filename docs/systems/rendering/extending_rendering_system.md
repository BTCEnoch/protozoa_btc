
# Extending the Rendering System

## Purpose
This document guides developers on extending the rendering system in Bitcoin Protozoa by adding new features or visual effects, such as advanced shaders or post-processing, without disrupting existing functionality. It serves as a single source of truth, ensuring the system remains flexible, modular, and aligned with the project’s domain-driven design (DDD) principles while maintaining performance (60 FPS for 500 particles) and visual consistency.

## Location
`docs/rendering/extending_rendering.md`

## Overview
The rendering system in Bitcoin Protozoa, built with Three.js, visualizes creatures and particles in a 3D environment. Its modular design, encapsulated within the `rendering` domain, supports extensions like new shaders, lighting effects, or post-processing pipelines (e.g., bloom, depth of field). This document provides steps to introduce new rendering features, best practices for maintaining compatibility, and guidelines for updating the rendering pipeline, ensuring scalability and future-proofing.

## Steps to Introduce New Rendering Features
Adding a new rendering feature, such as a post-processing effect like bloom, involves the following steps:

1. **Define the Feature’s Purpose and Requirements**
   - **Purpose**: Specify the visual or performance goal (e.g., "bloom effect to enhance glowing particles").
   - **Requirements**: Identify dependencies (e.g., Three.js post-processing libraries) and performance constraints (e.g., maintain 60 FPS).

2. **Create a New Service or Module**
   - **Location**: Add a file in `src/domains/rendering/services/` (e.g., `postProcessingService.ts`).
   - **Content**: Implement logic for the new feature, encapsulating it within a dedicated service.
   - **Example (Bloom Effect)**:
     ```typescript
     // src/domains/rendering/services/postProcessingService.ts
     import * as THREE from 'three';
     import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
     import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
     import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

     class PostProcessingService {
       private composer: EffectComposer;
       private bloomPass: UnrealBloomPass;

       constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
         this.composer = new EffectComposer(renderer);
         this.composer.addPass(new RenderPass(scene, camera));
         this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
         this.composer.addPass(this.bloomPass);
       }

       render() {
         this.composer.render();
       }
     }

     export const postProcessingService = new PostProcessingService();
     ```

3. **Update the Rendering Pipeline**
   - **Location**: Modify `sceneManager.ts` to incorporate the new feature in the rendering loop.
   - **Content**: Adjust the rendering process to use the new service (e.g., call `postProcessingService.render()` instead of `renderer.render()`).
   - **Example**:
     ```typescript
     // src/domains/rendering/services/sceneManager.ts
     import { postProcessingService } from 'src/domains/rendering/services/postProcessingService';
     import { cameraService } from 'src/domains/rendering/services/cameraService';

     class SceneManager {
       private scene: THREE.Scene;

       constructor() {
         this.scene = new THREE.Scene();
         // Initialize renderer and other setup
       }

       render() {
         postProcessingService.render(); // Use composer for post-processing
       }
     }

     export const sceneManager = new SceneManager();
     ```

4. **Integrate with Existing Systems**
   - **Traits Domain**: Update `visualService.ts` to support new visual trait properties (e.g., `bloomStrength`).
   - **Creature Domain**: Ensure particle data (`IParticle`) accommodates new rendering attributes.
   - **Example**:
     ```typescript
     // src/domains/traits/services/visualService.ts
     class VisualService {
       getBloomStrength(trait: IVisualTrait): number {
         return trait.bloomStrength || 0.5; // Default strength
       }
     }
     ```

5. **Add Supporting Types**
   - **Location**: Update `src/domains/rendering/types/` or `src/domains/traits/types/` as needed (e.g., `postProcessing.ts`).
   - **Content**: Define new interfaces for feature-specific data.
   - **Example**:
     ```typescript
     // src/domains/traits/types/visual.ts
     export interface IVisualTrait {
       id: string;
       name: string;
       rarity: Rarity;
       color: string;
       glowIntensity: number;
       size: number;
       bloomStrength?: number; // New property for bloom effect
     }
     ```

6. **Test the New Feature**
   - Write unit tests for the new service (e.g., `postProcessingService.test.ts`).
   - Perform integration tests to ensure compatibility with existing rendering components.
   - Validate performance using Three.js’s `Stats` module to confirm 60 FPS.
   - **Example Test**:
     ```typescript
     // tests/unit/postProcessingService.test.ts
     describe('PostProcessingService', () => {
       test('renders scene with bloom effect', () => {
         const renderer = new THREE.WebGLRenderer();
         const scene = new THREE.Scene();
         const camera = new THREE.PerspectiveCamera();
         const service = new PostProcessingService(renderer, scene, camera);
         expect(service.composer.passes.length).toBeGreaterThan(1);
       });
     });
     ```

## Best Practices for Maintaining Compatibility
1. **Preserve Existing Functionality**: Avoid modifying core services (`sceneManager.ts`, `instancedRenderer.ts`) directly; extend via new services.
2. **Deprecate, Don’t Delete**: Mark outdated features as deprecated instead of removing them to support legacy code.
3. **Version Rendering Features**: Add version metadata to new features (e.g., shader versions) for backward compatibility.
4. **Document Changes**: Update `docs/rendering/` with new feature details and migration guides.
5. **Test Extensively**: Use regression tests to ensure existing visuals and performance remain unaffected.

## Guidelines for Updating the Rendering Pipeline
1. **Minimize Pipeline Changes**: Add new features as optional steps in the rendering loop to avoid disrupting existing flows.
2. **Profile Performance**: Measure FPS and draw calls before and after adding features using Three.js’s `Stats`.
3. **Ensure Determinism**: New features must rely on static inputs (e.g., trait properties) to maintain consistent visuals.
4. **Modular Integration**: Encapsulate new features in dedicated services with clear interfaces.

## Integration Points
- **Rendering Pipeline (`src/domains/rendering/`)**: New features integrate with `sceneManager.ts` for rendering loop updates.
- **Traits Domain (`src/domains/traits/`)**: Visual traits (`IVisualTrait`) are extended to support new rendering properties.
- **Creature Domain (`src/domains/creature/`)**: Particle data (`IParticle`) is updated to accommodate new visual attributes.

## Rules Adherence
- **Determinism**: New features use deterministic inputs (e.g., trait data) to ensure consistent visuals across runs.
- **Modularity**: Extensions are encapsulated in new services, maintaining clear boundaries within the `rendering` domain.
- **Performance**: Features are optimized to support the 60 FPS target, with profiling to validate impact.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Rendering Code**: Locate rendering logic (e.g., in `src/rendering/`) that could be extended (e.g., basic shaders, material setups).
2. **Create Extension Services**: Implement new services (e.g., `postProcessingService.ts`) in `src/domains/rendering/services/`.
3. **Update Pipeline Integration**: Modify `sceneManager.ts` to incorporate new services while preserving existing functionality.
4. **Extend Trait Definitions**: Update `src/domains/traits/types/visual.ts` to include new properties as needed.
5. **Test Extensions**: Validate new features with unit and integration tests, ensuring performance and visual consistency using Three.js’s `Stats`.

## Example Extension: Adding Bloom Effect
### Post-Processing Service
```typescript
// src/domains/rendering/services/postProcessingService.ts
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

class PostProcessingService {
  private composer: EffectComposer;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85));
  }

  render() {
    this.composer.render();
  }
}

export const postProcessingService = new PostProcessingService();
```

### Integration with Scene Manager
```typescript
// src/domains/rendering/services/sceneManager.ts
import { postProcessingService } from 'src/domains/rendering/services/postProcessingService';

class SceneManager {
  render() {
    postProcessingService.render(); // Use composer for post-processing
  }
}
```


