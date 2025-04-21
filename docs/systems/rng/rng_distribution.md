
# RNG Distribution

## Purpose
This document details the distribution mechanisms in Bitcoin Protozoa’s Random Number Generation (RNG) system, which transform deterministic pseudo-random numbers from Mulberry32 streams into probability distributions for mutation triggers, trait selection, and other gameplay mechanics, ensuring unique creature generation per Bitcoin block. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive trait system, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/rng/rng_distribution.md`

## Overview
The RNG distribution process is a critical component of Bitcoin Protozoa’s RNG system, leveraging the Mulberry32 pseudo-random number generator (PRNG) seeded by the Bitcoin block nonce to produce probability distributions (e.g., uniform, exponential, categorical) that drive gameplay mechanics such as mutation probabilities, trait rarity selection, and ability assignments [Timestamp: April 4, 2025, 14:16; April 12, 2025, 12:18]. Implemented in `rngSystem.ts` within the `shared` domain, distributions ensure deterministic, reproducible outcomes for unique creatures per block, support real-time performance (< 1ms per distribution call, 60 FPS) [Timestamp: April 14, 2025, 19:58], and integrate with evolution (`evolutionTracker.ts`), traits (`traitService.ts`), mutations (`mutationService.ts`), physics (`particleService.ts`), visualization (`visualService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines the distribution workflow, supported distribution types, implementation details, and integration points, building on our discussions about determinism, performance optimization, and modularity [Timestamp: April 12, 2025, 12:18; April 15, 2025, 21:23].

## Distribution Workflow
The distribution workflow transforms raw random numbers from Mulberry32 streams into specific probability distributions tailored to gameplay needs.

### Workflow
1. **Stream Access**:
   - A service (e.g., `mutationService.ts`, `traitService.ts`) requests a random value from a specific stream (e.g., `mutation`, `traits`) via `rngSystem.ts`, which uses a Mulberry32 PRNG seeded by the block nonce [Timestamp: April 4, 2025, 14:16].
2. **Raw Random Generation**:
   - The stream’s Mulberry32 instance generates a random number in [0, 1], ensuring deterministic output based on the nonce seed [Timestamp: April 12, 2025, 12:18].
3. **Distribution Application**:
   - The raw random number is transformed into the desired distribution (e.g., uniform, exponential, categorical) using mathematical mappings or lookup tables, with parameters tailored to the use case (e.g., mutation probability, trait rarity).
4. **Result Delivery**:
   - The distribution value (e.g., boolean for mutation trigger, integer for trait index) is returned to the requesting service, driving gameplay mechanics like creature evolution or ability selection.
5. **Error Handling**:
   - Invalid distribution parameters (e.g., negative bounds) are caught, logged via `logger.ts`, and default to safe values to maintain gameplay continuity.
6. **Persistence**:
   - Stream states are persisted via `StorageService.ts` to support session replay, ensuring consistent distribution outcomes for the same block nonce [Timestamp: April 16, 2025, 21:41].

### Supported Distribution Types
The RNG system provides the following distributions, implemented in the `RNGStream` interface, to meet diverse gameplay needs [Timestamp: April 4, 2025, 14:16]:
1. **Uniform Distribution**:
   - **Use Case**: Selects values within a range (e.g., attribute values from 0 to 400, physics force adjustments).
   - **Implementation**: Scales raw [0, 1] random numbers to [min, max] (e.g., `min + (max - min) * next()`).
   - **Example**: `nextInt(0, 400)` for creature attribute values.
2. **Boolean Distribution**:
   - **Use Case**: Determines binary outcomes (e.g., mutation trigger with 10% probability).
   - **Implementation**: Compares raw random number to a probability threshold (e.g., `next() < probability`).
   - **Example**: `nextBool(0.1)` for mutation chance.
3. **Categorical Distribution**:
   - **Use Case**: Selects items from a weighted set (e.g., trait rarity: COMMON 70%, RARE 20%, MYTHIC 1%).
   - **Implementation**: Uses cumulative probability thresholds to map random numbers to items.
   - **Example**: `nextItem(availableTraits)` for trait selection.
4. **Exponential Distribution**:
   - **Use Case**: Models time-based events (e.g., mutation trigger timing based on block confirmations).
   - **Implementation**: Applies inverse CDF: `-Math.log(1 - next()) / rate`.
   - **Example**: Exponential rate for mutation timing adjustments.
5. **Shuffled Selection**:
   - **Use Case**: Randomizes item order (e.g., ability selection, particle assignments).
   - **Implementation**: Fisher-Yates shuffle using `nextInt` for index swaps.
   - **Example**: `shuffle(abilityPool)` for ability randomization.

### Determinism
- Distributions are deterministic, as they rely on Mulberry32 streams seeded by the block nonce, ensuring identical outcomes for the same block across sessions [Timestamp: April 12, 2025, 12:18].
- Stream isolation (e.g., `traits` vs. `mutation`) prevents cross-domain interference, maintaining deterministic creature generation.
- Persisted stream states allow replaying past sessions, critical for debugging, testing via the controller UI, and ensuring consistent creature outcomes [Timestamp: April 18, 2025, 14:25].

## Implementation
The distribution mechanisms are implemented in `rngSystem.ts` and `RNGStreamImpl`, using the Mulberry32 algorithm for raw random numbers and mathematical transformations for distributions [Timestamp: April 4, 2025, 14:16]. Integration with `bitcoinService.ts` provides nonce seeds, and `StorageService.ts` persists stream states.

### Example Code
#### RNG Stream Implementation
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

  // Exponential distribution for time-based events
  nextExponential(rate: number): number {
    if (rate <= 0) {
      logger.warn(`Invalid rate ${rate}, using default rate 1`);
      rate = 1;
    }
    return -Math.log(1 - this.next()) / rate;
  }
}
```

#### RNG Service Distribution
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
}

export const rngSystem = RNGSystem.getInstance();
```

#### Mutation Service Example
```typescript
// src/domains/mutation/services/mutationService.ts
import { rngSystem } from 'src/shared/services/rngSystem';
import { bitcoinService } from 'src/domains/bitcoin/services/bitcoinService';
import { logger } from 'src/shared/services/LoggerService';

class MutationService {
  async triggerMutation(creature: ICreature, blockData: IBlockData): Promise<IMutation | null> {
    const streamId = `mutation_${creature.id}`;
    await rngSystem.initializeStream(streamId, blockData);
    const mutationRNG = rngSystem.getStream('mutation');

    // Check mutation probability based on block confirmations
    const mutationChance = this.getMutationChance(blockData.confirmations);
    if (mutationRNG.nextBool(mutationChance)) {
      const mutation = this.selectMutation(mutationRNG);
      logger.info(`Mutation triggered for creature ${creature.id}: ${mutation.id} using nonce ${blockData.nonce}`);
      return mutation;
    }
    return null;
  }

  private getMutationChance(confirmations: number): number {
    // Example: Increase chance with confirmations (0.1 base, +0.01 per confirmation)
    return Math.min(0.5, 0.1 + 0.01 * confirmations);
  }

  private selectMutation(rng: RNGStream): IMutation {
    const rarityRandom = rng.next();
    const rarityThresholds = {
      COMMON: 0.4,
      UNCOMMON: 0.7,
      RARE: 0.9,
      EPIC: 0.98,
      LEGENDARY: 0.995,
      MYTHIC: 1.0
    };
    if (rarityRandom < rarityThresholds.COMMON) return { id: 'speed_boost', effect: 'speed', stats: { speed: 0.1 }, visual: {} };
    if (rarityRandom < rarityThresholds.RARE) return { id: 'fury_strike', effect: 'damage_boost', stats: { damage: 0.25 }, visual: {} };
    return { id: 'ethereal_glow', effect: 'health_boost', stats: { health: 0.5 }, visual: {} };
  }
}

export const mutationService = new MutationService();
```

## Performance Considerations
To ensure efficient distribution generation for 500 particles:
1. **Fast Transformations**: Use simple mathematical mappings (e.g., linear scaling for uniform, inverse CDF for exponential) to achieve distribution generation in < 0.1ms [Timestamp: April 4, 2025, 14:16].
2. **Caching**: Cache frequently used distribution parameters (e.g., trait rarity thresholds) in `rngSystem.ts` to avoid redundant calculations.
3. **Batch Generation**: Generate multiple distribution values in a single call for high-frequency use cases (e.g., 500 particle attributes), reducing overhead.
4. **Lazy Initialization**: Initialize streams only when accessed, minimizing memory usage for unused streams [Timestamp: April 4, 2025, 14:16].
5. **Profiling**: Monitor distribution generation times with Chrome DevTools, targeting < 1ms per call [Timestamp: April 14, 2025, 19:58].

## Integration Points
- **RNG Domain (`src/shared/services/`)**: `rngSystem.ts` handles distribution generation for all streams.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides nonce seeds for deterministic streams [Timestamp: April 12, 2025, 12:18].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists stream states for session replay [Timestamp: April 16, 2025, 21:41].
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` uses distributions for mutation and tier triggers.
- **Trait Domain (`src/domains/traits/`)**: `traitService.ts` uses categorical distributions for trait selection (e.g., MYTHIC traits).
- **Mutation Domain (`src/domains/mutation/`)**: `mutationService.ts` uses boolean and exponential distributions for trigger probabilities [Timestamp: April 12, 2025, 12:18].
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` uses uniform distributions for dynamic forces [Timestamp: April 8, 2025, 19:50].
- **Visualization Domain (`src/domains/visualization/`)**: `visualService.ts` uses uniform distributions for effect variations.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses categorical distributions for battle randomness.
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers distributions via the controller UI for testing traits, behaviors, and formations [Timestamp: April 18, 2025, 14:25].
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` may offload distribution-heavy tasks (e.g., batch trait selection) [Timestamp: April 14, 2025, 19:58].

## Rules Adherence
- **Determinism**: Distributions rely on nonce-seeded Mulberry32 streams, ensuring consistent outcomes for unique creatures per block [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Distribution logic is encapsulated in `RNGStreamImpl`, with clear interfaces in `rngSystem.ts` [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms distribution generation, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports evolution, traits, mutations, physics, visualization, game theory, and the controller UI, driving dynamic gameplay [Timestamp: April 18, 2025, 14:25].

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate distribution-related code (e.g., in `src/lib/` or scattered), likely using ad-hoc random functions [Timestamp: April 4, 2025, 14:16].
2. **Refactor into RNG Service**: Move logic to `src/shared/interfaces/rngStream.ts` and `rngSystem.ts`, implementing Mulberry32-based distributions.
3. **Integrate with Streams**: Update services (e.g., `mutationService.ts`, `traitService.ts`) to use stream-specific distributions.
4. **Add Persistence**: Ensure `StorageService.ts` persists stream states for replay [Timestamp: April 16, 2025, 21:41].
5. **Test Distributions**: Validate distribution accuracy, determinism, and performance with Jest tests, ensuring < 1ms generation and consistent creature outcomes [Timestamp: April 4, 2025, 14:16].

## Example Test
```typescript
// tests/unit/rngSystem.test.ts
describe('RNGSystem Distribution', () => {
  beforeEach(() => {
    jest.spyOn(bitcoinService, 'fetchLatestBlock').mockResolvedValue({
      nonce: 123456,
      height: 800000
    });
    jest.spyOn(StorageService, 'save').mockResolvedValue();
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
  });

  test('generates deterministic uniform distribution', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG = rngSystem.getStream('traits');
    const value1 = traitsRNG.nextInt(0, 400);
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const value2 = traitsRNG.nextInt(0, 400);
    expect(value1).toEqual(value2); // Deterministic
  });

  test('generates boolean distribution for mutation', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const mutationRNG = rngSystem.getStream('mutation');
    const results = Array(1000).fill(0).map(() => mutationRNG.nextBool(0.1));
    const trueCount = results.filter(x => x).length;
    expect(trueCount).toBeGreaterThan(50); // Approx 10% probability
    expect(trueCount).toBeLessThan(150);
  });

  test('selects categorical distribution for traits', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG = rngSystem.getStream('traits');
    const traits = ['common', 'rare', 'mythic'];
    const results = Array(1000).fill(0).map(() => traitsRNG.nextItem(traits));
    const commonCount = results.filter(x => x === 'common').length;
    expect(commonCount).toBeGreaterThan(300); // Uniform distribution over 3 items
  });

  test('handles invalid distribution parameters', async () => {
    await rngSystem.initializeStream('creature_123', { nonce: 123456, height: 800000 });
    const traitsRNG = rngSystem.getStream('traits');
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const value = traitsRNG.nextInt(400, 0); // Invalid range
    expect(value).toBeGreaterThanOrEqual(0);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid range'));
  });
});
```


