# Role System Specialization in Bitcoin Protozoa

## Introduction

The Role System in Bitcoin Protozoa defines the fundamental building blocks of creature functionality through five distinct roles: `CORE`, `CONTROL`, `MOVEMENT`, `DEFENSE`, and `ATTACK`. Each role represents a specialized function within the creature, contributing unique attributes and capabilities to its overall behavior. This document details the role system, including role definitions, specializations, interactions, and how they influence class determination and trait assignment.

## The Five Roles

Each of the five roles serves a specific purpose in the creature's functionality and behavior:

### CORE

**Primary Function**: Central stability and energy management

**Attributes**:
- **Health**: Determines maximum hit points (scales from 50 to 300 based on particle count)
- **Regeneration**: Affects health and energy recovery rates
- **Stability**: Influences resistance to displacement and control effects
- **Cohesion**: Affects how tightly particles bind together

**Attribute Calculation**:
Health = 50 + ((CORE particles - 43) / 177) × 250

**Gameplay Impact**:
- High CORE counts create resilient creatures with strong healing capabilities
- Acts as the anchor point for other particle groups
- Provides sustain in prolonged encounters
- Enables support abilities that benefit allies

**Visual Representation**:
- Typically forms the central mass of the creature
- Often emits a steady, pulsing glow
- Particles tend to be more densely packed

### CONTROL

**Primary Function**: Direction, coordination, and utility

**Attributes**:
- **Precision**: Influences accuracy and critical effect chance (scales from 50 to 300 based on particle count)
- **Intelligence**: Affects ability potency and cooldown reduction
- **Influence**: Determines crowd control duration and effectiveness
- **Adaptability**: Affects ability to change tactics and respond to threats

**Attribute Calculation**:
Precision = 50 + ((CONTROL particles - 43) / 177) × 250

**Gameplay Impact**:
- High CONTROL counts create creatures with strong utility and crowd control
- Enables manipulation of the environment and other creatures
- Provides tactical advantages through debuffs and buffs
- Allows for complex ability combinations

**Visual Representation**:
- Often forms antenna-like or neural network patterns
- Particles may emit fluctuating colors or patterns
- Typically positioned near the CORE but extending outward

### MOVEMENT

**Primary Function**: Locomotion, agility, and evasion

**Attributes**:
- **Speed**: Determines movement velocity and action frequency (scales from 50 to 300 based on particle count)
- **Agility**: Affects turning rate and maneuverability
- **Evasion**: Influences dodge chance and ability to avoid threats
- **Momentum**: Determines acceleration and deceleration rates

**Attribute Calculation**:
Speed = 50 + ((MOVEMENT particles - 43) / 177) × 250

**Gameplay Impact**:
- High MOVEMENT counts create fast, elusive creatures
- Enables quick repositioning and escape tactics
- Provides advantages in pursuit or retreat scenarios
- Allows for hit-and-run strategies

**Visual Representation**:
- Often forms fin-like or appendage structures
- Particles typically show directional alignment
- May display trailing effects during motion
- Usually positioned at the periphery of the creature

### DEFENSE

**Primary Function**: Protection, durability, and damage mitigation

**Attributes**:
- **Armor**: Reduces incoming damage (scales from 50 to 300 based on particle count)
- **Resilience**: Affects resistance to status effects
- **Deflection**: Influences chance to block or deflect attacks
- **Absorption**: Determines ability to absorb and neutralize threats

**Attribute Calculation**:
Armor = 50 + ((DEFENSE particles - 43) / 177) × 250

**Gameplay Impact**:
- High DEFENSE counts create durable, protective creatures
- Enables tanking and damage soaking
- Provides shielding capabilities for self and allies
- Allows for sustained presence in hostile environments

**Visual Representation**:
- Often forms shell-like or barrier structures
- Particles may appear more solid or crystalline
- Typically forms outer layers or protective formations
- May display reactive patterns when under attack

### ATTACK

**Primary Function**: Offense, damage dealing, and aggression

**Attributes**:
- **Damage**: Determines base damage output (scales from 50 to 300 based on particle count)
- **Penetration**: Affects ability to bypass defenses
- **Ferocity**: Influences critical hit chance and damage
- **Persistence**: Determines sustained damage capability

**Attribute Calculation**:
Damage = 50 + ((ATTACK particles - 43) / 177) × 250

**Gameplay Impact**:
- High ATTACK counts create powerful offensive creatures
- Enables high burst damage or sustained DPS
- Provides advantages in combat scenarios
- Allows for aggressive playstyles

**Visual Representation**:
- Often forms spike-like or blade structures
- Particles may glow more intensely or display aggressive colors
- Typically positioned for optimal striking capability
- May show anticipatory movements before attacks

## Role Hierarchy and Interactions

The five roles interact in a complex hierarchy that influences creature behavior and capabilities:

### Core-Centric Hierarchy

The CORE role serves as the central anchor point for the creature, with other roles arranged in a hierarchical relationship:

1. **CORE**: Central foundation, providing stability and sustenance
2. **CONTROL**: Directs and coordinates other roles
3. **DEFENSE/ATTACK**: Specialized external functions (protection and offense)
4. **MOVEMENT**: Enables repositioning of all other roles

This hierarchy is reflected in the spatial arrangement of particles, with CORE typically at the center and other roles radiating outward based on their function.

### Role Synergies

Certain role combinations create powerful synergies that enhance creature capabilities:

| Role Combination | Synergy Effect |
|------------------|----------------|
| CORE + DEFENSE | Enhanced durability and self-healing |
| CORE + CONTROL | Improved support abilities and utility |
| ATTACK + MOVEMENT | Increased strike speed and mobility |
| DEFENSE + CONTROL | Better crowd control and protection |
| ATTACK + CONTROL | Precision strikes and tactical offense |

These synergies influence subclass determination and trait effectiveness, with creatures naturally excelling at activities that leverage their strongest role combinations.

### Role Counters

Roles also have natural counter relationships that create strategic depth:

- ATTACK counters CORE (offensive pressure disrupts healing)
- DEFENSE counters ATTACK (protection mitigates damage)
- MOVEMENT counters CONTROL (agility evades crowd control)
- CONTROL counters MOVEMENT (crowd control limits mobility)
- CORE counters DEFENSE (sustained pressure overcomes protection)

These counter relationships create a balanced ecosystem where no single role dominates in all scenarios.

## Role Specialization and Class Determination

The distribution of particles across roles directly determines a creature's specialization and class:

### Dominant Role

The role with the highest particle count becomes the creature's dominant role, determining its main class:

| Dominant Role | Main Class | Primary Function |
|---------------|------------|------------------|
| CORE | Healer | Restoration and support |
| CONTROL | Caster | Utility and crowd control |
| MOVEMENT | Rogue | Speed and evasion |
| DEFENSE | Tank | Protection and durability |
| ATTACK | Striker | Damage and offense |

In case of a tie for highest particle count, a predefined priority order is used: CORE > DEFENSE > ATTACK > CONTROL > MOVEMENT.

### Role Ranking and Subclass

The complete ranking of all five roles (from highest to lowest particle count) influences subclass determination:

1. **Main Class**: Determined by the dominant role
2. **Subclass Modifier**: Influenced by the second-highest role
3. **Specialization Path**: For higher tiers, determined by the overall role ranking pattern

For example, a creature with ATTACK as the dominant role and MOVEMENT as the second-highest would be classified as a "Swift Striker" at lower tiers, potentially evolving into a specialized "Assassin" path at higher tiers.

## Role-Specific Traits

Each role has access to specific traits that align with its function:

### Formations

Role-specific formations determine the spatial arrangement of particles:

| Role | Formation Examples |
|------|-------------------|
| CORE | Nexus Core, Energy Sphere, Vital Matrix |
| CONTROL | Neural Network, Command Array, Thought Web |
| MOVEMENT | Streamlined Fins, Velocity Wings, Kinetic Flow |
| DEFENSE | Shield Wall, Barrier Dome, Protective Shell |
| ATTACK | Blade Array, Strike Formation, Piercing Spikes |

### Behaviors

Role-specific behaviors define how particles interact with the environment:

| Role | Behavior Examples |
|------|-------------------|
| CORE | Regenerative Pulse, Energy Cycling, Stabilization |
| CONTROL | Tactical Analysis, Signal Disruption, Coordination |
| MOVEMENT | Evasive Maneuvers, Rapid Repositioning, Momentum Building |
| DEFENSE | Reactive Hardening, Damage Absorption, Deflection |
| ATTACK | Aggressive Pursuit, Target Locking, Penetrating Strike |

### Abilities

Role-specific abilities provide special actions the creature can perform:

| Role | Ability Examples |
|------|------------------|
| CORE | Heal, Energize, Stabilize |
| CONTROL | Disable, Confuse, Coordinate |
| MOVEMENT | Dash, Evade, Accelerate |
| DEFENSE | Shield, Absorb, Deflect |
| ATTACK | Strike, Pierce, Overwhelm |

## Attribute Tier System

Attributes derived from particle counts are categorized into tiers that represent levels of potency. The tier system ensures that base attributes (without mutations) cannot exceed Tier 3, requiring evolution for higher tiers:

| Tier | Attribute Value Range | Description                           | Source                  |
|------|------------------------|---------------------------------------|-------------------------|
| 1    | 50-100                | Basic functionality                    | Base (43-95 particles)  |
| 2    | 101-200               | Enhanced capabilities                  | Base (96-150 particles) |
| 3    | 201-300               | Advanced capabilities                  | Base (151-220 particles)|
| 4    | 301-400               | Superior capabilities                  | Mutations only          |
| 5    | 401+                  | Exceptional capabilities               | Mutations only          |

This tiered approach ensures that:
1. All creatures start with functional baseline attributes (minimum 50)
2. Base attributes are capped at Tier 3 (maximum 300)
3. Higher tiers (4 and 5) require mutations through the Evolution system

For detailed information on attribute calculation, see `attribute_calculation.md`.

## Role Balance and Distribution

The role system is designed to ensure balance while allowing for specialization:

1. **Minimum Threshold**: Each role has a minimum of 43 particles, ensuring it has some influence on the creature's behavior.
2. **Maximum Cap**: No role can exceed 220 particles, preventing extreme specialization.
3. **Total Constraint**: The sum of particles across all roles is exactly 500.

This creates a system where:
- Every creature has all five roles represented
- Specialization is possible but not extreme
- Multiple viable configurations exist
- Each role contributes meaningfully to the creature's capabilities

## Integration with Other Systems

The role system integrates with several other systems in the Bitcoin Protozoa project:

### Particle Distribution

The distribution of particles across roles is determined by the Dirichlet Distribution or Normalized Random Split methods, as detailed in `particle_distribution.md`.

### Class System

The role system forms the foundation of the class system, with dominant roles mapping to main classes and role rankings influencing subclass determination, as detailed in `class_assignment.md`.

### Trait Assignment

Role specializations directly influence which traits (formations, behaviors, abilities) are available to a creature, as detailed in `trait_assignment.md`.

### Evolution System

As creatures evolve through confirmation milestones, their role distributions may shift, potentially changing their specialization and class, as detailed in the Evolution Domain documentation.

## Conclusion

The Role System in Bitcoin Protozoa provides a rich foundation for creature specialization and behavior. By distributing particles across five distinct roles, each with unique attributes and capabilities, the system creates diverse, balanced creatures with clear specializations and strategic depth. The role system's integration with class determination and trait assignment ensures that each creature's particle distribution meaningfully influences its gameplay characteristics and visual representation.
