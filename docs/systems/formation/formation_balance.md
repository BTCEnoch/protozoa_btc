
# Formation Balance and Tuning

## Purpose
This document guides developers on tuning formation parameters in Bitcoin Protozoa to achieve balanced and engaging gameplay, ensuring no single formation pattern (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE) dominates and promoting diverse tactical outcomes. It serves as a single source of truth, specifically addressing how particle roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and formation patterns influence strategic balance, tailored to the project’s particle-based design and deterministic RNG driven by Bitcoin block data.

## Location
`new_docs/systems/formation/formation_balance.md`

## Overview
The formation system in Bitcoin Protozoa organizes up to 500 particles per creature into role-specific patterns that impact gameplay through spatial arrangements, affecting physics, rendering, and game theory outcomes. Strategic balance ensures no formation pattern provides an unfair advantage, encouraging varied creature builds and tactical choices. Tuning involves adjusting pattern properties, such as position density or effect strength, managed by `formationService.ts` in the `traits` domain and integrated with `gameTheoryStrategyService.ts`. The process is deterministic, relying on static creature data and block nonce-seeded RNG, ensuring consistent balance. This document outlines principles, tuning methods, and tools for balance, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Principles for Formation Balance
1. **Prevent Dominant Formations**:
   - No pattern (e.g., “Shield Wall,” “Vanguard”) should always yield the best outcome, regardless of context.
   - Example: “Shield Wall” should be countered by “Swarm” mobility, ensuring a tactical trade-off.
2. **Role Parity**:
   - Each role’s formations (e.g., CORE’s “Cluster,” ATTACK’s “Vanguard”) should have comparable impact, avoiding overpowered patterns.
   - Example: “Cluster” enhances health but limits mobility, balanced by “Swarm’s” speed.
3. **Formation Effect Moderation**:
   - Formation effects (e.g., damage reduction in “Shield Wall”) should enhance tactics without creating imbalances.
   - Example: “Vanguard” boosts damage by 20% but exposes particles to counterattacks.
4. **Dynamic Tactical Choices**:
   - Formations should encourage varied strategies based on particle composition and battle context.
   - Example: A DEFENSE-heavy creature favors “Shield Wall,” while a MOVEMENT-heavy one opts for “Swarm.”
5. **Determinism**: Tuning parameters are static, ensuring consistent balance across runs with the same block nonce.

## Tuning Methods
Tuning involves adjusting parameters in `formationService.ts` and formation pattern data (`src/domains/traits/data/formationPatterns/`) to balance pattern impacts.

### 1. Adjust Formation Effect Strengths
- **Parameters**:
  - **CORE (“Cluster”)**: Health multiplier (+0.15% per particle).
  - **CONTROL (“Grid”)**: Decision accuracy (+0.1% per particle).
  - **MOVEMENT (“Swarm”)**: Attack speed (+0.2% per particle).
  - **DEFENSE (“Shield Wall”)**: Damage reduction (-0.25% per particle).
  - **ATTACK (“Vanguard”)**: Damage output (+0.3% per particle).
- **Tuning Approach**:
  - Ensure no pattern’s effect overshadows others (e.g., “Shield Wall’s” -0.25% balanced by “Vanguard’s” +0.3%).
  - Test with equal role distributions (e.g., 100 particles per role) to verify balanced battle outcomes.
- **Example Adjustment**:
  - If “Shield Wall” is too strong, reduce damage reduction to -0.2% or increase “Vanguard” damage to +0.35%.

### 2. Balance Pattern Density and Positions
- **Parameters**:
  - Position coordinates in `IFormationPattern` (e.g., “Shield Wall” forms a tight ring with 1-unit radius).
  - Density (e.g., number of particles per unit area in “Cluster”).
- **Tuning Approach**:
  - Adjust position spread to balance mobility vs. protection (e.g., widen “Cluster” radius to reduce health bonus).
  - Limit particle overlap to avoid unrealistic densities (e.g., cap “Shield Wall” at 50 particles per ring).
- **Example Adjustment**:
  - If “Cluster” is too compact, increase radius from 1 to 1.5 units, reducing health multiplier to +0.1%.

### 3. Tune Transition Triggers
- **Parameters**:
  - Trigger conditions (e.g., enemy proximity < 10 units for “Shield Wall” transition).
  - Transition probabilities (e.g., 80% chance to switch to “Swarm” for MOVEMENT with “Flocking” trait).
- **Tuning Approach**:
  - Balance transition frequency to prevent overuse (e.g., limit “Shield Wall” transitions to once every 10 frames).
  - Adjust RNG probabilities to favor tactical shifts (e.g., reduce “Vanguard” transition chance to 60% for balance).
- **Example Adjustment**:
  - If “Swarm” transitions too often, lower probability to 50% or increase enemy proximity threshold to 15 units.

### 4. Simulation-Based Tuning
- **Method**: Run automated battle simulations with varied formation patterns to identify imbalances.
- **Implementation**: Use a script to simulate 1,000 battles, analyzing win rates and pattern effectiveness.
- **Example**:
  ```typescript
  // scripts/simulateFormationBattles.ts
  async function simulateFormationBattles(iterations: number) {
    const results = { shieldWallWins: 0, vanguardWins: 0 };
    for (let i = 0; i < iterations; i++) {
      const blockData = createMockBlockData(i);
      const creature1 = createMockCreature(blockData, { defenseParticles: 100 });
      const creature2 = createMockCreature(blockData, { attackParticles: 100 });
      formationService.assignFormation({ role: Role.DEFENSE, particles: creature1.particles }, blockData); // Shield Wall
      formationService.assignFormation({ role: Role.ATTACK, particles: creature2.particles }, blockData); // Vanguard
      const outcome = gameTheoryStrategyService.simulateBattle(creature1, creature2);
      if (outcome.winner === creature1) results.shieldWallWins++;
      if (outcome.winner === creature2) results.vanguardWins++;
    }
    console.log(`Shield Wall Win Rate: ${(results.shieldWallWins / iterations) * 100}%`);
    console.log(`Vanguard Win Rate: ${(results.vanguardWins / iterations) * 100}%`);
  }
  ```

## Tools for Analyzing Balance
1. **Simulation Scripts**:
   - Run `simulateFormationBattles.ts` to collect win rate and pattern effectiveness data.
   - **Usage**: Analyze output to detect overpowered formations (e.g., “Shield Wall” win rate > 60%).
2. **Jest Tests**:
   - Write tests to verify balanced payoffs and transition frequencies.
   - **Example**:
     ```typescript
     // tests/integration/formationBalance.test.ts
     describe('Formation Balance', () => {
       test('Shield Wall and Vanguard have comparable win rates', () => {
         const blockData = createMockBlockData(12345);
         const creature1 = createMockCreature(blockData, { defenseParticles: 100 });
         const creature2 = createMockCreature(blockData, { attackParticles: 100 });
         formationService.assignFormation({ role: Role.DEFENSE, particles: creature1.particles }, blockData);
         formationService.assignFormation({ role: Role.ATTACK, particles: creature2.particles }, blockData);
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
To ensure efficient tuning for 500 particles:
1. **Batch Simulations**: Run multiple simulations in a single pass to reduce overhead.
2. **Cache Formation Data**: Store pattern effects in `formationService.ts` for quick access during simulations.
3. **Off-Thread Processing**: Use `computeWorker.ts` for simulation calculations to offload the main thread.
4. **Limit Test Scope**: Focus simulations on key formation pairs (e.g., “Shield Wall” vs. “Vanguard”).

## Integration Points
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` manages pattern assignments and updates.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` and `decisionTreeService.ts` incorporate formation effects.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for formation and role inputs.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IBehavior` and `IAbility` traits to modify formation impacts.
- **Workers Domain (`src/domains/workers/`)**: Offloads simulation computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Balance parameters are static, ensuring consistent outcomes with fixed inputs.
- **Modularity**: Tuning logic is encapsulated in formation and game theory services.
- **Performance**: Targets < 10ms for simulations, supporting 60 FPS.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate formation and game theory code (e.g., in `src/lib/` or `src/creatures/`) related to battle impacts.
2. **Refactor into Services**: Move balance logic to `src/domains/traits/services/` and `src/domains/gameTheory/services/`.
3. **Implement Tuning Tools**: Add simulation scripts and tests for balance analysis.
4. **Tune Parameters**: Adjust formation effects and transition triggers based on simulation results.
5. **Test Balance**: Validate win rates and pattern diversity using Jest and simulation outputs.

## Example Tuning Scenario
- **Issue**: “Shield Wall” wins 65% of battles, indicating imbalance.
- **Action**: Reduce damage reduction from -0.25% to -0.2% per particle in `payoffMatrixService.ts` and widen “Shield Wall” radius in `formationPatterns/defense.ts`.
- **Validation**: Run 1,000 simulations, expecting win rate to drop to ~50%.
- **Result**: Balanced win rates, with “Shield Wall” and “Vanguard” equally viable.


