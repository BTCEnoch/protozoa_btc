Below is the full and complete document for **Phase 1: Planning and Setup** of the Bitcoin Protozoa project. This document is direct, descriptive, and aligns with the project's requirements, incorporating the migration from `old_src` to the new `src` directory. Subsequent phases (2-8) will follow a similar structure and will be queued up as requested.

---


# Phase 1: Planning and Setup

## Purpose
This document defines the initial phase of the Bitcoin Protozoa project, focusing on establishing the project scope, setting up the development environment, creating initial documentation, and preparing for the migration of code from `old_src` to the new `src` directory. It includes a checklist, migration tasks, PowerShell scripts, and references to ensure a consistent and automated setup process.

## Location
`docs/implementation_phases/phase_1_planning.md`

## Overview
Phase 1 lays the foundation for Bitcoin Protozoa by defining requirements (e.g., 500 particles, 60 FPS, deterministic RNG using Bitcoin block nonces, and a controller UI for testing traits, behaviors, and formations), initializing a TypeScript-based project with Vite and React, and setting up the GitHub repository (https://github.com/BTCEnoch/protozoa_btc). It prepares the new `src` directory structure using Domain-Driven Design (DDD) and plans the migration from the original codebase in `old_src`. Automation via PowerShell scripts ensures repeatability and efficiency.

## Checklist
- [ ] **Define Project Scope**:
  - Document key requirements: 500 particles, 60 FPS, deterministic RNG with block nonce, controller UI for testing.
  - **Acceptance Criteria**: Requirements documented in `docs/architecture/overview.md` and approved.
- [ ] **Set Up Git Repository**:
  - Initialize repository and configure `.gitignore` for `node_modules`, `dist`, `.env`, and `old_src`.
  - **Acceptance Criteria**: Repository live at https://github.com/BTCEnoch/protozoa_btc with initial commit.
- [ ] **Initialize Project**:
  - Set up TypeScript project with Vite and React, configure `package.json` scripts (`build`, `dev`, `test`).
  - **Acceptance Criteria**: `npm run dev` launches a functional development server.
- [ ] **Install Dependencies**:
  - Install core libraries: Three.js, React, Jest, fake-indexeddb, TypeScript, ESLint, Prettier, Husky.
  - **Acceptance Criteria**: `npm install` succeeds, dependencies listed in `package.json`.
- [ ] **Create DDD Directory Structure**:
  - Establish `src/domains/`, `src/shared/`, `tests/unit/`, `tests/integration/`, `docs/`.
  - **Acceptance Criteria**: Structure matches `docs/references/directory_map.md`.
- [ ] **Draft Initial Documentation**:
  - Create `docs/architecture/overview.md`, `docs/references/dependencies.md`, `docs/references/directory_map.md`, `docs/references/coding_standards.md`.
  - **Acceptance Criteria**: Documents contain initial content and are committed.
- [ ] **Configure Linting and Formatting**:
  - Set up ESLint (TypeScript rules), Prettier, and Husky pre-commit hooks.
  - **Acceptance Criteria**: `npm run lint` and `npm run format` pass without errors.

## Migration Tasks
- [ ] **Prepare New `src` Directory**:
  - Create `src` with DDD subdirectories: `domains/`, `shared/`, `lib/`, `interfaces/`.
  - **Acceptance Criteria**: Directory structure created and verified.
- [ ] **Plan Code Migration**:
  - Analyze `old_src` to identify systems (e.g., RNG, physics, traits) for migration in later phases.
  - Draft `docs/implementation_phases/migration_plan.md` with phase-wise tasks.
  - **Acceptance Criteria**: Migration plan documented and prioritized.

## Documentation References
- `docs/architecture/overview.md`: Project scope and architectural overview.
- `docs/references/directory_map.md`: DDD directory structure.
- `docs/references/dependencies.md`: List of required tools and libraries.
- `docs/references/coding_standards.md`: Coding guidelines and standards.

## PowerShell Scripts
Scripts are stored in `docs/implementation_phases/scripts/phase_1/` and automate setup and migration preparation.

1. **setup_project.ps1**:
   - **Purpose**: Initializes Git repository, sets up Vite with TypeScript and React.
   - **Content**:
     ```powershell
     git init
     git remote add origin https://github.com/BTCEnoch/protozoa_btc.git
     echo "node_modules\n/dist\n.env\nold_src" > .gitignore
     git add .gitignore
     git commit -m "Initial commit"

     npm create vite@latest protozoa -- --template react-ts
     cd protozoa
     npm install

     $packageJson = Get-Content package.json | ConvertFrom-Json
     $packageJson.scripts += @{ lint = "eslint src/**/*.{ts,tsx}"; format = "prettier --write src/**/*.{ts,tsx,md}"; test = "jest" }
     $packageJson | ConvertTo-Json | Set-Content package.json
     ```
   - **Execution**: `.\setup_project.ps1`

2. **init_docs.ps1**:
   - **Purpose**: Creates `docs/` structure and initial documentation files.
   - **Content**:
     ```powershell
     $dirs = @("docs/architecture", "docs/references", "docs/systems", "docs/implementation_phases")
     foreach ($dir in $dirs) {
         New-Item -ItemType Directory -Path $dir -Force
     }

     Set-Content -Path "docs/architecture/overview.md" -Value "# Overview\nProject scope and architecture details."
     Set-Content -Path "docs/references/dependencies.md" -Value "# Dependencies\nList of tools and libraries."
     Set-Content -Path "docs/references/directory_map.md" -Value "# Directory Map\nDDD structure."
     Set-Content -Path "docs/references/coding_standards.md" -Value "# Coding Standards\nGuidelines."
     ```
   - **Execution**: `.\init_docs.ps1`

3. **install_deps.ps1**:
   - **Purpose**: Installs dependencies and configures linting/formatting tools.
   - **Content**:
     ```powershell
     npm install --save-dev typescript vite @vitejs/plugin-react three react react-dom jest @types/jest ts-jest eslint prettier husky fake-indexeddb @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react

     echo '{ "extends": ["plugin:@typescript-eslint/recommended", "plugin:react/recommended"], "rules": { "no-unused-vars": "error" } }' > .eslintrc.json
     echo '{ "semi": true, "trailingComma": "es5", "singleQuote": true, "tabWidth": 2 }' > .prettierrc
     npm pkg set scripts.prepare="husky install"
     npx husky-init
     echo "npm run lint && npm run test" > .husky/pre-commit
     ```
   - **Execution**: `.\install_deps.ps1`

4. **setup_src.ps1**:
   - **Purpose**: Creates the new `src` directory with DDD structure.
   - **Content**:
     ```powershell
     $domains = @("rng", "creature", "traits", "mutation", "visualization", "input", "gameTheory")
     foreach ($domain in $domains) {
         New-Item -ItemType Directory -Path "src/domains/$domain/services" -Force
         New-Item -ItemType Directory -Path "src/domains/$domain/interfaces" -Force
     }

     New-Item -ItemType Directory -Path "src/shared/services" -Force
     New-Item -ItemType Directory -Path "src/shared/lib" -Force
     New-Item -ItemType Directory -Path "src/shared/interfaces" -Force
     ```
   - **Execution**: `.\setup_src.ps1`

## Dependencies
- **Node.js**: v18+ (npm and Vite).
- **npm**: v8+ (package management).
- **Git**: Repository setup.
- **PowerShell**: v5.1+ (script execution).
- **VS Code**: Recommended IDE with ESLint/Prettier extensions.

## Milestones
- Development environment functional (`npm run dev` works).
- Git repository initialized and accessible.
- Initial documentation drafted in `docs/`.
- New `src` directory established with DDD structure.
- Migration plan outlined for `old_src` to `src`.



---
