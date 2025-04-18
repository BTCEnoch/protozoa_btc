
# Extending the Formation System

## Purpose
This document guides developers on extending the formation system in Bitcoin Protozoa by adding new formation patterns or mechanics without disrupting existing functionality, ensuring flexibility for new tactical gameplay elements. It serves as a single source of truth, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and deterministic RNG driven by Bitcoin block data, facilitating migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/systems/formation/extending_formations.md`

## Overview
The formation system organizes up to 500 particles per creature into role-specific patterns (e.g., “Shield Wall” for DEFENSE, “Cluster” for CORE), influencing behavior, visuals, and game theory outcomes. Its modular design, managed by `formationService.ts` in the `traits` domain, supports extensions like new patterns (e.g., “Vortex” for MOVEMENT) or mechanics (e.g., adaptive pattern scaling). Extensions maintain determinism through static data and block nonce-seeded RNG, ensuring performance (< 5ms updates for 500 particles). This document provides steps to introduce new features, best practices for compatibility, and guidelines for updating related systems, ensuring scalability and tactical depth.

## Steps to Introduce a New Formation Pattern
Adding a new pattern, such as “Vortex” for MOVEMENT particles (a swirling arrangement enhancing speed), involves the following steps:

1. **Define the New Pattern’s Purpose and Mechanics**
   - **Purpose**: Specify the pattern’s tactical role (e.g., “Vortex” increases MOVEMENT particle speed and evasion).
   - **Mechanics**: Outline position layout and effects (e.g., circular arrangement, +15% speed boost).
   - **Example**: “Vortex” positions particles in a spiral, boosting attack speed by 15% in game theory payoffs.

2. **Create Pattern Data**
   - **Location**: Add a new file in `src/domains/traits/data/formationPatterns/` (e.g., `movement.ts` or a new `vortex.ts`).
   - **Content**: Define the `IFormationPattern` with ID, name, rarity, positions, and effects.
   - **Example**:
     ```json
     // src/domains/traits/data/formationPatterns/movement.ts
     {
       "id": "vortex",
       "name": "Vortex",
       "rarity": "RARE",
       "positions": [
         { "x": 1, "y": 0, "z": 0 },
         { "x": 0.707, "y": 0.707, "z": 0 },
         { "x": 0, "y": 1, "z": 0 },
         { "x": -0.707, "y": 0.707, "z": 0 }
       ],
       "effects": { "attackSpeed": 0.15 }
     }
     ```

3. **Update Formation Service**
   - **Location**: Modify `src/domains/traits/services/formationService.ts` to include the new pattern in selection logic.
   - **Content**: Add pattern to role-specific pools and update assignment logic.
   - **Example**:
     ```typescript
     // src/domains/traits/services/formationService.ts
     import { movementFormationPatterns } from 'src/domains/traits/data/formationPatterns/movement';

     class FormationService {
       private getPatternPool(role: Role): IFormationPattern[] {
         switch (role) {
           case Role.MOVEMENT:
             return movementFormationPatterns; // Includes Vortex
           // Other roles
           default:
             return [];
         }
       }
     }
     ```

4. **Extend Physics Integration**
   - **Location**: Update `src/domains/workers/services/physics/forceWorker.ts` to support “Vortex” dynamics.
   - **Content**: Add spring-like forces to maintain spiral positions and speed boosts.
   - **Example**:
     ```typescript
     // src/domains/workers/services/physics/forceWorker.ts
     function calculateForces(particle: IParticle, particles: IParticle[], pattern: IFormationPattern): THREE.Vector3 {
       let force = new THREE.Vector3();
       const targetPos = pattern.positions[particle.index % pattern.positions.length];
       const formationForce = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
         .sub(new THREE.Vector3(particle.position[0], particle.position[1], particle.position[2]))
         .multiplyScalar(pattern.id === 'vortex' ? 0.15 : 0.1); // Stronger for Vortex
       force.add(formationForce);
       return force;
     }
     ```

5. **Integrate with Game Theory**
   - **Location**: Update `src/domains/gameTheory/services/payoffMatrixService.ts` to include “Vortex” effects.
   - **Content**: Adjust payoffs for MOVEMENT particles in “Vortex” (e.g., +15% attack speed).
   - **Example**:
     ```typescript
     // src/domains/gameTheory/services/payoffMatrixService.ts
     class PayoffMatrixService {
       generateMatrix(creature1: ICreature, creature2: ICreature): IPayoffMatrix {
         const attack1 = this.calculateAttackPayoff(creature1);
         const formation1 = formationService.getCurrentFormation(creature1);
         const formationModifier1 = formation1.id === 'vortex' && formation1.role === Role.MOVEMENT ? 15 : 0;
         // Apply modifier to attack payoff
       }
     }
     ```

6. **Update Rendering**
   - **Location**: Enhance `src/domains/rendering/services/instancedRenderer.ts` to visualize “Vortex” (e.g., dynamic swirl effect).
   - **Content**: Apply visual traits or shaders for spiral motion.
   - **Example**:
     ```typescript
     // src/domains/rendering/services/instancedRenderer.ts
     class InstancedRenderer {
       updateParticles(particles: IParticle[]) {
         particles.forEach((p, i) => {
           if (p.formation?.id === 'vortex') {
             this.mesh.material.uniforms.glowIntensity.value = 0.8; // Enhanced glow for Vortex
           }
         });
       }
     }
     ```

7. **Test the New Pattern**
   - Write unit tests for pattern assignment, physics, and game theory integration.
   - Perform integration tests to ensure compatibility with rendering and battles.
   - **Example**:
     ```typescript
     // tests/unit/formationService.test.ts
     describe('FormationService', () => {
       test('assigns Vortex pattern to MOVEMENT particles', () => {
         const blockData = createMockBlockData(12345);
         const group = { role: Role.MOVEMENT, particles: [createMockParticle({ role: Role.MOVEMENT })] };
         formationService.assignFormation(group, blockData);
         expect(group.currentPattern.id).toBe('vortex');
         expect(group.particles[0].position).toEqual([1, 0, 0]);
       });
     });
     ```

## Best Practices for Maintaining Compatibility
1. **Preserve Existing Patterns**: Add “Vortex” without altering patterns like “Shield Wall” in `formationService.ts`.
2. **Deprecate, Don’t Delete**: Mark outdated patterns as deprecated in `formationPatterns/` to support legacy code.
3. **Version Pattern Data**: Add a `version` field to `IFormationPattern` (e.g., `{ id: "vortex", version: "1.0" }`).
4. **Document Extensions**: Update `docs/systems/formation/` with new pattern details and migration guides.
5. **Test for Regressions**: Use Jest to validate existing formations and game theory outcomes remain unaffected.

## Guidelines for Updating Related Systems
1. **Balance New Patterns**: Tune “Vortex” effects (e.g., +15% speed) to prevent dominance, using simulation scripts.
2. **Optimize Performance**: Ensure new calculations stay within < 5ms, using caching (`formationService.ts`) and off-thread processing (`patternWorker.ts`).
3. **Enhance Visuals**: Add distinct visual cues for “Vortex” (e.g., swirling particles) in `instancedRenderer.ts`.
4. **Integrate with Traits**: Support “Vortex” with new traits (e.g., “Spiral Flow” behavior) in `src/domains/traits/data/`.
5. **Test Extensively**: Validate new patterns with unit and integration tests, ensuring balance and performance.

## Performance Considerations
- **Efficient Assignment**: Cache pattern pools to minimize data access during assignment.
- **Batch Processing**: Update particle positions in bulk for new patterns.
- **Off-Thread Calculations**: Use `patternWorker.ts` for complex position or physics updates.
- **Minimal Overhead**: Limit new pattern complexity (e.g., < 50 positions) to maintain 60 FPS.

## Integration Points
- **Formation Domain (`src/domains/traits/`)**: `formationService.ts` manages new patterns and assignments.
- **Creature Domain (`src/domains/creature/`)**: Provides `ICreature` and `IParticle` data for position updates.
- **Physics Domain (`src/domains/workers/`)**: `forceWorker.ts` supports new pattern dynamics.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes new patterns.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` incorporates new pattern effects.

## Rules Adherence
- **Determinism**: New patterns use static data and seeded RNG, ensuring consistency.
- **Modularity**: Extensions are encapsulated in existing services and data files.
- **Performance**: Targets < 5ms updates, leveraging caching and off-thread processing.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate formation code (e.g., in `src/creatures/` or `src/lib/`).
2. **Add New Pattern**: Update `src/domains/traits/data/formationPatterns/movement.ts` with “Vortex.”
3. **Extend Services**: Enhance `formationService.ts`, `forceWorker.ts`, and `payoffMatrixService.ts` for “Vortex” support.
4. **Update Rendering**: Add visual effects in `instancedRenderer.ts`.
5. **Test Extensions**: Validate “Vortex” functionality and performance using Jest, ensuring no regressions.

## Example Extension: Vortex Pattern
```typescript
// src/domains/traits/services/formationService.ts
class FormationService {
  assignFormation(group: IGroup, blockData: IBlockData): void {
    const rng = createRNGFromBlock(blockData.nonce).getStream('formations');
    const pattern = this.selectPattern(group.role, rng);
    this.applyPattern(group.particles, pattern);
    group.currentPattern = pattern;
  }
}
```

