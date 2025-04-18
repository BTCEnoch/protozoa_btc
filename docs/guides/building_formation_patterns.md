
# Building and Extending Formation Patterns

## Purpose
This guide provides step-by-step instructions for creating and extending formation patterns in Bitcoin Protozoa to enhance tactical gameplay through spatial arrangements of up to 500 particles per creature. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/building_formation_patterns.md`

## Overview
Formation patterns in Bitcoin Protozoa organize particles into role-specific spatial arrangements (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE), influencing behavior, physics, visuals, and game theory outcomes. Managed by `formationService.ts` in the `traits` domain, patterns are defined in `src/domains/traits/data/formationPatterns/` and assigned deterministically using block nonce-seeded RNG. This guide covers creating new patterns, updating assignment logic, integrating with physics, rendering, and game theory, and ensuring balance, building on our discussions about advanced formations [Timestamp: April 8, 2025, 19:50]. It aims to empower developers to enhance the formation system while maintaining performance (< 5ms updates for 500 particles) and determinism.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Familiarity**: Knowledge of TypeScript, the DDD structure (`src/domains/`), and the formation system (`new_docs/systems/formation/formation_system.md`).
- **Tools**: Jest for testing, ESLint/Prettier for code quality, Three.js for rendering, and Chrome DevTools for performance profiling.

## Steps to Create a New Formation Pattern
This example adds a new formation pattern, “Spiral Charge,” for ATTACK particles, which positions particles in a spiral to enhance offensive momentum, boosting damage by 15%.

### 1. Define the Formation Pattern
- **Location**: Add to `src/domains/traits/data/formationPatterns/attack.ts` or create a new file if needed.
- **Content**: Define the `IFormationPattern` with ID, name, rarity, positions, and effects.
- **Considerations**:
  - Assign a rarity (e.g., RARE) to control frequency (e.g., 7% base chance).
  - Specify positions as an array of coordinates to form a spiral (e.g., 10 positions in a helical pattern).
  - Define effects (e.g., `damage: 0.15`) to align with ATTACK’s offensive role.

**Example**:
```json
// src/domains/traits/data/formationPatterns/attack.ts
{
  "id": "spiral_charge",
  "name": "Spiral Charge",
  "rarity": "RARE",
  "positions": [
    { "x": 1, "y": 0, "z": 0 },
    { "x": 0.707, "y": 0.707, "z": 0.2 },
    { "x": 0, "y": 1, "z": 0.4 },
    { "x": -0.707, "y": 0.707, "z": 0.6 },
    { "x": -1, "y": 0, "z": 0.8 },
    { "x": -0.707, "y": -0.707, "z": 1.0 },
    { "x": 0, "y": -1, "z": 1.2 },
    { "x": 0.707, "y": -0.707, "z": 1.4 },
    { "x": 1, "y": 0, "z": 1.6 },
    { "x": 0.707, "y": 0.707, "z": 1.8 }
  ],
  "effects": { "damage": 0.15 }
}
```

### 2. Update Formation Assignment Logic
- **Location**: Modify `src/domains/traits/services/formationService.ts` to include “Spiral Charge” in the ATTACK pattern pool.
- **Content**: Ensure the pattern is selectable based on role, rarity, and RNG, maintaining determinism.
- **Considerations**: Cache pattern pools to optimize performance, as discussed for performance optimization [Timestamp: April 14, 2025, 19:58].

**Example**:
```typescript
// src/domains/traits/services/formationService.ts
import { attackFormationPatterns } from 'src/domains/traits/data/formationPatterns/attack';

class FormationService {
  private patternCache: Map<string, IFormationPattern[]> = new Map();

  private getPatternPool(role: Role): IFormationPattern[] {
    const cacheKey = role;
    if (!this.patternCache.has(cacheKey)) {
      switch (role) {
        case Role.ATTACK:
          this.patternCache.set(cacheKey, attackFormationPatterns); // Includes Spiral Charge
          break;
        // Other roles
        default:
          this.patternCache.set(cacheKey, []);
      }
    }
    return this.patternCache.get(cacheKey)!;
  }

  assignFormation(group: IGroup, blockData: IBlockData): void {
    const rng = createRNGFromBlock(blockData.nonce).getStream('formations');
    const pattern = this.selectPattern(group.role, rng);
    this.applyPattern(group.particles, pattern);
    group.currentPattern = pattern;
  }

  private selectPattern(role: Role, rng: () => number): IFormationPattern {
    const patterns = this.getPatternPool(role);
    const rarity = this.determineRarity(rng);
    const filtered = patterns.filter(p => p.rarity === rarity);
    return filtered[Math.floor(rng() * filtered.length)] || patterns[0];
  }
}
```

### 3. Integrate with Physics System
- **Location**: Update `src/domains/workers/services/physics/forceWorker.ts` to support “Spiral Charge” dynamics.
- **Content**: Apply spring-like forces to maintain spiral positions, adjusting for offensive momentum.
- **Considerations**: Optimize force calculations with spatial partitioning to handle 500 particles efficiently [Timestamp: April 14, 2025, 19:58].

**Example**:
```typescript
// src/domains/workers/services/physics/forceWorker.ts
function calculateForces(particle: IParticle, particles: IParticle[], pattern: IFormationPattern): THREE.Vector3 {
  let force = new THREE.Vector3();
  const targetPos = pattern.positions[particle.index % pattern.positions.length];
  const currentPos = new THREE.Vector3(particle.position[0], particle.position[1], particle.position[2]);
  const formationForce = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z).sub(currentPos).multiplyScalar(
    pattern.id === 'spiral_charge' ? 0.12 : 0.1 // Slightly stronger for momentum
  );
  force.add(formationForce);
  // Add repulsion forces for nearby particles
  particles.forEach(p => {
    if (p !== particle && distance(p.position, particle.position) < 2) {
      force.add(currentPos.sub(p.position).normalize().multiplyScalar(0.1));
    }
  });
  return force;
}
```

### 4. Update Rendering for Visual Effects
- **Location**: Enhance `src/domains/rendering/services/instancedRenderer.ts` to visualize “Spiral Charge” (e.g., dynamic trail effect).
- **Content**: Apply shader uniforms for color and trail animation, aligning with visual library recommendations [Timestamp: April 16, 2025, 21:41].
- **Considerations**: Optimize rendering to maintain 60 FPS using instanced rendering.

**Example**:
```typescript
// src/domains/rendering/services/instancedRenderer.ts
class InstancedRenderer {
  updateParticles(particles: IParticle[]) {
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(p.position[0], p.position[1], p.position[2]);
      const trait = p.formation || p.visualTrait;
      dummy.scale.setScalar(visualService.getScale(trait));
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);
      this.mesh.setColorAt(i, visualService.getColor(trait));
      if (trait?.id === 'spiral_charge') {
        this.mesh.material.uniforms.trailEffect.value = 1.0; // Dynamic trail
      }
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }
}
```

### 5. Integrate with Game Theory
- **Location**: Update `src/domains/gameTheory/services/payoffMatrixService.ts` to reflect “Spiral Charge” effects (e.g., +15% damage).
- **Content**: Adjust payoffs to account for offensive momentum, ensuring balance [Timestamp: April 12, 2025, 12:18].
- **Considerations**: Use simulations to verify tactical balance.

**Example**:
```typescript
// src/domains/gameTheory/services/payoffMatrixService.ts
class PayoffMatrixService {
  private getFormationModifier(creature: ICreature): { damage: number, defense: number } {
    let damage = 0;
    creature.particles.forEach(p => {
      if (p.formation?.id === 'spiral_charge' && p.role === Role.ATTACK) {
        damage += 0.15; // Damage boost
      }
    });
    return { damage, defense: 0 };
  }

  generateMatrix(creature1: ICreature, creature2: ICreature): IPayoffMatrix {
    const attack1 = this.calculateAttackPayoff(creature1) + this.getFormationModifier(creature1).damage;
    const defense1 = this.calculateDefensePayoff(creature1);
    const attack2 = this.calculateAttackPayoff(creature2) + this.getFormationModifier(creature2).damage;
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
}
```

### 6. Test the New Formation Pattern
- **Location**: Add tests in `tests/unit/` and `tests/integration/` (e.g., `tests/unit/formationService.test.ts`, `tests/integration/formationSystem.test.ts`).
- **Content**: Test deterministic assignment, position application, physics stability, rendering, and game theory impact.
- **Considerations**: Ensure tests verify performance (< 5ms for 500 particles) and balance.

**Example**:
```typescript
// tests/unit/formationService.test.ts
describe('FormationService', () => {
  test('assigns Spiral Charge for ATTACK', () => {
    const blockData = createMockBlockData(12345);
    const group = { role: Role.ATTACK, particles: [createMockParticle({ role: Role.ATTACK })] };
    formationService.assignFormation(group, blockData);
    expect(group.currentPattern.id).toBe('spiral_charge');
    expect(group.particles[0].position).toEqual([1, 0, 0]);
  });
});

// tests/integration/formationSystem.test.ts
describe('Formation System', () => {
  test('Spiral Charge boosts damage in payoff matrix', async () => {
    const blockData = createMockBlockData(12345);
    const creature1 = createMockCreature(blockData, { attackParticles: 100 });
    const creature2 = createMockCreature(blockData);
    const group = { role: Role.ATTACK, particles: creature1.particles.filter(p => p.role === Role.ATTACK) };
    formationService.assignFormation(group, blockData); // Assign Spiral Charge
    const matrix = payoffMatrixService.generateMatrix(creature1, creature2);
    expect(matrix.payoffs[0][0][0]).toBeGreaterThan(50); // Increased damage
  });
});
```

### 7. Update Documentation
- **Location**: Update `new_docs/systems/formation/formation_patterns.md` and `new_docs/systems/formation/formation_diagrams.md`.
- **Content**: Document “Spiral Charge” in the pattern list and update pattern hierarchy diagrams.
- **Example**:
  - Add to `formation_patterns.md`: “Spiral Charge (RARE, ATTACK): Positions particles in a spiral, boosting damage by 15%.”
  - Update Mermaid diagram in `formation_diagrams.md` to include “Spiral Charge” under ATTACK patterns.

## Best Practices for Balancing New Patterns
- **Moderate Effects**: Ensure “Spiral Charge” (+15% damage) balances against other patterns (e.g., “Shield Wall” -25% damage taken) to avoid dominance [Timestamp: April 12, 2025, 12:18].
- **Test with Simulations**: Use `scripts/simulateFormationBattles.ts` to analyze win rates, targeting ~50% for balanced patterns.
- **Limit Rarity**: Assign RARE rarity to control frequency (7% base chance), reserving EPIC for high-impact patterns.
- **Position Density**: Ensure spiral positions (e.g., 10 coordinates) are spaced to avoid overlap, maintaining physics stability [Timestamp: April 8, 2025, 19:50].
- **Performance**: Verify pattern application stays within < 5ms for 500 particles, using batch processing and caching.

## Troubleshooting
- **Non-Deterministic Assignment**: Verify block nonce seeding in `rngSystem.ts` and ensure consistent `IBlockData` inputs.
- **Physics Instability**: Adjust spring force constants in `forceWorker.ts` if particles oscillate in “Spiral Charge.”
- **Rendering Glitches**: Check shader uniforms in `shaderManager.ts` for trail effects; profile with Chrome DevTools.
- **Unbalanced Effects**: Reduce damage boost (e.g., to 10%) if simulations show excessive win rates.
- **Performance Issues**: Optimize position updates by batching in `formationService.ts` and offloading physics to `forceWorker.ts`.


