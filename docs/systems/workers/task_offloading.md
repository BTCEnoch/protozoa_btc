
# Task Offloading

## Purpose
This document details the task offloading mechanisms in Bitcoin Protozoa’s workers system, which delegate computationally intensive tasks to Web Workers to ensure smooth main thread performance. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/workers/task_offloading.md`

## Overview
Task offloading enables Bitcoin Protozoa to perform heavy computations, such as physics calculations, game theory simulations, and storage operations, in Web Workers, preventing main thread bottlenecks and maintaining 60 FPS for up to 500 particles [Timestamp: April 14, 2025, 19:58]. Managed by `workerBridge.ts` and executed by workers like `forceWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`, offloading ensures deterministic execution and efficient data transfer. The system integrates with physics (`particleService.ts`), storage (`StorageService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines the offloading workflow, supported task types, data handling, and performance considerations, building on our discussions about performance optimization and modularity [Timestamp: April 15, 2025, 21:23; April 14, 2025, 19:58].

## Task Offloading Workflow
The task offloading workflow delegates tasks to Web Workers, processes them off-thread, and returns results to the main thread for system updates.

### Workflow
1. **Task Identification**:
   - A service (e.g., `particleService.ts`, `gameTheoryStrategyService.ts`) identifies a compute-intensive task (e.g., calculate forces, simulate battle).
2. **Task Request**:
   - The service calls `workerBridge.sendMessage`, specifying the worker type (e.g., `force`, `compute`) and a data payload (e.g., `IParticle[]`, block data).
3. **Worker Selection**:
   - `workerBridge.ts` selects an available worker from the pool or creates a new one, ensuring minimal instantiation overhead.
4. **Data Transfer**:
   - The payload is sent to the worker via `postMessage`, using `Transferable` objects (e.g., `Float32Array`) to reduce copying costs.
5. **Task Execution**:
   - The worker (e.g., `forceWorker.ts`) processes the task and returns results via `postMessage`, also using `Transferable` objects.
6. **Result Handling**:
   - `workerBridge.ts` resolves the task promise, passing results to the requesting service.
7. **System Update**:
   - Results update relevant systems (e.g., rendering, evolution, UI) via `eventBus.ts`, ensuring seamless integration.

### Supported Task Types
1. **Physics Calculations**:
   - **Workers**: `forceWorker.ts`, `positionWorker.ts`.
   - **Tasks**: Compute attraction/repulsion/spring forces, update particle positions/velocities [Timestamp: April 8, 2025, 19:50].
   - **Inputs**: `IParticle[]`, `IFormationPattern[]`, `deltaTime`.
   - **Outputs**: Force vectors (`Float32Array`), updated `IParticle[]`.
2. **Game Theory Simulations**:
   - **Worker**: `computeWorker.ts`.
   - **Tasks**: Calculate payoff matrices, simulate battles, evaluate Nash equilibria.
   - **Inputs**: Creature states, block data.
   - **Outputs**: Battle scores, winner ID.
3. **Storage Operations**:
   - **Worker**: `storageWorker.ts`.
   - **Tasks**: Batch IndexedDB writes for creature/particle states [Timestamp: April 16, 2025, 21:41].
   - **Inputs**: Store name, data array.
   - **Outputs**: Write confirmation.
4. **Evolution Triggers**:
   - **Worker**: `computeWorker.ts`.
   - **Tasks**: Evaluate mutation or tier progression conditions.
   - **Inputs**: Creature state, block data.
   - **Outputs**: Trigger flags, mutation IDs.

### Data Handling
- **Input Data**: Structured as JSON or typed arrays (e.g., `Float32Array` for positions) to minimize serialization overhead.
- **Transferable Objects**: Use `ArrayBuffer` or typed arrays for large datasets (e.g., particle positions, force vectors) to transfer ownership, avoiding deep copies.
- **Output Data**: Workers return results in compact formats (e.g., `Float32Array` for forces, JSON for battle outcomes) to optimize deserialization.
- **Error Handling**: Workers validate inputs and return error messages if data is malformed, logged via `logger.ts`.

### Determinism
- Task offloading is deterministic, using static task mappings and consistent worker selection [Timestamp: April 12, 2025, 12:18].
- Worker tasks (e.g., physics, game theory) may use block nonce-seeded RNG for computations, but offloading logic (dispatching, data transfer) is predictable.

## Implementation
Task offloading is implemented in `workerBridge.ts` for task coordination, with specific workers handling task logic. Services like `particleService.ts` and `gameTheoryStrategyService.ts` initiate offloading.

### Example Code
#### Worker Bridge
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
      logger.debug(`Created new ${workerType} worker`);
    }
    if (!worker) {
      worker = this.workerPool[workerType][0]; // Reuse oldest worker
    }
    return new Promise((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        this.workerPool[workerType].push(worker);
        logger.debug(`Worker task ${workerType} completed in ${performance.now() - start}ms`);
        resolve(e.data);
      };
      worker.onerror = (e: ErrorEvent) => {
        logger.error(`Worker error: ${e.message}`);
        worker.terminate();
        reject(e);
      };
      worker.postMessage(data, [data.buffer].filter(Boolean));
    });
  }
}

export const workerBridge = WorkerBridge.getInstance();
```

#### Force Worker
```typescript
// src/domains/workers/services/forceWorker.ts
import * as THREE from 'three';
import { spatialUtils } from 'src/shared/lib/spatialUtils';

self.onmessage = function (e: MessageEvent) {
  const { task, data } = e.data;
  if (task === 'calculateForces') {
    const forces = calculateForces(data.particles, data.formationPatterns, data.deltaTime);
    postMessage(forces, [forces.buffer]);
  } else {
    postMessage({ error: 'Unknown task' });
  }
};

function calculateForces(particles: IParticle[], patterns: { [role: string]: IFormationPattern }, deltaTime: number): Float32Array {
  const forces = new Float32Array(particles.length * 3);
  const grid = spatialUtils.createGrid(particles, 5);

  particles.forEach((p, i) => {
    const force = new THREE.Vector3();
    const cellKey = spatialUtils.getCellKey(p.position, 5);
    const neighbors = grid.get(cellKey) || [];

    neighbors.forEach(n => {
      if (n !== p) {
        const dist = distance(p.position, n.position);
        if (dist < 2) force.add(calculateRepulsion(p, n, dist));
      }
    });

    const pattern = patterns[p.role];
    if (pattern) {
      const spring = calculateSpringForce(p, pattern.positions[p.index % pattern.positions.length]);
      force.add(spring);
    }

    forces[i * 3] = force.x;
    forces[i * 3 + 1] = force.y;
    forces[i * 3 + 2] = force.z;
  });

  return forces;
}

function calculateRepulsion(p1: IParticle, p2: IParticle, dist: number): THREE.Vector3 {
  const k_repulsion = { [Role.MOVEMENT]: 0.1, [Role.ATTACK]: 0.08, [Role.DEFENSE]: 0.02, [Role.CORE]: 0.03, [Role.CONTROL]: 0.03 }[p1.role];
  const direction = new THREE.Vector3().subVectors(p1.position, p2.position).normalize();
  return direction.multiplyScalar(k_repulsion / (dist * dist));
}

function calculateSpringForce(p: IParticle, targetPos: { x: number, y: number, z: number }): THREE.Vector3 {
  const k_spring = { [Role.DEFENSE]: 0.12, [Role.CORE]: 0.1, [Role.CONTROL]: 0.08, [Role.ATTACK]: 0.07, [Role.MOVEMENT]: 0.05 }[p.role];
  const currentPos = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
  const target = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
  return target.sub(currentPos).multiplyScalar(k_spring);
}

function distance(p1: number[], p2: number[]): number {
  return Math.sqrt(
    (p1[0] - p2[0]) ** 2 +
    (p1[1] - p2[1]) ** 2 +
    (p1[2] - p2[2]) ** 2
  );
}
```

#### Task Offloading Example
```typescript
// src/domains/gameTheory/services/gameTheoryStrategyService.ts
import { workerBridge } from 'src/domains/workers/services/workerBridge';
import { eventBus } from 'src/shared/lib/eventBus';
import { logger } from 'src/shared/services/LoggerService';

class GameTheoryStrategyService extends Singleton {
  async simulateBattle(creatureIds: string[]) {
    const start = performance.now();
    const result = await workerBridge.sendMessage('compute', {
      task: 'simulateBattle',
      data: { creatureIds }
    });
    eventBus.publish({ type: 'battleComplete', payload: result });
    logger.debug(`Battle simulation offloaded in ${performance.now() - start}ms`, { creatureIds });
  }
}

export const gameTheoryStrategyService = GameTheoryStrategyService.getInstance();
```

## Performance Considerations
To ensure efficient task offloading for 500 particles:
1. **Minimized Data Payloads**: Send only essential data (e.g., `particleId`, `position`) to reduce serialization and transfer costs.
2. **Transferable Objects**: Use `Float32Array` or `ArrayBuffer` for large datasets (e.g., particle positions, forces) to eliminate copying overhead.
3. **Task Batching**: Combine related tasks (e.g., force and position updates) into single worker calls when possible to reduce communication.
4. **Worker Reuse**: Leverage worker pooling in `workerBridge.ts` to avoid instantiation delays (~10ms per worker).
5. **Profiling**: Monitor task execution and transfer times with Chrome DevTools, targeting < 5ms per task cycle [Timestamp: April 14, 2025, 19:58].

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `workerBridge.ts` dispatches tasks to `forceWorker.ts`, `positionWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`.
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` offloads force and position calculations [Timestamp: April 8, 2025, 19:50].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` offloads batch writes to `storageWorker.ts` [Timestamp: April 16, 2025, 21:41].
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers tasks (e.g., battle simulations) via user inputs.
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` offloads battle calculations to `computeWorker.ts`.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` visualizes worker-driven updates.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` processes worker results for state updates.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding [Timestamp: April 12, 2025, 12:18].

## Rules Adherence
- **Determinism**: Offloading uses static task mappings, with worker tasks leveraging seeded RNG for consistency [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Task logic is encapsulated in dedicated workers, coordinated by `workerBridge.ts` [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 5ms task execution and minimal main thread impact, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports physics, storage, input, and game theory for efficient computation.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate main-thread computation code (e.g., in `src/creatures/` or `src/lib/`), likely causing performance bottlenecks.
2. **Refactor into Workers**: Move physics to `forceWorker.ts` and `positionWorker.ts`, game theory to `computeWorker.ts`, and storage to `storageWorker.ts`.
3. **Integrate with Worker Bridge**: Update services to use `workerBridge.sendMessage` for task offloading.
4. **Optimize Data Transfer**: Implement `Transferable` objects for large datasets (e.g., particle arrays).
5. **Test Offloading**: Validate task execution and performance with Jest tests, ensuring < 5ms tasks and 60 FPS, using Chrome DevTools for profiling.

## Example Test
```typescript
// tests/unit/workerBridge.test.ts
describe('WorkerBridge Task Offloading', () => {
  beforeEach(() => {
    jest.spyOn(Worker.prototype, 'postMessage').mockImplementation(() => {});
    jest.spyOn(Worker.prototype, 'onmessage').mockImplementation((callback: any) => {
      callback({ data: new Float32Array([1, 0, 0]) }); // Mock result
    });
  });

  test('offloads physics force calculation', async () => {
    const data = {
      task: 'calculateForces',
      data: { particles: createMockCreature(createMockBlockData(12345)).particles, formationPatterns: {}, deltaTime: 1 / 60 }
    };
    const result = await workerBridge.sendMessage('force', data);
    expect(Worker.prototype.postMessage).toHaveBeenCalledWith(data, [data.buffer].filter(Boolean));
    expect(result).toBeInstanceOf(Float32Array);
  });

  test('offloads battle simulation', async () => {
    const data = { task: 'simulateBattle', data: { creatureIds: ['creature_123', 'creature_456'] } };
    const result = await workerBridge.sendMessage('compute', data);
    expect(Worker.prototype.postMessage).toHaveBeenCalledWith(data, []);
    expect(result).toBeDefined();
  });

  test('handles large particle data transfer', async () => {
    const particles = Array(500).fill(0).map((_, i) => ({
      id: `particle_${i}`,
      position: [i, 0, 0],
      velocity: [0, 0, 0],
      role: Role.CORE
    }));
    const data = { task: 'calculateForces', data: { particles, formationPatterns: {}, deltaTime: 1 / 60 } };
    const start = performance.now();
    const result = await workerBridge.sendMessage('force', data);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
    expect(result.length).toBe(500 * 3); // 500 particles, 3D forces
  });
});
```


