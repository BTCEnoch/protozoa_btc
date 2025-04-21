Yes, I’ll queue up the recommended formation system documents for the `new_docs/systems/formation/` directory and create them one at a time, using the current project state from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) as a reference. Each document will be tailored to Bitcoin Protozoa’s specific design, incorporating its deterministic RNG, particle-based creatures with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and integration with traits, rendering, and game theory. The documents will align with the new domain-driven design (DDD) structure from `directory_map.md`, ensuring modularity, performance, and consistency with the project’s goals. At the end of each document, I’ll ask, “Are you ready for the next document ([document_name].md)?” to confirm progression through the queue.

The list of documents to produce, in sequence, is:
1. `formation_assignment_logic.md`
2. `formation_dynamics.md`
3. `formation_physics_integration.md`
4. `formation_visualization.md`
5. `formation_testing.md`
6. `formation_performance.md`
7. `formation_game_theory_integration.md`
8. `formation_balance.md`
9. `extending_formations.md`
10. `formation_diagrams.md`

Let’s start with the first document.

---


# Formation Assignment Logic

## Purpose
This document explains how formation patterns are assigned to particle groups in Bitcoin Protozoa, ensuring deterministic placement based on particle roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and creature state. It serves as a single source of truth for developers, detailing the assignment process tailored to the project’s particle-based design and deterministic RNG driven by Bitcoin block data, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/formation/formation_assignment_logic.md`

## Overview
The formation system in Bitcoin Protozoa organizes up to 500 particles per creature into role-specific spatial patterns (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE), influencing behavior, visuals, and strategic outcomes. The assignment of these patterns, managed by the `formationService.ts` in the `traits` domain, ensures deterministic arrangements using a seeded random number generator (RNG) based on the Bitcoin block nonce. This process integrates with creature generation and trait application, ensuring each particle group aligns with its role and tactical purpose. This document outlines the assignment workflow, rules for pattern selection, and integration points, ensuring consistency and modularity.

## Assignment Workflow
The formation assignment process follows these steps:

1. **Retrieve Creature Data**:
   - Access `ICreature` and `IParticle[]` data from the `creature` domain, including role assignments.
2. **Seed RNG**:
   - Use the block nonce from `bitcoinService.ts` to seed the RNG, ensuring deterministic pattern selection.
3. **Group Particles by Role**:
   - Organize particles into role-based groups (e.g., 100 CORE particles, 100 ATTACK particles).
4. **Select Formation Pattern**:
   - Choose a pattern from `src/domains/traits/data/formationPatterns/` for each role group, guided by RNG and role-specific preferences.
5. **Assign Particle Positions**:
   - Map each particle to a position defined in the selected pattern (e.g., “Shield Wall” positions DEFENSE particles in a protective ring).
6. **Apply to Creature**:
   - Update `IParticle` positions in the creature’s data, ready for rendering and physics calculations.

### Rules for Role-Based Pattern Selection
- **Deterministic Selection**: The RNG, seeded by block nonce, ensures the same pattern is chosen for identical inputs.
- **Role Preferences**:
  - **CORE**: Favors compact patterns like “Cluster” to maintain group cohesion.
  - **CONTROL**: Prefers patterns like “Grid” for strategic alignment.
  - **MOVEMENT**: Selects dynamic patterns like “Swarm” for mobility.
  - **DEFENSE**: Chooses protective patterns like “Shield Wall” to shield allies.
  - **ATTACK**: Opts for aggressive patterns like “Vanguard” to position particles forward.
- **Pattern Rarity**: Patterns have rarity levels (e.g., COMMON, RARE), with probabilities adjusted by RNG (e.g., 70% COMMON, 5% RARE).
- **Trait Influence**: Behavior traits (e.g., “Aggressive”) may bias pattern selection (e.g., favor “Vanguard” for ATTACK).

### Example Formation Assignment
```typescript
// src/domains/traits/services/formationService.ts
import { Singleton } from 'typescript-singleton';
import { Role } from 'src/shared/types/core';
import { IParticle, IGroup } from 'src/domains/creature/types/particle';
import { IFormationPattern } from 'src/domains/traits/types/formation';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';
import { coreFormationPatterns } from 'src/domains/traits/data/formationPatterns/core';

class FormationService extends Singleton {
  assignFormation(group: IGroup, blockData: IBlockData): void {
    const rng = createRNGFromBlock(blockData.nonce).getStream('formations');
    const pattern = this.selectPattern(group.role, rng);
    this.applyPattern(group.particles, pattern);
  }

  private selectPattern(role: Role, rng: () => number): IFormationPattern {
    const patterns = this.getPatternPool(role);
    const rarity = this.determineRarity(rng);
    const filtered = patterns.filter(p => p.rarity === rarity);
    return filtered[Math.floor(rng() * filtered.length)] || patterns[0];
  }

  private getPatternPool(role: Role): IFormationPattern[] {
    switch (role) {
      case Role.CORE:
        return coreFormationPatterns;
      // Other roles
      default:
        return [];
    }
  }

  private determineRarity(rng: () => number): Rarity {
    const rand = rng();
    if (rand < 0.4) return Rarity.COMMON;       // 40% chance
    if (rand < 0.7) return Rarity.UNCOMMON;     // 30% chance
    if (rand < 0.9) return Rarity.RARE;         // 20% chance
    if (rand < 0.98) return Rarity.EPIC;        // 8% chance
    if (rand < 0.995) return Rarity.LEGENDARY;  // 1.5% chance
    return Rarity.MYTHIC;                       // 0.5% chance
  }

  private applyPattern(particles: IParticle[], pattern: IFormationPattern): void {
    particles.forEach((p, i) => {
      const pos = pattern.positions[i % pattern.positions.length];
      p.position = [pos.x, pos.y, pos.z];
    });
  }
}

export const formationService = FormationService.getInstance();
```

## Performance Considerations
To ensure efficient assignment for 500 particles:
1. **Batch Processing**: Assign patterns to role groups in a single pass to minimize RNG calls.
2. **Cache Pattern Pools**: Store role-specific patterns in `formationService.ts` to avoid repeated data access.
3. **Optimize Position Assignment**: Apply positions in bulk using array operations.
4. **Deterministic RNG**: Use a single RNG stream (`formations`) to maintain efficiency and consistency.

## Integration Points
- **Traits Domain (`src/domains/traits/`)**: `formationService.ts` uses `IFormationPattern` from `src/domains/traits/data/formationPatterns/` and integrates with `traitService.ts` for behavior-driven pattern selection.
- **Creature Domain (`src/domains/creature/`)**: `creatureGenerator.ts` calls `formationService.ts` to assign initial formations during particle creation.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: Provides `IBlockData` (nonce) for seeding the RNG.
- **Rendering Domain (`src/domains/rendering/`)**: Uses updated `IParticle` positions for visualization via `instancedRenderer.ts`.

## Rules Adherence
- **Determinism**: Pattern assignment is deterministic, using RNG seeded by block nonce.
- **Modularity**: Assignment logic is encapsulated in `formationService.ts`, with clear interfaces.
- **Performance**: Targets < 5ms for assigning formations to 500 particles, leveraging batch processing and caching.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate formation assignment code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Formation Service**: Move logic to `src/domains/traits/services/formationService.ts`, ensuring RNG-based determinism.
3. **Update Creature Generation**: Integrate `formationService.ts` with `creatureGenerator.ts` for initial assignments.
4. **Test Determinism**: Verify that formations are identical for the same block nonce using Jest tests.
5. **Validate Performance**: Measure assignment time for 500 particles, targeting < 5ms, using performance profiling tools.

## Example Integration
### Assigning Formations in Creature Generation
```typescript
// src/domains/creature/services/creatureGenerator.ts
import { formationService } from 'src/domains/traits/services/formationService';
import { Role } from 'src/shared/types/core';

class CreatureGenerator {
  generateCreature(blockData: IBlockData): ICreature {
    const particles = particleService.createParticles(500, blockData);
    const roleGroups = this.groupByRole(particles);
    Object.entries(roleGroups).forEach(([role, group]) => {
      formationService.assignFormation({ role: role as Role, particles: group }, blockData);
    });
    return { id: `creature-${blockData.nonce}`, particles };
  }

  private groupByRole(particles: IParticle[]): { [key in Role]: IParticle[] } {
    return particles.reduce((acc, p) => {
      acc[p.role].push(p);
      return acc;
    }, { [Role.CORE]: [], [Role.CONTROL]: [], [Role.MOVEMENT]: [], [Role.DEFENSE]: [], [Role.ATTACK]: [] });
  }
}

export const creatureGenerator = new CreatureGenerator();
```

## Testing Formation Assignment
To ensure correctness:
- **Unit Test**: Verify that `assignFormation` selects the correct pattern based on role and RNG.
- **Integration Test**: Confirm formations integrate with rendering and physics.
- **Example**:
  ```typescript
  // tests/unit/formationService.test.ts
  describe('FormationService', () => {
    test('assigns Cluster pattern to CORE particles deterministically', () => {
      const blockData = createMockBlockData(12345);
      const group = { role: Role.CORE, particles: [createMockParticle({ role: Role.CORE })] };
      formationService.assignFormation(group, blockData);
      const position1 = group.particles[0].position;
      formationService.assignFormation(group, blockData);
      const position2 = group.particles[0].position;
      expect(position1).toEqual(position2); // Deterministic
      expect(position1).toEqual([0, 0, 0]); // Cluster center
    });
  });
  ```


