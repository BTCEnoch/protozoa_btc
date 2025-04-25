# Bitcoin Protozoa

A simulation of evolving digital organisms that interact with Bitcoin blockchain data.

## Project Overview

Bitcoin Protozoa is a digital ecosystem where particle-based organisms evolve and interact based on Bitcoin blockchain data. The project uses a domain-driven design architecture to organize code into logical domains, each with its own responsibilities.

## Repository Structure

The repository is organized following domain-driven design principles:

### Documentation

- [Implementation Phases](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/implementation_phases): Details about the project implementation phases
  - [Migration Progress](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/implementation_phases/migration_progress.md): Current migration status
  - [Migration Plan](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/implementation_phases/migration_plan.md): Step-by-step migration plan
  - [Full Project Checklist](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/implementation_phases/full_project_checklist.md): Complete project tasks

- [References](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/references): Reference documentation
  - [Directory Map](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/references/directory_map.md): Detailed directory structure

### Source Code

The source code is organized into domains, each with its own types, services, and data:

#### Domains

- [Bitcoin Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/bitcoin): Bitcoin blockchain data integration
  - [Bitcoin Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/bitcoin/types/bitcoin.ts): Bitcoin data types
  - [Bitcoin Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/bitcoin/services/bitcoinService.ts): Service for fetching and processing Bitcoin data

- [Creature Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/creature): Creature-related functionality
  - [Creature Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/creature/types/creature.ts): Creature data types
  - [Creature Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/creature/services/creatureService.ts): Service for managing creatures
  - [Creature Factory](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/creature/services/creatureFactory.ts): Factory for creating creatures

- [Evolution Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/evolution): Evolution-related functionality
  - [Evolution Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/evolution/types/evolution.ts): Evolution data types
  - [Evolution Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/evolution/services/evolutionService.ts): Service for managing evolution

- [Game Theory Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/gameTheory): Game theory calculations
  - [Game Theory Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/gameTheory/types/gameTheory.ts): Game theory data types
  - [Game Theory Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/gameTheory/services/gameTheoryService.ts): Service for game theory calculations
  - [Game Theory Utilities](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/gameTheory/utils/gameTheory.ts): Utility functions for game theory

- [Particle Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/particle): Particle-related functionality
  - [Particle Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/particle/types/particle.ts): Particle data types
  - [Particle Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/particle/services/particleService.ts): Service for managing particles

- [Physics Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/physics): Physics-related functionality
  - [Physics Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/types/physics.ts): Physics data types
  - [Physics Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/services/physicsService.ts): Service for physics calculations
  - [Vector Math](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/utils/vectorMath.ts): Vector math utilities
  - [Spatial Grid](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/physics/utils/spatialGrid.ts): Spatial grid implementation

- [Rendering Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/rendering): Rendering-related functionality
  - [Rendering Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rendering/types/rendering.ts): Rendering data types
  - [Render Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rendering/services/renderService.ts): Service for rendering
  - [Shader Manager](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rendering/services/shaderManager.ts): Service for managing shaders

- [RNG Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/rng): Random number generation
  - [RNG Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rng/types/rng.ts): RNG data types
  - [RNG Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rng/services/rngService.ts): Service for random number generation
  - [RNG Tests](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/rng/__tests__/rngService.test.ts): Tests for RNG service

- [Storage Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/storage): Storage-related functionality
  - [Storage Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/storage/types/storage.ts): Storage data types
  - [Storage Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/storage/services/storageService.ts): Service for storage operations

- [Group Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/group): Group-related functionality
  - [Group Domain Overview](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_overview.md): Overview of the Group Domain
  - [Particle Distribution](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/particle_distribution.md): Particle distribution methods
  - [Role System Specialization](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/role_system_specialization.md): Role system details
  - [Subclass Tier System](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/subclass_tier_system.md): Subclass tier system
  - [Group Domain API](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_api.md): API documentation
  - [Group Testing](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_testing.md): Testing strategies
  - [Group Domain Migration Guide](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_migration_guide.md): Migration guide
  - [Group Domain Visualization](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_visualization.md): Visual diagrams
  - [Attribute Calculation](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/attribute_calculation.md): Attribute calculation system

- [Traits Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits): Trait-related functionality
  - [Abilities](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/abilities): Creature abilities
  - [Behaviors](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/behaviors): Creature behaviors
  - [Formations](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/formations): Creature formations
    - [Formation Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/traits/formations/types/formation.ts): Formation data types
    - [Formation Patterns](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/formations/data/patterns): Formation pattern data
  - [Mutations](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/mutations): Creature mutations
  - [Visuals](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/visuals): Creature visual traits
    - [Shaders](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/traits/visuals/data/shaders): Visual shader files
  - [Trait Service](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/traits/services/traitService.ts): Service for managing traits
  - [Trait Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/traits/types/trait.ts): Trait data types

- [Workers Domain](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/workers): Web worker functionality
  - [Formation Workers](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/workers/formation): Formation calculation workers
  - [Storage Workers](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/domains/workers/storage): Storage operation workers
  - [Worker Bridge](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/domains/workers/utils/workerBridge.ts): Utility for worker communication

#### Shared

- [Shared Types](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/shared/types): Shared type definitions
  - [Common Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/shared/types/common.ts): Common type definitions
  - [Core Types](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/shared/types/core.ts): Core type definitions

- [Shared Utils](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/shared/utils): Shared utility functions
  - [Math Utils](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/shared/utils/math): Math utility functions
  - [Logging](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/shared/utils/logging): Logging utilities

- [Shared Events](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/shared/events): Event system
  - [Event Bus](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/shared/events/eventBus.ts): Event bus implementation

- [Shared Data](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/shared/data): Shared data files
  - [Config](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/shared/data/config): Configuration files

#### UI

- [UI Hooks](https://github.com/BTCEnoch/protozoa_btc/tree/main/src/ui/hooks): React hooks
  - [Bitcoin Data Hook](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/ui/hooks/useBitcoinData.ts): Hook for Bitcoin data
  - [Creature Hook](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/ui/hooks/useCreature.ts): Hook for creature data
  - [Render Hook](https://github.com/BTCEnoch/protozoa_btc/blob/main/src/ui/hooks/useRender.ts): Hook for rendering

### Configuration

- [TypeScript Config](https://github.com/BTCEnoch/protozoa_btc/blob/main/tsconfig.json): TypeScript configuration
- [Package JSON](https://github.com/BTCEnoch/protozoa_btc/blob/main/package.json): NPM package configuration

## Key Concepts

### Domain-Driven Design

The project follows domain-driven design principles, organizing code into domains that represent different aspects of the system:

- **Bitcoin Domain**: Handles Bitcoin blockchain data integration
- **Creature Domain**: Manages creature entities and their lifecycle
- **Evolution Domain**: Handles evolution mechanics and generational changes
- **Game Theory Domain**: Implements game theory calculations for creature interactions
- **Group Domain**: Manages particle groups, roles, and attributes
- **Particle Domain**: Manages individual particles that make up creatures
- **Physics Domain**: Handles physics calculations and spatial relationships
- **Rendering Domain**: Manages rendering and visualization
- **RNG Domain**: Provides deterministic random number generation
- **Storage Domain**: Handles data persistence
- **Traits Domain**: Manages creature traits (abilities, behaviors, formations, mutations, visuals)
- **Workers Domain**: Manages web worker functionality for background processing

### Traits System

The traits system is a core component that defines creature characteristics:

- **Abilities**: Special actions creatures can perform
- **Behaviors**: How creatures interact with their environment
- **Formations**: How particles arrange themselves within a creature
- **Mutations**: Changes to creature traits over generations
- **Visuals**: Visual appearance of creatures

### Group System

The group system organizes particles into functional groups with specific roles:

- **Core**: Central stability and energy management (Health attribute)
- **Control**: Direction, coordination, and utility (Precision attribute)
- **Movement**: Locomotion, agility, and evasion (Speed attribute)
- **Defense**: Protection, durability, and damage mitigation (Armor attribute)
- **Attack**: Offense, damage dealing, and aggression (Damage attribute)

Each group's particle count determines its attribute value, with base attributes capped at Tier 3 (maximum 300). Higher tiers require mutations through the Evolution system.

### Worker System

The worker system enables background processing for computationally intensive tasks:

- **Formation Workers**: Calculate particle formations
- **Storage Workers**: Handle storage operations in the background

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/BTCEnoch/protozoa_btc.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Run the project:
   ```
   npm start
   ```

## Development

The project is organized into domains, each with its own types, services, and data. When adding new functionality, follow these guidelines:

1. Identify the appropriate domain for your changes
2. Create or update types in the domain's `types` directory
3. Implement services in the domain's `services` directory
4. Add tests in the domain's `__tests__` directory

## Testing

Before running tests, ensure you clean up any duplicate mock files:

```bash
npm run clean:mocks
```

Then run the tests:

```bash
npm test
```

For watching tests during development:

```bash
npm run test:watch
```

For generating test coverage reports:

```bash
npm run test:coverage
```

### Code Quality

The project uses ESLint and Prettier for code quality and formatting:

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Run Prettier to format code
npm run format

# Check if files are formatted correctly
npm run format:check

# Run TypeScript type checking
npm run type-check
```

Pre-commit hooks are set up to ensure code quality before committing changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
