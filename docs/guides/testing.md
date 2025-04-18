
# Testing Guide for Bitcoin Protozoa

## Introduction
This document outlines the testing strategy for Bitcoin Protozoa, a particle-based life simulation powered by Bitcoin block data and deployed on-chain via recursive inscriptions using the ordinals protocol. Comprehensive testing ensures deterministic behavior, performance, and reliability, critical for both real-time visualization and on-chain consistency. This guide is designed for developers and coding AIs to maintain the project's integrity.

## Testing Strategy
The testing approach includes:

- **Unit Testing**: Validates individual components like the random number generator (RNG) and Bitcoin service.
- **Integration Testing**: Verifies that systems (e.g., creature generation, Bitcoin integration) work together seamlessly.
- **Performance Testing**: Ensures efficient rendering and computation, targeting 60 FPS for 500-particle creatures.
- **Determinism Testing**: Confirms consistent outputs for identical inputs, essential for on-chain deployment.
- **Edge Case Testing**: Handles invalid inputs, API failures, and unusual scenarios gracefully.

## Testing Tools
- **Jest**: Primary framework for unit and integration tests, configured in `jest.config.js`.
- **React Testing Library**: Tests React UI components for reliability.
- **Mocks**: `jest.mock` simulates external APIs (e.g., ordinals.com) for isolated testing.
- **Coverage**: `npm run test:coverage` generates reports to assess test completeness.

## Test Structure
Tests are organized as follows:
- **`tests/unit/`**: Contains unit tests for individual modules (e.g., `rngSystem.test.ts`).
- **`tests/integration/`**: Houses integration tests for system-wide interactions (e.g., `creatureGeneration.test.ts`).

## Writing Tests
Follow these guidelines:
- **Naming**: Use `<filename>.test.ts` (e.g., `bitcoinService.test.ts`).
- **Structure**: Adopt the Arrange-Act-Assert pattern:
  1. **Arrange**: Set up test conditions.
  2. **Act**: Execute the function or action.
  3. **Assert**: Verify the outcome.
- **Determinism**: Ensure identical inputs yield identical outputs.
- **Edge Cases**: Test invalid block numbers, API errors, etc.
- **Examples**:

### Unit Test Example: RNG System
```typescript
import { createRNGFromBlock } from '../../src/lib/rngSystem';

describe('RNGSystem', () => {
  test('produces deterministic output', () => {
    const rng1 = createRNGFromBlock(12345).getStream('traits')();
    const rng2 = createRNGFromBlock(12345).getStream('traits')();
    expect(rng1).toEqual(rng2);
  });

  test('produces different streams for different domains', () => {
    const rngSystem = createRNGFromBlock(12345);
    const traitsStream = rngSystem.getStream('traits')();
    const particlesStream = rngSystem.getStream('particles')();
    expect(traitsStream).not.toEqual(particlesStream);
  });
});
```

### Integration Test Example: Creature Generation
```typescript
import { BitcoinService } from '../../src/services/bitcoin/bitcoinService';
import { CreatureGenerator } from '../../src/services/creatures/creatureGenerator';

jest.mock('../../src/services/bitcoin/bitcoinService');

describe('Creature Generation', () => {
  test('generates creature deterministically', async () => {
    BitcoinService.prototype.fetchBlockData.mockResolvedValue({ nonce: 12345, confirmations: 10000 });
    const generator = new CreatureGenerator();
    const creature1 = await generator.generateCreature(800000);
    const creature2 = await generator.generateCreature(800000);
    expect(creature1).toEqual(creature2);
  });
});
```

## Running Tests
- **Run All Tests**: `npm run test`
- **Run Specific Tests**: `npm run test <file-pattern>` (e.g., `npm run test rngSystem`)
- **Check Coverage**: `npm run test:coverage`

## Performance Testing
- **Rendering**: Use Three.js `Stats` to monitor FPS:
  ```typescript
  import Stats from 'three/examples/jsm/libs/stats.module.js';
  const stats = new Stats();
  document.body.appendChild(stats.dom);
  // Update in render loop: stats.update();
  ```
- **Computation**: Measure critical paths with `performance.now()`:
  ```typescript
  const start = performance.now();
  const result = computeExpensiveOperation();
  console.log(`Operation took ${performance.now() - start} ms`);
  ```
- **On-Chain Data**: Assess inscription size to ensure blockchain compatibility.

## Best Practices
- Write tests for all new features and bug fixes.
- Target 80%+ coverage for critical systems (RNG, Bitcoin integration, rendering).
- Mock external APIs to isolate tests.
- Verify determinism with repeated input-output checks.
- Document test cases and outcomes in this guide.

## Conclusion
This testing strategy ensures Bitcoin Protozoa remains robust, performant, and deterministic, supporting its goals of real-time simulation and on-chain deployment. Regular testing with these practices maintains project stability as it evolves.


