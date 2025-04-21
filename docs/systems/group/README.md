# Group Domain Documentation

This directory contains documentation for the Group Domain in the Bitcoin Protozoa project. The Group Domain is responsible for managing particle groups, their roles, and their attributes.

## Documentation Files

- [Group Domain Overview](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_overview.md): Overview of the Group Domain and its responsibilities
- [Particle Distribution](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/particle_distribution.md): Detailed explanation of the Dirichlet Distribution and Normalized Random Split methods for particle distribution
- [Role System Specialization](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/role_system_specialization.md): Comprehensive documentation of the five roles (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) and their specializations
- [Subclass Tier System](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/subclass_tier_system.md): Explanation of the two-tier subclass structure with hybrid subclasses for Tiers 1-2 and specialized paths for Tiers 3-6
- [Group Domain API](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_api.md): Technical specification of the Group Domain's API, including service interfaces, methods, and data structures
- [Group Testing](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_testing.md): Testing strategies for the Group Domain, including unit tests, integration tests, and performance tests
- [Group Domain Migration Guide](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_migration_guide.md): Step-by-step guide for migrating from the previous implementation to the new Group Domain
- [Group Domain Visualization](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_visualization.md): Visual diagrams showing particle distributions, class hierarchies, trait relationships, and integration with other domains
- [Attribute Calculation](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/attribute_calculation.md): Detailed explanation of how particle counts map to attribute values, the tier system, and how mutations are required for higher tiers

## Key Concepts

### Roles

The Group Domain organizes particles into five functional groups with specific roles:

- **CORE**: Central stability and energy management (Health attribute)
- **CONTROL**: Direction, coordination, and utility (Precision attribute)
- **MOVEMENT**: Locomotion, agility, and evasion (Speed attribute)
- **DEFENSE**: Protection, durability, and damage mitigation (Armor attribute)
- **ATTACK**: Offense, damage dealing, and aggression (Damage attribute)

### Particle Distribution

Particles are distributed across the five roles using one of two methods:

1. **Dirichlet Distribution**: A mathematical distribution that creates natural, organic variations in particle allocation
2. **Normalized Random Split**: A simpler approach that randomly splits particles and then normalizes the distribution

### Attribute Calculation

Each group's particle count determines its attribute value using a linear mapping function:

```
AttributeValue = 50 + ((Particles - 43) / 177) × 250
```

This ensures that:
- Minimum attribute value: 50 (at 43 particles)
- Maximum base attribute value: 300 (at 220 particles)

### Tier System

Attributes are categorized into tiers:

- **Tier 1**: 50-100 (Base: 43-95 particles)
- **Tier 2**: 101-200 (Base: 96-150 particles)
- **Tier 3**: 201-300 (Base: 151-220 particles)
- **Tier 4**: 301-400 (Mutations only)
- **Tier 5**: 401+ (Mutations only)

Base attributes are capped at Tier 3, requiring mutations through the Evolution system to reach higher tiers.

### Class System

The Group Domain implements a two-tier class system:

1. **Main Class**: Determined by the dominant role (the role with the highest particle count)
2. **Subclass**: Further specialization based on secondary roles and particle distribution

The subclass system has two tiers:
- **Tiers 1-2**: Hybrid subclasses that combine aspects of multiple roles
- **Tiers 3-6**: Specialized paths that focus on specific abilities and traits

## Integration with Other Domains

The Group Domain integrates with several other domains:

- **Bitcoin Domain**: Provides the seed (nonce) for particle distribution
- **RNG Domain**: Provides random number generation for particle distribution
- **Traits Domain**: Assigns traits based on group roles and particle counts
- **Creature Domain**: Uses groups, classes, and traits to define creature characteristics
- **Evolution Domain**: Applies mutations to groups and their attributes

## Implementation

The Group Domain is implemented in the `src/domains/group` directory, with the following structure:

- `models/`: Data models for groups, roles, and classes
- `services/`: Services for group management, particle distribution, and attribute calculation
- `types/`: Type definitions for the Group Domain
- `utils/`: Utility functions for group operations

For detailed implementation information, see the [Group Domain API](https://github.com/BTCEnoch/protozoa_btc/blob/main/docs/systems/group/group_domain_api.md) documentation.
