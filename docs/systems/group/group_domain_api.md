# Group Domain API

## Introduction

The Group Domain API provides a comprehensive interface for managing particle groups, role assignments, class determination, and trait distribution in the Bitcoin Protozoa project. This document details the service interfaces, methods, data structures, and communication patterns that enable the Group Domain to interact with other domains while maintaining clean separation of concerns. The API is designed to be deterministic, efficient, and aligned with the project's domain-driven design principles.

## Service Interfaces

The Group Domain exposes several service interfaces that provide specific functionality:

### GroupService

The primary service interface for the Group Domain, responsible for coordinating all group-related operations.

```typescript
interface IGroupService {
  // Initialization
  initialize(blockData: BlockData): Promise<void>;
  isInitialized(): boolean;

  // Group Creation and Management
  createGroups(particleCount: number, seed: number): ParticleGroups;
  getGroupByRole(groups: ParticleGroups, role: Role): ParticleGroup;

  // Role and Class Determination
  getDominantRole(groups: ParticleGroups): Role;
  getMainClass(groups: ParticleGroups): MainClass;
  getSubclass(groups: ParticleGroups): Subclass;
  getTier(groups: ParticleGroups): Tier;

  // Trait Assignment
  assignTraits(groups: ParticleGroups): GroupTraits;

  // Attribute Calculation
  calculateAttributes(groups: ParticleGroups): Record<string, number>;
  calculateAttributeValue(particles: number): number;

  // Evolution
  evolveGroups(groups: ParticleGroups, confirmations: number): ParticleGroups;

  // Reset
  reset(): void;
}
```

### ParticleDistributionService

Handles the distribution of particles across the five roles.

```typescript
interface IParticleDistributionService {
  // Distribution Methods
  distributeParticles(total: number, seed: number): Record<Role, number>;
  dirichletDistribution(total: number, seed: number): Record<Role, number>;
  normalizedRandomSplit(total: number, seed: number): Record<Role, number>;

  // Constraints
  applyDistributionConstraints(
    distribution: Record<Role, number>,
    minPerGroup: number,
    maxPerGroup: number
  ): Record<Role, number>;
}
```

### ClassAssignmentService

Manages the assignment of main classes and subclasses based on particle distribution.

```typescript
interface IClassAssignmentService {
  // Class Determination
  getMainClass(dominantRole: Role): MainClass;
  getSubclass(groups: ParticleGroups, tier: Tier): Subclass;

  // Tier Determination
  getTier(particleCount: number): Tier;

  // Path Selection
  getSpecializedPath(groups: ParticleGroups, mainClass: MainClass): SpecializedPath;
  getPathEvolution(path: SpecializedPath, tier: Tier): Subclass;
}
```

### TraitAssignmentService

Handles the assignment of traits (formations, behaviors, abilities) to groups.

```typescript
interface ITraitAssignmentService {
  // Trait Assignment
  assignTraits(groups: ParticleGroups, mainClass: MainClass, subclass: Subclass, tier: Tier): GroupTraits;

  // Trait Pooling
  getTraitPool(mainClass: MainClass, subclass: Subclass, tier: Tier): TraitPool;

  // Trait Selection
  selectFormation(pool: TraitPool, seed: number): Formation;
  selectBehaviors(pool: TraitPool, seed: number): Behavior[];
  selectAbilities(pool: TraitPool, seed: number): Ability[];
}
```

## Data Structures

The Group Domain uses several key data structures to represent its core concepts:

### ParticleGroups

Represents the distribution of particles across the five roles.

```typescript
interface ParticleGroups {
  [Role.CORE]: ParticleGroup;
  [Role.CONTROL]: ParticleGroup;
  [Role.MOVEMENT]: ParticleGroup;
  [Role.DEFENSE]: ParticleGroup;
  [Role.ATTACK]: ParticleGroup;
  totalParticles: number;
}

interface ParticleGroup {
  role: Role;
  particleCount: number;
  attributes: GroupAttributes;
  traits?: GroupTraits;
}

interface GroupAttributes {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  resilience: number;
}
```

### GroupTraits

Represents the traits assigned to a particle group.

```typescript
interface GroupTraits {
  formation: Formation;
  behaviors: Behavior[];
  abilities: Ability[];
}

interface Formation {
  id: string;
  name: string;
  pattern: string;
  effects: FormationEffect[];
}

interface Behavior {
  id: string;
  name: string;
  type: BehaviorType;
  effects: BehaviorEffect[];
}

interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  effects: AbilityEffect[];
}
```

### Class and Subclass

Represents the class and subclass assignments.

```typescript
enum MainClass {
  HEALER = 'Healer',
  CASTER = 'Caster',
  ROGUE = 'Rogue',
  TANK = 'Tank',
  STRIKER = 'Striker'
}

interface Subclass {
  name: string;
  mainClass: MainClass;
  tier: Tier;
  specializedPath?: SpecializedPath;
}

enum SpecializedPath {
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

## Method Implementations

### Particle Distribution

The `distributeParticles` method is a key implementation that uses either Dirichlet Distribution or Normalized Random Split to allocate particles:

```typescript
function distributeParticles(total: number, seed: number): Record<Role, number> {
  // Choose distribution method based on implementation preference
  // return dirichletDistribution(total, seed);
  return normalizedRandomSplit(total, seed);
}

function normalizedRandomSplit(
  total: number,
  seed: number,
  minPerGroup: number = 43,
  maxPerGroup: number = 220
): Record<Role, number> {
  const rng = new SeededRNG(seed);
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

  // Apply min/max constraints
  return applyDistributionConstraints(distribution, minPerGroup, maxPerGroup);
}
```

### Attribute Calculation

The `calculateAttributeValue` and `calculateAttributes` methods calculate attribute values based on particle counts:

```typescript
/**
 * Calculate attribute value based on particle count
 * @param particles The number of particles in the group
 * @param minParticles The minimum particles per group (default: 43)
 * @param maxParticles The maximum particles per group (default: 220)
 * @param minAttribute The minimum attribute value (default: 50)
 * @param maxAttribute The maximum attribute value (default: 300)
 * @returns The calculated attribute value
 */
function calculateAttributeValue(
  particles: number,
  minParticles: number = 43,
  maxParticles: number = 220,
  minAttribute: number = 50,
  maxAttribute: number = 300
): number {
  if (particles < minParticles || particles > maxParticles) {
    throw new Error(`Particle count must be between ${minParticles} and ${maxParticles}`);
  }

  const attributeValue = minAttribute +
    ((particles - minParticles) / (maxParticles - minParticles)) *
    (maxAttribute - minAttribute);

  return Math.floor(attributeValue);
}

/**
 * Calculate all attributes for a creature based on its particle distribution
 * @param particleGroups The particle distribution across groups
 * @returns Record of attribute names and values
 */
function calculateAttributes(particleGroups: ParticleGroups): Record<string, number> {
  return {
    Health: calculateAttributeValue(particleGroups[Role.CORE].particleCount),
    Precision: calculateAttributeValue(particleGroups[Role.CONTROL].particleCount),
    Speed: calculateAttributeValue(particleGroups[Role.MOVEMENT].particleCount),
    Armor: calculateAttributeValue(particleGroups[Role.DEFENSE].particleCount),
    Damage: calculateAttributeValue(particleGroups[Role.ATTACK].particleCount)
  };
}
```

### Class Determination

The `getMainClass` and `getSubclass` methods determine the creature's class and subclass:

```typescript
function getMainClass(dominantRole: Role): MainClass {
  const classMap: Record<Role, MainClass> = {
    [Role.CORE]: MainClass.HEALER,
    [Role.CONTROL]: MainClass.CASTER,
    [Role.MOVEMENT]: MainClass.ROGUE,
    [Role.DEFENSE]: MainClass.TANK,
    [Role.ATTACK]: MainClass.STRIKER
  };

  return classMap[dominantRole];
}

function getSubclass(groups: ParticleGroups, tier: Tier): Subclass {
  const dominantRole = getDominantRole(groups);
  const mainClass = getMainClass(dominantRole);

  // For Tiers 1-2, use hybrid approach
  if (tier === Tier.COMMON || tier === Tier.UNCOMMON) {
    const secondRole = getSecondHighestRole(groups);
    const prefix = getSubclassPrefix(secondRole);

    return {
      name: `${prefix} ${mainClass}`,
      mainClass,
      tier
    };
  }

  // For Tiers 3-6, use specialized path
  const path = getSpecializedPath(groups, mainClass);
  const subclassName = getPathEvolution(path, tier);

  return {
    name: subclassName,
    mainClass,
    tier,
    specializedPath: path
  };
}
```

## Event System

The Group Domain uses an event-based system for communication with other domains:

### Event Types

```typescript
enum GroupDomainEventType {
  GROUPS_CREATED = 'groups:created',
  GROUPS_UPDATED = 'groups:updated',
  TRAITS_ASSIGNED = 'traits:assigned',
  GROUPS_EVOLVED = 'groups:evolved'
}

interface GroupDomainEvent {
  type: GroupDomainEventType;
  payload: any;
}
```

### Event Handlers

```typescript
// Publishing events
function publishEvent(event: GroupDomainEvent): void {
  eventBus.publish(event.type, event.payload);
}

// Example event publication
function onGroupsCreated(groups: ParticleGroups): void {
  publishEvent({
    type: GroupDomainEventType.GROUPS_CREATED,
    payload: { groups }
  });
}

// Subscribing to events
function subscribeToEvents(): void {
  eventBus.subscribe(CreatureDomainEventType.CREATURE_CREATED, onCreatureCreated);
  eventBus.subscribe(BitcoinDomainEventType.BLOCK_UPDATED, onBlockUpdated);
}

// Example event handler
function onCreatureCreated(payload: { creatureId: string }): void {
  const groups = createGroups(500, getCurrentSeed());
  assignTraits(groups);

  // Associate groups with creature
  creatureService.setGroups(payload.creatureId, groups);
}
```

## Integration with Other Domains

The Group Domain integrates with several other domains:

### Bitcoin Domain

```typescript
// Fetching block data for seeding
async function initializeWithBlockData(blockNumber: number): Promise<void> {
  const blockData = await bitcoinService.getBlockData(blockNumber);
  await initialize(blockData);
}

// Using block nonce as seed
function getCurrentSeed(): number {
  return createSeedFromNonce(bitcoinService.getCurrentBlockData().nonce);
}
```

### RNG Domain

```typescript
// Creating seeded RNG
function createSeededRNG(seed: number): RNG {
  return rngService.createRNG(seed);
}

// Using RNG for distribution
function distributeWithRNG(total: number, seed: number): Record<Role, number> {
  const rng = createSeededRNG(seed);
  // Use RNG for distribution calculations
}
```

### Traits Domain

```typescript
// Fetching trait pools
function getTraitPool(mainClass: MainClass, subclass: Subclass, tier: Tier): TraitPool {
  return traitsService.getTraitPool(mainClass, subclass, tier);
}

// Selecting traits
function selectTraits(pool: TraitPool, seed: number): GroupTraits {
  const rng = createSeededRNG(seed);

  return {
    formation: selectFormation(pool.formations, rng),
    behaviors: selectBehaviors(pool.behaviors, rng),
    abilities: selectAbilities(pool.abilities, rng)
  };
}
```

### Creature Domain

```typescript
// Applying groups to creature
function applyGroupsToCreature(creatureId: string, groups: ParticleGroups): void {
  creatureService.setGroups(creatureId, groups);

  // Update creature attributes based on groups
  const attributes = calculateCreatureAttributes(groups);
  creatureService.setAttributes(creatureId, attributes);
}
```

## Error Handling

The Group Domain implements robust error handling:

```typescript
// Service initialization error handling
async function initialize(blockData: BlockData): Promise<void> {
  try {
    // Initialization logic
    this.initialized = true;
    this.logger.info('Group service initialized');
  } catch (error) {
    this.logger.error('Failed to initialize Group service', error);
    throw new GroupDomainError('Initialization failed', error);
  }
}

// Domain-specific error class
class GroupDomainError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'GroupDomainError';
  }
}

// Validation error handling
function validateParticleDistribution(distribution: Record<Role, number>): void {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  if (total !== 500) {
    throw new GroupDomainError(`Invalid particle distribution: total ${total} is not 500`);
  }

  for (const role of Object.keys(distribution) as Role[]) {
    if (distribution[role] < 43) {
      throw new GroupDomainError(`Invalid particle distribution: ${role} has less than 43 particles`);
    }
    if (distribution[role] > 220) {
      throw new GroupDomainError(`Invalid particle distribution: ${role} has more than 220 particles`);
    }
  }
}
```

## Conclusion

The Group Domain API provides a comprehensive interface for managing particle groups, role assignments, class determination, and trait distribution in the Bitcoin Protozoa project. By exposing well-defined service interfaces, data structures, and communication patterns, the API enables clean integration with other domains while maintaining separation of concerns. The deterministic nature of the API ensures that the same inputs always produce the same outputs, a core principle of the project's design.
