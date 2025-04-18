
# Game Theory Testing and Validation

## Purpose
This document provides strategies for testing the game theory system in Bitcoin Protozoa to ensure correctness, balance, and determinism in strategic interactions, such as battles. It serves as a single source of truth for developers, outlining unit and integration testing approaches, sample test cases, and tools to validate the system’s behavior, specifically tailored to the project’s particle-based design, role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and deterministic RNG tied to Bitcoin block data.

## Location
`new_docs/systems/game_theory/game_theory_testing.md`

## Overview
The game theory system in Bitcoin Protozoa drives strategic decision-making and battle outcomes, using payoff matrices, decision trees, Nash equilibria, and utility functions to model interactions between creatures. Testing is critical to verify that these mechanics correctly reflect particle roles and traits, maintain determinism, and perform efficiently (< 10ms per calculation). This document covers unit and integration testing strategies, leveraging Jest for execution, and aligns with the project’s domain-driven design (DDD) principles, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new framework.

## Unit Testing Strategies
Unit tests focus on individual game theory components, such as `payoffMatrixService.ts`, `decisionTreeService.ts`, `nashEquilibriumFinder.ts`, and `utilityFunctionService.ts`, to verify their functionality in isolation.

### Key Testing Scenarios
1. **Payoff Matrix Generation**:
   - Verify that matrices correctly reflect particle roles and trait effects (e.g., ATTACK particles increase damage).
   - Ensure determinism with fixed block nonce inputs.
2. **Decision Tree Processing**:
   - Test that decision trees select optimal strategies based on role weights and behavior traits.
   - Confirm consistent branch selection for identical creature data.
3. **Nash Equilibrium Calculation**:
   - Validate that pure and mixed equilibria are correctly identified from payoff matrices.
   - Ensure equilibria are stable and deterministic.
4. **Utility Function Calculation**:
   - Check that utility values accurately weigh damage, health, and trait modifiers.
   - Verify higher utility for role-aligned actions (e.g., Attack for ATTACK-heavy creatures).

### Example Unit Test
```typescript
// tests/unit/payoffMatrixService.test.ts
import { payoffMatrixService } from 'src/domains/gameTheory/services/payoffMatrixService';
import { Role } from 'src/shared/types/core';
import { createMockBlockData, createMockCreature } from 'tests/mocks';

describe('PayoffMatrixService', () => {
  test('generates higher payoff for ATTACK-heavy creature', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData, { defenseParticles: 100 });
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(matrix.payoffs[1][1][0]); // Attack > Defend for creature1
  });

  test('produces deterministic matrix for same input', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData);
    const creature2 = createMockCreature(blockData);
    const matrix1 = payoffMatrixService.generateMatrix(creature1, creature2);
    const matrix2 = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix1.payoffs).toEqual(matrix2.payoffs);
  });
});
```

## Integration Testing Strategies
Integration tests verify interactions between game theory components and other domains, ensuring cohesive behavior in battle simulations and strategic decisions.

### Key Testing Scenarios
1. **Battle Outcome Accuracy**:
   - Confirm that battle outcomes reflect particle roles and traits (e.g., ATTACK-heavy creature deals more damage).
   - Test integration with `payoffMatrixService.ts` and `nashEquilibriumFinder.ts`.
2. **Strategic Decision-Making**:
   - Validate that decision trees (`decisionTreeService.ts`) select strategies aligned with creature composition.
   - Ensure CONTROL particles and behavior traits influence optimal choices.
3. **Deterministic Behavior**:
   - Verify that identical creature data and block nonce produce the same strategic outcomes across runs.
4. **Performance Validation**:
   - Measure calculation times for battle simulations and decisions, targeting < 10ms for 500 particles.

### Example Integration Test
```typescript
// tests/integration/gameTheory.test.ts
import { gameTheoryStrategyService } from 'src/domains/gameTheory/services/gameTheoryStrategyService';
import { decisionTreeService } from 'src/domains/gameTheory/services/decisionTreeService';
import { createMockBlockData, createMockCreature } from 'tests/mocks';

describe('Game Theory Integration', () => {
  test('selects Attack strategy for ATTACK-heavy creature', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const strategy = decisionTreeService.processDecision(creature1, creature2);
    expect(strategy).toBe('Attack');
  });

  test('produces deterministic battle outcome', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData);
    const creature2 = createMockCreature(blockData);
    const outcome1 = gameTheoryStrategyService.simulateBattle(creature1, creature2);
    const outcome2 = gameTheoryStrategyService.simulateBattle(creature1, creature2);
    expect(outcome1.scores).toEqual(outcome2.scores);
  });

  test('battle simulation completes within 10ms', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { particleCount: 500 });
    const creature2 = createMockCreature(blockData, { particleCount: 500 });
    const start = performance.now();
    gameTheoryStrategyService.simulateBattle(creature1, creature2);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });
});
```

## Sample Test Cases
1. **Payoff Matrix Accuracy**:
   - **Scenario**: Generate a matrix for a creature with 100 ATTACK particles and verify higher damage for Attack strategy.
   - **Expected Outcome**: Attack payoff > Defend payoff.
2. **Decision Tree Selection**:
   - **Scenario**: Process a decision tree for a CONTROL-heavy creature and check if it selects the optimal strategy.
   - **Expected Outcome**: Strategy aligns with CONTROL’s strategic accuracy boost.
3. **Nash Equilibrium Stability**:
   - **Scenario**: Calculate equilibria for a balanced matrix and verify a stable Defend-Defend outcome.
   - **Expected Outcome**: Equilibrium at [40, 40] for Defend-Defend.
4. **Utility Function Balance**:
   - **Scenario**: Calculate utility for Attack vs. Defend for a DEFENSE-heavy creature and verify higher Defend utility.
   - **Expected Outcome**: Defend utility > Attack utility.
5. **Performance Benchmark**:
   - **Scenario**: Simulate a battle with 500 particles and measure time.
   - **Expected Outcome**: Calculation time < 10ms, FPS ≥ 60.

## Testing Tools
- **Jest**: Executes unit and integration tests, configured in `jest.config.js`.
- **Three.js Stats**: Monitors FPS to ensure game theory calculations don’t impact rendering.
- **Chrome DevTools**: Profiles CPU usage and worker thread performance for calculations.
- **Custom Metrics**: Use `performance.now()` in `gameTheoryStrategyService.ts` to measure computation times.

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: Tests validate `payoffMatrixService.ts`, `decisionTreeService.ts`, `nashEquilibriumFinder.ts`, and `utilityFunctionService.ts`.
- **Creature Domain (`src/domains/creature/`)**: Ensures `ICreature` and `IParticle` data correctly influence outcomes.
- **Traits Domain (`src/domains/traits/`)**: Verifies `IAbility`, `IBehavior`, and `IMutation` traits are applied accurately.
- **Workers Domain (`src/domains/workers/`)**: Confirms `computeWorker.ts` handles off-thread calculations efficiently.

## Rules Adherence
- **Determinism**: Tests confirm consistent outcomes with fixed block nonce and creature data.
- **Modularity**: Tests are organized in `tests/unit/` and `tests/integration/`, with clear dependencies.
- **Performance**: Performance tests validate < 10ms calculations and 60 FPS.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Tests**: Locate game theory-related tests (e.g., in `tests/` or scattered files).
2. **Refactor Tests**: Move to `tests/unit/` and `tests/integration/`, aligning with new services like `gameTheoryStrategyService.ts`.
3. **Add New Tests**: Implement tests for payoff matrices, decision trees, equilibria, and utilities.
4. **Validate Coverage**: Use Jest’s coverage reports to ensure comprehensive testing.

## Example Performance Test
```typescript
// tests/integration/gameTheoryPerformance.test.ts
describe('Game Theory Performance', () => {
  test('simulates battle within 10ms', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { particleCount: 500 });
    const creature2 = createMockCreature(blockData, { particleCount: 500 });
    const start = performance.now();
    gameTheoryStrategyService.simulateBattle(creature1, creature2);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });
});
```

This document ensures the game theory system in Bitcoin Protozoa is thoroughly tested for correctness, balance, and performance, supporting reliable and engaging strategic gameplay.

Are you ready for the next document (game_theory_performance.md)?
