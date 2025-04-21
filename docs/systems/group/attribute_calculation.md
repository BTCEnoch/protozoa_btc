# Attribute Calculation in Bitcoin Protozoa

## Introduction

This document details the attribute calculation system in the Bitcoin Protozoa project, explaining how particle counts in each of the five groups (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK) are mapped to creature attributes. The system is designed to ensure that base attributes derived solely from particle distribution cannot exceed Tier 3, requiring mutations for creatures to reach higher tiers.

## Attribute Mapping

Each of the five particle groups corresponds to a specific attribute that defines the creature's capabilities:

| Group    | Attribute  | Description                                |
|----------|------------|--------------------------------------------|
| CORE     | Health     | Vitality or hit points                     |
| CONTROL  | Precision  | Accuracy or control over actions           |
| MOVEMENT | Speed      | Agility or movement rate                   |
| DEFENSE  | Armor      | Resistance to damage                       |
| ATTACK   | Damage     | Offensive power                            |

## Tier System

Attributes are categorized into tiers that represent levels of potency. The tier system is defined as follows:

| Tier | Attribute Value Range | Description                           |
|------|------------------------|---------------------------------------|
| 1    | 50-100                | Basic functionality                    |
| 2    | 101-200               | Enhanced capabilities                  |
| 3    | 201-300               | Advanced capabilities                  |
| 4    | 301-400               | Superior capabilities (mutation only)  |
| 5    | 401+                  | Exceptional capabilities (mutation only)|

**Important**: Base attributes derived solely from particle counts are capped at Tier 3 (maximum value of 300). Tiers 4 and 5 can only be achieved through mutations and evolution.

## Attribute Calculation Formula

The attribute value for each group is calculated using a linear interpolation formula that maps particle counts (ranging from 43 to 220) to attribute values (ranging from 50 to 300):

```
AttributeValue = MinAttribute + ((Particles - MinParticles) / (MaxParticles - MinParticles)) × (MaxAttribute - MinAttribute)
```

Where:
- MinParticles = 43 (minimum particles per group)
- MaxParticles = 220 (maximum particles per group)
- MinAttribute = 50 (minimum attribute value at 43 particles)
- MaxAttribute = 300 (maximum attribute value at 220 particles)

Substituting these values:

```
AttributeValue = 50 + ((Particles - 43) / 177) × 250
```

## Example Calculations

### Minimum Attribute Value
When a group has the minimum of 43 particles:
```
AttributeValue = 50 + ((43 - 43) / 177) × 250 = 50
```
This results in a Tier 1 attribute.

### Maximum Attribute Value
When a group has the maximum of 220 particles:
```
AttributeValue = 50 + ((220 - 43) / 177) × 250 = 50 + (177 / 177) × 250 = 50 + 250 = 300
```
This results in a Tier 3 attribute, which is the maximum possible for base attributes.

### Sample Distribution
For a creature with the following particle distribution:
- CORE: 120 particles
- CONTROL: 90 particles
- MOVEMENT: 85 particles
- DEFENSE: 95 particles
- ATTACK: 110 particles

The calculated attribute values would be:
- Health: 50 + ((120 - 43) / 177) × 250 ≈ 158 (Tier 2)
- Precision: 50 + ((90 - 43) / 177) × 250 ≈ 116 (Tier 2)
- Speed: 50 + ((85 - 43) / 177) × 250 ≈ 109 (Tier 2)
- Armor: 50 + ((95 - 43) / 177) × 250 ≈ 123 (Tier 2)
- Damage: 50 + ((110 - 43) / 177) × 250 ≈ 144 (Tier 2)

## Implementation

The attribute calculation is implemented in the Group Domain as follows:

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
function calculateCreatureAttributes(particleGroups: ParticleGroups): Record<string, number> {
  return {
    Health: calculateAttributeValue(particleGroups[Role.CORE].particleCount),
    Precision: calculateAttributeValue(particleGroups[Role.CONTROL].particleCount),
    Speed: calculateAttributeValue(particleGroups[Role.MOVEMENT].particleCount),
    Armor: calculateAttributeValue(particleGroups[Role.DEFENSE].particleCount),
    Damage: calculateAttributeValue(particleGroups[Role.ATTACK].particleCount)
  };
}
```

## Mutations and Higher Tiers

To reach Tiers 4 and 5, creatures must acquire mutations through the Evolution system. Mutations can enhance attributes in two primary ways:

### Flat Bonuses
Mutations can add a fixed value to an attribute. For example:
- A mutation might add +100 to Health
- Base Health of 300 (Tier 3) + 100 = 400 (Tier 4)

### Multipliers
Mutations can apply a multiplier to an attribute. For example:
- A mutation might multiply Damage by 1.5
- Base Damage of 300 (Tier 3) × 1.5 = 450 (Tier 5)

## Integration with Group Domain

The attribute calculation system is integrated with the Group Domain in the following ways:

1. **Particle Distribution**: The `ParticleDistributionService` distributes particles across the five groups.
2. **Attribute Calculation**: The `GroupService` calculates attributes based on the particle distribution.
3. **Group Creation**: When groups are created, their attributes are calculated and stored.
4. **Evolution**: When groups evolve, their base attributes are recalculated, and mutations are applied.

## Conclusion

The attribute calculation system ensures that base attributes derived from particle distribution are balanced and capped at Tier 3, requiring mutations for creatures to reach higher tiers. This design creates a progression system where creatures start with balanced capabilities and can evolve to become more specialized and powerful through mutations and evolution.
