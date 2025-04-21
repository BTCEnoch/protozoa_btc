# Particle Distribution in Bitcoin Protozoa

## Introduction to Particle Distribution

In the Bitcoin Protozoa project, each creature is composed of exactly 500 particles distributed across five distinct roles: `CORE`, `CONTROL`, `MOVEMENT`, `DEFENSE`, and `ATTACK`. This distribution is a foundational process that determines the creature's role, class, subclass, and overall capabilities. This document outlines the deterministic method used to allocate these particles, ensuring consistency, efficiency, and balance across all instances of the project, driven by Bitcoin blockchain data.

## Distribution Method

The particle distribution process has been updated to use an efficient, deterministic approach—either a **Dirichlet Distribution** or a **Normalized Random Split**—replacing the previous one-at-a-time method. This ensures computational efficiency while maintaining whole-number particle counts summing exactly to 500. The method operates as follows:

1. **Deterministic RNG Seeding**:
   - The Bitcoin block nonce, fetched from the `/r/blockinfo/${blockNumber}` endpoint, seeds the RNG system to ensure deterministic outcomes.

2. **Distribution Process**:
   - **Option 1: Dirichlet Distribution**:
     - A Dirichlet Distribution is applied with a uniform concentration parameter (e.g., α = 1 for all five roles), generating a probability vector for the five roles.
     - This vector is scaled to 500 and rounded to the nearest integer, with adjustments to ensure the total equals exactly 500 particles.
   - **Option 2: Normalized Random Split**:
     - 500 particles are split by generating four random split points (between 0 and 500) using the seeded RNG.
     - These points are sorted and used to divide the total into five segments, each assigned to one role.
   - Both methods guarantee that each role receives at least 1 particle, with no explicit upper limit beyond the total constraint of 500.

3. **Final Particle Counts**:
   - The resulting distribution assigns each role a whole-number particle count, ranging from 1 to a theoretical maximum of 499 (if one role dominates), summing to exactly 500.

### Example Distribution
Using a Dirichlet Distribution with a uniform α:
- RNG output (scaled and rounded): `CORE`: 120, `CONTROL`: 90, `MOVEMENT`: 80, `DEFENSE`: 110, `ATTACK`: 100
- Total: 120 + 90 + 80 + 110 + 100 = 500 particles

Using a Normalized Random Split:
- Split points: 100, 220, 300, 410
- Result: `CORE`: 100, `CONTROL`: 120, `MOVEMENT`: 80, `DEFENSE`: 110, `ATTACK`: 90
- Total: 100 + 120 + 80 + 110 + 90 = 500 particles

The specific method (Dirichlet or Normalized Random Split) is chosen based on implementation efficiency and desired distribution properties, but both are deterministic given the same nonce seed.

## Deterministic RNG Usage

The RNG system is seeded exclusively with the Bitcoin block nonce, ensuring that the same nonce produces identical particle distributions across all instances. The RNG drives either the Dirichlet parameters or the split points in the Normalized Random Split, maintaining consistency and reproducibility.

### Code Snippet
Below is a TypeScript implementation of the Normalized Random Split method:
```typescript
function distributeParticlesDeterministic(seed: number): number[] {
  const rng = createDeterministicRNG(seed);
  const splitPoints = Array(4).fill(0).map(() => Math.floor(rng() * 500));
  splitPoints.sort((a, b) => a - b);
  const bounds = [0, ...splitPoints, 500];
  const particleCounts = [];
  for (let i = 1; i < bounds.length; i++) {
    particleCounts.push(bounds[i] - bounds[i - 1]);
  }
  return particleCounts; // [CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK]
}
```
For the Dirichlet Distribution, a library like `jstat` could be used, adjusted to ensure integer outputs summing to 500.

## Impact on Classes and Subclasses

The particle counts influence the creature’s structure and capabilities:
- **Role Assignment**: The role with the highest particle count becomes the dominant role, determining the main class (e.g., `ATTACK` → Warrior).
- **Subclass Determination**: Subclasses are assigned based on particle distribution rankings and tier:
  - **Tiers 1-2 (Common and Uncommon)**:
    - Tier 1: Pools from 4 sets of traits and abilities, reflecting 4 basic subclasses.
    - Tier 2: Pools from 3 sets of traits and abilities, offering slightly more specialization.
  - **Tiers 3-6 (Rare to Mythic)**: Each main class has two specialized subclass paths, evolving with each higher tier.
- **Subclass Tier**: Determined by the dominant role’s particle count:
  - **Common (40%)**: ~50–100 particles
  - **Uncommon (30%)**: ~101–150 particles
  - **Rare (20%)**: ~151–200 particles
  - **Epic (8%)**: ~201–250 particles
  - **Legendary (1.5%)**: ~251–300 particles
  - **Mythic (0.5%)**: ~301–499 particles
  - These ranges are approximate, as the distribution method ensures variability while maintaining balance.

## Integration with Other Domains

The particle distribution process interacts with:
- **Bitcoin Domain**: Supplies the block nonce for RNG seeding.
- **RNG Domain**: Provides the seeded RNG function for distribution calculations.
- **Creature Domain**: Uses the particle counts to assign roles, classes, and subclasses to creatures.
- **Traits Domain**: Supplies trait pools (formations, behaviors, abilities) based on subclass tier, with no weighting by particle distribution.

By adopting an efficient distribution method like Dirichlet or Normalized Random Split, the Group domain ensures diverse, balanced, and deterministic creature configurations tied to Bitcoin blockchain data.




