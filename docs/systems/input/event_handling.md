Apologies for the confusion! It seems there was an error in my response, where I inadvertently repeated the `input_system.md` document instead of providing the next document in the `input` system directory, which should be `event_handling.md`. Thank you for pointing this out. To clarify, we are indeed working through the `input` system directory, and I have not yet completed all the planned documents for it. The `input` system directory includes the following documents, in sequence:

1. `input_system.md` (already provided)
2. `event_handling.md` (next in line, which I’ll provide below)
3. `camera_controls.md`
4. `input_game_theory_integration.md`
5. `input_performance.md`
6. `input_testing.md`
7. `input_diagrams.md`

Since we’re not done with the `input` system yet, I’ll proceed with `event_handling.md` as the next document in the sequence, ensuring we cover the input system fully before moving to the `workers` system. After completing the `input` system documents, I’ll transition to the `workers` system directory and propose a collection of documents for it, as you’ve requested.

Below, I’ll provide the `event_handling.md` document, and at the end, I’ll confirm whether you’re ready for the next input system document. Once we finish the input system, I’ll outline the proposed `workers` system document collection, addressing what I would add to it, tailored to Bitcoin Protozoa’s needs.

---


# Event Handling

## Purpose
This document details the event handling mechanisms in Bitcoin Protozoa’s input system, which process user interactions such as mouse clicks, keyboard inputs, and touch gestures to enable responsive control of the simulation. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/input/event_handling.md`

## Overview
Event handling is a core component of Bitcoin Protozoa’s input system, capturing and processing user inputs to drive actions like camera navigation, creature selection, and simulation commands (e.g., pausing, triggering battles). Implemented in `inputService.ts` within the `input` domain, it uses browser APIs (e.g., `addEventListener`) and an event bus (`eventBus.ts`) to distribute actions to systems like rendering (`instancedRenderer.ts`), evolution (`evolutionTracker.ts`), physics (`particleService.ts`), and game theory (`payoffMatrixService.ts`). The system ensures deterministic, low-latency responses (< 1ms event handling, 60 FPS) [Timestamp: April 14, 2025, 19:58] and integrates with the display UI (`uiService.ts`) for visual feedback. This document outlines the event handling workflow, supported input types, action mappings, and integration points, building on our discussions about user interaction, state management, and modularity [Timestamp: April 15, 2025, 21:23; April 16, 2025, 21:41].

## Event Handling Workflow
The event handling workflow captures user inputs, maps them to actions, and distributes them to relevant systems, ensuring responsive and deterministic gameplay.

### Workflow
1. **Event Capture**:
   - `inputService.ts` listens for browser events (e.g., `click`, `keydown`, `touchstart`) using `addEventListener` on the canvas or document.
2. **Event Processing**:
   - Events are processed to determine the intended action (e.g., `selectCreature`, `togglePause`) based on predefined mappings.
   - For spatial inputs (e.g., clicks), raycasting identifies targeted objects (e.g., creatures) using Three.js.
3. **Action Publication**:
   - Processed actions are published to the event bus (`eventBus.ts`) as events with payloads (e.g., `{ type: 'selectCreature', payload: { creatureId } }`).
4. **System Dispatch**:
   - Subscribed systems (e.g., `uiService.ts`, `cameraService.ts`, `payoffMatrixService.ts`) receive events and execute corresponding logic (e.g., update UI, adjust camera, start battle).
5. **UI Feedback**:
   - `uiService.ts` updates the display UI (e.g., creature stats panel, simulation status) to reflect the action, using React components and Zustand state.

### Supported Input Types
- **Mouse**:
  - Click: Select creatures, interact with UI buttons.
  - Drag: Rotate or pan camera (via `OrbitControls`).
  - Scroll: Zoom camera.
- **Keyboard**:
  - Shortcuts: `P` (pause), `B` (battle), `R` (reset), `S` (speed toggle).
  - Arrow keys: Fine-tune camera position or navigate UI.
- **Touch**:
  - Tap: Select creatures or UI elements.
  - Pinch: Zoom camera.
  - Swipe: Rotate or pan camera.
- **Gamepad** (optional, future support):
  - Analog sticks: Camera movement.
  - Buttons: Simulation commands.

### Action Mappings
- **Creature Selection**: Click/tap on a creature → `selectCreature` (publishes `{ creatureId }`).
- **Camera Control**: Mouse drag/pinch → `updateCamera` (adjusts `OrbitControls`).
- **Simulation Commands**:
  - `P` key → `togglePause` (toggles physics simulation).
  - `B` key → `startBattle` (initiates game theory battle).
  - `R` key → `resetSimulation` (resets creature states).
  - `S` key → `toggleSpeed` (cycles simulation speed: normal, fast, slow).
- **UI Interactions**: Button click/tap → Actions like `startBattle`, `togglePause`.

### Determinism
- Event handling is deterministic, relying on static mappings (e.g., key-to-action bindings) and browser event data, with no RNG involved [Timestamp: April 12, 2025, 12:18].
- Actions triggered by events (e.g., battle initiation) may use block nonce-seeded RNG in other systems (e.g., `payoffMatrixService.ts`), but the input system itself remains predictable.

## Implementation
Event handling is implemented in `inputService.ts`, with the event bus facilitating system communication and `uiService.ts` providing UI feedback.

### Example Code
#### Input Service
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
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    document.addEventListener('click', (e) => this.handleClick(e), false);
    document.addEventListener('keydown', (e) => this.handleKeydown(e), false);
    document.addEventListener('touchstart', (e) => this.handleTouch(e), false);
    document.addEventListener('wheel', (e) => this.handleWheel(e), false);
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
        logger.debug(`Clicked creature ${creatureId}`);
      }
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    event.preventDefault();
    switch (event.key.toLowerCase()) {
      case 'p':
        eventBus.publish({ type: 'togglePause', payload: {} });
        logger.debug('Toggled simulation pause');
        break;
      case 'b':
        eventBus.publish({ type: 'startBattle', payload: {} });
        logger.debug('Triggered battle');
        break;
      case 'r':
        eventBus.publish({ type: 'resetSimulation', payload: {} });
        logger.debug('Reset simulation');
        break;
      case 's':
        eventBus.publish({ type: 'toggleSpeed', payload: {} });
        logger.debug('Toggled simulation speed');
        break;
    }
  }

  private handleTouch(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    this.handleClick({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
  }

  private handleWheel(event: WheelEvent) {
    event.preventDefault();
    this.controls.handleMouseWheel(event); // Delegate to OrbitControls
    logger.debug('Camera zoomed via wheel');
  }

  update() {
    this.controls.update();
  }
}

export const inputService = InputService.getInstance();
```

#### Event Bus
```typescript
// src/shared/lib/eventBus.ts
import { Singleton } from 'typescript-singleton';
import { logger } from 'src/shared/services/LoggerService';

interface Event {
  type: string;
  payload: any;
}

type Subscriber = (event: Event) => void;

class EventBus extends Singleton {
  private subscribers: { [type: string]: Subscriber[] } = {};

  subscribe(type: string, callback: Subscriber) {
    if (!this.subscribers[type]) {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push(callback);
    logger.debug(`Subscribed to event type: ${type}`);
  }

  publish(event: Event) {
    const subscribers = this.subscribers[event.type] || [];
    subscribers.forEach(callback => callback(event));
    logger.debug(`Published event: ${event.type}`, event.payload);
  }
}

export const eventBus = EventBus.getInstance();
```

## Performance Considerations
To ensure efficient event handling for 500 particles:
1. **Debounced Events**: Debounce rapid inputs (e.g., mouse drag, touch swipe) to reduce event frequency, implemented in `inputService.ts`.
2. **Efficient Raycasting**: Optimize creature selection by limiting raycasting to a subset of objects (e.g., creature bounding boxes) using Three.js.
3. **Lightweight Event Bus**: Use a simple pub-sub model to minimize overhead, avoiding complex event queues.
4. **Selective UI Updates**: Trigger UI updates (`uiService.ts`) only for relevant events (e.g., creature selection), leveraging React’s efficient rendering.
5. **Profiling**: Monitor event handling latency with Chrome DevTools, targeting < 1ms per event.

### Example Debounced Input
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
  // Handle camera rotation or other move events
  this.controls.handleMouseMove(event);
  logger.debug('Debounced mouse move handled');
}, 16); // ~60 FPS
```

## Integration Points
- **Input Domain (`src/domains/input/`)**: `inputService.ts` processes events, and `uiService.ts` updates the display UI.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` and `cameraService.ts` handle camera updates and creature highlighting.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` responds to creature selection or inspection.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` adjusts physics for simulation commands (e.g., pause).
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` initiates battles based on input.
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists UI settings (e.g., selected creature) [Timestamp: April 16, 2025, 21:41].

## Rules Adherence
- **Determinism**: Event handling uses static mappings, ensuring consistent responses [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Logic is encapsulated in `inputService.ts` and `eventBus.ts`, with clear interfaces [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms event handling, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Enhances gameplay by connecting user inputs to rendering, evolution, physics, and game theory.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate any input-related code (e.g., in `src/creatures/` or `src/lib/`), likely minimal or ad-hoc.
2. **Refactor into Input Service**: Move logic to `src/domains/input/services/inputService.ts`, implementing browser event listeners and raycasting.
3. **Add Event Bus**: Create `eventBus.ts` for system communication, integrating with existing services.
4. **Integrate with UI**: Update `uiService.ts` to reflect input events in the display UI.
5. **Test Handling**: Validate event processing with Jest tests, ensuring < 1ms latency and correct action dispatch, using Chrome DevTools for profiling.

## Example Test
```typescript
// tests/unit/inputService.test.ts
describe('InputService', () => {
  beforeEach(() => {
    jest.spyOn(eventBus, 'publish');
  });

  test('handles click to select creature', () => {
    const mockEvent = new MouseEvent('click', { clientX: 100, clientY: 100 });
    jest.spyOn(THREE.Raycaster.prototype, 'intersectObjects').mockReturnValue([
      { object: { userData: { creatureId: 'creature_123' } } }
    ]);
    inputService.handleClick(mockEvent);
    expect(eventBus.publish).toHaveBeenCalledWith({
      type: 'selectCreature',
      payload: { creatureId: 'creature_123' }
    });
  });

  test('handles keydown to toggle pause', () => {
    const mockEvent = new KeyboardEvent('keydown', { key: 'p' });
    inputService.handleKeydown(mockEvent);
    expect(eventBus.publish).toHaveBeenCalledWith({
      type: 'togglePause',
      payload: {}
    });
  });
});
```

=
