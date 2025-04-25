# Contributing to Bitcoin Protozoa

Thank you for your interest in contributing to Bitcoin Protozoa! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)
8. [Project Structure](#project-structure)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/protozoa_btc.git
   cd protozoa_btc
   ```
3. Add the original repository as a remote:
   ```bash
   git remote add upstream https://github.com/BTCEnoch/protozoa_btc.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in your feature branch
2. Run tests to ensure your changes don't break existing functionality:
   ```bash
   npm run clean:mocks && npm test
   ```
3. Run linting and formatting checks:
   ```bash
   npm run lint
   npm run format:check
   ```
4. Fix any issues found by the linter or formatter:
   ```bash
   npm run lint:fix
   npm run format
   ```
5. Commit your changes with a descriptive commit message
6. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Create a pull request from your fork to the main repository

## Coding Standards

We follow strict coding standards to maintain code quality and consistency:

1. **TypeScript**: Use TypeScript for all new code
2. **Domain-Driven Design**: Follow the domain-driven design principles
3. **ESLint**: Follow the ESLint rules defined in `.eslintrc.js`
4. **Prettier**: Follow the Prettier formatting rules defined in `.prettierrc`
5. **Naming Conventions**:
   - Use PascalCase for class names, interfaces, and type aliases
   - Use camelCase for variables, functions, and methods
   - Use UPPER_CASE for constants
   - Use kebab-case for file names
6. **File Organization**:
   - Place code in the appropriate domain directory
   - Follow the established pattern for each domain (types, services, utils, etc.)

For more details, see the [Code Quality Standards](docs/code_quality_standards.md) document.

## Testing

All new code should include appropriate tests:

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test complete user flows

To run tests:

```bash
# Clean up duplicate mock files
npm run clean:mocks

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Documentation

Good documentation is essential for the project:

1. **Code Comments**: Add comments to explain complex logic
2. **JSDoc**: Use JSDoc comments for functions, classes, and interfaces
3. **README Files**: Update README files when adding new features
4. **Domain Documentation**: Add or update documentation in the `docs/` directory

## Pull Request Process

1. Ensure your code follows the coding standards
2. Ensure all tests pass
3. Update documentation as needed
4. Submit your pull request with a clear description of the changes
5. Address any feedback from code reviews
6. Once approved, your pull request will be merged

## Project Structure

The project follows a domain-driven design structure:

```
src/
├── domains/           # Domain-specific code
│   ├── bitcoin/       # Bitcoin blockchain integration
│   ├── creature/      # Creature management
│   ├── evolution/     # Evolution mechanics
│   ├── gameTheory/    # Game theory calculations
│   ├── group/         # Group management
│   ├── particle/      # Particle management
│   ├── physics/       # Physics calculations
│   ├── rendering/     # Rendering and visualization
│   ├── rng/           # Random number generation
│   ├── storage/       # Data persistence
│   ├── traits/        # Trait management
│   └── workers/       # Web worker functionality
├── shared/            # Shared code
│   ├── data/          # Shared data files
│   ├── events/        # Event system
│   ├── services/      # Shared services
│   ├── types/         # Shared type definitions
│   └── utils/         # Shared utility functions
├── tests/             # Test files
│   ├── e2e/           # End-to-end tests
│   ├── helpers/       # Test helpers
│   ├── integration/   # Integration tests
│   └── unit/          # Unit tests
└── ui/                # User interface components
    ├── components/    # React components
    ├── hooks/         # React hooks
    ├── pages/         # Page components
    └── store/         # State management
```

For more details, see the [Directory Map](docs/references/directory_map.md) document.

Thank you for contributing to Bitcoin Protozoa!
