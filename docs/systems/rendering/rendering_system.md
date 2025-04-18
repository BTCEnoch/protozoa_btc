
# Rendering System

## Overview
The Rendering System in Bitcoin Protozoa is responsible for visualizing creatures and their particles in a 3D environment using Three.js. It handles the rendering pipeline, including scene management, camera controls, and particle visualization. The system is designed to be modular, performant, and deterministic, ensuring consistent visuals across different runs. This document outlines how to restructure the current rendering logic from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) into the new domain-driven design (DDD) framework under `src/domains/rendering/`, providing a single source of truth for the rendering system.

## Directory Structure
The rendering logic is centralized in the `rendering` domain under `src/domains/rendering/`, following the DDD structure. This structure ensures that all rendering-related components are encapsulated and easily maintainable.

```
src/domains/rendering/
├── types/
│   ├── instanced.ts        # Types for instanced rendering
│   ├── shaders.ts          # Shader interface definitions
│   ├── lod.ts              # LOD type definitions
│   ├── buffers.ts          # Buffer geometry types
│   └── index.ts            # Rendering types exports
├── services/
│   ├── sceneManager.ts     # Scene management service
│   ├── cameraService.ts    # Camera control service
│   ├── particleRenderer.ts # Particle rendering service
│   └── index.ts            # Rendering services exports
├── components/
│   ├── CreatureViewer/     # Creature viewer component
│   └── index.ts            # Rendering components exports
└── index.ts                # Rendering domain exports
```

## Key Components
- **Types (`types/*.ts`)**: Define structures for rendering configurations, including instanced rendering, shaders, level of detail (LOD), and buffer geometries.
- **Services (`services/*.ts`)**:
  - `sceneManager.ts`: Manages the Three.js scene, including adding/removing objects and handling updates.
  - `cameraService.ts`: Controls the camera, including perspective, orbit controls, and zooming.
  - `particleRenderer.ts`: Renders particles using optimized techniques like instanced meshes.
- **Components (`components/*.tsx`)**:
  - `CreatureViewer`: A React component that integrates Three.js to display creatures in 3D.

## Integration
The Rendering System integrates with:
- **Creature Domain (`src/domains/creature/`)**: Uses creature and particle data for rendering.
- **Traits Domain (`src/domains/traits/`)**: Applies visual traits (e.g., color, glow) to particles.
- **Shared Utilities (`src/shared/`)**: Uses shared types and utilities for consistency.

## Rules Adherence
- **Determinism**: Rendering is consistent across runs, relying on static data and creature properties.
- **Modularity**: Rendering logic is encapsulated within the `rendering` domain, avoiding tight coupling.
- **Performance**: Optimized using techniques like instanced rendering and efficient scene management.

## Migration Steps
To transition from the current GitHub structure:
1. **Refactor Rendering Code**: Identify and move existing Three.js rendering logic (e.g., from `src/rendering/` or scattered files) into `services/*.ts` and `components/*.tsx` under `src/domains/rendering/`.
2. **Implement New Services**: Create new services (e.g., `sceneManager.ts`, `cameraService.ts`) to handle scene and camera logic.
3. **Update Integration**: Ensure the `CreatureViewer` component uses the new services and integrates with creature data.
4. **Test Rendering**: Validate that creatures are correctly rendered in the new structure, checking for visual consistency and performance.

## Code Examples
### Scene Manager Service
Manages the Three.js scene and its objects.
```typescript
// src/domains/rendering/services/sceneManager.ts
import * as THREE from 'three';

class SceneManager {
  private scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
  }

  addObject(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  update(): void {
    // Logic for scene updates, if needed
  }
}

export const sceneManager = new SceneManager();
```

### Camera Service
Controls the camera and its interactions.
```typescript
// src/domains/rendering/services/cameraService.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class CameraService {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  constructor(domElement: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, domElement);
  }

  update(): void {
    this.controls.update();
  }
}

export const cameraService = new CameraService(document.querySelector('canvas'));
```

### Creature Viewer Component
Integrates Three.js with React to render creatures.
```typescript
// src/domains/rendering/components/CreatureViewer.tsx
import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { sceneManager } from 'src/domains/rendering/services/sceneManager';
import { cameraService } from 'src/domains/rendering/services/cameraService';

export const CreatureViewer = ({ creature }) => {
  const { scene } = useThree();

  useEffect(() => {
    // Add creature to scene
    sceneManager.addObject(creature.mesh);
    return () => sceneManager.removeObject(creature.mesh);
  }, [creature]);

  useEffect(() => {
    cameraService.update();
  }, []);

  return null;
};
```


