
# Trait Categories

## Overview
Trait categories in Bitcoin Protozoa classify the various properties and abilities that particles within a creature can possess. These categories—**abilities**, **formations**, **behaviors**, **visuals**, and **mutations**—define how particles behave, interact, and appear, influencing gameplay mechanics and visual representation. Each category is designed to be modular and role-specific, ensuring clarity and scalability within the domain-driven design (DDD) structure. This document details how to restructure the current trait system from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) into the new DDD framework under `src/domains/traits/`, providing a single source of truth for trait categories.

## Trait Categories
Trait categories are organized within the `traits` domain, with each category having its own subdirectory for types, services, data, and utilities. This structure ensures that each category is self-contained and easily maintainable.

### Directory Structure
```
src/domains/traits/
├── types/
│   ├── ability.ts          # Ability type definitions
│   ├── formation.ts        # Formation type definitions
│   ├── behavior.ts         # Behavior type definitions
│   ├── visual.ts           # Visual type definitions
│   ├── mutation.ts         # Mutation type definitions
│   └── index.ts            # Trait types exports
├── services/
│   ├── abilityService.ts   # Ability management service
│   ├── formationService.ts # Formation management service
│   ├── behaviorService.ts  # Behavior management service
│   ├── visualService.ts    # Visual management service
│   ├── mutationService.ts  # Mutation management service
│   └── index.ts            # Trait services exports
├── data/
│   ├── abilityPools/       # Ability pool definitions
│   ├── formationPatterns/  # Formation pattern definitions
│   ├── behaviorPatterns/   # Behavior pattern definitions
│   ├── visualPatterns/     # Visual pattern definitions
│   ├── mutations/          # Mutation definitions
│   └── index.ts            # Trait data exports
├── components/
│   ├── TraitDisplay/       # Trait display component
│   └── index.ts            # Trait components exports
└── index.ts                # Traits domain exports
```

### Categories
Each trait category serves a distinct purpose and integrates with other domains (e.g., `creature`, `rendering`) to influence particle behavior and appearance.

#### 1. Abilities
- **Purpose**: Define active or passive skills that particles can use, affecting gameplay mechanics such as battles or interactions.
- **Structure**: 
  - Types: `src/domains/traits/types/ability.ts`
  - Services: `src/domains/traits/services/abilityService.ts`
  - Data: `src/domains/traits/data/abilityPools/`
- **Integration**: Used by the `creature` domain to assign abilities to particles and by the `gameTheory` domain for battle simulations.
- **Example**:
  ```typescript
  // src/domains/traits/services/abilityService.ts
  import { Singleton } from 'typescript-singleton';
  import { IAbility } from 'src/domains/traits/types/ability';

  class AbilityService extends Singleton {
    assignAbility(particle: IParticle, ability: IAbility): void {
      // Logic to assign ability to particle
    }
  }
  export const abilityService = AbilityService.getInstance();
  ```

#### 2. Formations
- **Purpose**: Define spatial arrangements for particles within a creature, influencing their behavior and effectiveness.
- **Structure**:
  - Types: `src/domains/traits/types/formation.ts`
  - Services: `src/domains/traits/services/formationService.ts`
  - Data: `src/domains/traits/data/formationPatterns/`
- **Integration**: Used by the `creature` domain to arrange particles and by the `rendering` domain to visualize formations.
- **Example**:
  ```typescript
  // src/domains/traits/services/formationService.ts
  import { Singleton } from 'typescript-singleton';
  import { IFormation } from 'src/domains/traits/types/formation';

  class FormationService extends Singleton {
    applyFormation(group: IGroup, formation: IFormation): void {
      // Logic to apply formation to particle group
    }
  }
  export const formationService = FormationService.getInstance();
  ```

#### 3. Behaviors
- **Purpose**: Dictate how particles act or react in different situations, such as movement patterns or response to stimuli.
- **Structure**:
  - Types: `src/domains/traits/types/behavior.ts`
  - Services: `src/domains/traits/services/behaviorService.ts`
  - Data: `src/domains/traits/data/behaviorPatterns/`
- **Integration**: Used by the `creature` domain to control particle actions and by the `gameTheory` domain for decision-making.
- **Example**:
  ```typescript
  // src/domains/traits/services/behaviorService.ts
  import { Singleton } from 'typescript-singleton';
  import { IBehavior } from 'src/domains/traits/types/behavior';

  class BehaviorService extends Singleton {
    applyBehavior(particle: IParticle, behavior: IBehavior): void {
      // Logic to apply behavior to particle
    }
  }
  export const behaviorService = BehaviorService.getInstance();
  ```

#### 4. Visuals
- **Purpose**: Define the appearance of particles, including colors, shapes, and other visual effects.
- **Structure**:
  - Types: `src/domains/traits/types/visual.ts`
  - Services: `src/domains/traits/services/visualService.ts`
  - Data: `src/domains/traits/data/visualPatterns/`
- **Integration**: Used by the `rendering` domain to apply visual traits to particles.
- **Example**:
  ```typescript
  // src/domains/traits/services/visualService.ts
  import { Singleton } from 'typescript-singleton';
  import { IVisual } from 'src/domains/traits/types/visual';

  class VisualService extends Singleton {
    applyVisual(particle: IParticle, visual: IVisual): void {
      // Logic to apply visual traits to particle
    }
  }
  export const visualService = VisualService.getInstance();
  ```

#### 5. Mutations
- **Purpose**: Define special traits that can change or evolve over time, tied to the evolution system.
- **Structure**:
  - Types: `src/domains/traits/types/mutation.ts`
  - Services: `src/domains/traits/services/mutationService.ts`
  - Data: `src/domains/traits/data/mutations/`
- **Integration**: Used by the `evolution` domain to apply mutations based on confirmation milestones.
- **Example**:
  ```typescript
  // src/domains/traits/services/mutationService.ts
  import { Singleton } from 'typescript-singleton';
  import { IMutation } from 'src/domains/traits/types/mutation';

  class MutationService extends Singleton {
    applyMutation(creature: ICreature, mutation: IMutation): void {
      // Logic to apply mutation to creature
    }
  }
  export const mutationService = MutationService.getInstance();
  ```

## Shared Resources
- **Trait Types (`src/domains/traits/types/`)**: Define interfaces for each trait category, ensuring consistency across services and data.
- **Trait Data (`src/domains/traits/data/`)**: Store static definitions for traits, organized by category and role.
- **Trait Services (`src/domains/traits/services/`)**: Provide category-specific logic for trait assignment and application.

## Integration
Trait categories integrate with:
- **Creature Domain (`src/domains/creature/`)**: Assign traits to particles and creatures.
- **Rendering Domain (`src/domains/rendering/`)**: Apply visual traits to particle rendering.
- **Evolution Domain (`src/domains/evolution/`)**: Use mutations for creature evolution.
- **Game Theory Domain (`src/domains/gameTheory/`)**: Influence battle outcomes and decision-making.

## Rules Adherence
- **Determinism**: Trait assignment and application are deterministic, using RNG seeded by block nonce.
- **Modularity**: Each category is self-contained, with clear interfaces for integration.
- **Scalability**: New trait categories or subcategories can be added without disrupting existing logic.

## Migration Steps
To transition from the current GitHub structure:
1. **Identify Existing Trait Logic**: Locate trait-related code in the GitHub repository (e.g., `src/traits/`, `src/creatures/`).
2. **Refactor into Categories**: Organize logic into the appropriate category subdirectories under `src/domains/traits/`.
3. **Update Dependencies**: Adjust imports in other domains to use the new trait services and types.
4. **Test Integration**: Verify that traits are correctly assigned and applied across domains, ensuring no regressions.

This document serves as the single source of truth for trait categories in Bitcoin Protozoa, guiding the transition to the new DDD structure while ensuring clarity, modularity, and scalability.
