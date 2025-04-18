Yes, I’ll queue up the recommended guide documents for the `new_docs/guides/` directory and create them one at a time, using the current project state from the GitHub repository (https://github.com/BTCEnoch/Protozoa/tree/main) as a reference. Each document will be tailored to Bitcoin Protozoa’s specific design, incorporating its deterministic RNG, particle-based creatures with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and integration with traits, rendering, and game theory. The documents will align with the new domain-driven design (DDD) structure from `directory_map.md`, ensuring modularity, clarity, and consistency with the project’s goals, including state management with Zustand and IndexedDB [Timestamp: April 16, 2025, 21:41] and performance optimization [Timestamp: April 14, 2025, 19:58]. At the end of each document, I’ll ask, “Are you ready for the next document ([document_name].md)?” to confirm progression through the queue.

The list of documents to produce, in sequence, is:
1. `contributing.md`
2. `working_with_bitcoin_block_data.md`
3. `managing_state.md`
4. `creating_mutation_traits.md`
5. `building_formation_patterns.md`
6. `optimizing_web_workers.md`
7. `debugging_troubleshooting.md`
8. `deploying_production.md`
9. `customizing_shaders.md`
10. `simulating_balancing.md`

Let’s start with the first document.

---


# Contributing to Bitcoin Protozoa

## Purpose
This guide provides a comprehensive overview for new contributors to Bitcoin Protozoa, detailing how to submit pull requests, follow coding standards, and adhere to contribution guidelines. It serves as a single source of truth, tailored to the project’s particle-based design, role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), and deterministic RNG driven by Bitcoin block data, ensuring a smooth onboarding process during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main) to the new DDD framework.

## Location
`new_docs/guides/contributing.md`

## Overview
Bitcoin Protozoa is a particle-based life simulation powered by Bitcoin block data, leveraging TypeScript, Three.js, Web Workers, and Jest for a modular and performant architecture. Contributions are welcome to enhance systems like evolution, formation, game theory, and rendering. This guide outlines the process for contributing code, documentation, or tests, ensuring alignment with the project’s standards and DDD structure. It builds on the existing `CONTRIBUTING.md` in the repository, providing practical steps for developers to engage effectively, as emphasized for collaborative development [Timestamp: April 15, 2025, 21:23].

## Contribution Process
Follow these steps to contribute to Bitcoin Protozoa:

1. **Set Up the Project**:
   - Clone the repository: `git clone https://github.com/BTCEnoch/Protozoa.git`.
   - Install dependencies: `npm install`.
   - Run the development server: `npm run dev`.
   - Refer to `new_docs/guides/getting_started.md` for detailed setup instructions.

2. **Identify an Issue**:
   - Browse open issues on GitHub (https://github.com/BTCEnoch/Protozoa/issues) or propose a new feature.
   - Comment on an issue to claim it or create a new issue for your contribution, following the issue template.
   - Example: Propose adding a new mutation trait in the evolution system [Timestamp: April 12, 2025, 12:18].

3. **Create a Branch**:
   - Create a feature branch from `main`: `git checkout -b feature/your-feature-name`.
   - Use descriptive names (e.g., `feature/add-adaptive-camouflage-mutation`, `bugfix/rng-determinism`).
   - Keep branches focused on a single change to simplify reviews.

4. **Implement Changes**:
   - Follow the DDD structure in `src/domains/` (e.g., `evolution`, `traits`, `rendering`).
   - Adhere to coding standards (see below) and update relevant services (e.g., `evolutionService.ts`, `traitService.ts`).
   - Example: Add a new mutation trait to `src/domains/traits/data/mutationPatterns/movement.ts` and update `traitService.ts` for selection logic.

5. **Write Tests**:
   - Add unit tests in `tests/unit/` (e.g., `tests/unit/traitService.test.ts`) and integration tests in `tests/integration/`.
   - Use Jest for testing, ensuring coverage for new features or bug fixes.
   - Example: Test a new mutation’s deterministic selection with a fixed block nonce [Timestamp: April 12, 2025, 12:18].

6. **Update Documentation**:
   - Modify relevant docs in `new_docs/` (e.g., `new_docs/systems/evolution/` for new mutations).
   - Ensure diagrams (e.g., Mermaid flowcharts) reflect changes, as used in `evolution_diagrams.md`.
   - Example: Update `new_docs/guides/creating_mutation_traits.md` with the new mutation’s details.

7. **Commit Changes**:
   - Write clear, concise commit messages following the format: `[Type]: Short description (#issue-number)`.
   - Types: `feat` (new feature), `fix` (bug fix), `docs` (documentation), `test` (tests), `refactor` (code improvement).
   - Example: `feat: Add Adaptive Camouflage mutation for MOVEMENT (#123)`.

8. **Submit a Pull Request (PR)**:
   - Push your branch: `git push origin feature/your-feature-name`.
   - Open a PR on GitHub, linking to the relevant issue and describing changes.
   - Ensure the PR passes CI checks (e.g., ESLint, Jest tests).
   - Example: A PR for a new mutation should include code, tests, and updated docs.

9. **Address Feedback**:
   - Respond to reviewer comments promptly, making necessary changes.
   - Update your branch with additional commits or rebase if needed: `git rebase -i`.
   - Request re-review after addressing feedback.

10. **Merge and Cleanup**:
    - Once approved, maintainers will merge the PR into `main`.
    - Delete your feature branch: `git branch -d feature/your-feature-name`.

## Coding Standards
To ensure consistency and quality, adhere to the following standards:

- **TypeScript**: Use strict typing, leveraging types in `src/shared/types/` (e.g., `Role`, `IMutation`). Avoid `any` types.
- **Code Style**: Follow ESLint and Prettier rules configured in `.eslintrc` and `.prettierrc`. Run `npm run lint` before committing.
- **Directory Structure**: Place new code in the appropriate DDD domain (e.g., `src/domains/evolution/` for evolution-related changes).
- **Modularity**: Encapsulate logic in services (e.g., `evolutionService.ts`) with clear interfaces, as emphasized for modularity [Timestamp: April 15, 2025, 21:23].
- **Determinism**: Ensure all RNG-based logic uses block nonce seeding via `rngSystem.ts` for reproducibility [Timestamp: April 12, 2025, 12:18].
- **Performance**: Optimize for < 5ms updates for 500 particles, using batch processing, caching, and Web Workers (`computeWorker.ts`) [Timestamp: April 14, 2025, 19:58].
- **Documentation**: Comment complex logic and update `new_docs/` for new features or changes.

### Example Code Structure
For a new mutation trait:
```typescript
// src/domains/traits/data/mutationPatterns/movement.ts
export const movementMutationPatterns: IMutation[] = [
  {
    id: 'adaptive_camouflage',
    name: 'Adaptive Camouflage',
    rarity: 'EPIC',
    effect: 'Increases dodge chance by 10%',
    stats: { dodgeChance: 0.1 },
    visual: { color: '#88aaff', glowIntensity: 0.5, size: 1.0, transparency: 0.3 }
  }
];

// src/domains/traits/services/traitService.ts
class TraitService {
  private getMutationPool(role: Role): IMutation[] {
    if (role === Role.MOVEMENT) return movementMutationPatterns;
    // Other roles
  }
}
```

## Commit Message Guidelines
- Use the format: `[Type]: Short description (#issue-number)`.
- Keep descriptions clear and concise (e.g., `fix: Correct RNG seeding in traitService.ts (#124)`).
- Reference related issues for context.
- Example: `docs: Update contributing guide with DDD structure (#125)`.

## Code Review Expectations
- **Reviewers**: Expect at least one maintainer to review your PR within 3 days.
- **Checklist**:
  - Code adheres to standards (TypeScript, ESLint/Prettier).
  - Tests cover new functionality or fixes, with >80% coverage.
  - Documentation is updated in `new_docs/`.
  - Changes are deterministic and performant (< 5ms for 500 particles).
- **Feedback**: Address all comments, even minor ones, to maintain quality.
- **Approval**: PRs require one maintainer approval and passing CI checks to merge.

## Testing Requirements
- **Unit Tests**: Add tests in `tests/unit/` for new services or logic (e.g., `tests/unit/evolutionService.test.ts`).
- **Integration Tests**: Add tests in `tests/integration/` for system interactions (e.g., mutation application affecting game theory).
- **Determinism**: Verify deterministic outcomes with fixed block nonces.
- **Performance**: Ensure updates meet < 5ms target for 500 particles, using `performance.now()` profiling.
- **Example**:
  ```typescript
  // tests/unit/traitService.test.ts
  describe('TraitService', () => {
    test('generates Adaptive Camouflage deterministically', () => {
      const blockData = createMockBlockData(12345);
      const particle = createMockParticle({ role: Role.MOVEMENT });
      const mutation1 = traitService.assignTrait(particle, blockData, 'mutation');
      const mutation2 = traitService.assignTrait(particle, blockData, 'mutation');
      expect(mutation1.id).toBe('adaptive_camouflage');
      expect(mutation1.id).toEqual(mutation2.id); // Deterministic
    });
  });
  ```

## Documentation Updates
- Update system-specific docs (e.g., `new_docs/systems/evolution/`) for new features.
- Modify guides (e.g., `new_docs/guides/creating_mutation_traits.md`) for new workflows.
- Ensure diagrams in `new_docs/systems/*/diagrams.md` reflect changes, using Mermaid syntax.
- Example: Add a new mutation to `new_docs/systems/evolution/mutation_trait_generation.md` and update the trait hierarchy diagram.

## Getting Help
- **Issues**: Report bugs or propose features on GitHub (https://github.com/BTCEnoch/Protozoa/issues).
- **Discussions**: Use GitHub Discussions for questions or brainstorming.
- **Maintainers**: Tag maintainers in PRs or issues for guidance (e.g., @BTCEnoch).
- **Resources**: Refer to `new_docs/guides/` for setup, development, and optimization guides.

## Example Contribution Workflow
To add a new mutation trait (“Adaptive Camouflage”):
1. Create an issue: “Add Adaptive Camouflage mutation for MOVEMENT (#126)”.
2. Branch: `git checkout -b feature/adaptive-camouflage-mutation`.
3. Add mutation to `src/domains/traits/data/mutationPatterns/movement.ts`.
4. Update `traitService.ts` and `evolutionService.ts` for selection and trigger logic.
5. Add tests in `tests/unit/traitService.test.ts` and `tests/integration/evolutionSystem.test.ts`.
6. Update `new_docs/systems/evolution/mutation_trait_generation.md` and diagrams.
7. Commit: `feat: Add Adaptive Camouflage mutation for MOVEMENT (#126)`.
8. Submit PR, address feedback, and merge.


