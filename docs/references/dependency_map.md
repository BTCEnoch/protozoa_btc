Below is a comprehensive dependency mapping for the Bitcoin Protozoa project, detailing how dependencies are imported and exported across the directory structure. This mapping outlines how components are plugged in and communicate, with notations on the purpose and benefits of each design choice. It’s designed to be modular, manageable, and easily expandable.


# Dependency Mapping for Bitcoin Protozoa

This document provides a clean and detailed mapping of dependency imports and exports for the Bitcoin Protozoa project. It ensures modularity, clear communication paths, and scalability, with annotations explaining the purpose and benefits of each design choice.

---

## Directory Structure Overview

- **`src/shared/`**: Central utilities and types used across domains.
- **`src/domains/`**: Domain-specific logic (e.g., `creature/`, `traits/`, `bitcoin/`).
- **`src/app/`**: Application-wide contexts and entry points.
- **`workers/`**: Web workers for performance optimization.
- **`tests/`**: Mocks and fixtures for testing.

---

## 1. Shared Utilities and Types
- **Location**: `src/shared/`
- **Purpose**: Centralizes common functionality and types to avoid duplication and ensure consistency.
- **Exports**:
  - `types/core.ts`: 
    - Exports: `Role` (enum), `Rarity` (enum), `IBlockData` (interface).
    - **Purpose**: Defines core data structures used across domains.
    - **Benefit**: Ensures type safety and consistency.
  - `lib/rngSystem.ts`: 
    - Exports: `createRNGFromBlock`, `getStream`.
    - **Purpose**: Provides deterministic RNG based on Bitcoin block data.
    - **Benefit**: Enables reproducible randomness for on-chain integration.
  - `utils/math.ts`: 
    - Exports: `clamp`, `lerp`.
    - **Purpose**: Offers reusable math utilities.
    - **Benefit**: Reduces redundant code across domains.
  - `constants/config.ts`: 
    - Exports: `MAX_PARTICLES`, `BLOCK_SIZE`.
    - **Purpose**: Stores global configuration values.
    - **Benefit**: Centralizes constants for easy updates.
- **Imports**: None (standalone utilities).
- **Design Choice**: Barrel export via `src/shared/index.ts` (`export * from './types/core';`).
  - **Benefit**: Simplifies imports (e.g., `import { Role } from 'src/shared';`).

---

## 2. Domain-Specific Dependencies
Each domain (e.g., `creature/`, `traits/`, `bitcoin/`) is self-contained with its own subdirectories.

### Example: `creature/` Domain
- **Location**: `src/domains/creature/`
- **Structure**:
  - `types/creature.ts`: 
    - Exports: `ICreature` (interface).
    - **Purpose**: Defines creature data structure.
    - **Benefit**: Type safety within the domain.
  - `models/creature.ts`: 
    - Exports: `CreatureModel` (class).
    - Imports: `src/shared/types/core.ts` (`Rarity`, `Role`).
    - **Purpose**: Encapsulates creature data logic.
    - **Benefit**: Separates data from business logic.
  - `services/creatureGenerator.ts`: 
    - Exports: `CreatureGenerator` (class).
    - Imports: `src/domains/bitcoin/services/bitcoinService.ts`, `src/shared/lib/rngSystem.ts`.
    - **Purpose**: Generates creatures using block data and RNG.
    - **Benefit**: Centralizes generation logic for reuse.
  - `components/CreatureViewer.tsx`: 
    - Exports: `CreatureViewer` (React component).
    - Imports: `src/domains/creature/models/creature.ts`.
    - **Purpose**: Renders creature visuals.
    - **Benefit**: UI logic is isolated from business logic.
  - `hooks/useCreature.ts`: 
    - Exports: `useCreature` (hook).
    - Imports: `src/domains/creature/models/creature.ts`.
    - **Purpose**: Manages creature state in React.
    - **Benefit**: Simplifies state management in components.
- **Design Choice**: Each domain uses a barrel file (`index.ts`) to aggregate exports.
  - **Benefit**: Clean imports (e.g., `import { CreatureGenerator } from 'src/domains/creature';`).

---

## 3. Cross-Domain Communication
- **Event Bus**: `src/shared/lib/eventBus.ts`
  - Exports: `publish`, `subscribe`.
  - **Purpose**: Facilitates decoupled communication between domains.
  - **Usage**: `creature` publishes `creatureGenerated`, `traits` subscribes.
  - **Benefit**: Reduces direct dependencies, improving testability.
- **Contexts**: `src/app/contexts/SettingsContext.ts`
  - Exports: `SettingsProvider`, `useSettings`.
  - **Purpose**: Manages global state (e.g., user preferences).
  - **Benefit**: Avoids prop drilling, centralizes state.

---

## 4. Dependency Injection
- **Tool**: TypeDI (`src/lib/typedi.ts`).
- **Usage Example**:
  ```typescript
  import { Service, Inject } from 'typedi';
  import { BitcoinService } from 'src/domains/bitcoin/services/bitcoinService';

  @Service()
  export class CreatureGenerator {
    @Inject()
    private bitcoinService: BitcoinService;

    async generateCreature(blockNumber: number) {
      const blockData = await this.bitcoinService.fetchBlockData(blockNumber);
      return this.createCreature(blockData);
    }
  }
  ```
- **Purpose**: Manages service dependencies dynamically.
- **Benefit**: Loose coupling, easier mocking for tests.

---

## 5. Data Flow and Integration
- **Bitcoin to RNG**:
  - `bitcoin/services/bitcoinService.ts` → `shared/lib/rngSystem.ts`.
  - **Purpose**: Fetches block data to seed RNG.
  - **Benefit**: Deterministic and reproducible randomness.
- **RNG to Traits**:
  - `shared/lib/rngSystem.ts` → `traits/services/traitService.ts`.
  - **Purpose**: Generates traits from RNG streams.
  - **Benefit**: Ensures unique, block-based traits.
- **Traits to Creature**:
  - `traits/services/traitService.ts` → `creature/services/creatureGenerator.ts`.
  - **Purpose**: Applies traits to creatures.
  - **Benefit**: Modular trait application.

---

## 6. Rendering and Performance
- **Rendering Services**: `rendering/services/renderingService.ts`
  - Exports: `renderScene`.
  - Imports: `src/domains/creature/models/creature.ts`.
  - **Purpose**: Handles rendering logic.
  - **Benefit**: Separates rendering from UI for optimization.
- **Web Workers**: `workers/services/creaturePhysicsWorker.ts`
  - Exports: `computePhysics`.
  - **Purpose**: Offloads physics calculations.
  - **Benefit**: Improves performance by parallelizing tasks.

---

## 7. Testing and Mocks
- **Mocks**: `tests/mocks/bitcoinServiceMock.ts`
  - Exports: `BitcoinServiceMock`.
  - **Purpose**: Simulates `bitcoinService` for tests.
  - **Benefit**: Isolates tests from external APIs.
- **Fixtures**: `tests/fixtures/blockData.json`
  - Exports: Sample block data.
  - **Purpose**: Provides consistent test inputs.
  - **Benefit**: Simplifies test setup.

---

## Best Practices for Implementation and Management
1. **Barrel Exports**:
   - Use `index.ts` in each directory to aggregate exports.
   - **Benefit**: Simplifies imports and reduces clutter.
2. **Avoid Circular Dependencies**:
   - Structure imports hierarchically.
   - **Benefit**: Prevents runtime errors.
3. **Lazy Loading**:
   - Use `React.lazy(() => import('./Component'))` for large components.
   - **Benefit**: Reduces initial load time.
4. **Type Safety**:
   - Leverage TypeScript for all modules.
   - **Benefit**: Catches errors at compile time.
5. **Documentation**:
   - Maintain `docs/dependency_map.md` with updates.
   - **Benefit**: Keeps team aligned on structure.

---

## Expansion Guidelines
- **New Domain**:
  1. Add `src/domains/newDomain/`.
  2. Create `types/`, `services/`, etc.
  3. Export via `index.ts`.
  4. Connect via event bus or services.
- **New Service**:
  1. Add to relevant domain’s `services/`.
  2. Use TypeDI for injection.
  3. Export in `index.ts`.
- **New Component**:
  1. Add to domain’s `components/`.
  2. Use hooks/contexts for state.
  3. Export in `index.ts`.

---

This mapping ensures the Bitcoin Protozoa project is modular, scalable, and maintainable, with clear dependency flows and expansion points. Each design choice balances implementation ease with long-term benefits.
