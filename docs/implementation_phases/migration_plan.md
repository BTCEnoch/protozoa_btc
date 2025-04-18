# Bitcoin Protozoa - Migration Plan

## Overview
This document outlines the step-by-step approach for migrating the Bitcoin Protozoa project from its current structure in `old_src/` to the new domain-driven design (DDD) structure defined in `docs/references/directory_map.md`.

## Migration Strategy

We'll approach the migration in phases, focusing on one domain at a time, starting with the most fundamental domains that others depend on. For each domain, we'll follow these steps:

1. Create the necessary directory structure
2. Migrate types first
3. Migrate services and utilities
4. Migrate components and hooks
5. Create appropriate index files
6. Test the migrated domain

## Migration Phases

### Phase 1: Project Setup and Shared Types/Utilities
- Create the basic project structure
- Migrate core types and enums
- Migrate shared utilities and libraries
- Set up the foundation for other domains

### Phase 2: Bitcoin Domain
- Migrate Bitcoin types
- Migrate Bitcoin service
- Migrate Bitcoin components and hooks

### Phase 3: RNG System and Particle System
- Migrate RNG system
- Migrate particle types and services
- Migrate particle rendering components

### Phase 4: Traits Domain
- Migrate trait types
- Migrate trait services
- Migrate trait data definitions

### Phase 5: Evolution and Game Theory
- Migrate evolution types and services
- Migrate game theory types and services

### Phase 6: Workers Domain
- Migrate worker types
- Migrate worker services
- Set up worker bridge

### Phase 7: Application Layer
- Implement application pages
- Set up routing
- Implement application contexts

### Phase 8: Testing and Documentation
- Write unit tests
- Write integration tests
- Update documentation

## Detailed Migration Tasks

### Phase 1: Project Setup and Shared Types/Utilities

#### 1.1 Create Basic Project Structure
- [x] Create `src/` directory
- [x] Create `src/shared/` directory
- [x] Create `src/domains/` directory
- [x] Create `src/app/` directory

#### 1.2 Migrate Core Types
- [x] Migrate `old_src/types/core.ts` to `src/shared/types/core.ts`
- [x] Migrate `old_src/types/common.ts` to `src/shared/types/common.ts`
- [x] Migrate `old_src/types/config.ts` to `src/shared/types/config.ts`
- [x] Migrate `old_src/types/events.ts` to `src/shared/types/events.ts`
- [x] Migrate `old_src/types/utils/rng.ts` to `src/shared/types/rng.ts`
- [x] Create `src/shared/types/index.ts`

#### 1.3 Migrate Shared Libraries
- [x] Migrate `old_src/lib/rngSystem.ts` to `src/shared/lib/rngSystem.ts`
- [ ] Migrate `old_src/lib/eventBus.ts` to `src/shared/lib/eventBus.ts`
- [ ] Migrate `old_src/lib/mathUtils.ts` to `src/shared/lib/mathUtils.ts`
- [ ] Migrate `old_src/lib/spatialUtils.ts` to `src/shared/lib/spatialUtils.ts`
- [ ] Migrate `old_src/lib/particleSystem.ts` to `src/shared/lib/particleSystem.ts`
- [x] Create `src/shared/lib/index.ts`

#### 1.4 Migrate Shared Utilities
- [ ] Create `src/shared/utils/math.ts` based on `old_src/lib/mathUtils.ts`
- [ ] Create `src/shared/utils/random.ts` based on `old_src/services/utils/random.ts`
- [ ] Create `src/shared/utils/validation.ts`
- [ ] Create `src/shared/utils/logging.ts`
- [ ] Create `src/shared/utils/performance/` directory
- [ ] Create `src/shared/utils/index.ts`

#### 1.5 Migrate Shared Constants
- [ ] Create `src/shared/constants/config.ts`
- [ ] Create `src/shared/constants/traits.ts`
- [ ] Create `src/shared/constants/evolution.ts`
- [ ] Create `src/shared/constants/index.ts`

### Phase 2: Bitcoin Domain

#### 2.1 Create Bitcoin Domain Structure
- [x] Create `src/domains/bitcoin/` directory
- [x] Create `src/domains/bitcoin/types/` directory
- [x] Create `src/domains/bitcoin/services/` directory
- [x] Create `src/domains/bitcoin/components/` directory
- [x] Create `src/domains/bitcoin/hooks/` directory
- [x] Create `src/domains/bitcoin/data/` directory

#### 2.2 Migrate Bitcoin Types
- [x] Migrate `old_src/types/bitcoin/bitcoin.ts` to `src/domains/bitcoin/types/bitcoin.ts`
- [x] Create `src/domains/bitcoin/types/index.ts`

#### 2.3 Migrate Bitcoin Services
- [x] Migrate `old_src/services/bitcoin/bitcoinService.ts` to `src/domains/bitcoin/services/bitcoinService.ts`
- [ ] Migrate `old_src/services/bitcoin/bitcoinApiClient.ts` to `src/domains/bitcoin/services/bitcoinApiClient.ts` (if needed)
- [x] Create `src/domains/bitcoin/services/index.ts`

#### 2.4 Migrate Bitcoin Components and Hooks
- [ ] Migrate `old_src/components/BlockSelector/` to `src/domains/bitcoin/components/BlockSelector/`
- [ ] Migrate `old_src/hooks/useBitcoinData.ts` to `src/domains/bitcoin/hooks/useBitcoinData.ts`
- [ ] Create `src/domains/bitcoin/hooks/index.ts`
- [ ] Create `src/domains/bitcoin/components/index.ts`

#### 2.5 Create Bitcoin Data
- [ ] Create `src/domains/bitcoin/data/blocks.json` (if needed)
- [ ] Create `src/domains/bitcoin/data/index.ts`

#### 2.6 Create Bitcoin Domain Index
- [x] Create `src/domains/bitcoin/index.ts`

### Phase 3: RNG System and Particle System

(Continue with similar detailed tasks for each phase)

## Migration Tracking

We'll track the migration progress using the following table:

| Phase | Task | Status | Notes |
|-------|------|--------|-------|
| 1.1 | Create Basic Project Structure | Completed | |
| 1.2 | Migrate Core Types | Completed | |
| 1.3 | Migrate Shared Libraries | In Progress | RNG system migrated |
| 1.4 | Migrate Shared Utilities | Completed | Math, Random, Validation, Logging, Performance utilities migrated |
| 1.5 | Migrate Shared Constants | Completed | Config, Traits, Evolution constants migrated |
| 2.1 | Create Bitcoin Domain Structure | Completed | |
| 2.2 | Migrate Bitcoin Types | Completed | |
| 2.3 | Migrate Bitcoin Services | Completed | |
| 2.4 | Migrate Bitcoin Components and Hooks | Not Started | |
| 2.5 | Create Bitcoin Data | Not Started | |
| 2.6 | Create Bitcoin Domain Index | Completed | |
| 3.1 | Create Creature Domain Structure | Completed | |
| 3.2 | Migrate Creature Types | Completed | |
| 3.3 | Migrate Creature Services | Completed | Creature service, generator, factory, and particle service migrated |
| 4.1 | Create Traits Domain Structure | Completed | |
| 4.2 | Migrate Trait Types | Completed | |
| 4.3 | Migrate Trait Services | Completed | Trait service, trait factory, and mutation service migrated |
| 5.1 | Create Evolution Domain Structure | Completed | |
| 5.2 | Migrate Evolution Types | Completed | |
| 5.3 | Migrate Evolution Services | Completed | |
| 6.1 | Create Rendering Domain Structure | Completed | |
| 6.2 | Migrate Rendering Types | Completed | |
| 6.3 | Migrate Rendering Services | Completed | All rendering services migrated (RenderService, InstancedRenderer, TrailRenderer, ParticleRenderer, ShaderManager, LODManager) |
| 7.1 | Create Workers Domain Structure | Completed | |
| 7.2 | Migrate Worker Types | Completed | |
| 7.3 | Migrate Worker Services | Completed | Worker service, worker pool service, and particle worker service migrated |
| 8.1 | Create Game Theory Domain Structure | Completed | |
| 8.2 | Migrate Game Theory Types | Completed | |
| 8.3 | Migrate Game Theory Services | Completed | Game theory service, strategy factory service, and simulation service migrated |
| 9.1 | Create Particle Domain Structure | Completed | |
| 9.2 | Migrate Particle Types | Completed | |
| 9.3 | Migrate Particle Services | Completed | Particle service and particle system service migrated |

## Conclusion

This migration plan provides a structured approach to reorganizing the Bitcoin Protozoa project into a domain-driven design architecture. By following this plan, we can ensure a smooth transition while maintaining the functionality of the application.

The plan is designed to be flexible, allowing for adjustments as we progress through the migration. We'll update this document as needed to reflect any changes in the migration strategy.
