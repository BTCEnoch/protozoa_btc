 
# State Persistence

## Purpose
This document details the state persistence mechanisms in Bitcoin Protozoa’s storage system, which save and load creature and particle states, mutation traits, and simulation progress to IndexedDB, ensuring continuity across sessions. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/storage/state_persistence.md`

## Overview
State persistence in Bitcoin Protozoa ensures that evolutionary progress (e.g., mutation counts, tiers), particle states (e.g., positions, velocities), and simulation settings remain consistent across user sessions, supporting long-term gameplay. Managed by `StorageService.ts` in the `shared` domain and integrated with Zustand stores (e.g., `evolutionStore.ts`) for in-memory state [Timestamp: April 16, 2025, 21:41], persistence operations use IndexedDB for efficient storage and retrieval. The system is deterministic, optimized for performance (< 10ms for batch writes, < 5ms for reads) [Timestamp: April 14, 2025, 19:58], and integrates with evolution (`evolutionTracker.ts`), physics (`particleService.ts`), and rendering (`instancedRenderer.ts`). This document outlines the persistence workflow, save/load operations, integration points, and optimization strategies, building on our discussions about state management and modularity [Timestamp: April 15, 2025, 21:23].

## State Persistence Workflow
The state persistence workflow manages saving and loading state data to/from IndexedDB, synchronizing with in-memory Zustand stores for real-time updates.

### Workflow
1. **State Update Trigger**:
   - Services like `evolutionTracker.ts` or `particleService.ts` update state (e.g., new mutation applied, particle positions changed) in response to gameplay events (e.g., block confirmations, physics updates).
2. **In-Memory Update**:
   - Zustand stores (e.g., `evolutionStore.ts`) update reactive state, notifying dependent systems (e.g., rendering, game theory).
3. **Save to IndexedDB**:
   - `StorageService.ts` saves updated state to the appropriate object store (`creatureState`, `particleState`, `simulationState`) using key-based writes.
   - Batch writes are used for multiple particles, optionally offloaded to `storageWorker.ts` for performance.
4. **Load from IndexedDB**:
   - On session start or creature initialization, `StorageService.ts` loads state from IndexedDB, populating Zustand stores.
5. **Propagate State**:
   - Loaded state is synced to evolution (`evolutionTracker.ts`), physics (`particleService.ts`), rendering (`instancedRenderer.ts`), and game theory (`payoffMatrixService.ts`) for consistent gameplay.

### Save Operation
- **Purpose**: Persist state changes to IndexedDB to ensure data survives session ends.
- **Inputs**:
  - Store name (e.g., `creatureState`, `particleState`).
  - Unique key (e.g., `creatureId`, `particleId`).
  - Data object (e.g., `ICreatureState`, `IParticleState`).
- **Process**: Use `db.put` to write data to the specified store, leveraging key paths for efficient updates.
- **Optimization**: Batch multiple writes (e.g., 500 particles) into a single transaction to reduce overhead.

### Load Operation
- **Purpose**: Retrieve state from IndexedDB to initialize or restore gameplay.
- **Inputs**:
  - Store name.
  - Unique key.
- **Process**: Use `db.get` to fetch data by key, returning the stored object or `undefined` if not found.
- **Optimization**: Cache frequently accessed state in Zustand to minimize reads.

### Determinism
- State persistence is deterministic, relying on fixed key paths and static data structures (e.g., `ICreatureState`, `IParticleState`) [Timestamp: April 12, 2025, 12:18].
- No RNG is used in persistence operations, as randomization occurs in gameplay logic (e.g., mutation selection).

## Implementation
State persistence is implemented in `StorageService.ts`, with integration in services like `evolutionTracker.ts` and `particleService.ts`.

### Example Code
#### Storage Service
```typescript
// src/shared/services/StorageService.ts
import { openDB, IDBPDatabase } from 'idb';
import { logger } from 'src/shared/services/LoggerService';

class StorageService {
  private async getDB(): Promise<IDBPDatabase> {
    return openDB('ProtozoaDB', 1, {
      upgrade(db) {
        db.createObjectStore('creatureState', { keyPath: 'creatureId' });
        db.createObjectStore('particleState', { keyPath: 'particleId' });
        db.createObjectStore('simulationState', { keyPath: 'simulationId' });
      }
    });
  }

  async save(store: 'creatureState' | 'particleState' | 'simulationState', id: string, data: any): Promise<void> {
    const start = performance.now();
    const db = await this.getDB();
    await db.put(store, data);
    logger.debug(`Saved ${store} for ${id} in ${performance.now() - start}ms`);
  }

  async load(store: 'creatureState' | 'particleState' | 'simulationState', id: string): Promise<any> {
    const start = performance.now();
    const db = await this.getDB();
    const data = await db.get(store, id);
    logger.debug(`Loaded ${store} for ${id} in ${performance.now() - start}ms`);
    return data;
  }

  async batchSave(store: 'particleState', data: any[]): Promise<void> {
    const start = performance.now();
    const db = await this.getDB();
    const tx = db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    data.forEach(item => objectStore.put(item));
    await tx.done;
    logger.debug(`Batch saved ${data.length} items to ${store} in ${performance.now() - start}ms`);
  }
}

export const storageService = new StorageService();
```

#### Evolution Tracker Integration
```typescript
// src/domains/evolution/services/evolutionTracker.ts
import { storageService } from 'src/shared/services/StorageService';
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';
import { logger } from 'src/shared/services/LoggerService';

class EvolutionTracker {
  async initializeCreature(creature: ICreature): Promise<void> {
    const store = useEvolutionStore.getState();
    let creatureState = store.creatures[creature.id];
    if (!creatureState) {
      creatureState = await storageService.load('creatureState', creature.id) || {
        creatureId: creature.id,
        tier: 1,
        mutationCount: 0,
        subclass: 'Default',
        lastTriggerBlock: 0
      };
      store.updateCreature(creature.id, creatureState);
      logger.info(`Initialized creature ${creature.id} from storage`);
    }
  }

  async updateEvolutionState(creature: ICreature, mutation: IMutation, blockData: IBlockData): Promise<void> {
    const store = useEvolutionStore.getState();
    const creatureState = store.creatures[creature.id] || {
      creatureId: creature.id,
      tier: 1,
      mutationCount: 0,
      subclass: 'Default',
      lastTriggerBlock: blockData.nonce
    };
    creatureState.mutationCount++;
    if (creatureState.mutationCount % 10 === 0) {
      creatureState.tier = Math.min(creatureState.tier + 1, 5);
    }
    store.updateCreature(creature.id, creatureState);
    await storageService.save('creatureState', creature.id, creatureState);

    // Batch save particle states
    const particleStates = creature.particles.map((p, i) => ({
      particleId: `${creature.id}_${i}`,
      creatureId: creature.id,
      role: p.role,
      position: p.position,
      velocity: p.velocity,
      mutations: p.mutations || [mutation],
      stats: p.stats
    }));
    await storageService.batchSave('particleState', particleStates);
    logger.info(`Persisted state for creature ${creature.id} and ${particleStates.length} particles`);
  }
}

export const evolutionTracker = new EvolutionTracker();
```

## Performance Considerations
To ensure efficient state persistence for 500 particles:
1. **Batch Writes**: Group particle state saves into a single transaction using `batchSave` to reduce I/O overhead [Timestamp: April 14, 2025, 19:58].
2. **Debounced Saves**: Delay non-critical saves (e.g., 100ms) to avoid frequent writes during rapid updates, implemented in `StorageService.ts`.
3. **Off-Thread Processing**: Offload batch writes to `storageWorker.ts` to prevent main thread blocking, ensuring 60 FPS.
4. **Caching**: Cache frequently accessed state in Zustand stores to minimize IndexedDB reads.
5. **Minimal Data**: Store compact data (e.g., `number[]` for positions) to reduce storage footprint and improve performance.

### Example Debounced Save
```typescript
// src/shared/services/StorageService.ts
class StorageService {
  private pendingSaves: { store: string, id: string, data: any }[] = [];
  private debounceTimeout: NodeJS.Timeout | null = null;

  async save(store: string, id: string, data: any): Promise<void> {
    this.pendingSaves.push({ store, id, data });
    if (!this.debounceTimeout) {
      this.debounceTimeout = setTimeout(async () => {
        const db = await this.getDB();
        const tx = db.transaction([store], 'readwrite');
        const objectStore = tx.objectStore(store);
        this.pendingSaves.forEach(({ store, id, data }) => objectStore.put(data));
        await tx.done;
        logger.debug(`Debounced save of ${this.pendingSaves.length} items to ${store}`);
        this.pendingSaves = [];
        this.debounceTimeout = null;
      }, 100); // 100ms debounce
    }
  }
}
```

## Integration Points
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` handles save/load operations, with `storageWorker.ts` for off-thread tasks.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` persists `ICreatureState` and `IParticleState` for evolutionary progress.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` saves particle positions and velocities.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` uses loaded state for consistent visuals.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` leverages persistent state for battle outcomes.
- **Workers Domain (`src/domains/workers/`)**: `storageWorker.ts` offloads batch writes, coordinated by `workerBridge.ts`.

## Rules Adherence
- **Determinism**: Persistence operations use fixed key paths and static data, ensuring consistent state [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Logic is encapsulated in `StorageService.ts` and `storageWorker.ts`, with clear interfaces [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 10ms writes and < 5ms reads, supporting real-time gameplay [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports evolution, physics, rendering, and game theory, ensuring cohesive state management.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate state persistence code (e.g., in `src/creatures/` or `src/lib/`), likely using localStorage or ad-hoc methods.
2. **Refactor into Storage Service**: Move logic to `src/shared/services/StorageService.ts`, implementing IndexedDB save/load operations.
3. **Add Batch and Worker Support**: Implement `batchSave` and `storageWorker.ts` for efficient writes.
4. **Integrate with Systems**: Update `evolutionTracker.ts` and `particleService.ts` to use `StorageService.ts` for persistence.
5. **Test Persistence**: Validate save/load operations with Jest tests, ensuring data integrity and performance (< 10ms writes).

## Example Test
```typescript
// tests/unit/StorageService.test.ts
describe('StorageService', () => {
  test('saves and loads creature state', async () => {
    const creatureState = { creatureId: 'creature_123', tier: 2, mutationCount: 5, subclass: 'Guardian', lastTriggerBlock: 800000 };
    await storageService.save('creatureState', creatureState.creatureId, creatureState);
    const loaded = await storageService.load('creatureState', creatureState.creatureId);
    expect(loaded).toEqual(creatureState);
  });

  test('batch saves particle states efficiently', async () => {
    const particleStates = [
      { particleId: 'creature_123_0', creatureId: 'creature_123', role: Role.ATTACK, position: [1, 0, 0], velocity: [0, 0, 0], mutations: [], stats: { health: 100, damage: 10, speed: 1 } },
      { particleId: 'creature_123_1', creatureId: 'creature_123', role: Role.ATTACK, position: [0, 1, 0], velocity: [0, 0, 0], mutations: [], stats: { health: 100, damage: 10, speed: 1 } }
    ];
    const start = performance.now();
    await storageService.batchSave('particleState', particleStates);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
    const loaded = await storageService.load('particleState', particleStates[0].particleId);
    expect(loaded).toEqual(particleStates[0]);
  });
});
```

