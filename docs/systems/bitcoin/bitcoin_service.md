
# Bitcoin Service

## Overview
The Bitcoin Service is responsible for fetching Bitcoin block data, specifically the nonce and confirmations, from the ordinals.com API. This service is a critical component of the Bitcoin Protozoa project, providing the necessary data to seed the deterministic RNG system and trigger evolution milestones. It adheres to the project's rules by using only the specified API endpoints and extracting only the required fields.

## Implementation
The Bitcoin Service is implemented as a singleton to ensure consistent access to block data across the application. It uses the `/r/blockinfo/${blockNumber}` endpoint to fetch block header data and extracts only the `nonce` and `confirmations` fields. The service also implements caching to optimize performance and reduce API calls.

### Key Features
- **Singleton Pattern**: Ensures a single instance of the service is used throughout the application.
- **API Endpoint Usage**: Uses only the `/r/blockinfo/${blockNumber}` endpoint for block data.
- **Data Extraction**: Extracts only the `nonce` and `confirmations` fields from the block header.
- **Caching**: Caches block data in IndexedDB with a 1-hour expiry to reduce API calls.
- **Error Handling**: Handles API failures gracefully, using mock data for testing.

### Code Example
```typescript
// src/services/bitcoin/bitcoinService.ts
import { Singleton } from 'typescript-singleton';

class BitcoinService extends Singleton {
  private apiBaseUrl = '/r/blockinfo';

  async fetchBlockData(blockNumber: number): Promise<{ nonce: number, confirmations: number }> {
    const response = await fetch(`${this.apiBaseUrl}/${blockNumber}`);
    const data = await response.json();
    return { nonce: data.nonce, confirmations: data.confirmations };
  }
}

export const bitcoinService = BitcoinService.getInstance();
```

## Integration
The Bitcoin Service integrates with the RNG system by providing the nonce for seeding and with the evolution system by providing confirmations for milestone checks. It is used by the creature generation and evolution services to ensure deterministic behavior based on block data.

### Integration Points
- **RNG Seeding**: The nonce is used to seed the `mulberry32` PRNG in the RNG system.
- **Evolution Triggers**: Confirmations are used to check against predefined milestones for triggering mutations.

## Rules Adherence
- Uses only the specified API endpoint: `/r/blockinfo/${blockNumber}`.
- Extracts only the required fields: `nonce` and `confirmations`.
- Fetches block data only once per block number change.
- Maintains determinism by using the nonce for RNG seeding.

