# Bitcoin Protozoa Codebase Cleanup Checklist

This document outlines files, patterns, and code elements that should be cleaned up or removed from the codebase to improve maintainability, reduce confusion, and optimize performance.

## Backup Files

Several backup files were found in the codebase that should be removed:

- `src/domains/particle/services/particleService.ts.backup_20250421_180809`
- `src/domains/particle/services/particleService.ts.backup_20250421_181043`
- `src/domains/workers/services/workerService.ts.backup_20250421_172105`
- `src/domains/workers/services/workerService.ts.backup_20250421_180809`
- `src/domains/workers/services/workerService.ts.backup_20250421_181043`
- `src/domains/workers/services/workerService.ts.backup_20250421_182746`
- `src/domains/workers/utils/workerBridge.ts.backup_20250421_172823`

## Duplicate Test Files

There are duplicate test files in different directories that should be consolidated:

- `src/tests/performance/workerStress.test.ts` and `src/tests/stress/workerStress.test.ts` - These appear to be duplicates and should be consolidated into a single file.

## Deprecated or Problematic Type Definitions

- `src/types/jest.d.ts` - This file appears to have syntax errors or may be redundant with the Jest types provided by `@types/jest`. Consider removing or updating it.

## Unused or Redundant Test Files

The following test files may be deprecated or redundant:

- `src/domains/workers/__tests__/atomicOperations.test.ts` - This test file may be deprecated based on references in scripts.
- `src/domains/workers/__tests__/taskCoordination.test.ts` - May be redundant with other worker tests.
- `src/domains/workers/__tests__/taskSequencing.test.ts` - May be redundant with other worker tests.

## Configuration Improvements

- `.eslintrc.json` - Consider updating to include rules for unused imports and variables.
- `tsconfig.json` - Consider enabling `noUnusedLocals` and `noUnusedParameters` to catch unused code at compile time.

## Code Quality Issues

### Unused Imports and Variables

Based on the codebase analysis, there are likely unused imports and variables in several files. Consider running:

```bash
npm run lint -- --rule 'no-unused-vars: error'
```

### Redundant or Overlapping Utility Functions

- `src/shared/utils/memory/objectReuse.ts` and `src/shared/utils/memory/objectPool.ts` have overlapping functionality. These have been consolidated into `src/shared/utils/memory/objectPooling.ts`.
- `src/shared/utils/diagnostics/workerVisualizer.ts` and other diagnostic tools may have redundant functionality.
- `src/shared/utils/testing/performanceTester.ts`, `src/shared/utils/monitoring/performanceTracker.ts`, and `src/shared/utils/performance/profiler.ts` have overlapping functionality. A unified performance API has been created in `src/shared/utils/performance/unified.ts`. See `docs/monitoring/performance_utilities_consolidation.md` for the consolidation plan and progress.

## Testing Framework Improvements

- Consider consolidating test directories to follow a more consistent pattern (e.g., `__tests__` directories vs. `tests/` directories).
- Remove or fix failing tests that are causing confusion during development.

## Documentation Cleanup

- Update documentation to remove references to deprecated files or approaches.
- Ensure all documentation accurately reflects the current state of the codebase.

## Build and Script Cleanup

- Review and consolidate PowerShell scripts in the `scripts/` directory.
- Remove any scripts that are no longer needed or are creating redundant files.

## Performance Optimization

- Review and remove any unused code paths that may be impacting performance.
- Ensure that memory management utilities are being used consistently.

## Comprehensive Cleanup Checklist

The following checklist addresses all identified issues in the codebase, broken down into manageable chunks to prevent system freezing.

### Chunk 1: Clean Up Duplicate Mock Files

- [x] Create a script to clean up duplicate compiled mock files:
  ```powershell
  # clean-mocks.ps1
  Remove-Item -Path "dist/domains/bitcoin/__mocks__" -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -Path "dist/domains/physics/__mocks__" -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -Path "dist/domains/rng/__mocks__" -Recurse -Force -ErrorAction SilentlyContinue
  ```

- [x] Add a pre-test script in package.json:
  ```json
  "scripts": {
    "clean:mocks": "powershell -File ./scripts/clean-mocks.ps1",
    "test": "npm run clean:mocks && jest"
  }
  ```

- [x] Update Jest configuration in package.json or jest.config.js to properly handle TypeScript mock files:
  ```json
  "jest": {
    "moduleNameMapper": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    }
  }
  ```

### Chunk 2: Fix Missing Dependencies for Visual Tests

- [x] Install missing dependencies:
  ```bash
  npm install --save-dev puppeteer jest-image-snapshot
  ```

- [x] Update Jest setup file to include jest-image-snapshot:
  ```javascript
  // jest.setup.js
  const { toMatchImageSnapshot } = require('jest-image-snapshot');
  expect.extend({ toMatchImageSnapshot });
  ```

- [x] Update Jest configuration to use the setup file:
  ```json
  "jest": {
    "setupFilesAfterEnv": ["./jest.setup.js"]
  }
  ```

### Chunk 3: Fix Creature Domain Issues

- [x] Fix unused variables in creatureFactory.ts:
  - Remove or use `logger` variable
  - Remove unused `rngStream` parameter or implement its usage

- [x] Fix creatureService.ts:
  - Remove unused `camera` field or implement its usage

- [x] Fix missing particleService module:
  - Create a basic implementation of particleService.ts or
  - Remove the import from index.ts

- [x] Clean up unused imports in creature.ts:
  - Remove unused `Rarity` and `Tier` imports

### Chunk 4: Fix ProgressiveLoader Issues

- [x] Fix THREE.Frustum constructor in progressiveLoader.ts:
  ```typescript
  // Before
  private frustum: THREE.Frustum = new THREE.Frustum();

  // After
  private frustum: THREE.Frustum = new THREE.Frustum(
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane(),
    new THREE.Plane()
  );
  ```

- [x] Fix unused parameter and method:
  - Use or remove parameter `creature` in `loadCreatureStage` method
  - Use or remove method `isVisible`

### Chunk 5: Fix Evolution and Group Domain Issues

- [x] Fix Evolution domain:
  - Remove unused import `BlockData` from evolution.ts

- [x] Fix Group domain:
  - Remove unused import `BASE_PARTICLES_PER_GROUP` from particleDistributionService.ts
  - Remove or implement usage of `traitRepository` field in traitAssignmentService.ts

### Chunk 6: Fix Particle Domain Issues

- [x] Clean up particleService.ts interface:
  - Remove unused import `Particle`

- [x] Clean up particleService.ts:
  - Remove unused import `getTraitService`

- [x] Clean up particleSystemService.ts:
  - Remove unused imports `Particle` and `ParticleUpdateResult`

### Chunk 7: Fix Physics Domain Issues

- [x] Fix PhysicsConfig issue:
  - Add missing export to types.ts:
    ```typescript
    export interface PhysicsConfig {
      // Add appropriate properties
      gravity?: number;
      friction?: number;
      // etc.
    }
    ```
  - Or update the import in the mock to use the correct path

- [x] Remove unused field `accumulator` in physicsService.ts mock

### Chunk 8: Fix Game Theory Domain Issues - Part 1

- [x] Clean up gameTheoryService.ts:
  - Remove unused imports `GameTheorySimulationConfig` and `GameTheorySimulationResults`
  - Remove or use parameters `playerPayoff` and `opponentPayoff`

- [x] Clean up simulationService.ts:
  - Remove unused imports `OutcomeType` and `GameTheoryPlayer`
  - Remove or use parameter `config`

### Chunk 9: Fix Game Theory Domain Issues - Part 2

- [x] Clean up strategyFactoryService.ts:
  - Remove or use parameter `history` in multiple methods

- [x] Add explicit type for parameter `strategy` in gameTheory.ts:
  ```typescript
  return playerStrategies.flatMap((strategy: StrategyType) => {
    // implementation
  });
  ```

### Chunk 10: Create Missing Game Theory Type Modules

- [x] Create payoffMatrix.ts:
  ```typescript
  // src/domains/gameTheory/types/gameTheory/payoffMatrix.ts
  export interface PayoffMatrix {
    // Add appropriate properties
    rows: number;
    cols: number;
    values: number[][];
  }
  ```

- [x] Create nashEquilibrium.ts:
  ```typescript
  // src/domains/gameTheory/types/gameTheory/nashEquilibrium.ts
  export interface NashEquilibrium {
    // Add appropriate properties
    strategies: [number, number];
    payoffs: [number, number];
  }
  ```

- [x] Create decisionTree.ts:
  ```typescript
  // src/domains/gameTheory/types/gameTheory/decisionTree.ts
  export interface DecisionNode {
    // Add appropriate properties
    id: string;
    choices: string[];
    payoffs: number[];
    children?: DecisionNode[];
  }
  ```

- [x] Create utilityFunction.ts:
  ```typescript
  // src/domains/gameTheory/types/gameTheory/utilityFunction.ts
  export type UtilityFunction = (value: number) => number;

  export const sigmoidNormalizer: UtilityFunction = (value: number) => {
    return 1 / (1 + Math.exp(-value));
  };
  ```

### Chunk 11: Fix Test Initialization Issues

- [x] Fix FormationService initialization before RenderService:
  ```typescript
  // Add to initialization sequence
  const initializeFormationService = async () => {
    console.log('Initializing Formation Service');
    const formationService = getFormationService();
    await formationService.initialize();
    registry.register('FormationService', formationService);
  };

  // Ensure this runs before RenderService initialization
  ```

- [x] Fix Physics service initialization in stress tests:
  ```typescript
  // Add to test setup
  beforeAll(async () => {
    const physicsService = getPhysicsService();
    await physicsService.initialize();
  });
  ```

- [x] Fix worker initialization in worker stress tests:
  ```typescript
  // Add to test setup
  beforeAll(async () => {
    const workerService = getWorkerService();
    await workerService.initialize({
      workerCount: 2,
      taskTimeout: 5000
    });
  });
  ```

### Chunk 12: Add Code Quality Improvements

- [x] Add ESLint rule to catch unused variables and imports:
  ```json
  // .eslintrc.json
  {
    "rules": {
      "no-unused-vars": "error",
      "no-unused-imports": "error"
    }
  }
  ```

- [x] Create a TypeScript check script:
  ```json
  // package.json
  "scripts": {
    "check:types": "tsc --noEmit"
  }
  ```

- [x] Set up pre-commit hook for TypeScript checks:
  ```bash
  npx husky add .husky/pre-commit "npm run check:types"
  ```

- [x] Create a script to run all cleanup tasks:
  ```json
  // package.json
  "scripts": {
    "cleanup:all": "npm run clean:mocks && npm run lint:fix && npm run check:types"
  }
  ```

### Chunk 13: Update Documentation

- [x] Update README.md with new testing procedures:
  ```markdown
  ## Testing

  Before running tests, ensure you clean up any duplicate mock files:

  ```bash
  npm run clean:mocks
  ```

  Then run the tests:

  ```bash
  npm test
  ```
  ```

- [x] Create CONTRIBUTING.md with guidelines for contributors

- [x] Update directory_map.md to reflect new file structure

- [x] Create a troubleshooting guide for common test failures

## Implementation Strategy

1. Start with Chunk 1 (Clean Up Duplicate Mock Files) as this is causing immediate test failures
2. Move to Chunk 2 (Fix Missing Dependencies) to enable visual tests
3. Implement Chunks 3-7 to fix basic unused variables and imports
4. Tackle Chunks 8-10 to address Game Theory domain issues
5. Implement Chunk 11 to fix test initialization issues
6. Finally, implement Chunks 12-13 for code quality improvements and documentation

## Previous Completed Tasks

1. ✅ Remove backup files and duplicate test files.
2. ✅ Update configuration files to catch unused code.
3. ✅ Run linting tools to identify and fix unused imports and variables.
4. ✅ Consolidate overlapping memory management utilities.
5. ✅ Consolidate overlapping performance monitoring utilities (see `docs/monitoring/performance_utilities_consolidation.md`).
   - ✅ Created unified performance API in `src/shared/utils/performance/unified.ts`
   - ✅ Added deprecation warnings to `profiler.ts`
   - ✅ Updated `performanceTester.ts` to use the unified API
   - ✅ Updated `performanceTracker.ts` to use the unified API
   - ✅ Updated existing code to use the unified API
     - ✅ Updated `src/tests/performance/baseline.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/basicFps.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/bitcoinApi.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/basicMemory.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/basicStress.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/renderingPerformance.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/multiCreatureScaling.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/apiCaching.test.ts` to use the unified API
     - ✅ Updated `src/tests/performance/stressTest.ts` to use the unified API
   - ✅ Removed deprecated utilities
     - ✅ Removed `profiler.ts`
     - ✅ Updated `index.ts` to remove the deprecated profiler import
     - ✅ Fixed `benchmark.ts` to remove unused imports
6. 🔄 Fix or remove failing tests.
7. 🔄 Update documentation to reflect changes.
8. 🔄 Standardize test directory structure.
