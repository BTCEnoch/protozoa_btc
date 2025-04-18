It seems like you’re asking for the `phase_4.md` document related to the Bitcoin Protozoa project. Based on your request, I’ll provide the full content of the `phase_4.md` file as outlined in the thinking trace, wrapped appropriately.


# Phase 4: Visualization and Input Systems

## Purpose
This document outlines the fourth phase of the Bitcoin Protozoa project, focusing on implementing and migrating the **visualization** and **input** systems, including the **controller UI** for testing traits, behaviors, and formations. These systems are crucial for rendering the simulation and enabling user interaction.

## Location
`docs/implementation_phases/phase_4.md`

## Overview
Phase 4 involves developing three key systems:
- **Visualization System**: Renders particles, creatures, and trait effects using Three.js, ensuring 60 FPS performance.
- **Input System**: Handles user inputs (mouse, keyboard, touch) for camera controls, creature selection, and simulation commands.
- **Controller UI**: Provides a React-based interface for toggling traits, behaviors, and formations, essential for testing and debugging.

These systems must:
- Integrate with existing systems (e.g., physics, traits) for real-time updates.
- Maintain performance standards (e.g., rendering < 16ms per frame, input handling < 1ms).
- Be modular, encapsulated within their domains (`src/domains/visualization/`, `src/domains/input/`).

This phase also includes migrating relevant code from `old_src` to the new `src` directory, refactoring it to TypeScript and aligning with the DDD structure.

## Checklist
- [ ] **Implement Visualization System**:
  - Develop `visualService.ts` for Three.js-based rendering of particles and trait effects.
  - Implement instanced rendering for performance with 500 particles.
  - Write tests for rendering accuracy and performance.
  - **Acceptance Criteria**: Renders at ≥60 FPS, trait effects display correctly.
- [ ] **Migrate Visualization Logic from `old_src`**:
  - Identify rendering code in `old_src` (e.g., `old_src/render.js`).
  - Refactor to TypeScript and integrate with `visualService.ts`.
  - **Acceptance Criteria**: Migrated rendering maintains visual fidelity and performance.
- [ ] **Implement Input System**:
  - Develop `inputService.ts` for handling mouse, keyboard, and touch inputs.
  - Implement camera controls (orbit, zoom, pan) and simulation commands (pause, reset).
  - Write tests for input responsiveness and correctness.
  - **Acceptance Criteria**: Input handling <1ms, commands execute correctly.
- [ ] **Migrate Input Logic from `old_src`**:
  - Locate input handling code in `old_src` (e.g., `old_src/input.js`).
  - Refactor to TypeScript and integrate with `inputService.ts`.
  - **Acceptance Criteria**: Migrated inputs function correctly and pass tests.
- [ ] **Implement Controller UI**:
  - Develop `controllerUIService.ts` with React components for trait, behavior, and formation toggling.
  - Integrate with `traitService.ts`, `mutationService.ts`, and `formationService.ts`.
  - Write tests for UI interactions and state updates.
  - **Acceptance Criteria**: UI toggles update simulation correctly, renders efficiently.
- [ ] **Migrate UI Logic from `old_src`**:
  - Identify UI-related code in `old_src` (e.g., `old_src/ui.js`).
  - Refactor to React and TypeScript, integrate with `controllerUIService.ts`.
  - **Acceptance Criteria**: Migrated UI components function correctly and pass tests.

## Migration Tasks
- [ ] **Analyze `old_src` for Visualization, Input, and UI Logic**:
  - Identify files related to rendering, input handling, and UI (e.g., `old_src/render.js`, `old_src/input.js`, `old_src/ui.js`).
  - Document dependencies and integration points for refactoring.
- [ ] **Refactor and Migrate Visualization Logic**:
  - Convert `old_src/render.js` to TypeScript, align with `visualService.ts`.
  - Update to use instanced rendering for performance.
- [ ] **Refactor and Migrate Input Logic**:
  - Convert `old_src/input.js` to TypeScript, align with `inputService.ts`.
  - Ensure compatibility with new camera controls and simulation commands.
- [ ] **Refactor and Migrate UI Logic**:
  - Convert `old_src/ui.js` to React and TypeScript, align with `controllerUIService.ts`.
  - Integrate with trait, mutation, and formation services for testing.

## Documentation References
- `docs/systems/visualization/*`: Guides visualization system implementation and migration.
- `docs/systems/input/*`: Details input system requirements and migration.
- `docs/references/user_flows.md`: Outlines user interactions for the controller UI.
- `docs/references/coding_standards.md`: Ensures code quality and consistency.

## PowerShell Scripts
Scripts are located in `docs/implementation_phases/scripts/phase_4/` and automate scaffolding and migration tasks.

1. **scaffold_visualization.ps1**:
   - **Purpose**: Creates directories and boilerplate files for the visualization system.
   - **Content**:
     ```powershell
     New-Item -ItemType Directory -Path "src/domains/visualization/services" -Force
     New-Item -ItemType Directory -Path "src/domains/visualization/interfaces" -Force
     Set-Content -Path "src/domains/visualization/services/visualService.ts" -Value "class VisualService { /* Implementation */ }"
     Set-Content -Path "tests/unit/visualService.test.ts" -Value "describe('VisualService', () => { /* Tests */ })"
     ```
   - **Execution**: `.\scaffold_visualization.ps1`

2. **scaffold_input.ps1**:
   - **Purpose**: Creates directories and boilerplate files for the input system.
   - **Content**:
     ```powershell
     New-Item -ItemType Directory -Path "src/domains/input/services" -Force
     New-Item -ItemType Directory -Path "src/domains/input/interfaces" -Force
     Set-Content -Path "src/domains/input/services/inputService.ts" -Value "class InputService { /* Implementation */ }"
     Set-Content -Path "tests/unit/inputService.test.ts" -Value "describe('InputService', () => { /* Tests */ })"
     ```
   - **Execution**: `.\scaffold_input.ps1`

3. **scaffold_controller_ui.ps1**:
   - **Purpose**: Creates directories and boilerplate files for the controller UI.
   - **Content**:
     ```powershell
     New-Item -ItemType Directory -Path "src/domains/input/services" -Force
     New-Item -ItemType Directory -Path "src/domains/input/components" -Force
     Set-Content -Path "src/domains/input/services/controllerUIService.ts" -Value "class ControllerUIService { /* Implementation */ }"
     Set-Content -Path "src/domains/input/components/TraitToggle.tsx" -Value "const TraitToggle = () => { /* Component */ }"
     Set-Content -Path "tests/unit/controllerUIService.test.ts" -Value "describe('ControllerUIService', () => { /* Tests */ })"
     ```
   - **Execution**: `.\scaffold_controller_ui.ps1`

4. **migrate_visualization.ps1**:
   - **Purpose**: Copies and refactors visualization logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/render.js" -Destination "src/domains/visualization/services/visualService.ts"
     # Add commands to refactor to TypeScript, integrate with Three.js, etc.
     Write-Host "Refactor visualService.ts to use instanced rendering and TypeScript."
     ```
   - **Execution**: `.\migrate_visualization.ps1`

5. **migrate_input.ps1**:
   - **Purpose**: Copies and refactors input logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/input.js" -Destination "src/domains/input/services/inputService.ts"
     # Add commands to refactor to TypeScript, integrate with camera controls, etc.
     Write-Host "Refactor inputService.ts for mouse, keyboard, and touch inputs."
     ```
   - **Execution**: `.\migrate_input.ps1`

6. **migrate_ui.ps1**:
   - **Purpose**: Copies and refactors UI logic from `old_src` to `src`.
   - **Content**:
     ```powershell
     Copy-Item -Path "old_src/ui.js" -Destination "src/domains/input/components/TraitToggle.tsx"
     # Add commands to refactor to React and TypeScript, integrate with services, etc.
     Write-Host "Refactor UI components for trait, behavior, and formation toggling."
     ```
   - **Execution**: `.\migrate_ui.ps1`

## Dependencies
- **Three.js**: For 3D rendering in the visualization system.
- **React**: For building the controller UI.
- **TypeScript**: For type-safe development.
- **Jest**: For unit and integration testing.
- **PowerShell**: For script execution.

## Milestones
- Visualization system renders particles and trait effects at ≥60 FPS.
- Input system handles user interactions with <1ms latency.
- Controller UI allows toggling of traits, behaviors, and formations, updating the simulation in real-time.
- All systems fully migrated from `old_src`, refactored, and passing tests.

## Example: Controller UI for Trait Testing
The controller UI enables developers to test traits by toggling them on and off:
```typescript
// src/domains/input/components/TraitToggle.tsx
import React from 'react';
import { useTraitService } from '../services/traitService';

const TraitToggle = ({ creatureId }: { creatureId: string }) => {
  const { toggleTrait } = useTraitService();
  return (
    <button onClick={() => toggleTrait(creatureId, 'ethereal_glow')}>
      Toggle Ethereal Glow
    </button>
  );
};
```

## Testing Focus
- **Performance**: Ensure rendering maintains ≥60 FPS with 500 particles.
- **Responsiveness**: Verify input handling completes in <1ms.
- **UI Interactions**: Confirm that toggling traits, behaviors, and formations updates the simulation correctly.
- **Integration**: Validate that visualization and input systems integrate seamlessly with physics - the other systems, such as the traits and mutations.

This phase ensures the visualization, input, and controller UI systems are fully functional, migrated, and optimized for performance, setting the stage for game theory integration in the next phase.
