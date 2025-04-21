# Bitcoin Protozoa Systems Documentation Index

This index provides navigation links to documentation for all systems in the Bitcoin Protozoa project. Each system is responsible for a specific aspect of the simulation.

## System Domains

| System | Description | Documentation Directory |
|--------|-------------|-------------------------|
| **Bitcoin** | Manages blockchain integration and data fetching | [Bitcoin System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/bitcoin) |
| **Creature** | Oversees creature lifecycle and management | [Creature System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/creature) |
| **Evolution** | Controls evolution mechanics and generational changes | [Evolution System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/evolution) |
| **Game Theory** | Implements game theory for creature interactions | [Game Theory System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/game_theory) |
| **Group** | Organizes particles into functional roles | [Group System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/group) |
| **Particle** | Manages individual particles and their properties | [Particle System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/particle) |
| **Physics** | Simulates physical interactions and movements | [Physics System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/physics) |
| **Rendering** | Handles visualization of creatures and environments | [Rendering System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/rendering) |
| **RNG** | Provides deterministic random number generation | [RNG System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/rng) |
| **Storage** | Manages data persistence and retrieval | [Storage System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/storage) |
| **Traits** | Defines and manages creature traits | [Traits System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/trait) |
| **Workers** | Handles background processing tasks | [Workers System Docs](https://github.com/BTCEnoch/protozoa_btc/tree/main/docs/systems/workers) |

## Key Integration Points

The systems interact in the following ways:

1. **Bitcoin → RNG → Evolution**: Bitcoin block data seeds the RNG system, which drives evolution events.
2. **Group → Traits → Rendering**: Group roles determine trait assignments, which affect visual rendering.
3. **Particle → Physics → Workers**: Particle properties influence physics calculations, processed by workers.
4. **Game Theory → Creature → Evolution**: Game theory models influence creature interactions and evolution.

## Detailed Documentation

For a comprehensive index with detailed file listings and system descriptions, see the [Central Index Document](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/central_index.md).
