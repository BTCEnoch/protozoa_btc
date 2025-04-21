
# Integration with Other Domains

## Introduction

The Group domain in the Bitcoin Protozoa project is responsible for managing particle groups, assigning roles, determining classes and subclasses, and facilitating trait assignments (formations, behaviors, and abilities). To perform these tasks effectively, it integrates with several other domains, leveraging their functionalities while adhering to the project's strict rules for determinism, Bitcoin blockchain integration, and domain isolation. This document outlines the interactions between the Group domain and other domains, detailing dependencies, data flows, and communication mechanisms.

## Key Domains and Interactions

The Group domain interacts primarily with the following domains, each providing critical data or services:

### Bitcoin Domain
- **Role**: Supplies blockchain data (nonce and confirmations) used for deterministic operations and evolution triggers.
- **Interaction**:
  - **Nonce**: The Group domain fetches the block nonce via the `/r/blockinfo/${blockNumber}` endpoint to seed the RNG system for particle distribution and trait assignment. This ensures all random operations are deterministic and tied to blockchain data.
  - **Confirmations**: Confirmation milestones (e.g., 10k, 50k) trigger evolution events, which may alter particle distributions or traits. The Group domain uses these milestones to determine mutation probabilities (e.g., 1% at 10k confirmations, 100% at 1M confirmations).
- **Data Flow**:
  - **Input**: The Group domain requests nonce and confirmation data through a singleton service in the Bitcoin domain.
  - **Output**: None; the Group domain uses the data internally for calculations.
- **Rules Compliance**:
  - Only uses specified endpoints (`/r/blockinfo/${blockNumber}`).
  - Fetches block header once per block number change.
  - Extracts only `nonce` and `confirmations` from the header.

### RNG Domain
- **Role**: Provides a deterministic RNG system seeded by the Bitcoin block nonce.
- **Interaction**:
  - The Group domain uses the RNG to perform random operations, such as distributing the 285 additional particles across roles and selecting traits from pools.
  - The RNG is initialized with the block nonce, ensuring consistent results across all instances for a given block.
- **Data Flow**:
  - **Input**: The Group domain calls the RNG domain's seeded RNG function (e.g., `createDeterministicRNG(nonce)`).
  - **Output**: Random numbers used for particle distribution and trait selection.
- **Rules Compliance**:
  - All random operations use the nonce-seeded RNG.
  - Maintains deterministic generation across instances.

### Creature Domain
- **Role**: Manages creature entities and their lifecycle, applying the Group domain's outputs to individual creatures.
- **Interaction**:
  - The Group domain provides role, class, subclass, and trait assignments, which the Creature domain uses to instantiate and update creatures.
  - During evolution, triggered by confirmation milestones, the Creature domain may request updated particle distributions or traits from the Group domain.
- **Data Flow**:
  - **Input**: The Creature domain sends creature-specific data (e.g., current particle counts) when requesting updates.
  - **Output**: The Group domain returns role assignments, class/subclass details, and assigned traits (formations, behaviors, abilities).
- **Rules Compliance**:
  - Preserves creature identity through mutations.
  - Uses events for cross-domain communication to avoid direct service imports.

### Traits Domain
- **Role**: Defines and manages the pools of formations, behaviors, and abilities available for assignment.
- **Interaction**:
  - The Group domain queries the Traits domain to retrieve trait pools based on the creature's role, class, and subclass tier.
  - The Traits domain provides specific trait definitions (e.g., Sacred Circle formation, Regenerative Pulse behavior) that the Group domain assigns to creatures.
- **Data Flow**:
  - **Input**: The Group domain sends role, class, subclass, and particle group rankings to the Traits domain.
  - **Output**: The Traits domain returns the selected traits, which the Group domain modifies based on secondary group rankings.
- **Rules Compliance**:
  - Uses deterministic RNG for trait selection.
  - Maintains singleton pattern for trait services.

### Particle Domain
- **Role**: Manages individual particle data, including counts and properties.
- **Interaction**:
  - The Group domain retrieves particle counts and organizes them into the five roles (`CORE`, `CONTROL`, `MOVEMENT`, `DEFENSE`, `ATTACK`).
  - During particle distribution, the Group domain updates particle counts in the Particle domain.
- **Data Flow**:
  - **Input**: Particle counts and properties from the Particle domain.
  - **Output**: Updated particle counts based on the distribution process.
- **Rules Compliance**:
  - Ensures exactly 500 particles per creature.
  - Uses instanced rendering for performance (handled by Particle/Rendering domains).

### Physics Domain
- **Role**: Handles spatial relationships and physics calculations for particle arrangements.
- **Interaction**:
  - The Group domain provides formation traits (e.g., Shield Line, Zen Circle) that the Physics domain uses to calculate particle positions and spatial interactions.
  - The Physics domain ensures formations align with gameplay mechanics (e.g., defensive formations increase protection).
- **Data Flow**:
  - **Input**: Formation traits from the Group domain.
  - **Output**: Spatial coordinates and physics parameters for particles.
- **Rules Compliance**:
  - Uses spatial partitioning for proximity checks.
  - Runs physics at a lower frequency than rendering.

### Rendering Domain
- **Role**: Manages visualization of creatures and their traits.
- **Interaction**:
  - The Group domain provides formation traits that influence how particles are visually arranged.
  - Trait assignments (e.g., Flaming Halo for Strikers) may include visual effects defined in the Rendering domain.
- **Data Flow**:
  - **Input**: Formation and visual trait data from the Group domain.
  - **Output**: Visual rendering instructions for creatures.
- **Rules Compliance**:
  - Uses instanced rendering for performance.
  - Implements interpolation for smooth visuals.

## Data Flow Diagram

The following diagram illustrates the primary data flows between the Group domain and other domains:

```
Bitcoin Domain (nonce, confirmations)
        ↓
RNG Domain (seeded RNG)
        ↓
Group Domain (particle distribution, role/class/trait assignment)
        ↔ Particle Domain (particle counts)
        ↔ Traits Domain (trait pools)
        ↓
Creature Domain (creature instantiation)
        ↔ Physics Domain (spatial calculations)
        ↔ Rendering Domain (visualization)
```

## Communication Mechanisms

To comply with the project's rules on domain isolation:
- **Events**: Cross-domain communication primarily uses event-based systems to avoid direct service imports outside the domain. For example, the Creature domain emits an event when a creature needs updated traits, which the Group domain handles.
- **Singleton Services**: Each domain's services follow the singleton pattern, ensuring efficient resource use and consistent state.
- **Explicit Dependencies**: Limited dependencies (e.g., Group domain importing RNG domain's RNG function) are explicitly defined and minimized.

## Evolution Integration

Evolution, triggered by confirmation milestones from the Bitcoin domain, involves:
- The Creature domain requesting potential trait or particle distribution updates from the Group domain.
- The Group domain using the nonce-seeded RNG to calculate mutations, ensuring deterministic evolution paths.
- Updated traits or distributions being applied back to the Creature domain, preserving creature identity.

## Performance Considerations

To align with performance rules:
- **Web Workers**: The Group domain offloads compute-intensive tasks (e.g., particle distribution, trait selection) to web workers, using transferable objects for efficiency.
- **Chunking**: Particle updates are processed in smaller groups to prevent system freezing.
- **Deterministic Testing**: The Group domain's deterministic outputs are validated through unit tests, ensuring consistency across instances.

## Conclusion

The Group domain serves as a central coordinator, integrating data and services from multiple domains to create cohesive, deterministic creature configurations. By leveraging the Bitcoin block nonce for RNG seeding, confirmation milestones for evolution, and adhering to strict domain isolation and performance rules, the Group domain ensures that Bitcoin Protozoa delivers a balanced, consistent, and engaging simulation experience.



