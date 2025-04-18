
# Extending the Game Theory System

## Purpose
This document guides developers on extending the game theory system in Bitcoin Protozoa by adding new strategies, interaction types, or mechanics without disrupting existing functionality. It serves as a single source of truth, ensuring extensions remain flexible, modular, and aligned with the project’s domain-driven design (DDD) principles, specifically tailored to its particle-based design, role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and deterministic RNG driven by Bitcoin block data.

## Location
`new_docs/systems/game_theory/extending_game_theory.md`

## Overview
The game theory system in Bitcoin Protozoa drives strategic interactions, such as battles, using payoff matrices, decision trees, Nash equilibria, and utility functions, all influenced by particle roles and traits. Its modular design, encapsulated within the `gameTheory` domain, supports extensions like new strategies (e.g., cooperative tactics) or interaction types (e.g., non-combat alliances). This document provides steps to introduce new features, best practices for maintaining compatibility, and guidelines for updating related systems, ensuring scalability and future-proofing while preserving determinism and performance (< 10ms calculations for 500 particles).

## Steps to Introduce a New Strategy
Adding a new strategy, such as “Cooperate” (e.g., creatures share health to boost resilience), involves the following steps:

1. **Define the Strategy’s Purpose and Mechanics**
   - **Purpose**: Specify the strategy’s role (e.g., Cooperate enhances team survival by pooling health).
   - **Mechanics**: Outline how it interacts with roles and traits (e.g., CORE particles amplify health sharing).
   - **Example**: Cooperate increases health by 10% for both creatures but reduces damage output by 20%.

2. **Update Strategy Definitions**
   - **Location**: Modify `src/domains/gameTheory/types/payoffMatrix.ts` to include the new strategy.
   - **Content**: Add “Cooperate” to the strategies array in `IPayoffMatrix`.
   - **Example**:
     ```typescript
     // src/domains/gameTheory/types/payoffMatrix.ts
     export interface IPayoffMatrix {
       roles: string[];
       strategies: string[]; // Updated to ['Attack', 'Defend', 'Cooperate']
       payoffs: number[][][];
     }
     ```

3. **Extend Payoff Matrix Construction**
   - **Location**: Update `src/domains/gameTheory/services/payoffMatrixService.ts` to support the new strategy.
   - **Content**: Add payoff calculations for Cooperate, factoring in role and trait contributions.
   - **Example**:
     ```typescript
     // src/domains/gameTheory/services/payoffMatrixService.ts
     class PayoffMatrixService {
       generateMatrix(creature1: ICreature, creature2: ICreature): IPayoffMatrix {
         const attack1 = this.calculateAttackPayoff(creature1);
         const defense1 = this.calculateDefensePayoff(creature1);
         const cooperate1 = this.calculateCooperatePayoff(creature1);
         const attack2 = this.calculateAttackPayoff(creature2);
         const defense2 = this.calculateDefensePayoff(creature2);
         const cooperate2 = this.calculateCooperatePayoff(creature2);

         return {
           roles: [creature1.id, creature2.id],
           strategies: ['Attack', 'Defend', 'Cooperate'],
           payoffs: [
             [[attack1, attack2], [attack1 + 20, defense2 - 20], [attack1 - 10, cooperate2 + 10]],
             [[defense1 - 20, attack2 + 20], [defense1, defense2], [defense1 + 10, cooperate2 + 10]],
             [[cooperate1 + 10, attack2 - 10], [cooperate1 + 10, defense2 + 10], [cooperate1 + 15, cooperate2 + 15]]
           ]
         };
       }

       private calculateCooperatePayoff(creature: ICreature): number {
         const coreCount = creature.particles.filter(p => p.role === Role.CORE).length;
         let payoff = 50 + (coreCount * 0.1); // Health boost
         creature.particles.forEach(p => {
           if (p.abilityTrait?.effect === 'Healing Pulse') payoff += 5;
         });
         return payoff;
       }
     }
     ```

4. **Update Decision Tree Processing**
   - **Location**: Extend `src/domains/gameTheory/services/decisionTreeService.ts` to include the new strategy.
   - **Content**: Add a branch for Cooperate with weights influenced by CORE particles and behavior traits.
   - **Example**:
     ```typescript
     // src/domains/gameTheory/services/decisionTreeService.ts
     class DecisionTreeService {
       constructTree(creature1: ICreature, creature2: ICreature): IDecisionTree {
         const coreCount = creature1.particles.filter(p => p.role === Role.CORE).length;
         const behaviorModifier = creature1.particles.some(p => p.behaviorTrait?.action === 'Cooperative') ? 0.1 : 0;
         return {
           root: {
             type: 'decision',
             branches: [
               { strategy: 'Attack', weight: 0.33 },
               { strategy: 'Defend', weight: 0.33 },
               { strategy: 'Cooperate', weight: 0.34 + (coreCount * 0.05) + behaviorModifier }
             ]
           }
         };
       }
     }
     ```

5. **Adjust Utility Functions**
   - **Location**: Update `src/domains/gameTheory/services/utilityFunctionService.ts` to evaluate Cooperate’s utility.
   - **Content**: Incorporate health-sharing benefits and reduced damage output.
   - **Example**:
     ```typescript
     // src/domains/gameTheory/services/utilityFunctionService.ts
     class UtilityFunctionService {
       calculateUtility(creature: ICreature, action: string, matrix: IPayoffMatrix, opponentAction: string): number {
         const payoff = this.getPayoff(creature, action, opponentAction, matrix);
         if (action === 'Cooperate') {
           return payoff.healthPreserved * 0.7 + payoff.damageDealt * 0.3 - payoff.damageTaken;
         }
         // Existing logic for Attack, Defend
       }
     }
     ```

6. **Extend Nash Equilibrium Calculations**
   - **Location**: Update `src/domains/gameTheory/services/nashEquilibriumFinder.ts` to handle the expanded matrix.
   - **Content**: Ensure equilibria account for Cooperate’s payoffs.
   - **Example**:
     ```typescript
     // src/domains/gameTheory/services/nashEquilibriumFinder.ts
     class NashEquilibriumFinder {
       findEquilibria(matrix: IPayoffMatrix): INashEquilibrium[] {
         const equilibria = [];
         for (let i = 0; i < matrix.strategies.length; i++) {
           for (let j = 0; j < matrix.strategies.length; j++) {
             if (this.isBestResponseA(i, j, matrix.payoffs) && this.isBestResponseB(i, j, matrix.payoffs)) {
               equilibria.push({
                 strategies: [matrix.strategies[i], matrix.strategies[j]],
                 payoffs: matrix.payoffs[i][j]
               });
             }
           }
         }
         return equilibria;
       }
     }
     ```

7. **Test the New Strategy**
   - Write unit tests for payoff calculations, decision tree weights, and equilibria involving Cooperate.
   - Perform integration tests to ensure compatibility with battles and rendering.
   - **Example**:
     ```typescript
     // tests/unit/payoffMatrixService.test.ts
     describe('PayoffMatrixService', () => {
       test('generates correct payoff for Cooperate strategy', () => {
         const blockData = createMockBlockData(12345);
         const creature1 = createMockCreature(blockData, { coreParticles: 100 });
         const creature2 = createMockCreature(blockData);
         const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
         expect(matrix.payoffs[2][2][0]).toBeGreaterThan(50); // Cooperate boosts health
       });
     });
     ```

## Best Practices for Maintaining Compatibility
1. **Preserve Existing Strategies**: Add new strategies (e.g., Cooperate) without altering Attack or Defend logic in `payoffMatrixService.ts`.
2. **Deprecate, Don’t Delete**: Mark outdated strategies as deprecated in `payoffMatrix.ts` to support legacy code.
3. **Version Strategy Data**: Add a `version` field to matrices or trees (e.g., `{ strategy: "Cooperate", version: "1.0" }`).
4. **Document Extensions**: Update `docs/systems/game_theory/` with new strategy details and migration guides.
5. **Test for Regressions**: Use Jest to validate that existing battle outcomes remain unchanged.

## Guidelines for Updating Related Systems
1. **Balance New Strategies**: Tune Cooperate’s payoffs (e.g., +15 health, -10 damage) to prevent dominance, using simulation scripts.
2. **Optimize Performance**: Ensure new calculations stay within < 10ms, using caching (`payoffMatrixService.ts`) and off-thread processing (`computeWorker.ts`).
3. **Update Visuals**: Reflect new strategies in `instancedRenderer.ts` (e.g., visual cue for Cooperate like a healing aura).
4. **Integrate with Traits**: Add Cooperate-specific traits (e.g., “Healing Pulse” ability) in `src/domains/traits/data/`.
5. **Test Extensively**: Validate new strategies with unit and integration tests, ensuring balance and performance.

## Performance Considerations
- **Efficient Calculations**: Cache matrices and equilibria to avoid recalculating for common matchups.
- **Batch Processing**: Compute payoffs for new strategies in a single pass over particle data.
- **Off-Thread Processing**: Use `computeWorker.ts` for complex equilibrium calculations.
- **Minimal Matrix Growth**: Limit new strategies to maintain small matrices (e.g., 3x3).

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts`, `decisionTreeService.ts`, `nashEquilibriumFinder.ts`, and `utilityFunctionService.ts` manage new strategies.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for role and trait inputs.
- **Traits Domain (`src/domains/traits/`)**: Supplies new traits via `traitService.ts` to support extended mechanics.
- **Rendering Domain (`src/domains/rendering/`)**: Visualizes new strategy effects via `instancedRenderer.ts`.
- **Workers Domain (`src/domains/workers/`)**: Offloads computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: New strategies use static data and seeded RNG, ensuring consistency.
- **Modularity**: Extensions are encapsulated in existing services, with clear interfaces.
- **Performance**: Targets < 10ms calculations, leveraging caching and off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate game theory code (e.g., in `src/lib/` or `src/creatures/`) for battles and decisions.
2. **Add New Strategy**: Update `payoffMatrixService.ts` and `decisionTreeService.ts` to include Cooperate.
3. **Extend Traits**: Add Cooperate-specific traits in `src/domains/traits/data/`.
4. **Update Calculations**: Enhance `nashEquilibriumFinder.ts` and `utilityFunctionService.ts` for new strategy.
5. **Test Extensions**: Validate new strategy functionality and performance using Jest, ensuring no regressions.

## Example Extension: Cooperate Strategy
```typescript
// src/domains/gameTheory/services/gameTheoryStrategyService.ts
class GameTheoryStrategyService {
  simulateBattle(creature1: ICreature, creature2: ICreature): IBattleOutcome {
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    const tree = decisionTreeService.constructTree(creature1, creature2);
    const equilibria = nashEquilibriumFinder.findEquilibria(matrix);
    const strategy = decisionTreeService.selectOptimalStrategy(tree);
    if (strategy === 'Cooperate') {
      // Apply health-sharing logic
      creature1.health += 10;
      creature2.health += 10;
    }
    return this.computeOutcome(matrix, strategy);
  }
}
```

This document ensures the game theory system in Bitcoin Protozoa is extensible, allowing new strategies to enhance gameplay while preserving stability and performance.

Are you ready for the next document (extending_game_theory.md)?
