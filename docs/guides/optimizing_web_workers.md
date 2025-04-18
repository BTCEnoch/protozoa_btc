
# Optimizing Web Worker Usage

## Purpose
This guide provides practical instructions for leveraging Web Workers in Bitcoin Protozoa to offload computationally intensive tasks, ensuring real-time performance for creatures with up to 500 particles. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and new DDD framework, ensuring clarity during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/optimizing_web_workers.md`

## Overview
Bitcoin Protozoa uses Web Workers to offload tasks like physics calculations, evolution triggers, and game theory computations from the main thread, maintaining smooth rendering and UI responsiveness at 60 FPS. Managed by `workerBridge.ts` in the `workers` domain, workers handle tasks such as force calculations (`forceWorker.ts`) and position updates (`positionWorker.ts`). This guide covers configuring workers, offloading tasks, optimizing communication, and testing performance, building on our discussions about performance optimization [Timestamp: April 14, 2025, 19:58]. It aims to enable developers to maximize efficiency while ensuring deterministic outcomes tied to Bitcoin block data.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and run the development server (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Familiarity**: Knowledge of TypeScript, Web Workers, and the DDD structure (`src/domains/`), particularly the workers domain (`src/domains/workers/`).
- **Tools**: Jest for testing, Chrome DevTools for profiling, and Three.js Stats for FPS monitoring.

## Configuring Web Workers
Web Workers run scripts in background threads, isolated from the main thread, to handle compute-heavy tasks like physics or evolution calculations.

### Steps
1. **Create Worker Files**:
   - Place worker scripts in `src/domains/workers/services/` (e.g., `computeWorker.ts` for general computations).
   - Define worker logic using the `self.onmessage` event to handle incoming data and `postMessage` to return results.
2. **Set Up Worker Bridge**:
   - Use `workerBridge.ts` to manage worker instantiation and communication, abstracting complexity.
   - Configure worker types (e.g., `compute`, `force`) for specific tasks.
3. **Integrate with Services**:
   - Call `workerBridge.sendMessage` from services (e.g., `evolutionService.ts`, `particleService.ts`) to offload tasks.

### Example Code
#### Worker Script
```typescript
// src/domains/workers/services/computeWorker.ts
self.onmessage = function (e: MessageEvent) {
  const { task, data } = e.data;
  let result;
  switch (task) {
    case 'calculateEvolutionTriggers':
      result = calculateTriggers(data.creature, data.blockData);
      break;
    // Other tasks
    default:
      result = { error: 'Unknown task' };
  }
  postMessage(result);
};

function calculateTriggers(creature: ICreature, blockData: IBlockData): any {
  const rng = createRNGFromBlock(blockData.nonce).getStream('evolution');
  const triggers = [];
  creature.particles.forEach(p => {
    if (rng() < 0.1 && p.movementDistance > 10) { // Example condition
      triggers.push({ particleId: p.id, trigger: 'mutation' });
    }
  });
  return triggers;
}
```

#### Worker Bridge
```typescript
// src/domains/workers/services/workerBridge.ts
import { Singleton } from 'typescript-singleton';

class WorkerBridge {
  async sendMessage(workerType: string, data: any): Promise<any> {
    const worker = new Worker(new URL(`./${workerType}Worker.ts`, import.meta.url));
    return new Promise((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        worker.terminate(); // Clean up
        resolve(e.data);
      };
      worker.onerror = (e: ErrorEvent) => {
        worker.terminate();
        reject(e);
      };
      worker.postMessage(data);
    });
  }
}

export const workerBridge = WorkerBridge.getInstance();
```

### Usage
```typescript
// src/domains/evolution/services/evolutionService.ts
class EvolutionService {
  async evaluateTriggers(creature: ICreature, blockData: IBlockData): Promise<void> {
    const triggers = await workerBridge.sendMessage('compute', {
      task: 'calculateEvolutionTriggers',
      data: { creature, blockData }
    });
    for (const { particleId, trigger } of triggers) {
      if (trigger === 'mutation') {
        const particle = creature.particles.find(p => p.id === particleId);
        const mutation = traitService.assignTrait({ role: particle.role, id: `mutation-${blockData.nonce}` }, blockData, 'mutation');
        await evolutionTracker.updateEvolutionState(creature, mutation, blockData);
      }
    }
  }
}
```

## Offloading Tasks to Workers
Identify compute-intensive tasks suitable for workers, such as physics, evolution, or game theory calculations, to keep the main thread free for rendering and UI updates.

### Suitable Tasks
- **Physics Calculations**: Force and position updates (`forceWorker.ts`, `positionWorker.ts`) for particle movement [Timestamp: April 14, 2025, 19:58].
- **Evolution Triggers**: Evaluate conditions for mutations (`computeWorker.ts`) [Timestamp: April 12, 2025, 12:18].
- **Game Theory**: Compute payoff matrices or Nash equilibria (`computeWorker.ts`) for battle simulations.
- **State Persistence**: Batch IndexedDB writes (`storageWorker.ts`) for creature and particle states [Timestamp: April 16, 2025, 21:41].

### Steps
1. **Identify Task**:
   - Profile main thread performance with Chrome DevTools to find CPU-heavy tasks (e.g., physics loops taking > 5ms).
2. **Refactor Logic**:
   - Move task logic to a worker script, ensuring it’s self-contained and uses `postMessage` for results.
3. **Integrate with Worker Bridge**:
   - Update services to call `workerBridge.sendMessage` with task-specific data.
4. **Test Determinism**:
   - Ensure worker logic uses block nonce-seeded RNG for consistent outcomes.

### Example: Offloading Physics
```typescript
// src/domains/creature/services/particleService.ts
class ParticleService {
  async updatePhysics(particles: IParticle[], deltaTime: number): Promise<IParticle[]> {
    const formationPatterns = formationService.getCurrentFormations(particles);
    const forces = await workerBridge.sendMessage('force', {
      task: 'calculateForces',
      data: { particles, formationPatterns, deltaTime }
    });
    const updatedParticles = await workerBridge.sendMessage('position', {
      task: 'updatePositions',
      data: { particles, forces, deltaTime }
    });
    return updatedParticles;
  }
}
```

## Optimizing Worker Communication
Efficient communication between the main thread and workers is critical to avoid bottlenecks.

### Techniques
1. **Batch Messages**:
   - Send data for multiple particles or tasks in a single message to reduce overhead.
   - Example: Pass all 500 particles’ data in one `postMessage` call.
2. **Minimize Data Transfer**:
   - Send only necessary data (e.g., particle IDs, positions, not entire objects).
   - Example: Use `Transferable` objects like `ArrayBuffer` for large arrays.
3. **Reuse Workers**:
   - Maintain a pool of workers in `workerBridge.ts` instead of creating new ones per task to reduce instantiation costs.
4. **Throttle Tasks**:
   - Limit worker calls to significant events (e.g., every frame for physics, every block confirmation for evolution).

### Example: Optimized Communication
```typescript
// src/domains/workers/services/workerBridge.ts
class WorkerBridge {
  private workerPool: { [type: string]: Worker[] } = {};
  private readonly MAX_WORKERS = 4;

  async sendMessage(workerType: string, data: any): Promise<any> {
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
        resolve(e.data);
      };
      worker.onerror = (e: ErrorEvent) => reject(e);
      worker.postMessage(data, [data.buffer].filter(Boolean)); // Transfer ArrayBuffer if applicable
    });
  }
}
```

## Performance Considerations
To ensure efficient worker usage for 500 particles:
1. **Minimize Worker Overhead**: Limit worker instantiation and reuse workers via pooling.
2. **Optimize Data Size**: Reduce message payloads by sending only essential data (e.g., `{ id, position, role }` instead of full `IParticle`).
3. **Batch Processing**: Process all particles in a single worker call to avoid multiple messages.
4. **Profile Performance**: Use Chrome DevTools to monitor worker CPU usage and message latency, targeting < 5ms per task cycle.

## Testing Worker Usage
- **Unit Tests**: Test worker logic in isolation in `tests/unit/` (e.g., `tests/unit/computeWorker.test.ts`).
- **Integration Tests**: Verify main thread-worker communication in `tests/integration/` (e.g., `tests/integration/particleService.test.ts`).
- **Performance Tests**: Measure task execution time and FPS impact, ensuring < 5ms and 60 FPS.

**Example**:
```typescript
// tests/integration/particleService.test.ts
describe('ParticleService', () => {
  test('updates physics with workers within 5ms', async () => {
    const blockData = createMockBlockData(12345);
    const particles = particleService.createParticles(500, blockData);
    const start = performance.now();
    const updated = await particleService.updatePhysics(particles, 1 / 60);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
    expect(updated[0].position).not.toEqual(particles[0].position); // Position changed
  });
});
```

## Troubleshooting
- **Worker Errors**: Log `onerror` events in `workerBridge.ts` and verify worker script paths.
- **High Latency**: Profile message sizes and frequency with Chrome DevTools; reduce data or batch messages.
- **Non-Deterministic Results**: Ensure workers use block nonce-seeded RNG (`rngSystem.ts`) for consistent outcomes.
- **FPS Drops**: Check worker CPU usage; throttle tasks or optimize logic with spatial partitioning [Timestamp: April 14, 2025, 19:58].

