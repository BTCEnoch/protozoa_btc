# Group Domain Visualization

## Introduction

This document provides visual representations of the Group Domain in the Bitcoin Protozoa project, including particle distributions, class hierarchies, trait relationships, and integration with other domains. These visualizations serve as a reference for understanding the structure and behavior of the Group Domain, helping developers and designers grasp the complex relationships and patterns within the system.

## Particle Distribution Visualization

### Distribution Patterns

The following diagrams illustrate how particles are distributed across the five roles using the Dirichlet Distribution and Normalized Random Split methods:

```
                   CORE
                    /|\
                   / | \
                  /  |  \
                 /   |   \
           CONTROL   |   ATTACK
                 \   |   /
                  \  |  /
                   \ | /
                    \|/
           MOVEMENT     DEFENSE
```

### Sample Distributions

Below are examples of particle distributions across different rarity tiers:

#### Common (43-95 particles in dominant role)
```
CORE:     85 particles (dominant)
CONTROL:  75 particles
MOVEMENT: 95 particles
DEFENSE:  90 particles
ATTACK:   155 particles
TOTAL:    500 particles
```

#### Uncommon (96-110 particles in dominant role)
```
CORE:     105 particles (dominant)
CONTROL:  85 particles
MOVEMENT: 90 particles
DEFENSE:  100 particles
ATTACK:   120 particles
TOTAL:    500 particles
```

#### Rare (111-125 particles in dominant role)
```
CORE:     120 particles (dominant)
CONTROL:  95 particles
MOVEMENT: 85 particles
DEFENSE:  90 particles
ATTACK:   110 particles
TOTAL:    500 particles
```

#### Epic (126-141 particles in dominant role)
```
CORE:     135 particles (dominant)
CONTROL:  90 particles
MOVEMENT: 85 particles
DEFENSE:  95 particles
ATTACK:   95 particles
TOTAL:    500 particles
```

#### Legendary (142-151 particles in dominant role)
```
CORE:     145 particles (dominant)
CONTROL:  90 particles
MOVEMENT: 85 particles
DEFENSE:  90 particles
ATTACK:   90 particles
TOTAL:    500 particles
```

#### Mythic (152-220 particles in dominant role)
```
CORE:     180 particles (dominant)
CONTROL:  80 particles
MOVEMENT: 80 particles
DEFENSE:  80 particles
ATTACK:   80 particles
TOTAL:    500 particles
```

## Class Hierarchy Visualization

### Main Class Hierarchy

The following diagram shows the relationship between roles and main classes:

```
Role      │ Main Class
──────────┼───────────
CORE      │ Healer
CONTROL   │ Caster
MOVEMENT  │ Rogue
DEFENSE   │ Tank
ATTACK    │ Striker
```

### Subclass Hierarchy

The following diagram illustrates the subclass hierarchy for each main class:

```
Main Class │ Tier 1-2 (Hybrid)       │ Tier 3-6 (Specialized)
──────────┼────────────────────────┼─────────────────────────────────────────
Healer    │ Guardian Healer        │ Path 1: Lifebinder → Vitalizer → Soulweaver → Eternal Guardian
          │ Swift Healer           │ Path 2: Mender → Rejuvenator → Lifebloom → Divine Caretaker
          │ Battle Healer          │
          │ Arcane Healer          │
──────────┼────────────────────────┼─────────────────────────────────────────
Caster    │ Vital Caster           │ Path 1: Archmage → Spellbinder → Arcanist → Arcane Master
          │ Swift Caster           │ Path 2: Enchanter → Illusionist → Spellweaver → Mystic Sage
          │ Guardian Caster        │
          │ Battle Caster          │
──────────┼────────────────────────┼─────────────────────────────────────────
Rogue     │ Vital Rogue            │ Path 1: Assassin → Shadow Dancer → Nightblade → Phantom
          │ Arcane Rogue           │ Path 2: Acrobat → Trickster → Windwalker → Ethereal Dancer
          │ Guardian Rogue         │
          │ Battle Rogue           │
──────────┼────────────────────────┼─────────────────────────────────────────
Tank      │ Vital Tank             │ Path 1: Sentinel → Bulwark → Juggernaut → Living Fortress
          │ Arcane Tank            │ Path 2: Guardian → Protector → Warden → Divine Shield
          │ Swift Tank             │
          │ Battle Tank            │
──────────┼────────────────────────┼─────────────────────────────────────────
Striker   │ Vital Striker          │ Path 1: Berserker → Gladiator → Warlord → Godslayer
          │ Arcane Striker         │ Path 2: Assassin → Duelist → Blademaster → Death's Shadow
          │ Swift Striker          │
          │ Guardian Striker       │
```

## Trait Relationship Diagram

The following diagram illustrates the relationships between roles, classes, and traits:

```
                                ┌─────────────┐
                                │   Traits    │
                                └──────┬──────┘
                                       │
                 ┌─────────────┬───────┴───────┬─────────────┐
                 │             │               │             │
          ┌──────┴──────┐┌─────┴─────┐ ┌───────┴───────┐┌────┴─────┐
          │ Formations  ││ Behaviors │ │  Abilities    ││ Visuals  │
          └──────┬──────┘└─────┬─────┘ └───────┬───────┘└────┬─────┘
                 │             │               │             │
                 └─────────────┴───────┬───────┴─────────────┘
                                       │
                                ┌──────┴──────┐
                                │  Subclass   │
                                └──────┬──────┘
                                       │
                                ┌──────┴──────┐
                                │ Main Class  │
                                └──────┬──────┘
                                       │
                                ┌──────┴──────┐
                                │ Dominant    │
                                │    Role     │
                                └──────┬──────┘
                                       │
                                ┌──────┴──────┐
                                │  Particle   │
                                │ Distribution│
                                └─────────────┘
```

## Evolution Path Flowchart

The following flowchart illustrates the evolution path for a creature as it progresses through tiers:

```
                              ┌─────────────┐
                              │   Seed      │
                              └──────┬──────┘
                                     │
                              ┌──────┴──────┐
                              │  Particle   │
                              │ Distribution│
                              └──────┬──────┘
                                     │
                              ┌──────┴──────┐
                              │ Tier 1-2    │
                              │ (Hybrid)    │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │ Tier 3      │
                              │ Path        │
                              │ Selection   │
                              └──────┬──────┘
                                     │
                 ┌─────────────────┐ │ ┌─────────────────┐
                 │                 │ │ │                 │
                 ▼                 │ │ │                 ▼
          ┌──────────────┐         │ │ │         ┌──────────────┐
          │   Path 1     │         │ │ │         │   Path 2     │
          └───────┬──────┘         │ │ │         └──────┬───────┘
                  │                │ │ │                │
                  ▼                │ │ │                ▼
          ┌──────────────┐         │ │ │         ┌──────────────┐
          │   Tier 4     │         │ │ │         │   Tier 4     │
          └───────┬──────┘         │ │ │         └──────┬───────┘
                  │                │ │ │                │
                  ▼                │ │ │                ▼
          ┌──────────────┐         │ │ │         ┌──────────────┐
          │   Tier 5     │         │ │ │         │   Tier 5     │
          └───────┬──────┘         │ │ │         └──────┬───────┘
                  │                │ │ │                │
                  ▼                │ │ │                ▼
          ┌──────────────┐         │ │ │         ┌──────────────┐
          │   Tier 6     │         │ │ │         │   Tier 6     │
          └──────────────┘         │ │ │         └──────────────┘
```

## Integration Diagram

The following diagram illustrates how the Group Domain integrates with other domains:

```
                              ┌─────────────────┐
                              │  Bitcoin Domain │
                              │  (Block Data)   │
                              └────────┬────────┘
                                       │
                                       │ Seed (Nonce)
                                       │
                                       ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│    RNG Domain   │◄───────────┤   Group Domain  ├───────────►│  Traits Domain  │
│                 │    RNG      │                 │   Trait     │                 │
└─────────────────┘            └────────┬────────┘    Pools    └─────────────────┘
                                       │
                                       │ Groups, Classes
                                       │ Traits
                                       ▼
                              ┌─────────────────┐
                              │ Creature Domain │
                              └────────┬────────┘
                                       │
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Rendering Domain│
                              └─────────────────┘
```

## Attribute Tier Visualization

The following diagram illustrates how particle counts map to attribute values and tiers:

```
Attribute
Value
  ^
  |                                                  Tier 5 (401+) [Mutations Only]
400|------------------------------------------------
  |                                                  Tier 4 (301-400) [Mutations Only]
300|------------------------------------------------
  |                                   *             Tier 3 (201-300)
  |                           *
200|                   *
  |           *                                      Tier 2 (101-200)
100|       *
  |   *                                             Tier 1 (50-100)
 50|*
  |------------------------------------------------>
    43                                          220  Particles
```

The linear mapping function converts particle counts (43 to 220) to attribute values (50 to 300), with the formula:

```
AttributeValue = 50 + ((Particles - 43) / 177) × 250
```

Key points:
- Minimum attribute value: 50 (at 43 particles)
- Maximum base attribute value: 300 (at 220 particles)
- Tiers 4 and 5 require mutations

## Particle Spatial Arrangement

The following diagram illustrates the spatial arrangement of particles based on their roles:

```
                    CORE
                   (center)
                      │
                      │
          ┌───────────┴───────────┐
          │                       │
      CONTROL                   ATTACK
    (inner ring)              (outer ring)
          │                       │
          │                       │
          └───────────┬───────────┘
                      │
                      │
          ┌───────────┴───────────┐
          │                       │
      DEFENSE                  MOVEMENT
    (outer ring)              (outer ring)
```

## Conclusion

These visualizations provide a comprehensive overview of the Group Domain's structure and behavior, helping developers and designers understand the complex relationships and patterns within the system. By referencing these diagrams, team members can more easily grasp the domain's architecture, data flow, and integration points, facilitating more effective development and maintenance of the Bitcoin Protozoa project.
