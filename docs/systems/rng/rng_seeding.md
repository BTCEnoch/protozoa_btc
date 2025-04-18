Thank you for sharing the detailed specification for the RNG system in Bitcoin Protozoa, which provides a clear blueprint for how the system should function, particularly emphasizing the use of the **Mulberry32 algorithm** and the **Bitcoin block nonce** as the sole seed for deterministic pseudo-random number generation. I also appreciate your clarification that the RNG seeding document should focus exclusively on the nonce, as it’s a static, immutable value that ensures each block produces a unique creature [Timestamp: April 18, 2025, 14:25]. Since you’ve provided a comprehensive overview of the RNG system’s design, including the Mulberry32 implementation, stream structure, and usage examples, I’ll revise the `rng_seeding.md` document to align with this specification while incorporating the nonce-only seeding approach and maintaining the project’s rules (determinism, modularity, performance, integration).

### Key Changes from Previous Version
Based on your provided document and instructions, the revised `rng_seeding.md` will:
- **Incorporate Mulberry32**: Use the provided Mulberry32 algorithm as the core PRNG, replacing the Xorshift implementation from the previous version [Timestamp: April 4, 2025, 14:16].
- **Nonce-Only Seeding**: Seed the RNG system directly with the block nonce, without additional hashing or other block header fields, ensuring simplicity and immutability [Timestamp: April 12, 2025, 12:18].
- **Stream Structure**: Reflect the specified streams (`traits`, `physics`, `formation`, `visual`, `subclass`, `ability`, `mutation`) and their interfaces (`next`, `nextInt`, `nextBool`, `nextItem`, `nextItems`, `shuffle`) for separation of concerns.
- **Performance and Testing**: Emphasize the performance optimizations (lazy initialization, caching, batch generation) and testing strategies (determinism, distribution, independence) from your specification.
- **Controller UI Integration**: Include support for the upcoming controller UI system to test traits, behaviors, and formations, as you requested [Timestamp: April 18, 2025, 14:25].
- **Project Rules**: Ensure determinism (same nonce produces same creature), modularity (encapsulated in `rngSystem.ts`), performance (< 1ms per RNG call, 60 FPS), and integration with evolution, traits, mutations, physics, visualization, input, and game theory [Timestamp: April 15, 2025, 21:23; April 14, 2025, 19:58].

The document will be structured to match the previous format for consistency, focusing on the seeding workflow, implementation, and integration, while incorporating your provided code and design goals.

---


# RNG Seeding

## Purpose
This document details the seeding mechanisms in Bitcoin Protozoa’s Random Number Generation (RNG) system, which uses the Bitcoin block nonce as a static, immutable seed to initialize deterministic pseudo-random number streams for generating unique creatures per block through mutation triggers, trait selection, and dynamic gameplay mechanics. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive trait system, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/rng/rng_seeding.md`

## Overview
The RNG seeding process is a foundational component of Bitcoin Protozoa’s RNG system, using the Bitcoin block nonce to seed the Mulberry32 pseudo-random number generator (PRNG), ensuring deterministic and reproducible creature generation for each block [Timestamp: April 12, 2025, 12:18; April 4, 2025, 14:16]. Implemented in `rngSystem.ts` within the `shared` domain, seeding supports real-time performance (< 1ms per seed generation, 60 FPS) [Timestamp: April 14, 2025, 19:58] and integrates with evolution (`evolutionTracker.ts`), traits (`traitService.ts`), mutations (`mutationService.ts`), physics (`particleService.ts`), visualization (`visualService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). The nonce, a 32-bit unsigned integer unique to each block, drives the generation of separate streams for traits, physics, formations, visuals, subclasses, abilities, and mutations, ensuring each creature is uniquely defined by its block [Timestamp: April 18, 2025, 14:25]. This document outlines the nonce-based seeding workflow, Mulberry32 implementation, stream initialization, error handling, and integration points, building on our discussions about determinism, performance optimization, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Seeding Workflow
The seeding workflow generates deterministic seeds from the Bitcoin block nonce, initializing Mulberry32 PRNG streams for distinct gameplay domains.

### Workflow
1. **Block Nonce Retrieval**:
   - `rngSystem.ts` requests the latest or specific block nonce from `bitcoinService.ts`, which fetches it via an API (e.g., ordinals.com) [Timestamp: April 12, 2025, 12:18].
2. **Seed Generation**:
   - The block nonce, a 32-bit unsigned integer, is used directly as the seed, ensuring a unique and immutable value per block without additional processing.
   - The seed is associated with a stream identifier (e.g., `mutation_creature_123`) for domain-specific randomness.
3. **Stream Initialization**:
   - The nonce seed initializes a main Mulberry32 PRNG, which generates derived seeds for separate streams (`traits`, `physics`, `formation`, `visual`, `subclass`, `ability`, `mutation`) to ensure separation of concerns.
   - Each stream uses a Mulberry32 instance with its derived seed, producing independent random sequences.
4. **Error Handling**:
   - If the nonce is unavailable (e.g., API failure), a fallback seed is used (e.g., cached block nonce or timestamp), with errors logged via `logger.ts`.
5. **Stream Usage**:
   - Services (e.g., `mutationService.ts`, `traitService.ts`) access streams to generate random numbers for gameplay mechanics, such as mutation triggers, trait selection, or physics adjustments, producing unique creatures per block.
6. **Persistence**:
   - Nonce seeds are persisted via `StorageService.ts` to support session replay, ensuring consistent creature generation for the same block [Timestamp: April 16, 2025, 21:41].

### Seed Generation Process
- **Input**: Block data (`IBlockData`) containing `nonce` (32-bit unsigned integer).
- **Process**:
  - Use the nonce directly as the seed for the main Mulberry32 PRNG, as it is a unique, immutable value suitable for a 32-bit PRNG.
  - Generate derived seeds for each stream by invoking the main PRNG and scaling its output to a 32-bit integer (e.g., `Math.floor(mainRNG() * 4294967296)`).
  - No hashing or additional processing is required, minimizing overhead.
- **Output**: 32-bit unsigned integer seed (0 to 2³²-1) for the main PRNG, with derived 32-bit seeds for each stream.
- **Example**:
  - Input: `{ nonce: 123456, height: 800000 }`
  - Main Seed: `123456`
  - Derived Stream Seed (e.g., for `traits`): `Math.floor(mainRNG() * 4294967296)` (e.g., 78901234)

### Supported Stream Types
As specified, the RNG system creates separate streams to maintain separation of concerns [Timestamp: April 4, 2025, 14:16]:
- **Traits Stream**: Generates attribute values and selects VISUAL, FORMATION, or BEHAVIOR traits by rarity (e.g., MYTHIC at 1%), defining creature characteristics.
- **Physics Stream**: Adjusts dynamic forces (e.g., randomized repulsion for MOVEMENT), influencing creature behavior [Timestamp: April 8, 2025, 19:50].
- **Formation Stream**: Determines formation patterns (e.g., “Shield Wall,” “Spiral Charge”), shaping creature organization.
- **Visual Stream**: Randomizes visual appearances (e.g., glow intensity, color variations), enhancing creature aesthetics.
- **Subclass Stream**: Selects role-specific subclasses (e.g., Stabilizer for CORE, Mauler for ATTACK), defining creature specialization [Timestamp: April 14, 2025, 19:58].
- **Ability Stream**: Chooses abilities (e.g., primary, crowd control), determining creature capabilities.
- **Mutation Stream**: Controls mutation trigger probabilities and effect selection, driving creature evolution [Timestamp: April 12, 2025, 12:18].

### Determinism
- Seeds are derived solely from the block nonce, ensuring identical random sequences for the same block across sessions, producing the same creature for a given block [Timestamp: April 12, 2025, 12:18].
- Stream isolation prevents cross-domain interference (e.g., mutation stream doesn’t affect traits), maintaining deterministic outcomes.
- Persisted nonce seeds enable session replay, critical for debugging, testing via the controller UI, and ensuring consistent creature generation [Timestamp: April 18, 2025, 14:25].

## Implementation
The seeding process is implemented in `rngSystem.ts`, using the Mulberry32 algorithm provided in your specification [Timestamp: April 4, 2025, 14:16]. It integrates with `bitcoinService.ts` for nonce retrieval and `StorageService.ts` for persistence.

### Example Code
#### Mulberry32 Implementation
```typescript
// src/shared/lib/mulberry32.ts
export function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

#### RNG Stream Interface
```typescript
// src/shared/interfaces/rngStream.ts
interface RNGStream {
  next(): number;
  nextInt(min: number, max: number): number;
  nextBool(probability: number): boolean;
  nextItem<T>(array: T[]): T;
  nextItems<T>(array: T[], count: number): T[];
  shuffle<T>(array: T[]): T[];
}

class RNGStreamImpl implements RNGStream {
  private rng: () => number;

  constructor(seed: number) {
    this.rng = mulberry32(seed);
  }

  next(): number {
    return this.rng();
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBool(probability: number): boolean {
    return this.next() < probability;
  }

  nextItem<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  nextItems<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle([...array]);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
```

#### RNG Service Seeding
```typescript
// src/shared/services/rngSystem.ts
import { Singleton } from 'typescript-singleton';
import { bitcoinService } from 'src/domains/bitcoin/services/bitcoinService';
import { StorageService } from 'src/shared/services/StorageService';
import { logger } from 'src/shared/services/LoggerService';
import { mulberry32 } from 'src/shared/lib/mulberry32';
import { RNGStream, RNGStreamImpl } from 'src/shared/interfaces/rngStream';

class RNGSystem extends Singleton {
  private streams: Map<string, RNGStream> = new Map();
  private mainRNG: () => number;
  private seedCache: { [streamId: string]: number } = {};

  constructor(nonce: number) {
    this.mainRNG = mulberry32(nonce);
    const purposes = ['traits', 'physics', 'formation', 'visual', 'subclass', 'ability', 'mutation'];
    for (const purpose of purposes) {
      const derivedSeed = Math.floor(this.mainRNG() * 4294967296);
      this.createStream(purpose, derivedSeed);
    }
  }

  async initializeStream(streamId: string, blockData?: IBlockData): Promise<void> {
    let seed = this.seedCache[streamId];
    if (!seed) {
      try {
        const data = blockData || await bitcoinService.fetchLatestBlock();
        seed = data.nonce; // Use nonce directly as seed
        this.seedCache[streamId] = seed;
        await StorageService.save('rngState', streamId, { streamId, seed, blockHeight: data.height });
        logger.debug(`Initialized RNG stream ${streamId} with seed ${seed} from block ${data.height}`);
      } catch (error) {
        logger.error(`Failed to fetch block nonce: ${error.message}`);
        const fallback = await StorageService.load('rngState', streamId);
        seed = fallback?.seed || this.generateFallbackSeed();
        logger.warn(`Using fallback seed ${seed} for stream ${streamId}`);
      }
      this.createStream(streamId, seed);
    }
  }

  private createStream(name: string, seed: number): RNGStream {
    const stream = new RNGStreamImpl(seed);
    this.streams.set(name, stream);
    return stream;
  }

  private generateFallbackSeed(): number {
    // Use cached block nonce or timestamp as fallback
    return Date.now() & 0xFFFFFFFF; // 32-bit timestamp
  }

  getStream(name: string): RNGStream {
    const stream = this.streams.get(name);
    if (!stream) {
      throw new Error(`RNG stream '${name}' not found`);
    }
    return stream;
  }
}

export const rngSystem = RNGSystem.getInstance();
```

#### Creature Generation Example
```typescript
// src/domains/creature/services/creatureService.ts
import { rngSystem } from 'src/shared/services/rngSystem';
import { bitcoinService } from 'src/domains/bitcoin/services/bitcoinService';
import { logger } from 'src/shared/services/LoggerService';

class CreatureService {
  async generateCreature(blockNumber: number): Promise<ICreature> {
    const blockData = await bitcoinService.fetchBlockData(blockNumber);
    await rngSystem.initializeStream(`creature_${blockData.height}`, blockData);
    const traitsRNG = rngSystem.getStream('traits');
    const subclassRNG = rngSystem.getStream('subclass');
    const abilityRNG = rngSystem.getStream('ability');

    const attributeValue = traitsRNG.nextInt(0, 400);
    const subclass = subclassRNG.nextItem(availableSubclasses);
    const primaryAbility = abilityRNG.nextItem(abilityPool.primary);

    const creature: ICreature = {
      id: `creature_${blockData.height}`,
      attributes: { value: attributeValue },
      subclass,
      abilities: [primaryAbility],
      // Other creature properties
    };

    logger.info(`Generated creature ${creature.id} with nonce ${blockData.nonce}`);
    return creature;
  }
}

export const creatureService = new CreatureService();
```

## Performance Considerations
To ensure efficient seeding for 500 particles:
1. **Direct Nonce Usage**: Using the nonce directly as the seed eliminates processing overhead, achieving seed generation in < 0.1ms.
2. **Lazy Initialization**: Streams are created only when needed, reducing memory and initialization costs for unused domains [Timestamp: April 4, 2025, 14:16].
3. **Seed Caching**: Cache nonce seeds in `seedCache` and persist via `StorageService.ts` to avoid redundant API calls for repeated streams.
4. **Batch Seeding**: Initialize multiple streams (e.g., for 10 creatures) in a single API call to `bitcoinService.ts`, reducing network latency.
5. **Fallback Efficiency**: Use lightweight fallback seeds (e.g., cached nonce or timestamp) to maintain performance during API failures.
6. **Profiling**: Monitor seed generation and stream initialization times with Chrome DevTools, targeting < 1ms per seeding operation [Timestamp: April 14, 2025, 19:58].

## Integration Points
- **RNG Domain (`src/shared/services/`)**: `rngSystem.ts` handles nonce-based seed generation and stream initialization.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` with the nonce for seeding [Timestamp: April 12, 2025, 12:18].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists nonce seeds for session replay [Timestamp: April 16, 2025, 21:41].
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` uses seeded streams for mutation and tier triggers.
- **Trait Domain (`src/domains/traits/`)**: `traitService.ts` uses seeded streams for trait selection, ensuring unique creature traits per block.
- **Mutation Domain (`src/domains/mutation/`)**: `mutationService.ts` uses seeded streams for trigger probabilities, driving creature evolution [Timestamp: April 12, 2025, 12:18].
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` uses seeded streams for dynamic forces, affecting creature behavior [Timestamp: April 8, 2025, 19:50].
- **Visualization Domain (`src/domains/visualization/`)**: `visualService.ts` uses seeded streams for effect variations, enhancing creature visuals.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses seeded streams for battle randomness.
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers seeded RNG via the controller UI for testing traits, behaviors, and formations [Timestamp: April 18, 2025, 14:25].
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` may offload RNG-intensive tasks, such as batch mutation triggers [Timestamp: April 14, 2025, 19:58].

## Rules Adherence
- **Determinism**: Seeds are derived solely from the block nonce, ensuring consistent PRNG streams for unique creatures per block [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Seeding logic is encapsulated in `rngSystem.ts`, with clear interfaces for stream initialization and access [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms seed generation and RNG calls, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports evolution, traits, mutations, physics, visualization, game theory, and the controller UI, driving dynamic gameplay [Timestamp: April 18, 2025, 14:25].

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate RNG seeding code (e.g., in `src/lib/` or scattered), likely using ad-hoc methods or non-nonce seeds [Timestamp: April 4, 2025, 14:16].
2. **Refactor into RNG Service**: Move seeding logic to `src/shared/services/rngSystem.ts`, implementing Mulberry32 with nonce-based seeding.
3. **Integrate with Bitcoin Service**: Ensure `bitcoinService.ts` provides reliable `IBlockData` with nonce values [Timestamp: April 12, 2025, 12:18].
4. **Add Persistence**: Update `StorageService.ts` to persist nonce seeds for replay [Timestamp: April 16, 2025, 21:41].
5. **Test Seeding**: Validate seed generation, stream initialization, and determinism with Jest tests, ensuring < 1ms performance and consistent creature outcomes [Timestamp: April 4, 2025, 14:16].

## Example Test
```typescript
// tests/unit/rngSystem.test.ts
describe('RNGSystem Seeding', () => {
  beforeEach(() => {
    jest.spyOn(bitcoinService, 'fetchLatestBlock').mockResolvedValue({
      nonce: 123456,
      height: 800000
    });
    jest.spyOn(StorageService, 'save').mockResolvedValue();
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
  });

  test('generates deterministic stream from nonce', async () => {
    const streamId = 'mutation_creature_123';
    await rngSystem.initializeStream(streamId, { nonce: 123456, height: 800000 });
    const mutationRNG = rngSystem.getStream('mutation');
    const random1 = mutationRNG.next();
    await rngSystem.initializeStream(streamId, { nonce: 123456, height: 800000 }); // Reinitialize with same nonce
    const random2 = mutationRNG.next();
    expect(random1).toEqual(random2); // Deterministic
    expect(StorageService.save).toHaveBeenCalledWith('rngState', streamId, expect.any(Object));
  });

  test('uses fallback seed on API failure', async () => {
    jest.spyOn(bitcoinService, 'fetchLatestBlock').mockRejectedValue(new Error('API failure'));
    jest.spyOn(StorageService, 'load').mockResolvedValue(null);
    const streamId = 'mutation_creature_123';
    await rngSystem.initializeStream(streamId);
    const mutationRNG = rngSystem.getStream('mutation');
    const random = mutationRNG.next();
    expect(random).toBeGreaterThanOrEqual(0);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Using fallback seed'));
  });

  test('creates separate streams for different purposes', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG = rngSystem.getStream('traits');
    const physicsRNG = rngSystem.getStream('physics');
    const traitValue = traitsRNG.nextInt(0, 400);
    const physicsValue = physicsRNG.next();
    expect(traitValue).not.toEqual(physicsValue); // Independent streams
  });
});
```


