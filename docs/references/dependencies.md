Below is the populated `dependencies.md` document, tailored to document the transition from the current GitHub structure to the new structure for the Bitcoin Protozoa project. It provides a single source of truth for dependency management and outlines the migration steps as requested.


# Dependencies

## Overview
This document outlines all external dependencies for the Bitcoin Protozoa project, serving as a single source of truth for understanding reliance on third-party libraries, frameworks, and tools. It includes dependency details, management practices, and steps to transition from the current GitHub structure to a new, restructured build while maintaining compatibility and documentation.

## Dependencies List
Below is a comprehensive table of external dependencies currently used in the project, including their versions, purposes, and licenses:

| Dependency                  | Version  | Purpose                           | License         |
|-----------------------------|----------|-----------------------------------|-----------------|
| react                       | 18.2.0   | Frontend framework for UI         | MIT             |
| react-dom                   | 18.2.0   | DOM rendering for React           | MIT             |
| three                       | 0.162.0  | 3D rendering library              | MIT             |
| @react-three/fiber          | ^8.13.7  | React integration for Three.js    | MIT             |
| @react-three/drei           | ^9.88.17 | Three.js utilities for React      | MIT             |
| typedi                      | ^0.10.0  | Dependency injection              | MIT             |
| zustand                     | ^4.5.2   | State management                  | MIT             |
| howler                      | ^2.2.4   | Audio management                  | MIT             |
| gsap                        | ^3.12.7  | Animations                        | Standard GSAP License |
| @emotion/react              | ^11.14.0 | CSS-in-JS for styling             | MIT             |
| @mui/material               | ^6.4.7   | Material-UI components            | MIT             |
| @nextui-org/react           | ^2.6.11  | UI components                     | MIT             |
| framer-motion               | ^12.5.0  | Motion animations                 | MIT             |
| @typescript-eslint/eslint-plugin | ^7.1.1 | TypeScript linting                | MIT             |
| @typescript-eslint/parser   | ^7.1.1   | TypeScript parsing for ESLint     | BSD-2-Clause    |
| @vitejs/plugin-react        | ^4.3.4   | React plugin for Vite             | MIT             |
| jest                        | ^29.5.14 | Testing framework                 | MIT             |
| @testing-library/react      | ^14.1.2  | React testing utilities           | MIT             |
| eslint                      | ^8.57.0  | Linting tool                      | MIT             |
| prettier                    | ^3.0.0   | Code formatting                   | MIT             |
| tailwindcss                 | ^3.4.17  | CSS framework                     | MIT             |
| vite                        | ^5.1.5   | Build tool                        | MIT             |

## Dependency Management
Dependencies are managed using npm and tracked in the `package.json` file. To add a new dependency:
1. Install it with `npm install <package-name>` for production dependencies or `npm install --save-dev <package-name>` for development dependencies.
2. Update `package.json` to reflect the new dependency.
3. Verify compatibility with existing dependencies.
4. Document the dependency in this file, noting its version, purpose, and license.

## License Compliance
The Bitcoin Protozoa project uses the MIT License. All listed dependencies are open-source and compatible with this license, or their licenses (e.g., BSD-2-Clause, Standard GSAP License) permit use in MIT-licensed projects.

## Migration Steps
To transition from the current GitHub structure to the new structure:
1. **Identify Existing Dependencies**: Review the `package.json` file in the current GitHub repository to confirm the baseline dependencies.
2. **Update Dependency Versions**: Check for updates to the listed dependencies, ensuring compatibility with the new structure and project requirements.
3. **Document New Dependencies**: If the new structure introduces additional dependencies, add them to this document with their version, purpose, and license.
4. **Test Compatibility**: After updating or adding dependencies, run tests to ensure all libraries work together seamlessly in the restructured build.

This document ensures transparency and consistency in dependency management, facilitating a smooth transition to the new project structure while maintaining a reliable, documented foundation.
