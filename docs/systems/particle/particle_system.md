
# Particle System

## Overview
The Particle System in Bitcoin Protozoa manages the creation, behavior, and rendering of particles within creatures. It is a foundational component that ensures particles are efficiently managed, role-based, and dynamically arranged. The system is designed to be modular, deterministic, and performant, aligning with the project's domain-driven design (DDD) principles.

## Implementation
The Particle System is implemented within the `creature` domain, specifically under `src/domains/creature/`, following the DDD structure. It includes types, models, services, and components necessary for particle management. The current state of the project on GitHub (https://github.com/BTCEnoch/Protozoa/tree/main) will be restructured into this new format to provide a single source of truth.

### Directory Structure
```
src/domains/creature/
├── types/
│   ├── particle.ts        # Particle type definitions
│   ├── group.ts           # Particle group type definitions
│   └── index.ts           # Creature types exports
├── models/
│   ├── particle.ts        # Particle model
│   ├── group.ts           # Particle group model
│   └── index.ts           # Creature models exports
├── services/
│   ├── particleService.ts # Particle management service
│   └── index.ts           # Creature services exports
├── components/
│   ├── ParticleRenderer/  # Particle rendering component
│   └── index.ts           # Creature components exports
└── index.ts               # Creature domain exports
```

### Key Components
- **Types (`types/particle.ts`, `types/group.ts`)**: Define the structure for particles and particle groups.
- **Models (`models/particle.ts`, `models/group.ts`)**: Encapsulate particle and group data and state.
- **Services (`services/particleService.ts`)**: Contain logic for particle creation, role assignment, and behavior.
- **Components (`components/ParticleRenderer/`)**: Handle the rendering of particles using Three.js.

### Migration of Existing Resources
The current GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) contains particle-related logic and rendering code that needs to be refactored:
- **Particle Logic**: Existing particle-related logic (e.g., from `src/creatures/` or other scattered files) should be consolidated into `particleService.ts`.
- **Rendering Logic**: Existing rendering code (e.g., Three.js usage in `src/rendering/` or elsewhere) should be migrated to the `ParticleRenderer` component.

### Code Examples
#### Particle Service
The `particleService.ts` handles particle creation and role assignment.
```typescript
// src/domains/creature/services/particleService.ts
import { Singleton } from 'typescript-singleton';
import { Role } from 'src/shared/types/core';
import { IParticle } from 'src/domains/creature/types/particle';

class ParticleService extends Singleton {
  createParticles(count: number, role: Role): IParticle[] {
    const particles = Array(count).fill(null).map((_, i) => ({
      id: `particle-${i}`,
      position: [0, 0, 0],
      color: 0xffffff
    }));
    return particles.map(p => ({ ...p, role }));
  }
}

export const particleService = ParticleService.getInstance();
```

#### Particle Renderer
The `ParticleRenderer` component renders particles using Three.js.
```typescript
// src/domains/creature/components/ParticleRenderer.tsx
import React from 'react';
import * as THREE from 'three';

export const ParticleRenderer = ({ particles }) => {
  return (
    <group>
      {particles.map(p => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={p.color} />
        </mesh>
      ))}
    </group>
  );
};
```

## Integration
The Particle System integrates with:
- **Creature Domain (`src/domains/creature/`)**: Uses particle data for creature generation.
- **Rendering Domain (`src/domains/rendering/`)**: Provides rendering logic for particles.

## Rules Adherence
- **Determinism**: Particle creation and role assignment are deterministic, based on RNG seeded by block nonce (to be implemented in `particleService.ts`).
- **Modularity**: The system is designed to be easily extendable and modifiable without affecting other components.
- **Performance**: Uses efficient rendering techniques like instanced rendering (to be optimized in `ParticleRenderer`).

## Migration Steps
To restructure the current build from GitHub into this new structure:
1. **Refactor Particle Logic**: Identify and move existing particle logic from the GitHub repo (e.g., `src/creatures/`) to `particleService.ts`.
2. **Migrate Rendering Code**: Transfer rendering code (e.g., Three.js usage) to the `ParticleRenderer` component.
3. **Update Imports**: Adjust imports in related services and components to reflect the new directory structure under `src/domains/creature/`.
4. **Test Integration**: Verify that particles are correctly created and rendered in the new structure by running the app and checking creature visualizations.

This implementation ensures the Particle System is modular, efficient, and aligned with the project's DDD structure, providing a single source of truth for the Particle System as we transition from the current GitHub state to the new design.
