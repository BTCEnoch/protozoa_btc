### Key Points
- Bitcoin Protozoa is a particle-based life simulation using Bitcoin block data, built with React, Three.js, and TypeScript, requiring a structured development guide.
- The evidence suggests a modular architecture with clear directories (`src/`, `docs/`, `tests/`, `traits/`) and dependencies like React and Three.js, guiding setup and coding practices.
- It seems likely that development follows standard web practices with Vite, ESLint, Prettier, and Jest, emphasizing TypeScript and deterministic logic for on-chain deployment.
- Research indicates naming conventions (camelCase, PascalCase) and contribution guidelines are critical for maintaining code quality and collaboration.

### Getting Started with Development
To develop for Bitcoin Protozoa, you’ll need to set up your computer with tools like Node.js and Git, then download the project from its GitHub page. Once you install the required software packages, you can run the project locally to see it in action. The project is organized into folders for code, documentation, and tests, making it easy to find where to add new features or fix issues. You’ll write code in TypeScript, use React for the user interface, and Three.js for 3D visuals, following specific naming rules to keep everything consistent.

### Project Structure
The code lives in a main folder called `src/`, with subfolders for different parts like user interface components, business logic, and utility functions. Documentation is in the `docs/` folder, tests are in `tests/`, and game-related trait definitions are in `traits/`. This setup helps you quickly locate the right place to work on features like creature generation or 3D rendering.

### Coding and Testing
When coding, use names like `fetchBlockData` for functions and `BitcoinService` for classes to follow the project’s style. Tools like ESLint and Prettier ensure your code is clean and error-free. You’ll also write tests using Jest to check that your changes work correctly, especially for critical parts like the random number generator that uses Bitcoin data.

### Contributing
To contribute, follow the guidelines in the `CONTRIBUTING.md` file, which explains how to submit your changes and work with the team. You’ll optimize performance, especially for 3D rendering, and ensure your code supports the project’s goal of storing creatures on the Bitcoin blockchain.

---


# Development Guide

## Metadata
- **Version**: v1.0.0
- **Last Updated**: 2025-04-17
- **Dependencies**: Node.js v18+, Git, TypeScript, npm
- **Related Documents**: [Getting Started](getting_started.md), [Architecture Overview](architecture/overview.md), [Data Flows](architecture/data_flows.md), [System Integration Points](architecture/integration_points.md), [RNG System](architecture/rng_system.md)

## Introduction
This guide provides comprehensive instructions for developers contributing to Bitcoin Protozoa, a particle-based life simulation powered by Bitcoin block data, deployed on-chain via recursive inscriptions using the ordinals protocol. It covers setting up the development environment, understanding the project structure, adhering to coding standards, managing dependencies, writing tests, contributing effectively, and optimizing performance. The guide is designed for a coding AI and human developers, ensuring clarity and actionability for maintaining the project’s modularity, determinism, and performance.

## Setup Instructions
To begin development, set up your environment with the following steps.

### Prerequisites
- **Node.js**: Version 18 or higher, available at [Node.js](https://nodejs.org/).
- **Git**: For version control, available at [Git](https://git-scm.com/).
- **TypeScript**: Included via npm, but familiarity is recommended.
- **Text Editor**: VS Code or similar, with TypeScript and ESLint extensions.

### Cloning the Repository
Clone the Bitcoin Protozoa repository from GitHub:
```bash
git clone https://github.com/BTCEnoch/Protozoa.git
cd Protozoa
```

### Installing Dependencies
Install project dependencies using npm:
```bash
npm install
```
This installs all dependencies listed in `package.json`, including React, Three.js, and development tools like Jest and ESLint.

### Running the Development Server
Start the Vite-based development server:
```bash
npm run dev
```
Access the application at `http://localhost:5173` (default Vite port). The server supports hot reloading for real-time code changes.

### Building the Project
To create a production build:
```bash
npm run build
```
The output is generated in the `dist/` directory, optimized for deployment.

## Project Structure
The project is organized under the `fresh/` root directory, with a modular structure to separate concerns. Key directories include:

| Directory | Purpose |
|-----------|---------|
| `src/` | Source code, containing all application logic |
| `src/components/` | React components (e.g., `ParticleRenderer.tsx`, `BlockSelector.tsx`) |
| `src/services/` | Business logic services (e.g., `bitcoinService.ts`, `traitService.ts`) |
| `src/lib/` | Utility functions (e.g., `rngSystem.ts`, `mulberry32.ts`) |
| `src/types/` | TypeScript interfaces and types (e.g., `IBlockData.ts`) |
| `src/data/` | Static data and configurations |
| `src/models/` | Data models for particles, creatures, and traits |
| `docs/` | Documentation, including architecture and guides |
| `tests/` | Test suite for unit and integration tests |
| `traits/` | Trait definitions for game mechanics (e.g., abilities, formations) |

This structure supports the project’s domain-driven design, with clear separation of UI, logic, utilities, and documentation.

## Coding Standards
Adhere to the following standards to ensure code quality and consistency.

### Naming Conventions
- **Classes and Interfaces**: Use PascalCase, descriptive names (e.g., `BitcoinService`, `IParticle`).
- **Functions and Methods**: Use camelCase, verb-noun structure (e.g., `fetchBlockData`, `applyTraits`).
- **Variables**: Use camelCase, descriptive (e.g., `blockNumber`, `particleCount`).
- **Constants**: Use UPPER_CASE for global constants (e.g., `MAX_PARTICLES`).
- **Files**: Use camelCase for service and utility files (e.g., `bitcoinService.ts`), PascalCase for components (e.g., `ParticleRenderer.tsx`).

### Code Formatting
- **ESLint**: Enforces code quality, configured in `.eslintrc.json`. Run `npm run lint` to check for issues.
- **Prettier**: Formats code automatically, configured in `.prettierrc`. Run `npm run format` to apply formatting.
- **TypeScript**: Use strict typing, define interfaces in `src/types/`, and avoid `any` types.

### TypeScript Usage
- Define interfaces for all data structures (e.g., `IBlockData` for `{ nonce: number, confirmations: number }`).
- Use type annotations for function parameters and return types.
- Organize interfaces in `src/types/` for reusability.

**Example**:
```typescript
// src/types/IBlockData.ts
export interface IBlockData {
  nonce: number;
  confirmations: number;
}

// src/services/bitcoin/bitcoinService.ts
async function fetchBlockData(blockNumber: number): Promise<IBlockData> {
  const response = await fetch(`https://ordinals.com/r/blockinfo/${blockNumber}`);
  const data = await response.json();
  return { nonce: data.nonce, confirmations: data.confirmations };
}
```

## Dependency Management
Dependencies are managed via npm and listed in `package.json`. Key dependencies include:

| Dependency | Version | Purpose |
|------------|---------|---------|
| react | 18.2.0 | Frontend framework for UI components |
| react-dom | 18.2.0 | DOM rendering for React |
| three | 0.162.0 | 3D rendering library |
| @react-three/fiber | ^8.13.7 | React integration for Three.js |
| @react-three/drei | ^9.88.17 | Three.js utilities for React |
| typedi | ^0.10.0 | Dependency injection |
| zustand | ^4.5.2 | State management |
| howler | ^2.2.4 | Audio management |
| gsap | ^3.12.7 | Animations |
| @emotion/react | ^11.14.0 | CSS-in-JS for styling |
| @mui/material | ^6.4.7 | Material-UI components |
| @nextui-org/react | ^2.6.11 | UI components |
| framer-motion | ^12.5.0 | Motion animations |

**Development Dependencies**:
| Dependency | Version | Purpose |
|------------|---------|---------|
| @typescript-eslint/eslint-plugin | ^7.1.1 | TypeScript linting |
| @typescript-eslint/parser | ^7.1.1 | TypeScript parsing for ESLint |
| @vitejs/plugin-react | ^4.3.4 | React plugin for Vite |
| jest | ^29.5.14 | Testing framework |
| @testing-library/react | ^14.1.2 | React testing utilities |
| eslint | ^8.57.0 | Linting tool |
| prettier | ^3.0.0 | Code formatting |
| tailwindcss | ^3.4.17 | CSS framework |
| vite | ^5.1.5 | Build tool |

### Adding Dependencies
1. Install a dependency: `npm install <package-name>`
2. For development dependencies: `npm install --save-dev <package-name>`
3. Update `package.json` and verify compatibility with existing dependencies.
4. Document new dependencies in `docs/references/dependencies.md`.

## Testing
Testing ensures the reliability of the project’s deterministic logic and performance.

### Testing Framework
- **Jest**: Used for unit and integration tests, configured in `jest.config.js`.
- **React Testing Library**: For testing React components.

### Running Tests
Run all tests:
```bash
npm run test
```
Run tests with coverage:
```bash
npm run test:coverage
```

### Writing Tests
- **Unit Tests**: Test individual functions or classes in `tests/unit/` (e.g., `rngSystem.test.ts`).
- **Integration Tests**: Test system interactions in `tests/integration/` (e.g., `creatureGeneration.test.ts`).
- **Naming**: Use `<filename>.test.ts` (e.g., `bitcoinService.test.ts`).
- **Structure**: Follow Arrange-Act-Assert pattern.

**Example**:
```typescript
// tests/unit/rngSystem.test.ts
import { createRNGFromBlock } from '../../src/lib/rngSystem';

describe('RNGSystem', () => {
  test('produces deterministic output', () => {
    const rng1 = createRNGFromBlock(12345).getStream('test')();
    const rng2 = createRNGFromBlock(12345).getStream('test')();
    expect(rng1).toEqual(rng2);
  });
});
```

## Contribution Guidelines
Follow the guidelines in [CONTRIBUTING.md](https://github.com/BTCEnoch/Protozoa/blob/main/CONTRIBUTING.md) for contributing to the project.

### Key Points
- **Code Style**: Adhere to naming conventions and formatting rules.
- **Pull Requests**: Submit PRs with clear descriptions, referencing related issues.
- **Issues**: Use GitHub Issues for bug reports and feature requests.
- **Reviews**: All PRs require at least one review before merging.
- **Commits**: Use descriptive commit messages (e.g., `Add error handling to BitcoinService`).

### Process
1. Fork the repository and create a feature branch: `git checkout -b feature/<name>`.
2. Make changes, write tests, and ensure `npm run lint` and `npm run test` pass.
3. Commit changes and push to your fork.
4. Open a PR against the `main` branch, linking to relevant issues.
5. Address review feedback and merge once approved.

## Optimization and Performance
Optimize code to ensure real-time performance, especially for rendering 500 particles and handling on-chain data.

### Three.js Rendering
- **Instanced Rendering**: Use `InstancedMesh` for particles to reduce draw calls.
- **Level of Detail (LOD)**: Implement LOD for distant particles to improve performance.
- **Shaders**: Optimize custom shaders for visual effects (e.g., glow, color gradients).

**Example**:
```typescript
// src/components/ParticleRenderer/ParticleRenderer.tsx
const geometry = new THREE.BufferGeometry();
const material = new THREE.ShaderMaterial({ /* shader code */ });
const mesh = new THREE.InstancedMesh(geometry, material, 500);
scene.add(mesh);
```

### Web Workers
- Offload physics and RNG calculations to Web Workers to maintain 60 FPS.
- Example: `src/workers/physicsWorker.ts` computes particle positions.

**Example**:
```typescript
// src/workers/physicsWorker.ts
self.onmessage = ({ data: { particles, deltaTime } }) => {
  const newPositions = computePhysics(particles, deltaTime);
  self.postMessage(newPositions);
};
```

### Performance Testing
- Use Three.js’s `Stats` module to monitor FPS: `import Stats from 'three/examples/jsm/libs/stats.module.js'`.
- Profile with browser DevTools to identify bottlenecks.
- Benchmark with `npm run test:performance` (if configured).

## Additional Resources
- [Architecture Overview](architecture-overview.md): High-level project architecture.
- [Data Flows](architecture-data_flows.md): Data transformation pipelines.
- [System Integration Points](architecture-integration_points.md): System interactions.
- [RNG System](architecture-rng_system.md): Random number generation details.
- [Trait System](systems-trait-trait_system.md): Trait generation and application.
- [Particle System](systems-particle-particle_system.md): Particle management.
- [Evolution Mechanics](systems-evolution-evolution_tracker.md): Evolution and mutation rules.
- [CONTRIBUTING.md](https://github.com/BTCEnoch/Protozoa/blob/main/CONTRIBUTING.md): Contribution guidelines.



---

### Bitcoin Protozoa Development Guide: Comprehensive Analysis

This note provides a detailed guide for developers contributing to the Bitcoin Protozoa project, a particle-based life simulation powered by Bitcoin block data, deployed on-chain via recursive inscriptions using the ordinals protocol. The guide is based on a thorough analysis of the project’s GitHub repository ([Bitcoin Protozoa GitHub](https://github.com/BTCEnoch/Protozoa)), prior discussions (April 4–17, 2025), and provided documentation, including `project_overview.md`, `directory_structure.md`, evolution milestone rules, and system integration points. It aims to create a comprehensive, accurate `development.md` document for the `docs/guides/` section, covering setup, project structure, coding standards, dependency management, testing, contribution guidelines, and optimization strategies, tailored for a coding AI and human developers.

#### Project Context and Architecture
Bitcoin Protozoa generates creatures composed of 500 particles, distributed across five role groups (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), with traits determined by Bitcoin block data (nonce and confirmations) fetched via the `[ordinals.com API](https://ordinals.com/r/blockinfo/)`. The project employs a modular, service-based architecture using React, Three.js, and TypeScript, with a focus on determinism, simplicity, and performance for on-chain deployment. Key directories include `src/` (source code), `docs/` (documentation), `tests/` (test suite), and `traits/` (trait definitions), as outlined in `docs/directory_structure.md`.

The architecture emphasizes:
- **Determinism**: All processes (RNG, trait generation, evolution) are reproducible for the same block nonce, supporting recursive inscriptions.
- **Simplicity**: Uses only nonce and confirmations, with a single API call, avoiding real-time updates.
- **Performance**: Leverages instanced rendering, Web Workers, and caching for real-time visualization of 500 particles.
- **Modularity**: Organizes logic in `src/services/` (e.g., `bitcoinService.ts`), UI in `src/components/` (e.g., `ParticleRenderer.tsx`), and utilities in `src/lib/` (e.g., `rngSystem.ts`).

#### Development Environment Setup
Setting up the development environment is straightforward, aligning with standard web development practices.

##### Prerequisites
- **Node.js**: Version 18 or higher, ensuring compatibility with modern JavaScript features and Vite. Download from [Node.js](https://nodejs.org/).
- **Git**: For cloning and managing the repository, available at [Git](https://git-scm.com/).
- **TypeScript**: Installed via npm, but developers should understand TypeScript’s strict typing and interfaces.
- **Text Editor**: Visual Studio Code is recommended, with extensions for TypeScript, ESLint, and Prettier to enhance development.

##### Cloning and Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/BTCEnoch/Protozoa.git
cd Protozoa
npm install
```
The `npm install` command installs all dependencies listed in `package.json`, including production dependencies (e.g., React, Three.js) and development tools (e.g., Jest, ESLint).

##### Running and Building
- **Development Server**: Start the Vite-based server with `npm run dev`, accessible at `http://localhost:5173`. Vite provides hot module replacement for rapid development.
- **Production Build**: Run `npm run build` to generate optimized assets in `dist/`, suitable for deployment to static hosting services like Vercel.

#### Project Structure
The project’s directory structure is designed for modularity and clarity, as detailed in `docs/directory_structure.md`.

| Directory | Description | Key Files |
|-----------|-------------|-----------|
| `src/` | Source code for the application | |
| `src/components/` | React components for UI | `ParticleRenderer.tsx`, `BlockSelector.tsx` |
| `src/services/` | Business logic services | `bitcoinService.ts`, `traitService.ts`, `evolutionTracker.ts` |
| `src/lib/` | Utility functions and libraries | `rngSystem.ts`, `mulberry32.ts` |
| `src/types/` | TypeScript interfaces and types | `IBlockData.ts`, `IParticle.ts` |
| `src/data/` | Static data and configurations | Configuration files, constants |
| `src/models/` | Data models for entities | Particle, creature, trait models |
| `docs/` | Documentation for architecture and guides | `overview.md`, `data_flows.md`, `development.md` |
| `tests/` | Unit and integration tests | `rngSystem.test.ts`, `creatureGeneration.test.ts` |
| `traits/` | Trait definitions for game mechanics | `abilities/`, `formations/`, `behaviors/` |

This structure supports the project’s domain-driven design, with `src/services/` handling core logic, `src/components/` managing UI, and `docs/` providing developer guidance. The `traits/` directory organizes game-specific definitions, enhancing modularity.

#### Coding Standards
Consistent coding standards ensure maintainability and quality, as inferred from code examples in `docs/integration_points.md` and `docs/rng_system.md`.

##### Naming Conventions
- **Classes and Interfaces**: PascalCase, descriptive (e.g., `BitcoinService`, `IParticle`).
- **Functions and Methods**: camelCase, verb-noun structure (e.g., `fetchBlockData`, `applyTraitsToGroup`).
- **Variables**: camelCase, meaningful names (e.g., `blockNumber`, `particleCount`).
- **Constants**: UPPER_CASE for global constants (e.g., `MAX_PARTICLES = 500`).
- **Files**: camelCase for services and utilities (e.g., `bitcoinService.ts`), PascalCase for components (e.g., `ParticleRenderer.tsx`).

**Example**:
```typescript
// src/services/bitcoin/bitcoinService.ts
class BitcoinService {
  private apiBaseUrl = 'https://ordinals.com';
  async fetchBlockData(blockNumber: number): Promise<IBlockData> {
    const response = await fetch(`${this.apiBaseUrl}/r/blockinfo/${blockNumber}`);
    const data = await response.json();
    return { nonce: data.nonce, confirmations: data.confirmations };
  }
}
```

##### Code Formatting
- **ESLint**: Configured in `.eslintrc.json`, enforces rules for TypeScript and React. Run `npm run lint` to check for issues and `npm run lint:fix` to auto-fix.
- **Prettier**: Configured in `.prettierrc`, ensures consistent formatting (e.g., 2-space indentation, single quotes). Run `npm run format` to apply formatting.
- **Scripts**:
  ```bash
  npm run lint
  npm run format
  ```

##### TypeScript Best Practices
- **Strict Typing**: Enable `strict: true` in `tsconfig.json` to catch type errors.
- **Interfaces**: Define interfaces for all data structures in `src/types/` (e.g., `IBlockData`, `IParticle`).
- **Avoid `any`**: Use specific types to ensure type safety.
- **Type Annotations**: Include for function parameters and return types.

**Example**:
```typescript
// src/types/IParticle.ts
export interface IParticle {
  id: string;
  position: [number, number, number];
  role: 'CORE' | 'CONTROL' | 'ATTACK' | 'DEFENSE' | 'MOVEMENT';
  visualTraits: { color: string; glow: number };
}

// src/services/particles/particleGroupFactory.ts
function createGroup(particleCount: number, stream: () => number): IParticle[] {
  // Implementation
}
```

#### Dependency Management
Dependencies are critical for the project’s functionality, as listed in `package.json` and referenced in `docs/references/dependencies.md`.

##### Key Dependencies
| Package | Version | Role |
|---------|---------|------|
| react | 18.2.0 | Core UI framework |
| react-dom | 18.2.0 | DOM rendering for React |
| three | 0.162.0 | 3D rendering for particles |
| @react-three/fiber | ^8.13.7 | React-Three.js integration |
| @react-three/drei | ^9.88.17 | Three.js utilities |
| typedi | ^0.10.0 | Dependency injection |
| zustand | ^4.5.2 | State management |
| howler | ^2.2.4 | Audio effects |
| gsap | ^3.12.7 | Animations |
| @emotion/react | ^11.14.0 | CSS-in-JS styling |
| @mui/material | ^6.4.7 | Material-UI components |
| @nextui-org/react | ^2.6.11 | Additional UI components |
| framer-motion | ^12.5.0 | Motion animations |

##### Development Dependencies
| Package | Version | Role |
|---------|---------|------|
| @typescript-eslint/eslint-plugin | ^7.1.1 | TypeScript linting |
| @typescript-eslint/parser | ^7.1.1 | TypeScript parsing |
| @vitejs/plugin-react | ^4.3.4 | Vite React plugin |
| jest | ^29.5.14 | Testing framework |
| @testing-library/react | ^14.1.2 | React component testing |
| eslint | ^8.57.0 | Linting |
| prettier | ^3.0.0 | Code formatting |
| tailwindcss | ^3.4.17 | CSS framework |
| vite | ^5.1.5 | Build and dev server |

##### Managing Dependencies
- **Adding Dependencies**: Use `npm install <package>` for production or `npm install --save-dev <package>` for development. Update `package.json` and verify compatibility.
- **Updating Dependencies**: Run `npm update` to update to compatible versions, checking for breaking changes.
- **Documentation**: Record new dependencies in `docs/references/dependencies.md` with version and purpose.

**Example**:
```bash
npm install lodash
# Update package.json and docs/references/dependencies.md
```

#### Testing
Testing ensures the reliability of the project’s deterministic logic, especially for the RNG system and on-chain data processing.

##### Testing Framework
- **Jest**: Configured for TypeScript and React, with settings in `jest.config.js`.
- **React Testing Library**: Used for component testing, ensuring UI reliability.
- **Coverage**: Generate coverage reports with `npm run test:coverage`.

##### Running Tests
- Run all tests: `npm run test`
- Run specific tests: `npm run test <file-pattern>` (e.g., `npm run test rngSystem`)
- Generate coverage: `npm run test:coverage`

##### Writing Tests
- **Unit Tests**: Test individual functions or classes in `tests/unit/`. Focus on services (e.g., `rngSystem.ts`, `bitcoinService.ts`).
- **Integration Tests**: Test system interactions in `tests/integration/` (e.g., creature generation pipeline).
- **Naming Convention**: Use `<filename>.test.ts` for clarity.
- **Structure**: Follow Arrange-Act-Assert pattern, using Jest’s `describe`, `test`, and `expect`.

**Example**:
```typescript
// tests/unit/bitcoinService.test.ts
import { BitcoinService } from '../../src/services/bitcoin/bitcoinService';

describe('BitcoinService', () => {
  test('fetches block data correctly', async () => {
    const service = new BitcoinService();
    const data = await service.fetchBlockData(800000);
    expect(data).toHaveProperty('nonce');
    expect(data).toHaveProperty('confirmations');
  });
});
```

##### Best Practices
- Write tests for all new features and bug fixes.
- Ensure 80%+ code coverage for critical systems (RNG, Bitcoin integration, evolution).
- Mock external APIs (e.g., ordinals.com) using Jest mocks.
- Test edge cases (e.g., invalid block numbers, API failures).

#### Contribution Guidelines
The contribution process is detailed in [CONTRIBUTING.md](https://github.com/BTCEnoch/Protozoa/blob/main/CONTRIBUTING.md), ensuring collaborative and high-quality development.

##### Guidelines
- **Code Style**: Follow naming conventions, ESLint, and Prettier rules.
- **Pull Requests**: Create PRs with clear titles, descriptions, and links to issues. Example: `Add caching to BitcoinService (#123)`.
- **Issues**: Use GitHub Issues for bugs, features, and questions. Label appropriately (e.g., `bug`, `enhancement`).
- **Reviews**: PRs require at least one approval from a maintainer. Address feedback promptly.
- **Commits**: Use descriptive messages following the Conventional Commits format (e.g., `feat: add mutation logging`, `fix: handle API errors`).

##### Contribution Process
1. Fork the repository and create a branch: `git checkout -b feat/<feature-name>`.
2. Implement changes, write tests, and ensure `npm run lint` and `npm run test` pass.
3. Commit changes: `git commit -m "feat: add new trait type"`.
4. Push to your fork: `git push origin feat/<feature-name>`.
5. Open a PR against the `main` branch, referencing relevant issues.
6. Respond to review comments and update the PR as needed.
7. Merge once approved, ensuring the CI pipeline passes.

##### Example PR Description
```
**Title**: Add Error Handling to BitcoinService

**Issue**: #123

**Description**:
- Added try-catch blocks to handle API failures.
- Implemented mock data fallback for testing.
- Updated tests in `bitcoinService.test.ts`.

**Checklist**:
- [x] Tests pass
- [x] Linting passes
- [x] Documentation updated
```

#### Optimization and Performance
Performance is critical for rendering 500 particles in real-time and ensuring efficient on-chain data processing.

##### Three.js Rendering Optimization
- **Instanced Rendering**: Use `InstancedMesh` to render 500 particles with a single draw call, reducing GPU overhead.
- **Level of Detail (LOD)**: Implement LOD to reduce polygon count for distant particles, improving frame rates.
- **Custom Shaders**: Optimize fragment shaders for visual effects while maintaining performance.
- **Instanced Rendering**: Use `InstancedMesh` to render 500 particles efficiently with a single draw call.
  ```typescript
  // src/components/ParticleRenderer/ParticleRenderer.tsx
  import * as THREE from 'three';

  const geometry = new THREE.SphereGeometry(1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.InstancedMesh(geometry, material, 500);
  scene.add(mesh);
  ```
- **Level of Detail (LOD)**: Reduce complexity for distant particles using `@react-three/drei`’s `<LOD>` component.
  ```typescript
  import { LOD } from '@react-three/drei';

  function Particle() {
    return (
      <LOD>
        <mesh distance={0}><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color="white" /></mesh>
        <mesh distance={50}><sphereGeometry args={[1, 16, 16]} /><meshBasicMaterial color="white" /></mesh>
        <mesh distance={100}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="white" /></mesh>
      </LOD>
    );
  }
  ```
- **Shader Optimization**: Write efficient shaders, minimizing calculations.
  ```glsl
  // Vertex Shader
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

  // Fragment Shader
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }
  ```
- **Scene Management**: Use frustum culling to skip rendering off-screen particles.

#### Computation Optimizations
- **Web Workers**: Offload physics or RNG to workers for smooth performance.
  ```typescript
  // src/workers/physicsWorker.ts
  self.onmessage = (event) => {
    const { particles, delta } = event.data;
    const updatedParticles = updatePhysics(particles, delta);
    self.postMessage(updatedParticles);
  };

  // src/components/ParticleRenderer/ParticleRenderer.tsx
  const worker = new Worker(new URL('../../workers/physicsWorker.ts', import.meta.url));
  worker.postMessage({ particles, delta });
  worker.onmessage = (event) => { particles = event.data; };
  ```
- **Efficient Data Structures**: Use `Float32Array` for particle data.
  ```typescript
  const positions = new Float32Array(500 * 3); // x, y, z for 500 particles
  ```
- **Minimize Main Thread Work**: Batch updates and use `requestAnimationFrame`.

#### On-Chain Considerations
- **Bundle Size**: Reduce size with code splitting and tree shaking.
- **Determinism**: Use `RNGSystem` exclusively for consistent on-chain logic.

#### Performance Monitoring
- **Three.js Stats**: Monitor FPS.
  ```typescript
  import Stats from 'three/examples/jsm/libs/stats.module.js';

  const stats = new Stats();
  document.body.appendChild(stats.dom);
  // In render loop
  stats.update();
  ```
- **Browser DevTools**: Profile with Chrome’s Performance tab.
- **Custom Benchmarks**: Test rendering under load if needed.

### Environment Variables
Configure settings in a `.env` file with the `VITE_` prefix.

**Example `.env`**:
```
VITE_API_URL=https://ordinals.com/r/blockinfo
VITE_DEBUG_MODE=true
```

**Accessing Variables**:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_DEBUG_MODE === 'true';
```

**Best Practices**:
- Keep sensitive data out of version control.
- Document variables in `docs/references/environment.md`.

### Debugging
Use these tools and techniques for effective debugging:
- **React DevTools**: Inspect components and state.
- **Three.js Inspector**: Debug 3D scenes ([Chrome Extension](https://chrome.google.com/webstore/detail/threejs-inspector/dnhlngfnlpeimkgnajojkggcdjenoelo)).
- **Console Logging**: Trace issues with `console.log`, remove in production.
- **Error Handling**: Catch and log errors.
  ```typescript
  try {
    const data = await fetchBlockData(blockNumber);
  } catch (error) {
    console.error(`Error fetching block ${blockNumber}:`, error);
  }
  ```
- **API Debugging**: Use DevTools’ Network tab to inspect requests.

### Additional Resources
- **Internal Docs**:
  - [Architecture Overview](architecture-overview.md)
  - [Data Flows](architecture-data_flows.md)
  - [RNG System](architecture-rng_system.md)
  - [Trait System](systems-trait-trait_system.md)
  - [Particle System](systems-particle-particle_system.md)
  - [Evolution Mechanics](systems-evolution-evolution_tracker.md)
- **External Docs**:
  - [React](https://reactjs.org/docs/getting-started.html)
  - [Three.js](https://threejs.org/docs/)
  - [TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
  - [Vite](https://vitejs.dev/guide/)
  - [Jest](https://jestjs.io/docs/getting-started)
- **Community**:
  - [GitHub Issues](https://github.com/BTCEnoch/Protozoa/issues)
  - [GitHub Discussions](https://github.com/BTCEnoch/Protozoa/discussions)

---

This completes the `development.md` guide, providing clear, practical instructions for contributing to Bitcoin Protozoa, optimized for performance and on-chain deployment.