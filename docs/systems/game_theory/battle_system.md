
# Battle System

## Overview
The Battle System in Bitcoin Protozoa simulates interactions between creatures, determining outcomes based on game theory principles such as Nash equilibrium and decision trees. It is a critical component for gameplay, ensuring battles are deterministic and balanced. This document outlines the system's implementation within the new domain-driven design (DDD) structure, integrating with other domains like traits and evolution, and adhering to project rules.

## Implementation
The Battle System is implemented within the `gameTheory` domain under `src/domains/gameTheory/`, following the DDD structure from `directory_map.md`. It includes types, services, and data necessary for battle simulations.

### Directory Structure
```
src/domains/gameTheory/
├── types/
│   ├── battleOutcome.ts       # Battle outcome type definitions
│   ├── payoffMatrix.ts        # Payoff matrix type definitions
│   ├── decisionTree.ts        # Decision tree type definitions
│   ├── nashEquilibrium.ts     # Nash equilibrium type definitions
│   ├── utilityFunction.ts     # Utility function type definitions
│   └── index.ts               # Game theory types exports
├── services/
│   ├── gameTheoryStrategyService.ts # Comprehensive strategy service
│   ├── decisionTreeService.ts       # Decision tree service
│   ├── nashEquilibriumFinder.ts     # Nash equilibrium finder service
│   ├── payoffMatrixService.ts       # Matrix generation service
│   ├── utilityFunctionService.ts    # Utility function service
│   └── index.ts                     # Game theory services exports
├── data/
│   ├── strategies.json              # Static strategy data
│   └── index.ts                     # Game theory data exports
└── index.ts                         # Game theory domain exports
```

### Key Components
- **Types (`types/*.ts`)**: Define structures for battle outcomes, payoff matrices, decision trees, Nash equilibria, and utility functions.
- **Services (`services/*.ts`)**: Contain logic for battle simulations, including strategy evaluation, decision-making, and outcome determination.
- **Data (`data/strategies.json`)**: Stores static strategy data used in battle simulations.

### Migration of Existing Resources
- **Game Theory Logic**: Any existing game theory logic in the current GitHub repository (e.g., from the README or scattered code) should be refactored into the new `gameTheory` domain services.
- **Trait Integration**: Traits affecting battles should be integrated through the `traits` domain, ensuring modularity.

### Code Examples
#### Battle Service
The `gameTheoryStrategyService.ts` handles the core battle logic.
```typescript
// src/domains/gameTheory/services/gameTheoryStrategyService.ts
import { Singleton } from 'typescript-singleton';
import { IBattleOutcome } from 'src/domains/gameTheory/types/battleOutcome';
import { ICreature } from 'src/domains/creature/types/creature';

class GameTheoryStrategyService extends Singleton {
  simulateBattle(creature1: ICreature, creature2: ICreature): IBattleOutcome {
    // Logic to simulate battle using game theory principles
    return { winner: creature1, scores: { creature1: 10, creature2: 5 } };
  }
}

export const gameTheoryStrategyService = GameTheoryStrategyService.getInstance();
```

## Integration
The Battle System integrates with:
- **Creature Domain (`src/domains/creature/`)**: Uses creature data for battle simulations.
- **Traits Domain (`src/domains/traits/`)**: Applies trait effects to battle outcomes.
- **Rendering Domain (`src/domains/rendering/`)**: Visualizes battle simulations.

## Rules Adherence
- **Determinism**: Battle outcomes are deterministic, based on creature traits and static strategy data.
- **Modularity**: The system is designed to be extendable and modifiable without affecting other components.
- **API Usage**: No direct API calls are made; the system relies on static data and creature properties.

## Migration Steps
1. **Refactor Game Theory Logic**: Move any existing game theory logic from the current GitHub repository to the new `gameTheory` domain services.
2. **Integrate with Traits**: Ensure traits affecting battles are correctly applied through the `traits` domain.
3. **Test Integration**: Verify that battle simulations correctly use creature data and traits to determine outcomes.

This implementation ensures the Battle System is modular, efficient, and aligned with the project's DDD structure as outlined in `directory_map.md`, providing a single source of truth for the Battle System.
