
# Trait Data Formats

## Purpose
This document defines the structure of trait data for Bitcoin Protozoa to ensure consistency across the system. It serves as a single source of truth for trait formats, facilitating standardized storage, retrieval, and extension of traits.

## Location
`docs/traits/trait_data_formats.md`

## Overview
Trait data in Bitcoin Protozoa is organized into five categories: abilities, formations, behaviors, visuals, and mutations. Each category adheres to a specific data format defined by TypeScript interfaces, ensuring type safety and clarity. These formats are utilized throughout the system for trait assignment, rendering, and gameplay mechanics.

## Trait Data Structure
All trait categories share a common structure with properties like `id`, `name`, and `rarity`, supplemented by category-specific fields.

### Shared Trait Properties
- `id`: Unique identifier for the trait (string).
- `name`: Human-readable name of the trait (string).
- `rarity`: Rarity level (e.g., COMMON, RARE, EPIC, LEGENDARY, MYTHIC) (enum).

### Category-Specific Formats

#### 1. Abilities
- **Interface**:
  ```typescript
  interface IAbility {
    id: string;
    name: string;
    rarity: Rarity;
    effect: string; // Description of the ability's effect
    stats: { [key: string]: number }; // Stat modifiers (e.g., { "attack": 10 })
  }
  ```
- **Example**:
  ```json
  {
    "id": "ability_001",
    "name": "Fire Blast",
    "rarity": "RARE",
    "effect": "Deals fire damage to enemies",
    "stats": { "damage": 15, "range": 5 }
  }
  ```

#### 2. Formations
- **Interface**:
  ```typescript
  interface IFormation {
    id: string;
    name: string;
    rarity: Rarity;
    positions: { x: number; y: number; z: number }[]; // Particle positions
  }
  ```
- **Example**:
  ```json
  {
    "id": "formation_001",
    "name": "Shield Wall",
    "rarity": "EPIC",
    "positions": [{ "x": 0, "y": 0, "z": 0 }, { "x": 1, "y": 0, "z": 0 }]
  }
  ```

#### 3. Behaviors
- **Interface**:
  ```typescript
  interface IBehavior {
    id: string;
    name: string;
    rarity: Rarity;
    action: string; // Description of the behavior
    triggers: string[]; // Events that trigger the behavior
  }
  ```
- **Example**:
  ```json
  {
    "id": "behavior_001",
    "name": "Aggressive",
    "rarity": "UNCOMMON",
    "action": "Increases attack frequency",
    "triggers": ["enemy_in_range"]
  }
  ```

#### 4. Visuals
- **Interface**:
  ```typescript
  interface IVisual {
    id: string;
    name: string;
    rarity: Rarity;
    color: string; // Hex color code
    size: number; // Scale factor
    glowIntensity: number; // Glow effect strength
  }
  ```
- **Example**:
  ```json
  {
    "id": "visual_001",
    "name": "Fiery Glow",
    "rarity": "LEGENDARY",
    "color": "#ff4500",
    "size": 1.2,
    "glowIntensity": 0.8
  }
  ```

#### 5. Mutations
- **Interface**:
  ```typescript
  interface IMutation {
    id: string;
    name: string;
    rarity: Rarity;
    effect: string; // Description of the mutation effect
    stats: { [key: string]: number }; // Stat changes
    evolvesFrom: string | null; // Previous trait in evolution path
  }
  ```
- **Example**:
  ```json
  {
    "id": "mutation_001",
    "name": "Enhanced Reflexes",
    "rarity": "MYTHIC",
    "effect": "Increases dodge chance by 20%",
    "stats": { "dodge": 20 },
    "evolvesFrom": "Quick Reflexes"
  }
  ```

## Guidelines for Creating New Trait Data
When adding new traits, adhere to the following:
1. **Follow the Category Interface**: Ensure the trait matches its category’s TypeScript interface.
2. **Unique IDs**: Assign a unique `id` to each trait (e.g., "category_###").
3. **Rarity Consistency**: Use predefined rarity levels (COMMON, RARE, EPIC, LEGENDARY, MYTHIC).
4. **Document Effects**: Provide a clear description of the trait’s effect or purpose in the `effect` or `action` field.

## Why This Matters
Standardized trait formats provide:
- **Consistency**: Uniform data structures across the system.
- **Scalability**: Simplified addition of new traits without disrupting existing logic.
- **Clarity**: Easy comprehension and utilization of trait data for developers and designers.

This document establishes a clear, modular framework for trait data in Bitcoin Protozoa, supporting both current functionality and future development.
