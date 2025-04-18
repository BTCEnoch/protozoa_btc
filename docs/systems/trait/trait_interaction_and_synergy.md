
# Trait Interaction and Synergy

## Purpose
This document details how traits in Bitcoin Protozoa interact with each other or combine to create synergistic effects, particularly in gameplay mechanics like battles. It serves as a single source of truth for developers to design balanced and predictable systems by outlining trait synergies, conflict resolution rules, and the application of game theory principles.

## Location
`docs/traits/trait_interaction_and_synergy.md`

## Overview
Trait interactions and synergies define how different traits—such as abilities, behaviors, formations, and visuals—work together to influence gameplay. These interactions can amplify effects, resolve conflicts, or shape strategic decisions, impacting mechanics like battles, evolution, and particle behavior. The goal is to ensure consistency, balance, and clarity in the system.

## Trait Synergies
Synergies occur when two or more traits combine to produce an effect greater than their individual contributions. Below are examples of how traits can synergize:

### Examples of Synergies
1. **Speed Ability + Strike Behavior**
   - **Description**: A particle with a "speed" ability (increases movement speed) paired with a "strike" behavior (attacks nearby enemies).
   - **Effect**: Faster movement reduces travel time between targets, increasing attack frequency and combat effectiveness.

2. **Shield Formation + Defense Trait**
   - **Description**: A "shield" formation (particles arranged protectively) combined with a "defense" trait (reduces damage taken).
   - **Effect**: The formation enhances the defense trait, making the creature more resilient to attacks.

3. **Glow Visual + Attract Behavior**
   - **Description**: A "glow" visual trait (emits light) paired with an "attract" behavior (draws particles closer).
   - **Effect**: The glow increases visibility, boosting the attraction range or strength for grouping or herding.

## Rules for Resolving Conflicts
When traits have opposing effects or modify the same property, conflicts are resolved using these rules:

1. **Priority by Category**
   - "Abilities" take precedence over "behaviors" and "visuals" for particle actions.
   - "Formations" override "behaviors" for spatial arrangements.

2. **Rarity-Based Resolution**
   - Higher rarity traits (e.g., MYTHIC) override lower rarity traits (e.g., COMMON) in conflicts.

3. **Additive Effects**
   - Traits modifying the same property (e.g., speed) combine additively unless one sets a specific value, which takes precedence.

## Game Theory Principles
Game theory ensures balanced and strategic gameplay through the following principles:

1. **Nash Equilibrium in Battles**
   - Trait combinations are designed to avoid dominant strategies, promoting diverse builds. A service calculates optimal strategies based on payoffs.

2. **Utility Functions**
   - A service evaluates the utility of trait combinations, guiding evolution and player choices.

3. **Decision Trees**
   - Creature behavior is modeled logically based on trait interactions, ensuring predictable actions.

## Why This Matters
Understanding trait interactions helps developers:
- Create balanced gameplay by avoiding overpowered combinations.
- Ensure predictable mechanics for consistent player experiences.
- Leverage game theory for strategic depth and replayability.

## Migration Steps from Current GitHub Structure
To integrate this into the current project:
1. **Identify Existing Logic**: Find trait interaction code in the GitHub repository.
2. **Refactor**: Move logic into a dedicated service (e.g., `traitInteractionService.ts`).
3. **Update Systems**: Adjust battle and evolution systems to use the new structure.
4. **Test**: Validate synergies and conflict resolutions in simulations.

This document provides a clear, modular, and balanced framework for trait interactions in Bitcoin Protozoa.
