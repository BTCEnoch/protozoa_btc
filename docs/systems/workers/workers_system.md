# Workers System

## Purpose
This document provides an overview of the workers system in Bitcoin Protozoa, which offloads computationally intensive tasks from the main thread to Web Workers, ensuring smooth rendering and UI responsiveness for creatures with up to 500 particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/workers/workers_system.md`

## Overview
The workers system leverages Web Workers to perform tasks such as physics calculations, game theory simulations, and storage operations off-thread, maintaining real-time performance (60 FPS, < 5ms main thread updates) [Timestamp: April 14, 2025, 19:58]. Implemented in the `workers` domain with services like `workerBridge.ts`, `forceWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`, it ensures deterministic task execution and efficient data transfer using `Transferable` objects. The system integrates with physics (`particleService.ts`), storage (`StorageService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`), supporting seamless gameplay. This document outlines the system’s architecture, components, integration points, and performance goals, providing a foundation for detailed workers system documentation, building on our discussions about performance optimization and modularity [Timestamp: April 15, 2025, 21:23].

## Architecture
The workers system is designed for modularity, scalability, and performance, using Web Workers to isolate compute-heavy tasks from the main thread. Key components include:

- **Worker Bridge (`workerBridge.ts`)**:
  - Manages worker instantiation, task dispatching, and communication between the main thread and workers.
  - Uses a worker pool to minimize instantiation overhead.
- **Physics Workers (`forceWorker.ts`, `positionWorker.ts`)**:
  - Handle force calculations (e.g., attraction, repulsion, spring forces) and position updates for particle dynamics [Timestamp: April 8, 2025, 19:50].
- **Compute Worker (`computeWorker.ts`)**:
  - Processes general computations, such as game theory payoff matrices or evolution trigger evaluations.
- **Storage Worker (`storageWorker.ts`)**:
  - Offloads batch IndexedDB writes for state persistence, reducing main thread I/O [Timestamp: April 16, 2025, 21:41].
- **Event Bus Integration**:
  - Coordinates task results with other systems via `eventBus.ts`, ensuring seamless updates.
- **Integration Layer**:
  - Connects worker outputs to `particleService.ts` for physics, `StorageService.ts` for persistence, `inputService.ts` for UI updates, and `payoffMatrixService.ts` for strategic outcomes.

### Data Flow
1. **Task Request**: A service (e.g., `particleService.ts`, `gameTheoryStrategyService.ts`) requests a task (e.g., calculate forces, simulate battle) via `workerBridge.ts`.
2. **Worker Dispatch**: `workerBridge.ts` assigns the task to an available worker (e.g., `forceWorker.ts`), passing data via `postMessage`.
3. **Task Execution**: The worker processes the task (e.g., physics calculations) and returns results using `postMessage`, often with `Transferable` objects (e.g., `Float32Array`) for efficiency.
4. **Result Handling**: `workerBridge.ts` resolves the task promise, passing results to the requesting service.
5. **System Update**: Results update relevant systems (e.g., rendering, evolution, UI), ensuring real-time feedback.

## Key Features
- **Deterministic Execution**: Workers use static inputs or block nonce-seeded RNG, ensuring consistent results [Timestamp: April 12, 2025, 12:18].
- **High Performance**:
  - Offloads tasks to maintain < 5ms main thread updates and 60 FPS.
  - Uses worker pooling and efficient data transfer to minimize overhead.
- **Task Scalability**:
  - Supports multiple worker types (physics, compute, storage) for diverse tasks.
  - Scales to handle 500 particles across multiple creatures.
- **Modular Design**: Encapsulated workers (e.g., `forceWorker.ts`) with clear task interfaces, aligning with DDD principles [Timestamp: April 15, 2025, 21:23].
- **Cross-System Integration**: Seamlessly connects with physics, storage, input, and game theory for cohesive gameplay.

## Components
1. **Worker Bridge (`workerBridge.ts`)**:
   - Coordinates worker creation, task assignment, and result handling.
   - Inputs: Task type, data payload.
   - Outputs: Task results via promises.
2. **Force Worker (`forceWorker.ts`)**:
   - Computes attraction, repulsion, and spring forces for particle dynamics.
   - Inputs: `IParticle[]`, `IFormationPattern[]`, `deltaTime`.
   - Outputs: Force vectors (`Float32Array`).
3. **Position Worker (`positionWorker.ts`)**:
   - Updates particle positions and velocities using Euler integration.
   - Inputs: `IParticle[]`, force vectors, `deltaTime`.
   - Outputs: Updated `IParticle[]`.
4. **Compute Worker (`computeWorker.ts`)**:
   - Handles general computations (e.g., payoff matrices, evolution triggers).
   - Inputs: Task-specific data (e.g., creature states, block data).
   - Outputs: Computed results (e.g., battle scores, trigger flags).
5. **Storage Worker (`storageWorker.ts`)**:
   - Performs batch IndexedDB writes for state persistence.
   - Inputs: Store name, data array.
   - Outputs: Write confirmation.
6. **Event Bus (`eventBus.ts`)**:
   - Distributes worker results to other systems (e.g., UI updates, state changes).
   - Inputs: Worker result events.
   - Outputs: System-specific actions.

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `workerBridge.ts` coordinates tasks, with `forceWorker.ts`, `positionWorker.ts`, `computeWorker.ts`, and `storageWorker.ts` executing specific computations.
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` uses physics workers for force and position updates [Timestamp: April 8, 2025, 19:50].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` offloads batch writes to `storageWorker.ts` [Timestamp: April 16, 2025, 21:41].
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers worker tasks (e.g., battle simulations) via user inputs.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses `computeWorker.ts` for battle calculations.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes worker-driven updates (e.g., particle positions).
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` processes worker results for state updates.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding [Timestamp: April 12, 2025, 12:18].

## Performance Goals
- **Task Execution Time**: < 5ms for worker tasks (e.g., physics calculations for 500 particles).
- **Main Thread Impact**: < 1ms for task dispatching and result handling, maintaining 60 FPS.
- **FPS Stability**: ≥ 60 FPS during worker execution and rendering.
- **CPU Usage**: < 15% CPU usage for worker tasks on mid-range devices.
- **Memory Usage**: < 10 MB for worker data buffers and communication.

## Rules Adherence
- **Determinism**: Workers use static inputs or seeded RNG, ensuring consistent outcomes [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Task logic is encapsulated in dedicated workers, with clear interfaces via `workerBridge.ts` [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 5ms task execution and minimal main thread impact, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports physics, storage, input, and game theory, enhancing real-time gameplay.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate computation-related code (e.g., in `src/creatures/` or `src/lib/`), likely main-thread-based or scattered.
2. **Refactor into Workers**: Move physics calculations to `forceWorker.ts` and `positionWorker.ts`, game theory to `computeWorker.ts`, and storage operations to `storageWorker.ts`.
3. **Implement Worker Bridge**: Create `workerBridge.ts` to manage worker communication and pooling.
4. **Integrate with Systems**: Update `particleService.ts`, `StorageService.ts`, and `gameTheoryStrategyService.ts` to use workers via `workerBridge.ts`.
5. **Test System**: Validate worker execution, determinism, and performance with Jest tests, targeting < 5ms tasks and 60 FPS, using Chrome DevTools for profiling.

## Example Integration
```typescript
// src/domains/workers/services/workerBridge.ts
import { Singleton } from 'typescript-singleton';
import { logger } from 'src/shared/services/LoggerService';

class WorkerBridge extends Singleton {
  private workerPool: { [type: string]: Worker[] } = {};
  private readonly MAX_WORKERS = 4;

  async sendMessage(workerType: string, data: any): Promise<any> {
    const start = performance.now();
    if (!this.workerPool[workerType]) this.workerPool[workerType] = [];
    let worker = this.workerPool[workerType].pop();
    if (!worker && this.workerPool[workerType].length < this.MAX_WORKERS) {
      worker = new Worker(new URL(`./${workerType}Worker.ts`, import.meta.url));
    }
    if (!worker) {
      worker = this.workerPool[workerType][0]; // Reuse oldest worker
    }
    return new Promise((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        this.workerPool[workerType].push(worker); // Return to pool
        logger.debug(`Worker task ${workerType} completed in ${performance.now() - start}ms`);
        resolve(e.data);
      };
      worker.onerror = (e: ErrorEvent) => {
        logger.error(`Worker error: ${e.message}`);
        reject(e);
      };
      worker.postMessage(data, [data.buffer].filter(Boolean));
    });
  }
}

export const workerBridge = WorkerBridge.getInstance();
```

```typescript
// src/domains/creature/services/particleService.ts
import { workerBridge } from 'src/domains/workers/services/workerBridge';
import { formationService } from 'src/domains/traits/services/formationService';
import { logger } from 'src/shared/services/LoggerService';

class ParticleService {
  async updatePhysics(particles: IParticle[], deltaTime: number): Promise<IParticle[]> {
    const start = performance.now();
    const formationPatterns = formationService.getCurrentFormations(particles);
    const forces = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles, formationPatterns, deltaTime }
    });
    const updatedParticles = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles, forces, deltaTime }
    });
    logger.debug(`Physics update completed in ${performance.now() - start}ms`);
    return updatedParticles;
  }
}

export const particleService = new ParticleService();
```

