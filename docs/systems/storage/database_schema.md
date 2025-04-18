
# Database Schema

## Purpose
This document defines the IndexedDB database schema for Bitcoin Protozoa’s storage system, which persists creature and particle states, mutation traits, and simulation progress. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/storage/database_schema.md`

## Overview
The storage system uses IndexedDB to store persistent data, ensuring continuity of evolutionary progress (e.g., mutation counts, tiers) and creature states (e.g., particle positions, traits) across sessions [Timestamp: April 16, 2025, 21:41]. Managed by `StorageService.ts` in the `shared` domain, the database schema defines object stores for efficient key-based access and supports versioning for schema migrations. This document outlines the schema structure, object stores, key paths, and migration strategies, ensuring scalability for up to 500 particles per creature and integration with evolution (`evolutionTracker.ts`), physics (`particleService.ts`), and rendering (`instancedRenderer.ts`). It builds on our discussions about state persistence and modularity [Timestamp: April 15, 2025, 21:23].

## Database Schema Structure
The IndexedDB database, named `ProtozoaDB`, is initialized with a versioned schema to support evolving data requirements. The schema includes multiple object stores to organize data by entity type, with key paths for efficient retrieval.

### Database Details
- **Name**: `ProtozoaDB`
- **Version**: 1 (initial version, incremented for schema changes)
- **Library**: `idb` (simplifies IndexedDB interactions)

### Object Stores
1. **creatureState**:
   - **Purpose**: Stores creature-level state, including evolutionary progress and metadata.
   - **Key Path**: `creatureId` (unique string, e.g., `creature_12345`)
   - **Data Structure**:
     ```typescript
     interface ICreatureState {
       creatureId: string; // Unique identifier
       tier: number; // Evolution tier (1-5)
       mutationCount: number; // Total mutations applied
       subclass: string; // e.g., "Guardian" for DEFENSE-heavy
       lastTriggerBlock: number; // Last block nonce triggering evolution
     }
     ```
   - **Indexes**:
     - `tier` (non-unique, for querying by evolution progress)
     - `lastTriggerBlock` (non-unique, for tracking recent updates)
2. **particleState**:
   - **Purpose**: Stores particle-level state, including positions, velocities, and mutation traits.
   - **Key Path**: `particleId` (unique string, e.g., `particle_12345_001`)
   - **Data Structure**:
     ```typescript
     interface IParticleState {
       particleId: string; // Unique identifier (e.g., creatureId_particleIndex)
       creatureId: string; // Reference to parent creature
       role: Role; // CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK
       position: number[]; // [x, y, z]
       velocity: number[]; // [x, y, z]
       mutations: IMutation[]; // Applied mutation traits (max 3)
       stats: { health: number; damage: number; speed: number }; // Current stats
     }
     ```
   - **Indexes**:
     - `creatureId` (non-unique, for querying particles by creature)
     - `role` (non-unique, for role-based analysis)
3. **simulationState**:
   - **Purpose**: Stores global simulation state, such as current block height or user settings.
   - **Key Path**: `simulationId` (unique string, e.g., `simulation_1`)
   - **Data Structure**:
     ```typescript
     interface ISimulationState {
       simulationId: string; // Unique identifier
       currentBlockHeight: number; // Latest processed block height
       lastUpdated: string; // ISO timestamp of last update
       settings: { [key: string]: any }; // User preferences (e.g., rendering options)
     }
     ```
   - **Indexes**:
     - `currentBlockHeight` (non-unique, for tracking blockchain progress)

### Schema Initialization
The schema is defined in `StorageService.ts` during database initialization, using the `idb` library’s `upgrade` callback to create or modify object stores and indexes.

**Example**:
```typescript
// src/shared/services/StorageService.ts
import { openDB, IDBPDatabase } from 'idb';
import { logger } from 'src/shared/services/LoggerService';

class StorageService {
  private async getDB(): Promise<IDBPDatabase> {
    return openDB('ProtozoaDB', 1, {
      upgrade(db) {
        // Creature state store
        const creatureStore = db.createObjectStore('creatureState', { keyPath: 'creatureId' });
        creatureStore.createIndex('tier', 'tier', { unique: false });
        creatureStore.createIndex('lastTriggerBlock', 'lastTriggerBlock', { unique: false });

        // Particle state store
        const particleStore = db.createObjectStore('particleState', { keyPath: 'particleId' });
        particleStore.createIndex('creatureId', 'creatureId', { unique: false });
        particleStore.createIndex('role', 'role', { unique: false });

        // Simulation state store
        const simulationStore = db.createObjectStore('simulationState', { keyPath: 'simulationId' });
        simulationStore.createIndex('currentBlockHeight', 'currentBlockHeight', { unique: false });
      }
    });
  }

  async save(store: 'creatureState' | 'particleState' | 'simulationState', id: string, data: any): Promise<void> {
    const db = await this.getDB();
    await db.put(store, data);
    logger.debug(`Saved data to ${store} with id ${id}`);
  }

  async load(store: 'creatureState' | 'particleState' | 'simulationState', id: string): Promise<any> {
    const db = await this.getDB();
    return db.get(store, id);
  }
}

export const storageService = new StorageService();
```

## Schema Migration Strategy
To support future schema changes (e.g., adding new state fields), the storage system uses versioned migrations in the `upgrade` callback.

### Migration Process
1. **Increment Version**: Update the database version (e.g., from 1 to 2) in `openDB('ProtozoaDB', 2, ...)`.
2. **Define Upgrade Logic**: Add new stores, indexes, or modify existing ones in the `upgrade` callback, preserving existing data.
3. **Handle Data Transformation**: Migrate existing data to new formats (e.g., add default values for new fields).
4. **Test Migrations**: Validate migrations with Jest tests to ensure data integrity.

**Example Migration**:
```typescript
// Future migration to version 2
async getDB(): Promise<IDBPDatabase> {
  return openDB('ProtozoaDB', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        // Initial schema (as above)
        const creatureStore = db.createObjectStore('creatureState', { keyPath: 'creatureId' });
        creatureStore.createIndex('tier', 'tier', { unique: false });
        creatureStore.createIndex('lastTriggerBlock', 'lastTriggerBlock', { unique: false });
        // Other stores...
      }
      if (oldVersion < 2) {
        // Add new field to creatureState
        const creatureStore = db.transaction('creatureState').objectStore('creatureState');
        creatureStore.openCursor().onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.update({ ...cursor.value, newField: 'default' }); // Add new field
            cursor.continue();
          }
        };
      }
    }
  });
}
```

## Performance Considerations
To ensure efficient schema operations for 500 particles:
1. **Efficient Key Paths**: Use unique `creatureId` and `particleId` for fast lookups, avoiding complex queries.
2. **Minimal Indexes**: Limit indexes (e.g., `tier`, `creatureId`) to balance query speed and write performance.
3. **Batch Operations**: Perform bulk saves/loads for particles to reduce transaction overhead [Timestamp: April 14, 2025, 19:58].
4. **Off-Thread Processing**: Offload complex operations (e.g., migrations, batch writes) to `storageWorker.ts` to avoid main thread blocking.
5. **Data Compression**: Store compact data (e.g., `number[]` for positions) to minimize storage footprint.

## Integration Points
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` defines and manages the schema, with `storageWorker.ts` for off-thread tasks.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` persists `ICreatureState` and `IParticleState`.
- **Particle Domain (`src/domains/creature/`)**: `particleService.ts` saves particle positions and velocities.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` uses loaded state for visual consistency.
- **Workers Domain (`src/domains/workers/`)**: `storageWorker.ts` offloads storage operations, coordinated by `workerBridge.ts`.

## Rules Adherence
- **Determinism**: Schema operations are deterministic, using fixed key paths and versioned migrations [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Schema logic is encapsulated in `StorageService.ts`, with clear interfaces [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 10ms writes and < 5ms reads, supporting real-time gameplay [Timestamp: April 14, 2025, 19:58].
- **Integration**: Supports evolution, physics, and rendering, ensuring seamless state persistence.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate state persistence code (e.g., in `src/creatures/` or `src/lib/`), likely using localStorage or ad-hoc methods.
2. **Define Schema**: Implement the `ProtozoaDB` schema in `StorageService.ts`, creating `creatureState`, `particleState`, and `simulationState` stores.
3. **Refactor Integrations**: Update `evolutionTracker.ts` and `particleService.ts` to use the new schema for state persistence.
4. **Test Schema**: Validate store operations and migrations with Jest tests, ensuring data integrity and performance.
5. **Optimize Access**: Implement batch operations and off-thread processing to meet performance targets.

## Example Integration
```typescript
// src/domains/evolution/services/evolutionTracker.ts
import { storageService } from 'src/shared/services/StorageService';
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';

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

  async updateEvolutionState(creature: ICreature, mutation: IMutation, blockData: IBlockData): Promise<void> {
    const store = useEvolutionStore.getState();
    const creatureState = store.creatures[creature.id];
    creatureState.mutationCount++;
    store.updateCreature(creature.id, creatureState);
    await storageService.save('creatureState', creature.id, creatureState);
    creature.particles.forEach(async (p, i) => {
      const particleState = { particleId: `${creature.id}_${i}`, creatureId: creature.id, role: p.role, mutations: [mutation], stats: p.stats };
      await storageService.save('particleState', particleState.particleId, particleState);
    });
  }
}
```


