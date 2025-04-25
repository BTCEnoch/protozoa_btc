/**
 * Basic Memory Tests for Bitcoin Protozoa
 *
 * This file contains tests to monitor memory usage and identify potential memory leaks
 * or excessive memory usage in the Bitcoin Protozoa project.
 */

import { createProfiler } from '../../shared/utils/performance';
import { getParticleService } from '../../domains/particle/services/particleService';
import { getRenderService } from '../../domains/rendering/services/renderService';
import { getStateManager } from '../../shared/state/stateManager';
import { getBitcoinService } from '../../domains/bitcoin/services/bitcoinService';
import { getObjectReuseManager } from '../../shared/utils/memory/objectReuse';
import { Role } from '../../shared/types/core';
import { Vector3 } from '../../shared/types/common';
import { Logging } from '../../shared/utils';
import { getRNGService } from '../../domains/rng/services/rngService';
import { expect } from '@jest/globals';

// Create logger
const logger = Logging.createLogger('MemoryTest');

// Create profilers for each domain
const particleProfiler = createProfiler('Particle');
const renderProfiler = createProfiler('Render');
const systemProfiler = createProfiler('System');

// Test timeout (5 minutes)
jest.setTimeout(5 * 60 * 1000);

describe('Basic Memory Tests', () => {
  // Mock DOM container for rendering tests
  let mockContainer: HTMLDivElement | null = null;

  beforeAll(async () => {
    // Create mock container for rendering
    mockContainer = document.createElement('div');
    mockContainer.id = 'app';
    mockContainer.style.width = '800px';
    mockContainer.style.height = '600px';
    document.body.appendChild(mockContainer);

    // Initialize services
    const stateManager = getStateManager();
    await stateManager.initialize();

    // Initialize Bitcoin service and fetch block data
    const bitcoinService = getBitcoinService();
    const blockData = await bitcoinService.fetchBlockData(800000);

    // Initialize RNG service first
    const rngService = getRNGService();
    await rngService.initialize(blockData);

    // Initialize particle service
    const particleService = getParticleService();
    await particleService.initialize(blockData);

    // Initialize render service
    const renderService = getRenderService();
    await renderService.initialize(mockContainer);
  });

  afterAll(() => {
    // Clean up
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer);
    }

    // Clean up services
    const renderService = getRenderService();
    renderService.stopRenderLoop();
    renderService.reset();

    const particleService = getParticleService();
    particleService.reset();
  });

  describe('Particle Creation Memory Usage', () => {
    test('should monitor memory usage during particle creation', async () => {
      const particleService = getParticleService();

      // Define particle counts to test
      const particleCounts = [100, 500, 1000, 5000];

      // Store results for analysis
      const results: { count: number; memoryPerParticle: number }[] = [];

      // Test each particle count
      for (const count of particleCounts) {
        logger.info(`\nTesting memory usage with ${count} particles...`);

        // Reset particle service
        particleService.reset();

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          logger.info('Forced garbage collection');
        }

        // Measure memory usage during particle creation
        // Get memory usage before
        const memoryBefore = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

        // Start timing
        const startTime = performance.now();

        // Create a map of roles to particle counts
        const roleCounts = new Map<Role, number>();
        roleCounts.set(Role.CORE, Math.floor(count * 0.2));
        roleCounts.set(Role.CONTROL, Math.floor(count * 0.2));
        roleCounts.set(Role.ATTACK, Math.floor(count * 0.2));
        roleCounts.set(Role.DEFENSE, Math.floor(count * 0.2));
        roleCounts.set(Role.MOVEMENT, count - Math.floor(count * 0.8));

        // Create particle groups
        particleService.createParticleGroups(roleCounts);

        // Get the groups
        const groups = particleService.getAllGroups();

        // End timing
        const endTime = performance.now();

        // Get memory usage after
        const memoryAfter = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

        // Create a result object similar to what PerformanceTester.benchmarkAsync would return
        const result = {
          result: groups,
          metrics: {
            executionTime: endTime - startTime,
            memoryUsage: {
              heapUsed: memoryAfter - memoryBefore
            }
          }
        };

        // Calculate memory per particle
        const memoryPerParticle = result.metrics.memoryUsage?.heapUsed
          ? result.metrics.memoryUsage.heapUsed / count
          : 0;

        // Store result
        results.push({ count, memoryPerParticle });

        logger.info(`Created ${count} particles`);

        if (result.metrics.memoryUsage) {
          logger.info(`Memory usage: ${(result.metrics.memoryUsage.heapUsed! / (1024 * 1024)).toFixed(2)} MB`);
          logger.info(`Memory per particle: ${(memoryPerParticle / 1024).toFixed(2)} KB`);
        }

        // Log object pool statistics
        getObjectReuseManager().logStats();
      }

      // Analyze memory usage
      logger.info('\nMemory Usage Analysis:');
      for (let i = 1; i < results.length; i++) {
        const countRatio = results[i].count / results[i-1].count;
        const memoryRatio = (results[i].memoryPerParticle * results[i].count) /
                          (results[i-1].memoryPerParticle * results[i-1].count);

        logger.info(`Scaling from ${results[i-1].count} to ${results[i].count} particles:`);
        logger.info(`  Particle count increased by ${countRatio.toFixed(2)}x`);
        logger.info(`  Total memory increased by ${memoryRatio.toFixed(2)}x`);

        // Check if memory usage is linear or better
        if (memoryRatio <= countRatio * 1.2) {
          logger.info('  ✅ Memory scaling is acceptable (linear or better)');
        } else {
          logger.info('  ⚠️ Memory scaling is worse than linear');
        }
      }
    });
  });

  describe('Rendering Memory Usage', () => {
    test('should monitor memory usage during rendering', async () => {
      const renderService = getRenderService();

      // Define particle counts to test
      const particleCounts = [100, 500, 1000, 5000];

      // Store results for analysis
      const results: { count: number; memoryPerParticle: number }[] = [];

      // Test each particle count
      for (const count of particleCounts) {
        logger.info(`\nTesting rendering memory usage with ${count} particles...`);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          logger.info('Forced garbage collection');
        }

        // Create test particles
        const positions: Vector3[] = [];
        const velocities: Vector3[] = [];
        const scales: number[] = [];

        for (let i = 0; i < count; i++) {
          positions.push({
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            z: Math.random() * 100 - 50
          });

          velocities.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: Math.random() * 2 - 1
          });

          scales.push(Math.random() * 0.5 + 0.5);
        }

        // Measure memory usage during particle update
        // Get memory usage before
        const updateMemoryBefore = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

        // Start timing
        const updateStartTime = performance.now();

        // Update particles
        renderService.updateParticles(Role.CORE, positions, velocities, scales);

        // End timing
        const updateEndTime = performance.now();

        // Get memory usage after
        const updateMemoryAfter = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

        // Create a result object similar to what PerformanceTester.benchmarkAsync would return
        const updateResult = {
          result: true,
          metrics: {
            executionTime: updateEndTime - updateStartTime,
            memoryUsage: {
              heapUsed: updateMemoryAfter - updateMemoryBefore
            }
          }
        };

        // Calculate memory per particle for update
        const updateMemoryPerParticle = updateResult.metrics.memoryUsage?.heapUsed
          ? updateResult.metrics.memoryUsage.heapUsed / count
          : 0;

        logger.info(`Updated ${count} particles`);

        if (updateResult.metrics.memoryUsage) {
          logger.info(`Update memory usage: ${(updateResult.metrics.memoryUsage.heapUsed! / (1024 * 1024)).toFixed(2)} MB`);
          logger.info(`Update memory per particle: ${(updateMemoryPerParticle / 1024).toFixed(2)} KB`);
        }

        // Measure memory usage during rendering
        // Get memory usage before
        const renderMemoryBefore = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

        // Start timing
        const renderStartTime = performance.now();

        // Render
        renderService.render();

        // End timing
        const renderEndTime = performance.now();

        // Get memory usage after
        const renderMemoryAfter = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

        // Create a result object similar to what PerformanceTester.benchmarkAsync would return
        const renderResult = {
          result: true,
          metrics: {
            executionTime: renderEndTime - renderStartTime,
            memoryUsage: {
              heapUsed: renderMemoryAfter - renderMemoryBefore
            }
          }
        };

        // Calculate memory per particle for render
        const renderMemoryPerParticle = renderResult.metrics.memoryUsage?.heapUsed
          ? renderResult.metrics.memoryUsage.heapUsed / count
          : 0;

        // Store result (using render memory)
        results.push({ count, memoryPerParticle: renderMemoryPerParticle });

        logger.info(`Rendered ${count} particles`);

        if (renderResult.metrics.memoryUsage) {
          logger.info(`Render memory usage: ${(renderResult.metrics.memoryUsage.heapUsed! / (1024 * 1024)).toFixed(2)} MB`);
          logger.info(`Render memory per particle: ${(renderMemoryPerParticle / 1024).toFixed(2)} KB`);
        }
      }

      // Analyze memory usage
      logger.info('\nRendering Memory Usage Analysis:');
      for (let i = 1; i < results.length; i++) {
        const countRatio = results[i].count / results[i-1].count;
        const memoryRatio = (results[i].memoryPerParticle * results[i].count) /
                          (results[i-1].memoryPerParticle * results[i-1].count);

        logger.info(`Scaling from ${results[i-1].count} to ${results[i].count} particles:`);
        logger.info(`  Particle count increased by ${countRatio.toFixed(2)}x`);
        logger.info(`  Total render memory increased by ${memoryRatio.toFixed(2)}x`);

        // Check if memory usage is linear or better
        if (memoryRatio <= countRatio * 1.2) {
          logger.info('  ✅ Render memory scaling is acceptable (linear or better)');
        } else {
          logger.info('  ⚠️ Render memory scaling is worse than linear');
        }
      }
    });
  });

  describe('Object Pooling Effectiveness', () => {
    test('should verify object pooling reduces memory usage', async () => {
      const particleService = getParticleService();
      const objectReuseManager = getObjectReuseManager();

      // Reset particle service
      particleService.reset();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        logger.info('Forced garbage collection');
      }

      // Log initial object pool statistics
      logger.info('\nInitial object pool statistics:');
      objectReuseManager.logStats();

      // Create particles
      const count = 1000;
      logger.info(`\nCreating ${count} particles...`);

      // Create a map of roles to particle counts
      const roleCounts = new Map<Role, number>();
      roleCounts.set(Role.CORE, Math.floor(count * 0.2));
      roleCounts.set(Role.CONTROL, Math.floor(count * 0.2));
      roleCounts.set(Role.ATTACK, Math.floor(count * 0.2));
      roleCounts.set(Role.DEFENSE, Math.floor(count * 0.2));
      roleCounts.set(Role.MOVEMENT, count - Math.floor(count * 0.8));

      // Create particle groups
      particleService.createParticleGroups(roleCounts);

      // Log object pool statistics after creation
      logger.info('\nObject pool statistics after creation:');
      objectReuseManager.logStats();

      // Reset particle service
      particleService.reset();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        logger.info('Forced garbage collection');
      }

      // Log object pool statistics after reset
      logger.info('\nObject pool statistics after reset:');
      objectReuseManager.logStats();

      // Create particles again
      logger.info(`\nCreating ${count} particles again...`);

      // Measure memory usage with object pooling
      // Get memory usage before
      const poolingMemoryBefore = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

      // Start timing
      const poolingStartTime = performance.now();

      // Create particle groups
      particleService.createParticleGroups(roleCounts);

      // Get the groups
      const pooledGroups = particleService.getAllGroups();

      // End timing
      const poolingEndTime = performance.now();

      // Get memory usage after
      const poolingMemoryAfter = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

      // Create a result object similar to what PerformanceTester.benchmarkAsync would return
      const withPoolingResult = {
        result: pooledGroups,
        metrics: {
          executionTime: poolingEndTime - poolingStartTime,
          memoryUsage: {
            heapUsed: poolingMemoryAfter - poolingMemoryBefore
          }
        }
      };

      // Log object pool statistics after second creation
      logger.info('\nObject pool statistics after second creation:');
      objectReuseManager.logStats();

      // Log memory usage with pooling
      if (withPoolingResult.metrics.memoryUsage) {
        logger.info(`Memory usage with pooling: ${(withPoolingResult.metrics.memoryUsage.heapUsed! / (1024 * 1024)).toFixed(2)} MB`);
        logger.info(`Memory per particle with pooling: ${(withPoolingResult.metrics.memoryUsage.heapUsed! / count / 1024).toFixed(2)} KB`);
      }

      // Verify that object pooling is effective
      const stats = objectReuseManager.getStats();
      expect(stats.particles.reused).toBeGreaterThan(0);
      expect(stats.vectors.reused).toBeGreaterThan(0);

      logger.info(`Particles reused: ${stats.particles.reused}`);
      logger.info(`Vectors reused: ${stats.vectors.reused}`);

      // Calculate reuse ratio
      const particleReuseRatio = stats.particles.reused / (stats.particles.created + stats.particles.reused);
      const vectorReuseRatio = stats.vectors.reused / (stats.vectors.created + stats.vectors.reused);

      logger.info(`Particle reuse ratio: ${(particleReuseRatio * 100).toFixed(2)}%`);
      logger.info(`Vector reuse ratio: ${(vectorReuseRatio * 100).toFixed(2)}%`);

      // Verify that reuse ratio is above a threshold
      expect(particleReuseRatio).toBeGreaterThan(0.5);
      expect(vectorReuseRatio).toBeGreaterThan(0.5);
    });
  });
});

