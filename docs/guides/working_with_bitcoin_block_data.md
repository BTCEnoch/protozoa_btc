
# Working with Bitcoin Block Data

## Purpose
This guide explains how to interact with Bitcoin block data, such as nonces and confirmations, in Bitcoin Protozoa to drive deterministic RNG and evolution triggers. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/working_with_bitcoin_block_data.md`

## Overview
Bitcoin Protozoa leverages Bitcoin block data, fetched via the ordinals.com API, to seed a deterministic random number generator (RNG) and trigger evolutionary events, such as mutations, based on block confirmations. Managed by `bitcoinService.ts` in the `bitcoin` domain, this integration ensures that gameplay mechanics like trait generation and evolution are reproducible and tied to the Bitcoin blockchain. This guide provides practical steps for fetching block data, seeding RNG, handling confirmations, and managing API interactions, building on our discussions about deterministic RNG [Timestamp: April 12, 2025, 12:18]. It aims to empower developers to work with this unique feature of the project effectively.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **API Access**: Ensure access to the ordinals.com API or a compatible Bitcoin node for block data. No API key is required, but rate limits apply.
- **Dependencies**: Familiarity with TypeScript, as the project uses strict typing for block data interfaces (e.g., `IBlockData` in `src/shared/types/`).

## Fetching Block Data
The `bitcoinService.ts` handles fetching block data from the ordinals.com API, providing fields like nonce, block height, and confirmations.

### Steps
1. **Configure API Endpoint**:
   - Use the ordinals.com API (e.g., `https://ordinals.com/api/block/{height}`) or a local Bitcoin node.
   - Store endpoint configuration in `src/shared/config/apiConfig.ts`.

2. **Fetch Block Data**:
   - Call `bitcoinService.fetchBlockData(height)` to retrieve data for a specific block height.
   - Handle responses with the `IBlockData` interface.

3. **Handle Errors**:
   - Implement retry logic for rate limit errors (HTTP 429) or network failures.
   - Cache recent block data to reduce API calls.

### Example Code
```typescript
// src/domains/bitcoin/services/bitcoinService.ts
import { Singleton } from 'typescript-singleton';
import { IBlockData } from 'src/shared/types/bitcoin';

class BitcoinService {
  private cache: Map<number, IBlockData> = new Map();
  private readonly API_URL = 'https://ordinals.com/api/block';

  async fetchBlockData(height: number): Promise<IBlockData> {
    if (this.cache.has(height)) {
      return this.cache.get(height)!;
    }

    try {
      const response = await fetch(`${this.API_URL}/${height}`);
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Retry after 1s
        return this.fetchBlockData(height);
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch block ${height}: ${response.statusText}`);
      }
      const data = await response.json();
      const blockData: IBlockData = {
        height,
        nonce: data.nonce,
        confirmations: data.confirmations || 0,
        timestamp: data.timestamp
      };
      this.cache.set(height, blockData);
      return blockData;
    } catch (error) {
      console.error(`Error fetching block ${height}:`, error);
      throw error;
    }
  }
}

export const bitcoinService = BitcoinService.getInstance();
```

### Usage
```typescript
// Example: Fetch block data for height 800000
const blockData = await bitcoinService.fetchBlockData(800000);
console.log(blockData); // { height: 800000, nonce: '123456', confirmations: 6, timestamp: '2023-10-01T12:00:00Z' }
```

## Seeding RNG with Block Nonce
The block nonce is used to seed a deterministic RNG, ensuring reproducible outcomes for trait generation, evolution triggers, and other mechanics.

### Steps
1. **Access Block Nonce**:
   - Use the `nonce` field from `IBlockData` returned by `bitcoinService.fetchBlockData`.
2. **Seed RNG**:
   - Pass the nonce to `createRNGFromBlock` in `rngSystem.ts` to create a seeded RNG instance.
   - Specify a stream (e.g., `evolution`, `traits`) for domain-specific randomization.
3. **Apply RNG**:
   - Use the RNG for deterministic decisions (e.g., selecting a mutation trait).

### Example Code
```typescript
// src/shared/lib/rngSystem.ts
export function createRNGFromBlock(nonce: string) {
  let seed = parseInt(nonce, 16); // Convert nonce to integer
  const streams: { [key: string]: () => number } = {};

  return {
    getStream: (streamName: string): (() => number) => {
      if (!streams[streamName]) {
        streams[streamName] = () => {
          seed = (seed * 9301 + 49297) % 233280; // Simple LCG
          return seed / 233280;
        };
      }
      return streams[streamName];
    }
  };
}

// Example: Seed RNG for mutation selection
const blockData = await bitcoinService.fetchBlockData(800000);
const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
const randomValue = rng(); // Deterministic random number [0, 1)
```

### Usage in Evolution
```typescript
// src/domains/evolution/services/evolutionService.ts
class EvolutionService {
  async evaluateTriggers(creature: ICreature, blockData: IBlockData): Promise<void> {
    const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
    if (rng() < 0.1) { // 10% chance per confirmation
      const mutation = traitService.assignTrait({ role: Role.MOVEMENT, id: `mutation-${blockData.nonce}` }, blockData, 'mutation');
      await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
    }
  }
}
```

## Handling Block Confirmations
Block confirmations trigger evolutionary events, such as mutations, by indicating blockchain stability.

### Steps
1. **Monitor Confirmations**:
   - Use `blockData.confirmations` from `bitcoinService.fetchBlockData` to track confirmation count.
2. **Define Trigger Logic**:
   - Implement logic in `evolutionService.ts` to activate triggers based on confirmation thresholds (e.g., 10% chance per confirmation).
3. **Optimize Frequency**:
   - Cache confirmation data and throttle checks to once per block (approximately every 10 minutes).

### Example Code
```typescript
// src/domains/evolution/services/evolutionService.ts
class EvolutionService {
  async evaluateTriggers(creature: ICreature, blockData: IBlockData): Promise<void> {
    const confirmations = blockData.confirmations || 0;
    if (confirmations === 0) return; // Skip unconfirmed blocks
    const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
    if (rng() < 0.1 * confirmations) { // Scaled chance
      const mutation = traitService.assignTrait({ role: Role.DEFENSE, id: `mutation-${blockData.nonce}` }, blockData, 'mutation');
      await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
    }
  }
}
```

## Best Practices for API Interactions
- **Rate Limiting**: Respect ordinals.com API limits (e.g., 60 requests per minute). Implement exponential backoff for 429 errors.
- **Caching**: Cache block data in `bitcoinService.ts` to reduce API calls, storing in memory or IndexedDB via `StorageService.ts` [Timestamp: April 16, 2025, 21:41].
- **Error Handling**: Log errors and provide fallbacks (e.g., use cached data or mock data for testing).
- **Testing**: Use mock block data in tests (e.g., `tests/mocks.ts`) to simulate API responses without live calls.
- **Performance**: Batch API requests for multiple block heights to minimize latency, especially for initial creature generation.

### Example Test
```typescript
// tests/unit/bitcoinService.test.ts
describe('BitcoinService', () => {
  test('fetches block data with correct nonce', async () => {
    const mockData = { height: 800000, nonce: '123456', confirmations: 6, timestamp: '2023-10-01T12:00:00Z' };
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    } as Response);
    const blockData = await bitcoinService.fetchBlockData(800000);
    expect(blockData.nonce).toBe('123456');
    expect(blockData.confirmations).toBe(6);
  });

  test('caches block data to avoid duplicate calls', async () => {
    const mockData = { height: 800000, nonce: '123456', confirmations: 6, timestamp: '2023-10-01T12:00:00Z' };
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData
    } as Response);
    await bitcoinService.fetchBlockData(800000);
    await bitcoinService.fetchBlockData(800000);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Cached
  });
});
```

## Performance Considerations
- **Minimize API Calls**: Cache block data for frequently accessed heights to avoid redundant requests.
- **Batch Processing**: Fetch multiple blocks in a single API call when initializing creatures for multiple players.
- **Off-Thread RNG**: Perform RNG calculations in `computeWorker.ts` to offload the main thread [Timestamp: April 14, 2025, 19:58].
- **Throttle Confirmations**: Check confirmations only on new block arrivals (e.g., every 10 minutes) to reduce processing overhead.

## Integration Points
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` fetches and caches block data.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionService.ts` uses block data for triggers and RNG seeding.
- **Traits Domain (`src/domains/traits/`)**: `traitService.ts` uses seeded RNG for mutation selection.
- **Workers Domain (`src/domains/workers/`)**: `computeWorker.ts` offloads RNG and trigger calculations.
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` persists cached block data to IndexedDB [Timestamp: April 16, 2025, 21:41].

## Troubleshooting
- **API Rate Limits**: If HTTP 429 errors occur, increase retry delays or reduce fetch frequency.
- **Non-Deterministic RNG**: Verify nonce seeding in `rngSystem.ts` and ensure consistent block data inputs.
- **Missing Confirmations**: Check API response for `confirmations` field; fall back to 0 if undefined.
- **Testing Issues**: Use `tests/mocks.ts` to mock `bitcoinService.ts` responses for reliable tests.


