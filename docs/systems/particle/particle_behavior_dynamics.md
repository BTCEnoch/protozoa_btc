
# Particle Behavior Dynamics

## Purpose
This document details how particle behaviors are defined and applied in Bitcoin Protozoa, focusing on role-specific dynamics and interactions. It serves as a single source of truth for developers, ensuring that particle behaviors are consistent, deterministic, and optimized for real-time gameplay, while aligning with the project’s domain-driven design (DDD) principles.

## Location
`new_docs/systems/particle/particle_behavior.md`

## Overview
In Bitcoin Protozoa, particles within a creature exhibit behaviors that define their actions and reactions, such as movement patterns, combat tactics, or group coordination. Behaviors are role-specific (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and driven by behavior traits assigned via the `traitService.ts`. The behavior system, managed by the `behaviorService.ts` within the `traits` domain, ensures particles act in a coordinated, deterministic manner, influenced by Bitcoin block data through seeded RNG. This document outlines the behavior definition process, application workflow, and integration points, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Behavior Definition
Particle behaviors are defined as traits within the `traits` domain, stored in `src/domains/traits/data/behaviorPatterns/`. Each behavior specifies actions or reactions triggered by specific conditions, tailored to the particle’s role.

### Behavior Structure
- **ID**: Unique identifier (e.g., `behavior_001`).
- **Name**: Descriptive name (e.g., “Flocking”).
- **Rarity**: Rarity level (e.g., COMMON, RARE).
- **Action**: Description of the behavior (e.g., “Move toward nearby particles”).
- **Triggers**: Events or conditions that activate the behavior (e.g., `enemy_in_range`).

### Example Behavior Definition
```json
// src/domains/traits/data/behaviorPatterns/movement.ts
{
  "id": "behavior_001",
  "name": "Flocking",
  "rarity": "COMMON",
  "action": "Move toward nearby particles to maintain group cohesion",
  "triggers": ["proximity_check"]
}
```

## Behavior Application Workflow
The behavior application process involves the following steps:

1. **Assign Behavior Trait**:
   - During particle creation, `traitService.ts` assigns a behavior trait based on the particle’s role and seeded RNG.
2. **Retrieve Behavior Data**:
   - The `behaviorService.ts` fetches the behavior trait’s action and trigger conditions.
3. **Evaluate Triggers**:
   - Check for trigger conditions (e.g., proximity to other particles) in the game loop or physics update.
4. **Apply Action**:
   - Execute the behavior’s action, updating particle properties (e.g., position, velocity).
5. **Update Particle State**:
   - Reflect changes in `IParticle` data, influencing rendering and interactions.

### Role-Specific Behaviors
- **CORE**: Coordinate group stability (e.g., maintain central position).
- **CONTROL**: Manage group direction (e.g., steer toward targets).
- **MOVEMENT**: Enhance mobility (e.g., flocking, pursuit).
- **DEFENSE**: Protect allies (e.g., shield formation).
- **ATTACK**: Engage enemies (e.g., aggressive pursuit).

### Example Behavior Application
```typescript
// src/domains/traits/services/behaviorService.ts
import { Singleton } from 'typescript-singleton';
import { IBehavior } from 'src/domains/traits/types/behavior';
import { IParticle } from 'src/domains/creature/types/particle';

class BehaviorService extends Singleton {
  applyBehavior(particle: IParticle, behavior: IBehavior, particles: IParticle[]): void {
    if (this.checkTriggers(behavior.triggers, particle, particles)) {
      switch (behavior.action) {
        case 'Flocking':
          this.applyFlocking(particle, particles);
          break;
        // Other behavior cases
      }
    }
  }

  private checkTriggers(triggers: string[], particle: IParticle, particles: IParticle[]): boolean {
    return triggers.some(trigger => {
      if (trigger === 'proximity_check') {
        return particles.some(p => p !== particle && distance(p.position, particle.position) < 5);
      }
      return false;
    });
  }

  private applyFlocking(particle: IParticle, particles: IParticle[]): void {
    const nearby = particles.filter(p => p !== particle && distance(p.position, particle.position) < 5);
    if (nearby.length > 0) {
      const avgPosition = nearby.reduce((acc, p) => acc.add(p.position), new THREE.Vector3()).divideScalar(nearby.length);
      particle.position.lerp(avgPosition, 0.1); // Move toward average position
    }
  }
}

export const behaviorService = BehaviorService.getInstance();
```

## Performance Considerations
To ensure real-time updates for 500 particles:
1. **Batch Processing**: Apply behaviors to multiple particles in a single loop to reduce overhead.
2. **Spatial Partitioning**: Use a grid or octree (via `spatialUtils.ts`) to limit proximity checks to nearby particles.
3. **Off-Thread Computations**: Delegate complex behavior calculations to `flockingWorker.ts` or `patternWorker.ts`.
4. **Limit Updates**: Update behaviors only when triggers are met, using dirty flags.

## Integration Points
- **Traits Domain (`src/domains/traits/`)**: Provides `IBehavior` traits via `behaviorService.ts` for action and trigger data.
- **Creature Domain (`src/domains/creature/`)**: Supplies `IParticle` data for behavior application and state updates.
- **Rendering Domain (`src/domains/rendering/`)**: Reflects behavior-driven position changes in visuals via `instancedRenderer.ts`.
- **Workers Domain (`src/domains/workers/`)**: Uses `behavior/flockingWorker.ts` for off-thread behavior computations.

## Rules Adherence
- **Determinism**: Behaviors are deterministic, using seeded RNG for trait assignment and static trigger conditions.
- **Modularity**: Behavior logic is encapsulated in `behaviorService.ts`, with clear interfaces for integration.
- **Performance**: Optimized for < 10ms updates for 500 particles, leveraging batch processing and off-thread computations.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Behavior Logic**: Locate behavior-related code (e.g., in `src/creatures/` or `src/lib/`).
2. **Refactor into Behavior Service**: Move logic to `src/domains/traits/services/behaviorService.ts`, ensuring role-specific behaviors are supported.
3. **Update Particle Updates**: Integrate `behaviorService.ts` with `particleService.ts` or game loop for behavior application.
4. **Leverage Workers**: Offload complex behaviors to `flockingWorker.ts` or `patternWorker.ts` for performance.
5. **Test Behaviors**: Validate role-specific behaviors (e.g., flocking for MOVEMENT) and performance using Jest and profiling tools.

## Example Integration
### Applying Behaviors in Game Loop
```typescript
// src/domains/creature/services/creatureGenerator.ts
import { behaviorService } from 'src/domains/traits/services/behaviorService';

class CreatureGenerator {
  updateCreature(creature: ICreature, particles: IParticle[]): void {
    creature.particles.forEach(particle => {
      const behavior = particle.behaviorTrait;
      if (behavior) {
        behaviorService.applyBehavior(particle, behavior, particles);
      }
    });
  }
}

export const creatureGenerator = new CreatureGenerator();
```

## Testing Particle Behaviors
To ensure correctness:
- **Unit Test**: Verify that `applyBehavior` correctly modifies particle state (e.g., position for flocking).
- **Integration Test**: Confirm behaviors integrate with rendering and game mechanics.
- **Example**:
  ```typescript
  // tests/unit/behaviorService.test.ts
  describe('BehaviorService', () => {
    test('applies flocking behavior correctly', () => {
      const particle = createMockParticle({ position: [0, 0, 0], behaviorTrait: { action: 'Flocking' } });
      const nearby = [createMockParticle({ position: [2, 0, 0] })];
      behaviorService.applyBehavior(particle, particle.behaviorTrait, nearby);
      expect(particle.position[0]).toBeGreaterThan(0); // Moved toward nearby particle
    });
  });
  ```


