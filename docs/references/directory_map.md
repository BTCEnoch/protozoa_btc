Based on your request, I’ve reviewed the current directory structure of the Bitcoin Protozoa project and designed a revised, full, and complete domain-driven structure that ensures all necessary files are included, aligns with the project's architecture, and promotes modularity by avoiding local function creation where imports should be used. Below is the updated directory structure, followed by an implementation inventory checklist to track progress.

### Revised Directory Structure

The revised structure introduces a `domains/` directory within `src/` to organize code by bounded contexts or feature areas, enhancing the domain-driven design (DDD) approach. Each domain contains its own `types/`, `models/`, `services/`, `data/`, `components/`, and `utils/` subdirectories where applicable, ensuring all domains are consistently represented. Shared utilities and application-wide concerns are separated into `shared/` and `app/` directories, respectively. The `traits/` directory remains at the root level due to its significance and cross-domain usage.

Here’s the detailed directory map:


# Bitcoin Protozoa - Directory Map

## Overview
This document provides a full and complete directory map for the Bitcoin Protozoa project, organized using a domain-driven design approach. It ensures all necessary files are included, promotes modularity, and aligns with the project’s architecture.

## Root Structure
```
protozoa/
├── src/               # Source code organized by domains
├── traits/            # Trait definitions (cross-domain)
├── docs/              # Project documentation
├── tests/             # Test files
├── scripts/           # Utility scripts
├── config/            # Configuration files
├── assets/            # Static assets
├── public/            # Public static files
├── dist/              # Build output
├── node_modules/      # Dependencies (not in version control)
├── .github/           # GitHub workflows and templates
├── .vscode/           # VS Code settings
├── package.json       # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── jest.config.js     # Jest test configuration
├── .eslintrc.js       # ESLint configuration
├── .prettierrc        # Prettier configuration
├── .gitignore         # Git ignore file
├── README.md          # Project readme
└── LICENSE            # Project license
```

## Source Code (`src/`)
```
src/
├── domains/           # Domain-specific code
│   ├── creature/      # Creature domain
│   │   ├── types/       # Creature-specific types
│   │   │   ├── creature.ts    # Creature type definitions
│   │   │   ├── particle.ts    # Particle type definitions
│   │   │   ├── group.ts      # Particle group type definitions
│   │   │   └── index.ts      # Creature types exports
│   │   ├── models/      # Creature data models
│   │   │   ├── creature.ts    # Creature model
│   │   │   ├── particle.ts    # Particle model
│   │   │   ├── group.ts      # Particle group model
│   │   │   └── index.ts      # Creature models exports
│   │   ├── services/    # Creature business logic
│   │   │   ├── creatureGenerator.ts # Creature generation service
│   │   │   └── index.ts      # Creature services exports
│   │   ├── data/        # Creature data definitions
│   │   │   ├── creatures.json # Static creature data
│   │   │   └── index.ts      # Creature data exports
│   │   ├── components/  # Creature UI components
│   │   │   ├── CreatureViewer/  # Creature viewer component
│   │   │   └── index.ts      # Creature components exports
│   │   ├── hooks/       # Creature-specific hooks
│   │   │   ├── useCreature.ts # Creature hook
│   │   │   └── index.ts      # Creature hooks exports
│   │   ├── contexts/    # Creature-specific contexts
│   │   │   ├── CreatureContext.ts # Creature context
│   │   │   └── index.ts      # Creature contexts exports
│   │   ├── utils/       # Creature utilities
│   │   │   ├── spatial.ts    # Spatial utilities for creatures
│   │   │   └── index.ts      # Creature utilities exports
│   │   └── index.ts     # Creature domain exports
│   ├── traits/        # Traits domain
│   │   ├── types/       # Trait-specific types
│   │   │   ├── ability.ts    # Ability type definitions
│   │   │   ├── formation.ts  # Formation type definitions
│   │   │   ├── behavior.ts   # Behavior type definitions
│   │   │   ├── visual.ts     # Visual type definitions
│   │   │   ├── mutation.ts   # Mutation type definitions
│   │   │   └── index.ts      # Trait types exports
│   │   ├── models/      # Trait data models
│   │   │   ├── ability.ts    # Ability model
│   │   │   ├── formation.ts  # Formation model
│   │   │   ├── behavior.ts   # Behavior model
│   │   │   ├── visual.ts     # Visual model
│   │   │   ├── mutation.ts   # Mutation model
│   │   │   └── index.ts      # Trait models exports
│   │   ├── services/    # Trait business logic
│   │   │   ├── traitService.ts      # Trait management service
│   │   │   ├── traitBankLoader.ts   # Trait bank loader
│   │   │   ├── abilityService.ts    # Ability service
│   │   │   ├── abilityFactory.ts    # Ability factory
│   │   │   ├── formationService.ts  # Formation service
│   │   │   ├── formationBankLoader.ts # Formation bank loader
│   │   │   ├── behaviorService.ts   # Behavior service
│   │   │   ├── behaviorBankLoader.ts # Behavior bank loader
│   │   │   ├── visualService.ts     # Visual service
│   │   │   ├── visualBankLoader.ts  # Visual bank loader
│   │   │   ├── mutationService.ts   # Mutation service
│   │   │   ├── mutationBankLoader.ts # Mutation bank loader
│   │   │   └── index.ts      # Trait services exports
│   │   ├── data/        # Trait data definitions
│   │   │   ├── abilityPools/      # Ability pool definitions
│   │   │   │   ├── core.ts          # CORE ability pools
│   │   │   │   ├── attack.ts        # ATTACK ability pools
│   │   │   │   ├── control.ts       # CONTROL ability pools
│   │   │   │   ├── defense.ts       # DEFENSE ability pools
│   │   │   │   ├── movement.ts      # MOVEMENT ability pools
│   │   │   │   └── index.ts         # Ability pool exports
│   │   │   ├── formationPatterns/ # Formation pattern definitions
│   │   │   │   ├── core.ts          # CORE formation patterns
│   │   │   │   ├── attack.ts        # ATTACK formation patterns
│   │   │   │   ├── control.ts       # CONTROL formation patterns
│   │   │   │   ├── defense.ts       # DEFENSE formation patterns
│   │   │   │   ├── movement.ts      # MOVEMENT formation patterns
│   │   │   │   └── index.ts         # Formation pattern exports
│   │   │   ├── behaviorPatterns/  # Behavior pattern definitions
│   │   │   │   ├── core.ts          # CORE behavior patterns
│   │   │   │   ├── attack.ts        # ATTACK behavior patterns
│   │   │   │   ├── control.ts       # CONTROL behavior patterns
│   │   │   │   ├── defense.ts       # DEFENSE behavior patterns
│   │   │   │   ├── movement.ts      # MOVEMENT behavior patterns
│   │   │   │   └── index.ts         # Behavior pattern exports
│   │   │   ├── visualPatterns/    # Visual pattern definitions
│   │   │   │   ├── core.ts          # CORE visual patterns
│   │   │   │   ├── attack.ts        # ATTACK visual patterns
│   │   │   │   ├── control.ts       # CONTROL visual patterns
│   │   │   │   ├── defense.ts       # DEFENSE visual patterns
│   │   │   │   ├── movement.ts      # MOVEMENT visual patterns
│   │   │   │   └── index.ts         # Visual pattern exports
│   │   │   ├── mutations/         # Mutation definitions
│   │   │   │   ├── common.ts        # Common mutations
│   │   │   │   ├── uncommon.ts      # Uncommon mutations
│   │   │   │   ├── rare.ts          # Rare mutations
│   │   │   │   ├── epic.ts          # Epic mutations
│   │   │   │   ├── legendary.ts     # Legendary mutations
│   │   │   │   ├── mythic.ts        # Mythic mutations
│   │   │   │   └── index.ts         # Mutation exports
│   │   │   └── index.ts      # Trait data exports
│   │   ├── components/  # Trait UI components
│   │   │   ├── TraitDisplay/    # Trait display component
│   │   │   └── index.ts      # Trait components exports
│   │   └── index.ts     # Traits domain exports
│   ├── bitcoin/       # Bitcoin domain
│   │   ├── types/       # Bitcoin-specific types
│   │   │   ├── bitcoin.ts    # Bitcoin data type definitions
│   │   │   └── index.ts      # Bitcoin types exports
│   │   ├── services/    # Bitcoin business logic
│   │   │   ├── bitcoinService.ts # Bitcoin data service
│   │   │   └── index.ts      # Bitcoin services exports
│   │   ├── data/        # Bitcoin data definitions
│   │   │   ├── blocks.json   # Static block data
│   │   │   └── index.ts      # Bitcoin data exports
│   │   ├── components/  # Bitcoin UI components
│   │   │   ├── BlockSelector/   # Block selector component
│   │   │   └── index.ts      # Bitcoin components exports
│   │   ├── hooks/       # Bitcoin-specific hooks
│   │   │   ├── useBitcoinData.ts # Bitcoin data hook
│   │   │   └── index.ts      # Bitcoin hooks exports
│   │   └── index.ts     # Bitcoin domain exports
│   ├── rendering/     # Rendering domain
│   │   ├── types/       # Rendering-specific types
│   │   │   ├── instanced.ts  # Types for instanced rendering
│   │   │   ├── shaders.ts    # Shader interface definitions
│   │   │   ├── lod.ts        # Level of detail type definitions
│   │   │   ├── buffers.ts    # Buffer geometry type definitions
│   │   │   └── index.ts      # Rendering types exports
│   │   ├── services/    # Rendering business logic
│   │   │   ├── instancedRenderer.ts # Instanced rendering service
│   │   │   ├── particleRenderer.ts  # Particle rendering service
│   │   │   ├── shaderManager.ts     # Shader management service
│   │   │   ├── lodManager.ts        # Level of detail management service
│   │   │   └── index.ts      # Rendering services exports
│   │   ├── components/  # Rendering UI components
│   │   │   ├── ParticleRenderer/ # Particle renderer component
│   │   │   └── index.ts      # Rendering components exports
│   │   ├── hooks/       # Rendering-specific hooks
│   │   │   ├── useRender.ts  # Rendering hook
│   │   │   └── index.ts      # Rendering hooks exports
│   │   ├── utils/       # Rendering utilities
│   │   │   ├── renderingUtils.ts # Rendering utilities
│   │   │   └── index.ts      # Rendering utilities exports
│   │   └── index.ts     # Rendering domain exports
│   ├── evolution/     # Evolution domain
│   │   ├── types/       # Evolution-specific types
│   │   │   ├── evolution.ts  # Evolution type definitions
│   │   │   └── index.ts      # Evolution types exports
│   │   ├── services/    # Evolution business logic
│   │   │   ├── evolutionService.ts # Evolution service
│   │   │   └── index.ts      # Evolution services exports
│   │   ├── data/        # Evolution data definitions
│   │   │   ├── evolutionRules.json # Evolution rules data
│   │   │   └── index.ts      # Evolution data exports
│   │   ├── components/  # Evolution UI components
│   │   │   ├── EvolutionTracker/ # Evolution tracker component
│   │   │   └── index.ts      # Evolution components exports
│   │   ├── hooks/       # Evolution-specific hooks
│   │   │   ├── useEvolution.ts # Evolution hook
│   │   │   └── index.ts      # Evolution hooks exports
│   │   └── index.ts     # Evolution domain exports
│   ├── gameTheory/    # Game theory domain
│   │   ├── types/       # Game theory-specific types
│   │   │   ├── payoffMatrix.ts     # Payoff matrix types
│   │   │   ├── decisionTree.ts     # Decision tree types
│   │   │   ├── nashEquilibrium.ts  # Nash equilibrium types
│   │   │   ├── utilityFunction.ts  # Utility function types
│   │   │   ├── battleOutcome.ts    # Battle outcome types
│   │   │   └── index.ts      # Game theory types exports
│   │   ├── services/    # Game theory business logic
│   │   │   ├── gameTheoryStrategyService.ts # Comprehensive strategy service
│   │   │   ├── decisionTreeService.ts       # Decision tree service
│   │   │   ├── nashEquilibriumFinder.ts     # Nash equilibrium finder service
│   │   │   ├── payoffMatrixService.ts       # Matrix generation service
│   │   │   ├── utilityFunctionService.ts    # Utility function service
│   │   │   └── index.ts      # Game theory services exports
│   │   ├── data/        # Game theory data definitions
│   │   │   ├── strategies.json # Static strategy data
│   │   │   └── index.ts      # Game theory data exports
│   │   └── index.ts     # Game theory domain exports
│   └── workers/       # Workers domain
│       ├── types/       # Worker-specific types
│       │   ├── messages.ts   # Worker message type definitions
│       │   ├── physics.ts    # Physics worker type definitions
│       │   ├── compute.ts    # Compute worker type definitions
│       │   └── index.ts      # Worker types exports
│       ├── services/    # Worker business logic
│       │   ├── physics/         # Physics workers
│       │   │   ├── forceWorker.ts      # Force calculation worker
│       │   │   ├── positionWorker.ts   # Position update worker
│       │   │   └── index.ts      # Physics workers exports
│       │   ├── behavior/        # Behavior workers
│       │   │   ├── flockingWorker.ts  # Flocking behavior worker
│       │   │   ├── patternWorker.ts   # Pattern behavior worker
│       │   │   └── index.ts      # Behavior workers exports
│       │   ├── render/          # Render workers
│       │   │   ├── particleWorker.ts # Particle rendering worker
│       │   │   └── index.ts      # Render workers exports
│       │   ├── bitcoin/         # Bitcoin workers
│       │   │   ├── fetchWorker.ts    # Bitcoin data fetching worker
│       │   │   └── index.ts      # Bitcoin workers exports
│       │   ├── workerBridge.ts  # Bridge between main thread and workers
│       │   └── index.ts      # Worker services exports
│       └── index.ts     # Workers domain exports
├── shared/            # Shared utilities and types
│   ├── types/          # Shared type definitions
│   │   ├── core.ts       # Core type definitions (enums, constants)
│   │   ├── events.ts     # Event type definitions
│   │   ├── config.ts     # Configuration type definitions
│   │   ├── rng.ts        # RNG type definitions
│   │   └── index.ts      # Shared types exports
│   ├── lib/            # Shared core functionality
│   │   ├── rngSystem.ts     # Random number generation system
│   │   ├── particleSystem.ts # Particle physics system
│   │   ├── formationSystem.ts # Formation system
│   │   ├── eventBus.ts      # Event bus implementation
│   │   ├── storage.ts       # Storage utilities
│   │   ├── api.ts           # API utilities
│   │   ├── mathUtils.ts     # Math utilities
│   │   ├── spatialUtils.ts  # Spatial calculation utilities
│   │   └── index.ts         # Library exports
│   ├── utils/          # General utility functions
│   │   ├── math.ts         # Math utilities
│   │   ├── random.ts       # Random utilities
│   │   ├── validation.ts   # Validation utilities
│   │   ├── formatting.ts   # Formatting utilities
│   │   ├── logging.ts      # Logging utilities
│   │   ├── performance/    # Performance utilities
│   │   │   ├── throttle.ts   # Throttling utilities
│   │   │   ├── profiling.ts  # Performance profiling
│   │   │   ├── batching.ts   # Batch processing utilities
│   │   │   └── index.ts      # Performance utilities exports
│   │   ├── dom.ts          # DOM utilities
│   │   ├── transfer.ts     # Transferable object utilities
│   │   └── index.ts        # Utility exports
│   ├── constants/      # Shared constants
│   │   ├── config.ts      # Configuration constants
│   │   ├── traits.ts      # Trait constants
│   │   ├── evolution.ts   # Evolution constants
│   │   └── index.ts       # Constant exports
│   ├── styles/         # Shared styles
│   │   ├── global.css      # Global styles
│   │   ├── variables.css   # CSS variables
│   │   └── components/     # Common component styles
│   └── index.ts        # Shared exports
├── app/               # Application-wide concerns
│   ├── pages/          # Application pages
│   │   ├── Home.tsx      # Home page
│   │   ├── Viewer.tsx    # Creature viewer page
│   │   ├── Gallery.tsx   # Creature gallery page
│   │   ├── About.tsx     # About page
│   │   └── index.ts      # Page exports
│   ├── routes/         # Routing configuration
│   │   ├── routes.ts     # Route definitions
│   │   └── index.ts      # Routes exports
│   ├── contexts/       # Application-wide contexts
│   │   ├── SettingsContext.ts # Settings context
│   │   └── index.ts      # Contexts exports
│   └── index.ts        # Application entry point
└── index.ts           # Main entry point
```

## Traits (`traits/`)
```
traits/
├── abilities/         # Ability traits (unchanged from original)
│   ├── core/          # CORE role abilities
│   │   ├── common.ts  # Common tier abilities
│   │   ├── uncommon.ts # Uncommon tier abilities
│   │   ├── rare.ts    # Rare tier abilities
│   │   ├── epic.ts    # Epic tier abilities
│   │   ├── legendary.ts # Legendary tier abilities
│   │   ├── mythic.ts  # Mythic tier abilities
│   │   └── index.ts   # Core abilities index
│   ├── attack/        # ATTACK role abilities
│   │   ├── common.ts  # Common tier abilities
│   │   ├── uncommon.ts # Uncommon tier abilities
│   │   ├── rare.ts    # Rare tier abilities
│   │   ├── epic.ts    # Epic tier abilities
│   │   ├── legendary.ts # Legendary tier abilities
│   │   ├── mythic.ts  # Mythic tier abilities
│   │   └── index.ts   # Attack abilities index
│   ├── control/       # CONTROL role abilities
│   │   ├── common.ts  # Common tier abilities
│   │   ├── uncommon.ts # Uncommon tier abilities
│   │   ├── rare.ts    # Rare tier abilities
│   │   ├── epic.ts    # Epic tier abilities
│   │   ├── legendary.ts # Legendary tier abilities
│   │   ├── mythic.ts  # Mythic tier abilities
│   │   └── index.ts   # Control abilities index
│   ├── defense/       # DEFENSE role abilities
│   │   ├── common.ts  # Common tier abilities
│   │   ├── uncommon.ts # Uncommon tier abilities
│   │   ├── rare.ts    # Rare tier abilities
│   │   ├── epic.ts    # Epic tier abilities
│   │   ├── legendary.ts # Legendary tier abilities
│   │   ├── mythic.ts  # Mythic tier abilities
│   │   └── index.ts   # Defense abilities index
│   ├── movement/      # MOVEMENT role abilities
│   │   ├── common.ts  # Common tier abilities
│   │   ├── uncommon.ts # Uncommon tier abilities
│   │   ├── rare.ts    # Rare tier abilities
│   │   ├── epic.ts    # Epic tier abilities
│   │   ├── legendary.ts # Legendary tier abilities
│   │   ├── mythic.ts  # Mythic tier abilities
│   │   └── index.ts   # Movement abilities index
│   └── index.ts       # Abilities master index
├── formations/        # Formation traits (unchanged)
├── behaviors/         # Behavior traits (unchanged)
├── visuals/           # Visual traits (unchanged)
├── mutations/         # Mutation traits (unchanged)
└── index.ts           # Master traits index
```

*(Note: The `traits/` subdirectories remain unchanged from the original structure for brevity, as they are already well-organized by role and tier.)*

## Other Directories
- **`docs/`**, **`tests/`**, **`scripts/`**, **`config/`**, **`assets/`**, **`public/`**: These remain unchanged from the original structure, as they are already comprehensive and appropriately organized. Refer to `directory_structure.md` for their details.



### Implementation Inventory Checklist

To ensure all components are developed and tracked, here’s a full implementation inventory checklist. This can be maintained in `docs/project_checklist.md` and updated as tasks are completed.

- **Creature Domain**
  - [ ] Define creature types (`src/domains/creature/types/`)
  - [ ] Implement creature models (`src/domains/creature/models/`)
  - [ ] Develop `creatureGenerator.ts` service
  - [ ] Create static creature data (`creatures.json`)
  - [ ] Build `CreatureViewer` component
  - [ ] Implement `useCreature.ts` hook
  - [ ] Set up `CreatureContext.ts`

- **Traits Domain**
  - [ ] Define trait types (`src/domains/traits/types/`)
  - [ ] Implement trait models (`src/domains/traits/models/`)
  - [ ] Develop trait-related services (`traitService.ts`, `abilityService.ts`, etc.)
  - [ ] Populate trait data (`abilityPools/`, `formationPatterns/`, etc.)
  - [ ] Build `TraitDisplay` component

- **Bitcoin Domain**
  - [ ] Define bitcoin types (`src/domains/bitcoin/types/`)
  - [ ] Implement `bitcoinService.ts`
  - [ ] Create static block data (`blocks.json`)
  - [ ] Build `BlockSelector` component
  - [ ] Implement `useBitcoinData.ts` hook

- **Rendering Domain**
  - [ ] Define rendering types (`src/domains/rendering/types/`)
  - [ ] Implement rendering services (`instancedRenderer.ts`, `particleRenderer.ts`, etc.)
  - [ ] Build `ParticleRenderer` component
  - [ ] Implement `useRender.ts` hook

- **Evolution Domain**
  - [ ] Define evolution types (`src/domains/evolution/types/`)
  - [ ] Implement `evolutionService.ts`
  - [ ] Create evolution rules data (`evolutionRules.json`)
  - [ ] Build `EvolutionTracker` component
  - [ ] Implement `useEvolution.ts` hook

- **Game Theory Domain**
  - [ ] Define game theory types (`src/domains/gameTheory/types/`)
  - [ ] Implement game theory services (`gameTheoryStrategyService.ts`, etc.)
  - [ ] Create static strategy data (`strategies.json`)

- **Workers Domain**
  - [ ] Define worker types (`src/domains/workers/types/`)
  - [ ] Implement worker services (`forceWorker.ts`, `flockingWorker.ts`, etc.)
  - [ ] Set up `workerBridge.ts`

- **Shared and App**
  - [ ] Define shared types (`src/shared/types/`)
  - [ ] Implement shared libraries (`rngSystem.ts`, `eventBus.ts`, etc.)
  - [ ] Create shared utilities and constants
  - [ ] Build application pages (`Home.tsx`, `Viewer.tsx`, etc.)
  - [ ] Configure routing (`routes.ts`)
  - [ ] Set up `SettingsContext.ts`

- **Testing and Documentation**
  - [ ] Write unit tests for all domains (`tests/unit/`)
  - [ ] Write integration tests (`tests/integration/`)
  - [ ] Write end-to-end tests (`tests/e2e/`)
  - [ ] Document all domains (`docs/architecture/`)

### Rationale

- **Domain-Driven Design**: The `domains/` directory groups code by feature areas (e.g., `creature/`, `traits/`, `bitcoin/`), making it easier to manage related functionality and align with DDD principles.
- **Modularity**: Functions are organized in reusable services or utilities (e.g., `src/shared/lib/`, `src/domains/*/services/`), reducing local function creation and encouraging imports.
- **Consistency**: Each domain follows a similar structure, improving readability and maintainability.
- **Scalability**: New domains (e.g., `networking/`, `ai/`) can be added without restructuring existing code.

If you have specific preferences—like prioritizing certain domains, adjusting the granularity of the structure, or formatting the checklist differently—let me know, and I’ll refine it further!