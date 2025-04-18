
# Trait System

## Overview
The Trait System in Bitcoin Protozoa assigns properties to particles within creatures, defining their behavior, appearance, and interactions. It is a core component that ensures modularity, determinism, and scalability, aligning with the project's domain-driven design (DDD) principles. Traits are categorized into **abilities**, **formations**, **behaviors**, **visuals**, and **mutations**, each influencing specific aspects of particle functionality and visuals. This document outlines how to restructure the current trait system from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) into the new DDD framework under `src/domains/traits/`, providing a single source of truth for the trait system.

## Trait Categories
Each trait category serves a distinct purpose and is managed independently within the `traits` domain, ensuring clarity and modularity.

### 1. Abilities
- **Purpose**: Define active or passive skills for particles, affecting gameplay mechanics such as battles or interactions.
- **Structure**:
  - Types: `src/domains/traits/types/ability.ts`
  - Services: `src/domains/traits/services/abilityService.ts`
  - Data: `src/domains/traits/data/abilityPools/`
- **Integration**: Used by the `creature` domain to assign abilities and by the `gameTheory` domain for battle simulations.

### 2. Formations
- **Purpose**: Control spatial arrangements of particles within a creature, influencing behavior and effectiveness.
- **Structure**:
  - Types: `src/domains/traits/types/formation.ts`
  - Services: `src/domains/traits/services/formationService.ts`
  - Data: `src/domains/traits/data/formationPatterns/`
- **Integration**: Used by the `creature` domain for particle positioning and by the `rendering` domain for visualization.

### 3. Behaviors
- **Purpose**: Dictate how particles act or react, such as movement patterns or responses to stimuli.
- **Structure**:
  - Types: `src/domains/traits/types/behavior.ts`
  - Services: `src/domains/traits/services/behaviorService.ts`
  - Data: `src/domains/traits/data/behaviorPatterns/`
- **Integration**: Used by the `creature` domain for particle actions and by the `gameTheory` domain for decision-making.

### 4. Visuals
- **Purpose**: Determine the appearance of particles, including colors, shapes, and effects.
- **Structure**:
  - Types: `src/domains/traits/types/visual.ts`
  - Services: `src/domains/traits/services/visualService.ts`
  - Data: `src/domains/traits/data/visualPatterns/`
- **Integration**: Used by the `rendering` domain to apply visual traits to particles.

### 5. Mutations
- **Purpose**: Enable evolution-based changes tied to confirmation milestones.
- **Structure**:
  - Types: `src/domains/traits/types/mutation.ts`
  - Services: `src/domains/traits/services/mutationService.ts`
  - Data: `src/domains/traits/data/mutations/`
- **Integration**: Used by the `evolution` domain to apply mutations during creature evolution.

## Shared Resources
- **Trait Types (`src/domains/traits/types/`)**: Define interfaces for each trait category, ensuring consistency across services and data.
- **Trait Data (`src/domains/traits/data/`)**: Store static definitions for traits, organized by category and role.
- **Trait Services (`src/domains/traits/services/`)**: Provide category-specific logic for trait assignment and application.
- **RNG Integration**: Use the shared RNG system (`src/shared/lib/rngSystem.ts`) for deterministic trait selection.

## Integration
The Trait System integrates with:
- **Creature Domain (`src/domains/creature/`)**: Assigns traits to particles during creature generation.
- **Rendering Domain (`src/domains/rendering/`)**: Applies visual traits to particle rendering.
- **Evolution Domain (`src/domains/evolution/`)**: Uses mutations for creature evolution.
- **Game Theory Domain (`src/domains/gameTheory/`)**: Influences battle outcomes and decision-making based on traits.

## Rules Adherence
- **Determinism**: Trait assignment is deterministic, using RNG seeded by block nonce.
- **Modularity**: Each trait category is self-contained, with clear interfaces for integration.
- **Scalability**: New trait categories or subcategories can be added without disrupting existing logic.

## Migration Steps
To transition from the current GitHub structure:
1. **Identify Existing Trait Logic**: Locate trait-related code in the GitHub repository (e.g., `src/traits/`, `src/creatures/`).
2. **Refactor into Categories**: Organize logic into the appropriate category subdirectories under `src/domains/traits/`.
3. **Update Dependencies**: Adjust imports in other domains to use the new trait services and types.
4. **Test Integration**: Verify that traits are correctly assigned and applied across domains, ensuring no regressions.

## Code Examples
### Trait Service (Abilities)
The `abilityService.ts` handles ability assignment.
```typescript
// src/domains/traits/services/abilityService.ts
import { Singleton } from 'typescript-singleton';
import { IAbility } from 'src/domains/traits/types/ability';
import { Role } from 'src/shared/types/core';

class AbilityService extends Singleton {
  assignAbility(particle: IParticle, role: Role): IAbility {
    const rng = createRNGFromBlock(blockData.nonce).getStream('abilities');
    const pool = this.getAbilityPool(role);
    return pool[Math.floor(rng() * pool.length)];
  }

  private getAbilityPool(role: Role): IAbility[] {
    // Logic to get ability pool for the role
    return [];
  }
}

export const abilityService = AbilityService.getInstance();
```

This document serves as the single source of truth for the Trait System in Bitcoin Protozoa, guiding the transition to the new DDD structure while ensuring clarity, modularity, and scalability.
