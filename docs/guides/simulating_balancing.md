
# Simulating and Balancing Gameplay

## Purpose
This guide provides instructions for using simulation scripts to analyze and balance the evolution, formation, and game theory mechanics in Bitcoin Protozoa, ensuring fair and engaging gameplay for creatures with up to 500 particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and new DDD framework, facilitating effective balancing during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/simulating_balancing.md`

## Overview
Bitcoin Protozoa’s gameplay relies on balanced interactions between evolution (e.g., mutation traits like “Fury Strike”), formations (e.g., “Spiral Charge”), and game theory (e.g., payoff matrices), ensuring no single mechanic dominates. Simulation scripts, such as `simulateEvolutionBattles.ts`, allow developers to test win rates, mutation effects, and formation impacts, enabling data-driven tuning. This guide covers creating simulation scripts, analyzing results, tuning parameters, and visualizing data, building on our discussions about mutation and formation balance [Timestamp: April 12, 2025, 12:18; April 8, 2025, 19:50]. It equips developers to maintain equitable gameplay while ensuring performance (< 10ms per simulation iteration) and determinism tied to Bitcoin block data.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Dependencies**: Ensure `node` (v18+) and optional charting libraries (e.g., `chart.js` for visualization) are installed.
- **Familiarity**: Knowledge of TypeScript, Jest for testing, and the DDD structure (`src/domains/`), particularly evolution (`evolutionService.ts`), formation (`formationService.ts`), and game theory (`gameTheoryStrategyService.ts`).
- **Tools**: Chrome DevTools for performance profiling, and a script runner (e.g., `ts-node` or `node`).

## Creating Simulation Scripts
Simulation scripts run automated tests to evaluate gameplay mechanics, such as battle outcomes, mutation impacts, or formation effectiveness, by simulating thousands of scenarios.

### Steps
1. **Set Up Script Directory**:
   - Create a script in `scripts/` (e.g., `simulateBattles.ts`) to handle simulations.
   - Use TypeScript for compatibility with the project’s codebase.
2. **Define Simulation Logic**:
   - Initialize creatures with specific roles, mutations, or formations using `creatureGenerator.ts`.
   - Simulate battles with `gameTheoryStrategyService.ts`, collecting metrics like win rates or damage output.
   - Use block nonce-seeded RNG for deterministic results [Timestamp: April 12, 2025, 12:18].
3. **Collect Metrics**:
   - Track key metrics (e.g., win rate, average damage, strategy frequency).
   - Store results in memory or a file (e.g., JSON) for analysis.
4. **Run Simulations**:
   - Execute the script with `ts-node scripts/simulateBattles.ts` or `node dist/scripts/simulateBattles.js` after compiling.
   - Run 1,000+ iterations for statistical significance.

### Example Simulation Script
This script simulates battles between creatures with “Fury Strike” (ATTACK) and “Reinforced Shell” (DEFENSE) mutations to balance their effects.

```typescript
// scripts/simulateBattles.ts
import { gameTheoryStrategyService } from 'src/domains/gameTheory/services/gameTheoryStrategyService';
import { evolutionTracker } from 'src/domains/evolution/services/evolutionTracker';
import { createMockBlockData, createMockCreature } from 'tests/mocks';
import { writeFileSync } from 'fs';

async function simulateBattles(iterations: number) {
  const results = { furyStrikeWins: 0, reinforcedShellWins: 0, totalDamageFury: 0, totalDamageShell: 0 };
  const blockData = createMockBlockData(12345);

  for (let i = 0; i < iterations; i++) {
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData, { defenseParticles: 100 });

    // Apply mutations
    const mutation1 = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 0.25 }, visual: {} };
    const mutation2 = { id: 'reinforced_shell', effect: 'damage_reduction', stats: { defense: 0.2 }, visual: {} };
    await evolutionTracker.updateEvolutionState(creature1, mutation1, blockData);
    await evolutionTracker.updateEvolutionState(creature2, mutation2, blockData);

    // Simulate battle
    const outcome = gameTheoryStrategyService.simulateBattle(creature1, creature2);
    if (outcome.winner === creature1) results.furyStrikeWins++;
    if (outcome.winner === creature2) results.reinforcedShellWins++;
    results.totalDamageFury += outcome.scores.creature1;
    results.totalDamageShell += outcome.scores.creature2;
  }

  // Calculate metrics
  const metrics = {
    furyStrikeWinRate: (results.furyStrikeWins / iterations) * 100,
    reinforcedShellWinRate: (results.reinforcedShellWins / iterations) * 100,
    avgDamageFury: results.totalDamageFury / iterations,
    avgDamageShell: results.totalDamageShell / iterations
  };

  // Save results
  writeFileSync('simulation_results.json', JSON.stringify(metrics, null, 2));
  console.log('Simulation Results:', metrics);
}

simulateBattles(1000).catch(error => console.error('Simulation failed:', error));
```

### Running the Script
```bash
ts-node scripts/simulateBattles.ts
```

### Example Output
```json
// simulation_results.json
{
  "furyStrikeWinRate": 52.3,
  "reinforcedShellWinRate": 47.7,
  "avgDamageFury": 65.4,
  "avgDamageShell": 48.2
}
```

## Analyzing Simulation Results
Analyzing results helps identify imbalances (e.g., win rates > 60%) and guide parameter tuning.

### Steps
1. **Review Metrics**:
   - Check win rates for balance (ideal: ~50% for each side).
   - Compare damage outputs to ensure no mutation or formation dominates.
   - Example: If “Fury Strike” wins 70%, it’s overpowered.
2. **Identify Trends**:
   - Look for patterns (e.g., high damage correlating with specific strategies like Attack).
   - Example: “Spiral Charge” formation may amplify “Fury Strike” damage excessively.
3. **Visualize Data**:
   - Use `chart.js` or a spreadsheet to plot win rates, damage, or strategy frequencies.
   - Example: Bar chart comparing “Fury Strike” vs. “Reinforced Shell” win rates.
4. **Iterate and Retest**:
   - Adjust parameters based on findings (e.g., reduce “Fury Strike” damage boost).
   - Rerun simulations to verify improvements.

### Example Visualization with Chart.js
```javascript
// scripts/visualizeResults.js
const { Chart } = require('chart.js');
const fs = require('fs');

const results = JSON.parse(fs.readFileSync('simulation_results.json'));
new Chart(document.getElementById('resultsChart'), {
  type: 'bar',
  data: {
    labels: ['Fury Strike', 'Reinforced Shell'],
    datasets: [{
      label: 'Win Rate (%)',
      data: [results.furyStrikeWinRate, results.reinforcedShellWinRate],
      backgroundColor: ['#ff4500', '#00aaff']
    }]
  },
  options: { scales: { y: { beginAtZero: true, max: 100 } } }
});
```

## Tuning Parameters
Tuning adjusts mutation effects, formation bonuses, or game theory payoffs to achieve balance, targeting ~50% win rates and diverse strategies.

### Parameters to Tune
1. **Mutation Effects**:
   - **Example**: Reduce “Fury Strike” damage from 0.25 to 0.2 in `src/domains/traits/data/mutationPatterns/attack.ts` if win rate > 60%.
   - **File**: `mutationPatterns/attack.ts`, `payoffMatrixService.ts`.
2. **Formation Effects**:
   - **Example**: Lower “Spiral Charge” damage bonus from 0.15 to 0.1 in `src/domains/traits/data/formationPatterns/attack.ts` if it amplifies ATTACK too much.
   - **File**: `formationPatterns/attack.ts`, `payoffMatrixService.ts`.
3. **Trigger Probabilities**:
   - **Example**: Decrease mutation trigger chance from 10% to 8% per block confirmation in `evolutionService.ts` if evolution is too frequent.
   - **File**: `evolutionService.ts`.
4. **Payoff Weights**:
   - **Example**: Adjust utility weights in `utilityFunctionService.ts` (e.g., damage: 0.6 to 0.5, health: 0.4 to 0.5) to favor defensive strategies.
   - **File**: `utilityFunctionService.ts`.

### Example Tuning
- **Issue**: “Fury Strike” win rate is 70%, indicating imbalance.
- **Action**:
  - Update `mutationPatterns/attack.ts`:
    ```json
    {
      "id": "fury_strike",
      "rarity": "RARE",
      "stats": { "damage": 0.2 } // Reduced from 0.25
    }
    ```
  - Rerun `simulateBattles.ts` to verify win rate drops to ~50%.
- **Outcome**: Balanced gameplay, with “Fury Strike” and “Reinforced Shell” win rates near 50%.

### Example Code
```typescript
// src/domains/gameTheory/services/utilityFunctionService.ts
class UtilityFunctionService {
  calculateUtility(creature: ICreature, action: string, matrix: IPayoffMatrix, opponentAction: string): number {
    const payoff = this.getPayoff(creature, action, opponentAction, matrix);
    const weights = { damage: 0.5, health: 0.5 }; // Adjusted for balance
    return (payoff.damageDealt * weights.damage) + (payoff.healthPreserved * weights.health) - payoff.damageTaken;
  }
}
```

## Performance Considerations
To ensure efficient simulations for 500 particles:
1. **Batch Processing**: Simulate multiple battles in a single pass to reduce overhead.
   - **Example**: Process all iterations in one loop in `simulateBattles.ts`.
2. **Cache Data**: Reuse creature and block data across iterations to avoid redundant calculations.
   - **Example**: Cache `IBlockData` in `bitcoinService.ts` [Timestamp: April 16, 2025, 21:41].
3. **Off-Thread Simulations**: Offload simulations to `computeWorker.ts` for large datasets [Timestamp: April 14, 2025, 19:58].
   - **Example**: Use `workerBridge.ts` to run battle simulations.
4. **Limit Iterations**: Start with 1,000 iterations, increasing only if statistical significance requires it (e.g., 10,000 for rare mutations).

### Example Off-Thread Simulation
```typescript
// scripts/simulateBattles.ts
async function simulateBattles(iterations: number) {
  const results = await workerBridge.sendMessage('compute', {
    task: 'simulateBattles',
    data: { iterations, blockData: createMockBlockData(12345) }
  });
  writeFileSync('simulation_results.json', JSON.stringify(results, null, 2));
  console.log('Simulation Results:', results);
}
```

## Testing Simulations
- **Unit Tests**: Test simulation logic in `tests/unit/simulateBattles.test.ts` to verify metric calculations.
- **Integration Tests**: Test simulation integration with game theory in `tests/integration/gameTheory.test.ts`.
- **Example**:
  ```typescript
  // tests/unit/simulateBattles.test.ts
  describe('Simulate Battles', () => {
    test('produces balanced win rates', async () => {
      const results = await simulateBattles(100);
      expect(results.furyStrikeWinRate).toBeCloseTo(50, -1);
      expect(results.reinforcedShellWinRate).toBeCloseTo(50, -1);
    });
  });
  ```

## Troubleshooting
1. **Unbalanced Results**:
   - **Symptom**: Win rate > 60% for a mutation (e.g., “Fury Strike”).
   - **Solution**: Adjust mutation stats in `mutationPatterns/` and rerun simulations [Timestamp: April 12, 2025, 12:18].
   - **Debugging**: Log battle outcomes:
     ```typescript
     logger.info(`Battle outcome: ${outcome.winner.id}`, outcome.scores);
     ```
2. **Slow Simulations**:
   - **Symptom**: Simulations take > 10ms per iteration.
   - **Solution**: Offload to `computeWorker.ts` and cache creature data.
   - **Debugging**: Profile with `performance.now()` in `simulateBattles.ts`.
3. **Non-Deterministic Results**:
   - **Symptom**: Win rates vary across runs with the same block nonce.
   - **Solution**: Verify RNG seeding in `rngSystem.ts` and consistent `IBlockData` inputs [Timestamp: April 12, 2025, 12:18].
   - **Debugging**: Log RNG seeds:
     ```typescript
     logger.debug(`RNG seed: ${blockData.nonce}`);
     ```


