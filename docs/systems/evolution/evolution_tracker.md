Below is the `evolution_tracker.md` document designed using the new domain-driven directory map from `directory_map.md`. It integrates existing resources from the Bitcoin Protozoa GitHub repository, migrating them into the cleaner, more efficient structure while maintaining a robust DDD approach.


# Evolution Tracker

## Overview
The Evolution Tracker is a core component of the Bitcoin Protozoa project, responsible for monitoring and managing creature evolution based on Bitcoin block confirmations. It triggers mutations at predefined confirmation milestones, ensuring determinism through integration with the RNG system and adherence to project rules. This document outlines the implementation within the new domain-driven design (DDD) directory structure, leveraging existing resources from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) for a seamless migration.

## Implementation
The Evolution Tracker resides within the `evolution` domain under `src/domains/evolution/`, following the DDD structure outlined in `directory_map.md`. It comprises types, services, data, components, and hooks, ensuring modularity and clarity.

### Directory Structure
```
src/domains/evolution/
├── types/
│   ├── evolution.ts       # Evolution type definitions
│   └── index.ts           # Evolution types exports
├── services/
│   ├── evolutionService.ts # Evolution service logic
│   └── index.ts           # Evolution services exports
├── data/
│   ├── evolutionRules.json # Static evolution rules
│   └── index.ts           # Evolution data exports
├── components/
│   ├── EvolutionTracker/  # Evolution tracker UI component
│   └── index.ts           # Evolution components exports
├── hooks/
│   ├── useEvolution.ts    # Evolution state management hook
│   └── index.ts           # Evolution hooks exports
└── index.ts               # Evolution domain exports
```

### Key Components
- **Types (`types/evolution.ts`)**: Define structures for evolution data, such as milestones and mutation triggers.
- **Services (`services/evolutionService.ts`)**: Contain business logic for tracking evolution and triggering mutations.
- **Data (`data/evolutionRules.json`)**: Store static rules, including confirmation milestones and mutation probabilities.
- **Components (`components/EvolutionTracker/`)**: Provide UI elements to visualize evolution progress.
- **Hooks (`hooks/useEvolution.ts`)**: Manage evolution state and logic within React components.

### Migration of Existing Resources
The following resources from the current GitHub repository are identified and migrated:
- **`src/lib/rngSystem.ts`**: The RNG system, used for deterministic mutation triggers, is referenced from `src/shared/lib/rngSystem.ts` in the new structure. Its `createRNGFromBlock` function is imported for evolution logic.
- **`src/services/traits/traitService.ts`**: Existing mutation-related logic is refactored into `evolutionService.ts`, separating evolution-specific concerns from traits.
- **Block Data Integration**: Bitcoin block data fetching, noted in the GitHub README under "Bitcoin Integration," is handled by `src/domains/bitcoin/services/bitcoinService.ts` and consumed by the Evolution Tracker.
- **No Direct Evolution File**: The current codebase lacks a dedicated evolution file, so this implementation consolidates scattered logic (e.g., mutation triggers) into the new `evolution` domain.

### Code Examples
#### Evolution Service
The `evolutionService.ts` handles the core logic for checking evolution triggers based on block confirmations.
```typescript
// src/domains/evolution/services/evolutionService.ts
import { Singleton } from 'typescript-singleton';
import { IBlockData } from 'src/shared/types/core';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';

class EvolutionService extends Singleton {
  private milestones = [10000, 50000, 100000, 250000, 500000, 1000000];
  private mutationChances = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00];

  checkEvolution(blockData: IBlockData): boolean {
    const confirmations = blockData.confirmations;
    const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
    for (let i = 0; i < this.milestones.length; i++) {
      if (confirmations >= this.milestones[i] && rng() < this.mutationChances[i]) {
        return true;
      }
    }
    return false;
  }
}

export const evolutionService = EvolutionService.getInstance();
```

#### Evolution Tracker Component
The `EvolutionTracker` component displays evolution status using block data.
```typescript
// src/domains/evolution/components/EvolutionTracker.tsx
import React from 'react';
import { useBitcoinData } from 'src/domains/bitcoin/hooks/useBitcoinData';
import { evolutionService } from 'src/domains/evolution/services/evolutionService';

export const EvolutionTracker = () => {
  const { blockData } = useBitcoinData();
  const canEvolve = evolutionService.checkEvolution(blockData);

  return (
    <div>
      <h2>Evolution Status</h2>
      <p>Confirmations: {blockData.confirmations}</p>
      <p>Can Evolve: {canEvolve ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

#### Evolution Hook
The `useEvolution` hook manages evolution state for components.
```typescript
// src/domains/evolution/hooks/useEvolution.ts
import { useState, useEffect } from 'react';
import { useBitcoinData } from 'src/domains/bitcoin/hooks/useBitcoinData';
import { evolutionService } from 'src/domains/evolution/services/evolutionService';

export const useEvolution = () => {
  const { blockData } = useBitcoinData();
  const [canEvolve, setCanEvolve] = useState(false);

  useEffect(() => {
    setCanEvolve(evolutionService.checkEvolution(blockData));
  }, [blockData]);

  return { canEvolve, confirmations: blockData.confirmations };
};
```

## Integration
The Evolution Tracker integrates with:
- **Bitcoin Domain (`src/domains/bitcoin/`)**: Uses `useBitcoinData` hook and `bitcoinService.ts` for block confirmation data.
- **Shared RNG System (`src/shared/lib/rngSystem.ts`)**: Ensures deterministic mutation triggers using block nonce.

## Rules Adherence
- **Confirmation-Based Triggers**: Evolution relies solely on block confirmations, per project rules.
- **Determinism**: Mutations are deterministically triggered using the RNG system seeded with block nonce.
- **Milestone-Based**: Evolution occurs only at specified confirmation milestones (e.g., 10,000, 50,000).

## Migration Steps
1. **Refactor RNG Usage**: Import `createRNGFromBlock` from `src/shared/lib/rngSystem.ts`.
2. **Consolidate Mutation Logic**: Move mutation-related code from `traitService.ts` to `evolutionService.ts`.
3. **Create New Files**: Implement the `evolution` domain files as shown in the directory structure.
4. **Test Integration**: Verify Bitcoin data flows correctly to the Evolution Tracker and triggers mutations as expected.

This implementation enhances efficiency and modularity, aligning with the new DDD directory map while leveraging existing codebase strengths.

