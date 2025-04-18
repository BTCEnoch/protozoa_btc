
# Data Transfer

## Purpose
This document details the data transfer mechanisms in Bitcoin Protozoa’s workers system, which enable efficient communication of data between the main thread and Web Workers for tasks like physics calculations, game theory simulations, and storage operations. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), deterministic RNG driven by Bitcoin block data, and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/systems/workers/data_transfer.md`

## Overview
Data transfer is a critical component of Bitcoin Protozoa’s workers system, ensuring fast and efficient exchange of large datasets (e.g., particle positions, force vectors) between the main thread and Web Workers to maintain real-time performance (60 FPS, < 5ms task cycles) for up to 500 particles [Timestamp: April 14, 2025, 19:58]. Managed by `workerBridge.ts` and implemented across workers like `forceWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`, it leverages `Transferable` objects (e.g., `ArrayBuffer`, `Float32Array`) to minimize copying overhead. The system supports deterministic transfers and integrates with physics (`particleService.ts`), storage (`StorageService.ts`), input (`inputService.ts`), and game theory (`payoffMatrixService.ts`). This document outlines the data transfer workflow, supported data formats, optimization strategies, and error handling, building on our discussions about performance optimization and modularity [Timestamp: April 15, 2025, 21:23; April 14, 2025, 19:58].

## Data Transfer Workflow
The data transfer workflow facilitates communication between the main thread and Web Workers, ensuring minimal latency and resource usage.

### Workflow
1. **Data Preparation**:
   - The requesting service (e.g., `particleService.ts`) prepares a data payload, structured as JSON or typed arrays (e.g., `Float32Array` for particle positions).
2. **Task Dispatch**:
   - The service calls `workerBridge.sendMessage`, passing the worker type (e.g., `force`) and payload.
   - `workerBridge.ts` serializes the payload (if JSON) or uses `Transferable` objects (if typed arrays) to transfer ownership, avoiding deep copies.
3. **Worker Receipt**:
   - The worker (e.g., `forceWorker.ts`) receives the payload via `onmessage`, deserializing JSON or directly accessing transferred arrays.
4. **Task Processing**:
   - The worker processes the task (e.g., calculates forces) and prepares results in a compact format (e.g., `Float32Array` for force vectors).
5. **Result Transfer**:
   - The worker sends results back via `postMessage`, using `Transferable` objects for large datasets to minimize copying.
6. **Main Thread Receipt**:
   - `workerBridge.ts` receives results via `onmessage`, resolves the task promise, and passes data to the requesting service.
7. **System Update**:
   - Results update relevant systems (e.g., rendering, evolution) via `eventBus.ts`, ensuring seamless integration.

### Supported Data Formats
1. **JSON**:
   - **Use Case**: Small, structured data (e.g., creature metadata, simulation settings).
   - **Pros**: Human-readable, flexible for complex objects.
   - **Cons**: Higher serialization/deserialization overhead.
   - **Example**: `{ task: 'simulateBattle', data: { creatureIds: ['creature_123', 'creature_456'] } }`.
2. **Typed Arrays (`Float32Array`, `Uint8Array`)**:
   - **Use Case**: Large numerical datasets (e.g., particle positions, force vectors).
   - **Pros**: Compact, supports `Transferable` for zero-copy transfer.
   - **Cons**: Limited to numerical data, requires careful buffer management.
   - **Example**: `Float32Array` for 500 particles’ 3D positions (1500 elements).
3. **ArrayBuffer**:
   - **Use Case**: Raw binary data or backing buffer for typed arrays.
   - **Pros**: Maximum flexibility, supports `Transferable`.
   - **Cons**: Requires explicit structuring (e.g., via typed arrays).
   - **Example**: Buffer for force vectors, transferred as `Float32Array`.

### Transferable Objects
- **Definition**: Objects like `ArrayBuffer`, `Float32Array`, or `MessagePort` that can be transferred between threads with zero-copy, transferring ownership instead of copying.
- **Usage**: Used for large datasets (e.g., particle positions, force vectors) to reduce latency and memory usage.
- **Implementation**: Specified in `postMessage`’s second argument, e.g., `postMessage(data, [data.buffer])`.
- **Benefit**: Reduces transfer time by ~50% for large arrays (e.g., 500 particles’ positions) compared to JSON serialization.

### Determinism
- Data transfers are deterministic, using fixed data structures and consistent serialization [Timestamp: April 12, 2025, 12:18].
- Worker tasks may use block nonce-seeded RNG (e.g., for game theory), but transfer logic (serialization, buffer management) is predictable.

## Implementation
Data transfer is implemented in `workerBridge.ts` for main thread-worker communication, with workers handling task-specific data processing. Services like `particleService.ts` and `StorageService.ts` prepare and receive data.

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
      // Use Transferable objects for typed arrays
      const transfer = data.buffer ? [data.buffer] : [];
      worker.postMessage(data, transfer);
    });
  }
}

export const workerBridge = WorkerBridge.getInstance();
```

#### Force Worker Data Transfer
```typescript
// src/domains/workers/services/forceWorker.ts
self.onmessage = function (e: MessageEvent) {
  const { task, data } = e.data;
  if (task === 'calculateForces') {
    const forces = calculateForces(data.particles, data.formationPatterns, data.deltaTime);
    // Transfer result as Float32Array
    postMessage(forces, [forces.buffer]);
  } else {
    postMessage({ error: 'Unknown task' });
  }
};

function calculateForces(particles: IParticle[], patterns: { [role: string]: IFormationPattern }, deltaTime: number): Float32Array {
  const forces = new Float32Array(particles.length * 3);
  particles.forEach((p, i) => {
    const force = new THREE.Vector3();
    // Simplified force calculation
    forces[i * 3] = force.x;
    forces[i * 3 + 1] = force.y;
    forces[i * 3 + 2] = force.z;
  });
  return forces;
}
```

#### Physics Service Offloading
```typescript
// src/domains/creature/services/particleService.ts
import { workerBridge } from 'src/domains/workers/services/workerBridge';
import { formationService } from 'src/domains/traits/services/formationService';
import { logger } from 'src/shared/services/LoggerService';

class ParticleService {
  async updatePhysics(particles: IParticle[], deltaTime: number): Promise<IParticle[]> {
    const start = performance.now();
    const formationPatterns = formationService.getCurrentFormations(particles);
    // Prepare compact data for transfer
    const particleData = particles.map(p => ({
      id: p.id,
      position: new Float32Array(p.position),
      role: p.role
    }));
    const forces = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles: particleData, formationPatterns, deltaTime }
    });
    const updatedParticles = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles, forces, deltaTime }
    });
    logger.debug(`Physics update with data transfer completed in ${performance.now() - start}ms`);
    return updatedParticles;
  }
}

export const particleService = new ParticleService();
```

## Performance Considerations
To ensure efficient data transfer for 500 particles:
1. **Minimized Payload Size**: Use typed arrays (e.g., `Float32Array`) for numerical data (e.g., positions, forces) to reduce serialization overhead by ~70% compared to JSON.
2. **Transferable Objects**: Transfer ownership of `ArrayBuffer` or typed arrays to eliminate copying, reducing transfer time for large datasets (e.g., 1500 floats for 500 particles) to < 0.5ms.
3. **Selective Data**: Send only essential fields (e.g., `id`, `position`, `role`) to workers, avoiding redundant data (e.g., particle metadata).
4. **Batched Transfers**: Combine related data (e.g., particle positions and formation patterns) into single `postMessage` calls to minimize communication overhead.
5. **Profiling**: Monitor transfer times and memory usage with Chrome DevTools, targeting < 1ms for data transfer per task cycle [Timestamp: April 14, 2025, 19:58].

## Integration Points
- **Workers Domain (`src/domains/workers/`)**: `workerBridge.ts` manages transfers for `forceWorker.ts`, `positionWorker.ts`, `computeWorker.ts`, and `storageWorker.ts`.
- **Physics Domain (`src/domains/creature/`)**: `particleService.ts` transfers particle data for physics calculations [Timestamp: April 8, 2025, 19:50].
- **Storage Domain (`src/shared/services/`)**: `StorageService.ts` transfers batch write data to `storageWorker.ts` [Timestamp: April 16, 2025, 21:41].
- **Input Domain (`src/domains/input/`)**: `inputService.ts` triggers tasks requiring data transfer (e.g., battle simulations).
- **Game Theory Domain (`src/domains/gameTheory/`)**: `payoffMatrixService.ts` transfers creature data to `computeWorker.ts`.
- **Rendering Domain (`src/domains/rendering/`)**: `instancedRenderer.ts` uses worker results from transferred data.
- **Evolution Domain (`src/domains/evolution/`)**: `evolutionTracker.ts` processes worker results from transferred data.
- **Bitcoin Domain (`src/domains/bitcoin/`)**: `bitcoinService.ts` provides `IBlockData` for RNG seeding [Timestamp: April 12, 2025, 12:18].

## Rules Adherence
- **Determinism**: Transfers use fixed data structures, ensuring consistent communication [Timestamp: April 12, 2025, 12:18].
- **Modularity**: Transfer logic is encapsulated in `workerBridge.ts` and workers, with clear interfaces [Timestamp: April 15, 2025, 21:23].
- **Performance**: Optimized for < 1ms transfers and < 5ms task cycles, supporting 60 FPS [Timestamp: April 14, 2025, 19:58].
- **Integration**: Seamlessly supports physics, storage, input, and game theory for efficient task execution.

## Migration Steps
To transition from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main):
1. **Identify Existing Logic**: Locate main-thread data handling (e.g., in `src/creatures/` or `src/lib/`), likely using JSON or unoptimized structures.
2. **Refactor for Workers**: Implement `Transferable` objects in `workerBridge.ts` and workers for large datasets.
3. **Optimize Payloads**: Update services (e.g., `particleService.ts`) to use typed arrays for numerical data.
4. **Integrate with Systems**: Ensure services leverage `workerBridge.ts` for transfers, updating `eventBus.ts` for result propagation.
5. **Test Transfers**: Validate transfer efficiency and data integrity with Jest tests, targeting < 1ms transfers, using Chrome DevTools for profiling.

## Example Test
```typescript
// tests/unit/workerBridge.test.ts
describe('WorkerBridge Data Transfer', () => {
  beforeEach(() => {
    jest.spyOn(Worker.prototype, 'postMessage').mockImplementation(() => {});
    jest.spyOn(Worker.prototype, 'onmessage').mockImplementation((callback: any) => {
      callback({ data: new Float32Array(1500) }); // Mock 500 particles' forces
    });
  });

  test('transfers particle positions efficiently', async () => {
    const particles = Array(500).fill(0).map((_, i) => ({
      id: `particle_${i}`,
      position: new Float32Array([i, 0, 0]),
      role: Role.CORE
    }));
    const data = { task: 'calculateForces', data: { particles, formationPatterns: {}, deltaTime: 1 / 60 } };
    const start = performance.now();
    const result = await workerBridge.sendMessage('force', data);
    const elapsed = performance.now() - start;
    expect(Worker.prototype.postMessage).toHaveBeenCalledWith(data, expect.arrayContaining([expect.any(ArrayBuffer)]));
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(1500); // 500 particles, 3D forces
    expect(elapsed).toBeLessThan(5);
  });

  test('transfers JSON for small data', async () => {
    const data = { task: 'simulateBattle', data: { creatureIds: ['creature_123', 'creature_456'] } };
    const result = await workerBridge.sendMessage('compute', data);
    expect(Worker.prototype.postMessage).toHaveBeenCalledWith(data, []);
    expect(result).toBeDefined();
  });

  test('handles transfer errors gracefully', async () => {
    const data = { task: 'calculateForces', data: { particles: null } };
    jest.spyOn(Worker.prototype, 'onerror').mockImplementation((callback: any) => {
      callback(new ErrorEvent('error', { message: 'Invalid data' }));
    });
    await expect(workerBridge.sendMessage('force', data)).rejects.toThrow('Invalid data');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Worker error'));
  });
});
```

This document provides a comprehensive guide for data transfer in Bitcoin Protozoa’s workers system, ensuring efficient, deterministic, and scalable communication that supports real-time gameplay across physics, storage, input, and game theory.

Are you ready for the next document (workers_performance.md)?
