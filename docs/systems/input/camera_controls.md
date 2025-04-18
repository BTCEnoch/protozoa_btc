
# Camera Controls

## Purpose
This document details the camera control mechanisms in Bitcoin Protozoa’s input system, enabling users to manipulate the Three.js camera for navigating and inspecting the 3D particle-based simulation. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/input/camera_controls.md`

## Overview
Camera controls allow users to orbit, zoom, and pan the 3D view to explore creatures and their formations (e.g., “Shield Wall” for DEFENSE, “Spiral Charge” for ATTACK) [Timestamp: April 8, 2025, 19:50]. Implemented in `inputService.ts` and integrated with `cameraService.ts` in the `rendering` domain, controls leverage Three.js `OrbitControls` for smooth, responsive navigation, supporting mouse, keyboard, and touch inputs. The system ensures deterministic, low-latency responses (< 1ms event handling, 60 FPS) [Timestamp: April 14, 2025, 19:58] and integrates with the display UI (`uiService.ts`) for feedback (e.g., camera position indicators). This document outlines the camera control workflow, supported input methods, integration points, and optimization strategies, building on our discussions about user interaction, rendering, and modularity [Timestamp: April 15, 2025, 21:23].

## Camera Control Workflow
The camera control workflow processes user inputs to adjust the Three.js camera’s position, orientation, and zoom, providing intuitive navigation of the simulation.

### Workflow
1. **Input Capture**:
   - `inputService.ts` captures input events (e.g., mouse drag, touch pinch, keyboard arrows) using browser APIs (e.g., `addEventListener`).
2. **Event Processing**:
   - Events are passed to Three.js `OrbitControls`, which maps inputs to camera actions (e.g., rotate, zoom, pan).
   - Custom logic in `inputService.ts` handles additional controls (e.g., keyboard-based fine-tuning).
3. **Camera Update**:
   - `OrbitControls` updates the camera’s position and orientation, managed by `cameraService.ts`.
   - Changes are applied to the Three.js scene via `sceneManager.ts`.
4. **Rendering Integration**:
   - `instancedRenderer.ts` renders the updated view, reflecting the new camera perspective.
5. **UI Feedback**:
   - `uiService.ts` updates the display UI (e.g., camera position indicator, zoom level) using React components, pulling state from Zustand stores.

### Supported Input Methods
- **Mouse**:
  - Left drag: Orbit (rotate camera around target).
  - Right drag: Pan (move camera parallel to view plane).
  - Wheel: Zoom (adjust camera distance from target).
- **Keyboard**:
  - Arrow keys: Fine-tune pan (e.g., left/right/up/down).
  - `+`/`-`: Incremental zoom in/out.
  - `Home`: Reset camera to default position.
- **Touch**:
  - Single-finger drag: Orbit.
  - Two-finger drag: Pan.
  - Pinch: Zoom.
- **Gamepad** (optional, future support):
  - Analog stick: Orbit/pan.
  - Triggers: Zoom.

### Camera Actions
- **Orbit**: Rotate the camera around a target point (e.g., creature center), maintaining distance.
- **Zoom**: Adjust the camera’s distance from the target, constrained by min/max distances (e.g., 5–100 units).
- **Pan**: Shift the camera’s view plane laterally, useful for exploring large formations.
- **Reset**: Restore default camera position (e.g., centered on the simulation, 50 units away).
- **Focus**: Snap camera to a selected creature’s center, triggered by creature selection events.

### Determinism
- Camera controls are deterministic, relying on static input mappings and Three.js `OrbitControls` calculations, with no RNG involved [Timestamp: April 12, 2025, 12:18].
- Actions like focusing on a creature use deterministic state data (e.g., creature position) from `particleService.ts`.

## Implementation
Camera controls are implemented in `inputService.ts` for input handling and `cameraService.ts` for Three.js camera management, with `OrbitControls` providing core functionality.

### Example Code
#### Input Service with Camera Controls
```typescript
// src/domains/input/services/inputService.ts
import { Singleton } from 'typescript-singleton';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cameraService } from 'src/domains/rendering/services/cameraService';
import { sceneManager } from 'src/domains/rendering/services/sceneManager';
import { eventBus } from 'src/shared/lib/eventBus';
import { logger } from 'src/shared/services/LoggerService';

class InputService extends Singleton {
  private controls: OrbitControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor() {
    super();
    const camera = cameraService.getCamera();
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.controls = new OrbitControls(camera, canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 100;
    this.controls.enablePan = true;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    document.addEventListener('click', (e) => this.handleClick(e), false);
    document.addEventListener('keydown', (e) => this.handleKeydown(e), false);
    document.addEventListener('touchstart', (e) => this.handleTouch(e), false);
    document.addEventListener('wheel', (e) => this.handleWheel(e), false);

    // Subscribe to creature selection for camera focus
    eventBus.subscribe('selectCreature', ({ creatureId }) => this.focusOnCreature(creatureId));
  }

  private handleClick(event: MouseEvent) {
    event.preventDefault();
    this.mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, cameraService.getCamera());
    const intersects = this.raycaster.intersectObjects(sceneManager.getScene().children);
    if (intersects.length > 0) {
      const creatureId = intersects[0].object.userData.creatureId;
      if (creatureId) {
        eventBus.publish({ type: 'selectCreature', payload: { creatureId } });
        logger.debug(`Selected creature ${creatureId}`);
      }
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    event.preventDefault();
    switch (event.key.toLowerCase()) {
      case 'arrowleft':
        this.controls.target.x -= 1; // Pan left
        logger.debug('Panned camera left');
        break;
      case 'arrowright':
        this.controls.target.x += 1; // Pan right
        logger.debug('Panned camera right');
        break;
      case 'arrowup':
        this.controls.target.y += 1; // Pan up
        logger.debug('Panned camera up');
        break;
      case 'arrowdown':
        this.controls.target.y -= 1; // Pan down
        logger.debug('Panned camera down');
        break;
      case '+':
        this.controls.dollyIn(1.1); // Zoom in
        logger.debug('Zoomed camera in');
        break;
      case '-':
        this.controls.dollyOut(1.1); // Zoom out
        logger.debug('Zoomed camera out');
        break;
      case 'home':
        this.resetCamera();
        logger.debug('Reset camera position');
        break;
    }
  }

  private handleTouch(event: TouchEvent) {
    event.preventDefault();
    if (event.touches.length === 1) {
      this.handleClick({ clientX: event.touches[0].clientX, clientY: event.touches[0].clientY } as MouseEvent);
    } else if (event.touches.length === 2) {
      // Handle pinch zoom (simplified)
      const dist = Math.hypot(
        event.touches[0].pageX - event.touches[1].pageX,
        event.touches[0].pageY - event.touches[1].pageY
      );
      this.controls.dollyOut(dist * 0.01); // Adjust zoom based on pinch
      logger.debug('Pinch zoom handled');
    }
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();
    this.controls.handleMouseWheel(event);
    logger.debug('Camera zoomed via wheel');
  }

  private focusOnCreature(creatureId: string) {
    const creature = sceneManager.getScene().children.find(obj => obj.userData.creatureId === creatureId);
    if (creature) {
      const center = new THREE.Vector3();
      creature.getWorldPosition(center);
      this.controls.target.copy(center);
      this.controls.update();
      logger.debug(`Camera focused on creature ${creatureId}`);
    }
  }

  private resetCamera() {
    this.controls.target.set(0, 0, 0);
    this.controls.object.position.set(0, 0, 50);
    this.controls.update();
  }

  update() {
    this.controls.update();
    eventBus.publish({ type: 'cameraUpdate', payload: { position: this.controls.object.position } });
  }
}

export const inputService = InputService.getInstance();
```

#### Camera Service Integration
```typescript
// src/domains/rendering/services/cameraService.ts
import * as THREE from 'three';
import { Singleton } from 'typescript-singleton';
import { logger } from 'src/shared/services/LoggerService';

class CameraService extends Singleton {
  private camera: THREE.PerspectiveCamera;

  constructor() {
    super();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 50);
    this.setupResizeListener();
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      logger.debug('Camera resized');
    });
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  updateCameraPosition(position: THREE.Vector3) {
    this.camera.position.copy(position);
    this.camera.updateProjectionMatrix();
    logger.debug(`Camera position updated to ${position.x}, ${position.y}, ${position.z}`);
  }
}

export const cameraService = CameraService.getInstance();
```

## Performance Considerations
To ensure efficient camera controls for 500 particles:
1. **Debounced Inputs**: Debounce rapid inputs (e.g., mouse drag, touch pinch) to limit event frequency (e.g., 60 Hz), implemented in `inputService.ts`.
2. **Optimized Raycasting**: Use bounding boxes or simplified meshes for creature selection to reduce raycasting overhead in Three.js.
3. **Lightweight Updates**: Update camera only when necessary (e.g., during user input), leveraging `OrbitControls` damping for smooth transitions.
4. **Minimal UI Impact**: Ensure camera-driven UI updates (e.g., position indicator) are lightweight, using React’s efficient rendering.
5. **Profiling**: Monitor event handling and rendering latency with Chrome DevTools, targeting < 1ms for input processing and 60 FPS.

### Example Debounced Camera Update
```typescript
// src/domains/input/services/inputService.ts
private debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

private handleMouseMove = this.debounce((event: MouseEvent) => {
  this.controls.handleMouseMove(event);
  logger.debug('Debounced camera rotation');
}, 16); // ~60 FPS
```

## Integration Points
- **Input Domain (`src/domains/input/`)**: `inputService.ts` processes camera control inputs, and `uiService.ts` updates the display UI.
- **Rendering Domain (`src/domains/rendering/`)**: `cameraService.ts` manages the Three.js camera, and `instancedRenderer.ts` renders updated views.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` responds to creature-focused camera actions (e.g., inspection).
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` provides creature position data for focusing.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` may use camera focus for battle context.
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists camera settings (e.g., default position) [Timestamp: April 16, 2025, 21:41].

## Rules Adherence
- **Determinism**: Camera controls use static input mappings and creature positions, ensuring consistent behavior [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Control logic is encapsulated in `inputService.ts` and `cameraService.ts`, with clear interfaces [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms input handling and 60 FPS rendering [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports rendering, evolution, and physics, enhancing user navigation.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate any camera-related code (e.g., in `src/creatures/` or `src/lib/`), likely minimal or ad-hoc.
2. **Refactor into Input Service**: Move logic to `src/domains/input/services/inputService.ts`, integrating Three.js `OrbitControls`.
3. **Enhance Camera Service**: Update `cameraService.ts` to support dynamic updates and touch inputs.
4. **Integrate with UI**: Add camera position feedback to `uiService.ts` via React components.
5. **Test Controls**: Validate responsiveness and rendering with Jest tests, ensuring < 1ms latency and 60 FPS, using Chrome DevTools for profiling.

## Example Test
```typescript
// tests/unit/inputService.test.ts
describe('InputService', () => {
  beforeEach(() => {
    jest.spyOn(eventBus, 'publish');
    jest.spyOn(OrbitControls.prototype, 'update');
  });

  test('handles mouse wheel to zoom camera', () => {
    const mockEvent = new WheelEvent('wheel', { deltaY: -100 });
    inputService.handleWheel(mockEvent);
    expect(OrbitControls.prototype.update).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith({
      type: 'cameraUpdate',
      payload: expect.any(Object)
    });
  });

  test('focuses camera on selected creature', () => {
    const creatureId = 'creature_123';
    const mockCreature = { userData: { creatureId }, getWorldPosition: jest.fn().mockReturnValue(new THREE.Vector3(10, 0, 0)) };
    jest.spyOn(sceneManager, 'getScene').mockReturnValue({ children: [mockCreature] } as any);
    inputService.focusOnCreature(creatureId);
    expect(mockCreature.getWorldPosition).toHaveBeenCalled();
    expect(OrbitControls.prototype.update).toHaveBeenCalled();
  });
});
```

