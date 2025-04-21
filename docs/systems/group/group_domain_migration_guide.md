# Group Domain Migration Guide

## Introduction

This document provides a comprehensive guide for migrating from the previous implementation to the new Group Domain in the Bitcoin Protozoa project. The migration involves transitioning from a monolithic approach to a domain-driven design, with the Group Domain handling particle distribution, role assignment, class determination, and trait assignment. This guide outlines the step-by-step process, code refactoring guidelines, data migration considerations, and validation steps to ensure a smooth transition.

## Migration Overview

The migration to the Group Domain involves several key changes:

1. **Architectural Shift**: Moving from a monolithic structure to a domain-driven design
2. **Responsibility Separation**: Isolating group-related functionality into a dedicated domain
3. **API Standardization**: Establishing clear interfaces for interacting with group functionality
4. **Data Structure Refinement**: Enhancing data models for better type safety and clarity
5. **Determinism Improvement**: Ensuring consistent, reproducible behavior across all operations

This migration will improve code maintainability, testability, and scalability while preserving the core functionality and deterministic nature of the Bitcoin Protozoa project.

## Prerequisites

Before beginning the migration, ensure the following prerequisites are met:

1. **Domain Infrastructure**: The domain-driven design infrastructure should be in place, including:
   - Domain folder structure
   - Event bus system
   - Service registration mechanism

2. **Dependent Domains**: The following domains should be implemented and functional:
   - RNG Domain: For deterministic random number generation
   - Bitcoin Domain: For block data and nonce access
   - Traits Domain: For trait pools and selection

3. **Type Definitions**: Core type definitions should be established in the shared types folder:
   - Role enum
   - MainClass enum
   - Tier enum
   - Formation, Behavior, and Ability interfaces

4. **Test Environment**: A testing environment should be set up to validate the migration, including:
   - Unit test framework
   - Integration test capabilities
   - Validation scripts

## Code Migration Steps

### Step 1: Create Domain Structure

Create the Group Domain folder structure:

```
src/
  domains/
    group/
      constants/       # Constants specific to the Group Domain
      events/          # Event definitions and handlers
      interfaces/      # Service and model interfaces
      models/          # Data models and types
      services/        # Service implementations
      utils/           # Utility functions
      index.ts         # Domain entry point
```

Create the domain entry point (`index.ts`):

```typescript
// src/domains/group/index.ts
import { GroupService } from './services/groupService';
import { ParticleDistributionService } from './services/particleDistributionService';
import { ClassAssignmentService } from './services/classAssignmentService';
import { TraitAssignmentService } from './services/traitAssignmentService';

export * from './interfaces';
export * from './models';
export * from './events';

// Export services for dependency injection
export const services = {
  groupService: new GroupService(),
  particleDistributionService: new ParticleDistributionService(),
  classAssignmentService: new ClassAssignmentService(),
  traitAssignmentService: new TraitAssignmentService()
};

// Initialize domain
export async function initialize(): Promise<void> {
  await services.groupService.initialize();
  console.log('Group Domain initialized');
}
```

### Step 2: Define Interfaces

Create the service interfaces in the `interfaces` folder:

```typescript
// src/domains/group/interfaces/services.ts
import { BlockData } from '../../bitcoin/interfaces';
import { Role, MainClass, Tier } from '../../../shared/types/core';
import { ParticleGroups, ParticleGroup, GroupTraits, Subclass, SpecializedPath } from '../models';

export interface IGroupService {
  initialize(blockData?: BlockData): Promise<void>;
  isInitialized(): boolean;
  createGroups(particleCount: number, seed: number): ParticleGroups;
  getGroupByRole(groups: ParticleGroups, role: Role): ParticleGroup;
  getDominantRole(groups: ParticleGroups): Role;
  getMainClass(groups: ParticleGroups): MainClass;
  getSubclass(groups: ParticleGroups): Subclass;
  getTier(groups: ParticleGroups): Tier;
  assignTraits(groups: ParticleGroups): GroupTraits;
  evolveGroups(groups: ParticleGroups, confirmations: number): ParticleGroups;
  reset(): void;
}

export interface IParticleDistributionService {
  distributeParticles(total: number, seed: number): Record<Role, number>;
  dirichletDistribution(total: number, seed: number): Record<Role, number>;
  normalizedRandomSplit(total: number, seed: number): Record<Role, number>;
  applyDistributionConstraints(
    distribution: Record<Role, number>,
    minPerGroup: number,
    maxPerGroup: number
  ): Record<Role, number>;
}

export interface IClassAssignmentService {
  getMainClass(dominantRole: Role): MainClass;
  getSubclass(groups: ParticleGroups, tier: Tier): Subclass;
  getTier(particleCount: number): Tier;
  getSpecializedPath(groups: ParticleGroups, mainClass: MainClass): SpecializedPath;
  getPathEvolution(path: SpecializedPath, tier: Tier): string;
}

export interface ITraitAssignmentService {
  assignTraits(groups: ParticleGroups, mainClass: MainClass, subclass: Subclass, tier: Tier, seed?: number): GroupTraits;
  getTraitPool(mainClass: MainClass, subclass: Subclass, tier: Tier): TraitPool;
  selectFormation(pool: TraitPool, seed: number): Formation;
  selectBehaviors(pool: TraitPool, seed: number): Behavior[];
  selectAbilities(pool: TraitPool, seed: number): Ability[];
}

export interface TraitPool {
  formations: Formation[];
  behaviors: Behavior[];
  abilities: Ability[];
}
```

### Step 3: Define Models

Create the data models in the `models` folder:

```typescript
// src/domains/group/models/particleGroups.ts
import { Role } from '../../../shared/types/core';
import { GroupTraits } from './traits';

export interface ParticleGroups {
  [Role.CORE]: ParticleGroup;
  [Role.CONTROL]: ParticleGroup;
  [Role.MOVEMENT]: ParticleGroup;
  [Role.DEFENSE]: ParticleGroup;
  [Role.ATTACK]: ParticleGroup;
  totalParticles: number;
}

export interface ParticleGroup {
  role: Role;
  particleCount: number;
  attributes: GroupAttributes;
  traits?: GroupTraits;
}

export interface GroupAttributes {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  resilience: number;
}
```

```typescript
// src/domains/group/models/traits.ts
import { Formation, Behavior, Ability } from '../../../shared/types/traits';

export interface GroupTraits {
  formation: Formation;
  behaviors: Behavior[];
  abilities: Ability[];
}
```

```typescript
// src/domains/group/models/class.ts
import { MainClass, Tier } from '../../../shared/types/core';

export interface Subclass {
  name: string;
  mainClass: MainClass;
  tier: Tier;
  specializedPath?: SpecializedPath;
}

export enum SpecializedPath {
  // Healer Paths
  RESTORATION_SPECIALIST = 'RestorationSpecialist',
  FIELD_MEDIC = 'FieldMedic',

  // Caster Paths
  ARCHMAGE = 'Archmage',
  ENCHANTER = 'Enchanter',

  // Rogue Paths
  ASSASSIN_ROGUE = 'AssassinRogue',
  ACROBAT = 'Acrobat',

  // Tank Paths
  SENTINEL = 'Sentinel',
  GUARDIAN = 'Guardian',

  // Striker Paths
  BERSERKER = 'Berserker',
  ASSASSIN_STRIKER = 'AssassinStriker'
}
```

### Step 4: Define Events

Create the event definitions in the `events` folder:

```typescript
// src/domains/group/events/index.ts
import { ParticleGroups, GroupTraits } from '../models';

export enum GroupDomainEventType {
  GROUPS_CREATED = 'groups:created',
  GROUPS_UPDATED = 'groups:updated',
  TRAITS_ASSIGNED = 'traits:assigned',
  GROUPS_EVOLVED = 'groups:evolved'
}

export interface GroupDomainEvent {
  type: GroupDomainEventType;
  payload: any;
}

export interface GroupsCreatedEvent {
  type: GroupDomainEventType.GROUPS_CREATED;
  payload: {
    groups: ParticleGroups;
    creatureId?: string;
  };
}

export interface GroupsUpdatedEvent {
  type: GroupDomainEventType.GROUPS_UPDATED;
  payload: {
    groups: ParticleGroups;
    creatureId?: string;
  };
}

export interface TraitsAssignedEvent {
  type: GroupDomainEventType.TRAITS_ASSIGNED;
  payload: {
    groups: ParticleGroups;
    traits: GroupTraits;
    creatureId?: string;
  };
}

export interface GroupsEvolvedEvent {
  type: GroupDomainEventType.GROUPS_EVOLVED;
  payload: {
    groups: ParticleGroups;
    previousGroups: ParticleGroups;
    confirmations: number;
    creatureId?: string;
  };
}
```

### Step 5: Implement Services

Implement the service classes in the `services` folder. Here's an example of the `ParticleDistributionService`:

```typescript
// src/domains/group/services/particleDistributionService.ts
import { IParticleDistributionService } from '../interfaces';
import { Role } from '../../../shared/types/core';
import { RNG } from '../../rng/interfaces';
import { services as rngServices } from '../../rng';

export class ParticleDistributionService implements IParticleDistributionService {
  private rngService = rngServices.rngService;

  /**
   * Distribute particles across roles using the preferred method
   */
  public distributeParticles(total: number, seed: number): Record<Role, number> {
    // Choose distribution method based on implementation preference
    // return this.dirichletDistribution(total, seed);
    return this.normalizedRandomSplit(total, seed);
  }

  /**
   * Distribute particles using Dirichlet distribution
   */
  public dirichletDistribution(total: number, seed: number): Record<Role, number> {
    const rng = this.createRNG(seed);
    const roles = [Role.CORE, Role.CONTROL, Role.MOVEMENT, Role.DEFENSE, Role.ATTACK];
    const alphas = roles.map(() => 1); // Uniform concentration parameter

    // Generate Dirichlet-distributed random variables (approximation)
    const gammas = alphas.map(alpha => {
      let sum = 0;
      for (let i = 0; i < alpha; i++) {
        sum -= Math.log(rng.nextFloat());
      }
      return sum;
    });

    const sum = gammas.reduce((a, b) => a + b, 0);
    let fractions = gammas.map(g => g / sum);

    // Apply to total particles
    let rawCounts = fractions.map(f => Math.floor(f * total));

    // Convert to record
    const distribution: Record<Role, number> = {} as Record<Role, number>;
    roles.forEach((role, i) => {
      distribution[role] = rawCounts[i];
    });

    // Apply constraints
    return this.applyDistributionConstraints(distribution, 43, 220);
  }

  /**
   * Distribute particles using Normalized Random Split
   */
  public normalizedRandomSplit(total: number, seed: number): Record<Role, number> {
    const rng = this.createRNG(seed);
    const roles = [Role.CORE, Role.CONTROL, Role.MOVEMENT, Role.DEFENSE, Role.ATTACK];

    // Generate random values for each role
    let fractions = roles.map(() => rng.nextFloat());
    const sum = fractions.reduce((a, b) => a + b, 0);
    fractions = fractions.map(f => (f / sum) * total);

    // Initial distribution
    const distribution: Record<Role, number> = {} as Record<Role, number>;
    let remaining = total;

    roles.forEach((role, i) => {
      let value = Math.floor(fractions[i]);
      distribution[role] = value;
      remaining -= value;
    });

    // Distribute remaining particles
    while (remaining > 0) {
      for (let i = 0; i < roles.length && remaining > 0; i++) {
        distribution[roles[i]]++;
        remaining--;
      }
    }

    // Apply constraints
    return this.applyDistributionConstraints(distribution, 43, 220);
  }

  /**
   * Apply min/max constraints to particle distribution
   */
  public applyDistributionConstraints(
    distribution: Record<Role, number>,
    minPerGroup: number,
    maxPerGroup: number
  ): Record<Role, number> {
    const roles = Object.keys(distribution) as Role[];
    const result = { ...distribution };
    let remaining = 0;

    // Apply minimum constraint
    roles.forEach(role => {
      if (result[role] < minPerGroup) {
        remaining -= (minPerGroup - result[role]);
        result[role] = minPerGroup;
      }
    });

    // Apply maximum constraint and calculate excess
    roles.forEach(role => {
      if (result[role] > maxPerGroup) {
        remaining += (result[role] - maxPerGroup);
        result[role] = maxPerGroup;
      }
    });

    // Redistribute excess or deficit
    while (remaining !== 0) {
      if (remaining > 0) {
        // Distribute excess particles
        for (const role of roles) {
          if (result[role] < maxPerGroup && remaining > 0) {
            result[role]++;
            remaining--;
          }
        }
      } else {
        // Handle deficit by taking from largest groups
        const sortedRoles = [...roles].sort((a, b) => result[b] - result[a]);
        for (const role of sortedRoles) {
          if (result[role] > minPerGroup && remaining < 0) {
            result[role]--;
            remaining++;
          }
        }
      }
    }

    return result;
  }

  /**
   * Create a seeded RNG instance
   */
  private createRNG(seed: number): RNG {
    return this.rngService.createRNG(seed);
  }
}
```

### Step 6: Migrate Data

Create a migration script to transfer data from the old implementation to the new Group Domain:

```typescript
// src/scripts/migrateGroupData.ts
import { services as groupServices } from '../domains/group';
import { services as bitcoinServices } from '../domains/bitcoin';
import { services as creatureServices } from '../domains/creature';
import { Role } from '../shared/types/core';

/**
 * Migrate group data from old implementation to new Group Domain
 */
async function migrateGroupData(): Promise<void> {
  console.log('Starting group data migration...');

  try {
    // Initialize domains
    await bitcoinServices.bitcoinService.initialize();
    await groupServices.groupService.initialize();

    // Get all creatures
    const creatures = await creatureServices.creatureService.getAllCreatures();
    console.log(`Found ${creatures.length} creatures to migrate`);

    // Migrate each creature's group data
    for (const creature of creatures) {
      console.log(`Migrating creature ${creature.id}...`);

      // Extract old group data
      const oldGroupData = creature.legacyData?.groups;
      if (!oldGroupData) {
        console.log(`No legacy group data found for creature ${creature.id}, creating new groups`);

        // Create new groups using creature's seed
        const seed = creature.seed || bitcoinServices.bitcoinService.getCurrentBlockData().nonce;
        const groups = groupServices.groupService.createGroups(500, seed);

        // Assign traits
        groupServices.groupService.assignTraits(groups);

        // Associate with creature
        await creatureServices.creatureService.setGroups(creature.id, groups);

        console.log(`Created new groups for creature ${creature.id}`);
        continue;
      }

      // Convert old group data to new format
      const newGroups = convertLegacyGroups(oldGroupData, creature.seed);

      // Assign traits using new system
      groupServices.groupService.assignTraits(newGroups);

      // Associate with creature
      await creatureServices.creatureService.setGroups(creature.id, newGroups);

      console.log(`Successfully migrated groups for creature ${creature.id}`);
    }

    console.log('Group data migration completed successfully');
  } catch (error) {
    console.error('Error during group data migration:', error);
    throw error;
  }
}

/**
 * Convert legacy group data to new format
 */
function convertLegacyGroups(legacyData: any, seed: number): ParticleGroups {
  // Extract particle counts from legacy data
  const distribution: Record<Role, number> = {
    [Role.CORE]: legacyData.core?.particleCount || 100,
    [Role.CONTROL]: legacyData.control?.particleCount || 100,
    [Role.MOVEMENT]: legacyData.movement?.particleCount || 100,
    [Role.DEFENSE]: legacyData.defense?.particleCount || 100,
    [Role.ATTACK]: legacyData.attack?.particleCount || 100
  };

  // Apply constraints to ensure valid distribution
  const validDistribution = groupServices.particleDistributionService
    .applyDistributionConstraints(distribution, 43, 220);

  // Create new group structure
  return {
    [Role.CORE]: {
      role: Role.CORE,
      particleCount: validDistribution[Role.CORE],
      attributes: convertLegacyAttributes(legacyData.core?.attributes)
    },
    [Role.CONTROL]: {
      role: Role.CONTROL,
      particleCount: validDistribution[Role.CONTROL],
      attributes: convertLegacyAttributes(legacyData.control?.attributes)
    },
    [Role.MOVEMENT]: {
      role: Role.MOVEMENT,
      particleCount: validDistribution[Role.MOVEMENT],
      attributes: convertLegacyAttributes(legacyData.movement?.attributes)
    },
    [Role.DEFENSE]: {
      role: Role.DEFENSE,
      particleCount: validDistribution[Role.DEFENSE],
      attributes: convertLegacyAttributes(legacyData.defense?.attributes)
    },
    [Role.ATTACK]: {
      role: Role.ATTACK,
      particleCount: validDistribution[Role.ATTACK],
      attributes: convertLegacyAttributes(legacyData.attack?.attributes)
    },
    totalParticles: Object.values(validDistribution).reduce((sum, count) => sum + count, 0)
  };
}

/**
 * Convert legacy attributes to new format
 */
function convertLegacyAttributes(legacyAttributes: any): GroupAttributes {
  return {
    strength: legacyAttributes?.strength || 10,
    agility: legacyAttributes?.agility || 10,
    intelligence: legacyAttributes?.intelligence || 10,
    vitality: legacyAttributes?.vitality || 10,
    resilience: legacyAttributes?.resilience || 10
  };
}

// Run migration if executed directly
if (require.main === module) {
  migrateGroupData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
```

### Step 7: Update References

Update all references to the old group implementation throughout the codebase:

1. **Creature Domain**: Update the Creature Domain to use the Group Domain services

```typescript
// src/domains/creature/services/creatureService.ts
import { services as groupServices } from '../../group';

// Replace direct group manipulation with Group Domain calls
class CreatureService {
  // ...

  public createCreature(seed: number): Creature {
    // ...

    // Use Group Domain to create groups
    const groups = groupServices.groupService.createGroups(500, seed);
    groupServices.groupService.assignTraits(groups);

    // ...
  }

  // ...
}
```

2. **UI Components**: Update UI components to use the Group Domain services

```typescript
// src/ui/components/CreatureView.tsx
import { services as groupServices } from '../../domains/group';

function CreatureView({ creature }) {
  // ...

  // Get dominant role and class
  const dominantRole = groupServices.groupService.getDominantRole(creature.groups);
  const mainClass = groupServices.groupService.getMainClass(creature.groups);

  // ...
}
```

3. **Game Logic**: Update game logic to use the Group Domain services

```typescript
// src/domains/game/services/gameService.ts
import { services as groupServices } from '../../group';

class GameService {
  // ...

  public evolveCreature(creatureId: string, confirmations: number): void {
    const creature = this.getCreature(creatureId);

    // Use Group Domain to evolve groups
    const evolvedGroups = groupServices.groupService.evolveGroups(creature.groups, confirmations);

    // Update creature with evolved groups
    this.creatureService.setGroups(creatureId, evolvedGroups);

    // ...
  }

  // ...
}
```

### Step 8: Validation and Testing

Validate the migration and test the new Group Domain implementation:

1. **Run Unit Tests**:

```bash
npm run test:unit -- --testPathPattern=domains/group
```

2. **Run Integration Tests**:

```bash
npm run test:integration -- --testPathPattern=domains/group
```

3. **Validate Data Migration**:

```bash
node src/scripts/validateGroupMigration.js
```

4. **Manual Testing**:
   - Create new creatures and verify group creation
   - Evolve creatures and verify group evolution
   - Check trait assignment and class determination

## Backward Compatibility

To maintain backward compatibility during the transition period:

1. **Dual Writing**: Write to both old and new implementations temporarily

```typescript
function updateGroups(creatureId: string, groupData: any): void {
  // Update using old implementation
  legacyUpdateGroups(creatureId, groupData);

  // Update using new Group Domain
  const newGroups = convertToNewFormat(groupData);
  groupServices.groupService.updateGroups(creatureId, newGroups);
}
```

2. **Feature Flags**: Use feature flags to control which implementation is used

```typescript
function getGroups(creatureId: string): any {
  if (featureFlags.useNewGroupDomain) {
    return groupServices.groupService.getGroups(creatureId);
  } else {
    return legacyGetGroups(creatureId);
  }
}
```

3. **Gradual Rollout**: Roll out the new implementation gradually to minimize risk

## Troubleshooting

Common issues and their solutions:

1. **Data Inconsistency**: If migrated data doesn't match expected format
   - Run the validation script to identify inconsistencies
   - Use the data repair script: `node src/scripts/repairGroupData.js`

2. **Performance Issues**: If the new implementation causes performance problems
   - Check for unnecessary recalculations
   - Implement caching for expensive operations
   - Optimize the particle distribution algorithms

3. **Integration Errors**: If other domains fail to interact properly with the Group Domain
   - Verify service interfaces match expected contracts
   - Check for circular dependencies
   - Ensure event handlers are properly registered

## Conclusion

Migrating to the Group Domain improves code organization, maintainability, and testability while preserving the core functionality of the Bitcoin Protozoa project. By following this guide, you can successfully transition from the monolithic approach to a domain-driven design that better separates concerns and provides clear interfaces for group-related functionality.

The migration process involves creating the domain structure, defining interfaces and models, implementing services, migrating data, updating references, and validating the implementation. With careful planning and testing, this migration can be completed with minimal disruption to the project's functionality.
