
# Particle Creation and Initialization

## Purpose
This document explains the process of creating and initializing particles in Bitcoin Protozoa, including role assignment and initial state setup. It serves as a single source of truth for developers, ensuring that particle creation is deterministic, consistent, and aligned with the project’s domain-driven design (DDD) principles.

## Location
`new_docs/systems/particle/particle_creation.md`

## Overview
Particles are the fundamental units of creatures in Bitcoin Protozoa, with each creature comprising up to 500 particles distributed across five roles: CORE, CONTROL, MOVEMENT, DEFENSE, and ATTACK. The creation process, managed by the `particleService.ts` within the `creature` domain, ensures particles are initialized with appropriate roles, positions, and traits, using a deterministic random number generator (RNG) seeded by Bitcoin block nonce. This document details the workflow, rules, and integration points, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Particle Creation Workflow
The particle creation process follows these steps:

1. **Seed RNG**:
   - Use the block nonce from `bitcoinService.ts` to seed the RNG, ensuring deterministic outcomes.
2. **Determine Role Distribution**:
   - Assign roles to particles based on predefined ratios (e.g., 20% CORE, 20% CONTROL, etc.), adjusted by RNG.
3. **Initialize Particle Properties**:
   - Set initial position, scale, and other attributes (e.g., color from visual traits).
4. **Assign Traits**:
   - Apply traits (e.g., abilities, visuals) using `traitService.ts`, based on role and rarity.
5. **Add to Creature**:
   - Include particles in the creature’s `IParticle[]` array, managed by `creatureGenerator.ts`.

### Role Assignment Rules
- **Deterministic Distribution**: The RNG ensures the same block nonce produces the same role distribution.
- **Balanced Ratios**: Each role has an approximate target percentage (e.g., 20% per role for 500 particles, ~100 particles each).
- **Role Constraints**: Particles are strictly assigned one of the five roles defined in `src/shared/types/core.ts`.

### Example Particle Creation
```typescript
// src/domains/creature/services/particleService.ts
import { Singleton } from 'typescript-singleton';
import { Role, Rarity } from 'src/shared/types/core';
import { IParticle } from 'src/domains/creature/types/particle';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';
import { traitService } from 'src/domains/traits/services/traitService';

class ParticleService extends Singleton {
  createParticles(count: number, blockData: IBlockData): IParticle[] {
    const rng = createRNGFromBlock(blockData.nonce).getStream('particles');
    const roleRatios = { [Role.CORE]: 0.2, [Role.CONTROL]: 0.2, [Role.MOVEMENT]: 0.2, [Role.DEFENSE]: 0.2, [Role.ATTACK]: 0.2 };
    const particles: IParticle[] = [];

    for (let i = 0; i < count; i++) {
      const role = this.assignRole(rng, roleRatios);
      const particle: IParticle = {
        id: `particle-${i}`,
        role,
        position: [0, 0, 0], // Initial position, updated by formations
        scale: 1,
        visualTrait: traitService.assignTrait({ role, id: `particle-${i}` }, blockData)
      };
      particles.push(particle);
    }
    return particles;
  }

  private assignRole(rng: () => number, ratios: { [key in Role]: number }): Role {
    const rand = rng();
    let cumulative = 0;
    for (const [role, ratio] of Object.entries(ratios)) {
      cumulative += ratio;
      if (rand < cumulative) return role as Role;
    }
    return Role.CORE; // Fallback
  }
}

export const particleService = ParticleService.getInstance();
```

## Integration Points
- **Creature Domain (`src/domains/creature/`)**: The `creatureGenerator.ts` uses `particleService.ts` to create particles for a creature.
- **Traits Domain (`src/domains/traits/`)**: The `traitService.ts` assigns visual and other traits during particle initialization.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: Provides `IBlockData` (nonce) for seeding the RNG.
- **Rendering Domain (`src/domains/rendering/`)**: Uses particle properties (e.g., position, visual traits) for visualization via `instancedRenderer.ts`.

## Rules Adherence
- **Determinism**: Particle creation is deterministic, using RNG seeded by block nonce to ensure consistent role and trait assignments.
- **Modularity**: Creation logic is encapsulated in `particleService.ts`, with clear interfaces for integration.
- **Performance**: Optimized for creating 500 particles in < 10ms, using batch processing and efficient RNG calls.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Creation Logic**: Locate particle creation code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Particle Service**: Move logic to `src/domains/creature/services/particleService.ts`, ensuring it uses seeded RNG and role-based rules.
3. **Update Creature Generation**: Integrate `particleService.ts` with `creatureGenerator.ts` for particle initialization.
4. **Test Determinism**: Verify that particles created with the same block nonce have identical roles and traits using Jest tests.
5. **Validate Performance**: Measure creation time for 500 particles, targeting < 10ms, using performance profiling tools.

## Example Integration
### Creature Generation with Particle Creation
```typescript
// src/domains/creature/services/creatureGenerator.ts
import { particleService } from 'src/domains/creature/services/particleService';
import { ICreature } from 'src/domains/creature/types/creature';

class CreatureGenerator {
  generateCreature(blockData: IBlockData): ICreature {
    const particles = particleService.createParticles(500, blockData);
    return { id: `creature-${blockData.nonce}`, particles };
  }
}

export const creatureGenerator = new CreatureGenerator();
```

## Testing Particle Creation
To ensure correctness:
- **Unit Test**: Verify that `createParticles` assigns roles according to target ratios.
- **Integration Test**: Confirm that particles integrate with traits and render correctly.
- **Example**:
  ```typescript
  // tests/unit/particleService.test.ts
  describe('ParticleService', () => {
    test('creates 500 particles with balanced role distribution', () => {
      const blockData = createMockBlockData(12345);
      const particles = particleService.createParticles(500, blockData);
      const roleCounts = particles.reduce((acc, p) => {
        acc[p.role] = (acc[p.role] || 0) + 1;
        return acc;
      }, {});
      expect(roleCounts[Role.CORE]).toBeCloseTo(100, -1); // ~20% of 500
    });
  });
  ```


