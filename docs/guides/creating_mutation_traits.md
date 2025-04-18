
# Creating and Extending Mutation Traits

## Purpose
This guide details how to create and extend mutation traits in Bitcoin Protozoa, expanding the 200+ trait bank discussed previously [Timestamp: April 12, 2025, 12:18] to enhance the evolution system. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/creating_mutation_traits.md`

## Overview
Mutation traits drive creature adaptation in Bitcoin Protozoa by altering stats, behaviors, or visuals (e.g., “Fury Strike” boosts damage for ATTACK particles). Managed by `traitService.ts` in the `traits` domain and applied via `evolutionService.ts`, traits are stored in `src/domains/traits/data/mutationPatterns/` and selected deterministically using block nonce-seeded RNG. This guide provides steps to add new mutation traits, update selection logic, integrate with rendering and game theory, and ensure balance, enabling developers to enrich the evolution system while maintaining performance (< 5ms updates for 500 particles) and determinism.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Familiarity**: Knowledge of TypeScript, the DDD structure (`src/domains/`), and the mutation system (`new_docs/systems/evolution/mutation_system.md`).
- **Tools**: Jest for testing, ESLint/Prettier for code quality, and Chrome DevTools for performance profiling.

## Steps to Create a New Mutation Trait
This example adds a new mutation trait, “Quantum Shift,” for MOVEMENT particles, which increases speed by 20% and adds a shimmering visual effect.

### 1. Define the Mutation Trait
- **Location**: Add to `src/domains/traits/data/mutationPatterns/movement.ts` or create a new file if needed.
- **Content**: Define the `IMutation` with ID, name, rarity, effect, stats, and visual properties.
- **Considerations**:
  - Assign a rarity (COMMON to MYTHIC) to balance frequency (e.g., EPIC for moderate rarity).
  - Specify stats (e.g., `speed: 0.2`) and visual effects (e.g., shimmering glow).
  - Ensure effects align with role (MOVEMENT enhances mobility).

**Example**:
```json
// src/domains/traits/data/mutationPatterns/movement.ts
{
  "id": "quantum_shift",
  "name": "Quantum Shift",
  "rarity": "EPIC",
  "effect": "Increases speed by 20%",
  "stats": { "speed": 0.2 },
  "visual": { "color": "#aaffff", "glowIntensity": 0.7, "size": 1.1, "shimmer": true }
}
```

### 2. Update Trait Selection Logic
- **Location**: Modify `src/domains/traits/services/traitService.ts` to include the new mutation in the MOVEMENT pool.
- **Content**: Ensure the trait is selectable based on role, rarity, and RNG.
- **Considerations**:
  - Maintain deterministic selection using block nonce-seeded RNG.
  - Adjust rarity probabilities if needed (e.g., EPIC: 2% base chance).

**Example**:
```typescript
// src/domains/traits/services/traitService.ts
import { movementMutationPatterns } from 'src/domains/traits/data/mutationPatterns/movement';

class TraitService {
  private mutationCache: Map<string, IMutation[]> = new Map();

  private getMutationPool(role: Role): IMutation[] {
    const cacheKey = role;
    if (!this.mutationCache.has(cacheKey)) {
      switch (role) {
        case Role.MOVEMENT:
          this.mutationCache.set(cacheKey, movementMutationPatterns); // Includes Quantum Shift
          break;
        // Other roles
        default:
          this.mutationCache.set(cacheKey, []);
      }
    }
    return this.mutationCache.get(cacheKey)!;
  }

  assignTrait(particle: { id: string, role: Role }, blockData: IBlockData, type: 'mutation'): IMutation {
    const rng = createRNGFromBlock(blockData.nonce).getStream('mutations');
    const pool = this.getMutationPool(particle.role);
    const rarity = this.determineRarity(rng, blockData.confirmations);
    const filtered = pool.filter(t => t.rarity === rarity);
    return filtered[Math.floor(rng() * filtered.length)] || pool[0];
  }
}
```

### 3. Integrate with Evolution System
- **Location**: Update `src/domains/evolution/services/evolutionService.ts` to trigger “Quantum Shift” under appropriate conditions.
- **Content**: Add role-specific trigger logic (e.g., high movement distance).
- **Considerations**: Ensure triggers align with MOVEMENT’s mobility focus and maintain determinism.

**Example**:
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

### 4. Update Rendering for Visual Effects
- **Location**: Enhance `src/domains/rendering/services/instancedRenderer.ts` and `shaderManager.ts` to visualize “Quantum Shift” (e.g., shimmering effect).
- **Content**: Apply shader uniforms for color, glow, and shimmer animation.
- **Considerations**: Optimize shaders to maintain 60 FPS for 500 particles [Timestamp: April 14, 2025, 19:58].

**Example**:
```typescript
// src/domains/rendering/services/instancedRenderer.ts
class InstancedRenderer {
  updateParticles(particles: IParticle[]) {
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      const trait = p.mutationTrait || p.visualTrait;
      dummy.scale.setScalar(visualService.getScale(trait));
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.mesh.setColorAt(i, visualService.getColor(trait));
      if (trait?.effect === 'quantum_shift') {
        this.mesh.material.uniforms.shimmer.value = trait.visual.shimmer ? 1.0 : 0.0;
      }
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }
}
```

### 5. Integrate with Game Theory
- **Location**: Update `src/domains/gameTheory/services/payoffMatrixService.ts` to reflect “Quantum Shift” effects (e.g., increased speed boosting damage).
- **Content**: Adjust payoffs to account for speed-based advantages.
- **Considerations**: Balance effects to prevent dominance, as discussed for mutation balance [Timestamp: April 12, 2025, 12:18].

**Example**:
```typescript
// src/domains/gameTheory/services/payoffMatrixService.ts
class PayoffMatrixService {
  private getMutationModifier(creature: ICreature, state: IEvolutionState): { damage: number, defense: number } {
    let damage = 0;
    creature.particles.forEach(p => {
      if (p.mutationTrait?.effect === 'quantum_shift') {
        damage += 0.15 * (state.tier / 5); // Speed boosts damage
      }
    });
    return { damage, defense: 0 };
  }
}
```

### 6. Test the New Mutation Trait
- **Location**: Add tests in `tests/unit/` and `tests/integration/` (e.g., `tests/unit/traitService.test.ts`, `tests/integration/evolutionSystem.test.ts`).
- **Content**: Test deterministic selection, stat application, visual rendering, and game theory impact.
- **Considerations**: Ensure tests cover performance (< 5ms for 500 particles) and balance.

**Example**:
```typescript
// tests/unit/traitService.test.ts
describe('TraitService', () => {
  test('generates Quantum Shift for MOVEMENT', () => {
    const blockData = createMockBlockData(12345, { confirmations: 10 });
    const particle = createMockParticle({ role: Role.MOVEMENT });
    particle.movementDistance = 15; // Trigger condition
    const mutation = traitService.assignTrait(particle, blockData, 'mutation');
    expect(mutation.id).toBe('quantum_shift');
    expect(mutation.stats.speed).toBe(0.2);
  });
});

// tests/integration/evolutionSystem.test.ts
describe('Evolution System', () => {
  test('Quantum Shift mutation renders shimmer effect', async () => {
    const blockData = createMockBlockData(12345);
    const creature = createMockCreature(blockData);
    const mutation = { id: 'quantum_shift', effect: 'speed_boost', stats: { speed: 0.2 }, visual: { color: '#aaffff', shimmer: true } };
    creature.particles[0].mutationTrait = mutation;
    instancedRenderer.updateParticles(creature.particles);
    expect(instancedRenderer.getMesh().material.uniforms.shimmer.value).toBe(1.0);
  });
});
```

### 7. Update Documentation
- **Location**: Update `new_docs/systems/evolution/mutation_trait_generation.md` and `new_docs/systems/evolution/evolution_diagrams.md`.
- **Content**: Document “Quantum Shift” in the mutation trait list and update trait hierarchy diagrams.
- **Example**:
  - Add to `mutation_trait_generation.md`: “Quantum Shift (EPIC, MOVEMENT): Increases speed by 20% with a shimmering visual effect.”
  - Update Mermaid diagram in `evolution_diagrams.md` to include “Quantum Shift” under MOVEMENT traits.

## Best Practices for Balancing New Traits
- **Moderate Effects**: Ensure “Quantum Shift” (+20% speed) is balanced against other mutations (e.g., “Fury Strike” +25% damage) to avoid dominance [Timestamp: April 12, 2025, 12:18].
- **Test with Simulations**: Use `scripts/simulateEvolutionBattles.ts` to analyze win rates, targeting ~50% for balanced mutations.
- **Limit Rarity**: Assign EPIC rarity to control frequency (2% base chance), reserving MYTHIC for rare, high-impact traits.
- **Synergy Considerations**: Ensure “Quantum Shift” synergizes with MOVEMENT behaviors (e.g., “Flocking”) without creating overpowered combos.
- **Performance**: Verify trait application stays within < 5ms for 500 particles, using batch processing and caching [Timestamp: April 14, 2025, 19:58].

## Troubleshooting
- **Non-Deterministic Selection**: Verify block nonce seeding in `rngSystem.ts` and ensure consistent `IBlockData` inputs.
- **Rendering Glitches**: Check shader uniforms in `shaderManager.ts` for “Quantum Shift” visual effects; profile with Chrome DevTools.
- **Unbalanced Effects**: Adjust stat values (e.g., reduce speed to 15%) if simulations show excessive win rates.
- **Performance Issues**: Optimize trait selection by caching pools in `traitService.ts` and offloading calculations to `computeWorker.ts`.


