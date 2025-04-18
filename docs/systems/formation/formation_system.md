
# Formation System

## Overview
The Formation System in Bitcoin Protozoa is responsible for managing and applying formation patterns to particle groups within creatures. It ensures that particles are arranged spatially according to their roles and the selected formation patterns, influencing their behavior and interactions. The system is designed to be modular, deterministic, and efficient, aligning with the project's domain-driven design (DDD) principles.

## Implementation
The Formation System is implemented within the `traits` domain, specifically under `src/domains/traits/services/formationService.ts`. It utilizes the formation patterns defined in `src/domains/traits/data/formationPatterns/` to arrange particles dynamically based on the creature's traits and roles.

### Directory Structure
```
src/domains/traits/
├── services/
│   ├── formationService.ts # Formation service logic
│   └── index.ts           # Trait services exports
├── data/
│   ├── formationPatterns/ # Formation pattern definitions
│   │   ├── core.ts        # CORE role formation patterns
│   │   ├── attack.ts      # ATTACK role formation patterns
│   │   ├── control.ts     # CONTROL role formation patterns
│   │   ├── defense.ts     # DEFENSE role formation patterns
│   │   ├── movement.ts    # MOVEMENT role formation patterns
│   │   └── index.ts       # Formation pattern exports
├── types/
│   ├── formation.ts       # Formation type definitions
│   └── index.ts           # Trait types exports
```

### Key Components
- **Formation Service (`services/formationService.ts`)**: Contains the logic for applying formation patterns to particle groups.
- **Formation Patterns (`data/formationPatterns/*.ts`)**: Define the spatial arrangements for particles based on their roles.
- **Types (`types/formation.ts`)**: Define the structure for formation patterns and related data.

### Migration of Existing Resources
- **Formation Logic (`src/services/formations/formationService.ts`)**: Existing logic is refactored to the new `src/domains/traits/services/formationService.ts` path.
- **Formation Data (`traits/formations/`)**: Existing data is migrated to `src/domains/traits/data/formationPatterns/`.

### Code Examples
#### Formation Service
The `formationService.ts` handles the application of formation patterns.
```typescript
// src/domains/traits/services/formationService.ts
import { Singleton } from 'typescript-singleton';
import { IFormationPattern } from 'src/domains/traits/types/formation';
import { coreFormationPatterns } from 'src/domains/traits/data/formationPatterns/core';

class FormationService extends Singleton {
  applyFormation(group: IGroup, patternId: string): void {
    const pattern = this.getFormationPattern(group.role, patternId);
    if (pattern) {
      // Logic to apply pattern to group
    }
  }

  private getFormationPattern(role: Role, patternId: string): IFormationPattern | undefined {
    switch (role) {
      case Role.CORE:
        return coreFormationPatterns.find(p => p.id === patternId);
      // Cases for other roles...
      default:
        return undefined;
    }
  }
}

export const formationService = FormationService.getInstance();
```

#### Formation Patterns
Formation patterns are defined as static data for each role.
```typescript
// src/domains/traits/data/formationPatterns/core.ts
import { IFormationPattern } from 'src/domains/traits/types/formation';

export const coreFormationPatterns: IFormationPattern[] = [
  {
    id: 'core_sphere',
    positions: [
      { x: 0, y: 0, z: 0 },
      // Additional positions...
    ],
  },
  // Additional patterns...
];
```

## Integration
The Formation System integrates with:
- **Creature Domain (`src/domains/creature/`)**: Applies formation patterns to particle groups within creatures.
- **Rendering Domain (`src/domains/rendering/`)**: Ensures particles are rendered according to their formation patterns.

## Rules Adherence
- **Role-Specific Patterns**: Patterns are defined per role, ensuring specialization.
- **Determinism**: Patterns are static and do not rely on random elements, maintaining determinism.
- **Modularity**: The system is designed to be easily extendable and modifiable without affecting other components.

## Migration Steps
1. **Refactor Formation Service**: Move existing logic from `src/services/formations/formationService.ts` to `src/domains/traits/services/formationService.ts`.
2. **Migrate Formation Data**: Transfer existing formation data from `traits/formations/` to `src/domains/traits/data/formationPatterns/`.
3. **Update Imports**: Adjust imports in related services and components to reflect the new directory structure.
4. **Test Integration**: Verify that formations are correctly applied and rendered in the new structure.

This implementation ensures the Formation System is modular, efficient, and aligned with the project's DDD structure as outlined in `directory_map.md`, providing a single source of truth for the Formation System.


