
# Worker Management

## Purpose
This document details the worker management mechanisms in Bitcoin Protozoa’s workers system, which handle the creation, pooling, task dispatching, and termination of Web Workers to ensure efficient off-thread computation. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/workers/worker_management.md`

## Overview
Worker management is a core component of Bitcoin Protozoa’s workers system, orchestrating Web Workers to perform tasks like physics calculations (`forceWorker.ts`), game theory simulations (`computeWorker.ts`), and storage operations (`storageWorker.ts`) without blocking the main thread. Implemented in `workerBridge.ts` within the `workers` domain, it ensures deterministic task execution, low-latency dispatching (< 1ms), and optimal resource usage, maintaining 60 FPS for up to 500 particles [Timestamp: April 14, 2025, 19:58]. The system integrates with physics (`particleService.ts`), storage (`StorageService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines the worker management workflow, pooling strategies, task dispatching, and error handling, building on our discussions about performance optimization and modularity [Timestamp: April 15, 2025, 21:23; April 14, 2025, 19:58].

## Worker Management Workflow
The worker management workflow oversees the lifecycle of Web Workers, from creation to task execution and termination, ensuring efficient resource allocation.

### Workflow
1. **Worker Creation**:
   - `workerBridge.ts` creates a Web Worker instance for a specific task type (e.g., `forceWorker.ts`) when needed, using the `Worker` API with a module URL.
2. **Worker Pooling**:
   - Workers are stored in a pool (`workerPool`) by type, limited to a maximum (e.g., 4 per type) to balance performance and memory usage.
   - Idle workers are reused to avoid instantiation overhead.
3. **Task Dispatching**:
   - A service (e.g., `particleService.ts`) requests a task via `workerBridge.sendMessage`, specifying the worker type and data payload.
   - `workerBridge.ts` selects an available worker or reuses an existing one, sending the task via `postMessage` with `Transferable` objects for efficiency.
4. **Task Execution**:
   - The worker processes the task and returns results via `postMessage`, which `workerBridge.ts` resolves as a promise.
5. **Worker Retention or Termination**:
   - After task completion, the worker is returned to the pool for reuse or terminated if the pool is full or memory constraints apply.
6. **Error Handling**:
   - Worker errors (e.g., script errors, timeouts) are caught, logged, and propagated to the requesting service, ensuring graceful recovery.

### Worker Types
- **Force Worker (`forceWorker.ts`)**: Computes particle forces (e.g., attraction, repulsion, spring).
- **Position Worker (`positionWorker.ts`)**: Updates particle positions and velocities [Timestamp: April 8, 2025, 19:50].
- **Compute Worker (`computeWorker.ts`)**: Handles general computations (e.g., payoff matrices, evolution triggers).
- **Storage Worker (`storageWorker.ts`)**: Performs batch IndexedDB writes [Timestamp: April 16, 2025, 21:41].

### Pooling Strategy
- **Maximum Workers**: 4 per type (e.g., 4 `forceWorker.ts`, 4 `computeWorker.ts`) to limit memory usage.
- **Reuse Policy**: Idle workers are reused before creating new ones, reducing instantiation time (~10ms per worker).
- **Termination Policy**: Workers exceeding the pool limit or inactive for > 60s are terminated to free resources.
- **Dynamic Adjustment**: Pool size adjusts based on system load (e.g., reduce to 2 workers on low-end devices).

### Determinism
- Worker management is deterministic, using static task mappings and consistent worker selection logic [Timestamp: April 12, 2025, 12:18].
- Task execution within workers may use block nonce-seeded RNG (e.g., for game theory), but management operations (creation, dispatching) are predictable.

## Implementation
Worker management is implemented in `workerBridge.ts`, which coordinates worker lifecycle and task communication, with specific workers handling task logic.

### Example Code
#### Worker Bridge
```typescript
// src/domains/workers/services/workerBridge.ts
import { Singleton } from 'typescript-singleton';
import { logger } from 'src/shared/services/LoggerService';

class WorkerBridge extends Singleton {
  private workerPool: { [type: string]: Worker[] } = {};
  private readonly MAX_WORKERS = 4;
  private readonly IDLE_TIMEOUT = 60000; // 60s

  async sendMessage(workerType: string, data: any): Promise<any> {
    const start = performance.now();
    if (!this.workerPool[workerType]) this.workerPool[workerType] = [];
    let worker = this.workerPool[workerType].pop();
    if (!worker && this.workerPool[workerType].length < this.MAX_WORKERS) {
      worker = new Worker(new URL(`./${workerType}Worker.ts`, import.meta.url));
      logger.debug(`Created new ${workerType} worker`);
    }
    if (!worker) {
      worker = this.workerPool[workerType][0]; // Reuse oldest worker
      logger.debug(`Reusing existing ${workerType} worker`);
    }
    return new Promise((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        this.workerPool[workerType].push(worker); // Return to pool
        logger.debug(`Worker task ${workerType} completed in ${performance.now() - start}ms`);
        resolve(e.data);
      };
      worker.onerror = (e: ErrorEvent) => {
        logger.error(`Worker error: ${e.message}, File: ${e.filename}, Line: ${e.lineno}`);
        worker.terminate(); // Terminate faulty worker
        reject(e);
      };
      worker.postMessage(data, [data.buffer].filter(Boolean));
      // Set idle timeout
      setTimeout(() => {
        if (!this.workerPool[workerType].includes(worker)) {
          worker.terminate();
          logger.debug(`Terminated idle ${workerType} worker`);
        }
      }, this.IDLE_TIMEOUT);
    });
  }

  terminateAll() {
    Object.values(this.workerPool).forEach(pool => {
      pool.forEach(worker => worker.terminate());
    });
    this.workerPool = {};
    logger.debug('Terminated all workers');
  }
}

export const workerBridge = WorkerBridge.getInstance();
```

#### Example Worker Usage
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

## Performance Considerations
To ensure efficient worker management for 500 particles:
1. **Worker Pooling**: Reuse workers to avoid instantiation overhead, targeting < 1ms task dispatching.
2. **Limited Pool Size**: Cap at 4 workers per type to balance CPU and memory usage, adjustable for device capabilities.
3. **Efficient Data Transfer**: Use `Transferable` objects (e.g., `Float32Array`) to minimize communication latency.
4. **Idle Termination**: Terminate inactive workers after 60s to free resources, preventing memory leaks.
5. **Profiling**: Monitor task dispatching and worker execution times with Chrome DevTools, targeting < 5ms per task cycle [Timestamp: April 14, 2025, 19:58].

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `workerBridge.ts` manages workers, with `forceWorker.ts`, `positionWorker.ts`, `computeWorker.ts`, and `storageWorker.ts` executing tasks.
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` uses physics workers for force and position updates [Timestamp: April 8, 2025, 19:50].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` offloads batch writes to `storageWorker.ts` [Timestamp: April 16, 2025, 21:41].
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers worker tasks (e.g., battle simulations) via user inputs.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` uses `computeWorker.ts` for battle calculations.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes worker-driven updates.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` processes worker results for state updates.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding [Timestamp: April 12, 2025, 12:18].

## Rules Adherence
- **Determinism**: Worker management uses static task mappings, ensuring consistent dispatching [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Logic is encapsulated in `workerBridge.ts`, with clear interfaces [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms dispatching and < 5ms task execution, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports physics, storage, input, and game theory for efficient computation.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate computation-related code (e.g., in `src/creatures/` or `src/lib/`), likely main-thread-based.
2. **Refactor into Workers**: Move logic to `forceWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`, managed by `workerBridge.ts`.
3. **Implement Pooling**: Add worker pooling and idle termination to `workerBridge.ts`.
4. **Integrate with Systems**: Update `particleService.ts`, `StorageService.ts`, and `gameTheoryStrategyService.ts` to use `workerBridge.ts`.
5. **Test Management**: Validate worker lifecycle and task dispatching with Jest tests, ensuring < 1ms dispatching and resource efficiency.

## Example Test
```typescript
// tests/unit/workerBridge.test.ts
describe('WorkerBridge', () => {
  beforeEach(() => {
    jest.spyOn(Worker.prototype, 'postMessage').mockImplementation(() => {});
    jest.spyOn(Worker.prototype, 'terminate').mockImplementation(() => {});
  });

  test('dispatches task to force worker and reuses worker', async () => {
    const data = { task: 'calculateForces', data: { particles: [], formationPatterns: {}, deltaTime: 1 / 60 } };
    const result = await workerBridge.sendMessage('force', data);
    expect(Worker.prototype.postMessage).toHaveBeenCalledWith(data, [data.buffer].filter(Boolean));
    const secondResult = await workerBridge.sendMessage('force', data);
    expect(Worker.prototype.postMessage).toHaveBeenCalledTimes(2);
    expect(Worker.prototype.terminate).not.toHaveBeenCalled(); // Worker reused
  });

  test('terminates idle worker after timeout', async () => {
    jest.useFakeTimers();
    const data = { task: 'calculateForces', data: {} };
    await workerBridge.sendMessage('force', data);
    jest.advanceTimersByTime(60001); // Exceed IDLE_TIMEOUT
    expect(Worker.prototype.terminate).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('handles worker error gracefully', async () => {
    const data = { task: 'calculateForces', data: {} };
    jest.spyOn(Worker.prototype, 'onerror').mockImplementation((callback: any) => {
      callback(new ErrorEvent('error', { message: 'Worker failed' }));
    });
    await expect(workerBridge.sendMessage('force', data)).rejects.toThrow('Worker failed');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Worker error'));
  });
});
```

