Yes, I’ll queue up the recommended game theory system documents for the `new_docs/systems/game_theory/` directory and create them one at a time, using the current project state from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) as a reference. Each document will be tailored to Bitcoin Protozoa’s specific design, incorporating its deterministic RNG, particle-based creatures, role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and integration with traits and rendering. The documents will align with the new domain-driven design (DDD) structure from `directory_map.md`, ensuring modularity, performance, and consistency with the project’s goals. At the end of each document, I’ll ask, “Are you ready for the next document ([document_name].md)?” to confirm progression through the queue.

The list of documents to produce, in sequence, is:
1. `payoff_matrix_construction.md`
2. `decision_tree_processing.md`
3. `nash_equilibrium_calculation.md`
4. `utility_function_design.md`
5. `game_theory_testing.md`
6. `game_theory_performance.md`
7. `particle_trait_integration.md`
8. `strategic_balance.md`
9. `game_theory_visualization.md`
10. `extending_game_theory.md`

Let’s start with the first document.

---


# Payoff Matrix Construction

## Purpose
This document explains the process of constructing payoff matrices for battle simulations and strategic decisions in Bitcoin Protozoa. It serves as a single source of truth for developers, detailing how particle roles and traits influence payoff values, ensuring deterministic and balanced gameplay. The document is specific to the project’s design, leveraging its role-based particle system and deterministic RNG tied to Bitcoin block data.

## Location
`new_docs/systems/game_theory/payoff_matrix_construction.md`

## Overview
In Bitcoin Protozoa, payoff matrices quantify the outcomes of strategic interactions between creatures, such as battles, based on their particle compositions (roles: CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and traits (abilities, behaviors, mutations). Managed by the `payoffMatrixService.ts` in the `gameTheory` domain, matrix construction aggregates particle contributions to calculate payoffs (e.g., damage dealt, damage mitigated). The process is deterministic, using static creature data and trait effects, ensuring consistent outcomes across runs. This document outlines the construction workflow, rules for mapping roles and traits, and integration points, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Payoff Matrix Structure
A payoff matrix represents the outcomes of two creatures’ strategies (e.g., attack, defend) in a battle:
- **Rows**: Creature A’s strategies (e.g., Attack, Defend).
- **Columns**: Creature B’s strategies (e.g., Attack, Defend).
- **Cells**: Payoff pairs (e.g., [damage to B, damage to A]) reflecting the outcome of each strategy combination.

### Example Payoff Matrix
For two creatures with strategies “Attack” and “Defend”:
| Creature A \ Creature B | Attack | Defend |
|-------------------------|--------|--------|
| **Attack**              | [50, 50] | [70, 30] |
| **Defend**              | [30, 70] | [40, 40] |
- **Interpretation**: If both attack, each deals 50 damage. If A attacks and B defends, A deals 70 damage, B deals 30.

## Construction Workflow
The payoff matrix construction process involves:

1. **Retrieve Creature Data**:
   - Access `ICreature` data from the `creature` domain, including `IParticle[]` with roles and traits.
2. **Calculate Role Contributions**:
   - Aggregate particle counts for each role (e.g., 100 ATTACK particles) to determine base payoffs.
3. **Apply Trait Modifiers**:
   - Adjust payoffs based on ability, behavior, and mutation traits (e.g., “Fire Blast” ability adds +10 damage).
4. **Define Strategies**:
   - Specify strategies (e.g., Attack: prioritize ATTACK particles; Defend: prioritize DEFENSE particles).
5. **Compute Payoffs**:
   - Calculate payoff values for each strategy combination, factoring in role counts and trait effects.
6. **Construct Matrix**:
   - Populate the matrix with payoff pairs, stored as `number[][]` in `payoffMatrixService.ts`.

### Rules for Mapping Roles and Traits
- **Role Contributions**:
  - **CORE**: Increases health multiplier (+0.1% per particle).
  - **CONTROL**: Boosts strategic accuracy (+0.05% per particle for optimal strategy selection).
  - **MOVEMENT**: Enhances attack speed (+0.15% damage per particle).
  - **DEFENSE**: Reduces damage taken (-0.2% per particle).
  - **ATTACK**: Increases damage dealt (+0.25% per particle).
- **Trait Modifiers**:
  - **Abilities**: Add specific stat boosts (e.g., +10 damage for “Fire Blast”).
  - **Behaviors**: Modify strategy weights (e.g., “Aggressive” increases Attack strategy payoff by 5%).
  - **Mutations**: Apply dynamic effects (e.g., “Enhanced Reflexes” adds +10% dodge chance, reducing damage taken).
- **Determinism**: Payoffs are calculated using static creature data and trait effects, ensuring identical matrices for the same inputs.

### Example Payoff Calculation
For a creature with 100 ATTACK particles and a “Fire Blast” ability:
- Base Damage (Attack Strategy): 100 * 0.25 = 25 damage.
- Ability Modifier: +10 damage (Fire Blast).
- Total Damage: 25 + 10 = 35 damage.

## Implementation
The `payoffMatrixService.ts` service constructs payoff matrices, integrating with `gameTheoryStrategyService.ts` for battle simulations.

### Example Implementation
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
        [[attack1, attack2], [attack1 + 20, defense2 - 20]], // Both attack, A attacks/B defends
        [[defense1 - 20, attack2 + 20], [defense1, defense2]] // A defends/B attacks, Both defend
      ]
    };
  }

  private calculateAttackPayoff(creature: ICreature): number {
    const attackParticles = creature.particles.filter(p => p.role === Role.ATTACK).length;
    let payoff = attackParticles * 0.25; // Base damage
    creature.particles.forEach(p => {
      if (p.abilityTrait && p.abilityTrait.effect === 'Fire Blast') {
        payoff += 10; // Ability modifier
      }
    });
    return payoff;
  }

  private calculateDefensePayoff(creature: ICreature): number {
    const defenseParticles = creature.particles.filter(p => p.role === Role.DEFENSE).length;
    let payoff = 50 - (defenseParticles * 0.2); // Base damage reduction
    creature.particles.forEach(p => {
      if (p.mutationTrait && p.mutationTrait.effect === 'Enhanced Reflexes') {
        payoff -= 10; // Mutation reduces damage
      }
    });
    return payoff;
  }
}

export const payoffMatrixService = PayoffMatrixService.getInstance();
```

## Performance Considerations
To ensure efficient matrix construction for 500 particles:
1. **Aggregate Particle Data**: Summarize role counts and trait effects at the creature level to reduce iteration complexity.
2. **Cache Matrices**: Store matrices for common creature matchups in `payoffMatrixService.ts` to avoid recalculation.
3. **Batch Processing**: Compute payoffs in a single pass over particle data.
4. **Off-Thread Calculations**: Use `computeWorker.ts` for complex matrix computations to offload the main thread.

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` integrates with `gameTheoryStrategyService.ts` for battle simulations.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for role and trait inputs.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IAbility`, `IBehavior`, and `IMutation` traits to modify payoffs.
- **Workers Domain (`src/domains/workers/`)**: Offloads computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Payoffs are calculated using static creature and trait data, ensuring consistency.
- **Modularity**: Matrix construction is encapsulated in `payoffMatrixService.ts`, with clear interfaces.
- **Performance**: Targets < 10ms per matrix generation, optimized with caching and batch processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate game theory code (e.g., in `src/lib/` or `src/creatures/`) related to battle outcomes.
2. **Refactor into Payoff Service**: Move logic to `src/domains/gameTheory/services/payoffMatrixService.ts`.
3. **Integrate Particle Data**: Update to use `IParticle` roles and traits for payoff calculations.
4. **Optimize Performance**: Implement caching and off-thread processing for efficiency.
5. **Test Matrices**: Validate payoff matrices using Jest, ensuring correct role and trait contributions.

## Example Test
```typescript
// tests/unit/payoffMatrixService.test.ts
describe('PayoffMatrixService', () => {
  test('generates correct payoff for ATTACK-heavy creature', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData, { defenseParticles: 100 });
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(matrix.payoffs[1][1][0]); // Attack deals more damage
  });
});
```


