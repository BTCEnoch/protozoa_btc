
# Phase 5: Game Theory and Integration

## Purpose
This document outlines the fifth phase of the Bitcoin Protozoa project, focusing on implementing the **game theory system** for battles and ensuring seamless integration of all systems (e.g., RNG, traits, mutations, physics, visualization, input) for cohesive gameplay. This phase ties together the core systems developed in previous phases, ensuring the simulation functions as a unified whole with deterministic and performant interactions.

## Location
`docs/implementation_phases/phase_5.md`

## Overview
Phase 5 involves two primary objectives:
1. **Implement the Game Theory System**:
   - Develop battle mechanics, including attack, defense, and special abilities influenced by creature traits and mutations.
   - Implement payoff matrices to determine battle outcomes based on creature strategies and traits.
   - Integrate with the RNG system’s `battle` stream for deterministic randomness in battles.
2. **Integrate All Systems**:
   - Ensure cohesive interaction between game theory, traits, mutations, physics, visualization, and input systems.
   - Enable the controller UI to initiate battles and display results.

These systems must:
- Adhere to determinism (same RNG seed → same battle outcomes).
- Maintain performance standards (e.g., battle simulations < 10ms).
- Be modular, encapsulated within `src/domains/gameTheory/`.

This phase also includes migrating relevant game theory code from `old_src` to the new `src` directory, refactoring it to TypeScript and aligning with the DDD structure.

## Checklist
- [ ] **Implement Game Theory System**:
  - Develop `gameTheoryService.ts` to manage battle mechanics, including attack, defense, and special abilities.
  - Implement payoff matrices to calculate battle outcomes based on creature traits and strategies.
  - Use the `battle` RNG stream for deterministic randomness in battles.
  - Write unit tests for battle mechanics, payoff calculations, and determinism.
  - **Acceptance Criteria**: Battle simulations are deterministic, complete in <10ms, and accurately reflect creature traits.
- [ ] **Migrate Game Theory Logic from `old_src`**:
  - Identify game theory-related files in `old_src` (e.g., `old_src/gameTheory.js`).
  - Refactor to TypeScript and integrate with `gameTheoryService.ts`.
  - **Acceptance Criteria**: Migrated logic functions correctly and passes tests.
- [ ] **Integrate with Other Systems**:
  - Connect `gameTheoryService.ts` with `traitService.ts`, `mutationService.ts`, and `particleService.ts` for creature stats and physics-based interactions.
  - Integrate with `visualService.ts` to display battle animations and effects.
  - Enable `inputService.ts` and `controllerUIService.ts` to initiate battles and display results.
  - Write integration tests for end-to-end battle flows (e.g., creature selection → battle initiation → outcome display).
  - **Acceptance Criteria**: Systems interact cohesively, battles are visually represented, and outcomes are consistent for the same RNG seed.
- [ ] **Migrate Integration Logic from `old_src`**:
  - Locate integration code in `old_src` (e.g., `old_src/main.js`, `old_src/battle.js`).
  - Refactor to TypeScript and align with the new DDD structure.
  - **Acceptance Criteria**: Migrated integration logic functions correctly across systems.

## Migration Tasks
- [ ] **Analyze `old_src` for Game Theory and Integration Logic**:
  - Identify files related to battles, payoff matrices, and system integration (e.g., `old_src/gameTheory.js`, `old_src/main.js`).
  - Document dependencies and integration points for refactoring.
- [ ] **Refactor and Migrate Game Theory Logic**:
  - Convert `old_src/gameTheory.js` to TypeScript, align with `gameTheoryService.ts`.
  - Update payoff matrices to use the new RNG streams and creature traits.
- [ ] **Refactor and Migrate Integration Logic**:
  - Refactor integration code from `old_src/main.js` and `old_src/battle.js` to the appropriate services (e.g., `gameTheoryService.ts`, `inputService.ts`).
  - Ensure integration with the event bus (`eventBus.ts`) for system communication.

## Documentation References
- `docs/systems/gameTheory/*`: Guides game theory implementation and migration.
- `docs/architecture/integration_points.md`: Details system interaction points.
- `docs/systems/rng/*`: Provides context for RNG integration.
- `docs/references/coding_standards.md`: Ensures code quality and consistency.

## PowerShell Scripts
Scripts are located in `docs/implementation_phases/scripts/phase_5/` and automate scaffolding and migration tasks.

1. **scaffold_game_theory.ps1**:
   - **Purpose**: Creates directories and boilerplate files for the game theory system.
   - **Content**:
     ```powershell
     New-Item -ItemType Directory -Path "src/domains/gameTheory/services" -Force
     New-Item -ItemType Directory -Path "src/domains/gameTheory/interfaces" -Force
     Set-Content -Path "src/domains/gameTheory/services/gameTheoryService.ts" -Value "class GameTheoryService { /* Implementation */ }"
     Set-Content -Path "tests/unit/gameTheoryService.test.ts" -Value "describe('GameTheoryService', () => { /* Tests */ })"
     ```
   - **Execution**: `.\scaffold_game_theory.ps1`

2. **migrate_game_theory.ps1**:
   - **Purpose**: Copies and refactors game theory logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/gameTheory.js" -Destination "src/domains/gameTheory/services/gameTheoryService.ts"
     # Add commands to refactor to TypeScript, integrate with RNG, etc.
     Write-Host "Refactor gameTheoryService.ts to use RNG streams and TypeScript."
     ```
   - **Execution**: `.\migrate_game_theory.ps1`

3. **integrate_systems.ps1**:
   - **Purpose**: Generates integration test files and event bus utilities.
   - **Content**:
     ```powershell
     Set-Content -Path "tests/integration/battleFlow.test.ts" -Value "describe('Battle Flow', () => { /* Integration tests */ })"
     Set-Content -Path "src/shared/lib/eventBus.ts" -Value "class EventBus { /* Implementation */ }"
     Write-Host "Implement event bus and integration tests for system cohesion."
     ```
   - **Execution**: `.\integrate_systems.ps1`

## Dependencies
- **TypeScript**: For type-safe development.
- **Jest**: For unit and integration testing.
- **PowerShell**: For script execution.

## Milestones
- Game theory system functional, simulating battles with deterministic outcomes.
- All systems integrated, with cohesive interactions (e.g., traits affect battles, battles update visualizations).
- End-to-end battle flow tested and validated.
- Performance targets met: battle simulations <10ms, system integration maintains 60 FPS.

## Example: Battle Initiation via Controller UI
The controller UI allows users to initiate battles, triggering the game theory system:
```typescript
// src/domains/input/components/BattleButton.tsx
import React from 'react';
import { useGameTheoryService } from '../../gameTheory/services/gameTheoryService';

const BattleButton = ({ creatureIds }: { creatureIds: string[] }) => {
  const { initiateBattle } = useGameTheoryService();
  return (
    <button onClick={() => initiateBattle(creatureIds)}>
      Start Battle
    </button>
  );
};
```

## Testing Focus
- **Determinism**: Ensure the same RNG seed produces consistent battle outcomes.
- **Performance**: Verify battle simulations complete in <10ms.
- **Integration**: Confirm that traits, mutations, and physics influence battles correctly.
- **UI Interactions**: Validate that initiating battles via the controller UI updates the simulation and displays results.

This phase ensures the game theory system is fully implemented and integrated with all other systems, providing cohesive and performant gameplay while adhering to the project's standards for determinism and modularity.
