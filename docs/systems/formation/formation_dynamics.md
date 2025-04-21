
# Formation Dynamics and Updates

## Purpose
This document details how formation patterns in Bitcoin Protozoa dynamically adjust during gameplay, responding to behaviors, physics, or battle conditions to enhance tactical gameplay. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and deterministic processes driven by Bitcoin block data, ensuring clarity and consistency during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/formation/formation_dynamics.md`

## Overview
The formation system in Bitcoin Protozoa organizes up to 500 particles per creature into role-specific patterns (e.g., “Shield Wall” for DEFENSE, “Swarm” for MOVEMENT), which can dynamically shift based on gameplay events, such as enemy proximity, particle health, or behavior traits (e.g., “Flocking”). Managed by the `formationService.ts` in the `traits` domain, these updates ensure formations adapt tactically while maintaining determinism through seeded RNG based on block nonce. This document outlines the dynamic update workflow, rules for formation transitions, and performance considerations, ensuring modularity and integration with other systems like physics and rendering.

## Formation Dynamics Workflow
The formation dynamics process involves updating particle positions to transition between patterns or adjust existing ones in response to gameplay conditions. The workflow includes:

1. **Monitor Gameplay Conditions**:
   - Check triggers like enemy proximity, particle health, or behavior traits (e.g., “Aggressive” triggers a shift to “Vanguard”).
2. **Retrieve Current Formation**:
   - Access the current `IFormationPattern` for each role group from `src/domains/traits/data/formationPatterns/`.
3. **Evaluate Transition Triggers**:
   - Use deterministic logic or seeded RNG to decide if a new pattern is needed (e.g., switch from “Cluster” to “Spread” if enemies are near).
4. **Select New Pattern (if applicable)**:
   - Choose a new pattern based on role and triggers, guided by RNG seeded with block nonce.
5. **Interpolate Particle Positions**:
   - Gradually move particles to new positions defined by the target pattern, using interpolation to ensure smooth transitions.
6. **Apply Updates**:
   - Update `IParticle` positions and propagate changes to rendering and physics systems.

### Rules for Formation Transitions
- **Deterministic Triggers**: Transitions are triggered by static conditions (e.g., health < 50%) or deterministic RNG outcomes.
- **Role-Specific Transitions**:
  - **CORE**: Shifts to compact patterns (e.g., “Cluster”) when health is low to protect the group.
  - **CONTROL**: Adjusts to strategic patterns (e.g., “Grid”) when directing movement.
  - **MOVEMENT**: Transitions to dynamic patterns (e.g., “Swarm”) during pursuit.
  - **DEFENSE**: Switches to protective patterns (e.g., “Shield Wall”) under attack.
  - **ATTACK**: Moves to aggressive patterns (e.g., “Vanguard”) when engaging enemies.
- **Trait Influence**: Behavior traits (e.g., “Flocking” for MOVEMENT) increase transition likelihood (e.g., +10% chance to switch to “Swarm”).
- **Smooth Interpolation**: Particle positions lerp to new coordinates over time (e.g., 0.1 per frame) to avoid abrupt jumps.

### Example Formation Update
```typescript
// src/domains/traits/services/formationService.ts
import { Singleton } from 'typescript-singleton';
import { Role, Rarity } from 'src/shared/types/core';
import { IParticle, IGroup } from 'src/domains/creature/types/particle';
import { IFormationPattern } from 'src/domains/traits/types/formation';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';
import * as THREE from 'three';

class FormationService extends Singleton {
  updateFormation(group: IGroup, blockData: IBlockData, conditions: IGameConditions): void {
    const rng = createRNGFromBlock(blockData.nonce).getStream('formation_updates');
    const currentPattern = group.currentPattern;
    if (this.shouldTransition(group, conditions, rng)) {
      const newPattern = this.selectPattern(group.role, rng);
      group.currentPattern = newPattern;
    }
    this.interpolatePositions(group.particles, group.currentPattern);
  }

  private shouldTransition(group: IGroup, conditions: IGameConditions, rng: () => number): boolean {
    if (group.role === Role.DEFENSE && conditions.enemyProximity < 10) {
      return rng() < 0.8; // 80% chance to switch to Shield Wall
    }
    if (group.particles.some(p => p.behaviorTrait?.action === 'Flocking') && group.role === Role.MOVEMENT) {
      return rng() < 0.6; // 60% chance to switch to Swarm
    }
    return false;
  }

  private selectPattern(role: Role, rng: () => number): IFormationPattern {
    const patterns = this.getPatternPool(role);
    const rarity = this.determineRarity(rng);
    const filtered = patterns.filter(p => p.rarity === rarity);
    return filtered[Math.floor(rng() * filtered.length)] || patterns[0];
  }

  private interpolatePositions(particles: IParticle[], pattern: IFormationPattern): void {
    particles.forEach((p, i) => {
      const targetPos = pattern.positions[i % pattern.positions.length];
      const currentPos = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
      const newPos = currentPos.lerp(new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z), 0.1);
      p.position = [newPos.x, newPos.y, newPos.z];
    });
  }

  private getPatternPool(role: Role): IFormationPattern[] {
    // Role-specific pattern retrieval (e.g., from formationPatterns/defense.ts)
    return [];
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
}

export const formationService = FormationService.getInstance();
```

## Performance Considerations
To ensure efficient updates for 500 particles:
1. **Batch Interpolation**: Update all particle positions in a single pass to minimize overhead.
2. **Throttle Transitions**: Limit formation changes to key events (e.g., every 10 frames or when health drops below 50%).
3. **Cache Patterns**: Store frequently used patterns in `formationService.ts` to avoid repeated data access.
4. **Off-Thread Processing**: Delegate complex transition logic to `patternWorker.ts` for performance.

## Integration Points
- **Traits Domain (`src/domains/traits/`)**: `formationService.ts` uses `IBehavior` traits to influence transitions and integrates with `traitService.ts` for trait-driven logic.
- **Creature Domain (`src/domains/creature/`)**: `creatureGenerator.ts` and game loop call `formationService.ts` for dynamic updates.
- **Physics Domain (`src/domains/workers/`)**: `forceWorker.ts` adjusts forces to maintain formation integrity during updates.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` reflects updated `IParticle` positions.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: Provides `IBlockData` for RNG seeding.

## Rules Adherence
- **Determinism**: Transitions use seeded RNG and static conditions, ensuring consistent updates.
- **Modularity**: Update logic is encapsulated in `formationService.ts`, with clear interfaces.
- **Performance**: Targets < 5ms for updating formations for 500 particles, leveraging batch processing and caching.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate formation update code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Formation Service**: Move logic to `src/domains/traits/services/formationService.ts`, ensuring deterministic triggers.
3. **Integrate with Game Loop**: Update `creatureGenerator.ts` or game loop to call `updateFormation` based on conditions.
4. **Test Dynamics**: Validate transitions (e.g., DEFENSE to “Shield Wall”) and performance using Jest and profiling tools.
5. **Optimize Updates**: Implement batch processing and off-thread calculations to meet performance targets.

## Example Integration
### Updating Formations in Game Loop
```typescript
// src/domains/creature/services/creatureGenerator.ts
import { formationService } from 'src/domains/traits/services/formationService';

class CreatureGenerator {
  updateCreature(creature: ICreature, blockData: IBlockData, conditions: IGameConditions): void {
    const roleGroups = this.groupByRole(creature.particles);
    Object.entries(roleGroups).forEach(([role, group]) => {
      formationService.updateFormation({ role: role as Role, particles: group, currentPattern: group.pattern }, blockData, conditions);
    });
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

## Testing Formation Dynamics
To ensure correctness:
- **Unit Test**: Verify that `updateFormation` triggers correct transitions based on conditions (e.g., DEFENSE to “Shield Wall”).
- **Integration Test**: Confirm updates integrate with rendering and physics.
- **Example**:
  ```typescript
  // tests/unit/formationService.test.ts
  describe('FormationService', () => {
    test('transitions DEFENSE to Shield Wall under attack', () => {
      const blockData = createMockBlockData(12345);
      const group = { role: Role.DEFENSE, particles: [createMockParticle({ role: Role.DEFENSE })], currentPattern: { id: 'spread' } };
      const conditions = { enemyProximity: 5 };
      formationService.updateFormation(group, blockData, conditions);
      expect(group.currentPattern.id).toBe('shield_wall');
    });
  });
  ```

