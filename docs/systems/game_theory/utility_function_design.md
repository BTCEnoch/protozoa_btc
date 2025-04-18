
# Utility Function Design

## Purpose
This document explains the design and application of utility functions in Bitcoin Protozoa to evaluate creature actions and outcomes in strategic interactions, such as battles. It serves as a single source of truth for developers, detailing how particle roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and traits shape utility values, ensuring deterministic and balanced decision-making tailored to the project’s particle-based design and deterministic RNG.

## Location
`new_docs/systems/game_theory/utility_function_design.md`

## Overview
Utility functions in Bitcoin Protozoa quantify the desirability of actions or outcomes for creatures, guiding strategic choices in battles and other interactions. Implemented in the `utilityFunctionService.ts` within the `gameTheory` domain, these functions evaluate factors like damage dealt, health preserved, and strategic alignment, driven by particle roles and traits. The process is deterministic, relying on static creature data and trait effects, ensuring consistent evaluations across runs. This document outlines the design principles, calculation workflow, and integration points, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Utility Function Concepts
- **Definition**: A utility function assigns a numerical value to an action or outcome, representing its benefit to a creature (e.g., higher utility for dealing more damage while preserving health).
- **Application**: Used in decision trees (`decisionTreeService.ts`) to select optimal strategies and in payoff matrix evaluations to weigh outcomes.
- **Factors**: Utility is influenced by particle roles, traits (abilities, behaviors, mutations), and battle context (e.g., opponent strength).

### Example Utility Function
For a creature choosing between Attack and Defend:
- **Attack Utility**: High if many ATTACK particles and aggressive traits; values damage dealt.
- **Defend Utility**: High if many DEFENSE particles and cautious traits; values health preservation.
- **Formula**: `Utility = w1 * DamageDealt + w2 * HealthPreserved - w3 * DamageTaken`, where `w1`, `w2`, `w3` are weights.

## Design Principles
1. **Role-Based Weighting**:
   - **CORE**: Prioritizes health preservation (+0.1% weight per particle).
   - **CONTROL**: Enhances strategic alignment (+0.05% weight to optimal actions per particle).
   - **MOVEMENT**: Favors speed-based outcomes (+0.1% damage weight per particle).
   - **DEFENSE**: Emphasizes damage mitigation (+0.2% health weight per particle).
   - **ATTACK**: Boosts damage output (+0.25% damage weight per particle).
2. **Trait Modifiers**:
   - **Abilities**: Add specific bonuses (e.g., “Fire Blast” adds +10 to damage).
   - **Behaviors**: Adjust weights (e.g., “Aggressive” increases damage weight by 10%).
   - **Mutations**: Introduce dynamic effects (e.g., “Enhanced Reflexes” adds +5% to health weight).
3. **Determinism**: Calculations use static data, ensuring identical utility values for the same inputs.
4. **Balance**: Weights are tuned to prevent dominant strategies, promoting diverse gameplay.

## Calculation Workflow
The utility function calculation workflow involves:

1. **Retrieve Creature Data**:
   - Access `ICreature` and `IParticle[]` data, including roles and traits.
2. **Define Action Context**:
   - Specify the action (e.g., Attack) and context (e.g., opponent’s strategy, payoff matrix).
3. **Calculate Base Utility**:
   - Compute base utility from payoff matrix outcomes (e.g., damage dealt, damage taken).
4. **Apply Role Contributions**:
   - Adjust utility based on particle role counts (e.g., ATTACK particles boost damage).
5. **Incorporate Trait Modifiers**:
   - Modify utility with ability, behavior, and mutation effects.
6. **Normalize and Return**:
   - Normalize utility values to a consistent scale (e.g., 0 to 100) for comparison.

### Example Utility Calculation
For a creature with 100 ATTACK particles, 50 DEFENSE particles, and an “Aggressive” behavior:
- **Action**: Attack
- **Base Utility**: Damage Dealt (50) - Damage Taken (50) = 0
- **Role Adjustments**:
  - ATTACK: +100 * 0.25 = +25 damage
  - DEFENSE: +50 * 0.2 = +10 health
- **Trait Modifier**: Aggressive (+10% damage weight) = +5 damage
- **Final Utility**: (25 + 5) * 0.6 (damage weight) + 10 * 0.4 (health weight) = 22

## Implementation
The `utilityFunctionService.ts` service calculates utility values, integrating with `payoffMatrixService.ts` and `decisionTreeService.ts`.

### Example Implementation
```typescript
// src/domains/gameTheory/services/utilityFunctionService.ts
import { Singleton } from 'typescript-singleton';
import { ICreature } from 'src/domains/creature/types/creature';
import { IPayoffMatrix } from 'src/domains/gameTheory/types/payoffMatrix';
import { Role } from 'src/shared/types/core';

class UtilityFunctionService extends Singleton {
  calculateUtility(creature: ICreature, action: string, matrix: IPayoffMatrix, opponentAction: string): number {
    const payoff = this.getPayoff(creature, action, opponentAction, matrix);
    const roleUtility = this.calculateRoleUtility(creature, action);
    const traitUtility = this.calculateTraitUtility(creature, action);
    const weights = { damage: 0.6, health: 0.4 }; // Tuned weights
    return (payoff.damageDealt + roleUtility.damage + traitUtility.damage) * weights.damage +
           (payoff.healthPreserved + roleUtility.health + traitUtility.health) * weights.health -
           payoff.damageTaken;
  }

  private getPayoff(creature: ICreature, action: string, opponentAction: string, matrix: IPayoffMatrix): { damageDealt: number, damageTaken: number, healthPreserved: number } {
    const actionIndex = matrix.strategies.indexOf(action);
    const opponentIndex = matrix.strategies.indexOf(opponentAction);
    return {
      damageDealt: matrix.payoffs[actionIndex][opponentIndex][0],
      damageTaken: matrix.payoffs[actionIndex][opponentIndex][1],
      healthPreserved: 50 - matrix.payoffs[actionIndex][opponentIndex][1]
    };
  }

  private calculateRoleUtility(creature: ICreature, action: string): { damage: number, health: number } {
    const attackCount = creature.particles.filter(p => p.role === Role.ATTACK).length;
    const defenseCount = creature.particles.filter(p => p.role === Role.DEFENSE).length;
    return {
      damage: action === 'Attack' ? attackCount * 0.25 : 0,
      health: action === 'Defend' ? defenseCount * 0.2 : 0
    };
  }

  private calculateTraitUtility(creature: ICreature, action: string): { damage: number, health: number } {
    let damage = 0;
    let health = 0;
    creature.particles.forEach(p => {
      if (p.abilityTrait && p.abilityTrait.effect === 'Fire Blast' && action === 'Attack') {
        damage += 10;
      }
      if (p.behaviorTrait && p.behaviorTrait.action === 'Aggressive' && action === 'Attack') {
        damage += 5;
      }
    });
    return { damage, health };
  }
}

export const utilityFunctionService = UtilityFunctionService.getInstance();
```

## Performance Considerations
To ensure efficient utility calculations for 500 particles:
1. **Aggregate Particle Data**: Summarize role counts and trait effects at the creature level to reduce iteration.
2. **Cache Utility Values**: Store results for common actions in `utilityFunctionService.ts`.
3. **Batch Processing**: Compute utilities for multiple actions in a single pass.
4. **Off-Thread Processing**: Use `computeWorker.ts` for complex calculations to offload the main thread.

## Integration Points
- **Game Theory Domain (`src/domains/gameTheory/`)**: `utilityFunctionService.ts` integrates with `decisionTreeService.ts` for strategy selection and `payoffMatrixService.ts` for payoff inputs.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for role and trait inputs.
- **Traits Domain (`src/domains/traits/`)**: Supplies `IAbility`, `IBehavior`, and `IMutation` traits to adjust utilities.
- **Workers Domain (`src/domains/workers/`)**: Offloads computations via `computeWorker.ts`.

## Rules Adherence
- **Determinism**: Utilities are calculated using static data, ensuring consistency.
- **Modularity**: Calculation logic is encapsulated in `utilityFunctionService.ts`, with clear interfaces.
- **Performance**: Targets < 10ms per calculation, optimized with caching and off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate decision-making code (e.g., in `src/lib/` or `src/creatures/`) related to action evaluation.
2. **Refactor into Utility Service**: Move logic to `src/domains/gameTheory/services/utilityFunctionService.ts`.
3. **Integrate Particle Data**: Update to use `IParticle` roles and traits for utility calculations.
4. **Optimize Performance**: Implement caching and off-thread processing for efficiency.
5. **Test Utilities**: Validate utility values using Jest, ensuring correct role and trait contributions.

## Example Test
```typescript
// tests/unit/utilityFunctionService.test.ts
describe('UtilityFunctionService', () => {
  test('calculates higher utility for Attack with ATTACK-heavy creature', () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData, { attackParticles: 100 });
    const matrix = payoffMatrixService.generateMatrix(creature, createMockCreature(blockData));
    const attackUtility = utilityFunctionService.calculateUtility(creature, 'Attack', matrix, 'Defend');
    const defendUtility = utilityFunctionService.calculateUtility(creature, 'Defend', matrix, 'Defend');
    expect(attackUtility).toBeGreaterThan(defendUtility);
  });
});
```
 
