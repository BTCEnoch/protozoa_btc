
# Camera and Controls

## Purpose
This document explains the configuration and management of the camera system in Bitcoin Protozoa, including perspective and orthographic views, as well as user controls such as orbit, zoom, and pan. It serves as a single source of truth for developers to customize, troubleshoot, and optimize camera behavior, ensuring an interactive and user-friendly 3D visualization experience.

## Location
`docs/rendering/camera_controls.md`

## Overview
The camera system in Bitcoin Protozoa is a critical component of the rendering pipeline, enabling users to view and interact with creatures in a 3D environment. Built with Three.js, it primarily uses a `PerspectiveCamera` for immersive visuals, paired with `OrbitControls` for intuitive user interactions. The system is designed to be modular, performant, and deterministic, aligning with the project’s domain-driven design (DDD) principles and integrating seamlessly with other rendering components.

## Camera Configuration
The camera is configured to provide a clear view of creatures, with settings optimized for performance and user experience.

### Camera Types
- **PerspectiveCamera**: Used as the primary camera for 3D rendering, providing depth and realism.
  - **Settings**:
    - Field of View (FOV): 75 degrees
    - Aspect Ratio: Matches canvas dimensions (window.innerWidth / window.innerHeight)
    - Near/Far Clipping Planes: 0.1 / 1000 units
  - **Purpose**: Renders creatures with realistic perspective for immersive visuals.

### Camera Controls
- **OrbitControls**: Enables orbiting, zooming, and panning around creatures.
  - **Settings**:
    - Enable Damping: Smooths camera movements
    - Min/Max Distance: 5 / 50 units to focus on creatures
    - Enable Pan: Allows lateral movement
  - **Purpose**: Provides intuitive user interaction for exploring 3D scenes.

### Example Camera Setup
```typescript
// src/domains/rendering/services/cameraService.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class CameraService {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  constructor(domElement: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);
    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
    this.controls.enablePan = true;
  }

  update(): void {
    this.controls.update();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}

export const cameraService = new CameraService(document.querySelector('canvas'));
```

## User Interaction
The camera system supports user inputs for dynamic exploration:
- **Orbit**: Left-click and drag to rotate around the scene.
- **Zoom**: Scroll wheel or pinch to zoom in/out.
- **Pan**: Right-click and drag to move laterally.
- **Auto-Rotation**: Optional feature for idle animations (configurable).

### Example Integration with Rendering Pipeline
```typescript
// src/domains/rendering/services/sceneManager.ts
import * as THREE from 'three';
import { cameraService } from 'src/domains/rendering/services/cameraService';

class SceneManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas') });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    cameraService.update();
    this.renderer.render(this.scene, cameraService.getCamera());
  }
}

export const sceneManager = new SceneManager();
```

## Integration Points
- **Rendering Pipeline (`src/domains/rendering/`)**: The camera is updated and used in the rendering loop managed by `sceneManager.ts`.
- **Creature Domain (`src/domains/creature/`)**: Camera positioning is adjusted based on creature locations for optimal viewing.
- **Traits Domain (`src/domains/traits/`)**: Visual traits may influence camera effects (e.g., focusing on glowing particles).

## Rules Adherence
- **Determinism**: Camera behavior is deterministic, relying on user inputs and predefined settings, with no random movements.
- **Modularity**: Camera logic is encapsulated in `cameraService.ts`, with clear interfaces for integration.
- **Performance**: Optimized for smooth updates, using damping and efficient control mechanisms to minimize CPU usage.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Camera Logic**: Locate camera-related code (e.g., in `src/rendering/` or scattered files).
2. **Refactor into Camera Service**: Move logic to `src/domains/rendering/services/cameraService.ts`, ensuring it handles both camera setup and controls.
3. **Update Rendering Pipeline**: Integrate `cameraService.ts` with `sceneManager.ts` for rendering loop updates.
4. **Test Interactions**: Validate camera movements (orbit, zoom, pan) and ensure smooth performance using Three.js’s `Stats` module.


