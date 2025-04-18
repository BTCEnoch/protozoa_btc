
# Managing State with Zustand and IndexedDB

## Purpose
This guide provides step-by-step instructions for using Zustand for reactive state management and IndexedDB for persistent storage in Bitcoin Protozoa, building on our prior discussions about robust state handling [Timestamp: April 16, 2025, 21:41]. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/managing_state.md`

## Overview
Bitcoin Protozoa manages complex state for creatures, particles, and their evolutionary progression (e.g., tiers, mutations) using Zustand for in-memory reactive state and IndexedDB for persistent storage across sessions. Zustand, implemented in stores like `evolutionStore.ts`, provides a lightweight, reactive solution for real-time updates to UI and gameplay systems, while IndexedDB, accessed via `StorageService.ts`, ensures state durability. This guide covers setting up Zustand stores, configuring IndexedDB, updating and retrieving state, and optimizing performance, ensuring developers can handle state for up to 500 particles per creature efficiently.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Dependencies**: Ensure `zustand` and `idb` (IndexedDB wrapper) are installed (`npm install zustand idb`).
- **Familiarity**: Basic knowledge of TypeScript, Zustand, and IndexedDB APIs, as well as the project’s DDD structure (`src/domains/`).

## Setting Up a Zustand Store
Zustand stores manage reactive state for domains like evolution, creatures, and rendering, providing real-time updates to components and services.

### Steps
1. **Create a Store**:
   - Define a new store in `src/domains/<domain>/stores/` (e.g., `evolutionStore.ts`).
   - Use the `create` function from Zustand to set up state and actions.
2. **Define State and Actions**:
   - Specify state interfaces (e.g., `IEvolutionState`, `IParticleEvolutionState`) in `src/domains/<domain>/types/`.
   - Implement actions for updating state (e.g., `updateCreature`, `updateParticle`).
3. **Integrate with Services**:
   - Use the store in services (e.g., `evolutionTracker.ts`) to manage state updates.
   - Access store state in components or services via hooks (e.g., `useEvolutionStore`).

### Example Code
```typescript
// src/domains/evolution/stores/evolutionStore.ts
import create from 'zustand';
import { IEvolutionState, IParticleEvolutionState } from 'src/domains/evolution/types/evolutionState';

interface EvolutionStore {
  creatures: { [id: string]: IEvolutionState };
  particles: { [id: string]: IParticleEvolutionState };
  updateCreature: (id: string, state: Partial<IEvolutionState>) => void;
  updateParticle: (id: string, state: Partial<IParticleEvolutionState>) => void;
}

export const useEvolutionStore = create<EvolutionStore>(set => ({
  creatures: {},
  particles: {},
  updateCreature: (id, state) => set(s => ({
    creatures: { ...s.creatures, [id]: { ...s.creatures[id], ...state } }
  })),
  updateParticle: (id, state) => set(s => ({
    particles: { ...s.particles, [id]: { ...s.particles[id], ...state } }
  }))
}));
```

### Usage
```typescript
// Example: Update creature state in a service
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';

class EvolutionTracker {
  updateEvolutionState(creature: ICreature, mutation: IMutation, blockData: IBlockData): void {
    const store = useEvolutionStore.getState();
    const creatureState = store.creatures[creature.id] || {
      creatureId: creature.id,
      tier: 1,
      mutationCount: 0,
      subclass: 'Default',
      lastTriggerBlock: blockData.nonce
    };
    creatureState.mutationCount++;
    store.updateCreature(creature.id, creatureState);
  }
}
```

## Configuring IndexedDB for Persistence
IndexedDB, accessed via `StorageService.ts`, persists state to ensure continuity across sessions, critical for evolutionary progression.

### Steps
1. **Set Up IndexedDB**:
   - Use the `idb` library to simplify IndexedDB interactions.
   - Define a database schema in `StorageService.ts` with stores for creature and particle states.
2. **Save State**:
   - Implement `save` methods to store state updates in IndexedDB after significant changes (e.g., mutation application).
3. **Load State**:
   - Implement `load` methods to retrieve state on application startup or creature initialization.
4. **Handle Migrations**:
   - Add versioning to handle schema changes (e.g., adding new state fields).

### Example Code
```typescript
// src/shared/services/StorageService.ts
import { openDB, IDBPDatabase } from 'idb';

class StorageService {
  private async getDB(): Promise<IDBPDatabase> {
    return openDB('ProtozoaDB', 1, {
      upgrade(db) {
        db.createObjectStore('creatureState', { keyPath: 'creatureId' });
        db.createObjectStore('particleState', { keyPath: 'particleId' });
      }
    });
  }

  async save(store: 'creatureState' | 'particleState', id: string, data: any): Promise<void> {
    const db = await this.getDB();
    await db.put(store, data);
  }

  async load(store: 'creatureState' | 'particleState', id: string): Promise<any> {
    const db = await this.getDB();
    return db.get(store, id);
  }
}

export const storageService = new StorageService();
```

### Usage
```typescript
// Example: Persist creature state
import { storageService } from 'src/shared/services/StorageService';

class EvolutionTracker {
  async updateEvolutionState(creature: ICreature, mutation: IMutation, blockData: IBlockData): Promise<void> {
    const store = useEvolutionStore.getState();
    const creatureState = store.creatures[creature.id];
    creatureState.mutationCount++;
    store.updateCreature(creature.id, creatureState);
    await storageService.save('creatureState', creature.id, creatureState);
  }
}
```

## Updating and Retrieving State
State updates occur during evolutionary events (e.g., mutation application), and retrieval ensures state is accessible across systems.

### Steps
1. **Update State**:
   - Use Zustand actions (e.g., `updateCreature`) to modify state reactively.
   - Batch updates for multiple particles to minimize store operations.
2. **Retrieve State**:
   - Access state via Zustand hooks (e.g., `useEvolutionStore(state => state.creatures)`).
   - Load from IndexedDB on initialization if in-memory state is empty.
3. **Sync with Systems**:
   - Propagate state changes to rendering (`instancedRenderer.ts`), physics (`forceWorker.ts`), and game theory (`payoffMatrixService.ts`).

### Example Code
```typescript
// Example: Initialize and update state
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
    }
  }

  async applyMutation(particle: IParticle, mutation: IMutation): Promise<void> {
    const store = useEvolutionStore.getState();
    const particleState = store.particles[particle.id] || {
      particleId: particle.id,
      role: particle.role,
      mutations: [],
      stats: { health: 100, damage: 10, speed: 1 }
    };
    if (particleState.mutations.length < 3) {
      particleState.mutations.push(mutation);
      particleState.stats.health += mutation.stats?.health || 0;
      store.updateParticle(particle.id, particleState);
      await storageService.save('particleState', particle.id, particleState);
    }
  }
}
```

## Performance Optimization
To ensure efficient state management for 500 particles:
1. **Batch Updates**: Group state updates for multiple particles in a single Zustand action to reduce re-renders.
   - **Example**: Update all particles in a role group at once in `evolutionTracker.ts`.
2. **Throttle Persistence**: Save to IndexedDB only on significant state changes (e.g., tier progression, mutation application) to minimize I/O.
   - **Example**: Use a debounce mechanism in `StorageService.ts`.
3. **Cache In-Memory State**: Rely on Zustand’s in-memory store for frequent reads, reducing IndexedDB access.
   - **Example**: Cache creature state in `evolutionStore.ts` during a session.
4. **Off-Thread Storage**: Delegate IndexedDB writes to `storageWorker.ts` to offload the main thread [Timestamp: April 14, 2025, 19:58].
   - **Example**: Use `workerBridge.ts` for async storage operations.

### Example Optimization
```typescript
// src/shared/services/StorageService.ts
class StorageService {
  private pendingSaves: { store: string, id: string, data: any }[] = [];
  private debounceTimeout: NodeJS.Timeout | null = null;

  async save(store: 'creatureState' | 'particleState', id: string, data: any): Promise<void> {
    this.pendingSaves.push({ store, id, data });
    if (!this.debounceTimeout) {
      this.debounceTimeout = setTimeout(async () => {
        const db = await this.getDB();
        const tx = db.transaction(['creatureState', 'particleState'], 'readwrite');
        this.pendingSaves.forEach(({ store, id, data }) => tx.objectStore(store).put(data));
        await tx.done;
        this.pendingSaves = [];
        this.debounceTimeout = null;
      }, 100); // Debounce for 100ms
    }
  }
}
```

## Testing State Management
- **Unit Tests**: Test Zustand actions and IndexedDB operations in `tests/unit/` (e.g., `tests/unit/evolutionTracker.test.ts`).
- **Integration Tests**: Verify state synchronization with rendering and game theory in `tests/integration/`.
- **Example**:
  ```typescript
  // tests/unit/evolutionTracker.test.ts
  describe('EvolutionTracker', () => {
    test('persists and retrieves creature state', async () => {
      const blockData = createMockBlockData(12345);
      const creature = createMockCreature(blockData);
      const mutation = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 25 } };
      await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
      const stored = await storageService.load('creatureState', creature.id);
      expect(stored.mutationCount).toBe(1);
      const store = useEvolutionStore.getState();
      expect(store.creatures[creature.id].mutationCount).toBe(1);
    });
  });
  ```

## Troubleshooting
- **State Inconsistency**: Verify Zustand updates match IndexedDB state; check for async race conditions in `StorageService.ts`.
- **Slow Persistence**: Optimize IndexedDB writes with batching and debouncing; profile with Chrome DevTools.
- **Missing State**: Ensure `initializeCreature` loads state from IndexedDB on startup; log errors in `storageService.ts`.
- **Testing Issues**: Use `fake-indexeddb` for mock IndexedDB in Jest tests to avoid real database interactions.


