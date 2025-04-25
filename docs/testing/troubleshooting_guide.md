# Troubleshooting Guide for Common Test Failures

This guide provides solutions for common test failures in the Bitcoin Protozoa project.

## Table of Contents

1. [Duplicate Mock Files](#duplicate-mock-files)
2. [Service Initialization Issues](#service-initialization-issues)
3. [Worker-Related Failures](#worker-related-failures)
4. [RNG Determinism Issues](#rng-determinism-issues)
5. [TypeScript Type Errors](#typescript-type-errors)
6. [Performance Test Failures](#performance-test-failures)
7. [Visual Test Failures](#visual-test-failures)
8. [Cypress Test Failures](#cypress-test-failures)

## Duplicate Mock Files

### Symptoms
- Error messages about duplicate module implementations
- Jest complaining about multiple instances of the same mock

### Solution
Run the clean:mocks script before running tests:

```bash
npm run clean:mocks
```

This script removes duplicate compiled mock files from the dist directory.

Alternatively, run tests with the clean:mocks script automatically:

```bash
npm test
```

## Service Initialization Issues

### Symptoms
- Errors about services not being initialized
- "Cannot read property of undefined" errors when accessing service methods

### Solution
1. Make sure services are properly initialized in the correct order:
   - Bitcoin service should be initialized first
   - RNG service should be initialized after Bitcoin service
   - Group service should be initialized after RNG service
   - Other services should be initialized after these core services

2. Use the service initialization helpers:

```typescript
import { initializeFormationService } from '../helpers/formationServiceHelper';
import { initializePhysicsService } from '../helpers/physicsServiceHelper';
import { initializeWorkerService } from '../helpers/workerServiceHelper';

// Initialize services in the correct order
await initializeFormationService(mockBlockData);
await initializePhysicsService();
await initializeWorkerService();
```

3. Check that the service registry is properly set up:

```typescript
import { registry } from '../../shared/services/serviceRegistry';

// Verify that a service is registered
expect(registry.has('RNGService')).toBe(true);
```

## Worker-Related Failures

### Symptoms
- Timeouts when waiting for worker responses
- "Worker not initialized" errors
- Race conditions in worker communication

### Solution
1. Make sure the worker service is properly initialized:

```typescript
import { initializeWorkerService } from '../helpers/workerServiceHelper';

await initializeWorkerService({ workerCount: 2 });
```

2. Use mock workers in test environment:

```typescript
// In your test setup
jest.mock('../../domains/workers/services/workerService');
```

3. For race conditions, use the concurrency tester:

```typescript
import { testWorkerRaceConditions } from '../helpers/concurrencyTester';

await testWorkerRaceConditions();
```

## RNG Determinism Issues

### Symptoms
- Inconsistent test results with random values
- Tests that pass sometimes and fail other times

### Solution
1. Always set a fixed seed for RNG in tests:

```typescript
import { getRNGService } from '../../domains/rng/services/rngService';

// Set a fixed seed for deterministic results
const rngService = getRNGService();
rngService.setSeed('test-seed-123');
```

2. Use the RNG stream with a fixed seed:

```typescript
const rngStream = rngService.getRNGSystem().getStream('test-stream');
const randomValue = rngStream.nextFloat();
```

3. Mock the RNG service for predictable results:

```typescript
jest.mock('../../domains/rng/services/rngService', () => ({
  getRNGService: jest.fn().mockReturnValue({
    getRandomNumber: jest.fn().mockReturnValue(0.5),
    getRandomInt: jest.fn().mockReturnValue(42)
  })
}));
```

## TypeScript Type Errors

### Symptoms
- TypeScript compilation errors in tests
- "Property does not exist on type" errors
- "Type 'unknown' is not assignable to type" errors

### Solution
1. Use proper type assertions when working with registry:

```typescript
const service = registry.get('ServiceName') as ExpectedType;
```

2. Import the expect function from Jest:

```typescript
import { expect } from '@jest/globals';
```

3. Make sure interfaces are properly defined:

```typescript
// Update interfaces to include all required properties
export interface Creature {
  id: string;
  // ...other properties
  attributes?: Record<AttributeType, number>; // Add missing properties
}
```

## Performance Test Failures

### Symptoms
- Tests failing due to performance thresholds
- Timeouts in performance tests

### Solution
1. Adjust performance thresholds for different environments:

```typescript
// Use different thresholds for CI vs local
const threshold = process.env.CI ? 200 : 100;
expect(executionTime).toBeLessThan(threshold);
```

2. Skip performance tests in CI if necessary:

```typescript
// Skip in CI environment
const testFn = process.env.CI ? test.skip : test;
testFn('should render particles efficiently', () => {
  // Test implementation
});
```

3. Use performance test helpers:

```typescript
import { measurePerformance } from '../helpers/performanceHelper';

const { executionTime, memory } = await measurePerformance(() => {
  // Code to measure
});
```

## Visual Test Failures

### Symptoms
- Image snapshot comparison failures
- "Image differs from snapshot" errors

### Solution
1. Make sure the required dependencies are installed:

```bash
npm install --save-dev puppeteer jest-image-snapshot
```

2. Update snapshots if the UI has intentionally changed:

```bash
npm test -- -u
```

3. Use a consistent environment for visual tests:

```typescript
// Set consistent viewport size
beforeEach(async () => {
  await page.setViewport({ width: 1280, height: 720 });
});
```

## Cypress Test Failures

### Symptoms
- Cypress tests failing with timeout errors
- Element not found errors
- Asynchronous operation issues

### Solution
1. Use proper waiting for elements:

```typescript
// Wait for element to be visible
cy.get('.element').should('be.visible');
```

2. Increase timeout for slow operations:

```typescript
// Increase timeout for this command
cy.get('.slow-loading-element', { timeout: 10000 });
```

3. Run Cypress tests in interactive mode to debug:

```bash
npm run test:e2e:open
```

4. Check Cypress videos and screenshots for visual debugging:

```
src/tests/e2e/videos/
src/tests/e2e/screenshots/
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
