
# Mutation Trait Generation

## Purpose
This document details the generation and application of mutation traits in Bitcoin Protozoa, building on the extensive 200-trait bank discussed previously [Timestamp: April 12, 2025, 12:18], to drive evolutionary changes in creatures and their particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and deterministic RNG driven by Bitcoin block data, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/evolution/mutation_trait_generation.md`

## Overview
Mutation traits in Bitcoin Protozoa are specialized attributes applied to particles or creatures during evolution, altering stats, behaviors, or visuals (e.g., “Enhanced Reflexes” boosts dodge chance). Managed by `traitService.ts` in the `traits` domain and triggered by `evolutionService.ts`, the generation process leverages a large trait bank (200+ mutations) organized by role and rarity (COMMON to MYTHIC). The process is deterministic, using block nonce-seeded RNG to ensure consistent trait selection, and integrates with rendering, physics, and game theory systems. This document outlines the generation workflow, rules for trait selection, and integration points, ensuring modularity and performance for up to 500 particles.

## Mutation Trait Generation Workflow
The mutation trait generation process involves selecting and applying traits to particles or creatures when evolutionary triggers are activated. The workflow includes:

1. **Trigger Activation**:
   - Receive a trigger signal from `evolutionService.ts` (e.g., block confirmation or battle win).
2. **Seed RNG**:
   - Use the block nonce from `bitcoinService.ts` to seed the RNG, ensuring deterministic trait selection.
3. **Retrieve Mutation Pool**:
   - Access role-specific mutation traits from `src/domains/traits/data/mutationPatterns/` (e.g., `mutationPatterns/defense.ts`).
4. **Select Trait by Rarity**:
   - Determine rarity (e.g., COMMON, RARE) using RNG and role-based probabilities (e.g., 70% COMMON, 5% MYTHIC).
   - Choose a trait from the filtered pool.
5. **Apply Trait**:
   - Assign the mutation trait to targeted particles or the creature, updating stats or behavior via `evolutionTracker.ts`.
6. **Propagate Changes**:
   - Sync updates to rendering (`instancedRenderer.ts`), physics (`forceWorker.ts`), and game theory (`payoffMatrixService.ts`) systems.

### Rules for Trait Selection
- **Deterministic Selection**: The RNG, seeded by block nonce, ensures the same trait is selected for identical inputs.
- **Role-Specific Pools**:
  - **CORE**: Traits enhance resilience (e.g., “Iron Core” increases health by 10%).
  - **CONTROL**: Traits boost decision-making (e.g., “Tactical Mind” adds +5% strategy accuracy).
  - **MOVEMENT**: Traits improve speed (e.g., “Swift Stride” increases velocity by 15%).
  - **DEFENSE**: Traits reduce damage (e.g., “Reinforced Shell” cuts damage taken by 20%).
  - **ATTACK**: Traits amplify damage (e.g., “Fury Strike” boosts damage by 25%).
- **Rarity Probabilities**:
  - COMMON: 70%, UNCOMMON: 20%, RARE: 7%, EPIC: 2%, MYTHIC: 1%.
  - Modified by triggers (e.g., 10 confirmations increase MYTHIC chance by 0.5%).
- **Trait Stacking Limits**: Maximum of 3 mutations per particle to prevent overpowered builds, tracked by `evolutionTracker.ts`.
- **Trait Synergies**: Some mutations enhance existing traits (e.g., “Fury Strike” doubles “Aggressive” behavior damage boost).

### Example Mutation Trait Generation
```typescript
// src/domains/traits/services/traitService.ts
import { Singleton } from 'typescript-singleton';
import { Role, Rarity } from 'src/shared/types/core';
import { IParticle } from 'src/domains/creature/types/particle';
import { IMutation } from 'src/domains/traits/types/mutation';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';
import { defenseMutationPatterns } from 'src/domains/traits/data/mutationPatterns/defense';

class TraitService extends Singleton {
  assignTrait(particle: { id: string, role: Role }, blockData: IBlockData, type: 'mutation'): IMutation {
    const rng = createRNGFromBlock(blockData.nonce).getStream('mutations');
    const pool = this.getMutationPool(particle.role);
    const rarity = this.determineRarity(rng, blockData.confirmations);
    const filtered = pool.filter(t => t.rarity === rarity);
    return filtered[Math.floor(rng() * filtered.length)] || pool[0];
  }

  private getMutationPool(role: Role): IMutation[] {
    switch (role) {
      case Role.DEFENSE:
        return defenseMutationPatterns; // 200+ traits
      // Other roles
      default:
        return [];
    }
  }

  private determineRarity(rng: () => number, confirmations: number): Rarity {
    const mythicBoost = confirmations * 0.005; // 0.5% per confirmation
    const rand = rng();
    if (rand < 0.7) return Rarity.COMMON;
    if (rand < 0.9) return Rarity.UNCOMMON;
    if (rand < 0.97) return Rarity.RARE;
    if (rand < 0.99) return Rarity.EPIC;
    if (rand < 0.01 + mythicBoost) return Rarity.MYTHIC;
    return Rarity.COMMON;
  }
}

export const traitService = TraitService.getInstance();
```

## Performance Considerations
To ensure efficient trait generation for 500 particles:
1. **Batch Processing**: Generate traits for multiple particles in a single pass to minimize RNG calls.
2. **Cache Mutation Pools**: Store role-specific mutation pools in `traitService.ts` to avoid repeated data access.
3. **Throttle Generation**: Limit trait generation to triggered events (e.g., block confirmations) to reduce overhead.
4. **Off-Thread Processing**: Delegate complex trait selection to `computeWorker.ts` for performance.

## Integration Points
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` manages mutation trait generation and assignment.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionService.ts` triggers generation, with `evolutionTracker.ts` tracking applied mutations.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for trait application.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes mutation effects.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` incorporates mutation effects.

## Rules Adherence
- **Determinism**: Trait selection uses seeded RNG, ensuring consistent outcomes.
- **Modularity**: Generation logic is encapsulated in `traitService.ts`, with clear interfaces.
- **Performance**: Targets < 5ms for generating traits for 500 particles, leveraging caching and batch processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate mutation generation code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Trait Service**: Move logic to `src/domains/traits/services/traitService.ts`, ensuring RNG-based determinism.
3. **Update Mutation Pools**: Populate `src/domains/traits/data/mutationPatterns/` with 200+ traits, as discussed [Timestamp: April 12, 2025, 12:18].
4. **Test Determinism**: Verify consistent trait selection for the same block nonce using Jest tests.
5. **Validate Performance**: Measure generation time for 500 particles, targeting < 5ms, using profiling tools.

## Example Test
```typescript
// tests/unit/traitService.test.ts
describe('TraitService', () => {
  test('generates RARE mutation for DEFENSE with confirmations', () => {
    const blockData = createMockBlockData(12345, { confirmations: 10 });
    const particle = createMockParticle({ role: Role.DEFENSE });
    const mutation = traitService.assignTrait(particle, blockData, 'mutation');
    expect(mutation.rarity).toBe(Rarity.RARE);
    expect(mutation.effect).toBeDefined();
  });

  test('ensures deterministic mutation with same nonce', () => {
    const blockData = createMockBlockData(12345);
    const particle = createMockParticle({ role: Role.ATTACK });
    const mutation1 = traitService.assignTrait(particle, blockData, 'mutation');
    const mutation2 = traitService.assignTrait(particle, blockData, 'mutation');
    expect(mutation1.id).toEqual(mutation2.id);
  });
});
```

