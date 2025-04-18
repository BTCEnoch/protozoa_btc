Below is the populated `game_theory.md` document for the Bitcoin Protozoa project, designed to align with the new domain-driven design (DDD) directory structure outlined in `directory_map.md`. This document provides a single source of truth for the game theory system, detailing how the current implementation on GitHub can be restructured into the new format while maintaining clarity and modularity.


# Game Theory System

## Overview
The Game Theory System in Bitcoin Protozoa applies game theory principles—such as Nash equilibrium, decision trees, and utility functions—to simulate strategic interactions between creatures, primarily in battle scenarios and decision-making processes. It ensures deterministic, balanced outcomes that align with the project's goals of modularity and scalability. This document outlines how the existing game theory logic (as seen in the GitHub repository) is restructured into the new DDD framework under `src/domains/gameTheory/`, providing a centralized and maintainable implementation.

## Directory Structure
The game theory logic is centralized in the `gameTheory` domain under `src/domains/gameTheory/`, adhering to the structure in `directory_map.md`. This modular design isolates game theory components and facilitates integration with other domains.

```
src/domains/gameTheory/
├── types/
│   ├── payoffMatrix.ts        # Payoff matrix type definitions
│   ├── decisionTree.ts        # Decision tree type definitions
│   ├── nashEquilibrium.ts     # Nash equilibrium type definitions
│   ├── utilityFunction.ts     # Utility function type definitions
│   ├── battleOutcome.ts       # Battle outcome type definitions
│   └── index.ts               # Game theory types exports
├── services/
│   ├── gameTheoryStrategyService.ts # Comprehensive strategy service
│   ├── decisionTreeService.ts       # Decision tree service
│   ├── nashEquilibriumFinder.ts     # Nash equilibrium finder service
│   ├── payoffMatrixService.ts       # Payoff matrix generation service
│   ├── utilityFunctionService.ts    # Utility function service
│   └── index.ts                     # Game theory services exports
├── data/
│   ├── strategies.json              # Static strategy data
│   └── index.ts                     # Game theory data exports
└── index.ts                         # Game theory domain exports
```

## Key Components
- **Types (`types/*.ts`)**: Define the core data structures for game theory calculations:
  - `IPayoffMatrix`: Represents payoff matrices for battle simulations.
  - `IDecisionTree`: Structures decision-making logic for creature behaviors.
  - `INashEquilibrium`: Defines Nash equilibrium outcomes.
  - `IUtilityFunction`: Calculates utility values for strategic choices.
  - `IBattleOutcome`: Stores results of battle simulations.
- **Services (`services/*.ts`)**: Contain the logic for game theory operations:
  - `gameTheoryStrategyService.ts`: Orchestrates battle simulations and strategy evaluations.
  - `decisionTreeService.ts`: Guides creature decision-making processes.
  - `nashEquilibriumFinder.ts`: Computes Nash equilibria for optimal strategies.
  - `payoffMatrixService.ts`: Builds payoff matrices based on creature traits.
  - `utilityFunctionService.ts`: Evaluates utility for different actions.
- **Data (`data/strategies.json`)**: Holds static data (e.g., predefined strategies or payoff values) to ensure deterministic outcomes.

## Integration
The Game Theory System connects with other domains:
- **Creature Domain (`src/domains/creature/`)**: Uses creature properties (e.g., traits, roles) to populate payoff matrices and utility functions.
- **Traits Domain (`src/domains/traits/`)**: Incorporates trait effects into game theory calculations, influencing battle outcomes.
- **Rendering Domain (`src/domains/rendering/`)**: Provides data for visualizing strategic interactions or battle results.

## Rules Adherence
- **Determinism**: Outcomes depend solely on static data and creature properties, ensuring repeatability.
- **Modularity**: Encapsulated within the `gameTheory` domain, with clear interfaces for external use.
- **API Usage**: Relies on in-memory data rather than external API calls, aligning with project constraints.

## Migration Steps
To transition from the current GitHub structure to the new DDD structure:
1. **Extract Existing Logic**: Identify and relocate game theory-related code (e.g., from battle simulations or creature behaviors in the GitHub repo) into the appropriate `services/*.ts` files.
2. **Define Types**: Create type definitions in `types/*.ts` based on existing data structures.
3. **Populate Data**: Transfer any static strategy or payoff data into `strategies.json`.
4. **Rewire Integration**: Update references to game theory logic in other domains (e.g., creature, traits) to use the new services.
5. **Validate**: Test battle simulations and decision-making to ensure consistency with the original implementation.

## Code Examples
### Game Theory Strategy Service
Handles battle simulations using game theory principles.
```typescript
// src/domains/gameTheory/services/gameTheoryStrategyService.ts
import { Singleton } from 'typescript-singleton';
import { IBattleOutcome } from 'src/domains/gameTheory/types/battleOutcome';
import { ICreature } from 'src/domains/creature/types/creature';
import { payoffMatrixService } from 'src/domains/gameTheory/services/payoffMatrixService';

class GameTheoryStrategyService extends Singleton {
  simulateBattle(creature1: ICreature, creature2: ICreature): IBattleOutcome {
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    // Simplified logic for determining winner based on payoff matrix
    return { winner: creature1, scores: { creature1: 10, creature2: 5 } };
  }
}

export const gameTheoryStrategyService = GameTheoryStrategyService.getInstance();
```

### Payoff Matrix Service
Generates payoff matrices based on creature traits.
```typescript
// src/domains/gameTheory/services/payoffMatrixService.ts
import { Singleton } from 'typescript-singleton';
import { IPayoffMatrix } from 'src/domains/gameTheory/types/payoffMatrix';
import { ICreature } from 'src/domains/creature/types/creature';

class PayoffMatrixService extends Singleton {
  generateMatrix(creature1: ICreature, creature2: ICreature): IPayoffMatrix {
    // Example logic using creature roles or traits
    return { roles: [creature1.role, creature2.role], payoffs: [[1, 0], [0, 1]] };
  }
}

export const payoffMatrixService = PayoffMatrixService.getInstance();
```

This document serves as the single source of truth for the Game Theory System, detailing its structure, functionality, and migration path within the Bitcoin Protozoa project’s new DDD framework.
