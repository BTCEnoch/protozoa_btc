
# Strategic Balance and Tuning

## Purpose
This document guides developers on tuning game theory parameters in Bitcoin Protozoa to achieve balanced and engaging gameplay, preventing dominant strategies and ensuring diverse tactical outcomes. It serves as a single source of truth, specifically addressing how particle roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and traits (abilities, behaviors, mutations) influence strategic balance, tailored to the project’s particle-based design and deterministic RNG driven by Bitcoin block data.

## Location
`new_docs/systems/game_theory/strategic_balance.md`

## Overview
The game theory system in Bitcoin Protozoa drives strategic interactions, such as battles, using payoff matrices, decision trees, Nash equilibria, and utility functions. Strategic balance ensures no single strategy (e.g., always Attack) or particle role (e.g., overpowered ATTACK) dominates, promoting varied and replayable gameplay. Tuning involves adjusting role contributions, trait effects, and payoff weights to achieve this balance, managed by services like `payoffMatrixService.ts` and `gameTheoryStrategyService.ts`. The process is deterministic, relying on static creature data and block nonce-seeded RNG, ensuring consistent outcomes. This document outlines principles, tuning methods, and tools for balance, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Principles for Strategic Balance
1. **Prevent Dominant Strategies**:
   - No strategy (e.g., Attack, Defend) should always yield the best outcome, regardless of opponent strategy.
   - Example: Attack should be countered by Defend, ensuring a rock-paper-scissors dynamic.
2. **Role Parity**:
   - Each role (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) should have comparable impact, avoiding overpowered roles.
   - Example: ATTACK’s high damage is balanced by DEFENSE’s damage reduction.
3. **Trait Moderation**:
   - Traits (abilities, behaviors, mutations) should enhance strategies without creating imbalances.
   - Example: “Fire Blast” adds +10 damage but doesn’t make Attack unbeatable.
4. **Dynamic Outcomes**:
   - Particle compositions and traits should lead to varied strategic outcomes, encouraging diverse creature builds.
   - Example: A CONTROL-heavy creature favors tactical precision, while an ATTACK-heavy one prioritizes offense.
5. **Determinism**: Tuning parameters are static, ensuring consistent balance across runs with the same block nonce.

## Tuning Methods
Tuning involves adjusting parameters in `payoffMatrixService.ts`, `decisionTreeService.ts`, and `utilityFunctionService.ts` to balance role and trait impacts.

### 1. Adjust Role Contributions
- **Parameters**:
  - **CORE**: Health multiplier (+0.1% per particle).
  - **CONTROL**: Decision accuracy (+0.05% per particle).
  - **MOVEMENT**: Attack speed (+0.15% per particle).
  - **DEFENSE**: Damage reduction (-0.2% per particle).
  - **ATTACK**: Damage output (+0.25% per particle).
- **Tuning Approach**:
  - Ensure no role’s contribution overshadows others (e.g., ATTACK’s +0.25% balanced by DEFENSE’s -0.2%).
  - Test with equal particle counts (e.g., 100 per role) to verify balanced payoffs.
- **Example Adjustment**:
  - If ATTACK dominates, reduce damage multiplier to +0.2% or increase DEFENSE’s reduction to -0.25%.

### 2. Balance Trait Effects
- **Parameters**:
  - **Abilities**: Stat boosts (e.g., “Fire Blast” adds +10 damage).
  - **Behaviors**: Strategy weights (e.g., “Aggressive” adds +10% to Attack).
  - **Mutations**: Dynamic effects (e.g., “Enhanced Reflexes” reduces damage taken by 5%).
- **Tuning Approach**:
  - Cap trait effects to prevent extreme imbalances (e.g., limit ability bonuses to +15).
  - Adjust rarity-based effects (e.g., MYTHIC traits capped at +20% vs. COMMON at +5%).
- **Example Adjustment**:
  - If “Fire Blast” is too strong, reduce its bonus to +8 or add a cooldown.

### 3. Tune Payoff Matrix Weights
- **Parameters**:
  - Payoff values in `payoffMatrixService.ts` (e.g., Attack vs. Attack: [50, 50]).
  - Utility weights in `utilityFunctionService.ts` (e.g., damage: 0.6, health: 0.4).
- **Tuning Approach**:
  - Adjust base payoffs to ensure no strategy is universally optimal (e.g., Attack vs. Defend yields [70, 30] to reward Defend).
  - Balance utility weights to reflect gameplay priorities (e.g., increase health weight to 0.5 for defensive play).
- **Example Adjustment**:
  - If Attack is overused, increase Defend’s payoff to [45, 45] for Defend vs. Defend.

### 4. Simulation-Based Tuning
- **Method**: Run automated battle simulations with varied creature compositions to identify imbalances.
- **Implementation**: Use a script to simulate 1,000 battles, analyzing win rates and strategy frequencies.
- **Example**:
  ```typescript
  // scripts/simulateBattles.ts
  async function simulateBattles(iterations: number) {
    const results = { attackWins: 0, defendWins: 0 };
    for (let i = 0; i < iterations; i++) {
      const blockData = createMockBlockData(i);
      const creature1 = createMockCreature(blockData);
      const creature2 = createMockCreature(blockData);
      const outcome = gameTheoryStrategyService.simulateBattle(creature1, creature2);
      if (outcome.winner === creature1 && outcome.strategy === 'Attack') results.attackWins++;
      if (outcome.winner === creature1 && outcome.strategy === 'Defend') results.defendWins++;
    }
    console.log(`Attack Win Rate: ${(results.attackWins / iterations) * 100}%`);
    console.log(`Defend Win Rate: ${(results.defendWins / iterations) * 100}%`);
  }
  ```

## Tools for Analyzing Balance
1. **Simulation Scripts**:
   - Run `simulateBattles.ts` to collect win rate and strategy data.
   - **Usage**: Analyze output to detect overpowered strategies (e.g., Attack win rate > 60%).
2. **Jest Tests**:
   - Write tests to verify balanced payoffs and strategy selections.
   - **Example**:
     ```typescript
     // tests/integration/gameTheoryBalance.test.ts
     describe('Game Theory Balance', () => {
       test('Attack and Defend have comparable win rates', () => {
         const blockData = createMockBlockData(12345);
         const creature1 = createMockCreature(blockData, { attackParticles: 100 });
         const creature2 = createMockCreature(blockData, { defenseParticles: 100 });
         const outcome = gameTheoryStrategyService.simulateBattle(creature1, creature2);
         expect(outcome.scores.creature1).toBeCloseTo(outcome.scores.creature2, -1);
       });
     });
     ```
3. **Three.js Stats**:
   - Monitor FPS to ensure balance calculations don’t impact rendering performance.
4. **Chrome DevTools**:
   - Profile CPU usage during simulations to identify computational bottlenecks.

## Performance Considerations
To ensure efficient balance tuning for 500 particles:
1. **Batch Simulations**: Run multiple simulations in a single pass to reduce overhead.
2. **Cache Payoff Matrices**: Store matrices in `payoffMatrixService.ts` for common matchups.
3. **Off-Thread Processing**: Use `computeWorker.ts` for simulation calculations to offload the main thread.
4. **Limit Test Scope**: Focus simulations on key scenarios (e.g., balanced vs. ATTACK-heavy creatures).

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts`, `decisionTreeService.ts`, and `utilityFunctionService.ts` manage balance parameters.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for role and trait inputs.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IAbility`, `IBehavior`, and `IMutation` traits to adjust payoffs and weights.
- **Workers Domain (`src/domains/workers/`)**: Offloads simulation computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Balance parameters are static, ensuring consistent outcomes with fixed inputs.
- **Modularity**: Tuning logic is encapsulated in game theory services, with clear interfaces.
- **Performance**: Targets < 10ms per simulation, supporting 60 FPS.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate game theory code (e.g., in `src/lib/` or `src/creatures/`) related to strategic outcomes.
2. **Refactor into Services**: Move balance logic to `src/domains/gameTheory/services/`.
3. **Implement Tuning Tools**: Add simulation scripts and tests for balance analysis.
4. **Tune Parameters**: Adjust role and trait contributions based on simulation results.
5. **Test Balance**: Validate win rates and strategy diversity using Jest and simulation outputs.

## Example Tuning Scenario
- **Issue**: Attack strategy wins 70% of battles, indicating imbalance.
- **Action**: Reduce ATTACK damage multiplier from 0.25 to 0.2 and increase DEFENSE reduction to 0.25 in `payoffMatrixService.ts`.
- **Validation**: Run 1,000 simulations, expecting Attack win rate to drop to ~50%.
- **Result**: Balanced win rates, with Attack and Defend equally viable.


