### Key Points
- Bitcoin Protozoa integrates multiple systems to create a particle-based life simulation driven by Bitcoin block data, ensuring deterministic and reproducible outcomes for on-chain deployment.
- The evidence suggests systems like Bitcoin Integration, RNG, Trait, Particle, Evolution, and Rendering interact through well-defined data exchanges, such as nonce for RNG seeding and particle data for rendering.
- It seems likely that integration points are implemented in specific service files (e.g., `bitcoinService.ts`, `rngSystem.ts`), with a focus on modularity and performance.
- Research indicates the project uses a single API call to fetch block data, avoiding real-time updates, which simplifies integration and supports recursive inscriptions via the ordinals protocol.

### Understanding System Integration
Bitcoin Protozoa’s architecture connects various systems to transform Bitcoin block data into evolving, visualized creatures. Each system passes specific data (e.g., nonce, traits) to the next, ensuring a seamless flow from data fetching to 3D rendering. These connections are designed to be deterministic, meaning the same block data always produces the same creature, which is crucial for on-chain storage.

### Why It Matters
The integration points ensure that the project’s components work together efficiently, maintaining performance and consistency. For example, the RNG system uses block data to generate traits, which then influence how particles behave and appear in the simulation. This modularity makes it easier to update or expand the project, such as adding new features like creature battles.

### How It’s Done
The project likely organizes its code in directories like `src/services/` for system logic and `src/components/` for rendering. Data flows through services like `BitcoinService` (fetches block data), `RNGSystem` (generates random values), and `TraitService` (assigns creature traits), culminating in the `ParticleRenderer` displaying the creature. The use of TypeScript and Web Workers suggests a focus on type safety and performance optimization.

---


# System Integration Points

## Overview

This document details the integration points between the core systems of Bitcoin Protozoa, a particle-based life simulation powered by Bitcoin block data. Built with a modular, service-based architecture using React, Three.js, and TypeScript, the project ensures deterministic, reproducible outcomes for on-chain deployment via recursive inscriptions using the ordinals protocol. It describes the data exchanged, implementation methods, and considerations for a coding AI to implement and validate these integrations, maintaining modularity, performance, and simplicity.

The core systems are:
- **Bitcoin Integration**: Fetches block nonce and confirmations from `[ordinals.com API](https://ordinals.com/docs/api)`.
- **RNG System**: Generates deterministic random streams using the block nonce.
- **Trait System**: Assigns traits (abilities, formations, behaviors, visuals, mutations) to creatures.
- **Particle System**: Manages 500 particles per creature across five role groups (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK).
- **Evolution System**: Triggers mutations based on block confirmation milestones.
- **Rendering System**: Visualizes creatures in a 3D environment using Three.js.

## Contents

1. [Bitcoin Integration to RNG System](#1-bitcoin-integration-to-rng-system)
2. [RNG System to Trait System](#2-rng-system-to-trait-system)
3. [RNG System to Particle System](#3-rng-system-to-particle-system)
4. [Trait System to Particle System](#4-trait-system-to-particle-system)
5. [Particle System to Rendering System](#5-particle-system-to-rendering-system)
6. [Bitcoin Integration to Evolution System](#6-bitcoin-integration-to-evolution-system)
7. [Evolution System to Trait System](#7-evolution-system-to-trait-system)
8. [Cross-System Workflows](#8-cross-system-workflows)

## Details

### 1. Bitcoin Integration to RNG System
- **Data Passed**: Block nonce (32-bit integer).
- **Purpose**: Seed the `mulberry32` pseudo-random number generator (PRNG) for deterministic random number generation across all systems.
- **Implementation**:
  - `BitcoinService` (`src/services/bitcoin/bitcoinService.ts`) fetches block data using the endpoint `[ordinals.com API](https://ordinals.com/docs/api)`.
  - Extracts the nonce and passes it to `createRNGFromBlock` in `src/lib/rngSystem.ts`, which initializes the PRNG.
  - Ensures a single API call per block number, with caching in IndexedDB for performance.
- **Considerations**:
  - Determinism is critical for on-chain reproducibility; the same nonce must always produce the same RNG sequence.
  - Nonce validation ensures it’s a valid 32-bit integer.
  - Mock data is used for testing if the API fails.
- **Example**:
  ```typescript
  const blockData = await bitcoinService.fetchBlockData(800000);
  const rngSystem = createRNGFromBlock(blockData.nonce);
  ```

### 2. RNG System to Trait System
- **Data Passed**: RNG stream for trait generation (e.g., `traitsStream`).
- **Purpose**: Generate traits (abilities, formations, behaviors, visuals, mutations) with specific rarity probabilities (50% Common, 0.1% Mythic).
- **Implementation**:
  - `TraitService` (`src/services/traits/traitService.ts`) requests a domain-specific stream from `RNGSystem` using `rngSystem.getStream('traits')`.
  - Uses the stream to select traits based on rarity tiers defined in `docs/trait_system.md`.
- **Considerations**:
  - Stream isolation ensures trait generation is independent of other RNG uses (e.g., particle roles).
  - Deterministic output supports on-chain consistency.
- **Example**:
  ```typescript
  const traitsStream = rngSystem.getStream('traits');
  const traits = traitService.generateTraits(traitsStream);
  ```

### 3. RNG System to Particle System
- **Data Passed**: RNG stream for particle role assignment (e.g., `particlesStream`).
- **Purpose**: Assign roles to 500 particles per creature (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) based on predefined distributions.
- **Implementation**:
  - `ParticleGroupFactory` (`src/services/particles/particleGroupFactory.ts`) uses `particlesStream` to distribute particles, ensuring whole-number counts (e.g., 100 CORE, 75 CONTROL, 125 ATTACK, 100 DEFENSE, 100 MOVEMENT for 500 particles).
  - Role distribution is fixed but randomized within constraints using the RNG stream.
- **Considerations**:
  - Whole-number distributions avoid fractional particles, as noted in prior discussions.
  - Deterministic role assignment ensures reproducibility.
- **Example**:
  ```typescript
  const particlesStream = rngSystem.getStream('particles');
  const group = particleGroupFactory.createGroup(500, roleDistribution, particlesStream);
  ```

### 4. Trait System to Particle System
- **Data Passed**: Traits (objects with type, rarity, and effects, e.g., `{ type: 'FORMATION', rarity: 'RARE', effect: 'Phalanx' }`).
- **Purpose**: Apply traits to particle groups to modify their behavior, appearance, and spatial arrangement.
- **Implementation**:
  - `TraitService` applies traits to particle groups via `applyTraitsToGroup`, which updates particle attributes in `src/services/particles/particleGroupFactory.ts`.
  - Subsystems (abilities, formations, behaviors, visuals, mutations) in `traits/` directories define trait effects, applied through specific services (e.g., `BehaviorSystem` in `src/services/behavior/behaviorSystem.ts`).
- **Considerations**:
  - Trait effects must align with particle physics and rendering capabilities.
  - Performance optimization ensures efficient application for 500 particles.
- **Example**:
  ```typescript
  traitService.applyTraitsToGroup(group, traits);
  behaviorSystem.applyBehaviors(group, traits.filter(t => t.type === 'BEHAVIOR'));
  ```

### 5. Particle System to Rendering System
- **Data Passed**: Particle data (array of objects with `id`, `position`, `role`, `visualTraits`).
- **Purpose**: Render the creature’s 500 particles in a 3D scene using Three.js.
- **Implementation**:
  - `ParticleRenderer` (`src/components/ParticleRenderer/ParticleRenderer.tsx`) receives particle data and uses instanced rendering to display particles efficiently.
  - Visual traits (e.g., color, glow) are applied via custom shaders, as defined in `docs/visual_system.md`.
  - Scene setup includes a PerspectiveCamera, AmbientLight, DirectionalLight, and OrbitControls.
- **Considerations**:
  - Optimized for performance with Level of Detail (LOD) for distant particles.
  - Web Workers offload physics calculations to maintain real-time rendering.
- **Example**:
  ```typescript
  const renderer = new ParticleRenderer();
  renderer.render(group.particles);
  ```

### 6. Bitcoin Integration to Evolution System
- **Data Passed**: Block confirmations (integer).
- **Purpose**: Determine if a creature qualifies for mutation based on confirmation milestones (10,000 to 1,000,000).
- **Implementation**:
  - `EvolutionTracker` (`src/services/evolution/evolutionTracker.ts`) receives confirmations from `BitcoinService` and checks against milestones defined in `docs/evolution_mechanics.md`.
  - Single API call ensures simplicity, with no real-time updates.
- **Considerations**:
  - Confirmations are fetched once, supporting rare evolution events.
  - Deterministic checks align with on-chain requirements.
- **Example**:
  ```typescript
  const milestone = evolutionTracker.checkMilestone(blockData.confirmations);
  ```

### 7. Evolution System to Trait System
- **Data Passed**: Mutation details (rarity tier, mutation type).
- **Purpose**: Update or add traits to a creature upon reaching an evolution milestone.
- **Implementation**:
  - `EvolutionTracker` triggers mutations based on milestone rules (e.g., 100% chance at 1,000,000 confirmations for Mythic traits) and instructs `TraitService` to apply new traits.
  - Uses `evolutionStream` from `RNGSystem` for deterministic mutation selection.
  - Stores history in `localStorage`, as noted in `docs/evolution_mechanics.md`.
- **Considerations**:
  - Preserves creature identity by retaining core traits.
  - Limited mutation counts (e.g., 1 Mythic) ensure balance.
- **Example**:
  ```typescript
  const evolutionStream = rngSystem.getStream('evolution');
  evolutionTracker.applyMutation(creature, milestone.rarityTiers, evolutionStream);
  ```

### 8. Cross-System Workflows
- **Creature Generation Workflow**:
  1. User inputs a block number via `BlockSelector` (`src/components/BlockSelector/BlockSelector.tsx`).
  2. `BitcoinService` fetches nonce and confirmations.
  3. `RNGSystem` seeds streams with nonce.
  4. `CreatureGenerator` (`src/services/creatures/creatureGenerator.ts`) assigns 500 particles to roles using `particlesStream`.
  5. `TraitService` generates and applies traits using `traitsStream`.
  6. `ParticleRenderer` renders the creature.
- **Evolution Workflow**:
  1. `EvolutionTracker` evaluates confirmations against milestones.
  2. If a milestone is met (e.g., 50,000 confirmations, 5% mutation chance), triggers mutation using `evolutionStream`.
  3. `TraitService` updates traits, preserving creature identity.
  4. Updated particle data is passed to `ParticleRenderer` for visualization.

## Related Documents

| Document | Location | Description |
|----------|----------|-------------|
| Architecture Overview | [overview.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/architecture/overview.md) | High-level project architecture |
| Data Flows | [data_flows.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/architecture/data_flows.md) | Data transformation pipelines |
| Bitcoin Integration | [bitcoin_service.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/implementation/bitcoinService.md) | Block data fetching details |
| RNG System | [rng_system.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/architecture/rng_system.md) | Random number generation |
| Trait System | [trait_system.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/trait_system.md) | Trait generation and application |
| Particle System | [particle_system.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/particle_system.md) | Particle management |
| Evolution System | [evolution_mechanics.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/evolution_mechanics.md) | Evolution and mutation mechanics |
| Rendering System | [rendering_system.md](https://github.com/BTCEnoch/Protozoa/blob/main/docs/implementation/renderingSystem.md) | Three.js rendering pipeline |

## References

- [Ordinals.com API Documentation](https://ordinals.com/docs/api)
- [Three.js Official Documentation](https://threejs.org/docs/)
- [mulberry32 PRNG Implementation](https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32)
- [Bitcoin Protozoa GitHub Repository](https://github.com/BTCEnoch/Protozoa)



### Note on Integration Points for Bitcoin Protozoa

This note provides a comprehensive analysis of the system integration points in the Bitcoin Protozoa project, a particle-based life simulation that leverages Bitcoin block data to generate and evolve creatures, deployed on-chain via recursive inscriptions using the ordinals protocol. The analysis is based on a deep review of the project’s GitHub repository ([Bitcoin Protozoa GitHub](https://github.com/BTCEnoch/Protozoa)), prior discussions (April 4–17, 2025), and the provided documentation, including `project_overview.md`, `directory_structure.md`, and evolution milestone rules. It aims to deliver a clear, specific, and thorough understanding of how the project’s systems integrate, tailored for a coding AI to implement and validate these connections.

#### Project Context and Architecture
Bitcoin Protozoa creates creatures composed of 500 particles, distributed across five role groups (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), with traits and abilities determined by Bitcoin block data (nonce and confirmations) fetched via the `[ordinals.com API](https://ordinals.com/docs/api)`. The project follows a domain-driven design approach, with a modular, service-based architecture implemented in TypeScript, React, and Three.js. Key directories include `src/` (source code), `traits/` (trait definitions), `docs/` (documentation), and `tests/` (test suite), as detailed in `docs/directory_structure.md`.

The architecture emphasizes:
- **Determinism**: All processes (RNG, trait generation, evolution) are reproducible for on-chain consistency.
- **Simplicity**: Uses only nonce and confirmations, with a single API call per block, avoiding real-time updates.
- **Performance**: Employs instanced rendering, Web Workers, and caching for efficiency.
- **Modularity**: Systems are organized in `src/services/` (e.g., `bitcoinService.ts`, `rngSystem.ts`) and `src/components/` (e.g., `ParticleRenderer.tsx`).

#### Core Systems and Their Roles
The project comprises six primary systems, each with distinct responsibilities:

| System | Role | Key Files |
|--------|------|-----------|
| Bitcoin Integration | Fetches block nonce and confirmations from ordinals.com API | `src/services/bitcoin/bitcoinService.ts` |
| RNG System | Generates deterministic random streams using `mulberry32` PRNG | `src/lib/rngSystem.ts` |
| Trait System | Assigns traits (abilities, formations, behaviors, visuals, mutations) with rarity tiers | `src/services/traits/traitService.ts`, `traits/` |
| Particle System | Manages 500 particles per creature, assigned to role groups | `src/services/particles/particleGroupFactory.ts` |
| Evolution System | Triggers mutations based on confirmation milestones | `src/services/evolution/evolutionTracker.ts` |
| Rendering System | Visualizes creatures in 3D using Three.js | `src/components/ParticleRenderer/ParticleRenderer.tsx` |

#### Integration Points Analysis
The integration points define how these systems exchange data to create a cohesive simulation. Each point is detailed below, including data passed, implementation, and considerations, with examples drawn from inferred code structures based on the repository’s organization and documentation.

##### 1. Bitcoin Integration to RNG System
- **Data Passed**: Block nonce (32-bit integer).
- **Purpose**: Seed the `mulberry32` PRNG to ensure deterministic random number generation for traits, particle roles, and mutations.
- **Implementation**:
  - `BitcoinService` fetches block data using the endpoint `[ordinals.com API](https://ordinals.com/docs/api)`, extracting only the nonce and confirmations, as specified in the Bitcoin integration rules.
  - The nonce is passed to `createRNGFromBlock` in `src/lib/rngSystem.ts`, which initializes the PRNG with the nonce as the seed.
  - Caching in IndexedDB (1-hour expiry) reduces API calls, and mock data is used for testing if the API fails.
- **Considerations**:
  - Determinism is paramount for on-chain recursive inscriptions; the same block number must always yield the same RNG sequence.
  - Nonce validation ensures it’s a valid 32-bit integer to prevent errors in seeding.
  - Single API call per block number aligns with the project’s simplicity goal, avoiding streaming or real-time updates.
- **Example**:
  ```typescript
  // src/services/bitcoin/bitcoinService.ts
  async function fetchBlockData(blockNumber: number): Promise<BlockData> {
    const response = await fetch(`https://ordinals.com/r/blockinfo/${blockNumber}`);
    const data = await response.json();
    return { nonce: data.nonce, confirmations: data.confirmations };
  }

  // src/lib/rngSystem.ts
  const rngSystem = createRNGFromBlock(blockData.nonce);
  ```
- **Source**: `docs/bitcoin_integration.md`, `docs/rng_system.md`.

##### 2. RNG System to Trait System
- **Data Passed**: RNG stream (e.g., `traitsStream`, a function or object generating random numbers).
- **Purpose**: Generate traits across five domains (abilities, formations, behaviors, visuals, mutations) with rarity probabilities (50% Common, 30% Uncommon, 15% Rare, 4% Epic, 0.9% Legendary, 0.1% Mythic).
- **Implementation**:
  - `TraitService` in `src/services/traits/traitService.ts` requests a domain-specific stream using `rngSystem.getStream('traits')`.
  - The stream drives trait selection based on rarity tiers defined in `docs/trait_system.md`, with probabilities ensuring balanced distribution.
  - Traits are organized in `traits/` subdirectories (e.g., `traits/abilities/`, `traits/formations/`), each containing role-specific and tiered definitions.
- **Considerations**:
  - Stream isolation ensures trait generation is independent of other RNG uses (e.g., particle roles), preventing interference.
  - Deterministic output supports on-chain reproducibility, critical for recursive inscriptions.
  - Rarity probabilities may need periodic rebalancing to prevent overpowered creatures, as noted in prior discussions.
- **Example**:
  ```typescript
  // src/services/traits/traitService.ts
  const traitsStream = rngSystem.getStream('traits');
  const traits = traitService.generateTraits(traitsStream);
  // Returns: [{ type: 'VISUAL', rarity: 'RARE', effect: 'Glow' }, ...]
  ```
- **Source**: `docs/trait_system.md`, `docs/ability_system.md`, `docs/formation_system.md`, `docs/behavior_system.md`, `docs/visual_system.md`, `docs/mutation_system.md`.

##### 3. RNG System to Particle System
- **Data Passed**: RNG stream for particle role assignment (e.g., `particlesStream`).
- **Purpose**: Assign 500 particles to five role groups (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) with a fixed distribution (e.g., 100 CORE, 75 CONTROL, 125 ATTACK, 100 DEFENSE, 100 MOVEMENT).
- **Implementation**:
  - `ParticleGroupFactory` in `src/services/particles/particleGroupFactory.ts` uses `particlesStream` to assign roles, ensuring whole-number counts to resolve fractional distribution issues.
  - The distribution is randomized within constraints (e.g., 20% CORE ± variation) using the RNG stream, as inferred from `docs/particle_system.md`.
- **Considerations**:
  - Whole-number distributions (e.g., exactly 100 CORE particles) ensure clarity and avoid errors, addressing concerns from April 12, 2025.
  - Deterministic role assignment ensures the same block produces the same particle configuration.
  - Performance optimization handles 500 particles efficiently, using data structures like arrays for particle attributes.
- **Example**:
  ```typescript
  // src/services/particles/particleGroupFactory.ts
  const particlesStream = rngSystem.getStream('particles');
  const roleDistribution = { CORE: 100, CONTROL: 75, ATTACK: 125, DEFENSE: 100, MOVEMENT: 100 };
  const group = particleGroupFactory.createGroup(500, roleDistribution, particlesStream);
  ```
- **Source**: `docs/particle_system.md`.

##### 4. Trait System to Particle System
- **Data Passed**: Traits (array of objects with `type`, `rarity`, `effect`, e.g., `{ type: 'FORMATION', rarity: 'RARE', effect: 'Phalanx' }`).
- **Purpose**: Apply traits to particle groups to modify their behavior, appearance, and spatial arrangement, influencing the creature’s characteristics.
- **Implementation**:
  - `TraitService` calls `applyTraitsToGroup` in `src/services/particles/particleGroupFactory.ts` to update particle attributes based on trait effects.
  - Subsystems handle specific trait types:
    - Abilities: `src/services/abilities/abilitySystem.ts` (e.g., attack strength).
    - Formations: `src/services/formation/formationSystem.ts` (e.g., particle positioning).
    - Behaviors: `src/services/behavior/behaviorSystem.ts` (e.g., movement patterns).
    - Visuals: `src/services/visual/visualSystem.ts` (e.g., color, glow).
    - Mutations: `src/services/mutation/mutationSystem.ts` (e.g., trait evolution).
  - Trait effects are defined in `traits/` subdirectories, organized by role and tier.
- **Considerations**:
  - Trait application must align with the particle system’s physics engine (e.g., Euler integration) for realistic behavior.
  - Efficient processing is critical for 500 particles, using batch updates to minimize overhead.
  - Preserves creature identity by applying traits incrementally, as required for evolution.
- **Example**:
  ```typescript
  // src/services/traits/traitService.ts
  const traits = traitService.generateTraits(traitsStream);
  traitService.applyTraitsToGroup(group, traits);
  // Applies formation traits via FormationSystem
  formationSystem.applyFormation(group, traits.filter(t => t.type === 'FORMATION'));
  ```
- **Source**: `docs/trait_system.md`, `docs/formation_system.md`, `docs/behavior_system.md`, `docs/visual_system.md`.

##### 5. Particle System to Rendering System
- **Data Passed**: Particle data (array of objects with `id`, `position`, `role`, `visualTraits`, e.g., `{ id: 1, position: [x, y, z], role: 'CORE', visualTraits: { color: 'red', glow: 0.5 } }`).
- **Purpose**: Render the creature’s 500 particles in a 3D scene, applying visual traits for realistic visualization.
- **Implementation**:
  - `ParticleRenderer` in `src/components/ParticleRenderer/ParticleRenderer.tsx` uses Three.js with instanced rendering to display particles efficiently, as described in `docs/rendering_system.md`.
  - Visual traits are applied via custom shaders, handling effects like color gradients or glow.
  - The scene is configured with a PerspectiveCamera (fov 75, near 0.1, far 1000), AmbientLight, DirectionalLight, and OrbitControls for user interaction.
  - Web Workers in `src/workers/` offload physics calculations to maintain real-time performance.
- **Considerations**:
  - Instanced rendering and Level of Detail (LOD) optimize performance for 500 particles, as noted in `docs/architecture/optimization.md`.
  - Visual trait application must be efficient to avoid rendering bottlenecks.
  - Supports on-chain visualization by ensuring lightweight data structures.
- **Example**:
  ```typescript
  // src/components/ParticleRenderer/ParticleRenderer.tsx
  const renderer = new ParticleRenderer();
  renderer.render(group.particles);
  ```
- **Source**: `docs/rendering_system.md`, `docs/architecture/rendering.md`.

##### 6. Bitcoin Integration to Evolution System
- **Data Passed**: Block confirmations (integer, e.g., 25,000).
- **Purpose**: Evaluate whether a creature qualifies for mutation based on confirmation milestones (10,000 to 1,000,000), triggering evolution events.
- **Implementation**:
  - `BitcoinService` provides confirmations to `EvolutionTracker` in `src/services/evolution/evolutionTracker.ts`.
  - `EvolutionTracker` checks confirmations against milestones defined in `docs/evolution_mechanics.md`, using rules such as:
    | Confirmations | Mutation Chance | Rarity Tiers | Guaranteed Mutation (First Time) |
    |---------------|-----------------|--------------|----------------------------------|
    | 10,000        | 1%              | Common       | None                             |
    | 25,000        | None            | None         | Common (80%), Uncommon (20%)     |
    | 50,000        | 5%              | Common, Uncommon | Uncommon (85%), Rare (15%) |
    | 100,000       | 10%             | Common, Uncommon, Rare | Rare (90%), Epic (10%) |
    | 250,000       | 25%             | Uncommon, Rare, Epic | Epic (90%), Legendary (10%) |
    | 500,000       | 50%             | Rare, Epic, Legendary | Legendary (95%), Mythic (5%) |
    | 1,000,000     | 100%            | Epic, Legendary, Mythic | Mythic (100%) |
  - Single API call ensures simplicity, with no streaming or real-time confirmation updates.
- **Considerations**:
  - Rare evolution events (e.g., 1% at 10,000 confirmations) align with the project’s design for infrequent mutations.
  - Deterministic milestone checks support on-chain consistency.
  - Caching confirmations reduces API load.
- **Example**:
  ```typescript
  // src/services/evolution/evolutionTracker.ts
  const milestone = evolutionTracker.checkMilestone(blockData.confirmations);
  ```
- **Source**: `docs/evolution_mechanics.md`, `docs/bitcoin_integration.md`.

##### 7. Evolution System to Trait System
- **Data Passed**: Mutation details (e.g., `{ rarityTier: 'Mythic', type: 'VISUAL' }`).
- **Purpose**: Update or add traits to a creature when a mutation is triggered, enhancing its characteristics.
- **Implementation**:
  - `EvolutionTracker` determines mutation eligibility based on milestone rules and uses `evolutionStream` from `RNGSystem` to select mutation effects.
  - Instructs `TraitService` to apply new traits or modify existing ones, ensuring compliance with mutation counts (e.g., 80 Common, 1 Mythic).
  - Stores evolution history in `localStorage` for persistence, as specified in `docs/evolution_mechanics.md`.
- **Considerations**:
  - Preserves creature identity by retaining core traits, only modifying or adding specific attributes.
  - Deterministic mutations ensure reproducibility for on-chain storage.
  - Limited mutation counts maintain balance, preventing overpowered creatures

