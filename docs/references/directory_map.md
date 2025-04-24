# Bitcoin Protozoa - Directory Map

## Overview
This document provides a full and complete directory map for the Bitcoin Protozoa project, organized using a domain-driven design approach. It ensures all necessary files are included, promotes modularity, and aligns with the project's architecture.

## Root Structure
`
protozoa_btc/
├── src/               # Source code organized by domains
├── docs/              # Project documentation
├── scripts/           # Utility scripts
├── node_modules/      # Dependencies (not in version control)
├── .github/           # GitHub workflows and templates
├── .vscode/           # VS Code settings
├── cypress.config.ts  # Cypress configuration
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── tsconfig.cypress.json # TypeScript configuration for Cypress
├── tsconfig.jest.json # TypeScript configuration for Jest
├── jest.config.js     # Jest test configuration
├── .eslintrc.js       # ESLint configuration
├── .prettierrc        # Prettier configuration
├── .gitignore         # Git ignore file
├── README.md          # Project readme
└── LICENSE            # Project license
`

## Source Code (src/)
`
src/
├── app/               # Application-wide concerns
├── data/              # Data files and configurations
├── domains/           # Domain-specific code
│   ├── bitcoin/       # Bitcoin domain
│   ├── creature/      # Creature domain
│   ├── evolution/     # Evolution domain
│   ├── gameTheory/    # Game Theory domain
│   ├── group/         # Group domain
│   ├── particle/      # Particle domain
│   ├── physics/       # Physics domain
│   ├── rendering/     # Rendering domain
│   ├── rng/           # Random Number Generation domain
│   ├── storage/       # Storage domain
│   ├── traits/        # Traits domain
│   └── workers/       # Workers domain
├── shared/            # Shared utilities and types
├── tests/             # Test files
├── types/             # Global type definitions
└── ui/                # UI components
`

## Bitcoin Domain (src/domains/bitcoin/)
`
bitcoin/
├── __mocks__/         # Mock data for testing
├── __tests__/         # Test files
├── components/        # Bitcoin-specific UI components
├── data/              # Bitcoin data files
├── hooks/             # Bitcoin-specific React hooks
├── interfaces/        # Bitcoin interfaces
├── services/          # Bitcoin services
└── types/             # Bitcoin type definitions
`

## Creature Domain (src/domains/creature/)
`
creature/
├── components/        # Creature-specific UI components
├── contexts/          # Creature-specific React contexts
├── data/              # Creature data files
├── hooks/             # Creature-specific React hooks
├── models/            # Creature data models
├── services/          # Creature services
├── types/             # Creature type definitions
└── utils/             # Creature utilities
`

## Evolution Domain (src/domains/evolution/)
`
evolution/
├── components/        # Evolution-specific UI components
├── data/              # Evolution data files
├── hooks/             # Evolution-specific React hooks
├── models/            # Evolution data models
├── services/          # Evolution services
└── types/             # Evolution type definitions
`

## Game Theory Domain (src/domains/gameTheory/)
`
gameTheory/
├── services/          # Game Theory services
├── types/             # Game Theory type definitions
└── utils/             # Game Theory utilities
`

## Group Domain (src/domains/group/)
`
group/
├── __tests__/         # Test files
├── constants/         # Group constants
├── events/            # Group events
├── interfaces/        # Group interfaces
├── models/            # Group data models
├── services/          # Group services
└── utils/             # Group utilities
`

## Particle Domain (src/domains/particle/)
`
particle/
├── interfaces/        # Particle interfaces
├── services/          # Particle services
└── types/             # Particle type definitions
`

## Physics Domain (src/domains/physics/)
`
physics/
├── __mocks__/         # Mock data for testing
├── config/            # Physics configuration
├── services/          # Physics services
├── types/             # Physics type definitions
├── utils/             # Physics utilities
└── workers/           # Physics workers
`

## Rendering Domain (src/domains/rendering/)
`
rendering/
├── components/        # Rendering-specific UI components
├── hooks/             # Rendering-specific React hooks
├── interfaces/        # Rendering interfaces
├── materials/         # Three.js materials
├── models/            # Rendering data models
├── services/          # Rendering services
├── shaders/           # GLSL shaders
├── types/             # Rendering type definitions
└── utils/             # Rendering utilities
`

## RNG Domain (src/domains/rng/)
`
rng/
├── __mocks__/         # Mock data for testing
├── __tests__/         # Test files
├── interfaces/        # RNG interfaces
├── services/          # RNG services
├── types/             # RNG type definitions
├── utils/             # RNG utilities
└── workers/           # RNG workers
`

## Storage Domain (src/domains/storage/)
`
storage/
├── services/          # Storage services
├── types/             # Storage type definitions
└── utils/             # Storage utilities
`

## Traits Domain (src/domains/traits/)
`
traits/
├── abilities/         # Ability traits
│   ├── __mocks__/     # Mock data for testing
│   ├── __tests__/     # Test files
│   ├── core/          # Core ability traits
│   ├── attack/        # Attack ability traits
│   ├── control/       # Control ability traits
│   ├── defense/       # Defense ability traits
│   └── movement/      # Movement ability traits
├── behaviors/         # Behavior traits
│   ├── __tests__/     # Test files
│   ├── core/          # Core behavior traits
│   ├── attack/        # Attack behavior traits
│   ├── control/       # Control behavior traits
│   ├── defense/       # Defense behavior traits
│   └── movement/      # Movement behavior traits
├── components/        # Trait-specific UI components
├── data/              # Trait data files
├── formations/        # Formation traits
│   ├── __tests__/     # Test files
│   ├── core/          # Core formation traits
│   ├── attack/        # Attack formation traits
│   ├── control/       # Control formation traits
│   ├── defense/       # Defense formation traits
│   └── movement/      # Movement formation traits
├── hooks/             # Trait-specific React hooks
├── interfaces/        # Trait interfaces
├── models/            # Trait data models
├── mutations/         # Mutation traits
│   ├── __tests__/     # Test files
│   ├── common/        # Common mutations
│   ├── uncommon/      # Uncommon mutations
│   ├── rare/          # Rare mutations
│   ├── epic/          # Epic mutations
│   ├── legendary/     # Legendary mutations
│   └── mythic/        # Mythic mutations
├── services/          # Trait services
├── types/             # Trait type definitions
└── visuals/           # Visual traits
    ├── __tests__/     # Test files
    ├── core/          # Core visual traits
    ├── attack/        # Attack visual traits
    ├── control/       # Control visual traits
    ├── defense/       # Defense visual traits
    └── movement/      # Movement visual traits
`

## Workers Domain (src/domains/workers/)
`
workers/
├── __tests__/         # Test files
├── formation/         # Formation workers
├── interfaces/        # Worker interfaces
├── services/          # Worker services
│   └── locks/         # Locking mechanisms
├── storage/           # Storage workers
├── types/             # Worker type definitions
└── utils/             # Worker utilities
`

## Shared Utilities (src/shared/)
`
shared/
├── components/        # Shared UI components
├── constants/         # Shared constants
├── data/              # Shared data
│   └── config/        # Configuration data
│       ├── events/    # Event configuration
│       ├── rendering/ # Rendering configuration
│       └── visuals/   # Visual configuration
├── events/            # Event system
├── lib/               # Shared libraries
├── services/          # Shared services
├── state/             # State management
│   └── __tests__/     # Test files
├── types/             # Shared type definitions
└── utils/             # Shared utilities
    ├── concurrency/   # Concurrency utilities
    │   └── __tests__/ # Test files
    ├── diagnostics/   # Diagnostic utilities
    ├── errors/        # Error handling
    │   └── __tests__/ # Test files
    ├── logging/       # Logging utilities
    ├── math/          # Math utilities
    ├── memory/        # Memory management
    ├── monitoring/    # Monitoring utilities
    ├── performance/   # Performance utilities
    ├── random/        # Random number utilities
    ├── testing/       # Testing utilities
    ├── ui/            # UI utilities
    └── validation/    # Validation utilities
`

## Tests (src/tests/)
`
tests/
├── concurrency/       # Concurrency tests
├── e2e/               # End-to-end tests (Cypress)
│   ├── fixtures/      # Test fixtures for Cypress
│   ├── screenshots/   # Test screenshots from Cypress runs
│   ├── support/       # Cypress support files
│   │   ├── commands.ts           # Custom Cypress commands implementation
│   │   ├── cypress-commands.d.ts # Type definitions for custom commands
│   │   └── index.ts              # Main support file that imports commands
│   └── videos/        # Test videos from Cypress runs
├── fixtures/          # Test fixtures
├── integration/       # Integration tests
├── mocks/             # Mock data
├── performance/       # Performance tests
├── stress/            # Stress tests
└── visual/            # Visual tests
`

## Types (src/types/)
`
types/
├── common.ts          # Common type definitions
└── cypress.d.ts       # Cypress type definitions for Jest compatibility
`

## UI Components (src/ui/)
`
ui/
├── components/        # UI components
└── hooks/             # UI-specific hooks
`

## Implementation Status

The project is currently implementing the domain-driven design structure with a focus on:

1. Bitcoin domain for fetching and processing blockchain data
2. RNG domain for deterministic random number generation
3. Group domain for particle distribution and management
4. Traits domain for abilities, behaviors, formations, mutations, and visuals
5. Rendering domain for efficient particle visualization
6. Workers domain for concurrent processing

Key features implemented:
- Deterministic creature generation based on Bitcoin block data
- Group-based particle distribution with attribute calculations
- Trait assignment based on rarity tiers
- Evolution mechanics with confirmation thresholds
- Worker-based concurrency with synchronization
- Instanced rendering for performance optimization

Testing infrastructure includes:
- Unit tests for core services
- Integration tests for domain interactions
- End-to-end tests with Cypress
- Performance and stress tests
- Concurrency tests for race condition detection
