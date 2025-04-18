# Data Flows

This document describes the data pipelines and flows in the Bitcoin Protozoa project.

## Overview

*This document is part of the Bitcoin Protozoa documentation.*

## Contents

<!-- Add table of contents here -->

## Details

<!-- Add detailed content here -->

## Related Documents

<!-- Add links to related documents here -->

## References

<!-- Add references here -->

To reconstruct the `data_flows.md` document for the Bitcoin Protozoa project, I’ll integrate the provided evolution milestone rules, Bitcoin integration details, and insights from the GitHub README, while incorporating our prior conversations (April 4–15, 2025) and your emphasis on simplicity, determinism, and on-chain deployment via the ordinals protocol. The document will live in `fresh/docs/architecture/data_flows.md`, as outlined in the proposed documentation structure, and serve as a clear guide for a coding AI to understand and implement the project’s data pipelines. I’ll ensure it reflects the current project state, resolves conflicts (e.g., fractional particle distributions), and emphasizes the critical points you’ve highlighted: using only nonce and confirmations from the ordinals.com API, single API calls without streaming, and deterministic evolution for on-chain recursive inscriptions.

The new `data_flows.md` will:
- **Detail Core Data Flows**: Map the pipeline from Bitcoin block data (nonce, confirmations) to creature generation, trait application, evolution, and rendering.
- **Incorporate Evolution Rules**: Embed the confirmation-based mutation milestones and guaranteed mutations, ensuring deterministic paths.
- **Emphasize Simplicity**: Highlight the use of only nonce and confirmations, single API calls, and no real-time confirmation updates, as specified.
- **Ensure AI Usability**: Use a structured Markdown format with metadata, code examples, and AI tasks for clarity and actionability.
- **Align with On-Chain Deployment**: Reflect the ordinals protocol context, focusing on deterministic, reproducible data flows for recursive inscriptions.
- **Resolve Conflicts**: Standardize role distributions (whole numbers, per April 12, 2025) and RNG implementation (`mulberry32`, per April 4, 2025).

I’ll generate the full `data_flows.md` as an artifact within the required `<xaiArtifact/>` tag, updating the artifact ID to match the previous `data_flows.md` (as it’s a revision) and ensuring it’s comprehensive and aligned with your vision. If you have additional details (e.g., specific API constraints, on-chain inscription mechanics), please clarify, and I’ll adjust accordingly.

---

### Approach to Reconstructing `data_flows.md`

#### Key Considerations
- **Project Context**: Bitcoin Protozoa generates particle-based creatures using Bitcoin block nonce as an RNG seed and confirmations for evolution milestones, deployed on-chain via ordinals protocol recursive inscriptions.
- **Data Flow Focus**: The pipeline is deliberately simple, using only nonce and confirmations from a single API call to `https://ordinals.com/r/blockinfo/${blockNumber}`, with no streaming or real-time updates.
- **Evolution Milestones**: Mutations occur at specific confirmation thresholds (10,000 to 1,000,000), with defined chances, rarity tiers, and guaranteed mutations (per your rules).
- **Determinism**: All processes (RNG, trait generation, evolution) are deterministic to ensure reproducible creatures for on-chain storage.
- **Conflicts Resolved**:
  - **Role Distribution**: Use whole-number particle counts (e.g., 20 CORE for 100 particles) to avoid fractional issues (April 12, 2025).
  - **RNG System**: Standardize on `mulberry32` seeded with nonce (April 4, 2025), ensuring consistency across flows.
- **AI Guidance**: Include explicit tasks (e.g., validate determinism, optimize caching) and code examples for a coding AI to implement and test.

#### Content Outline
- **Metadata**: Version, dependencies, related documents.
- **Overview**: Purpose of data flows, emphasizing simplicity and on-chain deployment.
- **Primary Data Flow**: Block fetching → RNG seeding → creature generation → trait application → rendering.
- **Evolution Data Flow**: Confirmation checks → mutation triggers → trait updates.
- **Data Flow Diagram**: Visual representation of the pipeline.
- **Notes**: AI tasks, known issues, and next steps.

---

### Reconstructed `data_flows.md`


# Bitcoin Protozoa Data Flows

## Metadata
- **Version**: v1.0.0
- **Last Updated**: 2025-04-17
- **Dependencies**: `src/services/bitcoin`, `src/lib/rngSystem`, `src/services/traits`, `src/services/creatures`, `src/services/particles`, `src/services/evolution`, `src/components/ParticleRenderer`
- **Related Documents**: `overview.md`, `bitcoin_service.md`, `rng_system.md`, `trait_system.md`, `particle_system.md`, `evolution_tracker.md`, `rendering_system.md`

## Overview
This document details the data flows in Bitcoin Protozoa, a particle-based life simulation that uses Bitcoin block data (nonce and confirmations) to generate and evolve creatures, deployed on-chain via recursive inscriptions using the ordinals protocol. The flows are designed for simplicity and determinism, using a single API call to `https://ordinals.com/r/blockinfo/${blockNumber}` without streaming or real-time confirmation updates. The nonce seeds a deterministic RNG for creature generation, while confirmations trigger rare evolution events at predefined milestones. This ensures reproducible creatures suitable for on-chain storage.

### Key Principles
- **Simplicity**: Only nonce and confirmations are used from block data, ignoring all other fields (e.g., hash, timestamp).
- **Single API Call**: Block data is fetched once per block number, with no continuous confirmation updates.
- **Determinism**: All processes (RNG, traits, evolution) are deterministic for on-chain reproducibility.
- **On-Chain Deployment**: Data flows support recursive inscriptions via the ordinals protocol, ensuring minimal data dependencies.

### Data Flows
1. **Primary Flow**: Generates a creature from block data to rendered visuals.
2. **Evolution Flow**: Triggers mutations based on confirmation milestones.

## Primary Data Flow

### 1. Bitcoin Block Fetching
- **Service**: `BitcoinService` (`src/services/bitcoin/bitcoinService.ts`)
- **Input**: User-specified block number (0 ≤ number ≤ 1,000,000)
- **Processing**:
  - Fetch block data from `https://ordinals.com/r/blockinfo/${blockNumber}`.
  - Extract **only** nonce (32-bit number) and confirmations.
  - Cache data in IndexedDB with 1-hour expiry for performance.
  - Validate: block number is integer, confirmations ≥ 0.
  - Use mock data for testing if API fails.
- **Output**: `{ nonce: number, confirmations: number }`
- **Example**:
  ```typescript
  const bitcoinService = new BitcoinService();
  const blockData = await bitcoinService.fetchBlockData(800000);
  // Returns: { nonce: 1765503561, confirmations: 25000 }
  ```

### 2. RNG Seeding
- **Service**: `RNGSystem` (`src/lib/rngSystem.ts`)
- **Input**: Block nonce
- **Processing**:
  - Seed `mulberry32` PRNG with nonce for deterministic random values.
  - Create streams for domains: `particles`, `traits`, `evolution`.
- **Output**: RNG streams (`particlesStream`, `traitsStream`, `evolutionStream`)
- **Example**:
  ```typescript
  import { createRNGFromBlock } from '../../lib/rngSystem';
  const rngSystem = createRNGFromBlock(blockData.nonce);
  const particlesStream = rngSystem.getStream('particles');
  ```

### 3. Creature Generation
- **Service**: `CreatureGenerator` (`src/services/creatures/creatureGenerator.ts`)
- **Input**: `particlesStream`, particle count (50–250)
- **Processing**:
  - Determine particle count using `particlesStream` (uniform distribution).
  - Assign roles with whole-number distribution:
    - CORE: 20% (e.g., 20 for 100 particles)
    - CONTROL: 15% (15)
    - ATTACK: 25% (25)
    - DEFENSE: 20% (20)
    - MOVEMENT: 20% (20)
  - Set tier based on particle count:
    | Particles | Tier   |
    |-----------|--------|
    | <90       | TIER_1 |
    | 90–119    | TIER_2 |
    | 120–149   | TIER_3 |
    | 150–179   | TIER_4 |
    | 180–199   | TIER_5 |
    | ≥200      | TIER_6 |
- **Output**: Creature object with particle group and roles.
- **Example**:
  ```typescript
  const creatureGenerator = new CreatureGenerator();
  const creature = creatureGenerator.generateCreature(particlesStream, blockData);
  ```

### 4. Trait Generation and Application
- **Service**: `TraitService` (`src/services/traits/traitService.ts`)
- **Input**: `traitsStream`, creature
- **Processing**:
  - Generate traits (VISUAL, FORMATION, BEHAVIOR) with rarity probabilities:
    - COMMON: 50%
    - UNCOMMON: 30%
    - RARE: 15%
    - EPIC: 4%
    - LEGENDARY: 0.9%
    - MYTHIC: 0.1%
  - Apply traits to particle group, affecting appearance, arrangement, and behavior.
- **Output**: Creature with applied traits.
- **Example**:
  ```typescript
  const traitService = getTraitService();
  const traits = traitService.generateTraits(traitsStream);
  traitService.applyTraitsToGroup(creature.particles, traits);
  ```

### 5. Rendering
- **Component**: `ParticleRenderer` (`src/components/ParticleRenderer/ParticleRenderer.tsx`)
- **Input**: Creature’s particle group with traits
- **Processing**:
  - Use Three.js with instanced rendering for efficiency.
  - Apply VISUAL traits (e.g., color, glow) via custom shaders.
  - Set up scene with PerspectiveCamera (fov 75, near 0.1, far 1000), AmbientLight, DirectionalLight, and OrbitControls.
- **Output**: Rendered 3D creature.
- **Example**:
  ```typescript
  const renderer = new ParticleRenderer();
  renderer.render(creature.particles);
  ```

## Evolution Data Flow

### 1. Confirmation Check
- **Service**: `EvolutionTracker` (`src/services/evolution/evolutionTracker.ts`)
- **Input**: Block confirmations, creature ID
- **Processing**:
  - Check confirmations against milestones:
    | Confirmations | Mutation Chance | Rarity Tiers               | Guaranteed Mutation (First Time) |
    |---------------|-----------------|----------------------------|----------------------------------|
    | 10,000        | 1%              | Common                     | None                             |
    | 25,000        | None            | None                       | Common (80%), Uncommon (20%)     |
    | 50,000        | 5%              | Common, Uncommon           | Uncommon (85%), Rare (15%)       |
    | 100,000       | 10%             | Common, Uncommon, Rare     | Rare (90%), Epic (10%)           |
    | 250,000       | 25%             | Uncommon, Rare, Epic       | Epic (90%), Legendary (10%)      |
    | 500,000       | 50%             | Rare, Epic, Legendary      | Legendary (95%), Mythic (5%)     |
    | 1,000,000     | 100%            | Epic, Legendary, Mythic    | Mythic (100%)                    |
  - Mutation counts: Common (80), Uncommon (60), Rare (40), Epic (16), Legendary (3), Mythic (1).
- **Output**: Mutation eligibility and rarity tier.
- **Example**:
  ```typescript
  const evolutionTracker = getEvolutionTracker();
  const milestone = evolutionTracker.checkMilestone(blockData.confirmations);
  ```

### 2. Mutation Trigger
- **Service**: `EvolutionTracker`
- **Input**: `evolutionStream`, milestone, creature
- **Processing**:
  - For guaranteed mutations (first time at 25,000, 50,000, etc.), apply mutation with specified rarity weights.
  - For chance-based mutations, use `evolutionStream` to determine if mutation occurs.
  - Select mutation from available rarity tier, preserving creature identity (e.g., core traits retained).
  - Store evolution history in `localStorage`.
- **Output**: Updated creature traits.
- **Example**:
  ```typescript
  if (milestone.guaranteed) {
    evolutionTracker.applyGuaranteedMutation(creature, milestone.rarityWeights, evolutionStream);
  } else if (evolutionTracker.shouldMutate(milestone.chance, evolutionStream)) {
    evolutionTracker.applyMutation(creature, milestone.rarityTiers, evolutionStream);
  }
  ```

## Data Flow Diagram
```
Bitcoin Block Data (nonce, confirmations)
        |
        v
RNG Seeding (mulberry32)
        |
        v
Creature Generation (particles, roles)
        |
        v
Trait Generation & Application
        |
        v
Rendering (Three.js)
        |
        v (if confirmations hit milestone)
Evolution Check & Mutation
```

## Notes
- **AI Tasks**:
  - Validate determinism by generating creatures for the same block number multiple times and comparing outputs.
  - Implement caching logic in `BitcoinService` to store nonce and confirmations in IndexedDB.
  - Add unit tests for `EvolutionTracker` to verify guaranteed and chance-based mutations.
  - Optimize `ParticleRenderer` for 250 particles using instanced meshes and LOD.
- **Known Issues**:
  - API failures may disrupt block fetching; ensure robust fallback to mock data.
  - Evolution rarity weights may need balancing to prevent overpowered creatures.
- **Next Steps**:
  - Integrate on-chain storage of creature data via ordinals protocol recursive inscriptions.
  - Add logging for data flow steps to aid debugging.
  - Explore game theory mechanics for creature interactions (e.g., PvP battles).



---

### Integration with Past Conversations
The reconstructed `data_flows.md` draws on our prior discussions:
- **April 4, 2025**: Your focus on `mulberry32` and `/bitcoin/03_rng_system.md` informs the RNG seeding step, using nonce for determinism.
- **April 6–7, 2025**: Your emphasis on particle roles (CORE, CONTROL, ATTACK, DEFENSE, MOVEMENT) and implementation phases shapes the creature generation flow, with whole-number distributions.
- **April 10, 2025**: Your description of the trait system (VISUAL, FORMATION, BEHAVIOR; COMMON to MYTHIC) and technical stack (Three.js, custom physics) is reflected in the trait and rendering steps.
- **April 12, 2025**: Your concern about fractional particle distributions is resolved with whole-number role assignments (e.g., 20 CORE for 100 particles).
- **April 14, 2025**: Your request for rendering optimization (instanced rendering, Web Workers) informs the rendering flow’s efficiency focus.
- **April 15, 2025**: Your push for an A+ grade and AI bot tasks (e.g., unit tests, error handling) shapes the AI tasks and robust error handling in the flow.

### Alignment with Provided Documents
- **Evolution Milestone Rules**: Fully incorporated, with mutation chances, rarity tiers, and guaranteed mutations detailed in the evolution flow.
- **Bitcoin Integration**: Emphasizes using only nonce and confirmations from `https://ordinals.com/r/blockinfo/${blockNumber}`, single API calls, and ordinals protocol context for on-chain deployment.
- **GitHub README**: Reflects the project’s structure (`src/`, `traits/`, `docs/`), systems (particle, trait, evolution, rendering), and integration points (RNG to traits), with updated role distributions and deterministic flows.

### Conflict Resolution
- **Role Distribution**: Standardized to whole numbers (20 CORE, 15 CONTROL, etc., for 100 particles) to avoid fractional issues.
- **RNG System**: Unified around `mulberry32` with nonce seeding, aligning with your April 4, 2025, clarification.
- **Evolution Triggers**: Clarified that confirmations are checked once at creature generation, with no streaming, per your emphasis on simplicity.

### Next Steps and Clarifications
This `data_flows.md` provides a comprehensive, up-to-date guide for the project’s data pipelines. To proceed:
1. **Review Content**: Confirm if the flow captures all critical steps or if you want to add details (e.g., specific inscription mechanics, game theory flows).
2. **Prioritize Next Documents**: Indicate which `docs/` files to write next (e.g., `rng_system.md`, `evolution_tracker.md`) or request updates to others.
3. **Specify On-Chain Details**: Provide more context on recursive inscriptions (e.g., data format, storage limits) for deeper integration.
4. **AI Tasks**: Clarify if the coding AI needs specific outputs (e.g., test scripts, flow diagrams) or additional tasks.
5. **Additional Artifacts**: Request supporting materials (e.g., a script to test the flow, a flowchart image) if needed.

