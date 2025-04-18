
# Phase 3: Trait and Mutation Systems

## Purpose
This document outlines the third phase of the Bitcoin Protozoa project, focusing on implementing and migrating the **trait** and **mutation** systems to the new `src` directory. These systems are essential for creature evolution and diversity, integrating directly with the RNG system to ensure deterministic outcomes based on Bitcoin block nonces.

## Location
`docs/implementation_phases/phase_3.md`

## Overview
Phase 3 involves developing and migrating two critical systems:
- **Trait System**: Manages VISUAL, FORMATION, and BEHAVIOR traits with rarity tiers (e.g., COMMON, RARE, MYTHIC), influencing creature characteristics and abilities.
- **Mutation System**: Handles mutation triggers and effects, allowing creatures to evolve over time based on probabilistic events tied to block confirmations.

Both systems must:
- Integrate with the RNG system’s streams (`traits`, `mutation`) for deterministic selection and triggering.
- Adhere to performance standards (e.g., trait selection < 1ms, mutation checks < 1ms).
- Be modular, encapsulated within their respective domains (`src/domains/traits/`, `src/domains/mutation/`).

This phase also includes migrating relevant code from `old_src` to the new `src` directory, refactoring it to TypeScript and aligning with the DDD structure.

## Checklist
- [ ] **Implement Trait System**:
  - Develop `traitService.ts` to manage trait categories (VISUAL, FORMATION, BEHAVIOR) and rarity tiers.
  - Implement trait selection logic using the `traits` RNG stream.
  - Write unit tests for trait selection determinism and performance.
  - **Acceptance Criteria**: Trait selection is deterministic for the same RNG seed, completes in < 1ms.
- [ ] **Migrate Trait Logic from `old_src`**:
  - Identify trait-related files in `old_src` (e.g., `old_src/traits.js`).
  - Refactor to TypeScript and integrate with `traitService.ts`.
  - **Acceptance Criteria**: Migrated trait logic functions correctly and passes tests.
- [ ] **Implement Mutation System**:
  - Develop `mutationService.ts` to handle mutation triggers and effects based on block confirmations.
  - Use the `mutation` RNG stream for probabilistic mutation checks.
  - Write unit tests for mutation trigger determinism and performance.
  - **Acceptance Criteria**: Mutation checks are deterministic, complete in < 1ms.
- [ ] **Migrate Mutation Logic from `old_src`**:
  - Locate mutation-related files in `old_src` (e.g., `old_src/mutations.js`).
  - Refactor to TypeScript and integrate with `mutationService.ts`.
  - **Acceptance Criteria**: Migrated mutation logic functions correctly and passes tests.
- [ ] **Integrate with RNG System**:
  - Ensure `traitService.ts` and `mutationService.ts` use appropriate RNG streams.
  - Validate integration with unit and integration tests.
  - **Acceptance Criteria**: Systems correctly use RNG streams, outcomes are deterministic.

## Migration Tasks
- [ ] **Analyze `old_src` for Trait and Mutation Logic**:
  - Identify files related to traits and mutations (e.g., `old_src/traits.js`, `old_src/mutations.js`).
  - Document dependencies and integration points for refactoring.
- [ ] **Refactor and Migrate Trait Logic**:
  - Convert `old_src/traits.js` to TypeScript, align with `traitService.ts`.
  - Update any dependent systems to use the new trait service.
- [ ] **Refactor and Migrate Mutation Logic**:
  - Convert `old_src/mutations.js` to TypeScript, align with `mutationService.ts`.
  - Ensure integration with block confirmation logic and RNG.

## Documentation References
- `docs/systems/trait/*`: Guides trait system implementation and migration.
- `docs/systems/mutation/*`: Details mutation system requirements and migration.
- `docs/systems/rng/*`: Provides context for RNG integration.
- `docs/references/coding_standards.md`: Ensures code quality and consistency.

## PowerShell Scripts
Scripts are located in `docs/implementation_phases/scripts/phase_3/` and automate scaffolding and migration tasks.

1. **scaffold_trait_system.ps1**:
   - **Purpose**: Creates directories and boilerplate files for the trait system.
   - **Content**:
     ```powershell
     New-Item -ItemType Directory -Path "src/domains/traits/services" -Force
     New-Item -ItemType Directory -Path "src/domains/traits/interfaces" -Force
     Set-Content -Path "src/domains/traits/services/traitService.ts" -Value "class TraitService { /* Implementation */ }"
     Set-Content -Path "tests/unit/traitService.test.ts" -Value "describe('TraitService', () => { /* Tests */ })"
     ```
   - **Execution**: `.\scaffold_trait_system.ps1`

2. **scaffold_mutation_system.ps1**:
   - **Purpose**: Creates directories and boilerplate files for the mutation system.
   - **Content**:
     ```powershell
     New-Item -ItemType Directory -Path "src/domains/mutation/services" -Force
     New-Item -ItemType Directory -Path "src/domains/mutation/interfaces" -Force
     Set-Content -Path "src/domains/mutation/services/mutationService.ts" -Value "class MutationService { /* Implementation */ }"
     Set-Content -Path "tests/unit/mutationService.test.ts" -Value "describe('MutationService', () => { /* Tests */ })"
     ```
   - **Execution**: `.\scaffold_mutation_system.ps1`

3. **migrate_traits.ps1**:
   - **Purpose**: Copies and refactors trait logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/traits.js" -Destination "src/domains/traits/services/traitService.ts"
     # Add commands to refactor to TypeScript, integrate with RNG, etc.
     Write-Host "Refactor traitService.ts to use RNG streams and TypeScript."
     ```
   - **Execution**: `.\migrate_traits.ps1`

4. **migrate_mutations.ps1**:
   - **Purpose**: Copies and refactors mutation logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/mutations.js" -Destination "src/domains/mutation/services/mutationService.ts"
     # Add commands to refactor to TypeScript, integrate with RNG, etc.
     Write-Host "Refactor mutationService.ts to use RNG streams and TypeScript."
     ```
   - **Execution**: `.\migrate_mutations.ps1`

## Dependencies
- **TypeScript**: For type-safe development.
- **Jest**: For unit and integration testing.
- **PowerShell**: For script execution.

## Milestones
- Trait system functional, selecting traits deterministically based on RNG.
- Mutation system functional, triggering mutations deterministically based on RNG and block confirmations.
- Both systems fully migrated from `old_src`, refactored, and passing all tests.
- Performance targets met: trait selection and mutation checks < 1ms.

## Example: Trait Selection
The trait system uses the `traits` RNG stream to select traits based on rarity:
```typescript
// src/domains/traits/services/traitService.ts
class TraitService {
  private readonly rarityThresholds = { COMMON: 0.7, RARE: 0.9, MYTHIC: 1.0 };

  selectTrait(rngStream: RNGStream): ITrait {
    const random = rngStream.next();
    if (random < this.rarityThresholds.COMMON) return { id: 'basic_glow', type: 'VISUAL', rarity: 'COMMON' };
    if (random < this.rarityThresholds.RARE) return { id: 'spiral_charge', type: 'FORMATION', rarity: 'RARE' };
    return { id: 'ethereal_glow', type: 'VISUAL', rarity: 'MYTHIC' };
  }
}
```

## Testing Focus
- **Determinism**: Ensure the same RNG seed produces the same trait or mutation outcome.
- **Performance**: Verify that trait selection and mutation checks complete in < 1ms.
- **Integration**: Confirm that both systems correctly use their respective RNG streams without interference.