# Subclass Tier System in Bitcoin Protozoa

## Introduction

The Subclass Tier System in Bitcoin Protozoa defines how creatures specialize and evolve based on their particle distribution. This system creates a progression path from generalist hybrid subclasses at lower tiers to highly specialized subclasses at higher tiers. This document details the tier structure, subclass determination, trait pooling mechanics, and evolution paths that form the foundation of creature specialization in the project.

## Tier Structure Overview

The Subclass Tier System consists of six rarity tiers, each corresponding to specific particle count ranges in the dominant role:

| Tier | Rarity | Particle Range | Description |
|------|--------|----------------|-------------|
| 1 | Common | 43-95 | Basic hybrid functionality with broad trait pools |
| 2 | Uncommon | 96-110 | Enhanced hybrid functionality with focused trait pools |
| 3 | Rare | 111-125 | Specialized path with distinct identity |
| 4 | Epic | 126-141 | Advanced specialization with powerful traits |
| 5 | Legendary | 142-151 | Exceptional specialization with rare abilities |
| 6 | Mythic | 152-220 | Ultimate specialization with unique capabilities |

These tiers create a natural progression from common, versatile creatures to rare, highly specialized ones. The particle ranges ensure that higher tiers are progressively rarer, creating a balanced distribution across the population.

## Two-Tier Subclass Structure

The Subclass Tier System implements a two-tier structure that differentiates between lower and higher tiers:

### Tiers 1-2: Hybrid Subclasses

Tiers 1 (Common) and 2 (Uncommon) implement a "melting pot" approach, where subclasses are hybrid combinations influenced primarily by the top two particle groups:

#### Tier 1 (Common) Characteristics:
- **Trait Pooling**: Draws from 4 distinct sets of traits and abilities
- **Flexibility**: Highly versatile with broad but less powerful capabilities
- **Subclass Determination**: Based on the top two particle groups
- **Example**: A "Guardian Healer" (CORE dominant, DEFENSE second) at Tier 1 would draw traits from CORE Healing, DEFENSE Protection, and two additional trait sets

#### Tier 2 (Uncommon) Characteristics:
- **Trait Pooling**: Draws from 3 distinct sets of traits and abilities
- **Focus**: More focused than Tier 1, but still maintains versatility
- **Subclass Determination**: Based on the top two particle groups, with increased influence from the dominant group
- **Example**: The same "Guardian Healer" at Tier 2 would draw traits from CORE Healing, DEFENSE Protection, and one additional trait set

This approach ensures that lower-tier creatures have variety and versatility, making them enjoyable to play despite their lower power level.

### Tiers 3-6: Specialized Subclasses

Starting at Tier 3 (Rare), creatures follow specialized subclass paths that evolve with each higher tier:

#### Specialized Path Structure:
- **Path Determination**: At Tier 3, each main class branches into two distinct specialized paths
- **Path Evolution**: Each path evolves through Tiers 4-6, maintaining its core identity while gaining enhanced capabilities
- **Trait Specificity**: Traits become increasingly specific to the chosen path
- **Power Scaling**: Higher tiers offer more powerful versions of path-specific traits

#### Example Evolution Path for Healer (CORE dominant):
- **Path 1: Restoration Specialist**
  - Tier 3 (Rare): "Lifebinder" - Focus on single-target healing
  - Tier 4 (Epic): "Vitalizer" - Enhanced healing with energy restoration
  - Tier 5 (Legendary): "Soulweaver" - Powerful healing with resurrection capabilities
  - Tier 6 (Mythic): "Eternal Guardian" - Ultimate healing with immortality effects

- **Path 2: Field Medic**
  - Tier 3 (Rare): "Mender" - Focus on group healing
  - Tier 4 (Epic): "Rejuvenator" - Area healing with regeneration effects
  - Tier 5 (Legendary): "Lifebloom" - Powerful area healing with preventative barriers
  - Tier 6 (Mythic): "Divine Caretaker" - Ultimate area healing with invulnerability

This specialized approach ensures that higher-tier creatures have distinct, powerful identities that reward investment and progression.

## Subclass Determination Process

The process of determining a creature's subclass involves several steps:

### 1. Main Class Determination

The main class is determined by the dominant role (the role with the highest particle count):

| Dominant Role | Main Class |
|---------------|------------|
| CORE | Healer |
| CONTROL | Caster |
| MOVEMENT | Rogue |
| DEFENSE | Tank |
| ATTACK | Striker |

### 2. Tier Determination

The tier is determined by the particle count in the dominant role, using the ranges defined in the tier structure.

### 3. Subclass Assignment

#### For Tiers 1-2 (Hybrid Approach):

The subclass is determined by combining the main class with a prefix derived from the second-highest role:

| Second-Highest Role | Prefix |
|---------------------|--------|
| CORE | Vital |
| CONTROL | Arcane |
| MOVEMENT | Swift |
| DEFENSE | Guardian |
| ATTACK | Battle |

For example:
- CORE dominant, DEFENSE second = "Guardian Healer"
- ATTACK dominant, MOVEMENT second = "Swift Striker"

#### For Tiers 3-6 (Specialized Approach):

At Tier 3, the creature is assigned to one of two specialized paths based on the overall ranking of all five roles:

1. **Path Selection**: The complete ranking of all five roles is analyzed to determine which specialized path is most appropriate.
2. **Path Evolution**: Once a path is selected at Tier 3, the creature follows that path's evolution through higher tiers.

For example, a Healer with high DEFENSE might follow the "Field Medic" path, evolving from "Mender" at Tier 3 to "Divine Caretaker" at Tier 6.

## Trait Pooling Mechanics

The trait pooling mechanics differ between lower and higher tiers:

### Tiers 1-2: Pooled Trait Selection

#### Tier 1 (Common) Pooling:
- Draws from 4 trait pools:
  1. Primary pool based on dominant role (e.g., CORE Healing)
  2. Secondary pool based on second-highest role (e.g., DEFENSE Protection)
  3. Tertiary pool based on third-highest role
  4. Quaternary pool with basic traits available to all classes

- **Implementation**:
```typescript
function getTier1Traits(roleRanking: Role[]): Trait[] {
  const dominantRole = roleRanking[0];
  const secondRole = roleRanking[1];
  const thirdRole = roleRanking[2];
  
  const primaryTraits = getTraitsForRole(dominantRole, 'primary');
  const secondaryTraits = getTraitsForRole(secondRole, 'secondary');
  const tertiaryTraits = getTraitsForRole(thirdRole, 'tertiary');
  const basicTraits = getBasicTraits();
  
  return [...primaryTraits, ...secondaryTraits, ...tertiaryTraits, ...basicTraits];
}
```

#### Tier 2 (Uncommon) Pooling:
- Draws from 3 trait pools:
  1. Primary pool based on dominant role (enhanced versions)
  2. Secondary pool based on second-highest role
  3. Tertiary pool based on third-highest role

- **Implementation**:
```typescript
function getTier2Traits(roleRanking: Role[]): Trait[] {
  const dominantRole = roleRanking[0];
  const secondRole = roleRanking[1];
  const thirdRole = roleRanking[2];
  
  const primaryTraits = getTraitsForRole(dominantRole, 'primary', 'enhanced');
  const secondaryTraits = getTraitsForRole(secondRole, 'secondary');
  const tertiaryTraits = getTraitsForRole(thirdRole, 'tertiary');
  
  return [...primaryTraits, ...secondaryTraits, ...tertiaryTraits];
}
```

### Tiers 3-6: Specialized Trait Selection

For Tiers 3-6, traits are selected from specialized pools specific to the creature's subclass path:

```typescript
function getSpecializedTraits(mainClass: string, path: string, tier: number): Trait[] {
  return getTraitsForPath(mainClass, path, tier);
}
```

Each specialized path has its own trait pool for each tier, with higher tiers offering more powerful versions of path-specific traits.

## Subclass Naming Conventions

The naming conventions for subclasses differ between lower and higher tiers:

### Tiers 1-2: Hybrid Naming

Subclass names combine a prefix from the second-highest role with the main class:

- **Format**: `[Second-Role Prefix] [Main Class]`
- **Examples**:
  - "Guardian Healer" (CORE dominant, DEFENSE second)
  - "Swift Striker" (ATTACK dominant, MOVEMENT second)
  - "Arcane Tank" (DEFENSE dominant, CONTROL second)

### Tiers 3-6: Specialized Naming

Specialized paths have unique names that evolve with each tier:

- **Format**: `[Path-Specific Name]`
- **Examples**:
  - "Lifebinder" → "Vitalizer" → "Soulweaver" → "Eternal Guardian"
  - "Berserker" → "Gladiator" → "Warlord" → "Godslayer"

These naming conventions ensure that subclasses have distinctive, evocative names that reflect their capabilities and specialization.

## Subclass Paths by Main Class

Each main class has two specialized paths available at Tiers 3-6:

### Healer (CORE dominant)
- **Path 1: Restoration Specialist** - Focus on powerful single-target healing
- **Path 2: Field Medic** - Focus on area healing and group support

### Caster (CONTROL dominant)
- **Path 1: Archmage** - Focus on powerful offensive spells and control
- **Path 2: Enchanter** - Focus on buffs, debuffs, and utility

### Rogue (MOVEMENT dominant)
- **Path 1: Assassin** - Focus on stealth and precision strikes
- **Path 2: Acrobat** - Focus on evasion and mobility

### Tank (DEFENSE dominant)
- **Path 1: Sentinel** - Focus on personal durability and threat generation
- **Path 2: Guardian** - Focus on protecting allies and area control

### Striker (ATTACK dominant)
- **Path 1: Berserker** - Focus on raw damage and aggression
- **Path 2: Assassin** - Focus on precision and critical strikes

Each path has a distinct identity and playstyle, offering different approaches to the main class's core function.

## Integration with Other Systems

The Subclass Tier System integrates with several other systems in the Bitcoin Protozoa project:

### Particle Distribution

The particle distribution determines the dominant role, second-highest role, and overall role ranking, which are crucial inputs for subclass determination.

### Trait Assignment

The subclass and tier directly influence which traits (formations, behaviors, abilities) are available to a creature, with higher tiers offering more powerful and specialized traits.

### Evolution System

As creatures evolve through confirmation milestones, they may progress to higher tiers, potentially changing their subclass and gaining access to more powerful traits.

## Conclusion

The Subclass Tier System in Bitcoin Protozoa creates a rich progression path from versatile hybrid subclasses at lower tiers to highly specialized subclasses at higher tiers. By implementing different trait pooling mechanics for different tier ranges, the system ensures that creatures at all tiers have enjoyable, distinctive playstyles while maintaining clear progression and specialization paths. The integration with particle distribution, trait assignment, and evolution systems creates a cohesive, engaging experience that rewards both exploration at lower tiers and commitment to specialization at higher tiers.
