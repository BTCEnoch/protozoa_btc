
# Input Testing and Validation

## Purpose
This document provides strategies for testing and validating the input system in Bitcoin Protozoa to ensure correctness, responsiveness, and reliability of user interactions, including camera controls, creature selection, and simulation commands. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/input/input_testing.md`

## Overview
The input system, managed by `inputService.ts` and `uiService.ts`, processes user inputs (mouse, keyboard, touch) and updates the display UI, enabling intuitive control of the simulation (e.g., camera navigation, battle triggers). Testing ensures deterministic behavior, low-latency event handling (< 1ms), efficient UI updates (< 5ms), and consistent performance (60 FPS) [Timestamp: April 14, 2025, 19:58], validating integration with rendering (`instancedRenderer.ts`), evolution (`evolutionTracker.ts`), physics (`particleService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines unit and integration testing strategies, sample test cases, and tools like Jest, building on our discussions about user interaction, performance optimization, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Unit Testing Strategies
Unit tests focus on individual input system components (`inputService.ts`, `uiService.ts`, `eventBus.ts`) to verify their functionality in isolation.

### Key Testing Scenarios
1. **Event Handling**:
   - Verify that `inputService.ts` correctly processes mouse, keyboard, and touch events, mapping them to actions (e.g., `selectCreature`, `togglePause`).
   - Ensure debounced events (e.g., mouse drag) fire at expected intervals (e.g., ~60 Hz).
2. **Camera Controls**:
   - Test that `inputService.ts` updates Three.js `OrbitControls` for orbit, zoom, and pan actions based on input events.
   - Confirm deterministic camera positioning (e.g., focus on creature).
3. **UI Rendering**:
   - Validate that `uiService.ts` renders React components (e.g., `CreaturePanel`, `ControlPanel`) with correct state from Zustand stores.
   - Ensure memoized components prevent unnecessary re-renders.
4. **Event Bus**:
   - Test that `eventBus.ts` publishes and subscribes to events correctly, delivering payloads to subscribers.
5. **Error Handling**:
   - Verify graceful handling of invalid inputs (e.g., clicking outside the canvas, unsupported keys).

### Example Unit Test
```typescript
// tests/unit/inputService.test.ts
describe('InputService', () => {
  beforeEach(() => {
    jest.spyOn(eventBus, 'publish');
    jest.spyOn(OrbitControls.prototype, 'update');
    jest.spyOn(THREE.Raycaster.prototype, 'intersectObjects').mockClear();
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

  test('debounces rapid mouse moves', async () => {
    const mockEvent = new MouseEvent('mousemove', { clientX: 200, clientY: 200 });
    jest.spyOn(OrbitControls.prototype, 'handleMouseMove');
    inputService.handleMouseMove(mockEvent);
    inputService.handleMouseMove(mockEvent); // Should be debounced
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(OrbitControls.prototype.handleMouseMove).toHaveBeenCalledTimes(1);
  });
});

describe('UIService', () => {
  test('renders CreaturePanel with correct state', () => {
    const creatureId = 'creature_123';
    useEvolutionStore.setState({
      creatures: {
        [creatureId]: { creatureId, tier: 2, mutationCount: 5, subclass: 'Guardian', lastTriggerBlock: 800000 }
      }
    });
    const wrapper = shallow(<CreaturePanel creatureId={creatureId} />);
    expect(wrapper.find('h3').text()).toBe('Creature: creature_123');
    expect(wrapper.find('p').at(0).text()).toBe('Tier: 2');
  });
});
```

## Integration Testing Strategies
Integration tests verify interactions between the input system and other domains, ensuring cohesive behavior across event handling, UI updates, and system responses.

### Key Testing Scenarios
1. **Input to Rendering**:
   - Confirm that camera control inputs (e.g., mouse drag, pinch zoom) update the Three.js camera (`cameraService.ts`) and render correctly (`instancedRenderer.ts`).
   - Verify FPS remains ≥ 60 during camera navigation.
2. **Input to Evolution**:
   - Test that creature selection inputs trigger state updates in `evolutionTracker.ts` (e.g., displaying mutation details in the UI).
3. **Input to Physics**:
   - Ensure simulation commands (e.g., pause, speed toggle) correctly adjust physics updates in `particleService.ts`.
4. **Input to Game Theory**:
   - Validate that battle triggers (e.g., `B` key, UI button) initiate battles in `gameTheoryStrategyService.ts` and update UI with results.
5. **UI Responsiveness**:
   - Test that UI updates (e.g., creature stats, battle panel) reflect input-driven changes within 5ms.
6. **Deterministic Behavior**:
   - Confirm consistent input responses across sessions with identical inputs [Timestamp: April 12, 2025, 12:18].
7. **Performance Validation**:
   - Measure event handling (< 1ms), UI updates (< 5ms), and FPS (≥ 60) during rapid inputs.

### Example Integration Test
```typescript
// tests/integration/inputSystem.test.ts
describe('Input System Integration', () => {
  beforeEach(() => {
    jest.spyOn(eventBus, 'publish');
    jest.spyOn(OrbitControls.prototype, 'update');
    jest.spyOn(THREE.Raycaster.prototype, 'intersectObjects').mockClear();
    require('fake-indexeddb/auto');
  });

  test('selects creature and updates UI', async () => {
    const creatureId = 'creature_123';
    useEvolutionStore.setState({
      creatures: { [creatureId]: { creatureId, tier: 2, mutationCount: 5, subclass: 'Guardian', lastTriggerBlock: 800000 } }
    });
    jest.spyOn(THREE.Raycaster.prototype, 'intersectObjects').mockReturnValue([
      { object: { userData: { creatureId } } }
    ]);
    const mockEvent = new MouseEvent('click', { clientX: 100, clientY: 100 });
    inputService.handleClick(mockEvent);
    expect(eventBus.publish).toHaveBeenCalledWith({
      type: 'selectCreature',
      payload: { creatureId }
    });
    const wrapper = shallow(<CreaturePanel creatureId={creatureId} />);
    expect(wrapper.find('h3').text()).toBe('Creature: creature_123');
  });

  test('triggers battle and displays results', async () => {
    inputService.selectedCreatureId = 'creature_123';
    const mockEvent = new KeyboardEvent('keydown', { key: 'b' });
    inputService.handleKeydown(mockEvent);
    expect(eventBus.publish).toHaveBeenCalledWith({
      type: 'startBattle',
      payload: { creatureIds: ['creature_123', 'defaultOpponent'] }
    });
    const battleResult = { winner: 'creature_123', scores: { creature_123: 100, defaultOpponent: 50 } };
    eventBus.publish({ type: 'battleComplete', payload: battleResult });
    const wrapper = shallow(<BattlePanel battleResult={battleResult} />);
    expect(wrapper.find('p').at(0).text()).toBe('Winner: creature_123');
  });

  test('maintains 60 FPS during rapid inputs', async () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const mockEvent = new MouseEvent('mousemove', { clientX: 100 + i, clientY: 100 + i });
      inputService.handleMouseMove(mockEvent);
      instancedRenderer.updateParticles(createMockCreature(createMockBlockData(12345)).particles);
      sceneManager.render(cameraService.getCamera());
    }
    const elapsed = performance.now() - start;
    const fps = 100 / (elapsed / 1000);
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```

## Sample Test Cases
1. **Creature Selection**:
   - **Scenario**: Click on a creature in the 3D scene.
   - **Expected Outcome**: `selectCreature` event published with correct `creatureId`, UI updates with creature stats.
2. **Camera Zoom**:
   - **Scenario**: Scroll mouse wheel to zoom in.
   - **Expected Outcome**: Camera distance decreases, `cameraUpdate` event published, FPS ≥ 60.
3. **Simulation Pause**:
   - **Scenario**: Press `P` key to toggle pause.
   - **Expected Outcome**: `togglePause` event published, physics updates halted, UI reflects pause state.
4. **Battle Trigger**:
   - **Scenario**: Press `B` key with a selected creature.
   - **Expected Outcome**: `startBattle` event published, battle simulated, UI shows results.
5. **Touch Input**:
   - **Scenario**: Tap a creature on a touch device.
   - **Expected Outcome**: `selectCreature` event published, UI updates within 5ms.
6. **Error Handling**:
   - **Scenario**: Press an unsupported key (e.g., `Q`).
   - **Expected Outcome**: No event published, error logged gracefully.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **React Testing Library**: Tests React components in `uiService.ts` for correct rendering and state updates.
- **Fake IndexedDB**: Simulates IndexedDB for testing state persistence (`fake-indexeddb`) [Timestamp: April 16, 2025, 21:41].
- **Three.js Stats**: Monitors FPS during rendering, integrated in `sceneManager.ts`.
- **Chrome DevTools**: Profiles CPU usage, event handling latency, and React rendering in the **Performance** tab.
- **Custom Metrics**: Use `performance.now()` in `inputService.ts` to measure event handling times.

## Integration Points
- **Input Domain (`src/domains/input/`)**: `inputService.ts` processes events, and `uiService.ts` renders UI updates.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` and `cameraService.ts` handle visual updates from inputs.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` responds to creature selections and state inspections.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` adjusts physics for simulation commands.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` processes battle triggers [Timestamp: April 12, 2025, 12:18].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists UI settings [Timestamp: April 16, 2025, 21:41].
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads input-driven calculations [Timestamp: April 14, 2025, 19:58].

## Rules Adherence
- **Determinism**: Tests confirm consistent input responses with fixed mappings [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies [Timestamp: April 15, 2025, 21:23].
- **Performance**: Validates < 1ms event handling, < 5ms UI updates, and 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Ensures inputs drive rendering, evolution, physics, and game theory for cohesive gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate any input-related tests (e.g., in `tests/`), likely minimal or absent.
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with `inputService.ts` and `uiService.ts`.
3. **Add New Tests**: Implement tests for event handling, UI rendering, and integrations, covering mouse, keyboard, and touch inputs.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing, targeting >80% coverage.

