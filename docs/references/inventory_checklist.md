Below is the Implementation Inventory Checklist for the Bitcoin Protozoa project, tailored to your request. It provides a comprehensive, organized list of all components—functions, types, variables, etc.—needed for the architecture. Each entry specifies its purpose, location, usage, and dependencies, ensuring no duplication, mismatched names, or locally created functions where imports are appropriate.


# Implementation Inventory Checklist for Bitcoin Protozoa

This checklist catalogs all components—functions, types, variables, etc.—required for the Bitcoin Protozoa project. It ensures each element is correctly implemented, located, and integrated, maintaining a modular, scalable architecture with no duplication or naming conflicts.

---

## Checklist Structure
- **Domain**: Feature area (e.g., `creature`, `traits`).
- **Component**: Specific element (e.g., type, function, constant).
- **Location**: Directory/file where it resides.
- **Purpose**: Its specific role or functionality.
- **Usage**: How and where it’s used.
- **Dependencies**: What it relies on or is used by.

---

## Shared Utilities and Types
- **Location**: `src/shared/`

### Types
- **`core.ts`**
  - **Component**: `Role` (enum)
    - **Purpose**: Defines particle roles (e.g., CORE, ATTACK).
    - **Usage**: Drives role-based logic across domains.
    - **Dependencies**: None.
  - **Component**: `Rarity` (enum)
    - **Purpose**: Defines trait rarities (e.g., COMMON, MYTHIC).
    - **Usage**: Used in trait generation and evolution logic.
    - **Dependencies**: None.
  - **Component**: `IBlockData` (interface)
    - **Purpose**: Standardizes Bitcoin block data structure.
    - **Usage**: Used by `bitcoinService` and `rngSystem`.
    - **Dependencies**: None.

### Libraries
- **`rngSystem.ts`**
  - **Component**: `createRNGFromBlock` (function)
    - **Purpose**: Creates a deterministic RNG from block nonce.
    - **Usage**: Initializes randomness for creature/trait generation.
    - **Dependencies**: `IBlockData`.
  - **Component**: `getStream` (method)
    - **Purpose**: Returns domain-specific RNG streams.
    - **Usage**: Used by trait, creature, and evolution services.
    - **Dependencies**: Internal to `rngSystem`.

### Utilities
- **`math.ts`**
  - **Component**: `clamp` (function)
    - **Purpose**: Restricts values to a specified range.
    - **Usage**: Applied in physics and rendering calculations.
    - **Dependencies**: None.
  - **Component**: `lerp` (function)
    - **Purpose**: Performs linear interpolation.
    - **Usage**: Used in animations and particle movements.
    - **Dependencies**: None.

### Constants
- **`config.ts`**
  - **Component**: `MAX_PARTICLES` (constant)
    - **Purpose**: Sets maximum particle count (500).
    - **Usage**: Limits creature generation and rendering.
    - **Dependencies**: None.
  - **Component**: `BLOCK_SIZE` (constant)
    - **Purpose**: Defines spatial partitioning block size.
    - **Usage**: Used in physics calculations.
    - **Dependencies**: None.

---

## Creature Domain
- **Location**: `src/domains/creature/`

### Types
- **`types/creature.ts`**
  - **Component**: `ICreature` (interface)
    - **Purpose**: Specifies creature properties.
    - **Usage**: Blueprint for models and services.
    - **Dependencies**: `Role`, `Rarity`.

### Models
- **`models/creature.ts`**
  - **Component**: `CreatureModel` (class)
    - **Purpose**: Encapsulates creature data and state.
    - **Usage**: Instantiated by `creatureGenerator`.
    - **Dependencies**: `ICreature`, `Role`, `Rarity`.

### Services
- **`services/creatureGenerator.ts`**
  - **Component**: `CreatureGenerator` (class)
    - **Purpose**: Generates creatures from block data.
    - **Usage**: Core logic for creature creation.
    - **Dependencies**: `BitcoinService`, `rngSystem`, `TraitService`.

### Components
- **`components/CreatureViewer.tsx`**
  - **Component**: `CreatureViewer` (React component)
    - **Purpose**: Renders creatures in 3D using Three.js.
    - **Usage**: Displays creatures on the viewer page.
    - **Dependencies**: `CreatureModel`, `RenderingService`.

### Hooks
- **`hooks/useCreature.ts`**
  - **Component**: `useCreature` (hook)
    - **Purpose**: Manages creature state in React.
    - **Usage**: Provides creature data to components.
    - **Dependencies**: `CreatureModel`.

---

## Traits Domain
- **Location**: `src/domains/traits/`

### Types
- **`types/ability.ts`**
  - **Component**: `IAbility` (interface)
    - **Purpose**: Defines ability properties.
    - **Usage**: Used by ability-related services/models.
    - **Dependencies**: `Rarity`.

### Models
- **`models/ability.ts`**
  - **Component**: `AbilityModel` (class)
    - **Purpose**: Represents an ability with behavior logic.
    - **Usage**: Managed by `TraitService`.
    - **Dependencies**: `IAbility`.

### Services
- **`services/traitService.ts`**
  - **Component**: `TraitService` (class)
    - **Purpose**: Assigns and applies traits to creatures.
    - **Usage**: Called by `creatureGenerator`.
    - **Dependencies**: `rngSystem`, `AbilityModel`.

### Data
- **`data/abilityPools/core.ts`**
  - **Component**: `coreAbilityPool` (array)
    - **Purpose**: Stores abilities for CORE role.
    - **Usage**: Sourced by `AbilityFactory` for trait assignment.
    - **Dependencies**: `IAbility`.

---

## Bitcoin Domain
- **Location**: `src/domains/bitcoin/`

### Services
- **`services/bitcoinService.ts`**
  - **Component**: `BitcoinService` (class)
    - **Purpose**: Retrieves block data from ordinals.com API.
    - **Usage**: Provides data for creature generation.
    - **Dependencies**: None (external API).

### Components
- **`components/BlockSelector.tsx`**
  - **Component**: `BlockSelector` (React component)
    - **Purpose**: UI for selecting block numbers.
    - **Usage**: Triggers creature generation in the UI.
    - **Dependencies**: `BitcoinService`.

---

## Rendering Domain
- **Location**: `src/domains/rendering/`

### Services
- **`services/renderingService.ts`**
  - **Component**: `RenderingService` (class)
    - **Purpose**: Manages Three.js scene rendering.
    - **Usage**: Powers `CreatureViewer` visuals.
    - **Dependencies**: `CreatureModel`.

### Utilities
- **`utils/renderingUtils.ts`**
  - **Component**: `optimizeMesh` (function)
    - **Purpose**: Optimizes particle meshes for performance.
    - **Usage**: Enhances rendering efficiency.
    - **Dependencies**: None.

---

## Workers Domain
- **Location**: `src/domains/workers/`

### Services
- **`services/physics/forceWorker.ts`**
  - **Component**: `ForceWorker` (worker)
    - **Purpose**: Computes particle physics forces off-thread.
    - **Usage**: Used in physics simulation loops.
    - **Dependencies**: `CreatureModel`.

---

## Testing
- **Location**: `tests/`

### Mocks
- **`mocks/bitcoinServiceMock.ts`**
  - **Component**: `BitcoinServiceMock` (class)
    - **Purpose**: Mocks `BitcoinService` for testing.
    - **Usage**: Simulates API responses in tests.
    - **Dependencies**: `IBlockData`.

### Key Points
- Research suggests the Bitcoin Protozoa project needs a comprehensive inventory of types, services, models, and other components for its domain-driven architecture.
- It seems likely that all components must be modular, with clear purposes and locations, to ensure no duplication and proper integration.
- The evidence leans toward organizing components by domain (e.g., creature, traits) with shared utilities, ensuring scalability and maintainability.

### Direct Answer

#### Overview
This guide lists all components needed for Bitcoin Protozoa, including types, services, models, data, components, hooks, contexts, utilities, constants, styles, pages, routes, and workers. Each entry includes its name, purpose, location, usage, and dependencies, ensuring everything is accounted for and properly organized.

### Key Points
- The Bitcoin Protozoa project likely uses TypeScript interfaces and enums to define data structures across its domain-driven architecture.
- Research suggests types are organized in `src/shared/types/` for shared utilities and `src/domains/*/types/` for domain-specific needs, ensuring modularity.
- It seems likely that each type serves a specific purpose, such as defining creature properties or rendering configurations, with clear dependencies to avoid duplication.
- The evidence leans toward a comprehensive types inventory covering all domains, with no overlapping names or redundant definitions.

### Overview
This section provides a revised types inventory for the Bitcoin Protozoa project, listing all necessary TypeScript types (interfaces and enums) used to define data structures. Each type is detailed with its purpose, location in the project’s file structure, usage in the system, and dependencies on other types. This ensures a clear, organized approach to managing data across the project’s domains, making it easy for developers to understand and use these types.

### Shared Types
Shared types, stored in `src/shared/types/`, are used across multiple domains to maintain consistency. These include enums for roles and rarities, as well as interfaces for core data structures like Bitcoin block data.

### Domain-Specific Types
Each domain (e.g., creature, traits, bitcoin) has its own types directory, defining interfaces specific to that feature area. For example, the creature domain includes types for creatures and particles, while the rendering domain defines types for 3D rendering configurations.

### How to Use This Inventory
Developers can reference this inventory to locate types, understand their roles, and ensure proper integration in services, models, and components. The dependencies column helps identify related types, preventing naming conflicts and ensuring modularity.

---


# Implementation Inventory Checklist for Bitcoin Protozoa

This checklist catalogs all components required for the Bitcoin Protozoa project, ensuring each is correctly implemented, located, and integrated without duplication or naming conflicts. Below is the revised **Types Inventory** portion, detailing all TypeScript types (interfaces and enums) needed for the project’s architecture, based on the provided directory structure and project requirements.

## Types Inventory
Types define data structures, ensuring type safety and consistency across the project. The following table lists all types, their purposes, locations, usage, and dependencies, covering shared and domain-specific types.

| Name                | Purpose                                      | Location                                       | Usage                                         | Dependencies        |
|---------------------|----------------------------------------------|------------------------------------------------|-----------------------------------------------|---------------------|
| Role                | Enum for particle roles (CORE, CONTROL, ATTACK, DEFENSE, MOVEMENT) | src/shared/types/core.ts                       | Defines roles for particles and traits        | None                |
| Rarity              | Enum for trait rarities (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC) | src/shared/types/core.ts                       | Specifies rarity levels for traits and mutations | None                |
| IBlockData          | Interface for Bitcoin block data (nonce, confirmations) | src/shared/types/core.ts                       | Standardizes block data for RNG and evolution | None                |
| IEvent              | Interface for event bus messages             | src/shared/types/events.ts                     | Defines structure for inter-domain events     | None                |
| IConfig             | Interface for application configuration      | src/shared/types/config.ts                     | Specifies configuration settings              | None                |
| IRNGStream          | Interface for RNG stream properties          | src/shared/types/rng.ts                        | Defines structure for RNG streams             | None                |
| ICreature           | Interface for creature properties (particles, traits) | src/domains/creature/types/creature.ts         | Defines creature structure for models/services | Role, Rarity, IParticle, IGroup |
| IParticle           | Interface for particle properties (position, role) | src/domains/creature/types/particle.ts         | Defines particle structure for rendering      | Role                |
| IGroup              | Interface for particle group properties      | src/domains/creature/types/group.ts            | Defines group structure for formations        | IParticle           |
| IAbility            | Interface for ability trait properties       | src/domains/traits/types/ability.ts            | Defines ability structure for trait logic     | Rarity              |
| IFormation          | Interface for formation trait properties     | src/domains/traits/types/formation.ts          | Defines formation structure for positioning   | None                |
| IBehavior           | Interface for behavior trait properties      | src/domains/traits/types/behavior.ts           | Defines behavior structure for dynamics       | None                |
| IVisual             | Interface for visual trait properties        | src/domains/traits/types/visual.ts             | Defines visual structure for rendering        | None                |
| IMutation           | Interface for mutation trait properties      | src/domains/traits/types/mutation.ts           | Defines mutation structure for evolution      | Rarity              |
| IBitcoinBlock       | Interface for Bitcoin block metadata         | src/domains/bitcoin/types/bitcoin.ts           | Extends block data for Bitcoin service        | IBlockData          |
| IInstancedRendering | Interface for instanced rendering config     | src/domains/rendering/types/instanced.ts       | Defines instanced rendering settings          | None                |
| IShaderUniforms     | Interface for shader uniforms                | src/domains/rendering/types/shaders.ts         | Defines shader uniform structures             | None                |
| ILODConfig          | Interface for level of detail configuration  | src/domains/rendering/types/lod.ts             | Defines LOD settings for rendering            | None                |
| IBufferGeometry     | Interface for buffer geometry properties     | src/domains/rendering/types/buffers.ts         | Defines buffer structures for rendering       | None                |
| IEvolution          | Interface for evolution properties (milestones, mutations) | src/domains/evolution/types/evolution.ts       | Defines evolution structure for tracking      | Rarity, IMutation   |
| IPayoffMatrix       | Interface for payoff matrix structure        | src/domains/gameTheory/types/payoffMatrix.ts   | Defines payoff matrix for game theory         | None                |
| IDecisionTree       | Interface for decision tree structure        | src/domains/gameTheory/types/decisionTree.ts   | Defines decision tree for game logic          | None                |
| INashEquilibrium    | Interface for Nash equilibrium properties    | src/domains/gameTheory/types/nashEquilibrium.ts| Defines equilibrium for game calculations     | None                |
| IUtilityFunction    | Interface for utility function properties    | src/domains/gameTheory/types/utilityFunction.ts| Defines utility functions for game logic      | None                |
| IBattleOutcome      | Interface for battle outcome properties      | src/domains/gameTheory/types/battleOutcome.ts  | Defines battle outcomes for game theory       | None                |
| IWorkerMessage      | Interface for worker message structure       | src/domains/workers/types/messages.ts          | Defines messages for worker communication     | None                |
| IPhysicsWorker      | Interface for physics worker properties      | src/domains/workers/types/physics.ts           | Defines physics worker settings               | None                |
| IComputeWorker      | Interface for compute worker properties      | src/domains/workers/types/compute.ts           | Defines compute worker settings               | None                |

---

# Bitcoin Protozoa Implementation Inventory: Comprehensive Analysis

This note provides a detailed inventory of all components required for the Bitcoin Protozoa project, a particle-based life simulation powered by Bitcoin block data, deployed on-chain via recursive inscriptions using the ordinals protocol. The focus here is on the revised **Types Inventory**, which catalogs all TypeScript types (interfaces and enums) needed for the project’s architecture, based on the provided directory structure (`directory_map.md`) and a review of the project’s requirements as of 07:25 PM PDT on Thursday, April 17, 2025. The inventory ensures modularity, avoids duplication, and supports scalability, with each type specifying its name, purpose, location, usage, and dependencies.

## Project Context and Architecture
Bitcoin Protozoa generates creatures composed of 500 particles, distributed across five role groups (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), with traits determined by Bitcoin block data (nonce and confirmations) fetched via the [ordinals.com API]([invalid url, do not cite]). The project employs a domain-driven design (DDD) architecture, organized under `src/domains/` for feature areas (e.g., creature, traits, bitcoin), with shared utilities in `src/shared/` and application-wide concerns in `src/app/`. The `directory_map.md` provides a comprehensive structure, which serves as the basis for this inventory, cross-referenced with project requirements to ensure completeness.

## Inventory Methodology
The types inventory is structured to list all TypeScript interfaces and enums, covering both shared and domain-specific types. Each entry includes:
- **Name**: The specific type identifier (e.g., `Role`, `ICreature`).
- **Purpose**: Its role or functionality within the project.
- **Location**: The file where it resides, aligning with `directory_map.md`.
- **Usage**: How it’s used in services, models, or components.
- **Dependencies**: Other types it relies on, ensuring no naming conflicts or redundancies.

The inventory is derived from the `directory_map.md`, which outlines type files in `src/shared/types/` and `src/domains/*/types/`, and informed by the project’s requirements for modularity and determinism. Since direct access to the GitHub repository ([Bitcoin Protozoa GitHub]([invalid url, do not cite])) was not feasible, assumptions are based on typical DDD practices and the provided structure, with type names inferred from file names (e.g., `creature.ts` likely defines `ICreature`).

## Types Inventory
The types inventory is divided into shared types (used across domains) and domain-specific types (unique to each feature area). The following table provides a comprehensive list, ensuring all necessary types are accounted for without duplication or overlapping names.

Below is the reformatted table in a clear Markdown (.md) format, with all columns properly aligned and each row correctly structured. The table includes the **Name**, **Purpose**, **Location**, **Usage**, and **Dependencies** for each type, ensuring readability and consistency. This format is ready for inclusion in project documentation or a README file.


| Name                | Purpose                                      | Location                                       | Usage                                         | Dependencies        |
|---------------------|----------------------------------------------|------------------------------------------------|-----------------------------------------------|---------------------|
| Role                | Enum for particle roles (CORE, CONTROL, ATTACK, DEFENSE, MOVEMENT) | src/shared/types/core.ts                       | Defines roles for particles and traits in creature and trait domains | None                |
| Rarity              | Enum for trait rarities (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC) | src/shared/types/core.ts                       | Specifies rarity levels for traits and mutations in traits and evolution | None                |
| IBlockData          | Interface for Bitcoin block data (nonce, confirmations) | src/shared/types/core.ts                       | Standardizes block data for RNG seeding and evolution tracking | None                |
| IEvent              | Interface for event bus messages (type, payload) | src/shared/types/events.ts                     | Defines structure for inter-domain events via event bus | None                |
| IConfig             | Interface for application configuration (e.g., API URLs, settings) | src/shared/types/config.ts                     | Specifies configuration settings for services and components | None                |
| IRNGStream          | Interface for RNG stream properties (domain, seed) | src/shared/types/rng.ts                        | Defines structure for domain-specific RNG streams | None                |
| ICreature           | Interface for creature properties (id, particles, traits) | src/domains/creature/types/creature.ts         | Defines creature structure for models, services, and rendering | Role, Rarity, IParticle, IGroup |
| IParticle           | Interface for particle properties (id, position, role) | src/domains/creature/types/particle.ts         | Defines particle structure for rendering and physics calculations | Role                |
| IGroup              | Interface for particle group properties (id, particles) | src/domains/creature/types/group.ts            | Defines group structure for formations and rendering | IParticle           |
| IAbility            | Interface for ability trait properties (id, effect, rarity) | src/domains/traits/types/ability.ts            | Defines ability structure for trait assignment and logic | Rarity              |
| IFormation          | Interface for formation trait properties (id, pattern) | src/domains/traits/types/formation.ts          | Defines formation structure for particle positioning | None                |
| IBehavior           | Interface for behavior trait properties (id, dynamics) | src/domains/traits/types/behavior.ts           | Defines behavior structure for particle dynamics | None                |
| IVisual             | Interface for visual trait properties (id, color, glow) | src/domains/traits/types/visual.ts             | Defines visual structure for rendering effects | None                |
| IMutation           | Interface for mutation trait properties (id, effect, rarity) | src/domains/traits/types/mutation.ts           | Defines mutation structure for evolution processes | Rarity              |
| IBitcoinBlock       | Interface for Bitcoin block metadata (height, nonce, confirmations) | src/domains/bitcoin/types/bitcoin.ts           | Extends block data for Bitcoin service operations | IBlockData          |
| IInstancedRendering | Interface for instanced rendering configuration (mesh, count) | src/domains/rendering/types/instanced.ts       | Defines settings for instanced rendering in Three.js | None                |
| IShaderUniforms     | Interface for shader uniform properties (e.g., color, opacity) | src/domains/rendering/types/shaders.ts         | Defines uniform structures for shader management | None                |
| ILODConfig          | Interface for level of detail configuration (distance, geometry) | src/domains/rendering/types/lod.ts             | Defines LOD settings for optimized rendering | None                |
| IBufferGeometry     | Interface for buffer geometry properties (attributes, indices) | src/domains/rendering/types/buffers.ts         | Defines buffer structures for rendering particles | None                |
| IEvolution          | Interface for evolution properties (milestones, mutations) | src/domains/evolution/types/evolution.ts       | Defines evolution structure for milestone tracking | Rarity, IMutation   |
| IPayoffMatrix       | Interface for payoff matrix structure (roles, payoffs) | src/domains/gameTheory/types/payoffMatrix.ts   | Defines payoff matrix for game theory calculations | None                |
| IDecisionTree       | Interface for decision tree structure (nodes, outcomes) | src/domains/gameTheory/types/decisionTree.ts   | Defines decision tree for game logic | None                |
| INashEquilibrium    | Interface for Nash equilibrium properties (strategies, payoffs) | src/domains/gameTheory/types/nashEquilibrium.ts| Defines equilibrium for game calculations | None                |
| IUtilityFunction    | Interface for utility function properties (inputs, outputs) | src/domains/gameTheory/types/utilityFunction.ts| Defines utility functions for game logic | None                |
| IBattleOutcome      | Interface for battle outcome properties (winner, scores) | src/domains/gameTheory/types/battleOutcome.ts  | Defines battle outcomes for game theory | None                |
| IWorkerMessage      | Interface for worker message structure (type, data) | src/domains/workers/types/messages.ts          | Defines messages for worker communication | None                |
| IPhysicsWorker      | Interface for physics worker properties (task, parameters) | src/domains/workers/types/physics.ts           | Defines settings for physics workers | None                |
| IComputeWorker      | Interface for compute worker properties (task, parameters) | src/domains/workers/types/compute.ts           | Defines settings for compute workers | None                |
              |

## Additional Notes
- **Completeness**: The inventory includes all types specified in the `directory_map.md` under `src/shared/types/` and `src/domains/*/types/`, covering shared utilities and domain-specific needs. Additional shared types (`IEvent`, `IConfig`, `IRNGStream`) are inferred from files like `events.ts`, `config.ts`, and `rng.ts` to support cross-domain functionality.
- **Naming Conventions**: Type names use the `I` prefix for interfaces (e.g., `ICreature`) and descriptive names for enums (e.g., `Role`), following TypeScript best practices to avoid conflicts.
- **Dependencies**: Dependencies are listed based on logical relationships (e.g., `ICreature` includes `IParticle[]`, so it depends on `IParticle`). Shared types like `Role` and `Rarity` are foundational, with no dependencies.
- **Modularity**: Types are organized by domain to ensure encapsulation, with shared types accessible via `src/shared/types/` imports, preventing local redefinition.
- **Scalability**: New types can be added to existing `types/` directories or new domains without disrupting the structure, supporting future features like networking or AI.

## Key Citations
- [Bitcoin Protozoa Directory Map](attachment_id:1)
- [Bitcoin Protozoa Project Overview](attachment_id:2)
