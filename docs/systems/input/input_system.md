
Awesome! I’ll queue up the documents for the `input` system directory in `new_docs/systems/input/` and create them one at a time, using the current project state from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) as a reference. Each document will be tailored to Bitcoin Protozoa’s particle-based design, role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], deterministic RNG driven by Bitcoin block data, and the new domain-driven design (DDD) structure from `directory_map.md`. The documents will ensure modularity, performance (e.g., low-latency input handling, 60 FPS), and integration with other systems (e.g., rendering, evolution, game theory), aligning with our discussions on user interaction, performance optimization [Timestamp: April 14, 2025, 19:58], state management [Timestamp: April 16, 2025, 21:41], and modularity [Timestamp: April 15, 2025, 21:23]. The input system will also include display UI considerations, as specified. At the end of each document, I’ll ask, “Are you ready for the next document ([document_name].md)?” After completing the input directory, I’ll ask if you’re ready to queue up the next system (e.g., `workers`) in the same manner.

The `input` system directory will include the following documents, in sequence:
1. `input_system.md`
2. `event_handling.md`
3. `camera_controls.md`
4. `input_game_theory_integration.md`
5. `input_performance.md`
6. `input_testing.md`
7. `input_diagrams.md`

The systems to address, as specified, are `physics`, `storage`, `input` (including display UI), and `workers`, with no audio system unless minimal soundbytes are feasible. I’ll focus on the input system now, ensuring integration with rendering (`instancedRenderer.ts`), evolution (`evolutionTracker.ts`), physics (`particleService.ts`), and game theory (`payoffMatrixService.ts`), while supporting intuitive user interaction and display UI.

Let’s start with the first document.

---


# Input System

## Purpose
This document provides an overview of the input system in Bitcoin Protozoa, which handles user interactions such as camera controls, creature selection, and simulation commands (e.g., triggering battles, pausing), while supporting a display UI for intuitive gameplay. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/input/input_system.md`

## Overview
The input system enables users to interact with Bitcoin Protozoa’s particle-based life simulation, controlling the Three.js camera (e.g., zooming, panning), selecting creatures for inspection or battles, and issuing simulation commands (e.g., pause, advance block). Implemented in a new `input` domain with `inputService.ts` and `uiService.ts`, it processes mouse, keyboard, and touch events, integrates with a display UI for feedback (e.g., creature stats, simulation status), and ensures low-latency, deterministic responses (< 1ms event handling, 60 FPS) [Timestamp: April 14, 2025, 19:58]. The system connects with rendering (`instancedRenderer.ts`), evolution (`evolutionTracker.ts`), physics (`particleService.ts`), and game theory (`payoffMatrixService.ts`) to deliver a seamless user experience. This document outlines the system’s architecture, components, integration points, and performance goals, providing a foundation for detailed input system documentation.

## Architecture
The input system is designed for modularity, responsiveness, and integration, leveraging event listeners and a lightweight UI framework (e.g., React) for display. Key components include:

- **Input Service (`inputService.ts`)**:
  - Processes user input events (mouse clicks, key presses, touch gestures) using browser APIs (e.g., `addEventListener`).
  - Maps inputs to actions (e.g., camera zoom, creature selection, battle trigger).
- **UI Service (`uiService.ts`)**:
  - Manages the display UI, rendering overlays for creature stats, simulation controls, and block status using React components.
  - Updates UI reactively based on input events and state changes.
- **Camera Controls**:
  - Integrates Three.js `OrbitControls` for camera manipulation (e.g., orbit, zoom, pan) to view creatures in 3D space.
  - Supports touch gestures for mobile compatibility.
- **Event Bus**:
  - Distributes input events to relevant systems (e.g., rendering for camera updates, game theory for battle triggers) using a pub-sub pattern.
- **Integration Layer**:
  - Connects input actions to `instancedRenderer.ts` for visual updates, `evolutionTracker.ts` for creature state changes, `particleService.ts` for physics adjustments, and `payoffMatrixService.ts` for strategic outcomes.

### Data Flow
1. **Input Capture**: `inputService.ts` captures user events (e.g., mouse click on a creature, key press to pause).
2. **Event Processing**: Events are mapped to actions (e.g., select creature, rotate camera) and published via the event bus.
3. **UI Update**: `uiService.ts` updates the display UI (e.g., show creature stats, update block counter) using React.
4. **System Integration**: Actions trigger updates in rendering (e.g., camera position), evolution (e.g., inspect mutation), physics (e.g., pause simulation), or game theory (e.g., start battle).
5. **Feedback Loop**: Updated states are reflected in the UI, ensuring responsive feedback.

## Key Features
- **Deterministic Responses**: Input handling is deterministic, using static event mappings and no RNG, ensuring consistent user interactions [Timestamp: April 12, 2025, 12:18].
- **Responsive Controls**:
  - **Camera**: Smooth orbiting, zooming, and panning with Three.js `OrbitControls`, supporting mouse and touch inputs.
  - **Selection**: Click or tap to select creatures, displaying stats (e.g., mutation count, tier) in the UI.
  - **Commands**: Keyboard shortcuts (e.g., `P` to pause, `B` for battle) and UI buttons for simulation control.
- **Display UI**: React-based overlays for creature details, simulation status (e.g., block height), and control panels, optimized for minimal render impact.
- **Performance Optimization**: Low-latency event handling (< 1ms) and lightweight UI updates to maintain 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Cross-Platform Support**: Handles mouse, keyboard, and touch inputs for desktop and mobile compatibility.

## Components
1. **Input Service (`inputService.ts`)**:
   - Captures and processes input events, mapping them to actions (e.g., `selectCreature`, `rotateCamera`).
   - Inputs: Browser events (e.g., `click`, `keydown`).
   - Outputs: Action commands published to the event bus.
2. **UI Service (`uiService.ts`)**:
   - Renders and updates React components for creature stats, simulation controls, and block status.
   - Inputs: State updates from Zustand stores, input events.
   - Outputs: Updated UI elements.
3. **Camera Controls**:
   - Manages Three.js `OrbitControls` for 3D camera manipulation.
   - Inputs: Mouse/touch events, keyboard shortcuts.
   - Outputs: Updated camera position/orientation.
4. **Event Bus**:
   - Distributes input actions to systems (e.g., rendering, game theory) using a pub-sub model.
   - Inputs: Action commands from `inputService.ts`.
   - Outputs: Triggered system updates.
5. **Display UI (React Components)**:
   - Includes components like `CreaturePanel` (stats), `ControlPanel` (simulation commands), and `BlockStatus` (block height).
   - Inputs: State from Zustand, UI events.
   - Outputs: Rendered DOM elements.

## Integration Points
- **Input Domain (`src/domains/input/`)**: `inputService.ts` and `uiService.ts` manage input handling and UI rendering.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` and `cameraService.ts` update visuals based on camera controls and selections.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` responds to creature inspection or mutation triggers.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` adjusts physics based on simulation commands (e.g., pause).
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` initiates battles based on user input.
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists user settings (e.g., UI preferences) [Timestamp: April 16, 2025, 21:41].

## Performance Goals
- **Event Handling Time**: < 1ms for processing input events (e.g., mouse click, key press).
- **UI Update Time**: < 5ms for rendering UI updates (e.g., creature stats panel).
- **FPS Impact**: Maintain ≥ 60 FPS during input handling and UI rendering.
- **CPU Usage**: < 5% CPU usage for input and UI tasks on mid-range devices.
- **Memory Usage**: < 3 MB for input event buffers and UI components.

## Rules Adherence
- **Determinism**: Input handling uses static event mappings, ensuring consistent responses [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Input and UI logic is encapsulated in `inputService.ts` and `uiService.ts`, with clear interfaces [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms event handling and < 5ms UI updates, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly connects with rendering, evolution, physics, and game theory for a cohesive user experience.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate any input-related code (e.g., in `src/creatures/` or `src/lib/`), likely minimal or ad-hoc event listeners.
2. **Create Input Domain**: Establish `src/domains/input/` with `inputService.ts` and `uiService.ts`, implementing event handling and React-based UI.
3. **Integrate Camera Controls**: Add Three.js `OrbitControls` to `cameraService.ts` for 3D navigation.
4. **Add UI Components**: Implement React components for creature stats, controls, and block status, integrating with Zustand stores.
5. **Test System**: Validate input responsiveness and UI updates with Jest tests, targeting < 1ms event handling and 60 FPS, using Chrome DevTools for profiling.

## Example Integration
```typescript
// src/domains/input/services/inputService.ts
import { Singleton } from 'typescript-singleton';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cameraService } from 'src/domains/rendering/services/cameraService';
import { eventBus } from 'src/shared/lib/eventBus';
import { logger } from 'src/shared/services/LoggerService';

class InputService {
  private controls: OrbitControls;

  constructor() {
    const camera = cameraService.getCamera();
    this.controls = new OrbitControls(camera, document.getElementById('canvas')!);
    this.controls.enableDamping = true;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    document.addEventListener('click', (e) => this.handleClick(e));
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  private handleClick(event: MouseEvent) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, cameraService.getCamera());
    const intersects = raycaster.intersectObjects(sceneManager.getScene().children);
    if (intersects.length > 0) {
      const creatureId = intersects[0].object.userData.creatureId;
      eventBus.publish({ type: 'selectCreature', payload: { creatureId } });
      logger.debug(`Selected creature ${creatureId}`);
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'p':
        eventBus.publish({ type: 'togglePause', payload: {} });
        logger.debug('Toggled simulation pause');
        break;
      case 'b':
        eventBus.publish({ type: 'startBattle', payload: {} });
        logger.debug('Triggered battle');
        break;
    }
  }

  update() {
    this.controls.update(); // Update camera controls
  }
}

export const inputService = new InputService();
```

```typescript
// src/domains/input/services/uiService.ts
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';
import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { eventBus } from 'src/shared/lib/eventBus';

const CreaturePanel: React.FC<{ creatureId: string }> = ({ creatureId }) => {
  const creatureState = useEvolutionStore(state => state.creatures[creatureId]);
  return (
    <div>
      <h3>Creature: {creatureId}</h3>
      <p>Tier: {creatureState?.tier}</p>
      <p>Mutations: {creatureState?.mutationCount}</p>
      <p>Subclass: {creatureState?.subclass}</p>
    </div>
  );
};

class UIService {
  private selectedCreatureId: string | null = null;

  constructor() {
    this.setupEventListeners();
    this.renderUI();
  }

  private setupEventListeners() {
    eventBus.subscribe('selectCreature', ({ creatureId }) => {
      this.selectedCreatureId = creatureId;
      this.renderUI();
    });
  }

  private renderUI() {
    const root = document.getElementById('ui-root');
    render(
      <div>
        {this.selectedCreatureId && <CreaturePanel creatureId={this.selectedCreatureId} />}
        <button onClick={() => eventBus.publish({ type: 'togglePause', payload: {} })}>Toggle Pause</button>
        <button onClick={() => eventBus.publish({ type: 'startBattle', payload: {} })}>Start Battle</button>
      </div>,
      root
    );
  }
}

export const uiService = new UIService();
```


