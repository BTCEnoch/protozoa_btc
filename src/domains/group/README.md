# Group Domain

The Group Domain is responsible for managing particle groups, class assignments, and trait assignments for creatures in the Bitcoin Protozoa project.

## Overview

The Group Domain provides the following functionality:

- Distributing particles across the five roles (Core, Control, Attack, Defense, Movement) using the Normalized Random Split method
- Determining the rarity of each particle group based on its particle count
- Calculating a single primary attribute for each particle group based on its particle count
- Assigning class types to each group based on its role (Healer, Caster, Striker, Tank, Rogue)
- Assigning traits to particle groups based on their role and tier

## Services

The Group Domain provides the following services:

- **GroupService**: The main entry point for the Group Domain
- **ParticleDistributionService**: Distributes particles across the five roles
- **ClassAssignmentService**: Assigns classes to creatures
- **TraitAssignmentService**: Assigns traits to particle groups

## Models

The Group Domain defines the following models:

- **ParticleGroups**: Defines the distribution of particles across the five roles
- **GroupAttributes**: Defines the single primary attribute for a particle group
- **RoleAttributeNames**: Maps roles to their attribute names (Wisdom, Intelligence, Strength, Vitality, Agility)
- **RoleToClass**: Maps roles to their class types (Healer, Caster, Striker, Tank, Rogue)
- **GroupTraits**: Defines the traits that a particle group has

## Usage

To use the Group Domain, you need to create a GroupService instance:

```typescript
import { createGroupService } from './domains/group';
import { RNGService } from './domains/rng';
import { TraitRepository } from './domains/traits';

// Create dependencies
const rngService = new RNGService();
const traitRepository = new TraitRepository();

// Create the Group Service
const groupService = createGroupService(rngService, traitRepository);

// Use the Group Service
const totalParticles = 500; // Total particles per creature
const seed = 'my-seed';

// Create particle groups
// This will distribute particles using the Normalized Random Split method
// Each group gets a base of 40 particles, and the remaining 300 are distributed
// The minimum particles per group is 60, and the maximum is 200
// Particle rarity is determined based on the particle count:
// - Common (40%): 60-116 particles
// - Uncommon (30%): 117-158 particles
// - Rare (20%): 159-186 particles
// - Epic (8%): 187-197 particles
// - Legendary (2%): 198-199 particles
// - Mythic (1%): 200 particles
// Each group has a specific role, class type, and primary attribute:
// - Group 0: Core/Healer (WISDOM)
// - Group 1: Control/Caster (INTELLIGENCE)
// - Group 2: Attack/Striker (STRENGTH)
// - Group 3: Defense/Tank (VITALITY)
// - Group 4: Movement/Rogue (AGILITY)
// Note: The maximum base attribute (200) is just below the Tier 3 threshold (201),
// requiring mutations to reach higher tiers
const particleGroups = groupService.createParticleGroups(totalParticles, seed);

// Assign class
const classAssignment = groupService.assignClass(particleGroups, seed);

// Assign traits to each group
for (const role of Object.values(Role)) {
  const traits = groupService.assignTraits(role, classAssignment.tier, `${seed}-${role}`);
  particleGroups[role].traits = traits;
}
```

## Dependencies

The Group Domain depends on the following domains:

- **RNG Domain**: Provides random number generation
- **Traits Domain**: Provides trait definitions

## Testing

The Group Domain includes the following tests:

- **Unit Tests**: Tests for each service
- **Integration Tests**: Tests for the Group Domain as a whole
- **Property-Based Tests**: Tests for the distribution methods

## Documentation

For more information, see the following documentation:

- [Group Domain Overview](../../docs/systems/group/group_domain_overview.md)
- [Group Domain API](../../docs/systems/group/group_domain_api.md)
- [Attribute Calculation](../../docs/systems/group/attribute_calculation.md)
- [Particle Distribution](../../docs/systems/group/particle_distribution.md)
- [Role System Specialization](../../docs/systems/group/role_system_specialization.md)
- [Class Assignment](../../docs/systems/group/class_assignment.md)
- [Subclass Tier System](../../docs/systems/group/subclass_tier_system.md)
