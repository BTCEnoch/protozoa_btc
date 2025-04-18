Below is the populated `glossary.md` document based on the provided thinking trace and the user's request to create a single source of truth for the Bitcoin Protozoa project. This version integrates the existing structure from the thinking trace while aligning with the goal of documenting how to restructure the current build on GitHub.


# Glossary

## Overview
This glossary serves as a single source of truth for key terms and concepts used throughout the Bitcoin Protozoa project. It ensures clarity and consistency in documentation, code, and communication by defining essential terminology. The glossary is designed to be easily updated and referenced, supporting the project's domain-driven design (DDD) structure. It reflects the current state of the project on GitHub (http://github.com/BTCEnoch/Protozoa/tree/main) while providing a foundation for restructuring and documentation improvements.

## Terms and Definitions

### Bitcoin Protozoa
- **Definition**: The name of the project, a particle-based life simulation system powered by Bitcoin block data.

### Particle
- **Definition**: A fundamental unit within a creature, representing an individual element with specific traits and behaviors.

### Creature
- **Definition**: A collection of particles that form a cohesive entity, generated based on Bitcoin block data.

### Trait
- **Definition**: A property or characteristic assigned to a particle, influencing its behavior, appearance, or interactions. Traits are categorized into abilities, formations, behaviors, visuals, and mutations.

### Role
- **Definition**: A classification of particles within a creature, determining their function and the types of traits they can possess. Roles include CORE, CONTROL, MOVEMENT, DEFENSE, and ATTACK.

### Rarity
- **Definition**: A measure of a trait's scarcity and power, ranging from COMMON to MYTHIC.

### RNG (Random Number Generator)
- **Definition**: A system used to generate deterministic random numbers for trait assignment and other processes, seeded by Bitcoin block nonce.

### Domain
- **Definition**: A distinct area of the system, such as `creature`, `traits`, or `rendering`, organized under `src/domains/` in the DDD structure.

### Service
- **Definition**: A singleton class within a domain that encapsulates business logic, such as `traitService.ts`.

### API
- **Definition**: Application Programming Interface, referring to the methods and functions exposed by services for programmatic interaction.

### Three.js
- **Definition**: A JavaScript library used for rendering 3D graphics in the browser, integral to the project's visualization.

### DDD (Domain-Driven Design)
- **Definition**: A software design approach focusing on modeling the domain and its logic, used to structure the project.

### Bitcoin Block Data
- **Definition**: Data from Bitcoin blocks, including nonce and confirmations, used to seed RNG and trigger evolution.

### Evolution
- **Definition**: The process by which creatures mutate or change over time, tied to Bitcoin block confirmations.

### Mutation
- **Definition**: A type of trait that can evolve or change based on specific conditions, such as confirmation milestones.

### Instanced Rendering
- **Definition**: A rendering technique used to efficiently display multiple instances of the same object, crucial for particle visualization.

### LOD (Level of Detail)
- **Definition**: A rendering optimization technique that reduces the complexity of distant objects.

### Shader
- **Definition**: A program that runs on the GPU to control rendering effects, used for advanced visual traits.

### Singleton
- **Definition**: A design pattern ensuring only one instance of a class exists, used for services in the project.

### Jest
- **Definition**: A JavaScript testing framework used to test the project's code.

### ESLint
- **Definition**: A tool for identifying and reporting on patterns in JavaScript/TypeScript code, used for code quality.

### Prettier
- **Definition**: A code formatter used to enforce consistent code style.

### Vite
- **Definition**: A build tool used for faster development and optimized production builds.

## Migration Steps
To integrate this glossary into the current Bitcoin Protozoa project on GitHub and support restructuring:
1. **Review Existing Documentation**: Analyze the current state of the GitHub repository (http://github.com/BTCEnoch/Protozoa/tree/main) to identify terms already in use within code comments, READMEs, and other docs.
2. **Consolidate Definitions**: Cross-reference existing terms with this glossary, updating or adding definitions as needed to reflect the project's current implementation.
3. **Reference in Code**: Update code comments, READMEs, and other documentation to consistently use glossary terms, linking back to this file where applicable.
4. **Restructure Alignment**: Ensure glossary terms align with the DDD structure under `src/domains/`, refining definitions to match domain-specific logic as the project evolves.
5. **Update as Needed**: Add new terms or revise existing ones as the project grows, maintaining this glossary as a living document.

## Purpose and Next Steps
This glossary establishes a foundation for consistent terminology across the Bitcoin Protozoa project. By integrating it into the GitHub repository, it supports the transition to a more structured, documented build while preserving the integrity of the current implementation. Future documentation efforts (e.g., architecture, API references) should build upon this glossary to maintain a cohesive single source of truth.

