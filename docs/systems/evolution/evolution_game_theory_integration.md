
# Evolution Integration with Game Theory

## Purpose
This document details how the evolution system in Bitcoin Protozoa integrates with the game theory system to influence battle outcomes and strategic decisions, leveraging mutation-driven changes and evolutionary states to enhance tactical gameplay. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and deterministic RNG driven by Bitcoin block data, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/evolution/evolution_game_theory_integration.md`

## Overview
The evolution system drives creature adaptation through mutations, altering stats, behaviors, and visuals, which directly impact game theory calculations like payoff matrices, decision trees, and utility functions. Managed by `evolutionService.ts` and `evolutionTracker.ts` in the `evolution` domain, and integrated with `gameTheoryStrategyService.ts` in the `gameTheory` domain, this integration ensures that mutations (e.g., “Fury Strike” for ATTACK) and evolutionary states (e.g., tier progression) enhance strategic outcomes. The process is deterministic, using static creature data and block nonce-seeded RNG, ensuring consistent gameplay effects. This document outlines the integration workflow, mapping of evolutionary changes to game theory inputs, and performance considerations.

## Mapping Evolutionary Changes to Game Theory Inputs
Evolutionary changes, including mutation traits and state updates, influence game theory calculations by modifying payoffs, decision weights, and utility values:

### Mutation Traits
- **CORE (“Iron Core”)**:
  - **Game Theory Impact**: Increases health multiplier (+0.2% per particle), enhancing resilience in payoff matrices.
  - **Example**: Boosts health preservation in utility calculations, favoring defensive strategies.
- **CONTROL (“Tactical Mind”)**:
  - **Game Theory Impact**: Enhances strategic accuracy (+0.1% decision tree weight per particle), improving optimal strategy selection.
  - **Example**: Increases likelihood of choosing the best branch in decision trees.
- **MOVEMENT (“Swift Stride”)**:
  - **Game Theory Impact**: Boosts attack speed (+0.15% damage per particle), increasing offensive payoffs.
  - **Example**: Raises damage output in Attack strategy payoffs.
- **DEFENSE (“Reinforced Shell”)**:
  - **Game Theory Impact**: Reduces damage taken (-0.2% per particle), lowering opponent payoffs.
  - **Example**: Decreases damage in payoff matrices, favoring Defend strategy.
- **ATTACK (“Fury Strike”)**:
  - **Game Theory Impact**: Increases damage output (+0.25% per particle), boosting offensive payoffs.
  - **Example**: Enhances Attack strategy payoffs, encouraging aggressive tactics.

### Evolutionary States
- **Tier Progression**:
  - **Impact**: Higher tiers (e.g., tier 5 Apex) amplify mutation effects (e.g., +10% to all mutation stats), increasing payoff values.
  - **Example**: Tier 5 creature with “Fury Strike” gains +0.275% damage per particle.
- **Subclass Assignment**:
  - **Impact**: Subclasses (e.g., “Guardian” for DEFENSE-heavy) add role-specific bonuses (e.g., +5% damage reduction for Guardians).
  - **Example**: Guardian subclass boosts “Reinforced Shell” effect in Defend strategy.
- **Mutation Count**:
  - **Impact**: More mutations (up to 3 per particle) stack effects, scaling payoffs linearly.
  - **Example**: Three “Swift Stride” mutations increase MOVEMENT particle speed by 45%.

### Example Mutation Impact
For a creature with 100 ATTACK particles, each with a “Fury Strike” mutation (tier 3):
- **Payoff Impact**: Base damage (100 * 0.25) + mutation (100 * 0.25) = 50 damage in Attack strategy payoff.
- **Decision Tree**: “Aggressive” behavior (from mutation synergy) increases Attack branch weight by 10%.

## Integration Workflow
The integration process involves:

1. **Retrieve Evolution State**:
   - Access `ICreature` and `IParticle` data from `evolutionTracker.ts`, including mutation traits, tier, and subclass.
2. **Map Mutations to Payoffs**:
   - Use `payoffMatrixService.ts` to adjust payoff values based on mutation effects (e.g., “Reinforced Shell” reduces damage taken).
3. **Adjust Decision Tree Weights**:
   - Modify branch weights in `decisionTreeService.ts` to reflect mutation-driven tactics (e.g., “Tactical Mind” boosts optimal strategy weight).
4. **Incorporate Utility Values**:
   - Update `utilityFunctionService.ts` to factor in mutation-enhanced stats and tier bonuses in utility calculations.
5. **Compute Strategic Outcomes**:
   - Use `gameTheoryStrategyService.ts` to simulate battles, incorporating mutation-modified payoffs and weights.
6. **Update Creature State**:
   - Apply battle outcomes (e.g., health changes) to `ICreature`, syncing with `evolutionTracker.ts` for persistence.

### Example Integration Code
#### Payoff Matrix with Mutation Effects
```typescript
// src/domains/gameTheory/services/payoffMatrixService.ts
import { Singleton } from 'typescript-singleton';
import { ICreature } from 'src/domains/creature/types/creature';
import { IPayoffMatrix } from 'src/domains/gameTheory/types/payoffMatrix';
import { useEvolutionStore } from 'src/domains/evolution/stores/evolutionStore';
import { Role } from 'src/shared/types/core';

class PayoffMatrixService extends Singleton {
  generateMatrix(creature1: ICreature, creature2: ICreature): IPayoffMatrix {
    const attack1 = this.calculateAttackPayoff(creature1);
    const defense1 = this.calculateDefensePayoff(creature1);
    const attack2 = this.calculateAttackPayoff(creature2);
    const defense2 = this.calculateDefensePayoff(creature2);

    // Apply mutation effects
    const evolutionState1 = useEvolutionStore.getState().creatures[creature1.id];
    const mutationModifier1 = this.getMutationModifier(creature1, evolutionState1);
    const evolutionState2 = useEvolutionStore.getState().creatures[creature2.id];
    const mutationModifier2 = this.getMutationModifier(creature2, evolutionState2);

    return {
      roles: [creature1.id, creature2.id],
      strategies: ['Attack', 'Defend'],
      payoffs: [
        [[attack1 + mutationModifier1.damage, attack2 + mutationModifier2.damage], [attack1 + 20, defense2 - 20]],
        [[defense1 - mutationModifier1.defense, attack2 + 20], [defense1, defense2 + mutationModifier2.defense]]
      ]
    };
  }

  private calculateAttackPayoff(creature: ICreature): number {
    const attackParticles = creature.particles.filter(p => p.role === Role.ATTACK).length;
    return attackParticles * 0.25;
  }

  private calculateDefensePayoff(creature: ICreature): number {
    const defenseParticles = creature.particles.filter(p => p.role === Role.DEFENSE).length;
    return 50 - (defenseParticles * 0.2);
  }

  private getMutationModifier(creature: ICreature, state: IEvolutionState): { damage: number, defense: number } {
    let damage = 0;
    let defense = 0;
    creature.particles.forEach(p => {
      if (p.mutationTrait?.effect === 'fury_strike') damage += 0.25 * (state.tier / 5); // Tier scaling
      if (p.mutationTrait?.effect === 'reinforced_shell') defense += 0.2 * (state.tier / 5);
    });
    if (state.subclass === 'Guardian') defense += 5; // Subclass bonus
    return { damage, defense };
  }
}

export const payoffMatrixService = PayoffMatrixService.getInstance();
```

#### Decision Tree with Mutation Weights
```typescript
// src/domains/gameTheory/services/decisionTreeService.ts
class DecisionTreeService {
  constructTree(creature1: ICreature, creature2: ICreature): IDecisionTree {
    const evolutionState = useEvolutionStore.getState().creatures[creature1.id];
    let attackWeight = 0.5;
    let defendWeight = 0.5;
    creature1.particles.forEach(p => {
      if (p.mutationTrait?.effect === 'tactical_mind') {
        attackWeight += 0.1 * (evolutionState.tier / 5); // Mutation boosts optimal strategy
        defendWeight -= 0.1 * (evolutionState.tier / 5);
      }
    });
    return {
      root: {
        type: 'decision',
        branches: [
          { strategy: 'Attack', weight: attackWeight },
          { strategy: 'Defend', weight: defendWeight }
        ]
      }
    };
  }
}
```

## Performance Considerations
To ensure efficient integration for 500 particles:
1. **Aggregate Mutation Effects**: Summarize mutation impacts at the creature level in `payoffMatrixService.ts` to reduce particle iterations.
2. **Cache Evolution States**: Store state data in Zustand to avoid frequent `evolutionTracker.ts` access.
3. **Batch Processing**: Compute payoff and weight adjustments in a single pass over role groups.
4. **Off-Thread Calculations**: Use `computeWorker.ts` for complex payoff or equilibrium calculations to offload the main thread [Timestamp: April 14, 2025, 19:58].

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts`, `decisionTreeService.ts`, and `gameTheoryStrategyService.ts` use mutation and state data.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` provides mutation traits and state updates.
- **Creature Domain (`src/domains/creature/`)**: Supplies `ICreature` and `IParticle` data for role and mutation inputs.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` provides `IMutation` traits for payoff adjustments.
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads computations.

## Rules Adherence
- **Determinism**: Mutation and state effects are based on static data and seeded RNG, ensuring consistency.
- **Modularity**: Integration logic is encapsulated in game theory and evolution services.
- **Performance**: Targets < 10ms for game theory calculations with evolution effects, optimized with caching and off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate code integrating evolution with battles (e.g., in `src/lib/` or `src/creatures/`).
2. **Refactor into Services**: Move logic to `src/domains/gameTheory/services/` and `src/domains/evolution/services/`.
3. **Update Evolution Integration**: Ensure `evolutionTracker.ts` provides mutation and state data to `payoffMatrixService.ts`.
4. **Optimize Performance**: Implement caching and off-thread processing for efficiency.
5. **Test Integration**: Validate mutation-driven payoffs and decisions using Jest, ensuring correct tactical impacts.

## Example Test
```typescript
// tests/integration/evolutionGameTheory.test.ts
describe('Evolution Game Theory Integration', () => {
  test('Fury Strike mutation increases Attack payoff', async () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const mutation = { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 25 }, visual: {} };
    await evolutionTracker.updateEvolutionState(creature1, mutation, blockData);
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(50); // Increased damage
  });

  test('Tactical Mind mutation boosts Attack strategy weight', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { controlParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const mutation = { id: 'tactical_mind', effect: 'strategy_boost', stats: {}, visual: {} };
    evolutionTracker.updateEvolutionState(creature1, mutation, blockData);
    const strategy = decisionTreeService.processDecision(creature1, creature2);
    expect(strategy).toBe('Attack');
  });
});
```

