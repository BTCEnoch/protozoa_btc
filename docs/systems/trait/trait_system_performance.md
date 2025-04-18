
# Trait System Performance

## Purpose
This document addresses performance optimization for the trait system in Bitcoin Protozoa. It identifies common performance bottlenecks, outlines optimization techniques such as caching and indexing, and provides metrics and profiling results for reference. By following these guidelines, developers can ensure the trait system remains efficient and scalable as the project grows.

## Location
`docs/traits/trait_performance.md`

## Common Performance Bottlenecks
The trait system, due to its complexity and the potential for large numbers of particles and traits, can encounter several performance bottlenecks:

1. **Trait Lookups in Large Populations**
   - **Issue**: Frequent lookups for trait details or pools in large datasets (e.g., thousands of particles) can lead to high CPU usage.
   - **Impact**: Slows down creature generation and trait assignment processes.

2. **RNG Computations**
   - **Issue**: Generating random numbers for trait assignment, especially with a seeded RNG, can be computationally intensive if not optimized.
   - **Impact**: Increases the time required for trait assignment, particularly for large creatures.

3. **Trait Application Overhead**
   - **Issue**: Applying trait effects to particles, especially if done in a loop for each particle, can be inefficient.
   - **Impact**: Reduces frame rates or slows down gameplay mechanics like battles.

## Optimization Techniques
To mitigate these bottlenecks, the following optimization techniques are recommended:

### 1. Caching Trait Pools
- **Technique**: Cache trait pools by role and rarity to avoid repeatedly querying or filtering large datasets.
- **Implementation**: Use a caching mechanism (e.g., a Map or object) to store pre-filtered trait pools.
- **Example**:
  ```typescript
  // src/domains/traits/services/traitService.ts
  class TraitService {
    private traitPoolCache: { [key: string]: ITrait[] } = {};

    getTraitPool(role: Role, rarity: Rarity): ITrait[] {
      const cacheKey = `${role}_${rarity}`;
      if (!this.traitPoolCache[cacheKey]) {
        this.traitPoolCache[cacheKey] = this.filterTraits(role, rarity);
      }
      return this.traitPoolCache[cacheKey];
    }
  }
  ```

### 2. Batch Processing for Trait Assignment
- **Technique**: Assign traits to multiple particles in batches to reduce the overhead of repeated RNG calls or lookups.
- **Implementation**: Generate a batch of random numbers or traits at once and assign them to particles in a single operation.
- **Example**:
  ```typescript
  // src/domains/creature/services/creatureGenerator.ts
  class CreatureGenerator {
    assignTraitsToParticles(particles: IParticle[], blockData: IBlockData) {
      const rng = createRNGFromBlock(blockData.nonce).getStream('traits');
      const traits = particles.map(p => traitService.assignTrait(p, rng));
      particles.forEach((p, i) => p.trait = traits[i]);
    }
  }
  ```

### 3. Indexing Traits by ID
- **Technique**: Use a hash map or dictionary to quickly retrieve trait details by ID, avoiding linear searches.
- **Implementation**: Maintain a map of traits keyed by their unique IDs.
- **Example**:
  ```typescript
  // src/domains/traits/services/traitService.ts
  class TraitService {
    private traitMap: { [id: string]: ITrait } = {};

    constructor() {
      // Initialize traitMap with all traits
      this.traitMap = allTraits.reduce((map, trait) => {
        map[trait.id] = trait;
        return map;
      }, {});
    }

    getTraitDetails(traitId: string): ITrait {
      return this.traitMap[traitId];
    }
  }
  ```

## Metrics and Profiling Results
To monitor and improve performance, the following metrics and profiling tools are recommended:

1. **Trait Assignment Time**
   - Measure the time taken to assign traits to a creature with 500 particles.
   - **Target**: < 100ms for full assignment.

2. **Trait Lookup Time**
   - Measure the time to retrieve trait details by ID.
   - **Target**: < 1ms per lookup.

3. **Memory Usage**
   - Monitor memory consumption for trait pools and caches.
   - **Target**: Trait system memory usage < 10MB.

4. **Profiling Tools**
   - Use browser DevTools or Node.js profilers to identify hotspots in trait-related functions.
