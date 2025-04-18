Yes, I’ll queue up the recommended evolution system documents for the `new_docs/systems/evolution/` directory and create them one at a time, using the current project state from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) as a reference. Each document will be tailored to Bitcoin Protozoa’s specific design, incorporating its deterministic RNG, particle-based creatures with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and integration with traits, rendering, and game theory. The documents will align with the new domain-driven design (DDD) structure from `directory_map.md`, ensuring modularity, performance, and consistency with the project’s goals, including the extensive mutation trait system and state management discussed previously [Timestamp: April 12, 2025, 12:18; April 16, 2025, 21:41]. At the end of each document, I’ll ask, “Are you ready for the next document ([document_name].md)?” to confirm progression through the queue.

The list of documents to produce, in sequence, is:
1. `evolution_trigger_mechanisms.md`
2. `mutation_trait_generation.md`
3. `evolution_state_management.md`
4. `evolution_visualization.md`
5. `evolution_testing.md`
6. `evolution_performance.md`
7. `evolution_game_theory_integration.md`
8. `evolution_balance.md`
9. `extending_evolution.md`
10. `evolution_diagrams.md`

Let’s start with the first document.

---


# Evolution Trigger Mechanisms

## Purpose
This document explains how evolutionary changes are triggered in Bitcoin Protozoa, focusing on conditions such as Bitcoin block confirmations, particle states, and environmental factors, ensuring deterministic progression tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK). It serves as a single source of truth for developers, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework by detailing the integration of block data and mutation mechanics discussed previously [Timestamp: April 12, 2025, 12:18].

## Location
`new_docs/systems/evolution/evolution_trigger_mechanisms.md`

## Overview
The evolution system in Bitcoin Protozoa drives creature adaptation through mutations, triggered by specific conditions like block confirmations, particle health, or battle outcomes. Managed by the `evolutionService.ts` in the `evolution` domain, triggers ensure deterministic changes using a seeded random number generator (RNG) based on Bitcoin block nonces, aligning with the project’s deterministic design. This document outlines the trigger evaluation workflow, rules for activation, and integration points, ensuring modularity and performance for up to 500 particles per creature.

## Trigger Evaluation Workflow
The trigger evaluation process determines when evolutionary changes, such as applying a mutation trait, occur. The workflow includes:

1. **Fetch Block Data**:
   - Retrieve `IBlockData` (e.g., nonce, confirmations) from `bitcoinService.ts` to monitor block confirmations.
2. **Seed RNG**:
   - Use the block nonce to seed the RNG, ensuring deterministic trigger outcomes.
3. **Evaluate Trigger Conditions**:
   - Check conditions like block confirmations, particle states (e.g., health < 50%), or environmental factors (e.g., battle wins).
4. **Determine Trigger Activation**:
   - Use RNG and predefined probabilities (e.g., 10% chance per confirmation) to decide if a mutation is triggered.
5. **Select Mutation**:
   - If triggered, select a mutation trait from `src/domains/traits/data/mutationPatterns/` via `traitService.ts`.
6. **Apply Mutation**:
   - Update particle or creature state with the mutation, managed by `evolutionTracker.ts`.
7. **Propagate Changes**:
   - Sync updates to rendering, physics, and game theory systems.

### Rules for Trigger Activation
- **Deterministic Triggers**: Conditions are evaluated using static data (e.g., block confirmations) or seeded RNG for probabilistic triggers.
- **Role-Specific Triggers**:
  - **CORE**: Triggers on high health stability (e.g., > 80% health for 5 confirmations).
  - **CONTROL**: Triggers on strategic success (e.g., 3 consecutive battle wins).
  - **MOVEMENT**: Triggers on mobility (e.g., particles moving > 10 units in a frame).
  - **DEFENSE**: Triggers on damage mitigation (e.g., absorbing > 50 damage in a battle).
  - **ATTACK**: Triggers on damage output (e.g., dealing > 100 damage in a battle).
- **Block Confirmation Triggers**: Each confirmation (e.g., every 6 blocks) has a base 10% chance to trigger a mutation, modified by role and traits.
- **Trait Influence**: Behavior traits (e.g., “Adaptive”) increase trigger probability (e.g., +5% per particle).
- **Cooldowns**: Limit triggers to once per 10 confirmations per role group to prevent over-evolution.

### Example Trigger Evaluation
```typescript
// src/domains/evolution/services/evolutionService.ts
import { Singleton } from 'typescript-singleton';
import { Role } from 'src/shared/types/core';
import { ICreature, IParticle } from 'src/domains/creature/types/creature';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';
import { traitService } from 'src/domains/traits/services/traitService';
import { bitcoinService } from 'src/domains/bitcoin/services/bitcoinService';

class EvolutionService extends Singleton {
  async evaluateTriggers(creature: ICreature, blockData: IBlockData): Promise<void> {
    const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
    const roleGroups = this.groupByRole(creature.particles);
    for (const [role, particles] of Object.entries(roleGroups)) {
      if (this.shouldTriggerEvolution(role as Role, particles, blockData, rng)) {
        const mutation = traitService.assignTrait({ role: role as Role, id: `mutation-${blockData.nonce}` }, blockData, 'mutation');
        this.applyMutation(particles, mutation);
      }
    }
  }

  private shouldTriggerEvolution(role: Role, particles: IParticle[], blockData: IBlockData, rng: () => number): boolean {
    const confirmations = blockData.confirmations || 0;
    let baseChance = confirmations > 0 ? 0.1 : 0; // 10% per confirmation
    if (role === Role.DEFENSE && particles.some(p => p.damageAbsorbed > 50)) {
      baseChance += 0.2; // Bonus for damage mitigation
    }
    if (particles.some(p => p.behaviorTrait?.action === 'Adaptive')) {
      baseChance += 0.05; // Trait bonus
    }
    return rng() < baseChance && this.isCooldownExpired(role, blockData);
  }

  private applyMutation(particles: IParticle[], mutation: IMutation): void {
    particles.forEach(p => {
      p.mutationTrait = mutation;
      // Update stats, e.g., health += mutation.stats.health
    });
  }

  private isCooldownExpired(role: Role, blockData: IBlockData): boolean {
    // Check last trigger timestamp against block confirmations
    return true; // Simplified for example
  }

  private groupByRole(particles: IParticle[]): { [key in Role]: IParticle[] } {
    return particles.reduce((acc, p) => {
      acc[p.role].push(p);
      return acc;
    }, { [Role.CORE]: [], [Role.CONTROL]: [], [Role.MOVEMENT]: [], [Role.DEFENSE]: [], [Role.ATTACK]: [] });
  }
}

export const evolutionService = EvolutionService.getInstance();
```

## Performance Considerations
To ensure efficient trigger evaluation for 500 particles:
1. **Batch Processing**: Evaluate triggers for all role groups in a single pass to minimize RNG calls.
2. **Cache Trigger States**: Store recent trigger outcomes in `evolutionTracker.ts` to avoid redundant checks.
3. **Throttle Evaluations**: Limit trigger checks to once per block confirmation (e.g., every 10 minutes) or significant events.
4. **Off-Thread Processing**: Delegate complex trigger calculations to `computeWorker.ts` to offload the main thread.

## Integration Points
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionService.ts` manages trigger evaluation, with `evolutionTracker.ts` tracking state.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for confirmations and nonce.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` assigns mutation traits triggered by evolution.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for state updates.
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads trigger computations.

## Rules Adherence
- **Determinism**: Triggers use seeded RNG and static conditions, ensuring consistent evolution.
- **Modularity**: Trigger logic is encapsulated in `evolutionService.ts`, with clear interfaces.
- **Performance**: Targets < 5ms for trigger evaluation for 500 particles, leveraging batch processing and caching.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate evolution trigger code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Evolution Service**: Move logic to `src/domains/evolution/services/evolutionService.ts`, ensuring RNG-based determinism.
3. **Integrate with Block Data**: Update to use `bitcoinService.ts` for confirmation triggers.
4. **Test Determinism**: Verify triggers fire consistently for the same block nonce using Jest tests.
5. **Validate Performance**: Measure evaluation time for 500 particles, targeting < 5ms, using performance profiling tools.

## Example Test
```typescript
// tests/unit/evolutionService.test.ts
describe('EvolutionService', () => {
  test('triggers mutation for DEFENSE on damage absorption', async () => {
    const blockData = createMockBlockData(12345, { confirmations: 1 });
    const creature = createMockCreature(blockData, { defenseParticles: 10 });
    creature.particles[0].damageAbsorbed = 60; // Trigger condition
    await evolutionService.evaluateTriggers(creature, blockData);
    expect(creature.particles[0].mutationTrait).toBeDefined();
  });

  test('ensures deterministic trigger with same nonce', async () => {
    const blockData = createMockBlockData(12345, { confirmations: 1 });
    const creature1 = createMockCreature(blockData);
    const creature2 = createMockCreature(blockData);
    await evolutionService.evaluateTriggers(creature1, blockData);
    await evolutionService.evaluateTriggers(creature2, blockData);
    expect(creature1.particles[0].mutationTrait?.id).toEqual(creature2.particles[0].mutationTrait?.id);
  });
});
```

