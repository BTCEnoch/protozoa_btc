
# Trait Service APIs

## Purpose
This document provides a comprehensive overview of the APIs used to manage traits programmatically within the Bitcoin Protozoa project. It serves as a single source of truth for developers, detailing API method signatures, parameters, return types, and usage examples. Additionally, it highlights integration points with other services, such as battle or rendering systems, to facilitate seamless interaction across domains.

## Location
`docs/traits/trait_service_apis.md`

## Overview
The Trait Service APIs are housed within the `traits` domain under `src/domains/traits/services/`. These APIs enable developers to assign, retrieve, and manipulate traits for particles and creatures, ensuring consistency and determinism in gameplay mechanics. The APIs are designed to be modular, aligning with the project's domain-driven design (DDD) principles, and are built to integrate smoothly with other domains like `creature`, `rendering`, and `gameTheory`.

## API Methods
Below are the key API methods provided by the Trait Service, including their signatures, parameters, return types, and usage examples.

### 1. `getTraitDetails(traitId: string): ITrait`
- **Purpose**: Retrieves the details of a specific trait by its unique identifier.
- **Parameters**:
  - `traitId`: The unique identifier of the trait (string).
- **Return Type**: `ITrait` - An object containing the trait's properties (e.g., `id`, `name`, `rarity`, `effect`).
- **Usage Example**:
  ```typescript
  import { traitService } from 'src/domains/traits/services/traitService';

  const trait = traitService.getTraitDetails('ability_001');
  console.log(trait.name); // "Fire Blast"
  ```
- **Integration**: Used by the `rendering` domain to apply visual effects or by the `gameTheory` domain to evaluate battle outcomes.

### 2. `assignTrait(particle: IParticle, blockData: IBlockData): ITrait`
- **Purpose**: Assigns a trait to a particle based on its role and the provided block data, ensuring determinism via seeded RNG.
- **Parameters**:
  - `particle`: The particle to which the trait will be assigned (IParticle).
  - `blockData`: Bitcoin block data used to seed the RNG (IBlockData).
- **Return Type**: `ITrait` - The assigned trait.
- **Usage Example**:
  ```typescript
  import { traitService } from 'src/domains/traits/services/traitService';
  import { particle, blockData } from 'somewhere';

  const assignedTrait = traitService.assignTrait(particle, blockData);
  particle.trait = assignedTrait;
  ```
- **Integration**: Called by the `creature` domain during creature generation to assign traits to particles.

### 3. `getTraitPool(role: Role, rarity: Rarity): ITrait[]`
- **Purpose**: Retrieves the pool of traits available for a specific role and rarity.
- **Parameters**:
  - `role`: The role of the particle (e.g., CORE, ATTACK) (Role enum).
  - `rarity`: The rarity level of the traits (e.g., COMMON, RARE) (Rarity enum).
- **Return Type**: `ITrait[]` - An array of traits matching the role and rarity.
- **Usage Example**:
  ```typescript
  import { traitService } from 'src/domains/traits/services/traitService';
  import { Role, Rarity } from 'src/shared/types/core';

  const pool = traitService.getTraitPool(Role.ATTACK, Rarity.RARE);
  console.log(pool.length); // Number of rare attack traits
  ```
- **Integration**: Used internally by the `assignTrait` method but can also be utilized by other services for trait filtering.

### 4. `applyTraitEffect(trait: ITrait, particle: IParticle): void`
- **Purpose**: Applies the effect of a trait to a particle, modifying its stats or behavior.
- **Parameters**:
  - `trait`: The trait to apply (ITrait).
  - `particle`: The particle to which the trait is applied (IParticle).
- **Return Type**: `void`
- **Usage Example**:
  ```typescript
  import { traitService } from 'src/domains/traits/services/traitService';
  import { particle, trait } from 'somewhere';

  traitService.applyTraitEffect(trait, particle);
  // Particle stats or behavior are now modified based on the trait
  ```
- **Integration**: Used by the `creature` domain to update particle properties after trait assignment.

### 5. `getAllTraits(): ITrait[]`
- **Purpose**: Retrieves all available traits in the system.
- **Parameters**: None
- **Return Type**: `ITrait[]` - An array of all traits.
- **Usage Example**:
  ```typescript
  import { traitService } from 'src/domains/traits/services/traitService';

  const allTraits = traitService.getAllTraits();
  console.log(allTraits.length); // Total number of traits
  ```
- **Integration**: Useful for debugging or for services that need a complete list of traits, such as a trait gallery or admin panel.

## Integration Points
The Trait Service APIs integrate with other domains to ensure traits are correctly applied and utilized:
- **Creature Domain (`src/domains/creature/`)**: Uses `assignTrait` and `applyTraitEffect` during creature generation and updates.
- **Rendering Domain (`src/domains/rendering/`)**: Uses `getTraitDetails` to apply visual traits like color or glow effects.
- **Game Theory Domain (`src/domains/gameTheory/`)**: Uses `getTraitDetails` to evaluate trait effects in battle simulations or decision-making processes.

## Rules Adherence
- **Determinism**: Trait assignment and effects are deterministic, relying on seeded RNG and predefined trait pools.
- **Modularity**: APIs are encapsulated within the `traits` domain, with clear interfaces for other domains.
- **Scalability**: New traits or categories can be added without disrupting existing API functionality.

## Migration Steps
To transition from the current GitHub structure:
1. **Identify Existing Logic**: Locate trait management code in the GitHub repository (e.g., in `src/traits/` or `src/creatures/`).
2. **Refactor into Trait Service**: Consolidate logic into `traitService.ts` under `src/domains/traits/services/`.
3. **Update API Usage**: Adjust other domains to use the new API methods (e.g., `assignTrait`, `getTraitDetails`).
4. **Test Integration**: Verify that traits are correctly assigned, retrieved, and applied across domains.

This document ensures the Trait Service APIs are well-defined, modular, and easy to integrate, providing a clear guide for developers working on the Bitcoin Protozoa project.
