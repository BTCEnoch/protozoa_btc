
# Getting Started with Bitcoin Protozoa

## Introduction
Welcome to Bitcoin Protozoa, a particle-based life simulation that uses Bitcoin block data to generate unique creatures, built with React, Three.js, and TypeScript. This guide will help you set up your development environment, run the project locally, and start exploring or contributing to the codebase. Whether you're a beginner or an experienced developer, these steps will get you up and running quickly.

## Prerequisites
Before you begin, ensure your computer has the following tools installed:
- **Node.js**: Version 18 or higher. Download it from [nodejs.org](https://nodejs.org/). This powers the JavaScript runtime and package management.
- **Git**: For version control and cloning the repository. Install it from [git-scm.com](https://git-scm.com/).
- **Text Editor**: We recommend Visual Studio Code (VS Code) with extensions like ESLint, Prettier, and TypeScript support for a smooth coding experience.

Verify installations by running:
```bash
node --version  # Should output v18.x.x or higher
git --version  # Should output git version x.x.x
```

## Step 1: Clone the Repository
Get the Bitcoin Protozoa source code from its GitHub repository:
```bash
git clone https://github.com/BTCEnoch/Protozoa.git
cd Protozoa
```
This downloads the project files into a `Protozoa` folder and navigates you into it.

## Step 2: Install Dependencies
Install the required software packages using npm, Node.js's package manager:
```bash
npm install
```
This command reads `package.json` and installs libraries like React, Three.js, and development tools such as Vite and Jest. It may take a few minutes depending on your internet speed.

## Step 3: Run the Project Locally
Start the development server to see Bitcoin Protozoa in action:
```bash
npm run dev
```
This launches a Vite-based server. Open your browser and go to `http://localhost:5173` (the default port). You should see the application running, displaying a 3D simulation of particles influenced by Bitcoin block data. The server supports hot reloading, so changes you make to the code will update live in the browser.

## Step 4: Explore the Project Structure
The project is organized into clear directories to help you navigate and contribute:
- **`src/`**: Contains the source code.
  - `components/`: React components for the user interface (e.g., `ParticleRenderer.tsx`).
  - `services/`: Business logic (e.g., `bitcoinService.ts` for fetching block data).
  - `lib/`: Utility functions (e.g., `rngSystem.ts` for random number generation).
- **`docs/`**: Documentation, including this guide and architecture details.
- **`tests/`**: Test files to ensure code reliability.
- **`traits/`**: Definitions for creature traits and game mechanics.

For a detailed breakdown, check out `docs/directory_structure.md`.

## Step 5: Make Your First Change
Try modifying the project to get familiar with it:
1. Open `src/components/ParticleRenderer.tsx` in your text editor.
2. Find a line setting the particle color (e.g., `color: 'red'`).
3. Change it to another color, like `color: 'blue'`.
4. Save the file, and watch the browser update automatically.

This small tweak adjusts the 3D visuals, showing how React and Three.js work together in the project.

## Step 6: Build for Production (Optional)
To create an optimized version of the project for deployment:
```bash
npm run build
```
The output will be in the `dist/` folder, ready for hosting on a static server like Vercel or Netlify.

## Next Steps
- **Learn More**: Read `docs/development.md` for detailed coding guidelines, testing, and contribution instructions.
- **Contribute**: Check `CONTRIBUTING.md` on [GitHub](https://github.com/BTCEnoch/Protozoa/blob/main/CONTRIBUTING.md) to submit changes or fixes.
- **Experiment**: Try fetching a different Bitcoin block number via the UI and see how it affects the simulation.

## Troubleshooting
- **"Command not found"**: Ensure Node.js and Git are installed and added to your system PATH.
- **Port in use**: If `5173` is busy, Vite will suggest another port (e.g., `5174`).
- **Errors on `npm install`**: Delete `node_modules/` and `package-lock.json`, then rerun `npm install`.

Enjoy building with Bitcoin Protozoa!

