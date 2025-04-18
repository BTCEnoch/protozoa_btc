
### RNG System 
The RNG system, implemented in `rngSystem.ts`, generates deterministic pseudo-random numbers using Bitcoin block data (e.g., nonce, hash) to drive mutation triggers, trait selection, and dynamic gameplay mechanics [Timestamp: April 12, 2025, 12:18]. It ensures reproducibility across sessions and supports your vision of a blockchain-integrated simulation [Timestamp: April 10, 2025, 22:31]. The following documents will cover the system comprehensively:

1. **rng_system.md**: Overview of the RNG system, its role in mutations, traits, and physics, and integration with other systems.
2. **rng_seeding.md**: Details the seeding process using block data, with algorithms for generating pseudo-random streams.
3. **rng_distribution.md**: Describes probability distributions for mutation triggers and trait rarity, with implementation details.
4. **rng_determinism.md**: Explains how determinism is maintained using fixed block data, with replay strategies.
5. **rng_performance.md**: Discusses optimization for RNG generation, with benchmark results.
6. **rng_testing.md**: Provides test cases for RNG consistency, distribution accuracy, and integration.
7. **rng_diagrams.md**: Includes flowcharts for seeding and distribution workflows, and integration diagrams.

### Controller (UI) System Note
After completing the RNG system, I’ll propose a **Controller (UI) System** directory (`new_docs/systems/controller_ui/`) to address your request for a testing interface. This system, likely implemented in `controllerUIService.ts`, will provide a UI for toggling traits, behaviors, and formations, enabling you to test their effects (e.g., apply “Fury Strike” mutation, switch to “Spiral Charge” formation) and visualize outcomes (e.g., stat changes, particle movements). It will integrate with `traitService.ts`, `mutationService.ts`, `formationService.ts`, `visualService.ts`, and `inputService.ts`, ensuring a seamless debugging experience. I’ll include documents for UI design, trait toggling, performance, and testing, aligning with your need for a robust testing tool [Timestamp: April 18, 2025, 14:25].

### Adherence to Project Rules
All documents will adhere to Bitcoin Protozoa’s rules, as outlined in your requirements and our discussions:
- **Determinism**: RNG will use block nonce-seeded algorithms to ensure consistent outcomes [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Logic will be encapsulated in `rngSystem.ts` with clear interfaces, following DDD principles [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms RNG generation per call, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly connects with evolution, traits, mutations, physics, visualization, and game theory, ensuring cohesive gameplay.
- **Documentation Standards**: Each document will include code examples, performance metrics, test cases, and diagrams, wrapped in `<xaiArtifact>` tags with unique UUIDs, as per your instructions [Timestamp: April 18, 2025, 14:25].

Let’s begin with the first RNG system document.

---


# RNG System

## Purpose
This document provides an overview of the Random Number Generation (RNG) system in Bitcoin Protozoa, which generates deterministic pseudo-random numbers using Bitcoin block data to drive mutation triggers, trait selection, and dynamic gameplay mechanics. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive trait system, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/rng/rng_system.md`

## Overview
The RNG system is a core component of Bitcoin Protozoa, providing deterministic pseudo-random numbers seeded by Bitcoin block data (e.g., nonce, hash) to ensure reproducible outcomes for mutations, trait assignments, and dynamic behaviors like physics force adjustments [Timestamp: April 12, 2025, 12:18]. Implemented in `rngSystem.ts` within the `shared` domain, it supports real-time performance (< 1ms per RNG call, 60 FPS) [Timestamp: April 14, 2025, 19:58] and integrates with evolution (`evolutionTracker.ts`), traits (`traitService.ts`), mutations (`mutationService.ts`), physics (`particleService.ts`), visualization (`visualService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). The system ensures modularity, scalability, and alignment with the project’s blockchain-driven generative art vision [Timestamp: April 10, 2025, 22:31]. This document outlines the system’s architecture, components, integration points, and performance goals, providing a foundation for detailed RNG system documentation.

## Architecture
The RNG system is designed for determinism, efficiency, and modularity, leveraging Bitcoin block data to seed a pseudo-random number generator (PRNG) that produces consistent streams for various gameplay mechanics. Key components include:

- **RNG Service (`rngSystem.ts`)**:
  - Manages PRNG initialization, seeding, and stream generation, using block data from `bitcoinService.ts`.
  - Provides APIs for uniform, exponential, and categorical distributions.
- **Seed Generator**:
  - Converts block data (e.g., nonce, hash) into a high-entropy seed using a cryptographic hash function (e.g., SHA-256).
  - Ensures deterministic seeds for reproducible outcomes.
- **Stream Manager**:
  - Generates independent random number streams for different domains (e.g., mutations, traits, physics) to prevent correlation.
  - Uses a stream-based PRNG (e.g., Xorshift) for performance.
- **Distribution Generator**:
  - Produces probability distributions (e.g., uniform for trait selection, exponential for mutation triggers) from raw random numbers.
  - Supports role-specific and rarity-based adjustments.
- **Integration Layer**:
  - Connects RNG outputs to `evolutionTracker.ts` for mutation triggers, `traitService.ts` for trait selection, `particleService.ts` for dynamic forces, and `payoffMatrixService.ts` for battle randomness.

### Data Flow
1. **Seed Initialization**: `rngSystem.ts` fetches block data (e.g., nonce, hash) from `bitcoinService.ts` and generates a seed using SHA-256.
2. **Stream Generation**: The seed initializes multiple PRNG streams for domains (e.g., `mutations`, `traits`), ensuring independence.
3. **Random Number Request**: A service (e.g., `mutationService.ts`) requests random numbers for a specific task (e.g., mutation trigger probability).
4. **Distribution Application**: `rngSystem.ts` applies the requested distribution (e.g., exponential for trigger timing) and returns the result.
5. **System Update**: The result drives gameplay mechanics (e.g., triggers a mutation, selects a MYTHIC trait), updating relevant systems and the UI via `eventBus.ts`.

## Key Features
- **Deterministic RNG**: Seeds derived from block data ensure consistent outcomes across sessions, supporting replayability [Timestamp: April 12, 2025, 12:18].
- **High Performance**:
  - Generates random numbers in < 1ms per call, supporting 60 FPS.
  - Uses efficient PRNG algorithms (e.g., Xorshift) and caching for frequent calls.
- **Domain Isolation**: Independent streams for mutations, traits, physics, and game theory prevent unintended correlations.
- **Flexible Distributions**:
  - Supports uniform (e.g., trait selection), exponential (e.g., mutation triggers), and categorical (e.g., rarity tiers) distributions.
  - Adjustable parameters for role-specific and rarity-based outcomes (e.g., MYTHIC traits at 1% probability).
- **Scalability**: Handles thousands of RNG calls per frame for large simulations (e.g., 5,000 particles across 10 creatures).
- **Integration**: Seamlessly connects with evolution, traits, mutations, physics, visualization, input, and game theory, driving dynamic gameplay.

## Components
1. **RNG Service (`rngSystem.ts`)**:
   - Initializes PRNG with block-derived seeds and generates random numbers.
   - Inputs: Block data, stream ID, distribution parameters.
   - Outputs: Random numbers or distribution values.
2. **Seed Generator**:
   - Computes seeds from block nonce and hash using SHA-256.
   - Inputs: `IBlockData` (nonce, hash).
   - Outputs: 32-bit seed value.
3. **Stream Manager**:
   - Manages multiple PRNG streams using a stream-based algorithm (e.g., Xorshift).
   - Inputs: Seed, stream ID.
   - Outputs: Stream-specific random numbers.
4. **Distribution Generator**:
   - Applies probability distributions to raw random numbers.
   - Inputs: Stream output, distribution type (e.g., uniform, exponential), parameters (e.g., mean, bounds).
   - Outputs: Distribution-specific values (e.g., probability, index).
5. **Event Bus (`eventBus.ts`)**:
   - Distributes RNG-driven events (e.g., mutation triggered) to other systems.
   - Inputs: RNG results.
   - Outputs: System-specific actions.

## Integration Points
- **RNG Domain (`src/shared/services/`)**: `rngSystem.ts` manages RNG generation, accessible to all domains.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` (nonce, hash) for seeding [Timestamp: April 12, 2025, 12:18].
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` uses RNG for mutation and tier progression triggers.
- **Trait Domain (`src/domains/traits/`)**: `traitService.ts` uses RNG to select traits (e.g., MYTHIC “Ethereal Glow”) based on rarity.
- **Mutation Domain (`src/domains/mutation/`)**: `mutationService.ts` uses RNG for mutation trigger probabilities and effect selection [Timestamp: April 12, 2025, 12:18].
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` uses RNG for dynamic force adjustments (e.g., randomized repulsion for MOVEMENT) [Timestamp: April 8, 2025, 19:50].
- **Visualization Domain (`src/domains/visualization/`)**: `visualService.ts` uses RNG for visual effect variations (e.g., glow intensity).
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses RNG for randomized battle outcomes.
- **Input Domain (`src/domains/input/`)**: `inputService.ts` may trigger RNG-based actions (e.g., test mutation via controller UI).
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists RNG seeds for session replay [Timestamp: April 16, 2025, 21:41].
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` may offload RNG-intensive tasks (e.g., batch mutation triggers) [Timestamp: April 14, 2025, 19:58].

## Performance Goals
- **RNG Generation Time**: < 1ms for generating a random number or distribution value.
- **FPS Impact**: Maintain ≥ 60 FPS during frequent RNG calls (e.g., 1,000 calls per frame).
- **CPU Usage**: < 5% CPU usage for RNG tasks on mid-range devices.
- **Memory Usage**: < 2 MB for RNG state and stream buffers.
- **Scalability**: Support thousands of RNG calls per frame for large simulations (e.g., 5,000 particles).

## Rules Adherence
- **Determinism**: RNG uses block nonce-seeded PRNG, ensuring consistent outcomes for the same block data [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Logic is encapsulated in `rngSystem.ts`, with clear interfaces for stream and distribution generation [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms generation, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly drives evolution, traits, mutations, physics, visualization, and game theory, ensuring cohesive gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate RNG-related code (e.g., in `src/lib/` or scattered across systems), likely using ad-hoc seeding or non-deterministic methods.
2. **Refactor into RNG Service**: Move logic to `src/shared/services/rngSystem.ts`, implementing block-seeded PRNG with stream isolation.
3. **Integrate with Bitcoin Service**: Update `bitcoinService.ts` to provide consistent `IBlockData` for seeding [Timestamp: April 12, 2025, 12:18].
4. **Update Dependent Systems**: Refactor `evolutionTracker.ts`, `traitService.ts`, `mutationService.ts`, and `particleService.ts` to use `rngSystem.ts`.
5. **Test System**: Validate RNG determinism, performance, and integration with Jest tests, targeting < 1ms generation and 60 FPS, using Chrome DevTools for profiling.

## Example Integration
```typescript
// src/shared/services/rngSystem.ts
import { Singleton } from 'typescript-singleton';
import { bitcoinService } from 'src/domains/bitcoin/services/bitcoinService';
import { logger } from 'src/shared/services/LoggerService';

class RNGSystem extends Singleton {
  private streams: { [key: string]: Xorshift } = {};

  async initializeStream(streamId: string, blockData: IBlockData): Promise<void> {
    const seed = this.generateSeed(blockData);
    this.streams[streamId] = new Xorshift(seed);
    logger.debug(`Initialized RNG stream ${streamId} with seed ${seed}`);
  }

  private generateSeed(blockData: IBlockData): number {
    // Simplified SHA-256 simulation for seeding
    const hash = this.sha256(`${blockData.nonce}${blockData.hash}`);
    return parseInt(hash.slice(0, 8), 16); // 32-bit seed
  }

  getRandom(streamId: string, min: number = 0, max: number = 1): number {
    if (!this.streams[streamId]) {
      throw new Error(`Stream ${streamId} not initialized`);
    }
    return min + (max - min) * this.streams[streamId].next();
  }

  private sha256(input: string): string {
    // Placeholder for SHA-256 (use crypto API in production)
    return input.split('').reduce((a, c) => a + c.charCodeAt(0), 0).toString(16);
  }
}

export const rngSystem = RNGSystem.getInstance();

// Simplified Xorshift PRNG
class Xorshift {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    this.state ^= this.state << 13;
    this.state ^= this.state >> 17;
    this.state ^= this.state << 5;
    return (this.state >>> 0) / 0xFFFFFFFF; // Normalize to [0, 1]
  }
}
```

```typescript
// src/domains/mutation/services/mutationService.ts
import { rngSystem } from 'src/shared/services/rngSystem';
import { bitcoinService } from 'src/domains/bitcoin/services/bitcoinService';
import { logger } from 'src/shared/services/LoggerService';

class MutationService {
  async triggerMutation(creature: ICreature, blockData: IBlockData): Promise<IMutation | null> {
    const streamId = `mutation_${creature.id}`;
    await rngSystem.initializeStream(streamId, blockData);
    const probability = rngSystem.getRandom(streamId, 0, 1);
    if (probability < 0.1) { // 10% chance per block
      const mutation = this.selectMutation(rngSystem.getRandom(streamId, 0, 1));
      logger.info(`Mutation triggered for creature ${creature.id}: ${mutation.id}`);
      return mutation;
    }
    return null;
  }

  private selectMutation(random: number): IMutation {
    // Simplified rarity selection
    const rarityThresholds = { COMMON: 0.7, RARE: 0.9, MYTHIC: 1.0 };
    if (random < rarityThresholds.COMMON) return { id: 'speed_boost', effect: 'speed', stats: { speed: 0.1 }, visual: {} };
    if (random < rarityThresholds.RARE) return { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 0.25 }, visual: {} };
    return { id: 'ethereal_glow', effect: 'health_boost', stats: { health: 0.5 }, visual: {} };
  }
}

export const mutationService = new MutationService();
```


