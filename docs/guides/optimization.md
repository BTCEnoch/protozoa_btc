# Optimization Guide

## Introduction
Bitcoin Protozoa is a particle-based life simulation that visualizes 500 particles in real-time using Three.js, leverages Bitcoin block data for deterministic creature generation, and deploys data on-chain via recursive inscriptions with the ordinals protocol. Optimization is paramount to ensure smooth performance, minimal resource usage, and blockchain compatibility. This guide covers:

- **Rendering Performance**: Efficiently rendering 500 particles.
- **Computational Efficiency**: Keeping simulations responsive.
- **Bundle Size**: Reducing the web app’s footprint.
- **On-Chain Data**: Minimizing inscribed data size.
- **Determinism**: Ensuring consistent outputs.
- **API Efficiency**: Optimizing ordinals.com API interactions.

## Client-Side Optimization

### Rendering Optimization
Rendering 500 particles in Three.js requires efficient techniques to maintain high frame rates.

- **Instanced Rendering**: Use `InstancedMesh` for a single draw call.
  ```typescript
  import * as THREE from 'three';

  const geometry = new THREE.SphereGeometry(1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.InstancedMesh(geometry, material, 500);
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < 500; i++) {
    dummy.position.set(x, y, z); // Particle positions from data
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  ```

- **Level of Detail (LOD)**: Simplify distant particles.
  ```typescript
  import { LOD } from '@react-three/drei';

  function Particle() {
    return (
      <LOD>
        <mesh distance={0}><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color="white" /></mesh>
        <mesh distance={50}><sphereGeometry args={[1, 16, 16]} /><meshBasicMaterial color="white" /></mesh>
        <mesh distance={100}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="white" /></mesh>
      </LOD>
    );
  }
  ```

- **Frustum Culling**: Skip off-screen particles with `frustumCulled = true`.
- **Efficient Shaders**: Minimize fragment shader complexity.
- **Texture Atlases**: Combine textures into one image.
- **Batching**: Group particles by material.

Optimize the scene with a single light or pre-baked lighting.

### Computation Optimization
Keep the main thread free for rendering and UI.

- **Web Workers**: Offload physics or RNG.
  ```typescript
  // src/workers/physicsWorker.ts
  self.onmessage = (event) => {
    const { particles, delta } = event.data;
    const updatedParticles = updatePhysics(particles, delta); // Custom logic
    self.postMessage(updatedParticles);
  };

  // In component
  const worker = new Worker(new URL('../../workers/physicsWorker.ts', import.meta.url));
  worker.postMessage({ particles, delta });
  worker.onmessage = (event) => setParticles(event.data);
  ```

- **Efficient Algorithms**: Use spatial partitioning (e.g., octrees) for collisions.
- **Memoization**: Cache results with `lodash.memoize`.
  ```typescript
  import memoize from 'lodash.memoize';

  const computeTrait = memoize((nonce) => {
    // Expensive computation
    return trait;
  });
  ```

- **Avoid Unnecessary Computations**: Skip updates for static particles.

### Bundle Size Optimization
Minimize the web app’s size for faster loading.

- **Code Splitting**: Load components dynamically.
  ```typescript
  const LazyComponent = React.lazy(() => import('./LazyComponent'));
  ```

- **Tree Shaking**: Vite removes unused code from ES modules.
- **Minification**: Enabled in Vite’s production build.
- **Optimize Dependencies**: Import only needed modules (e.g., `import { useState } from 'react'`).
- **Asset Optimization**: Compress textures and models.

Analyze with `rollup-plugin-visualizer`:
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [visualizer()],
};
```

## On-Chain Data Optimization
Minimize data size for recursive inscriptions on Bitcoin.

- **Efficient Serialization**: Use compact JSON or binary formats.
  ```json
  {"id":"creature1","p":[{"r":"CORE","pos":[0,0,0]}]}
  ```

- **Minimize Data Fields**: Store only essential parameters (e.g., nonce, seed).
- **Compression**: Apply gzip if compatible with inscription tools.
- **Deterministic Generation**: Seed RNG with block nonce for reproducibility.
  ```typescript
  function generateCreature(nonce: string) {
    const seed = hash(nonce); // Deterministic hash
    const rng = new DeterministicRNG(seed);
    return createParticles(rng); // Same output every time
  }
  ```

Since ordinals store data, not executable code, optimize parameters that clients can expand deterministically.

## API Call Efficiency
Optimize fetching Bitcoin block data from ordinals.com.

- **Caching**: Use IndexedDB for block data.
  ```typescript
  import { openDB } from 'idb';

  const db = await openDB('blockData', 1, {
    upgrade(db) {
      db.createObjectStore('blocks');
    },
  });
  await db.put('blocks', data, blockNumber);
  const cached = await db.get('blocks', blockNumber);
  ```

- **Debouncing**: Limit rapid API calls.
  ```typescript
  import { debounce } from 'lodash';

  const fetchBlock = debounce(async (blockNumber) => {
    const data = await fetch(`https://ordinals.com/block/${blockNumber}`);
    return data.json();
  }, 300);
  ```

- **Error Handling**: Retry on failure or use mock data.
- **Minimal Data Fetching**: Request only nonce and confirmations.

## Performance Monitoring
Track and improve performance.

- **Three.js Stats**: Monitor FPS.
  ```typescript
  import Stats from 'three/examples/jsm/libs/stats.module.js';

  const stats = new Stats();
  document.body.appendChild(stats.dom);
  // In render loop: stats.update();
  ```

- **Browser DevTools**: Profile with the Performance tab.
- **Custom Benchmarks**: Test rendering and generation under load.

## Conclusion
This guide ensures Bitcoin Protozoa achieves high performance, small bundle size, and efficient on-chain deployment. By implementing these optimizations, the project balances real-time rendering, deterministic generation, and blockchain constraints effectively.


