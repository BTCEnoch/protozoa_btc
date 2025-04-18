
# Extending the Trait System

## Purpose
This document guides developers on adding new traits or categories to the Bitcoin Protozoa trait system without disrupting existing functionality. It provides a structured approach to extending the system, ensuring flexibility, backward compatibility, and adherence to the project's domain-driven design (DDD) principles.

## Location
`docs/traits/extending_traits.md`

## Steps to Introduce a New Trait Category
Adding a new trait category (e.g., "defenses") involves the following steps:

1. **Define the New Category's Purpose and Structure**  
   - **Purpose**: Clearly state what the category represents (e.g., "defenses" for traits enhancing particle resilience).  
   - **Structure**: Specify the properties, such as `id`, `name`, `rarity`, and `defenseBonus`.

2. **Create a New Type Definition**  
   - **Location**: Add a file in `src/domains/traits/types/` (e.g., `defense.ts`).  
   - **Content**: Define a TypeScript interface.  
   - **Example**:  
     ```typescript
     export interface IDefense {
       id: string;
       name: string;
       rarity: Rarity;
       defenseBonus: number;
     }
     ```

3. **Add Data for the New Category**  
   - **Location**: Create a subdirectory in `src/domains/traits/data/` (e.g., `defenses/`).  
   - **Content**: Add static trait definitions in JSON.  
   - **Example**:  
     ```json
     [
       {
         "id": "defense_001",
         "name": "Basic Shield",
         "rarity": "COMMON",
         "defenseBonus": 5
       }
     ]
     ```

4. **Implement a Service for the New Category**  
   - **Location**: Add a service file in `src/domains/traits/services/` (e.g., `defenseService.ts`).  
   - **Content**: Include methods to manage the category.  
   - **Example**:  
     ```typescript
     class DefenseService {
       assignDefense(particle: IParticle, defense: IDefense): void {
         // Assignment logic
       }
     }
     export const defenseService = new DefenseService();
     ```

5. **Integrate with Other Domains**  
   - Update `creatureGenerator.ts` or other services to include the new category.  
   - Adjust rendering or gameplay logic if impacted.

6. **Test the New Category**  
   - Write unit tests for trait assignment and application.  
   - Perform integration tests to ensure compatibility.

## Best Practices for Modifying Existing Traits
1. **Update Trait Data**: Edit properties in the relevant data file (e.g., `abilityPools/core.ts`).  
2. **Adjust Service Logic**: Update the corresponding service if needed.  
3. **Maintain Backward Compatibility**: Deprecate old properties instead of removing them.  
4. **Document Changes**: Reflect updates in `docs/traits/`.

## Tips for Maintaining Backward Compatibility
1. **Version Trait Data**: Add a version field to track changes.  
2. **Deprecate, Don’t Delete**: Mark outdated elements as deprecated.  
3. **Provide Migration Paths**: Offer scripts or guidelines for updates.  
4. **Test Extensively**: Use regression tests to verify existing functionality.

## Why This Matters
Extending the trait system ensures:  
- **Future-Proofing**: Growth without major rewrites.  
- **Modularity**: Easy maintenance and expansion.  
- **Consistency**: Alignment with the project's scalable design.
