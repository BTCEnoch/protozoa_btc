
# Nash Equilibrium Calculation

## Purpose
This document details the implementation of Nash equilibrium calculations in Bitcoin Protozoa to determine optimal strategies for creature battles, ensuring balanced and fair gameplay. It serves as a single source of truth for developers, specifying how particle roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and traits influence equilibrium outcomes, tailored to the project’s deterministic and particle-based design.

## Location
`new_docs/systems/game_theory/nash_equilibrium_calculation.md`

## Overview
In Bitcoin Protozoa, Nash equilibrium calculations identify strategies where no creature can improve its outcome by unilaterally changing its strategy, promoting balanced gameplay. Implemented in the `nashEquilibriumFinder.ts` service within the `gameTheory` domain, these calculations use payoff matrices generated from particle roles and traits to determine optimal battle strategies (e.g., Attack, Defend). The process is deterministic, relying on static creature data and trait effects, ensuring consistent outcomes across runs. This document outlines the calculation workflow, algorithms, and integration points, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Nash Equilibrium Concepts
- **Definition**: A Nash equilibrium is a set of strategies where each creature’s choice is optimal given the other’s strategy, so neither has an incentive to deviate.
- **Application**: In battles, equilibria determine stable strategies (e.g., both creatures defending) based on particle compositions.
- **Payoff Matrix**: A matrix from `payoffMatrixService.ts` provides payoff pairs (e.g., [damage to opponent, damage taken]) for strategy combinations.

### Example Payoff Matrix
For two creatures with strategies “Attack” and “Defend”:
| Creature A \ Creature B | Attack | Defend |
|-------------------------|--------|--------|
| **Attack**              | [50, 50] | [70, 30] |
| **Defend**              | [30, 70] | [40, 40] |
- **Equilibrium**: If both choose Defend ([40, 40]), neither benefits by switching to Attack, as [30, 70] or [70, 30] yields lower payoffs for one.

## Calculation Workflow
The Nash equilibrium calculation workflow involves:

1. **Retrieve Payoff Matrix**:
   - Access the `IPayoffMatrix` from `payoffMatrixService.ts`, containing payoffs based on particle roles and traits.
2. **Analyze Strategies**:
   - Identify each creature’s strategies (e.g., Attack, Defend) and corresponding payoffs.
3. **Find Pure Strategy Equilibria**:
   - Check for strategy pairs where neither creature can improve its payoff by changing its strategy.
4. **Compute Mixed Strategy Equilibria (if needed)**:
   - For matrices without pure equilibria, calculate probabilities for each strategy to balance expected payoffs.
5. **Select Optimal Strategy**:
   - Choose the equilibrium strategy (pure or mixed) with the highest utility, guided by `utilityFunctionService.ts`.
6. **Apply Strategy**:
   - Return the selected strategy to `gameTheoryStrategyService.ts` for battle execution.

### Rules for Equilibrium Calculation
- **Role Contributions**:
  - **CORE**: Stabilizes outcomes, increasing equilibrium payoff reliability (+0.1% per particle).
  - **CONTROL**: Enhances strategic accuracy, favoring optimal equilibria (+0.05% per particle).
  - **MOVEMENT**: Boosts aggressive strategies, shifting equilibria toward Attack (+0.1% per particle).
  - **DEFENSE**: Favors defensive equilibria, reducing damage taken (+0.2% per particle).
  - **ATTACK**: Increases offensive payoffs, promoting Attack equilibria (+0.25% per particle).
- **Trait Modifiers**:
  - **Abilities**: Adjust payoff values (e.g., “Fire Blast” adds +10 damage).
  - **Behaviors**: Influence strategy weights (e.g., “Cautious” boosts Defend by 10%).
  - **Mutations**: Add dynamic effects (e.g., “Enhanced Reflexes” reduces damage taken by 5%).
- **Determinism**: Calculations use static creature data and trait effects, ensuring identical equilibria for the same inputs.

### Example Equilibrium Calculation
For the matrix above:
- **Pure Strategy Check**:
  - Attack vs. Attack ([50, 50]): A could switch to Defend ([30, 70]), gaining 20, so not stable.
  - Defend vs. Defend ([40, 40]): Neither can improve (Attack yields [30, 70] or [70, 30], worse for one), so stable.
- **Result**: Pure equilibrium at (Defend, Defend).

## Implementation
The `nashEquilibriumFinder.ts` service computes Nash equilibria, integrating with `payoffMatrixService.ts` and `utilityFunctionService.ts`.

### Example Implementation
```typescript
// src/domains/gameTheory/services/nashEquilibriumFinder.ts
import { Singleton } from 'typescript-singleton';
import { IPayoffMatrix } from 'src/domains/gameTheory/types/payoffMatrix';
import { INashEquilibrium } from 'src/domains/gameTheory/types/nashEquilibrium';

class NashEquilibriumFinder extends Singleton {
  findEquilibria(matrix: IPayoffMatrix): INashEquilibrium[] {
    const equilibria: INashEquilibrium[] = [];
    const { payoffs, strategies } = matrix;

    // Check for pure strategy equilibria
    for (let i = 0; i < strategies.length; i++) {
      for (let j = 0; j < strategies.length; j++) {
        const [payoffA, payoffB] = payoffs[i][j];
        const isStableA = this.isBestResponseA(i, j, payoffs);
        const isStableB = this.isBestResponseB(i, j, payoffs);
        if (isStableA && isStableB) {
          equilibria.push({
            strategies: [strategies[i], strategies[j]],
            payoffs: [payoffA, payoffB]
          });
        }
      }
    }

    return equilibria;
  }

  private isBestResponseA(row: number, col: number, payoffs: number[][][]): boolean {
    const currentPayoff = payoffs[row][col][0];
    for (let i = 0; i < payoffs.length; i++) {
      if (i !== row && payoffs[i][col][0] > currentPayoff) {
        return false; // Another strategy yields a better payoff
      }
    }
    return true;
  }

  private isBestResponseB(row: number, col: number, payoffs: number[][][]): boolean {
    const currentPayoff = payoffs[row][col][1];
    for (let j = 0; j < payoffs[0].length; j++) {
      if (j !== col && payoffs[row][j][1] > currentPayoff) {
        return false;
      }
    }
    return true;
  }
}

export const nashEquilibriumFinder = NashEquilibriumFinder.getInstance();
```

## Performance Considerations
To ensure efficient equilibrium calculations for 500 particles:
1. **Simplify Matrices**: Limit strategies to key options (e.g., Attack, Defend) to reduce matrix size.
2. **Cache Equilibria**: Store results for common matchups in `nashEquilibriumFinder.ts`.
3. **Batch Processing**: Compute equilibria for multiple scenarios in a single pass.
4. **Off-Thread Processing**: Use `computeWorker.ts` for complex calculations to offload the main thread.

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `nashEquilibriumFinder.ts` integrates with `payoffMatrixService.ts` for matrix inputs and `gameTheoryStrategyService.ts` for strategy selection.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for role and trait inputs.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IAbility`, `IBehavior`, and `IMutation` traits to adjust payoffs.
- **Workers Domain (`src/domains/workers/`)**: Offloads computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Equilibria are calculated using static data, ensuring consistency.
- **Modularity**: Calculation logic is encapsulated in `nashEquilibriumFinder.ts`, with clear interfaces.
- **Performance**: Targets < 10ms per calculation, optimized with caching and off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate game theory code (e.g., in `src/lib/` or `src/creatures/`) related to strategic outcomes.
2. **Refactor into Equilibrium Finder**: Move logic to `src/domains/gameTheory/services/nashEquilibriumFinder.ts`.
3. **Integrate Particle Data**: Update to use `IParticle` roles and traits for payoff inputs.
4. **Optimize Performance**: Implement caching and off-thread processing for efficiency.
5. **Test Equilibria**: Validate equilibrium outcomes using Jest, ensuring balanced strategies.

## Example Test
```typescript
// tests/unit/nashEquilibriumFinder.test.ts
describe('NashEquilibriumFinder', () => {
  test('finds pure equilibrium for balanced creatures', () => {
    const matrix = {
      strategies: ['Attack', 'Defend'],
      payoffs: [[[50, 50], [70, 30]], [[30, 70], [40, 40]]]
    };
    const equilibria = nashEquilibriumFinder.findEquilibria(matrix);
    expect(equilibria).toContainEqual({
      strategies: ['Defend', 'Defend'],
      payoffs: [40, 40]
    });
  });
});
```

 