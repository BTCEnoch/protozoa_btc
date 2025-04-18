
# Debugging and Troubleshooting

## Purpose
This guide provides strategies for diagnosing and resolving issues in Bitcoin Protozoa’s evolution, rendering, physics, and game theory systems, ensuring robust development and maintenance. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and new DDD framework, facilitating effective debugging during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/debugging_troubleshooting.md`

## Overview
Bitcoin Protozoa’s complex systems—evolution triggers, particle physics, Three.js rendering, and game theory calculations—require robust debugging to maintain performance (60 FPS, < 5ms updates for 500 particles), determinism, and functionality. This guide covers using Chrome DevTools for profiling, debugging Web Workers and IndexedDB, addressing common issues (e.g., non-deterministic RNG, rendering glitches), and implementing logging, building on our discussions about performance optimization and state management [Timestamp: April 14, 2025, 19:58; April 16, 2025, 21:41]. It equips developers with tools to ensure system stability and streamline development.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Tools**: Chrome DevTools for profiling, Jest for testing, and a code editor with TypeScript support (e.g., VS Code with augment integration [Timestamp: April 7, 2025, 14:11]).
- **Familiarity**: Knowledge of TypeScript, Web Workers, IndexedDB, Three.js, and the DDD structure (`src/domains/`).

## Using Chrome DevTools for Profiling
Chrome DevTools is the primary tool for diagnosing performance bottlenecks, rendering issues, and worker communication problems.

### Steps
1. **Open DevTools**:
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) in Chrome while running the app (`npm run dev`).
2. **Profile Performance**:
   - Go to the **Performance** tab, click **Record**, interact with the app (e.g., trigger a battle), and stop recording.
   - Analyze the timeline for CPU usage, frame drops, and long tasks (> 5ms).
   - Look for bottlenecks in main thread tasks (e.g., physics updates) or worker execution.
3. **Inspect Rendering**:
   - Use the **Rendering** tab to enable **Paint Flashing** and identify unnecessary repaints (e.g., caused by excessive `instancedRenderer.ts` updates).
   - Check **FPS meter** to ensure 60 FPS during particle rendering.
4. **Debug Workers**:
   - In the **Sources** tab, navigate to **Workers** to inspect `forceWorker.ts`, `computeWorker.ts`, etc.
   - Set breakpoints in worker scripts to trace logic (e.g., force calculations).
5. **Monitor Network**:
   - Use the **Network** tab to check ordinals.com API calls (`bitcoinService.ts`) for rate limits (HTTP 429) or errors.

### Example: Profiling Evolution Triggers
- **Issue**: Evolution triggers (`evolutionService.ts`) take > 5ms, causing frame drops.
- **Steps**:
  - Record a performance profile while triggering a block confirmation.
  - Identify long tasks in `evaluateTriggers` (e.g., iterating 500 particles).
  - Optimize by batching particle checks or offloading to `computeWorker.ts` [Timestamp: April 14, 2025, 19:58].
- **Outcome**: Reduced trigger evaluation to < 5ms, maintaining 60 FPS.

## Debugging Web Workers
Web Workers (`forceWorker.ts`, `computeWorker.ts`) handle compute-intensive tasks, but issues like communication delays or errors can arise.

### Common Issues and Solutions
1. **Worker Errors**:
   - **Symptom**: `onerror` events in `workerBridge.ts` (e.g., “Script error”).
   - **Solution**: Check worker script paths in `workerBridge.ts` (e.g., `./forceWorker.ts`). Ensure TypeScript compilation includes workers (`tsconfig.json`).
   - **Debugging**: Add `console.error` in worker `onerror` handler:
     ```typescript
     // src/domains/workers/services/workerBridge.ts
     worker.onerror = (e: ErrorEvent) => {
       console.error(`Worker error: ${e.message}, Line: ${e.lineno}, File: ${e.filename}`);
       reject(e);
     };
     ```
2. **High Latency**:
   - **Symptom**: Worker responses take > 5ms, slowing physics or evolution updates.
   - **Solution**: Minimize message payloads (e.g., send `{ id, position }` instead of full `IParticle`). Use `Transferable` objects like `ArrayBuffer` for large data.
   - **Debugging**: Profile message size in DevTools **Network** tab (filter by WS for worker messages).
3. **Non-Deterministic Results**:
   - **Symptom**: Worker calculations (e.g., mutation triggers) vary across runs.
   - **Solution**: Ensure workers use block nonce-seeded RNG (`rngSystem.ts`) [Timestamp: April 12, 2025, 12:18].
   - **Debugging**: Add logging in worker:
     ```typescript
     // src/domains/workers/services/computeWorker.ts
     console.log(`Worker RNG seed: ${blockData.nonce}`);
     ```

### Example: Debugging Physics Worker
- **Issue**: `forceWorker.ts` causes stuttering during particle updates.
- **Steps**:
  - Set breakpoints in `calculateForces` to trace force calculations.
  - Profile worker CPU usage in DevTools **Performance** tab.
  - Optimize with spatial partitioning (`spatialUtils.ts`) to reduce O(n²) complexity [Timestamp: April 14, 2025, 19:58].
- **Outcome**: Physics updates reduced to < 5ms, restoring 60 FPS.

## Debugging IndexedDB Interactions
IndexedDB, managed by `StorageService.ts`, persists creature and particle states, but issues like data inconsistency or slow writes can occur [Timestamp: April 16, 2025, 21:41].

### Common Issues and Solutions
1. **State Inconsistency**:
   - **Symptom**: Creature state in Zustand (`evolutionStore.ts`) differs from IndexedDB (`StorageService.ts`).
   - **Solution**: Ensure `save` calls in `evolutionTracker.ts` match state updates. Use transactions for atomic writes.
   - **Debugging**: Log state before and after saves:
     ```typescript
     // src/shared/services/StorageService.ts
     async save(store: string, id: string, data: any): Promise<void> {
       console.log(`Saving ${store} for ${id}:`, data);
       const db = await this.getDB();
       await db.put(store, data);
     }
     ```
2. **Slow Writes**:
   - **Symptom**: IndexedDB writes take > 5ms, slowing evolution updates.
   - **Solution**: Batch writes with debouncing (e.g., 100ms delay) and offload to `storageWorker.ts`.
   - **Debugging**: Profile write duration in DevTools **Performance** tab.
3. **Missing Data**:
   - **Symptom**: `load` returns `undefined` for creature state.
   - **Solution**: Verify database schema in `StorageService.ts` and initialization logic in `evolutionTracker.ts`.
   - **Debugging**: Log load attempts:
     ```typescript
     async load(store: string, id: string): Promise<any> {
       const db = await this.getDB();
       const data = await db.get(store, id);
       console.log(`Loaded ${store} for ${id}:`, data);
       return data;
     }
     ```

### Example: Debugging State Persistence
- **Issue**: Creature mutations not saved to IndexedDB.
- **Steps**:
  - Add logging to `save` in `StorageService.ts` to trace data.
  - Check `evolutionTracker.ts` for missing `storageService.save` calls.
  - Implement batch writes:
    ```typescript
    // src/domains/evolution/services/evolutionTracker.ts
    async updateEvolutionState(creature: ICreature, mutation: IMutation): Promise<void> {
      const store = useEvolutionStore.getState();
      creature.particles.forEach(p => {
        p.mutationTrait = mutation;
        store.updateParticle(p.id, { mutations: [mutation] });
      });
      await storageService.save('creatureState', creature.id, store.creatures[creature.id]);
    }
    ```
- **Outcome**: Consistent state persistence, verified via logs and IndexedDB inspection.

## Common Issues and Solutions
1. **Non-Deterministic RNG**:
   - **Symptom**: Mutation or formation assignments vary across runs.
   - **Solution**: Verify block nonce seeding in `rngSystem.ts` and consistent `IBlockData` inputs from `bitcoinService.ts` [Timestamp: April 12, 2025, 12:18].
   - **Debugging**: Log RNG seeds:
     ```typescript
     // src/shared/lib/rngSystem.ts
     console.log(`Seeding RNG with nonce: ${nonce}`);
     ```
2. **Rendering Glitches**:
   - **Symptom**: Particle visuals flicker or misalign (e.g., “Spiral Charge” trail effect).
   - **Solution**: Check `instancedRenderer.ts` for correct `InstancedMesh` updates and `shaderManager.ts` for uniform issues.
   - **Debugging**: Enable **Paint Flashing** in DevTools **Rendering** tab to identify repaints.
3. **Physics Instability**:
   - **Symptom**: Particles oscillate or diverge in formations (e.g., “Shield Wall”).
   - **Solution**: Adjust spring force constants in `forceWorker.ts` (e.g., reduce from 0.1 to 0.08) and ensure spatial partitioning [Timestamp: April 14, 2025, 19:58].
   - **Debugging**: Log force magnitudes:
     ```typescript
     // src/domains/workers/services/forceWorker.ts
     console.log(`Force for particle ${particle.id}:`, force);
     ```
4. **Game Theory Imbalance**:
   - **Symptom**: Mutations like “Fury Strike” dominate battles (>60% win rate).
   - **Solution**: Run simulations (`simulateEvolutionBattles.ts`) to tune mutation effects in `payoffMatrixService.ts` [Timestamp: April 12, 2025, 12:18].
   - **Debugging**: Log payoff values:
     ```typescript
     // src/domains/gameTheory/services/payoffMatrixService.ts
     console.log(`Payoff matrix for ${creature1.id}:`, payoffs);
     ```

## Implementing Logging
Structured logging helps trace issues without overwhelming the console.

### Best Practices
- **Use Levels**: Implement `debug`, `info`, `warn`, and `error` levels for granularity.
- **Contextual Logs**: Include relevant data (e.g., creature ID, block nonce) for traceability.
- **Conditional Logging**: Enable debug logs only in development (`process.env.NODE_ENV === 'development'`).
- **Centralized Logger**: Create a `LoggerService` for consistent logging across systems.

### Example Logger
```typescript
// src/shared/services/LoggerService.ts
class LoggerService {
  debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  info(message: string, context?: any) {
    console.info(`[INFO] ${message}`, context);
  }

  warn(message: string, context?: any) {
    console.warn(`[WARN] ${message}`, context);
  }

  error(message: string, context?: any) {
    console.error(`[ERROR] ${message}`, context);
  }
}

export const logger = new LoggerService();
```

### Usage
```typescript
// src/domains/evolution/services/evolutionService.ts
import { logger } from 'src/shared/services/LoggerService';

class EvolutionService {
  async evaluateTriggers(creature: ICreature, blockData: IBlockData): Promise<void> {
    logger.debug(`Evaluating triggers for creature ${creature.id}`, { blockData });
    const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
    if (rng() < 0.1) {
      logger.info(`Mutation triggered for creature ${creature.id}`, { nonce: blockData.nonce });
      // Mutation logic
    } else {
      logger.debug(`No trigger for creature ${creature.id}`);
    }
  }
}
```

## Testing for Debugging
- **Unit Tests**: Isolate issues in services (e.g., `tests/unit/evolutionService.test.ts`) to verify logic.
- **Integration Tests**: Test system interactions (e.g., `tests/integration/evolutionSystem.test.ts`) to catch cross-domain bugs.
- **Mock Data**: Use `tests/mocks.ts` to simulate block data or particle states, avoiding live API calls.
- **Example**:
  ```typescript
  // tests/unit/evolutionService.test.ts
  describe('EvolutionService', () => {
    test('logs trigger failure for low RNG', async () => {
      const blockData = createMockBlockData(12345);
      const creature = createMockCreature(blockData);
      jest.spyOn(console, 'debug');
      await evolutionService.evaluateTriggers(creature, blockData);
      expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('No trigger'));
    });
  });
  ```

