
# Formation Integration with Game Theory

## Purpose
This document details how the formation system in Bitcoin Protozoa integrates with the game theory system to influence battle outcomes and strategic decisions, leveraging role-specific formation patterns (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE) to enhance tactical gameplay. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and deterministic RNG driven by Bitcoin block data, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/formation/formation_game_theory_integration.md`

## Overview
The formation system organizes up to 500 particles per creature into role-specific patterns, which impact strategic outcomes in battles by modifying payoffs, decision weights, and utility values in the game theory system. Managed by `formationService.ts` in the `traits` domain and integrated with `gameTheoryStrategyService.ts` in the `gameTheory` domain, this integration ensures that formations like “Shield Wall” or “Vanguard” directly affect battle dynamics while maintaining determinism through static creature data and block nonce-seeded RNG. This document outlines the integration workflow, mapping of formations to game theory inputs, and performance considerations, ensuring modularity and tactical depth.

## Mapping Formations to Game Theory Inputs
Formation patterns influence game theory calculations by modifying payoffs, decision tree weights, and utility values based on their tactical properties:

### Formation Patterns and Effects
- **CORE (“Cluster”)**:
  - **Game Theory Impact**: Increases health multiplier (+0.15% per particle in “Cluster”), enhancing resilience in payoff matrices.
  - **Example**: Boosts health preservation in utility calculations, favoring defensive strategies.
- **CONTROL (“Grid”)**:
  - **Game Theory Impact**: Enhances strategic accuracy (+0.1% decision tree weight per particle), improving optimal strategy selection.
  - **Example**: Increases likelihood of choosing the best branch in decision trees.
- **MOVEMENT (“Swarm”)**:
  - **Game Theory Impact**: Boosts attack speed (+0.2% damage per particle), increasing offensive payoffs.
  - **Example**: Raises damage output in Attack strategy payoffs.
- **DEFENSE (“Shield Wall”)**:
  - **Game Theory Impact**: Reduces damage taken (-0.25% per particle), lowering opponent payoffs.
  - **Example**: Decreases damage in payoff matrices, favoring Defend strategy.
- **ATTACK (“Vanguard”)**:
  - **Game Theory Impact**: Increases damage output (+0.3% per particle), boosting offensive payoffs.
  - **Example**: Enhances Attack strategy payoffs, encouraging aggressive tactics.

### Trait Influence
- **Abilities**: Modify formation-specific payoffs (e.g., “Fire Blast” adds +10 damage in “Vanguard”).
- **Behaviors**: Adjust decision weights (e.g., “Aggressive” increases “Vanguard” Attack weight by 10%).
- **Mutations**: Introduce dynamic effects (e.g., “Enhanced Reflexes” reduces damage taken by 5% in “Shield Wall”).

### Example Formation Impact
For a creature with 100 DEFENSE particles in “Shield Wall”:
- **Payoff Impact**: Reduces opponent damage by 100 * 0.25 = 25 in payoff matrix.
- **Decision Tree**: Increases Defend strategy weight by 10% due to formation stability.

## Integration Workflow
The integration process involves:

1. **Retrieve Formation Data**:
   - Access `IFormationPattern` for each role group from `formationService.ts`, including pattern ID (e.g., “shield_wall”) and positions.
2. **Map Formation to Payoffs**:
   - Use `payoffMatrixService.ts` to adjust payoff values based on formation effects (e.g., “Shield Wall” reduces damage taken).
3. **Adjust Decision Tree Weights**:
   - Modify branch weights in `decisionTreeService.ts` to reflect formation tactics (e.g., “Vanguard” boosts Attack weight).
4. **Incorporate Utility Values**:
   - Update `utilityFunctionService.ts` to factor in formation-driven health or damage modifiers in utility calculations.
5. **Compute Strategic Outcomes**:
   - Use `gameTheoryStrategyService.ts` to simulate battles, incorporating formation-modified payoffs and weights.
6. **Update Creature State**:
   - Apply battle outcomes (e.g., health changes) to `ICreature`, propagating to rendering and physics systems.

### Example Integration Code
#### Payoff Matrix with Formation Effects
```typescript
// src/domains/gameTheory/services/payoffMatrixService.ts
import { Singleton } from 'typescript-singleton';
import { ICreature } from 'src/domains/creature/types/creature';
import { IPayoffMatrix } from 'src/domains/gameTheory/types/payoffMatrix';
import { formationService } from 'src/domains/traits/services/formationService';
import { Role } from 'src/shared/types/core';

class PayoffMatrixService extends Singleton {
  generateMatrix(creature1: ICreature, creature2: ICreature): IPayoffMatrix {
    const attack1 = this.calculateAttackPayoff(creature1);
    const defense1 = this.calculateDefensePayoff(creature1);
    const attack2 = this.calculateAttackPayoff(creature2);
    const defense2 = this.calculateDefensePayoff(creature2);

    // Apply formation effects
    const formation1 = formationService.getCurrentFormation(creature1);
    const formation2 = formationService.getCurrentFormation(creature2);
    const formationModifier1 = formation1.id === 'shield_wall' && formation1.role === Role.DEFENSE ? -25 : 0;
    const formationModifier2 = formation2.id === 'vanguard' && formation2.role === Role.ATTACK ? 20 : 0;

    return {
      roles: [creature1.id, creature2.id],
      strategies: ['Attack', 'Defend'],
      payoffs: [
        [[attack1 + formationModifier2, attack2 + formationModifier1], [attack1 + 20, defense2 - 20]],
        [[defense1 - 20, attack2 + 20], [defense1 + formationModifier1, defense2 + formationModifier2]]
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
}

export const payoffMatrixService = PayoffMatrixService.getInstance();
```

#### Decision Tree with Formation Weights
```typescript
// src/domains/gameTheory/services/decisionTreeService.ts
class DecisionTreeService {
  constructTree(creature1: ICreature, creature2: ICreature): IDecisionTree {
    const formation = formationService.getCurrentFormation(creature1);
    let attackWeight = 0.5;
    let defendWeight = 0.5;
    if (formation.id === 'vanguard' && formation.role === Role.ATTACK) {
      attackWeight += 0.1; // Formation boosts Attack
      defendWeight -= 0.1;
    } else if (formation.id === 'shield_wall' && formation.role === Role.DEFENSE) {
      defendWeight += 0.1; // Formation boosts Defend
      attackWeight -= 0.1;
    }
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
1. **Aggregate Formation Data**: Summarize formation effects at the creature level to reduce particle iterations in `payoffMatrixService.ts`.
2. **Cache Formation Effects**: Store formation modifiers in `formationService.ts` for common patterns.
3. **Batch Processing**: Compute payoff and weight adjustments in a single pass over role groups.
4. **Off-Thread Calculations**: Use `computeWorker.ts` for complex payoff or equilibrium calculations to offload the main thread.

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts`, `decisionTreeService.ts`, and `gameTheoryStrategyService.ts` use formation data for calculations.
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` provides `IFormationPattern` data for tactical effects.
- **Creature Domain (`src/domains/creature/`)**: Supplies `ICreature` and `IParticle` data for role and formation inputs.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` provides `IBehavior` and `IAbility` traits to modify payoffs.
- **Workers Domain (`src/domains/workers/`)**: Offloads computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Formation effects are based on static data and seeded RNG, ensuring consistency.
- **Modularity**: Integration logic is encapsulated in game theory and formation services.
- **Performance**: Targets < 10ms for game theory calculations with formation effects, optimized with caching and off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate code integrating formations with battles (e.g., in `src/lib/` or `src/creatures/`).
2. **Refactor into Services**: Move logic to `src/domains/gameTheory/services/` and `src/domains/traits/services/`.
3. **Update Formation Integration**: Ensure `formationService.ts` provides pattern data to `payoffMatrixService.ts`.
4. **Optimize Performance**: Implement caching and off-thread processing for efficiency.
5. **Test Integration**: Validate formation-driven payoffs and decisions using Jest, ensuring correct tactical impacts.

## Example Test
```typescript
// tests/integration/formationGameTheory.test.ts
describe('Formation Game Theory Integration', () => {
  test('Shield Wall reduces damage taken in payoff matrix', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { defenseParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const group = { role: Role.DEFENSE, particles: creature1.particles.filter(p => p.role === Role.DEFENSE) };
    formationService.assignFormation(group, blockData); // Assign Shield Wall
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[1][1][1]).toBeLessThan(50); // Reduced damage for creature1
  });

  test('Vanguard boosts Attack strategy weight', () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const group = { role: Role.ATTACK, particles: creature1.particles.filter(p => p.role === Role.ATTACK) };
    formationService.assignFormation(group, blockData); // Assign Vanguard
    const strategy = decisionTreeService.processDecision(creature1, creature2);
    expect(strategy).toBe('Attack');
  });
});
```
