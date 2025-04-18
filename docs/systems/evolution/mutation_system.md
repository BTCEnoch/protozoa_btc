
# Mutation System

## Overview
The Mutation System in Bitcoin Protozoa manages the application of mutations to creatures based on predefined rules and triggers. It integrates with the Evolution Tracker to apply mutations when specific confirmation milestones are reached. The system ensures determinism through the RNG system and adheres to the project's rules by using only the block nonce for randomness and confirmations for triggers.

## Implementation
The Mutation System is implemented within the `evolution` domain, specifically under `src/domains/evolution/services/mutationService.ts`. It uses the RNG system for deterministic mutation selection and applies mutations to creatures based on the evolution triggers.

### Directory Structure
```
src/domains/evolution/
├── services/
│   ├── mutationService.ts # Mutation service logic
│   └── index.ts           # Evolution services exports
```

### Key Components
- **Mutation Service (`services/mutationService.ts`)**: Contains the logic for selecting and applying mutations to creatures.
- **Data (`data/mutations/`)**: Stores static mutation definitions for different rarity levels.

### Migration of Existing Resources
- **Trait Service (`src/services/traits/traitService.ts`)**: Existing mutation logic is refactored into `mutationService.ts` to separate concerns.
- **RNG System (`src/lib/rngSystem.ts`)**: The RNG system is used for deterministic mutation selection, ensuring consistency across instances.

### Code Examples
#### Mutation Service
The `mutationService.ts` handles the selection and application of mutations.
```typescript
// src/domains/evolution/services/mutationService.ts
import { Singleton } from 'typescript-singleton';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';
import { IMutation } from 'src/domains/traits/types/mutation';
import { ICreature } from 'src/domains/creature/types/creature';

class MutationService extends Singleton {
  applyMutation(creature: ICreature, blockData: IBlockData): IMutation | null {
    const rng = createRNGFromBlock(blockData.nonce).getStream('mutations');
    const mutationPool = this.getMutationPool(creature);
    if (rng() < this.getMutationChance(blockData.confirmations)) {
      const mutation = this.selectMutation(mutationPool, rng);
      this.applyMutationToCreature(creature, mutation);
      return mutation;
    }
    return null;
  }

  private getMutationPool(creature: ICreature): IMutation[] {
    // Logic to get available mutations based on creature state
    return [];
  }

  private getMutationChance(confirmations: number): number {
    // Logic to determine mutation chance based on confirmations
    return 0.01;
  }

  private selectMutation(pool: IMutation[], rng: () => number): IMutation {
    // Logic to select a mutation from the pool using RNG
    return pool[0];
  }

  private applyMutationToCreature(creature: ICreature, mutation: IMutation): void {
    // Logic to apply mutation to creature
  }
}

export const mutationService = MutationService.getInstance();
```

## Integration
The Mutation System integrates with:
- **Evolution Tracker (`src/domains/evolution/services/evolutionService.ts`)**: Uses the `checkEvolution` method to determine if a mutation should be applied.
- **RNG System (`src/shared/lib/rngSystem.ts`)**: Ensures deterministic mutation selection using the block nonce.

## Rules Adherence
- **Confirmation-Based Triggers**: Mutations are triggered based on block confirmations, adhering to the project's rules.
- **Determinism**: Mutation selection is deterministic, using the RNG system seeded with the block nonce.
- **Milestone-Based**: Mutations occur only at specified confirmation milestones, as defined in the project rules.

## Migration Steps
1. **Refactor Mutation Logic**: Move mutation-related code from `traitService.ts` to `mutationService.ts`.
2. **Integrate RNG System**: Use the RNG system for mutation selection to ensure determinism.
3. **Define Mutation Data**: Populate `data/mutations/` with static mutation definitions.
4. **Test Integration**: Verify that mutations are correctly applied based on evolution triggers and RNG outcomes.

This implementation ensures the Mutation System is modular, efficient, and aligned with the project's DDD structure and rules.

