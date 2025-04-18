
# Trait Assignment Logic

## Overview
Trait assignment in Bitcoin Protozoa is a critical process that determines the properties and abilities of particles within creatures. This document provides a detailed explanation of how traits are assigned to particles, ensuring that the process is deterministic, consistent, and aligned with the project's domain-driven design (DDD) principles. The assignment logic leverages a seeded random number generator (RNG) based on the Bitcoin block nonce to maintain determinism, while also considering role-based and rarity-based rules for trait allocation.

## Assignment Process
The trait assignment process is designed to be deterministic, meaning that the same input (e.g., block nonce) will always produce the same trait assignments. This is achieved through the use of a seeded RNG system, which ensures that random selections are reproducible across different instances of the application.

### Key Steps in the Assignment Process
1. **Seeding the RNG**: The RNG is seeded using the nonce from the Bitcoin block data. This ensures that the randomness is deterministic and tied to the block's unique properties.
2. **Selecting Trait Pools**: Based on the particle's role (e.g., CORE, ATTACK), the appropriate trait pool is selected. Each role has its own set of traits, organized by rarity (e.g., COMMON, RARE).
3. **Determining Rarity**: The rarity of the trait to be assigned is determined using the seeded RNG. The probability of selecting a particular rarity is predefined (e.g., 50% COMMON, 0.1% MYTHIC).
4. **Assigning the Trait**: From the selected trait pool and rarity, a specific trait is chosen using the RNG and assigned to the particle.

### Role-Based and Rarity-Based Rules
- **Role-Based Allocation**: Each particle role has a dedicated pool of traits. For example, ATTACK particles can only receive traits from the ATTACK trait pool.
- **Rarity-Based Allocation**: Traits are further categorized by rarity within each role's pool. The RNG determines the rarity level based on predefined probabilities, ensuring a balanced distribution of trait strengths.

## Code Snippets
The following code snippets demonstrate the trait assignment logic in action, highlighting the use of the seeded RNG and role-based trait pools.

### Trait Service
The `traitService.ts` manages the overall trait assignment process.
```typescript
// src/domains/traits/services/traitService.ts
import { Singleton } from 'typescript-singleton';
import { createRNGFromBlock } from 'src/shared/lib/rngSystem';
import { Role, Rarity } from 'src/shared/types/core';
import { IParticle } from 'src/domains/creature/types/particle';
import { ITrait } from 'src/domains/traits/types/trait';

class TraitService extends Singleton {
  assignTrait(particle: IParticle, blockData: IBlockData): ITrait {
    const rng = createRNGFromBlock(blockData.nonce).getStream('traits');
    const rarity = this.determineRarity(rng);
    const traitPool = this.getTraitPool(particle.role, rarity);
    return this.selectTrait(traitPool, rng);
  }

  private determineRarity(rng: () => number): Rarity {
    const rand = rng();
    if (rand < 0.5) return Rarity.COMMON;
    if (rand < 0.8) return Rarity.UNCOMMON;
    if (rand < 0.95) return Rarity.RARE;
    if (rand < 0.99) return Rarity.EPIC;
    if (rand < 0.999) return Rarity.LEGENDARY;
    return Rarity.MYTHIC;
  }

  private getTraitPool(role: Role, rarity: Rarity): ITrait[] {
    // Logic to retrieve trait pool based on role and rarity
    return [];
  }

  private selectTrait(pool: ITrait[], rng: () => number): ITrait {
    const index = Math.floor(rng() * pool.length);
    return pool[index];
  }
}

export const traitService = TraitService.getInstance();
```

### Usage in Creature Generation
The `creatureGenerator.ts` uses the trait service to assign traits to particles.
```typescript
// src/domains/creature/services/creatureGenerator.ts
import { traitService } from 'src/domains/traits/services/traitService';

class CreatureGenerator {
  generateCreature(blockData: IBlockData): ICreature {
    const particles = this.createParticles(blockData);
    particles.forEach(p => {
      p.trait = traitService.assignTrait(p, blockData);
    });
    return { particles };
  }

  private createParticles(blockData: IBlockData): IParticle[] {
    // Logic to create particles
    return [];
  }
}
```

## Rules Adherence
- **Determinism**: The use of a seeded RNG ensures that trait assignments are consistent for the same block nonce.
- **Role-Based Allocation**: Traits are strictly assigned based on the particle's role, ensuring functional consistency.
- **Rarity Distribution**: Predefined probabilities ensure a balanced distribution of trait rarities, maintaining gameplay balance.

## Migration Steps
To transition from the current GitHub structure:
1. **Identify Existing Logic**: Locate trait assignment logic in the GitHub repository (e.g., in `src/creatures/` or `src/traits/`).
2. **Refactor into Trait Service**: Move the logic into `traitService.ts` under `src/domains/traits/services/`.
3. **Update Dependencies**: Adjust imports in `creatureGenerator.ts` and other relevant files to use the new trait service.
4. **Test Consistency**: Verify that trait assignments remain consistent across runs for the same block nonce.

This document serves as the single source of truth for trait assignment logic in Bitcoin Protozoa, ensuring clarity, determinism, and modularity in the new DDD structure.
