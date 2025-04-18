
# Extending the Evolution System

## Purpose
This document guides developers on extending the evolution system in Bitcoin Protozoa by adding new mutation types, triggers, or evolutionary mechanics without disrupting existing functionality, ensuring flexibility for new gameplay elements. It serves as a single source of truth, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system with over 200 traits [Timestamp: April 12, 2025, 12:18], and deterministic RNG driven by Bitcoin block data, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/evolution/extending_evolution.md`

## Overview
The evolution system drives creature adaptation through triggers (e.g., block confirmations), mutation trait generation, and state management, managed by `evolutionService.ts`, `traitService.ts`, and `evolutionTracker.ts`. Its modular design supports extensions like new mutation types (e.g., “Adaptive Camouflage” for stealth) or trigger conditions (e.g., environmental survival), maintaining determinism via block nonce-seeded RNG and robust state handling with Zustand and IndexedDB [Timestamp: April 16, 2025, 21:41]. This document provides steps to introduce new features, best practices for compatibility, and guidelines for updating related systems, ensuring scalability and performance (< 5ms updates for 500 particles).

## Steps to Introduce a New Mutation Type
Adding a new mutation type, such as “Adaptive Camouflage” (enhances evasion for MOVEMENT particles), involves the following steps:

1. **Define the Mutation’s Purpose and Mechanics**
   - **Purpose**: Specify the mutation’s role (e.g., “Adaptive Camouflage” increases evasion, reducing enemy targeting accuracy).
   - **Mechanics**: Outline effects (e.g., +10% dodge chance, visual transparency effect) and role specificity (MOVEMENT-focused).
   - **Example**: “Adaptive Camouflage” adds a 10% dodge chance, reducing damage taken in game theory payoffs, with a subtle transparency shader.

2. **Create Mutation Data**
   - **Location**: Add to `src/domains/traits/data/mutationPatterns/` (e.g., `movement.ts` or new `adaptiveCamouflage.ts`).
   - **Content**: Define the `IMutation` with ID, name, rarity, effect, stats, and visual properties.
   - **Example**:
     ```json
     // src/domains/traits/data/mutationPatterns/movement.ts
     {
       "id": "adaptive_camouflage",
       "name": "Adaptive Camouflage",
       "rarity": "EPIC",
       "effect": "Increases dodge chance by 10%",
       "stats": { "dodgeChance": 0.1 },
       "visual": { "color": "#88aaff", "glowIntensity": 0.5, "size": 1.0, "transparency": 0.3 }
     }
     ```

3. **Update Trait Service**
   - **Location**: Modify `src/domains/traits/services/traitService.ts` to include the new mutation in selection logic.
   - **Content**: Add to role-specific mutation pools and update rarity logic if needed.
   - **Example**:
     ```typescript
     // src/domains/traits/services/traitService.ts
     import { movementMutationPatterns } from 'src/domains/traits/data/mutationPatterns/movement';

     class TraitService {
       private getMutationPool(role: Role): IMutation[] {
         switch (role) {
           case Role.MOVEMENT:
             return movementMutationPatterns; // Includes Adaptive Camouflage
           // Other roles
           default:
             return [];
         }
       }
     }
     ```

4. **Extend Evolution Service**
   - **Location**: Update `src/domains/evolution/services/evolutionService.ts` to support new trigger conditions or mutation-specific logic.
   - **Content**: Add conditions for triggering “Adaptive Camouflage” (e.g., high movement distance in battles).
   - **Example**:
     ```typescript
     // src/domains/evolution/services/evolutionService.ts
     class EvolutionService {
       private shouldTriggerEvolution(role: Role, particles: IParticle[], blockData: IBlockData, rng: () => number): boolean {
         let baseChance = blockData.confirmations > 0 ? 0.1 : 0;
         if (role === Role.MOVEMENT && particles.some(p => p.movementDistance > 10)) {
           baseChance += 0.15; // Bonus for high mobility
         }
         return rng() < baseChance && this.isCooldownExpired(role, blockData);
       }
     }
     ```

5. **Integrate with Game Theory**
   - **Location**: Update `src/domains/gameTheory/services/payoffMatrixService.ts` to include “Adaptive Camouflage” effects.
   - **Content**: Adjust payoffs to reflect dodge chance (e.g., reduce opponent damage by 10%).
   - **Example**:
     ```typescript
     // src/domains/gameTheory/services/payoffMatrixService.ts
     class PayoffMatrixService {
       private getMutationModifier(creature: ICreature, state: IEvolutionState): { damage: number, defense: number } {
         let defense = 0;
         creature.particles.forEach(p => {
           if (p.mutationTrait?.effect === 'adaptive_camouflage') {
             defense += 10 * (state.tier / 5); // Dodge chance reduces damage
           }
         });
         return { damage: 0, defense };
       }
     }
     ```

6. **Update Rendering**
   - **Location**: Enhance `src/domains/rendering/services/instancedRenderer.ts` to visualize “Adaptive Camouflage” (e.g., transparency effect).
   - **Content**: Apply shader uniforms for transparency and subtle glow.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/instancedRenderer.ts
     class InstancedRenderer {
       updateParticles(particles: IParticle[]) {
         particles.forEach((p, i) => {
           if (p.mutationTrait?.effect === 'adaptive_camouflage') {
             this.mesh.material.uniforms.transparency.value = p.mutationTrait.visual.transparency || 0.3;
           }
         });
       }
     }
     ```

7. **Test the New Mutation**
   - Write unit tests for mutation generation, trigger activation, and game theory integration.
   - Perform integration tests to ensure compatibility with rendering, physics, and state management.
   - **Example**:
     ```typescript
     // tests/unit/traitService.test.ts
     describe('TraitService', () => {
       test('generates Adaptive Camouflage for MOVEMENT', () => {
         const blockData = createMockBlockData(12345, { confirmations: 10 });
         const particle = createMockParticle({ role: Role.MOVEMENT });
         particle.movementDistance = 15; // Trigger condition
         const mutation = traitService.assignTrait(particle, blockData, 'mutation');
         expect(mutation.id).toBe('adaptive_camouflage');
         expect(mutation.stats.dodgeChance).toBe(0.1);
       });
     });
     ```

## Best Practices for Maintaining Compatibility
1. **Preserve Existing Mutations**: Add “Adaptive Camouflage” without altering mutations like “Fury Strike” in `traitService.ts`.
2. **Deprecate, Don’t Delete**: Mark outdated mutations as deprecated in `mutationPatterns/` to support legacy code.
3. **Version Mutation Data**: Add a `version` field to `IMutation` (e.g., `{ id: "adaptive_camouflage", version: "1.0" }`).
4. **Document Extensions**: Update `docs/systems/evolution/` with new mutation details and migration guides.
5. **Test for Regressions**: Use Jest to validate existing mutations, triggers, and game theory outcomes remain unaffected.

## Guidelines for Updating Related Systems
1. **Balance New Mutations**: Tune “Adaptive Camouflage” effects (e.g., +10% dodge chance) to prevent dominance, using simulation scripts as discussed for mutation balance [Timestamp: April 12, 2025, 12:18].
2. **Optimize Performance**: Ensure new calculations stay within < 5ms, using caching (`traitService.ts`) and off-thread processing (`computeWorker.ts`) [Timestamp: April 14, 2025, 19:58].
3. **Enhance Visuals**: Add distinct visual cues for “Adaptive Camouflage” (e.g., transparency) in `instancedRenderer.ts`, aligning with our focus on visual libraries [Timestamp: April 16, 2025, 21:41].
4. **Integrate with State Management**: Update `evolutionTracker.ts` to track new mutation states, leveraging Zustand and IndexedDB [Timestamp: April 16, 2025, 21:41].
5. **Test Extensively**: Validate new mutations with unit and integration tests, ensuring balance and performance.

## Performance Considerations
- **Efficient Trait Selection**: Cache mutation pools to minimize data access during generation.
- **Batch Processing**: Apply new mutations in bulk for role groups to reduce overhead.
- **Off-Thread Calculations**: Use `computeWorker.ts` for complex trigger or payoff calculations.
- **Minimal Overhead**: Limit new mutation complexity (e.g., simple stat changes) to maintain 60 FPS.

## Integration Points
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionService.ts` and `evolutionTracker.ts` manage new triggers and states.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` generates new mutation traits.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for mutation application.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes new mutation effects.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` incorporates new mutation effects.
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads computations.

## Rules Adherence
- **Determinism**: New mutations and triggers use static data and seeded RNG, ensuring consistency.
- **Modularity**: Extensions are encapsulated in existing services and data files.
- **Performance**: Targets < 5ms updates, leveraging caching and off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate evolution and mutation code (e.g., in `src/creatures/` or `src/lib/`), aligning with our prior mutation system discussions [Timestamp: April 12, 2025, 12:18].
2. **Add New Mutation**: Update `src/domains/traits/data/mutationPatterns/movement.ts` with “Adaptive Camouflage.”
3. **Extend Services**: Enhance `evolutionService.ts`, `traitService.ts`, and `payoffMatrixService.ts` for new mutation support.
4. **Update Rendering and State**: Add visual effects in `instancedRenderer.ts` and state tracking in `evolutionTracker.ts`.
5. **Test Extensions**: Validate “Adaptive Camouflage” functionality and performance using Jest, ensuring no regressions.

## Example Extension: Adaptive Camouflage Mutation
```typescript
// src/domains/evolution/services/evolutionService.ts
class EvolutionService {
  async evaluateTriggers(creature: ICreature, blockData: IBlockData): Promise<void> {
    const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
    const roleGroups = this.groupByRole(creature.particles);
    for (const [role, particles] of Object.entries(roleGroups)) {
      if (this.shouldTriggerEvolution(role as Role, particles, blockData, rng)) {
        const mutation = traitService.assignTrait({ role: role as Role, id: `mutation-${blockData.nonce}` }, blockData, 'mutation');
        await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
      }
    }
  }
}
```

