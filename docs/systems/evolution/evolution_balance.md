
# Evolution Balance and Tuning

## Purpose
This document guides developers on tuning the evolution system parameters in Bitcoin Protozoa to achieve balanced and engaging gameplay, preventing overpowered mutations or evolutionary paths while promoting diverse creature builds. It serves as a single source of truth, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and deterministic RNG driven by Bitcoin block data, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/evolution/evolution_balance.md`

## Overview
The evolution system drives creature adaptation through mutations and tier progression, influencing stats, behaviors, and strategic outcomes in battles. Balanced evolution ensures no single mutation (e.g., “Fury Strike” for ATTACK) or evolutionary path (e.g., tier 5 Apex) dominates, encouraging varied tactical choices. Tuning involves adjusting trigger thresholds, mutation effects, and rarity probabilities, managed by `evolutionService.ts` and `traitService.ts` in the `evolution` and `traits` domains. The process is deterministic, relying on static creature data and block nonce-seeded RNG, ensuring consistent balance. This document outlines principles, tuning methods, and tools for balance, leveraging insights from our discussions on mutation trait diversity [Timestamp: April 12, 2025, 12:18].

## Principles for Evolution Balance
1. **Prevent Dominant Mutations**:
   - No mutation (e.g., “Iron Core,” “Fury Strike”) should always yield the best outcome, ensuring trade-offs (e.g., increased health vs. reduced speed).
   - Example: “Reinforced Shell” reduces damage but lowers mobility, counterable by “Swift Stride” speed.
2. **Role Parity**:
   - Each role’s mutations (e.g., CORE’s “Iron Core,” ATTACK’s “Fury Strike”) should have comparable impact, avoiding overpowered roles.
   - Example: DEFENSE’s damage reduction balances ATTACK’s damage boost.
3. **Tier Progression Moderation**:
   - Higher tiers (e.g., tier 5 Apex) should enhance mutations without creating unbeatable creatures.
   - Example: Tier 5 boosts mutation effects by 10%, not 50%.
4. **Rarity Balance**:
   - MYTHIC mutations should be powerful but rare (e.g., 1% base chance), preventing frequent game-breaking traits.
   - Example: “Tactical Mind” (MYTHIC) adds 10% strategy accuracy, not 50%.
5. **Dynamic Build Diversity**:
   - Mutations and tiers should encourage varied creature builds (e.g., DEFENSE-heavy “Guardian” vs. MOVEMENT-heavy “Scout”).
   - Example: Subclass bonuses (e.g., “Guardian” +5% defense) reward role specialization without dominance.
6. **Determinism**: Tuning parameters are static, ensuring consistent balance across runs with the same block nonce.

## Tuning Methods
Tuning involves adjusting parameters in `evolutionService.ts`, `traitService.ts`, and mutation trait data (`src/domains/traits/data/mutationPatterns/`) to balance evolutionary impacts.

### 1. Adjust Mutation Effect Strengths
- **Parameters**:
  - **CORE (“Iron Core”)**: Health multiplier (+0.2% per particle).
  - **CONTROL (“Tactical Mind”)**: Decision accuracy (+0.1% per particle).
  - **MOVEMENT (“Swift Stride”)**: Attack speed (+0.15% per particle).
  - **DEFENSE (“Reinforced Shell”)**: Damage reduction (-0.2% per particle).
  - **ATTACK (“Fury Strike”)**: Damage output (+0.25% per particle).
- **Tuning Approach**:
  - Ensure no mutation overshadows others (e.g., “Fury Strike” +0.25% balanced by “Reinforced Shell” -0.2%).
  - Test with equal role distributions (e.g., 100 particles per role) to verify balanced battle outcomes.
- **Example Adjustment**:
  - If “Fury Strike” dominates, reduce damage boost to +0.2% or increase “Reinforced Shell” reduction to -0.25%.

### 2. Balance Rarity Probabilities
- **Parameters**:
  - Rarity chances: COMMON (70%), UNCOMMON (20%), RARE (7%), EPIC (2%), MYTHIC (1%).
  - Confirmation multiplier: +0.5% MYTHIC chance per block confirmation.
- **Tuning Approach**:
  - Cap MYTHIC chance to prevent frequent overpowered traits (e.g., max 5% even with 10 confirmations).
  - Adjust base probabilities to balance progression (e.g., increase RARE to 10% for more mid-tier variety).
- **Example Adjustment**:
  - If MYTHIC traits are too common, reduce base chance to 0.5% and confirmation multiplier to 0.3%.

### 3. Tune Trigger Thresholds
- **Parameters**:
  - Block confirmation trigger: 10% chance per confirmation.
  - Role-specific triggers (e.g., DEFENSE: >50 damage absorbed, ATTACK: >100 damage dealt).
  - Cooldown: Once per 10 confirmations per role group.
- **Tuning Approach**:
  - Balance trigger frequency to prevent rapid evolution (e.g., increase cooldown to 15 confirmations).
  - Adjust condition thresholds to align with gameplay pace (e.g., raise DEFENSE trigger to 75 damage absorbed).
- **Example Adjustment**:
  - If evolution triggers too often, reduce confirmation chance to 8% or tighten role-specific conditions.

### 4. Simulation-Based Tuning
- **Method**: Run automated battle simulations with varied evolutionary states to identify imbalances, as discussed for mutation diversity [Timestamp: April 12, 2025, 12:18].
- **Implementation**: Use a script to simulate 1,000 battles, analyzing win rates and mutation effectiveness.
- **Example**:
  ```typescript
  // scripts/simulateEvolutionBattles.ts
  async function simulateEvolutionBattles(iterations: number) {
    const results = { furyStrikeWins: 0, reinforcedShellWins: 0 };
    for (let i = 0; i < iterations; i++) {
      const blockData = createMockBlockData(i);
      const creature1 = createMockCreature(blockData, { attackParticles: 100 });
      const creature2 = createMockCreature(blockData, { defenseParticles: 100 });
      const mutation1 = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 25 } };
      const mutation2 = { id: 'reinforced_shell', effect: 'damage_reduction', stats: { defense: 20 } };
      await evolutionTracker.updateEvolutionState(creature1, mutation1, blockData);
      await evolutionTracker.updateEvolutionState(creature2, mutation2, blockData);
      const outcome = gameTheoryStrategyService.simulateBattle(creature1, creature2);
      if (outcome.winner === creature1) results.furyStrikeWins++;
      if (outcome.winner === creature2) results.reinforcedShellWins++;
    }
    console.log(`Fury Strike Win Rate: ${(results.furyStrikeWins / iterations) * 100}%`);
    console.log(`Reinforced Shell Win Rate: ${(results.reinforcedShellWins / iterations) * 100}%`);
  }
  ```

## Tools for Analyzing Balance
1. **Simulation Scripts**:
   - Run `simulateEvolutionBattles.ts` to collect win rate and mutation effectiveness data.
   - **Usage**: Detect overpowered mutations (e.g., “Fury Strike” win rate > 60%).
2. **Jest Tests**:
   - Write tests to verify balanced payoffs and trigger frequencies.
   - **Example**:
     ```typescript
     // tests/integration/evolutionBalance.test.ts
     describe('Evolution Balance', () => {
       test('Fury Strike and Reinforced Shell have comparable win rates', async () => {
         const blockData = createMockBlockData(12345);
         const creature1 = createMockCreature(blockData, { attackParticles: 100 });
         const creature2 = createMockCreature(blockData, { defenseParticles: 100 });
         const mutation1 = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 25 } };
         const mutation2 = { id: 'reinforced_shell', effect: 'damage_reduction', stats: { defense: 20 } };
         await evolutionTracker.updateEvolutionState(creature1, mutation1, blockData);
         await evolutionTracker.updateEvolutionState(creature2, mutation2, blockData);
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
2. **Cache Mutation Effects**: Store mutation data in `traitService.ts` for quick access during simulations.
3. **Off-Thread Processing**: Use `computeWorker.ts` for simulation calculations to offload the main thread [Timestamp: April 14, 2025, 19:58].
4. **Limit Test Scope**: Focus simulations on key mutation pairs (e.g., “Fury Strike” vs. “Reinforced Shell”).

## Integration Points
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionService.ts` and `evolutionTracker.ts` manage triggers and state updates.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` and `decisionTreeService.ts` incorporate mutation effects.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` provides `IMutation` traits for balance adjustments.
- **Creature Domain (`src/domains/creature/`)**: Supplies `ICreature` and `IParticle` data for role and mutation inputs.
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads simulation computations.

## Rules Adherence
- **Determinism**: Balance parameters are static, ensuring consistent outcomes with fixed inputs.
- **Modularity**: Tuning logic is encapsulated in evolution and game theory services.
- **Performance**: Targets < 10ms for simulations, supporting 60 FPS.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate evolution and game theory code (e.g., in `src/lib/` or `src/creatures/`) related to mutation impacts, aligning with our prior focus on mutation trait diversity [Timestamp: April 12, 2025, 12:18].
2. **Refactor into Services**: Move balance logic to `src/domains/evolution/services/` and `src/domains/gameTheory/services/`.
3. **Implement Tuning Tools**: Add simulation scripts and tests for balance analysis.
4. **Tune Parameters**: Adjust mutation effects, rarity probabilities, and trigger thresholds based on simulation results.
5. **Test Balance**: Validate win rates and build diversity using Jest and simulation outputs.

## Example Tuning Scenario
- **Issue**: “Fury Strike” wins 70% of battles, indicating imbalance.
- **Action**: Reduce damage boost from +0.25% to +0.2% per particle in `payoffMatrixService.ts` and increase “Reinforced Shell” reduction to -0.25% in `mutationPatterns/attack.ts`.
- **Validation**: Run 1,000 simulations, expecting win rate to drop to ~50%.
- **Result**: Balanced win rates, with “Fury Strike” and “Reinforced Shell” equally viable.

