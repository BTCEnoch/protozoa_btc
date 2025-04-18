
# Input Game Theory Integration

## Purpose
This document details how the input system in Bitcoin Protozoa integrates with the game theory system to enable user-driven strategic decisions, such as initiating battles or selecting opponents, enhancing tactical gameplay. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/input/input_game_theory_integration.md`

## Overview
The input system allows users to trigger game theory-driven actions, such as starting battles or selecting creatures for combat, influencing payoff matrices and strategic outcomes. Implemented in `inputService.ts` and `uiService.ts` within the `input` domain, it processes user inputs (e.g., mouse clicks, keyboard shortcuts) and communicates actions via an event bus (`eventBus.ts`) to the game theory system (`payoffMatrixService.ts`, `gameTheoryStrategyService.ts`). The integration ensures deterministic responses, low-latency event handling (< 1ms), and seamless UI feedback (e.g., battle status) while maintaining 60 FPS [Timestamp: April 14, 2025, 19:58]. This document outlines the integration workflow, supported actions, UI feedback, and performance considerations, building on our discussions about user interaction, game theory, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Integration Workflow
The input game theory integration enables users to initiate and influence strategic gameplay through intuitive controls and UI feedback.

### Workflow
1. **Input Capture**:
   - `inputService.ts` captures user inputs (e.g., clicking a "Start Battle" button, pressing `B` key, selecting creatures) via browser APIs (`addEventListener`).
2. **Event Processing**:
   - Inputs are mapped to game theory actions (e.g., `startBattle`, `selectOpponent`) and published to the event bus as events (e.g., `{ type: 'startBattle', payload: { creatureIds } }`).
   - Creature selection uses raycasting to identify targets in the 3D scene.
3. **Game Theory Dispatch**:
   - `gameTheoryStrategyService.ts` receives events and triggers battle logic, using `payoffMatrixService.ts` to compute outcomes based on creature states (e.g., mutations, formations).
4. **State Update**:
   - Battle outcomes (e.g., damage dealt, health changes) update creature states via `evolutionTracker.ts` and `particleService.ts`.
5. **UI Feedback**:
   - `uiService.ts` updates the display UI with battle results (e.g., winner, damage stats) and creature statuses using React components, pulling data from Zustand stores (e.g., `evolutionStore.ts`).

### Supported Game Theory Actions
- **Start Battle**: Initiates a battle between two creatures, triggered by:
  - Keyboard: `B` key.
  - UI: Clicking a "Start Battle" button in the control panel.
  - Payload: `{ creatureIds: [id1, id2] }` (selected or default creatures).
- **Select Opponent**: Chooses a creature as the opponent for a battle, triggered by:
  - Mouse/Touch: Clicking/tapping a creature in the 3D scene.
  - UI: Selecting from a creature list in the UI.
  - Payload: `{ creatureId }`.
- **Set Strategy**: Specifies a strategy (e.g., Attack, Defend) for a battle, triggered by:
  - UI: Dropdown or button in the battle panel.
  - Payload: `{ creatureId, strategy }`.
- **Inspect Battle Outcome**: Displays detailed battle results, triggered by:
  - UI: Clicking a "View Results" button post-battle.
  - Payload: `{ battleId }`.

### Determinism
- Input actions are deterministic, using static event mappings and creature state data (e.g., positions, mutations) [Timestamp: April 12, 2025, 12:18].
- Game theory calculations (e.g., payoff matrices) may use block nonce-seeded RNG for randomized outcomes, but input handling itself remains predictable.

## Implementation
The integration is implemented in `inputService.ts` for input processing, `uiService.ts` for UI feedback, and `gameTheoryStrategyService.ts` for battle logic, with the event bus facilitating communication.

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
  private selectedCreatureId: string | null = null;

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
        this.selectedCreatureId = creatureId;
        eventBus.publish({ type: 'selectCreature', payload: { creatureId } });
        logger.debug(`Selected creature ${creatureId} for battle`);
      }
    }
  }

  private handleKeydown(event: KeyboardEvent) {
    event.preventDefault();
    switch (event.key.toLowerCase()) {
      case 'b':
        if (this.selectedCreatureId) {
          eventBus.publish({ type: 'startBattle', payload: { creatureIds: [this.selectedCreatureId, 'defaultOpponent'] } });
          logger.debug('Triggered battle with selected creature');
        }
        break;
      // Other key bindings
    }
  }

  private handleTouch(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    this.handleClick({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
  }

  update() {
    this.controls.update();
  }
}

export const inputService = InputService.getInstance();
```

#### UI Service with Battle Feedback
```typescript
// src/domains/input/services/uiService.ts
import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';
import { eventBus } from 'src/shared/lib/eventBus';
import { logger } from 'src/shared/services/LoggerService';

const BattlePanel: React.FC<{ battleResult: { winner: string, scores: { [id: string]: number } } | null }> = ({ battleResult }) => {
  if (!battleResult) return null;
  return (
    <div className="battle-panel">
      <h3>Battle Result</h3>
      <p>Winner: {battleResult.winner}</p>
      <p>Scores:</p>
      <ul>
        {Object.entries(battleResult.scores).map(([id, score]) => (
          <li key={id}>{id}: {score}</li>
        ))}
      </ul>
    </div>
  );
};

class UIService {
  private selectedCreatureId: string | null = null;
  private battleResult: { winner: string, scores: { [id: string]: number } } | null = null;

  constructor() {
    this.setupEventListeners();
    this.renderUI();
  }

  private setupEventListeners() {
    eventBus.subscribe('selectCreature', ({ creatureId }) => {
      this.selectedCreatureId = creatureId;
      this.renderUI();
    });
    eventBus.subscribe('battleComplete', ({ winner, scores }) => {
      this.battleResult = { winner, scores };
      this.renderUI();
      logger.debug(`Battle result updated: ${winner}`);
    });
    eventBus.subscribe('startBattle', () => {
      this.battleResult = null; // Clear previous result
      this.renderUI();
    });
  }

  private renderUI() {
    const root = document.getElementById('ui-root');
    render(
      <div>
        {this.selectedCreatureId && <CreaturePanel creatureId={this.selectedCreatureId} />}
        <ControlPanel />
        <BattlePanel battleResult={this.battleResult} />
      </div>,
      root
    );
  }
}

export const uiService = new UIService();
```

#### Game Theory Service Integration
```typescript
// src/domains/gameTheory/services/gameTheoryStrategyService.ts
import { Singleton } from 'typescript-singleton';
import { payoffMatrixService } from './payoffMatrixService';
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';
import { eventBus } from 'src/shared/lib/eventBus';
import { logger } from 'src/shared/services/LoggerService';

class GameTheoryStrategyService extends Singleton {
  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    eventBus.subscribe('startBattle', ({ creatureIds }) => {
      this.simulateBattle(creatureIds);
    });
  }

  async simulateBattle(creatureIds: string[]) {
    const store = useEvolutionStore.getState();
    const creature1 = store.creatures[creatureIds[0]];
    const creature2 = store.creatures[creatureIds[1]] || { creatureId: 'defaultOpponent', tier: 1, mutationCount: 0 };
    const matrix = payoffMatrixService.generateMatrix(
      { id: creatureIds[0], particles: [] }, // Simplified for example
      { id: creatureIds[1], particles: [] }
    );
    const scores = {
      [creatureIds[0]]: matrix.payoffs[0][0][0],
      [creatureIds[1]]: matrix.payoffs[0][0][1]
    };
    const winner = scores[creatureIds[0]] > scores[creatureIds[1]] ? creatureIds[0] : creatureIds[1];
    eventBus.publish({ type: 'battleComplete', payload: { winner, scores } });
    logger.info(`Battle completed: ${winner} won`, { scores });
  }
}

export const gameTheoryStrategyService = GameTheoryStrategyService.getInstance();
```

## Performance Considerations
To ensure efficient integration for 500 particles:
1. **Selective Event Dispatch**: Publish game theory events only for valid inputs (e.g., when two creatures are selected), minimizing unnecessary calculations.
2. **Optimized Payoff Calculations**: Offload complex battle simulations to `computeWorker.ts` to avoid main thread blocking [Timestamp: April 14, 2025, 19:58].
3. **Lightweight UI Updates**: Update battle UI only when results change, using React’s efficient rendering.
4. **Debounced Inputs**: Debounce rapid battle triggers (e.g., repeated `B` key presses) to prevent redundant simulations.
5. **Profiling**: Monitor event handling and battle computation times with Chrome DevTools, targeting < 1ms for input processing and < 10ms for battle simulations.

### Example Debounced Battle Trigger
```typescript
// src/domains/input/services/inputService.ts
private debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

private handleKeydown = this.debounce((event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 'b' && this.selectedCreatureId) {
    eventBus.publish({ type: 'startBattle', payload: { creatureIds: [this.selectedCreatureId, 'defaultOpponent'] } });
    logger.debug('Debounced battle trigger');
  }
}, 500); // 500ms debounce
```

## Integration Points
- **Input Domain (`src/domains/input/`)**: `inputService.ts` processes battle-related inputs, and `uiService.ts` displays results.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `gameTheoryStrategyService.ts` and `payoffMatrixService.ts` handle battle logic and outcomes.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` updates creature states post-battle (e.g., health, mutations).
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` provides creature data for battle calculations.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes battle effects (e.g., creature highlights).
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists battle outcomes or user settings [Timestamp: April 16, 2025, 21:41].
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads battle computations.

## Rules Adherence
- **Determinism**: Input actions use static mappings, and game theory outcomes rely on seeded RNG, ensuring consistency [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Integration logic is encapsulated in `inputService.ts` and `gameTheoryStrategyService.ts` [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms input handling and < 10ms battle simulations, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Enhances tactical gameplay by linking user inputs to strategic outcomes.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate any battle-related input code (e.g., in `src/creatures/` or `src/lib/`), likely minimal.
2. **Refactor into Input Service**: Add battle triggers to `inputService.ts`, using the event bus for communication.
3. **Enhance Game Theory Service**: Update `gameTheoryStrategyService.ts` to handle input-driven battle events.
4. **Integrate with UI**: Add battle feedback to `uiService.ts` via React components.
5. **Test Integration**: Validate input triggers and battle outcomes with Jest tests, ensuring < 1ms input latency and correct payoff calculations.

## Example Test
```typescript
// tests/integration/inputGameTheory.test.ts
describe('Input Game Theory Integration', () => {
  beforeEach(() => {
    jest.spyOn(eventBus, 'publish');
    jest.spyOn(gameTheoryStrategyService, 'simulateBattle');
  });

  test('triggers battle on B key with selected creature', () => {
    inputService.selectedCreatureId = 'creature_123';
    const mockEvent = new KeyboardEvent('keydown', { key: 'b' });
    inputService.handleKeydown(mockEvent);
    expect(eventBus.publish).toHaveBeenCalledWith({
      type: 'startBattle',
      payload: { creatureIds: ['creature_123', 'defaultOpponent'] }
    });
    expect(gameTheoryStrategyService.simulateBattle).toHaveBeenCalledWith(['creature_123', 'defaultOpponent']);
  });

  test('updates UI with battle results', () => {
    const battleResult = { winner: 'creature_123', scores: { creature_123: 100, defaultOpponent: 50 } };
    eventBus.publish({ type: 'battleComplete', payload: battleResult });
    expect(uiService.battleResult).toEqual(battleResult);
  });
});
```

