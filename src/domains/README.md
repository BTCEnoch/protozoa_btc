# Bitcoin Protozoa Domains

This directory contains the domain-specific code for the Bitcoin Protozoa project, organized according to domain-driven design principles.

## Domain Structure

Each domain typically contains the following subdirectories:

- `components/`: React components specific to the domain
- `contexts/`: React contexts for state management
- `data/`: Domain-specific data files
- `hooks/`: React hooks for the domain
- `models/`: Domain models and entities
- `services/`: Domain services and business logic
- `types/`: Type definitions for the domain
- `utils/`: Utility functions for the domain
- `__tests__/`: Tests for the domain

## Domains

- [Bitcoin Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/bitcoin): Handles Bitcoin blockchain data integration
  - [Bitcoin Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/bitcoin/types/bitcoin.ts): Bitcoin data types
  - [Bitcoin Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/bitcoin/services/bitcoinService.ts): Service for fetching and processing Bitcoin data

- [Creature Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/creature): Manages creature entities and their lifecycle
  - [Creature Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/creature/types/creature.ts): Creature data types
  - [Creature Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/creature/services/creatureService.ts): Service for managing creatures
  - [Creature Factory](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/creature/services/creatureFactory.ts): Factory for creating creatures

- [Evolution Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/evolution): Handles evolution mechanics and generational changes
  - [Evolution Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/evolution/types/evolution.ts): Evolution data types
  - [Evolution Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/evolution/services/evolutionService.ts): Service for managing evolution

- [Game Theory Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/gameTheory): Implements game theory calculations for creature interactions
  - [Game Theory Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/gameTheory/types/gameTheory.ts): Game theory data types
  - [Game Theory Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/gameTheory/services/gameTheoryService.ts): Service for game theory calculations
  - [Game Theory Utilities](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/gameTheory/utils/gameTheory.ts): Utility functions for game theory

- [Particle Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/particle): Manages individual particles that make up creatures
  - [Particle Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/particle/types/particle.ts): Particle data types
  - [Particle Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/particle/services/particleService.ts): Service for managing particles

- [Physics Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/physics): Handles physics calculations and spatial relationships
  - [Physics Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/types/physics.ts): Physics data types
  - [Physics Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/services/physicsService.ts): Service for physics calculations
  - [Vector Math](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/utils/vectorMath.ts): Vector math utilities
  - [Spatial Grid](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/utils/spatialGrid.ts): Spatial grid implementation

- [Rendering Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/rendering): Manages rendering and visualization
  - [Rendering Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rendering/types/rendering.ts): Rendering data types
  - [Render Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rendering/services/renderService.ts): Service for rendering
  - [Shader Manager](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rendering/services/shaderManager.ts): Service for managing shaders

- [RNG Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/rng): Provides deterministic random number generation
  - [RNG Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rng/types/rng.ts): RNG data types
  - [RNG Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rng/services/rngService.ts): Service for random number generation
  - [RNG Tests](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rng/__tests__/rngService.test.ts): Tests for RNG service

- [Storage Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/storage): Handles data persistence
  - [Storage Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/storage/types/storage.ts): Storage data types
  - [Storage Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/storage/services/storageService.ts): Service for storage operations

- [Traits Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits): Manages creature traits
  - [Abilities](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/abilities): Creature abilities
  - [Behaviors](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/behaviors): Creature behaviors
  - [Formations](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/formations): Creature formations
  - [Mutations](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/mutations): Creature mutations
  - [Visuals](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/visuals): Creature visual traits
  - [Trait Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/traits/services/traitService.ts): Service for managing traits
  - [Trait Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/traits/types/trait.ts): Trait data types

- [Workers Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/workers): Manages web worker functionality for background processing
  - [Formation Workers](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/workers/formation): Formation calculation workers
  - [Storage Workers](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/workers/storage): Storage operation workers
  - [Worker Bridge](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/workers/utils/workerBridge.ts): Utility for worker communication
