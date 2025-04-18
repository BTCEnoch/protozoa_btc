# Bitcoin Protozoa Architecture Overview

## Metadata
- **Version**: v1.0.0
- **Last Updated**: 2025-04-17
- **Dependencies**: React 18.2.0, Three.js 0.162.0, @react-three/fiber, TypeScript, ordinals.com API
- **Related Documents**: `rng_system.md`, `bitcoin_service.md`, `particle_system.md`, `trait_system.md`, `evolution_tracker.md`, `formation_system.md`, `rendering_system.md`, `game_theory.md`

## Overview
Bitcoin Protozoa is a web-based life simulation that leverages Bitcoin block data to generate and evolve particle-based creatures in a 3D environment. By integrating blockchain data (nonce, confirmations) with a deterministic random number generator (RNG), the project creates a reproducible, interactive ecosystem where users can explore how Bitcoin blocks influence creature traits, formations, and evolutionary paths. Built with React, Three.js, and TypeScript, it combines educational blockchain exploration with strategic gameplay inspired by RPG mechanics and game theory.

### Project Goals
- **Educational**: Demonstrate how Bitcoin block data (e.g., nonce, confirmations) can drive dynamic simulations.
- **Interactive**: Allow users to select specific blocks to generate unique creatures and observe their evolution.
- **Strategic**: Incorporate game theory (e.g., Nash equilibrium) for balanced creature interactions and potential PvP battles.
- **Performant**: Optimize rendering and computation for real-time visualization of 50–250 particles per creature.

### User Experience
Users interact via a web interface to:
1. Select a Bitcoin block (0 to 1,000,000) using a `BlockSelector` component.
2. Generate creatures with particle counts (50–250), roles (CORE, CONTROL, ATTACK, DEFENSE, MOVEMENT), and traits (VISUAL, FORMATION, BEHAVIOR).
3. Visualize creatures in a 3D scene with Three.js, using orbit controls to explore.
4. Track evolution triggered by block confirmations, with mutations altering traits and behaviors.

## Architecture
Bitcoin Protozoa employs a modular, service-based architecture, leveraging modern web technologies for scalability and performance. The project is organized under `fresh/` with key directories: `src/` (source code), `traits/` (trait definitions), `docs/` (documentation), and `tests/` (test suite).

### Core Technologies
- **React 18.2.0**: Frontend framework for UI components (e.g., `BlockSelector`, `ParticleRenderer`).
- **Three.js 0.162.0**: 3D rendering pipeline with instanced rendering and custom shaders.
- **@react-three/fiber**: React integration for Three.js, enabling declarative scene management.
- **TypeScript**: Type safety for robust code (e.g., interfaces in `src/types/`).
- **Web Workers**: Offload computations (e.g., physics, RNG) for real-time performance.
- **Jest**: Unit testing framework for services and utilities.
- **ESLint + Prettier**: Code quality and formatting.

### Core Systems
The project comprises seven primary systems, each with defined responsibilities:

1. **Bitcoin Integration (`src/services/bitcoin/`)**
   - Fetches block data (nonce, confirmations) via ordinals.com API.
   - Caches data in IndexedDB with 1-hour expiry.
   - Validates blocks (0 ≤ number ≤ 1,000,000, confirmations ≥ 1,000,000).
2. **Particle System (`src/services/particles/`, `src/components/ParticleRenderer/`)**
   - Manages 50–250 particles per creature, assigned roles: CORE (20%), CONTROL (15%), ATTACK (25%), DEFENSE (20%), MOVEMENT (20%).
   - Uses instanced rendering for efficiency and a custom physics engine for dynamic movement.
3. **Trait System (`src/services/traits/`, `traits/`)**
   - Generates traits (VISUAL, FORMATION, BEHAVIOR) with six-tier rarity: COMMON (50%), UNCOMMON (30%), RARE (15%), EPIC (4%), LEGENDARY (0.9%), MYTHIC (0.1%).
   - Applies traits to particle groups, influencing appearance, arrangement, and behavior.
4. **Evolution System (`src/services/evolution/`)**
   - Tracks creature evolution based on block confirmations, triggering mutations at thresholds (e.g., every 100 confirmations).
   - Stores history in `localStorage` for persistence.
5. **Formation System (`src/services/formation/`)**
   - Arranges particles dynamically based on roles and traits (e.g., “Phalanx” for DEFENSE).
   - Optimizes spatial distribution for visual and strategic impact.
6. **Rendering System (`src/components/ParticleRenderer/`)**
   - Renders creatures in a Three.js scene with PerspectiveCamera, AmbientLight, DirectionalLight, and OrbitControls.
   - Optimizes with Level of Detail (LOD) and custom shaders for effects like glow.
7. **Game Theory System (`src/services/game_theory/`)**
   - Implements Nash equilibrium for role interactions (e.g., ATTACK vs. DEFENSE).
   - Uses decision trees for behavior (e.g., attack or retreat) and calculates battle outcomes.

### System Interactions
The systems form a pipeline from block data to visualization:
1. **Block Fetch**: `BitcoinService` retrieves block data (nonce, confirmations).
2. **RNG Seeding**: Nonce seeds a `mulberry32`-based RNG system for deterministic trait and role generation.
3. **Creature Generation**: `CreatureGenerator` assigns particles, roles, and tiers (TIER_1 to TIER_6 based on particle count).
4. **Trait Application**: `TraitService` applies traits, influencing formation and behavior.
5. **Evolution Tracking**: `EvolutionTracker` monitors confirmations, triggering mutations.
6. **Rendering**: `ParticleRenderer` visualizes particles with Three.js, optimized for performance.
7. **Game Theory**: `GameTheoryService` balances interactions, potentially for PvP battles.

## Development Context
The project is developed with a focus on modularity, performance, and extensibility:
- **Source Code**: Organized in `src/` with subdirectories: `types/` (interfaces), `services/` (business logic), `components/` (React components), `lib/` (utilities), `data/` (static data), `models/` (data models).
- **Workflows**:
  - Install: `npm install`
  - Develop: `npm run dev` (Vite-based dev server)
  - Build: `npm run build`
  - Test: `npm run test` (Jest)
- **Contributing**: Follows `CONTRIBUTING.md` with guidelines for code style, PRs, and issues.
- **License**: MIT License, ensuring open-source accessibility.

## Examples
Below is a simplified code example demonstrating the core pipeline:
```typescript
import { BitcoinService } from '../../services/bitcoin';
import { CreatureGenerator } from '../../services/creatures';
import { ParticleRenderer } from '../../components/ParticleRenderer';

async function generateAndRenderCreature(blockNumber: number) {
  // Fetch block data
  const bitcoinService = new BitcoinService();
  const blockData = await bitcoinService.fetchBlockData(blockNumber);

  // Generate creature
  const creatureGenerator = new CreatureGenerator();
  const creature = creatureGenerator.generateCreature(blockData);

  // Render creature
  const renderer = new ParticleRenderer();
  renderer.render(creature.particles);
}

generateAndRenderCreature(800000);
```

## Notes
- **AI Tasks**:
  - Validate system modularity by checking service dependencies (`npm list` output).
  - Generate unit tests for `BitcoinService` and `CreatureGenerator` to cover edge cases (e.g., invalid block numbers).
  - Propose optimizations for `ParticleRenderer` (e.g., reduce draw calls with instanced meshes).
- **Known Issues**:
  - Fractional particle distributions in older docs (e.g., 20.5 CORE for 100 particles) resolved with whole-number assignments.
  - Limited test coverage in `tests/`; prioritize Jest tests for `rngSystem.ts`.
- **Next Steps**:
  - Expand `docs/` with detailed system documents (e.g., `rng_system.md`, `trait_system.md`).
  - Implement PvP battle mode with game theory balancing.
  - Optimize rendering for 500+ particles using LOD and Web Workers.



---

### Integration with Past Conversations
This `overview.md` builds on our prior discussions:
- **April 4, 2025**: Your focus on `mulberry32` for RNG is reflected in the standardized RNG flow, using nonce seeding for determinism.
- **April 7, 2025**: The modular architecture aligns with your `research_documents/` structure, now adapted to `docs/architecture/`.
- **April 12, 2025**: The role distribution issue (fractional particles) is resolved with whole-number assignments (e.g., 20 CORE for 100 particles).
- **April 15, 2025**: Your A+ grade goal informs the emphasis on clarity, modularity, and AI tasks (e.g., testing, optimization).
- **April 16, 2025**: Your request for creature and rendering details is incorporated in the system descriptions and example pipeline.

### Conflict Resolution
The document addresses key conflicts:
- **Role Distribution**: Replaces ambiguous percentages (20% CORE, 25% ATTACK) with explicit counts (e.g., 20 CORE, 25 ATTACK for 100 particles), ensuring no fractional particles.
- **RNG System**: Consolidates the RNG flow (`BlockData -> NonceProcessor -> RNGSystem`) with `mulberry32`, deprecating outdated references (e.g., `/bitcoin/03_rng_system.md`).
- **System Overlap**: Clarifies `TraitService` (trait generation/application) vs. `ParticleGroupFactory` (particle group creation), reducing ambiguity.

### Next Steps and Clarifications
The `overview.md` serves as the cornerstone of the new `docs/` structure. To move forward:
1. **Review Content**: Confirm if the overview captures all critical aspects or if you want to emphasize specific features (e.g., Bitcoin ordinals integration, PvP potential).
2. **Expand Documentation**: Prioritize which system documents to write next (e.g., `rng_system.md`, `bitcoin_service.md`) or request full drafts for others.
3. **Address Additional Conflicts**: Share any specific discrepancies (e.g., in `GROK_INDEX.md`) for targeted resolution.
4. **AI Integration**: Specify if the coding AI needs additional metadata (e.g., JSON schemas) or tasks (e.g., auto-generate diagrams).
5. **Supporting Artifacts**: Request diagrams (e.g., system flowchart), scripts (e.g., to initialize `docs/`), or code templates if needed.

Please provide feedback or clarify any areas to refine (e.g., adding more game theory details, focusing on a specific system). I can also generate additional documents, update the directory setup script, or assist with AI bot tasks to continue documenting the project. Let me know how to proceed!
