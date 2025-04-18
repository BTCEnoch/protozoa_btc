
# Deploying and Building for Production

## Purpose
This guide explains how to build, bundle, and deploy Bitcoin Protozoa for production environments, ensuring optimal performance and accessibility. It serves as a single source of truth for developers, tailored to the project’s particle-based design with role-specific mechanics (CORE, CONTROL, MOVEMENT, DEFENSE, ATTACK), extensive mutation trait system [Timestamp: April 12, 2025, 12:18], and new DDD framework, facilitating a smooth transition from development to production during migration from the current GitHub structure (https://github.com/BTCEnoch/Protozoa/tree/main).

## Location
`new_docs/guides/deploying_production.md`

## Overview
Bitcoin Protozoa, built with TypeScript, Three.js, and Web Workers, requires careful optimization to deliver a performant production build that maintains 60 FPS for 500 particles and supports deterministic gameplay tied to Bitcoin block data. This guide covers building the project with Vite (or Webpack), optimizing assets like Three.js shaders and mutation trait data, deploying to hosting platforms (e.g., Vercel, Netlify), and monitoring production performance, building on our discussions about performance optimization [Timestamp: April 14, 2025, 19:58] and state persistence [Timestamp: April 16, 2025, 21:41]. It ensures developers can deploy a robust, user-ready application.

## Prerequisites
- **Project Setup**: Clone the repository, install dependencies (`npm install`), and verify the development build (`npm run dev`), as detailed in `new_docs/guides/getting_started.md`.
- **Tools**: Node.js (v18+), Vite (or Webpack) for bundling, and a hosting platform account (e.g., Vercel, Netlify).
- **Familiarity**: Knowledge of TypeScript, Vite configuration, and deployment workflows.

## Building for Production
The production build optimizes code, assets, and dependencies to minimize load times and ensure performance.

### Steps
1. **Configure Build Settings**:
   - Update `vite.config.ts` (or `webpack.config.js`) to optimize for production.
   - Enable minification, tree-shaking, and code splitting.
   - Set output directory to `dist`.

2. **Optimize Assets**:
   - Compress Three.js shaders in `src/domains/rendering/shaders/` using tools like `terser`.
   - Minimize mutation trait data in `src/domains/traits/data/mutationPatterns/` by removing unnecessary fields (e.g., comments).
   - Use lazy loading for non-critical assets (e.g., texture maps).

3. **Run Build Command**:
   - Execute `npm run build` to generate the production bundle in `dist/`.
   - Verify the output includes minified JS, CSS, and asset files.

4. **Preview Build**:
   - Run `npm run preview` to test the production build locally using Vite’s preview server.
   - Check for rendering issues, performance (60 FPS), and deterministic behavior.

### Example Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    outDir: 'dist',
    minify: 'terser', // Use terser for aggressive minification
    sourcemap: false, // Disable sourcemaps for production
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'], // Split Three.js into separate chunk
          workers: ['./src/domains/workers/services/forceWorker.ts', './src/domains/workers/services/positionWorker.ts']
        }
      }
    }
  }
});
```

### Build Command
```bash
npm run build
```

### Output Verification
- Check `dist/` for files like `index.html`, `assets/main-[hash].js`, and `assets/shaders-[hash].js`.
- Ensure bundle size is < 5MB (compressed) to optimize load times.
- Test locally with `npm run preview` to confirm functionality (e.g., particle rendering, evolution triggers).

## Optimizing Assets
Efficient asset management reduces load times and improves performance for production.

### Techniques
1. **Minify Shaders**:
   - Use `terser` or `esbuild` to minify GLSL shaders in `src/domains/rendering/shaders/`.
   - Example: Reduce `particleShader.glsl` from 10KB to 5KB by removing comments and whitespace.
2. **Compress Trait Data**:
   - Strip non-essential fields from `src/domains/traits/data/mutationPatterns/` (e.g., documentation strings).
   - Example: Convert mutation JSON to a compact format, reducing size by 20%.
3. **Optimize Textures**:
   - Use compressed formats (e.g., WebP) for particle textures in `src/assets/textures/`.
   - Example: Compress `particleGlow.webp` to < 50KB using tools like `imagemin`.
4. **Lazy Load Assets**:
   - Dynamically import non-critical assets (e.g., MYTHIC mutation visuals) using `import()`:
     ```typescript
     // src/domains/rendering/services/shaderManager.ts
     async function loadMythicShader() {
       const { mythicShader } = await import('../shaders/mythicShader.glsl');
       return mythicShader;
     }
     ```
5. **Cache Static Assets**:
   - Configure long-term caching headers (e.g., `Cache-Control: max-age=31536000`) for static files in `dist/assets/`.

### Example: Minifying Trait Data
```json
// Before (src/domains/traits/data/mutationPatterns/attack.ts)
{
  "id": "fury_strike",
  "name": "Fury Strike",
  "rarity": "RARE",
  "effect": "Increases damage by 25%", // Descriptive comment
  "stats": { "damage": 0.25 },
  "visual": { "color": "#ff4500", "glowIntensity": 0.7 }
}

// After
{
  "id": "fury_strike",
  "rarity": "RARE",
  "stats": { "damage": 0.25 },
  "visual": { "color": "#ff4500", "glowIntensity": 0.7 }
}
```

## Deploying to Hosting Platforms
Bitcoin Protozoa can be deployed to platforms like Vercel or Netlify for scalable hosting.

### Steps for Vercel
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
2. **Configure Project**:
   - Create `vercel.json` in the root directory:
     ```json
     {
       "version": 2,
       "builds": [
         { "src": "dist/**", "use": "@vercel/static" }
       ],
       "routes": [
         { "src": "/(.*)", "dest": "/dist/$1" }
       ]
     }
     ```
3. **Deploy**:
   - Run `vercel --prod` to deploy the `dist/` folder.
   - Verify the deployment URL (e.g., `https://protozoa.vercel.app`).
4. **Set Environment Variables**:
   - Configure API endpoints (e.g., ordinals.com API) in Vercel’s dashboard.
   - Example: Set `VITE_API_URL=https://ordinals.com/api`.

### Steps for Netlify
1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```
2. **Configure Build**:
   - Create `netlify.toml` in the root directory:
     ```toml
     [build]
       publish = "dist"
       command = "npm run build"
     ```
3. **Deploy**:
   - Run `netlify deploy --prod` and select the `dist/` folder.
   - Verify the deployment URL (e.g., `https://protozoa.netlify.app`).
4. **Set Environment Variables**:
   - Add API endpoints in Netlify’s dashboard (e.g., `VITE_API_URL`).

### Post-Deployment Verification
- Test rendering (e.g., particle formations like “Spiral Charge”).
- Verify evolution triggers using block data from `bitcoinService.ts` [Timestamp: April 12, 2025, 12:18].
- Check FPS (60 FPS target) and load time (< 2s) using Chrome DevTools **Performance** tab.

## Monitoring Production Performance
Monitoring ensures the deployed application remains performant and stable.

### Techniques
1. **Error Tracking**:
   - Integrate Sentry or LogRocket for error monitoring.
   - Example: Add Sentry to `src/main.ts`:
     ```typescript
     import * as Sentry from '@sentry/browser';
     Sentry.init({ dsn: 'your-sentry-dsn' });
     ```
   - Monitor errors like API failures (`bitcoinService.ts`) or worker crashes (`computeWorker.ts`).
2. **Performance Analytics**:
   - Use Vercel Analytics or Netlify’s built-in metrics to track load times and user interactions.
   - Monitor API call frequency to ordinals.com to avoid rate limits (HTTP 429).
3. **FPS Monitoring**:
   - Include Three.js Stats in production builds (optional) to track FPS:
     ```typescript
     // src/domains/rendering/services/sceneManager.ts
     import Stats from 'three/examples/jsm/libs/stats.module';
     const stats = new Stats();
     document.body.appendChild(stats.dom);
     ```
   - Log FPS drops below 60 for investigation.
4. **Logging**:
   - Use `LoggerService.ts` for production logs, filtering to `warn` and `error` levels:
     ```typescript
     // src/shared/services/LoggerService.ts
     class LoggerService {
       warn(message: string, context?: any) {
         if (process.env.NODE_ENV === 'production') {
           console.warn(`[WARN] ${message}`, context);
         }
       }
     }
     ```

### Example: Error Tracking Setup
```typescript
// src/main.ts
import * as Sentry from '@sentry/browser';
Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Example: Log API error
import { logger } from 'src/shared/services/LoggerService';
try {
  await bitcoinService.fetchBlockData(800000);
} catch (error) {
  logger.error('Failed to fetch block data', { error });
  Sentry.captureException(error);
}
```

## Common Issues and Solutions
1. **Large Bundle Size**:
   - **Symptom**: Initial load > 2s due to large `dist/assets/main-[hash].js`.
   - **Solution**: Enable code splitting in `vite.config.ts` and compress assets (e.g., WebP textures).
   - **Debugging**: Use DevTools **Network** tab to check bundle sizes; optimize with `vite-plugin-analyzer`.
2. **API Rate Limits**:
   - **Symptom**: HTTP 429 errors from ordinals.com API (`bitcoinService.ts`).
   - **Solution**: Cache block data in IndexedDB (`StorageService.ts`) and implement exponential backoff [Timestamp: April 16, 2025, 21:41].
   - **Debugging**: Log API responses in `bitcoinService.ts`:
     ```typescript
     logger.warn(`API rate limit hit: ${response.status}`, { retryAfter: response.headers.get('Retry-After') });
     ```
3. **Rendering Performance**:
   - **Symptom**: FPS drops below 60 during particle rendering.
   - **Solution**: Optimize `instancedRenderer.ts` with instanced rendering and LOD (`lodManager.ts`) [Timestamp: April 14, 2025, 19:58].
   - **Debugging**: Enable Three.js Stats and profile with DevTools **Performance** tab.
4. **State Persistence Issues**:
   - **Symptom**: Creature state not saved to IndexedDB.
   - **Solution**: Verify `StorageService.ts` write calls in `evolutionTracker.ts` and use batch writes.
   - **Debugging**: Log save operations:
     ```typescript
     logger.info(`Saving creature state for ${id}`, data);
     ```

## Testing Production Builds
- **Local Testing**: Run `npm run preview` to test the `dist/` build, verifying rendering, evolution, and game theory functionality.
- **Integration Tests**: Update `tests/integration/` to test production-like scenarios (e.g., minified assets, cached block data).
- **Example**:
  ```typescript
  // tests/integration/deployment.test.ts
  describe('Production Build', () => {
    test('maintains 60 FPS with 500 particles', async () => {
      const blockData = createMockBlockData(12345);
      const creature = createMockCreature(blockData, { particleCount: 500 });
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        instancedRenderer.updateParticles(creature.particles);
        sceneManager.render(cameraService.getCamera());
      }
      const elapsed = performance.now() - start;
      const fps = 100 / (elapsed / 1000);
      expect(fps).toBeGreaterThanOrEqual(60);
    });
  });
  ```

