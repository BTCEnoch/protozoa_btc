
# Game Theory Integration with Particles and Traits

## Purpose
This document details how the game theory system in Bitcoin Protozoa integrates with particle roles and traits to drive strategic outcomes in battles and decision-making. It serves as a single source of truth for developers, ensuring that particle compositions (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and traits (abilities, behaviors, mutations) are correctly incorporated into game theory calculations, maintaining determinism and balance specific to the project’s particle-based design and Bitcoin block data-driven RNG.

## Location
`new_docs/systems/game_theory/particle_trait_integration.md`

## Overview
The game theory system in Bitcoin Protozoa models strategic interactions using payoff matrices, decision trees, Nash equilibria, and utility functions, relying heavily on particle roles and traits to determine outcomes. Each creature’s 500 particles contribute to its strategic capabilities through their roles and associated traits, managed by services like `gameTheoryStrategyService.ts` and `traitService.ts`. This integration ensures that role distributions and trait effects shape battle payoffs and decisions deterministically, using block nonce for RNG consistency. This document outlines the integration workflow, mapping of particles and traits to game theory inputs, and optimization strategies, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Mapping Particles and Traits to Game Theory Inputs
Particles and their traits directly influence game theory calculations:

### Particle Roles
- **CORE**: Enhances resilience, increasing health multipliers in payoff matrices (+0.1% per particle).
- **CONTROL**: Improves strategic accuracy, boosting decision tree weights for optimal choices (+0.05% per particle).
- **MOVEMENT**: Increases attack speed, adding to damage payoffs (+0.15% per particle).
- **DEFENSE**: Reduces damage taken, lowering opponent payoffs (-0.2% per particle).
- **ATTACK**: Boosts damage output, increasing offensive payoffs (+0.25% per particle).

### Trait Categories
1. **Abilities**: Add specific stat boosts to payoffs (e.g., “Fire Blast” increases damage by 10).
   - **Mapping**: Applied in `payoffMatrixService.ts` to modify damage or health values.
2. **Behaviors**: Adjust strategy weights in decision trees (e.g., “Aggressive” increases Attack weight by 10%).
   - **Mapping**: Used in `decisionTreeService.ts` to prioritize actions.
3. **Mutations**: Introduce dynamic effects (e.g., “Enhanced Reflexes” reduces damage taken by 5%).
   - **Mapping**: Incorporated in `utilityFunctionService.ts` to adjust utility values.

### Example Particle Contribution
For a creature with 100 ATTACK particles and a “Fire Blast” ability:
- **Payoff Impact**: 100 * 0.25 + 10 (Fire Blast) = 35 damage for Attack strategy.
- **Decision Tree**: “Aggressive” behavior increases Attack branch weight by 10%.

## Integration Workflow
The integration process involves:

1. **Retrieve Particle Data**:
   - Access `ICreature` and `IParticle[]` data from the `creature` domain, including roles and traits.
2. **Aggregate Role Contributions**:
   - Summarize particle counts by role (e.g., 100 ATTACK, 50 DEFENSE) for payoff calculations.
3. **Apply Trait Effects**:
   - Use `traitService.ts` to retrieve and apply ability, behavior, and mutation effects to payoffs or weights.
4. **Compute Game Theory Inputs**:
   - Generate payoff matrices (`payoffMatrixService.ts`) with role and trait-modified values.
   - Adjust decision tree weights (`decisionTreeService.ts`) based on behaviors and CONTROL particles.
   - Calculate utilities (`utilityFunctionService.ts`) incorporating mutation effects.
5. **Execute Strategic Calculations**:
   - Use `nashEquilibriumFinder.ts` and `gameTheoryStrategyService.ts` to determine optimal strategies and outcomes.
6. **Update Creature State**:
   - Apply battle outcomes (e.g., health changes) to `ICreature` and propagate to rendering.

### Example Integration Code
#### Payoff Matrix with Particle Data
```typescript
// src/domains/gameTheory/services/payoffMatrixService.ts
import { Singleton } from 'typescript-singleton';
import { ICreature } from 'src/domains/creature/types/creature';
import { IPayoffMatrix } from 'src/domains/gameTheory/types/payoffMatrix';
import { Role } from 'src/shared/types/core';

class PayoffMatrixService extends Singleton {
  generateMatrix(creature1: ICreature, creature2: ICreature): IPayoffMatrix {
    const attack1 = this.calculateAttackPayoff(creature1);
    const defense1 = this.calculateDefensePayoff(creature1);
    const attack2 = this.calculateAttackPayoff(creature2);
    const defense2 = this.calculateDefensePayoff(creature2);

    return {
      roles: [creature1.id, creature2.id],
      strategies: ['Attack', 'Defend'],
      payoffs: [
        [[attack1, attack2], [attack1 + 20, defense2 - 20]],
        [[defense1 - 20, attack2 + 20], [defense1, defense2]]
      ]
    };
  }

  private calculateAttackPayoff(creature: ICreature): number {
    const attackParticles = creature.particles.filter(p => p.role === Role.ATTACK).length;
    let payoff = attackParticles * 0.25;
    creature.particles.forEach(p => {
      if (p.abilityTrait?.effect === 'Fire Blast') payoff += 10;
    });
    return payoff;
  }

  private calculateDefensePayoff(creature: ICreature): number {
    const defenseParticles = creature.particles.filter(p => p.role === Role.DEFENSE).length;
    let payoff = 50 - (defenseParticles * 0.2);
    creature.particles.forEach(p => {
      if (p.mutationTrait?.effect === 'Enhanced Reflexes') payoff -= 5;
    });
    return payoff;
  }
}

export const payoffMatrixService = PayoffMatrixService.getInstance();
```

#### Decision Tree with Behavior Traits
```typescript
// src/domains/gameTheory/services/decisionTreeService.ts
class DecisionTreeService {
  constructTree(creature1: ICreature, creature2: ICreature): IDecisionTree {
    const controlCount = creature1.particles.filter(p => p.role === Role.CONTROL).length;
    const behaviorModifier = creature1.particles.some(p => p.behaviorTrait?.action === 'Aggressive') ? 0.1 : 0;
    return {
      root: {
        type: 'decision',
        branches: [
          { strategy: 'Attack', weight: 0.5 + (controlCount * 0.05) + behaviorModifier },
          { strategy: 'Defend', weight: 0.5 - behaviorModifier }
        ]
      }
    };
  }
}
```

## Performance Considerations
To ensure efficient integration for 500 particles:
1. **Aggregate Particle Data**: Precompute role counts and trait effects in `payoffMatrixService.ts` to avoid iterating over all particles.
2. **Cache Game Theory Inputs**: Store matrices and weights in `gameTheoryStrategyService.ts` for common matchups.
3. **Batch Processing**: Compute payoffs and weights in a single pass over particle data.
4. **Off-Thread Processing**: Use `computeWorker.ts` for complex calculations to offload the main thread.

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `gameTheoryStrategyService.ts`, `payoffMatrixService.ts`, `decisionTreeService.ts`, and `utilityFunctionService.ts` use particle data.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for roles and traits.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IAbility`, `IBehavior`, and `IMutation` traits via `traitService.ts`.
- **Workers Domain (`src/domains/workers/`)**: Offloads computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Particle and trait data are static, ensuring consistent game theory outcomes.
- **Modularity**: Integration logic is encapsulated in game theory services, with clear interfaces.
- **Performance**: Targets < 10ms per calculation, optimized with aggregation and caching.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate code integrating particle data with game theory (e.g., in `src/lib/` or `src/creatures/`).
2. **Refactor into Services**: Move logic to `src/domains/gameTheory/services/` and `src/domains/traits/services/`.
3. **Update Particle Integration**: Ensure `IParticle` roles and traits are correctly mapped to payoffs and weights.
4. **Optimize Performance**: Implement aggregation, caching, and off-thread processing.
5. **Test Integration**: Validate strategic outcomes using Jest, ensuring correct role and trait contributions.

## Example Test
```typescript
// tests/integration/gameTheoryIntegration.test.ts
describe('Game Theory Particle Integration', () => {
  test('ATTACK particles and Fire Blast increase damage payoff', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100, ability: 'Fire Blast' });
    const creature2 = createMockCreature(blockData);
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(50); // Attack payoff > base
  });

  test('Aggressive behavior boosts Attack strategy', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { behavior: 'Aggressive' });
    const creature2 = createMockCreature(blockData);
    const strategy = decisionTreeService.processDecision(creature1, creature2);
    expect(strategy).toBe('Attack');
  });
});
```

