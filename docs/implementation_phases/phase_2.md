It seems there might be a misunderstanding in your query. You’ve asked to "move on to Phase 2," but the thinking trace I’ve been provided already contains the complete document for **Phase 2: Core Systems Development** of the Bitcoin Protozoa project. Since the artifact for Phase 2 is fully developed, I’ll assume you’d like me to provide it as the response. Below is the full Phase 2 document, as requested, wrapped appropriately.


# Phase 2: Core Systems Development

## Purpose
This document outlines the second phase of the Bitcoin Protozoa project, focusing on implementing and migrating the foundational systems—**RNG**, **physics**, and **storage**—to the new `src` directory. It ensures these systems meet the project's requirements for determinism, performance, and modularity while preparing for integration with other systems like traits, mutations, and the controller UI.

## Location
`docs/implementation_phases/phase_2_core_systems.md`

## Overview
Phase 2 involves developing and migrating the core systems that form the backbone of Bitcoin Protozoa:
- **RNG System**: Implements deterministic pseudo-random number generation using the Mulberry32 algorithm seeded by Bitcoin block nonces.
- **Physics System**: Manages particle dynamics with role-specific mechanics and spatial partitioning for performance.
- **Storage System**: Handles IndexedDB persistence for creature states and RNG seeds to support session replay.

These systems must adhere to the project's rules:
- **Determinism**: Same block nonce produces the same outcomes.
- **Performance**: RNG calls < 1ms, physics updates < 5ms, storage operations < 10ms.
- **Modularity**: Systems are encapsulated within their respective domains (`src/domains/rng/`, `src/domains/creature/`, `src/shared/`).

This phase also includes migrating relevant code from `old_src` to the new `src` directory, refactoring it to align with the DDD structure and coding standards.

## Checklist
- [ ] **Implement RNG System**:
  - Develop `rngSystem.ts` with Mulberry32 and nonce-based seeding.
  - Implement streams for `traits`, `physics`, `formation`, etc.
  - Write unit tests for determinism and performance.
  - **Acceptance Criteria**: RNG produces consistent sequences for the same nonce, generation time < 1ms.
- [ ] **Migrate RNG from `old_src`**:
  - Identify RNG logic in `old_src` (e.g., `old_src/lib/rng.js`).
  - Refactor to TypeScript, integrate with `rngSystem.ts`.
  - **Acceptance Criteria**: Migrated RNG passes determinism and performance tests.
- [ ] **Implement Physics System**:
  - Develop `particleService.ts` for particle dynamics with spatial partitioning.
  - Implement role-specific mechanics (e.g., DEFENSE particles in "Shield Wall").
  - Write unit tests for physics accuracy and performance.
  - **Acceptance Criteria**: Physics updates for 500 particles < 5ms, consistent behavior for same inputs.
- [ ] **Migrate Physics from `old_src`**:
  - Locate physics code in `old_src` (e.g., `old_src/creatures/particle.js`).
  - Refactor to TypeScript, integrate with `particleService.ts`.
  - **Acceptance Criteria**: Migrated physics maintains functionality and performance.
- [ ] **Implement Storage System**:
  - Develop `StorageService.ts` for IndexedDB persistence of creature states and RNG seeds.
  - Implement batch writes and error handling.
  - Write tests for data integrity and performance.
  - **Acceptance Criteria**: Storage operations < 10ms, data persists correctly across sessions.
- [ ] **Migrate Storage from `old_src`**:
  - Find storage logic in `old_src` (e.g., `old_src/lib/storage.js`).
  - Refactor to TypeScript, integrate with `StorageService.ts`.
  - **Acceptance Criteria**: Migrated storage handles data correctly, passes tests.

## Migration Tasks
- [ ] **Analyze `old_src` for Core Systems**:
  - Identify files related to RNG, physics, and storage (e.g., `old_src/lib/rng.js`, `old_src/creatures/particle.js`, `old_src/lib/storage.js`).
  - Document dependencies and integration points for refactoring.
- [ ] **Refactor and Migrate RNG**:
  - Convert `old_src/lib/rng.js` to TypeScript, align with `rngSystem.ts`.
  - Update any dependent systems to use the new RNG streams.
- [ ] **Refactor and Migrate Physics**:
  - Refactor `old_src/creatures/particle.js` to `particleService.ts`, ensuring role-specific logic is preserved.
  - Integrate spatial partitioning for performance improvements.
- [ ] **Refactor and Migrate Storage**:
  - Migrate `old_src/lib/storage.js` to `StorageService.ts`, enhancing with batch operations and error handling.
  - Update creature and RNG systems to use the new storage service.

## Documentation References
- `docs/systems/rng/*`: Guides RNG implementation and migration.
- `docs/systems/physics/*`: Details physics system requirements and migration.
- `docs/systems/storage/*`: Outlines storage system setup and migration.
- `docs/references/coding_standards.md`: Ensures code quality and consistency.

## PowerShell Scripts
Scripts are located in `docs/implementation_phases/scripts/phase_2/` and automate scaffolding and migration tasks.

1. **scaffold_core_systems.ps1**:
   - **Purpose**: Creates directories and boilerplate files for RNG, physics, and storage systems.
   - **Content**:
     ```powershell
     $systems = @("rng", "creature", "shared")
     foreach ($system in $systems) {
         New-Item -ItemType Directory -Path "src/domains/$system/services" -Force
         New-Item -ItemType Directory -Path "src/domains/$system/interfaces" -Force
     }

     # Create boilerplate files
     Set-Content -Path "src/domains/rng/services/rngSystem.ts" -Value "class RNGSystem { /* Implementation */ }"
     Set-Content -Path "src/domains/creature/services/particleService.ts" -Value "class ParticleService { /* Implementation */ }"
     Set-Content -Path "src/shared/services/StorageService.ts" -Value "class StorageService { /* Implementation */ }"

     # Create test files
     Set-Content -Path "tests/unit/rngSystem.test.ts" -Value "describe('RNGSystem', () => { /* Tests */ })"
     Set-Content -Path "tests/unit/particleService.test.ts" -Value "describe('ParticleService', () => { /* Tests */ })"
     Set-Content -Path "tests/unit/StorageService.test.ts" -Value "describe('StorageService', () => { /* Tests */ })"
     ```
   - **Execution**: `.\scaffold_core_systems.ps1`

2. **migrate_rng.ps1**:
   - **Purpose**: Copies and refactors RNG logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/lib/rng.js" -Destination "src/domains/rng/services/rngSystem.ts"
     # Additional refactoring commands (e.g., rename variables, update imports)
     Write-Host "Refactor rngSystem.ts to TypeScript and integrate with Mulberry32."
     ```
   - **Execution**: `.\migrate_rng.ps1`

3. **migrate_physics.ps1**:
   - **Purpose**: Migrates physics logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/creatures/particle.js" -Destination "src/domains/creature/services/particleService.ts"
     # Refactor to TypeScript, integrate spatial partitioning
     Write-Host "Update particleService.ts with role-specific mechanics."
     ```
   - **Execution**: `.\migrate_physics.ps1`

4. **migrate_storage.ps1**:
   - **Purpose**: Moves storage logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/lib/storage.js" -Destination "src/shared/services/StorageService.ts"
     # Enhance with batch operations and error handling
     Write-Host "Refactor StorageService.ts for IndexedDB persistence."
     ```
   - **Execution**: `.\migrate_storage.ps1`

## Dependencies
- **TypeScript**: For type-safe development.
- **Jest**: For unit testing.
- **fake-indexeddb**: For mocking IndexedDB in tests.
- **PowerShell**: For script execution.

## Milestones
- RNG system functional with deterministic seeding and streams.
- Physics system handles 500 particles with < 5ms updates.
- Storage system persists data with < 10ms operations.
- All systems migrated from `old_src`, refactored, and passing tests.
