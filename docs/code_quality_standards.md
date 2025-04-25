# Code Quality Standards

This document outlines the code quality standards for the Bitcoin Protozoa project.

## Table of Contents

1. [TypeScript Configuration](#typescript-configuration)
2. [ESLint Rules](#eslint-rules)
3. [Prettier Configuration](#prettier-configuration)
4. [Pre-commit Hooks](#pre-commit-hooks)
5. [VSCode Integration](#vscode-integration)
6. [Scripts](#scripts)
7. [Best Practices](#best-practices)

## TypeScript Configuration

We use a strict TypeScript configuration to catch potential issues early:

- `strict: true`: Enables all strict type checking options
- `noImplicitAny: true`: Raise error on expressions and declarations with an implied 'any' type
- `strictNullChecks: true`: Enable strict null checks
- `strictFunctionTypes: true`: Enable strict checking of function types
- `strictBindCallApply: true`: Enable strict 'bind', 'call', and 'apply' methods on functions
- `strictPropertyInitialization: true`: Ensure non-undefined class properties are initialized
- `noImplicitThis: true`: Raise error on 'this' expressions with an implied 'any' type
- `noUnusedLocals: true`: Report errors on unused locals
- `noUnusedParameters: true`: Report errors on unused parameters
- `noImplicitReturns: true`: Report error when not all code paths in function return a value
- `noFallthroughCasesInSwitch: true`: Report errors for fallthrough cases in switch statement
- `allowUnreachableCode: false`: Do not report errors on unreachable code

## ESLint Rules

Our ESLint configuration extends several recommended configurations:

- `eslint:recommended`
- `plugin:@typescript-eslint/recommended`
- `plugin:react/recommended`
- `plugin:react-hooks/recommended`
- `plugin:jest/recommended`
- `plugin:import/errors`
- `plugin:import/warnings`
- `plugin:import/typescript`
- `prettier`

Key custom rules include:

- Warning for `any` types
- Ignoring unused variables that start with underscore
- Enforcing import order
- Warning for console.log (except in tests)
- Enforcing strict equality (===)

## Prettier Configuration

We use Prettier for consistent code formatting:

- Single quotes for strings
- 100 character line width
- 2 space indentation
- No semicolons at the end of statements
- Trailing commas where valid
- No tabs, only spaces

## Pre-commit Hooks

We use Husky and lint-staged to enforce code quality on commit:

1. TypeScript type checking
2. ESLint on staged files
3. Prettier formatting on staged files
4. Running tests related to changed files

## VSCode Integration

VSCode settings are configured to:

- Format on save using Prettier
- Run ESLint fix on save
- Use workspace TypeScript version
- Set ruler at 100 characters
- Ensure consistent line endings (LF)
- Insert final newline
- Trim trailing whitespace

## Scripts

The following npm scripts are available:

- `npm run lint`: Run ESLint on the codebase
- `npm run lint:fix`: Run ESLint with auto-fix
- `npm run lint:strict`: Run ESLint with zero warnings allowed
- `npm run format`: Run Prettier to format the codebase
- `npm run format:check`: Check if files are formatted correctly
- `npm run type-check`: Run TypeScript type checking

## Best Practices

1. **Type Everything**: Avoid using `any` type whenever possible
2. **Use Interfaces**: Define interfaces for complex objects
3. **Functional Components**: Use functional components with hooks for React
4. **Immutability**: Prefer immutable data structures
5. **Error Handling**: Always handle errors and edge cases
6. **Testing**: Write tests for all new features
7. **Documentation**: Document complex functions and components
8. **Small Functions**: Keep functions small and focused
9. **Meaningful Names**: Use descriptive variable and function names
10. **Avoid Magic Numbers**: Use constants for magic numbers

## Enforcement

These standards are enforced through:

1. CI/CD pipeline checks
2. Pre-commit hooks
3. Code reviews
4. IDE integration

By following these standards, we ensure a consistent, maintainable, and high-quality codebase.
