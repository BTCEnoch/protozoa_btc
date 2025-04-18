Below is the populated `particle_roles.md` document for the Bitcoin Protozoa project, tailored to document how to restructure the current GitHub build into the new domain-driven design (DDD) structure while establishing a single source of truth for particle roles. This document aligns with the project's goals of modularity, clarity, and scalability, and provides migration steps referencing the existing GitHub repository.


# Particle Roles

## Overview
Particle roles in Bitcoin Protozoa define the functional categories of particles within a creature, influencing their behavior, interactions, and visual representations. Each particle is assigned one of five roles: CORE, CONTROL, MOVEMENT, DEFENSE, or ATTACK. These roles are foundational to the creature's structure and are used across multiple domains, including traits, formations, and rendering. This document outlines how particle roles are defined and utilized within the new DDD structure, ensuring clarity and modularity.

## Directory Structure
Particle roles are defined as an enum in the shared types directory (`src/shared/types/core.ts`), making them accessible across all domains. This centralization avoids duplication and ensures consistency.

```
src/shared/types/
├── core.ts       # Shared enums and types, including Role
└── index.ts      # Shared types exports
```

## Key Components
- **Role Enum (`core.ts`)**: Defines the five particle roles as an enum for type safety and clarity.
- **Usage in Domains**:
  - **Creature Domain (`src/domains/creature/`)**: Assigns roles to particles during creature generation.
  - **Traits Domain (`src/domains/traits/`)**: Uses roles to determine applicable traits and formations.
  - **Rendering Domain (`src/domains/rendering/`)**: Applies role-specific visual effects.

## Integration
Particle roles integrate with:
- **Creature Generation (`src/domains/creature/services/creatureGenerator.ts`)**: Assigns roles to particles based on deterministic logic.
- **Trait Assignment (`src/domains/traits/services/traitService.ts`)**: Selects traits based on particle roles.
- **Formation Patterns (`src/domains/traits/data/formationPatterns/`)**: Applies role-specific spatial arrangements.
- **Rendering (`src/domains/rendering/services/particleRenderer.ts`)**: Uses roles to determine visual properties.

## Rules Adherence
- **Determinism**: Role assignment is deterministic, based on RNG seeded by block nonce.
- **Modularity**: Roles are defined centrally and imported where needed, avoiding local redefinitions.
- **Scalability**: New roles can be added to the enum without disrupting existing logic.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Extract Role Enum**: Identify any existing role definitions (e.g., in `src/types/roles.ts` or similar files) and move them to `src/shared/types/core.ts`. If no explicit enum exists, create it based on implicit role usage in the codebase.
2. **Update Imports**: Adjust all references to particle roles across the project to import from `src/shared/types/core`.
3. **Refactor Logic**: Ensure role-based logic (e.g., in creature generation or rendering) uses the centralized `Role` enum. Check files like `src/lib/creature.js` or similar for current role handling.
4. **Test Integration**: Verify that role assignments and related behaviors (e.g., rendering, trait application) function correctly in the new structure using existing tests or new unit tests.

## Code Examples
### Role Enum
The `Role` enum is defined in `core.ts` for use across the project.
```typescript
// src/shared/types/core.ts
export enum Role {
  CORE = 'CORE',
  CONTROL = 'CONTROL',
  MOVEMENT = 'MOVEMENT',
  DEFENSE = 'DEFENSE',
  ATTACK = 'ATTACK',
}
```

### Usage in Creature Generation
The `creatureGenerator.ts` assigns roles to particles during creature creation.
```typescript
// src/domains/creature/services/creatureGenerator.ts
import { Role } from 'src/shared/types/core';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';

class CreatureGenerator {
  generateParticles(blockData: IBlockData): IParticle[] {
    const rng = createRNGFromBlock(blockData.nonce).getStream('particles');
    // Example logic to assign roles using rng
    return particles.map(p => ({ ...p, role: Role.CORE }));
  }
}
```

This document serves as a single source of truth for the Particle Roles system in Bitcoin Protozoa, ensuring a smooth transition to the new DDD structure while maintaining consistency and scalability.
