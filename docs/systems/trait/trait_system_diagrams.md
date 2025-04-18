
# Trait System Diagrams

## Purpose
This document provides visual aids to illustrate the structure and processes of the trait system in Bitcoin Protozoa. It serves as a single source of truth for understanding the system's architecture, workflows, and interactions, enhancing comprehension through graphical representation.

## Location
`docs/traits/trait_diagrams.md`

## Overview
The trait system is a complex component of Bitcoin Protozoa, encompassing multiple categories, assignment logic, and interactions with other domains. Diagrams are essential for visualizing these relationships and processes, making the system more accessible to developers, designers, and stakeholders. This document includes flowcharts, hierarchy diagrams, and interaction visuals to clarify the trait system's inner workings.

## Diagrams

### 1. Trait Assignment Workflow
This flowchart illustrates the step-by-step process of assigning traits to particles, highlighting the use of seeded RNG and role-based allocation.

**Flowchart:**
- **Start**: Particle requires trait assignment.
- **Step 1**: Retrieve block data (nonce).
- **Step 2**: Seed RNG with nonce.
- **Step 3**: Determine particle role.
- **Step 4**: Select trait pool based on role.
- **Step 5**: Determine rarity using RNG.
- **Step 6**: Select trait from pool using RNG.
- **Step 7**: Assign trait to particle.
- **End**: Trait assignment complete.

**Visual Representation**:
- A linear flowchart with decision points for role and rarity selection.

### 2. Trait Category Hierarchies
This diagram shows the hierarchical structure of trait categories, including their subcategories and relationships.

**Hierarchy Diagram:**
- **Trait Categories**:
  - Abilities
    - Subtypes: Offensive, Defensive, Support
  - Formations
    - Subtypes: Compact, Dispersed, Layered
  - Behaviors
    - Subtypes: Aggressive, Defensive, Passive
  - Visuals
    - Subtypes: Color, Glow, Shape
  - Mutations
    - Subtypes: Stat Boosts, Visual Changes, Behavioral Shifts

**Visual Representation**:
- A tree diagram with categories as parent nodes and subtypes as child nodes.

### 3. Trait Interaction Flows
This diagram visualizes how traits interact with each other and with other domains, such as rendering and game theory.

**Interaction Flow Diagram:**
- **Trait Assignment**:
  - Traits → Assigned to Particles (Creature Domain)
- **Rendering**:
  - Visual Traits → Rendering Pipeline (Rendering Domain)
- **Gameplay**:
  - Abilities & Behaviors → Battle Simulations (Game Theory Domain)
- **Evolution**:
  - Mutations → Evolution Triggers (Evolution Domain)

**Visual Representation**:
- A flow diagram with arrows indicating data and control flow between domains.

## Why Diagrams Matter
Diagrams provide:
- **Clarity**: Simplify complex processes like trait assignment.
- **Structure**: Visualize relationships between categories and subcategories.
- **Integration**: Show how traits interact across domains, aiding in system design.

This document enhances the trait system's documentation with essential visual aids, ensuring a comprehensive understanding of its architecture and processes.
