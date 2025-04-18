
# Particle Interaction with Game Theory

## Purpose
This document details how particles in Bitcoin Protozoa contribute to game theory mechanics, influencing battle outcomes and strategic decisions through their roles and traits. It serves as a single source of truth for developers, ensuring that particle interactions are deterministic, balanced, and integrated with the game theory system, aligning with the project’s domain-driven design (DDD) principles.

## Location
`new_docs/systems/particle/particle_game_theory.md`

## Overview
In Bitcoin Protozoa, particles are the fundamental units of creatures, each assigned one of five roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and associated traits that define their behavior and capabilities. The game theory system, implemented in the `gameTheory` domain, uses these particle attributes to simulate battles, calculate payoffs, and determine strategic outcomes, such as Nash equilibria. This document outlines how particles interact with game theory mechanics, their impact on decision-making, and integration workflows, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Particle Roles in Game Theory
Each particle role contributes uniquely to game theory calculations, influencing battle outcomes and strategic decisions:

1. **CORE**:
   - **Role**: Stabilizes the creature, maintaining group cohesion.
   - **Game Theory Impact**: Increases resilience (e.g., higher health multiplier in payoff matrices).
   - **Example**: Adds a +10% health bonus to the creature’s total in battle simulations.
2. **CONTROL**:
   - **Role**: Directs group movement and strategy.
   - **Game Theory Impact**: Enhances decision-making (e.g., higher weight in decision trees for tactical choices).
   - **Example**: Boosts the probability of choosing optimal strategies by 5%.
3. **MOVEMENT**:
   - **Role**: Enables rapid repositioning or pursuit.
   - **Game Theory Impact**: Increases speed-based payoffs (e.g., faster attack frequency).
   - **Example**: Reduces opponent reaction time, adding a +15% damage modifier.
4. **DEFENSE**:
   - **Role**: Protects the creature from damage.
   - **Game Theory Impact**: Reduces damage taken in payoff calculations.
   - **Example**: Applies a -20% damage reduction to incoming attacks.
5. **ATTACK**:
   - **Role**: Engages enemies directly.
   - **Game Theory Impact**: Increases damage output in battle simulations.
   - **Example**: Adds a +25% damage multiplier to offensive payoffs.

### Trait Influence
Traits assigned to particles (via `traitService.ts`) further modify game theory outcomes:
- **Abilities**: Enhance specific payoffs (e.g., “Fire Blast” increases damage).
- **Behaviors**: Influence strategic choices (e.g., “Aggressive” prioritizes attack over defense).
- **Mutations**: Add dynamic modifiers (e.g., “Enhanced Reflexes” boosts dodge chance).

## Game Theory Mechanics
The `gameTheory` domain uses particle roles and traits to:
1. **Build Payoff Matrices**:
   - Particle roles and traits determine payoff values (e.g., damage, defense) for battle scenarios.
   - Example: A creature with many ATTACK particles has higher offensive payoffs.
2. **Construct Decision Trees**:
   - Behaviors and CONTROL particles guide decision-making (e.g., attack vs. retreat).
   - Example: CONTROL particles increase the likelihood of optimal branch selection.
3. **Calculate Nash Equilibria**:
   - Particle compositions influence equilibrium outcomes, balancing offense and defense.
   - Example: A balanced role distribution avoids dominant strategies.

### Example Payoff Matrix
For a battle between two creatures:
| Strategy | Creature A (High ATTACK) | Creature A (High DEFENSE) |
|----------|--------------------------|---------------------------|
| Creature B (High ATTACK) | (50, 50) | (30, 70) |
| Creature B (High DEFENSE) | (70, 30) | (40, 40) |
- **Values**: Represent damage dealt (first number for A, second for B).
- **Influence**: ATTACK particles increase damage, DEFENSE particles reduce it.

## Implementation
The integration is primarily managed by `gameTheoryStrategyService.ts`, which uses particle data to compute battle outcomes and strategies.

### Example Game Theory Integration
```typescript
// src/domains/gameTheory/services/gameTheoryStrategyService.ts
import { Singleton } from 'typescript-singleton';
import { ICreature } from 'src/domains/creature/types/creature';
import { IBattleOutcome } from 'src/domains/gameTheory/types/battleOutcome';

class GameTheoryStrategyService extends Singleton {
  simulateBattle(creature1: ICreature, creature2: ICreature): IBattleOutcome {
    const payoffMatrix = this.generatePayoffMatrix(creature1, creature2);
    const outcome = this.calculateOutcome(payoffMatrix);
    return { winner: outcome.winner, scores: outcome.scores };
  }

  private generatePayoffMatrix(creature1: ICreature, creature2: ICreature): number[][] {
    const attack1 = creature1.particles.filter(p => p.role === Role.ATTACK).length * 0.25; // Damage multiplier
    const defense1 = creature1.particles.filter(p => p.role === Role.DEFENSE).length * 0.20; // Damage reduction
    const attack2 = creature2.particles.filter(p => p.role === Role.ATTACK).length * 0.25;
    const defense2 = creature2.particles.filter(p => p.role === Role.DEFENSE).length * 0.20;
    return [
      [(50 + attack1 - defense2), (50 + attack2 - defense1)], // Both attack
      [(30 + attack1 - defense2), (70 - defense1)], // 1 attacks, 2 defends
      [(70 - defense2), (30 + attack2 - defense1)], // 1 defends, 2 attacks
      [(40 - defense2), (40 - defense1)] // Both defend
    ];
  }

  private calculateOutcome(matrix: number[][]): { winner: ICreature, scores: { [key: string]: number } } {
    // Simplified Nash equilibrium calculation
    return { winner: creature1, scores: { creature1: matrix[0][0], creature2: matrix[0][1] } };
  }
}

export const gameTheoryStrategyService = GameTheoryStrategyService.getInstance();
```

## Performance Considerations
To ensure efficient game theory calculations for 500 particles:
1. **Aggregate Particle Data**: Summarize particle roles and traits at the creature level to reduce computation complexity.
2. **Cache Payoff Matrices**: Store matrices for common creature configurations in `gameTheoryStrategyService.ts`.
3. **Batch Processing**: Process particle contributions in a single loop to minimize overhead.
4. **Off-Thread Calculations**: Use `computeWorker.ts` for complex equilibrium calculations.

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `gameTheoryStrategyService.ts` uses particle data for payoffs and decisions.
- **Creature Domain (`src/domains/creature/`)**: Provides `IParticle` and `ICreature` data for role and trait analysis.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IAbility`, `IBehavior`, and `IMutation` traits to modify payoffs.
- **Workers Domain (`src/domains/workers/`)**: Offloads calculations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Particle contributions are deterministic, based on static roles and traits.
- **Modularity**: Game theory logic is encapsulated in `gameTheoryStrategyService.ts`, with clear interfaces.
- **Performance**: Optimized for < 10ms calculations per battle, supporting real-time gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate game theory code (e.g., in `src/lib/` or `src/creatures/`).
2. **Refactor into Game Theory Service**: Move logic to `src/domains/gameTheory/services/gameTheoryStrategyService.ts`.
3. **Integrate Particle Data**: Update to use `IParticle` roles and traits for payoff calculations.
4. **Optimize Performance**: Implement caching and off-thread processing for complex calculations.
5. **Test Outcomes**: Validate battle outcomes and strategic decisions using Jest, ensuring determinism.

## Example Test
```typescript
// tests/integration/gameTheory.test.ts
describe('Game Theory Integration', () => {
  test('ATTACK particles increase damage in battle', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData, { attackParticles: 50 });
    const outcome = gameTheoryStrategyService.simulateBattle(creature1, creature2);
    expect(outcome.scores.creature1).toBeGreaterThan(outcome.scores.creature2);
  });
});
```


