
# Evolution State Management

## Purpose
This document describes how creature and particle evolutionary states are tracked and managed in Bitcoin Protozoa, including progression through tiers and subclasses, building on our prior discussions about robust state handling with Zustand and IndexedDB [Timestamp: April 16, 2025, 21:41]. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and deterministic processes driven by Bitcoin block data, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/evolution/evolution_state_management.md`

## Overview
The evolution system in Bitcoin Protozoa drives creature adaptation through mutations, with state management tracking progress, such as evolution tiers, mutation counts, and applied traits. Managed by `evolutionTracker.ts` in the `evolution` domain and leveraging Zustand for reactive state management and IndexedDB for persistence [Timestamp: April 16, 2025, 21:41], the system ensures deterministic updates based on block confirmations and static creature data. This document outlines the state management workflow, data structures, and integration points, ensuring modularity, persistence, and performance for up to 500 particles per creature.

## State Management Workflow
The evolution state management process tracks and updates creature and particle states during evolutionary events. The workflow includes:

1. **Initialize State**:
   - Create initial state for creatures and particles in `evolutionTracker.ts`, including tier, mutation count, and applied traits.
2. **Monitor Triggers**:
   - Receive trigger signals from `evolutionService.ts` (e.g., block confirmations, battle wins) to initiate state updates.
3. **Update State**:
   - Increment evolution tier, add mutations, or modify stats based on trigger outcomes, using deterministic logic.
4. **Persist State**:
   - Save updated state to IndexedDB via `StorageService.ts` for persistence across sessions [Timestamp: April 16, 2025, 21:41].
5. **Sync with Zustand**:
   - Update reactive state in Zustand store to notify rendering, physics, and game theory systems of changes.
6. **Propagate Changes**:
   - Apply state updates to `ICreature` and `IParticle` data, syncing with `instancedRenderer.ts`, `forceWorker.ts`, and `payoffMatrixService.ts`.

### Data Structures
- **Creature State**:
  ```typescript
  // src/domains/evolution/types/evolutionState.ts
  export interface IEvolutionState {
    creatureId: string;
    tier: number; // 1 to 5 (e.g., 1 = Basic, 5 = Apex)
    mutationCount: number; // Total mutations applied
    subclass: string; // e.g., "Guardian" for DEFENSE-heavy
    lastTriggerBlock: number; // Last block nonce triggering evolution
  }
  ```
- **Particle State**:
  ```typescript
  export interface IParticleEvolutionState {
    particleId: string;
    role: Role;
    mutations: IMutation[]; // Applied mutation traits
    stats: { health: number; damage: number; speed: number };
  }
  ```
- **Zustand Store**:
  ```typescript
  // src/domains/evolution/stores/evolutionStore.ts
  import create from 'zustand';

  interface EvolutionStore {
    creatures: { [id: string]: IEvolutionState };
    particles: { [id: string]: IParticleEvolutionState };
    updateCreature: (id: string, state: Partial<IEvolutionState>) => void;
    updateParticle: (id: string, state: Partial<IParticleEvolutionState>) => void;
  }

  export const useEvolutionStore = create<EvolutionStore>(set => ({
    creatures: {},
    particles: {},
    updateCreature: (id, state) => set(s => ({ creatures: { ...s.creatures, [id]: { ...s.creatures[id], ...state } } })),
    updateParticle: (id, state) => set(s => ({ particles: { ...s.particles, [id]: { ...s.particles[id], ...state } } }))
  }));
  ```

### Rules for State Updates
- **Deterministic Updates**: State changes are driven by static conditions (e.g., block confirmations) or seeded RNG for mutation selection.
- **Tier Progression**:
  - Creatures advance tiers (1 to 5) after specific milestones (e.g., 10 block confirmations, 5 battle wins).
  - Each tier unlocks higher-rarity mutations (e.g., MYTHIC at tier 5).
- **Mutation Limits**: Maximum of 3 mutations per particle, tracked in `IParticleEvolutionState`, to prevent overpowered builds.
- **Subclass Assignment**: Determined by dominant role (e.g., >50% DEFENSE particles = “Guardian” subclass), updated at tier milestones.
- **Persistence**: All state changes are saved to IndexedDB to ensure continuity across sessions.
- **Reactiveness**: Zustand ensures real-time updates to UI and gameplay systems.

### Example State Management
```typescript
// src/domains/evolution/services/evolutionTracker.ts
import { Singleton } from 'typescript-singleton';
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';
import { StorageService } from 'src/shared/services/StorageService';
import { ICreature } from 'src/domains/creature/types/creature';
import { IMutation } from 'src/domains/traits/types/mutation';

class EvolutionTracker extends Singleton {
  private storageService = new StorageService();

  async updateEvolutionState(creature: ICreature, mutation: IMutation, blockData: IBlockData): Promise<void> {
    const store = useEvolutionStore.getState();
    const creatureState = store.creatures[creature.id] || {
      creatureId: creature.id,
      tier: 1,
      mutationCount: 0,
      subclass: this.determineSubclass(creature),
      lastTriggerBlock: blockData.nonce
    };

    // Update creature state
    creatureState.mutationCount++;
    if (creatureState.mutationCount % 10 === 0) {
      creatureState.tier = Math.min(creatureState.tier + 1, 5);
      creatureState.subclass = this.determineSubclass(creature);
    }
    store.updateCreature(creature.id, creatureState);

    // Update particle state
    creature.particles.forEach(p => {
      if (!p.evolutionState) {
        p.evolutionState = { particleId: p.id, role: p.role, mutations: [], stats: { health: 100, damage: 10, speed: 1 } };
      }
      if (p.evolutionState.mutations.length < 3) {
        p.evolutionState.mutations.push(mutation);
        p.evolutionState.stats.health += mutation.stats?.health || 0;
      }
      store.updateParticle(p.id, p.evolutionState);
    });

    // Persist to IndexedDB
    await this.storageService.save('evolutionState', creature.id, creatureState);
    await Promise.all(creature.particles.map(p => this.storageService.save('particleState', p.id, p.evolutionState)));
  }

  private determineSubclass(creature: ICreature): string {
    const roleCounts = creature.particles.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {} as { [key in Role]: number });
    const dominantRole = Object.entries(roleCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return dominantRole === Role.DEFENSE ? 'Guardian' : 'Default';
  }
}

export const evolutionTracker = EvolutionTracker.getInstance();
```

## Performance Considerations
To ensure efficient state management for 500 particles:
1. **Batch Updates**: Update creature and particle states in a single pass to minimize store operations.
2. **Cache State**: Use Zustand’s in-memory store to reduce IndexedDB access for frequent reads.
3. **Throttle Persistence**: Save to IndexedDB only on significant state changes (e.g., tier progression).
4. **Off-Thread Storage**: Delegate IndexedDB writes to `storageWorker.ts` to offload the main thread.

## Integration Points
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` manages state, with `evolutionService.ts` triggering updates.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` provides mutation traits for state updates.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for state management.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` reflects state changes (e.g., mutation visuals).
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses updated stats.
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists state to IndexedDB.

## Rules Adherence
- **Determinism**: State updates use static conditions and seeded RNG, ensuring consistency.
- **Modularity**: State management is encapsulated in `evolutionTracker.ts`, with clear interfaces.
- **Performance**: Targets < 5ms for state updates for 500 particles, leveraging batch processing and caching.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate state management code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Tracker**: Move logic to `src/domains/evolution/services/evolutionTracker.ts`, integrating Zustand and IndexedDB [Timestamp: April 16, 2025, 21:41].
3. **Update Integrations**: Ensure `evolutionService.ts` and `StorageService.ts` sync with the new state system.
4. **Test State Consistency**: Verify state persistence and reactivity using Jest tests.
5. **Validate Performance**: Measure update time for 500 particles, targeting < 5ms, using profiling tools.

## Example Test
```typescript
// tests/unit/evolutionTracker.test.ts
describe('EvolutionTracker', () => {
  test('updates creature tier after 10 mutations', async () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData);
    const mutation = { id: 'mutation_001', effect: 'health_boost', stats: { health: 10 } };
    for (let i = 0; i < 10; i++) {
      await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
    }
    const store = useEvolutionStore.getState();
    expect(store.creatures[creature.id].tier).toBe(2);
  });

  test('persists particle state to IndexedDB', async () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData);
    const mutation = { id: 'mutation_001', effect: 'health_boost', stats: { health: 10 } };
    await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
    const stored = await StorageService.load('particleState', creature.particles[0].id);
    expect(stored.mutations[0].id).toBe('mutation_001');
  });
});
```

