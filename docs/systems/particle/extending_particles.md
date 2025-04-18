
# Extending the Particle System

## Purpose
This document guides developers on extending the particle system in Bitcoin Protozoa by adding new particle roles, behaviors, or features without disrupting existing functionality. It serves as a single source of truth, ensuring the system remains flexible, modular, and aligned with the project’s domain-driven design (DDD) principles while maintaining performance and determinism for up to 500 particles per creature.

## Location
`new_docs/systems/particle/extending_particles.md`

## Overview
The particle system in Bitcoin Protozoa manages the creation, behavior, and visualization of particles, each assigned a role (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and traits that define their properties. Its modular design, encapsulated within the `creature` and `traits` domains, supports extensions like new roles (e.g., SUPPORT) or behaviors (e.g., healing). This document provides steps to introduce new features, best practices for maintaining compatibility, and guidelines for updating related systems, ensuring scalability and future-proofing.

## Steps to Introduce a New Particle Role
Adding a new role, such as SUPPORT, involves the following steps:

1. **Define the New Role’s Purpose and Behavior**
   - **Purpose**: Specify the role’s function (e.g., SUPPORT enhances ally traits or heals).
   - **Behavior**: Outline role-specific dynamics (e.g., SUPPORT particles emit healing pulses).
   - **Example**: SUPPORT particles increase nearby particles’ defense by 10%.

2. **Update the Role Enum**
   - **Location**: Modify `src/shared/types/core.ts` to include the new role.
   - **Content**: Add the role to the `Role` enum.
   - **Example**:
     ```typescript
     // src/shared/types/core.ts
     export enum Role {
       CORE = 'CORE',
       CONTROL = 'CONTROL',
       MOVEMENT = 'MOVEMENT',
       DEFENSE = 'DEFENSE',
       ATTACK = 'ATTACK',
       SUPPORT = 'SUPPORT'
     }
     ```

3. **Extend Particle Creation Logic**
   - **Location**: Update `src/domains/creature/services/particleService.ts` to support the new role.
   - **Content**: Adjust role distribution ratios to include SUPPORT (e.g., 15% SUPPORT, reducing others proportionally).
   - **Example**:
     ```typescript
     // src/domains/creature/services/particleService.ts
     class ParticleService {
       createParticles(count: number, blockData: IBlockData): IParticle[] {
         const rng = createRNGFromBlock(blockData.nonce).getStream('particles');
         const roleRatios = {
           [Role.CORE]: 0.2,
           [Role.CONTROL]: 0.2,
           [Role.MOVEMENT]: 0.2,
           [Role.DEFENSE]: 0.2,
           [Role.ATTACK]: 0.15,
           [Role.SUPPORT]: 0.15
         };
         const particles: IParticle[] = [];
         for (let i = 0; i < count; i++) {
           const role = this.assignRole(rng, roleRatios);
           particles.push({ id: `particle-${i}`, role, position: [0, 0, 0], velocity: [0, 0, 0], scale: 1 });
         }
         return particles;
       }
     }
     ```

4. **Add Role-Specific Traits**
   - **Location**: Create a new subdirectory in `src/domains/traits/data/` (e.g., `abilityPools/support.ts`, `behaviorPatterns/support.ts`).
   - **Content**: Define traits tailored to the SUPPORT role.
   - **Example**:
     ```json
     // src/domains/traits/data/abilityPools/support.ts
     [
       {
         "id": "support_ability_001",
         "name": "Healing Pulse",
         "rarity": "RARE",
         "effect": "Increases nearby particles' health by 5%",
         "stats": { "heal": 5 }
       }
     ]
     ```

5. **Update Behavior and Physics Logic**
   - **Location**: Extend `src/domains/traits/services/behaviorService.ts` and `src/domains/workers/services/physics/forceWorker.ts`.
   - **Content**: Implement SUPPORT-specific behaviors (e.g., healing pulses) and forces (e.g., attraction to injured particles).
   - **Example**:
     ```typescript
     // src/domains/traits/services/behaviorService.ts
     class BehaviorService {
       applyBehavior(particle: IParticle, behavior: IBehavior, particles: IParticle[]): void {
         if (particle.role === Role.SUPPORT && behavior.action === 'Healing') {
           particles.forEach(p => {
             if (p !== particle && distance(p.position, particle.position) < 5) {
               p.health = Math.min(p.health + 5, p.maxHealth);
             }
           });
         }
       }
     }
     ```

6. **Integrate with Rendering and Game Theory**
   - **Rendering**: Update `src/domains/rendering/services/instancedRenderer.ts` to support SUPPORT-specific visuals (e.g., glowing aura).
   - **Game Theory**: Extend `src/domains/gameTheory/services/gameTheoryStrategyService.ts` to include SUPPORT role payoffs (e.g., healing boosts team resilience).
   - **Example**:
     ```typescript
     // src/domains/gameTheory/services/gameTheoryStrategyService.ts
     class GameTheoryStrategyService {
       generatePayoffMatrix(creature1: ICreature, creature2: ICreature): number[][] {
         const support1 = creature1.particles.filter(p => p.role === Role.SUPPORT).length * 0.1; // Healing boost
         // Adjust payoffs based on SUPPORT role
       }
     }
     ```

7. **Test the New Role**
   - Write unit tests for role assignment and behavior application.
   - Perform integration tests to ensure compatibility with rendering and game theory.
   - **Example**:
     ```typescript
     // tests/unit/particleService.test.ts
     describe('ParticleService', () => {
       test('assigns SUPPORT role correctly', () => {
         const blockData = createMockBlockData(12345);
         const particles = particleService.createParticles(500, blockData);
         const supportCount = particles.filter(p => p.role === Role.SUPPORT).length;
         expect(supportCount).toBeCloseTo(75, -1); // ~15% of 500
       });
     });
     ```

## Best Practices for Modifying Existing Particles
1. **Update Role Ratios Carefully**: Adjust ratios in `particleService.ts` to maintain balance (e.g., sum to 100%).
2. **Preserve Existing Behaviors**: Add new behaviors in `behaviorService.ts` without altering current ones.
3. **Extend Traits Incrementally**: Add new traits to `src/domains/traits/data/` with clear documentation.
4. **Test for Regressions**: Use Jest to validate that existing roles and behaviors remain unaffected.

## Guidelines for Maintaining Backward Compatibility
1. **Version Roles and Traits**: Add a `version` field to `Role` or trait data to track changes.
   - **Example**: `{ role: "SUPPORT", version: "1.0" }`.
2. **Deprecate, Don’t Delete**: Mark outdated roles or behaviors as deprecated in `core.ts` or trait files.
3. **Provide Migration Scripts**: Create scripts to update existing creature data with new roles.
4. **Document Changes**: Update `docs/traits/` and `docs/systems/particle/` with new role details.

## Performance Considerations
- **Efficient Role Assignment**: Use cached RNG streams to minimize overhead in `particleService.ts`.
- **Optimized Behavior Updates**: Limit new behavior calculations to nearby particles using spatial partitioning (`spatialUtils.ts`).
- **Rendering Compatibility**: Ensure new visuals (e.g., SUPPORT glow) use instanced rendering for performance.

## Integration Points
- **Creature Domain (`src/domains/creature/`)**: `particleService.ts` handles role assignment and particle creation.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` and `behaviorService.ts` provide role-specific traits and behaviors.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` applies SUPPORT visuals.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `gameTheoryStrategyService.ts` incorporates SUPPORT role payoffs.

## Rules Adherence
- **Determinism**: New roles use deterministic RNG for assignment and behavior, tied to block nonce.
- **Modularity**: Extensions are encapsulated in new services or data files, maintaining clear interfaces.
- **Performance**: New features target < 10ms updates for 500 particles, leveraging existing optimizations.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Particle Logic**: Locate role and behavior code (e.g., in `src/creatures/`, `src/lib/`).
2. **Add New Role**: Update `core.ts` and `particleService.ts` to include SUPPORT.
3. **Extend Traits**: Add SUPPORT-specific traits in `src/domains/traits/data/`.
4. **Update Services**: Enhance `behaviorService.ts` and `gameTheoryStrategyService.ts` for SUPPORT dynamics.
5. **Test Extensions**: Validate new role functionality and performance using Jest, ensuring no regressions.

## Example Extension: SUPPORT Role Behavior
```typescript
// src/domains/traits/services/behaviorService.ts
class BehaviorService {
  applyBehavior(particle: IParticle, behavior: IBehavior, particles: IParticle[]): void {
    if (particle.role === Role.SUPPORT && behavior.action === 'Healing') {
      particles.forEach(p => {
        if (p !== particle && distance(p.position, particle.position) < 5) {
          p.health = Math.min(p.health + behavior.stats.heal, p.maxHealth);
        }
      });
    }
  }
}
```


