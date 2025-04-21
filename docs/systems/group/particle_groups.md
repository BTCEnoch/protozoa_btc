# Particle Groups

## Introduction to Particle Groups

In the Bitcoin Protozoa project, each creature is composed of exactly 500 particles, organized into five distinct groups: `CORE`, `CONTROL`, `MOVEMENT`, `DEFENSE`, and `ATTACK`. These particle groups define the creature's fundamental characteristics, influencing its role, class, subclass, and ultimately its behavior and capabilities within the simulation. The distribution of these particles is deterministically tied to Bitcoin blockchain data, ensuring uniqueness and consistency across all instances of the project.

## The Five Particle Groups

### CORE
- **Role**: The CORE group serves as the central, stabilizing force of the creature, anchoring its structure and identity.
- **Contribution**: A high particle count in CORE enhances the creature's durability and healing capabilities, making it more resilient and supportive in interactions.
- **Example**: A creature with a dominant CORE group might excel as a Healer, capable of sustaining itself and allies through restorative abilities.

### CONTROL
- **Role**: CONTROL particles direct the behavior of other roles, functioning as the creature's "brain."
- **Contribution**: High CONTROL particle counts improve the creature's ability to manipulate the environment and other creatures, often through crowd control effects or utility skills.
- **Example**: A creature with a strong CONTROL group might be classified as a Caster, adept at disrupting enemy actions or enhancing ally effectiveness.

### MOVEMENT
- **Role**: MOVEMENT particles enable the creature's locomotion, serving as its "fins" or "appendages."
- **Contribution**: A high number of MOVEMENT particles increases the creature's speed, agility, and evasion, making it more mobile and harder to hit.
- **Example**: Creatures with dominant MOVEMENT groups often fall into the Rogue class, excelling at quick strikes and evasive maneuvers.

### DEFENSE
- **Role**: DEFENSE particles protect the creature, forming a membrane-like boundary against external threats.
- **Contribution**: High DEFENSE particle counts bolster the creature's resilience, damage mitigation, and ability to shield allies.
- **Example**: A creature with a strong DEFENSE group is typically a Tank, capable of absorbing damage and protecting teammates.

### ATTACK
- **Role**: ATTACK particles enable the creature to engage aggressively with its environment and other creatures.
- **Contribution**: A high particle count in ATTACK enhances the creature's offensive capabilities, increasing damage output and combat effectiveness.
- **Example**: Creatures with dominant ATTACK groups are often Strikers, specializing in dealing high damage to enemies.

## Particle Distribution and Its Impact

Each creature's 500 particles are distributed across the five groups using a deterministic, single-step random allocation method. This method, seeded by the Bitcoin block nonce, ensures that the particle configuration is unique to each creature yet consistent across all instances of the project. The allocation respects minimum and maximum constraints for each group, with each group guaranteed at least 43 particles and capped at 220.

The particle counts in each group directly influence:

- **Role Assignment**: The group with the highest particle count determines the creature's primary role.
- **Class Determination**: The primary role maps to a main class (e.g., `CORE` → Healer).
- **Subclass Determination**: 
  - For **Tier 1 (Common)**, the subclass is a hybrid influenced by the top two particle groups, pooling 4 distinct sets of traits and abilities to create a versatile foundation.
  - For **Tier 2 (Uncommon)**, the subclass remains a hybrid of the top two groups but pools 3 sets of traits and abilities, offering a slightly more focused yet still broad capability set.
  - For **Tiers 3-6 (Rare to Mythic)**, the subclass follows a specialized path that evolves with the creature's progression, providing more focused and powerful capabilities.
- **Trait Potency**: Higher particle counts in a group can elevate the subclass tier, enhancing the potency of assigned traits and abilities.

For example, a creature with `CORE` as the dominant group and high `DEFENSE` might be classified as a "Guardian Healer" at tier 1, drawing from 4 sets of traits and abilities blending healing and defense, or at tier 2 with 3 sets, before evolving into a specialized healing path at higher tiers.

## Interaction with Other Domains

The Group domain collaborates closely with several other domains:

- **RNG Domain**: Provides the nonce-seeded RNG system for deterministic particle distribution and trait selection.
- **Bitcoin Domain**: Supplies the block nonce and confirmation data, critical for seeding the RNG and triggering evolution milestones.
- **Traits Domain**: Defines the pool of formations, behaviors, and abilities assigned based on group configurations and subclass tiers. For tier 1, 4 sets of traits and abilities are available per subclass, reducing to 3 sets at tier 2, with higher tiers offering specialized options. The particle groups also influence the selection of resting and attack formations, enhancing the creature's visual and functional dynamics.
- **Creature Domain**: Applies the group-derived roles, classes, and traits to individual creatures, integrating them into the broader simulation.

By managing these interactions, the Group domain ensures that each creature's characteristics are uniquely tied to Bitcoin blockchain data while maintaining consistency and balance across the project.

