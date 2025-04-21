
# Roles and Classes in Bitcoin Protozoa

## Introduction to Roles and Classes

In the Bitcoin Protozoa project, each creature is defined by its particle groups, which are assigned to one of five roles: `CORE`, `CONTROL`, `MOVEMENT`, `DEFENSE`, or `ATTACK`. These roles determine the creature's primary function and form the foundation for its class and subclass assignments. The class system categorizes creatures based on their particle distributions, influencing their traits, abilities, and overall gameplay characteristics.

## Particle Roles

Each particle group corresponds to a specific role that defines the creature's core functionality:

### CORE
- **Purpose**: Acts as the central, stabilizing force of the creature, anchoring its structure and identity.
- **Gameplay Impact**: Enhances durability and healing capabilities, making the creature more resilient and supportive.

### CONTROL
- **Purpose**: Directs the behavior of other roles, functioning as the creature's "brain."
- **Gameplay Impact**: Improves the creature's ability to manipulate the environment and other creatures, often through crowd control or utility skills.

### MOVEMENT
- **Purpose**: Enables the creature's locomotion, serving as its "fins" or "appendages."
- **Gameplay Impact**: Increases speed, agility, and evasion, making the creature more mobile and harder to hit.

### DEFENSE
- **Purpose**: Protects the creature, forming a membrane-like boundary against external threats.
- **Gameplay Impact**: Bolsters resilience, damage mitigation, and the ability to shield allies.

### ATTACK
- **Purpose**: Engages with the environment aggressively, patrolling and interacting offensively.
- **Gameplay Impact**: Enhances offensive capabilities, increasing damage output and combat effectiveness.

## Main Classes

The main class of a creature is determined by its dominant particle group, which is the group with the highest particle count. Each role maps directly to a specific main class:

| Dominant Group | Main Class | Primary Focus         |
|----------------|------------|-----------------------|
| CORE           | Healer     | Restoration and support |
| CONTROL        | Caster     | Utility and crowd control |
| MOVEMENT       | Rogue      | Speed and evasion     |
| DEFENSE        | Tank       | Protection and durability |
| ATTACK         | Striker    | Damage and offense    |

For example, a creature with the highest particle count in the `CORE` group will be classified as a Healer, focusing on healing and support abilities.

## Subclass System

Subclasses provide further specialization based on the ranking of the remaining four particle groups. The subclass is influenced by the order of the particle groups from highest to lowest count, with the second-highest group playing a key role in defining the subclass, especially for lower tiers.

### Subclass Determination
1. **Main Class**: Set by the dominant particle group.
2. **Subclass**:
   - For **Tier 1 (Common)** and **Tier 2 (Uncommon)**, the subclass is a hybrid influenced by the top two particle groups. Tier 1 pools 4 sets of traits and abilities, while Tier 2 pools 3 sets, providing a versatile foundation with varying degrees of focus.
   - For **Tiers 3-6 (Rare to Mythic)**, the subclass follows a specialized path that evolves with the creature's progression, offering more focused and powerful capabilities.
3. **Tier**: The subclass tier is determined by the particle count in the dominant group, with higher counts corresponding to rarer and more powerful tiers (Common to Mythic).

### Example Subclass Naming
For a creature with `CORE` as the dominant group and `DEFENSE` as the second-highest:
- **Main Class**: Healer (from `CORE`)
- **Subclass**: Guardian Healer (hybrid of `CORE` and `DEFENSE`)
- **Tier 1 Example**: At Tier 1, the Guardian Healer draws from 4 sets of traits and abilities, blending healing and defensive capabilities.
- **Tier 2 Example**: At Tier 2, it draws from 3 sets, offering a slightly more focused yet still broad capability set.

For higher tiers (3-6), the subclass would follow a specialized path, such as evolving into a "Fortress Healer" with enhanced defensive healing abilities.

## Influence on Traits and Abilities

The role and class assignments directly influence the traits (formations, behaviors, and abilities) that a creature receives:
- **Formations**: Determined by the dominant group and subclass, affecting the spatial arrangement of particles (e.g., Shield Line for Tanks).
- **Behaviors**: Assigned based on the role and subclass tier, defining how the creature interacts with its environment (e.g., Regenerative Pulse for Healers).
- **Abilities**: Granted according to the main class and modified by the subclass, providing special actions (e.g., Heal for Healers, enhanced by secondary groups).

For **Tiers 1 and 2**, traits and abilities are selected from pooled sets corresponding to the hybrid subclass, offering a range of capabilities. For **Tiers 3-6**, traits and abilities are specific to the specialized subclass path, with potency scaled by the tier, providing more powerful versions or additional effects.

## Deterministic Assignment

All role, class, and trait assignments are deterministic, based on the particle distribution calculated using the RNG system seeded by the Bitcoin block nonce. This ensures that creature characteristics are consistent across all instances of the project while being uniquely tied to specific blockchain data.

## Integration with Other Domains

The roles and classes defined in this domain are used by:
- **Traits Domain**: To select and assign appropriate formations, behaviors, and abilities from the pooled sets (for tiers 1 and 2) or specialized paths (for tiers 3-6).
- **Creature Domain**: To apply the determined role, class, and traits to individual creatures.
- **RNG Domain**: To provide the seeded RNG for deterministic calculations.

By clearly defining roles and classes, the Group domain ensures that each creature's capabilities are balanced and aligned with its particle group configuration, contributing to a rich and varied simulation experience.


