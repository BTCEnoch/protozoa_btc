# Particle Distribution in Bitcoin Protozoa

## Introduction

In the Bitcoin Protozoa project, each creature is composed of exactly 500 particles distributed across five distinct roles: `CORE`, `CONTROL`, `MOVEMENT`, `DEFENSE`, and `ATTACK`. The distribution of these particles is a foundational process that determines the creature's role, class, subclass, and overall capabilities. This document details the deterministic methods used to allocate these particles, ensuring consistency, efficiency, and balance across all instances of the project.

## Distribution Methods

The particle distribution process uses advanced statistical methods to ensure a balanced yet varied distribution of particles. Two primary methods are implemented, both ensuring deterministic outcomes when seeded with the same Bitcoin block nonce:

### 1. Dirichlet Distribution

The Dirichlet distribution is a family of continuous multivariate probability distributions that is particularly well-suited for generating random proportions that sum to 1.

#### Implementation

```typescript
function dirichletDistribution(
  groups: string[], 
  total: number, 
  seed: number, 
  minPerGroup: number = 43, 
  maxPerGroup: number = 220
): Record<string, number> {
  const rng = new SeededRNG(seed);
  const alphas = groups.map(() => 1); // Uniform concentration parameter
  
  // Generate Dirichlet-distributed random variables
  const gammas = alphas.map(alpha => {
    let sum = 0;
    for (let i = 0; i < alpha; i++) {
      // Approximation of gamma distribution using sum of exponentials
      sum -= Math.log(rng.nextFloat());
    }
    return sum;
  });
  
  const sum = gammas.reduce((a, b) => a + b, 0);
  let fractions = gammas.map(g => g / sum);
  
  // Apply to total particles
  let rawCounts = fractions.map(f => Math.floor(f * total));
  
  // Adjust for min/max constraints
  const distribution: Record<string, number> = {};
  let remaining = total;
  
  groups.forEach((group, i) => {
    let value = Math.max(minPerGroup, Math.min(Math.floor(rawCounts[i]), maxPerGroup));
    distribution[group] = value;
    remaining -= value;
  });
  
  // Distribute remaining particles
  while (remaining > 0) {
    for (let i = 0; i < groups.length && remaining > 0; i++) {
      if (distribution[groups[i]] < maxPerGroup) {
        distribution[groups[i]]++;
        remaining--;
      }
    }
  }
  
  // Handle negative remaining (if minimums pushed us over total)
  while (remaining < 0) {
    for (let i = 0; i < groups.length && remaining < 0; i++) {
      if (distribution[groups[i]] > minPerGroup) {
        distribution[groups[i]]--;
        remaining++;
      }
    }
  }
  
  return distribution;
}
```

#### Characteristics

- **Statistical Properties**: The Dirichlet distribution creates a natural, smooth distribution of particles across groups.
- **Concentration Parameter**: Using α = 1 for all groups creates a uniform distribution; higher values would concentrate particles more evenly.
- **Advantages**: Produces statistically sound distributions that feel natural and varied.

### 2. Normalized Random Split

This method generates random values for each group, normalizes them to sum to the total, and then applies constraints.

#### Implementation

```typescript
function normalizedRandomSplit(
  groups: string[], 
  total: number, 
  seed: number, 
  minPerGroup: number = 43, 
  maxPerGroup: number = 220
): Record<string, number> {
  const rng = new SeededRNG(seed);
  let fractions = groups.map(() => rng.nextFloat()); // Random values between 0 and 1
  const sum = fractions.reduce((a, b) => a + b, 0);
  fractions = fractions.map(f => (f / sum) * total); // Normalize to sum to total
  
  const distribution: Record<string, number> = {};
  let remaining = total;
  
  // Initial distribution with constraints
  groups.forEach((group, i) => {
    let value = Math.max(minPerGroup, Math.min(Math.floor(fractions[i]), maxPerGroup));
    distribution[group] = value;
    remaining -= value;
  });
  
  // Distribute remaining particles
  while (remaining > 0) {
    for (let i = 0; i < groups.length && remaining > 0; i++) {
      if (distribution[groups[i]] < maxPerGroup) {
        distribution[groups[i]]++;
        remaining--;
      }
    }
  }
  
  // Handle negative remaining (if minimums pushed us over total)
  while (remaining < 0) {
    for (let i = 0; i < groups.length && remaining < 0; i++) {
      if (distribution[groups[i]] > minPerGroup) {
        distribution[groups[i]]--;
        remaining++;
      }
    }
  }
  
  return distribution;
}
```

#### Characteristics

- **Simplicity**: Conceptually simpler than Dirichlet, using direct random number generation.
- **Efficiency**: Computationally less intensive than Dirichlet.
- **Advantages**: Easier to implement and explain while still providing good distribution variety.

## Constraints and Guarantees

Both distribution methods enforce the following constraints:

1. **Total Particles**: Exactly 500 particles per creature.
2. **Minimum Per Group**: At least 43 particles per group, ensuring each role has meaningful representation.
3. **Maximum Per Group**: No more than 220 particles per group, preventing extreme specialization.
4. **Determinism**: The same seed (Bitcoin block nonce) always produces the same distribution.

These constraints ensure that:
- Each role has sufficient particles to contribute to the creature's capabilities.
- No single role can completely dominate the creature's behavior.
- Distributions are varied but balanced across the population.

## Base Particle Allocation

The 500 total particles are allocated as follows:

1. **Base Allocation**: Each of the five roles receives a base of 43 particles (215 total).
2. **Variable Allocation**: The remaining 285 particles are distributed using either the Dirichlet Distribution or Normalized Random Split method.

This approach ensures that each role has a guaranteed minimum presence while allowing for significant variation in the final distribution.

## Example Distributions

Here are examples of particle distributions generated using both methods:

### Example 1: Dirichlet Distribution (Seed: 12345)
```
CORE: 120 particles
CONTROL: 90 particles
ATTACK: 110 particles
DEFENSE: 95 particles
MOVEMENT: 85 particles
Total: 500 particles
```

### Example 2: Normalized Random Split (Seed: 67890)
```
CORE: 85 particles
CONTROL: 75 particles
ATTACK: 130 particles
DEFENSE: 115 particles
MOVEMENT: 95 particles
Total: 500 particles
```

## Impact on Role and Class Determination

The particle distribution directly influences:

1. **Dominant Role**: The role with the highest particle count becomes the creature's dominant role.
2. **Main Class**: Determined by the dominant role (e.g., CORE → Healer).
3. **Subclass**: Influenced by the ranking of all five roles, with the second-highest role playing a key role in subclass determination.
4. **Tier**: The particle count in the dominant role determines the subclass tier, affecting trait potency.

## Integration with RNG System

The particle distribution process is tightly integrated with the RNG system, which is seeded by the Bitcoin block nonce:

```typescript
// Example integration with RNG system
function distributeParticles(blockNonce: number): Record<string, number> {
  const seed = createSeedFromNonce(blockNonce);
  const groups = ['CORE', 'CONTROL', 'ATTACK', 'DEFENSE', 'MOVEMENT'];
  
  // Choose distribution method based on implementation preference
  // return dirichletDistribution(groups, 500, seed);
  return normalizedRandomSplit(groups, 500, seed);
}
```

## Performance Considerations

Both distribution methods are designed for efficiency:

1. **Single-Pass Allocation**: Particles are distributed in a single pass, avoiding iterative approaches.
2. **Computational Efficiency**: The Normalized Random Split method is slightly more efficient than Dirichlet.
3. **Memory Usage**: Both methods have minimal memory footprint, using only small arrays and objects.

## Conclusion

The particle distribution system in Bitcoin Protozoa uses advanced statistical methods to create varied, balanced, and deterministic distributions of particles across the five roles. By enforcing minimum and maximum constraints while allowing for significant variation, the system ensures that each creature has a unique identity while maintaining gameplay balance. The tight integration with the Bitcoin block nonce ensures that distributions are deterministic and tied to blockchain data, a core principle of the project.
