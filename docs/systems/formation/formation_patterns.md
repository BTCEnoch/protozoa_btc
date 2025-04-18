
# Formation Patterns

## Overview
Formation patterns in Bitcoin Protozoa define how particles are arranged spatially within a creature, influencing their behavior and interactions. These patterns are role-specific and are a key component of the Formation System. The patterns are stored as static data and are used by the Formation Service to arrange particles dynamically based on the creature's traits and roles.

## Implementation
Formation patterns are implemented within the `traits` domain, specifically under `src/domains/traits/data/formationPatterns/`. Each role (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) has its own set of formation patterns, which are defined in separate files for clarity and organization.

### Directory Structure
```
src/domains/traits/data/formationPatterns/
├── core.ts          # CORE role formation patterns
├── attack.ts        # ATTACK role formation patterns
├── control.ts       # CONTROL role formation patterns
├── defense.ts       # DEFENSE role formation patterns
├── movement.ts      # MOVEMENT role formation patterns
└── index.ts         # Formation pattern exports
```

### Key Components
- **Formation Patterns (`data/formationPatterns/*.ts`)**: Define the spatial arrangements for particles based on their roles.
- **Formation Service (`src/domains/traits/services/formationService.ts`)**: Uses the formation patterns to arrange particles dynamically.

### Migration of Existing Resources
- **Trait Data (`traits/formations/`)**: Existing formation data from the current GitHub repository is migrated to the new `formationPatterns/` directory, ensuring consistency and accessibility.
- **Formation Logic (`src/services/formations/formationService.ts`)**: Existing logic is refactored to use the new formation patterns under the updated `src/domains/traits/services/` path.

### Code Examples
#### Formation Patterns
Formation patterns are defined as arrays of positions or offsets for particles.
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

#### Formation Service
The `formationService.ts` uses these patterns to arrange particles.
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

## Integration
The Formation System integrates with:
- **Creature Domain (`src/domains/creature/`)**: Uses formation patterns to arrange particles within creatures.
- **Rendering Domain (`src/domains/rendering/`)**: Ensures particles are rendered according to their formation patterns.

## Rules Adherence
- **Role-Specific Patterns**: Patterns are defined per role, ensuring specialization.
- **Determinism**: Patterns are static and do not rely on random elements, maintaining determinism.
- **Modularity**: Patterns are easily extendable and modifiable without affecting other systems.

## Migration Steps
1. **Migrate Formation Data**: Move existing formation data from `traits/formations/` in the GitHub repository to the new `src/domains/traits/data/formationPatterns/` directory.
2. **Refactor Formation Service**: Update the service logic from `src/services/formations/formationService.ts` to the new `src/domains/traits/services/formationService.ts` path, ensuring it uses the new formation patterns.
3. **Test Integration**: Verify that formations are correctly applied to creatures and rendered as expected in the new structure.

This implementation ensures the Formation System is modular, efficient, and aligned with the project's domain-driven design (DDD) structure as outlined in `directory_map.md`, providing a single source of truth for Formation Patterns.


