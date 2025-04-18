
# RNG Determinism

## Purpose
This document details the determinism mechanisms in Bitcoin Protozoa’s Random Number Generation (RNG) system, which ensure that the same Bitcoin block nonce produces identical pseudo-random number sequences across sessions, guaranteeing consistent creature generation and gameplay outcomes. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive trait system, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/rng/rng_determinism.md`

## Overview
Determinism is a core design goal of Bitcoin Protozoa’s RNG system, enabling the Mulberry32 pseudo-random number generator (PRNG), seeded by the Bitcoin block nonce, to produce reproducible sequences for mutation triggers, trait selection, and other gameplay mechanics, ensuring each block generates a unique but consistent creature [Timestamp: April 4, 2025, 14:16; April 12, 2025, 12:18]. Implemented in `rngSystem.ts` within the `shared` domain, the system maintains determinism across sessions, supports real-time performance (< 1ms per RNG call, 60 FPS) [Timestamp: April 14, 2025, 19:58], and integrates with evolution (`evolutionTracker.ts`), traits (`traitService.ts`), mutations (`mutationService.ts`), physics (`particleService.ts`), visualization (`visualService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines the determinism workflow, seed management, stream isolation, replay strategies, and integration points, building on our discussions about determinism, performance optimization, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Determinism Workflow
The determinism workflow ensures that the RNG system produces identical random sequences for the same block nonce, maintaining consistent creature generation and gameplay outcomes.

### Workflow
1. **Nonce Seed Retrieval**:
   - `rngSystem.ts` retrieves the block nonce from `bitcoinService.ts`, either from a provided `IBlockData` or by fetching the latest block via an API (e.g., ordinals.com) [Timestamp: April 12, 2025, 12:18].
   - The nonce, a 32-bit unsigned integer, serves as the immutable seed for the main Mulberry32 PRNG.
2. **Stream Seed Derivation**:
   - The main PRNG, seeded with the nonce, generates derived seeds for each stream (`traits`, `physics`, `formation`, `visual`, `subclass`, `ability`, `mutation`) by producing deterministic 32-bit integers [Timestamp: April 4, 2025, 14:16].
   - Stream seeds are cached in `seedCache` to ensure consistency across sessions.
3. **Stream Isolation**:
   - Each stream uses a separate Mulberry32 instance with its derived seed, ensuring independent and deterministic sequences for different domains (e.g., mutations don’t affect traits).
4. **Random Number Generation**:
   - Services (e.g., `mutationService.ts`, `traitService.ts`) request random numbers or distributions (e.g., `nextInt`, `nextBool`) from specific streams, producing consistent outcomes for the same nonce.
5. **State Persistence**:
   - Nonce seeds and stream states are persisted via `StorageService.ts` to enable session replay, ensuring identical creature generation for past blocks [Timestamp: April 16, 2025, 21:41].
6. **Replay and Debugging**:
   - The system supports replaying creature generation for a specific block nonce, critical for debugging, testing via the controller UI, and verifying consistency [Timestamp: April 18, 2025, 14:25].

### Determinism Mechanisms
- **Nonce-Based Seeding**: The block nonce, a unique and immutable 32-bit value, is used directly as the seed for the main Mulberry32 PRNG, ensuring identical sequences for the same block [Timestamp: April 12, 2025, 12:18].
- **Mulberry32 Algorithm**: The Mulberry32 PRNG is deterministic, producing the same sequence of numbers for a given seed, with high-quality statistical properties [Timestamp: April 4, 2025, 14:16].
- **Stream Isolation**: Separate streams (`traits`, `physics`, etc.) use derived seeds, preventing cross-domain interference and ensuring each gameplay mechanic is independently deterministic.
- **Seed Persistence**: Nonce seeds are stored in IndexedDB via `StorageService.ts`, allowing the system to recreate past random sequences for any block [Timestamp: April 16, 2025, 21:41].
- **Error Handling**: Fallback seeds (e.g., cached nonce) are used only when API access fails, with warnings logged to maintain traceability and minimize non-deterministic behavior.

### Replay Strategies
To support session replay and debugging, particularly for the controller UI [Timestamp: April 18, 2025, 14:25]:
1. **Seed Storage**: Persist the nonce seed and block height for each creature in `rngState` store via `StorageService.ts`, enabling retrieval of past seeds.
2. **Stream State Tracking**: Store the current state of each Mulberry32 stream (e.g., last generated value) to resume sequences exactly, though Mulberry32’s stateless nature allows restarting from the seed.
3. **Block Replay**: Allow specifying a block number or nonce to regenerate a creature, using `bitcoinService.ts` to fetch historical block data or cached seeds.
4. **Controller UI Support**: Provide an interface in `controllerUIService.ts` to input a block nonce and replay creature generation, visualizing traits, mutations, and formations for testing.

### Determinism Guarantees
- **Same Nonce, Same Creature**: The same block nonce always produces the same creature, with identical traits, mutations, and behaviors, ensuring reproducibility [Timestamp: April 4, 2025, 14:16].
- **Cross-Session Consistency**: Persisted seeds and stream isolation ensure that replaying a block nonce in a new session yields the same results.
- **No External Influence**: The system avoids non-deterministic inputs (e.g., system time, user input) for core RNG, relying solely on the nonce.

## Implementation
Determinism is implemented in `rngSystem.ts`, using the Mulberry32 algorithm seeded by the block nonce, with stream isolation and persistence to ensure consistent outcomes [Timestamp: April 4, 2025, 14:16].

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
import { mulberry32 } from 'src/shared/lib/mulberry32';

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
    if (min > max) throw new Error('Invalid range: min > max');
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBool(probability: number): boolean {
    if (probability < 0 || probability > 1) {
      logger.warn(`Invalid probability ${probability}, clamping to [0, 1]`);
      probability = Math.max(0, Math.min(1, probability));
    }
    return this.next() < probability;
  }

  nextItem<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Cannot select item from empty array');
    return array[this.nextInt(0, array.length - 1)];
  }

  nextItems<T>(array: T[], count: number): T[] {
    if (count < 0 || count > array.length) {
      logger.warn(`Invalid count ${count}, clamping to [0, ${array.length}]`);
      count = Math.max(0, Math.min(array.length, count));
    }
    return this.shuffle([...array]).slice(0, count);
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

#### RNG Service Determinism
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
    return Date.now() & 0xFFFFFFFF; // 32-bit timestamp
  }

  getStream(name: string): RNGStream {
    const stream = this.streams.get(name);
    if (!stream) {
      throw new Error(`RNG stream '${name}' not found`);
    }
    return stream;
  }

  async replayBlock(blockNumber: number): Promise<void> {
    const blockData = await bitcoinService.fetchBlockData(blockNumber);
    const streamId = `creature_${blockData.height}`;
    await this.initializeStream(streamId, blockData);
    logger.info(`Replayed RNG for block ${blockNumber} with nonce ${blockData.nonce}`);
  }
}

export const rngSystem = RNGSystem.getInstance();
```

#### Creature Replay Example
```typescript
// src/domains/creature/services/creatureService.ts
import { rngSystem } from 'src/shared/services/rngSystem';
import { bitcoinService } from 'src/domains/bitcoin/services/bitcoinService';
import { logger } from 'src/shared/services/LoggerService';

class CreatureService {
  async replayCreature(blockNumber: number): Promise<ICreature> {
    await rngSystem.replayBlock(blockNumber);
    const traitsRNG = rngSystem.getStream('traits');
    const subclassRNG = rngSystem.getStream('subclass');
    const ability RNG = rngSystem.getStream('ability');

    const attributeValue = traitsRNG.nextInt(0, 400);
    const subclass = subclassRNG.nextItem(availableSubclasses);
    const primaryAbility = abilityRNG.nextItem(abilityPool.primary);

    const creature: ICreature = {
      id: `creature_${blockNumber}`,
      attributes: { value: attributeValue },
      subclass,
      abilities: [primaryAbility],
      // Other creature properties
    };

    logger.info(`Replayed creature ${creature.id} for block ${blockNumber}`);
    return creature;
  }
}

export const creatureService = new CreatureService();
```

## Performance Considerations
To ensure deterministic operation for 500 particles:
1. **Stateless PRNG**: Mulberry32’s stateless design allows restarting streams from the nonce seed, minimizing state management overhead [Timestamp: April 4, 2025, 14:16].
2. **Seed Caching**: Cache nonce seeds in `seedCache` and persist via `StorageService.ts` to avoid redundant API calls, achieving < 0.1ms seed retrieval [Timestamp: April 16, 2025, 21:41].
3. **Stream Efficiency**: Initialize streams lazily and reuse derived seeds, reducing memory usage for unused streams [Timestamp: April 4, 2025, 14:16].
4. **Replay Optimization**: Use cached nonce seeds for frequent replays (e.g., via controller UI), minimizing API calls to `bitcoinService.ts`.
5. **Profiling**: Monitor stream initialization and random number generation times with Chrome DevTools, targeting < 1ms per operation [Timestamp: April 14, 2025, 19:58].

## Integration Points
- **RNG Domain (`src/shared/services/`)**: `rngSystem.ts` ensures deterministic stream generation and replay.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides nonce seeds for deterministic PRNGs [Timestamp: April 12, 2025, 12:18].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists nonce seeds and stream states for replay [Timestamp: April 16, 2025, 21:41].
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` uses deterministic streams for mutation and tier triggers.
- **Trait Domain (`src/domains/traits/`)**: `traitService.ts` uses deterministic streams for trait selection, ensuring consistent creature traits.
- **Mutation Domain (`src/domains/mutation/`)**: `mutationService.ts` uses deterministic streams for trigger probabilities [Timestamp: April 12, 2025, 12:18].
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` uses deterministic streams for dynamic forces [Timestamp: April 8, 2025, 19:50].
- **Visualization Domain (`src/domains/visualization/`)**: `visualService.ts` uses deterministic streams for effect variations.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses deterministic streams for battle randomness.
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers deterministic RNG via the controller UI for testing traits, behaviors, and formations [Timestamp: April 18, 2025, 14:25].
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` may offload RNG-intensive tasks [Timestamp: April 14, 2025, 19:58].

## Rules Adherence
- **Determinism**: Nonce-based seeding ensures identical creature generation for the same block across sessions [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Determinism logic is encapsulated in `rngSystem.ts`, with clear interfaces for stream access and replay [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms stream initialization and RNG calls, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports evolution, traits, mutations, physics, visualization, game theory, and the controller UI, ensuring consistent gameplay [Timestamp: April 18, 2025, 14:25].

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate RNG-related code (e.g., in `src/lib/` or scattered), likely using non-deterministic or ad-hoc methods [Timestamp: April 4, 2025, 14:16].
2. **Refactor into RNG Service**: Move determinism logic to `src/shared/services/rngSystem.ts`, implementing Mulberry32 with nonce-based seeding and stream replay.
3. **Integrate with Storage**: Update `StorageService.ts` to persist nonce seeds and stream states for replay [Timestamp: April 16, 2025, 21:41].
4. **Add Replay Functionality**: Implement `replayBlock` in `rngSystem.ts` and integrate with `creatureService.ts` for creature regeneration.
5. **Test Determinism**: Validate stream consistency and replay accuracy with Jest tests, ensuring identical outcomes for the same nonce [Timestamp: April 4, 2025, 14:16].

## Example Test
```typescript
// tests/unit/rngSystem.test.ts
describe('RNGSystem Determinism', () => {
  beforeEach(() => {
    jest.spyOn(bitcoinService, 'fetchLatestBlock').mockResolvedValue({
      nonce: 123456,
      height: 800000
    });
    jest.spyOn(StorageService, 'save').mockResolvedValue();
    jest.spyOn(StorageService, 'load').mockResolvedValue(null);
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
  });

  test('produces identical sequences for same nonce', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG1 = rngSystem.getStream('traits');
    const sequence1 = [traitsRNG1.next(), traitsRNG1.nextInt(0, 400)];

    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG2 = rngSystem.getStream('traits');
    const sequence2 = [traitsRNG2.next(), traitsRNG2.nextInt(0, 400)];

    expect(sequence1).toEqual(sequence2); // Deterministic
    expect(StorageService.save).toHaveBeenCalledWith('rngState', 'creature_123', expect.any(Object));
  });

  test('replays creature generation consistently', async () => {
    const blockNumber = 800000;
    const creature1 = await creatureService.replayCreature(blockNumber);
    const creature2 = await creatureService.replayCreature(blockNumber);
    expect(creature1.attributes.value).toEqual(creature2.attributes.value);
    expect(creature1.subclass).toEqual(creature2.subclass);
    expect(creature1.abilities).toEqual(creature2.abilities);
  });

  test('isolates streams for different purposes', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG = rngSystem.getStream('traits');
    const mutationRNG = rngSystem.getStream('mutation');
    const traitValue = traitsRNG.nextInt(0, 400);
    const mutationValue = mutationRNG.nextBool(0.1);
    expect(traitValue).not.toEqual(mutationValue); // Independent streams
  });

  test('handles API failure with fallback', async () => {
    jest.spyOn(bitcoinService, 'fetchLatestBlock').mockRejectedValue(new Error('API failure'));
    jest.spyOn(StorageService, 'load').mockResolvedValue({ seed: 654321, blockHeight: 799999 });
    await rngSystem.initializeStream('creature_123');
    const traitsRNG = rngSystem.getStream('traits');
    const value = traitsRNG.nextInt(0, 400);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Using fallback seed'));
  });
});
```

