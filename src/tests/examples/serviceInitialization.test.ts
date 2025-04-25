/**
 * Service Initialization Example Tests
 * 
 * This file demonstrates how to properly initialize services in tests.
 */

import { initializeFormationService } from '../helpers/formationServiceHelper';
import { initializePhysicsService } from '../helpers/physicsServiceHelper';
import { initializeWorkerService } from '../helpers/workerServiceHelper';
import { getFormationService } from '../../domains/traits/formations/services/formationService';
import { getRenderService } from '../../domains/rendering/services/renderService';
import { registry } from '../../shared/services/serviceRegistry';
import { Role, Rarity } from '../../shared/types/core';

// Mock block data for testing
const mockBlockData = {
  hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
  height: 0,
  time: 1231006505,
  nonce: 2083236893,
  difficulty: 1,
  merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
  version: 1,
  bits: '1d00ffff',
  size: 285,
  weight: 1140,
  confirmations: 1
};

describe('Service Initialization Examples', () => {
  // Clean up after each test
  afterEach(() => {
    // Reset services
    const formationService = getFormationService();
    if (formationService.isInitialized()) {
      formationService.reset();
    }
    
    // Clear registry
    registry.clear();
  });
  
  describe('FormationService', () => {
    test('should initialize FormationService with dependencies', async () => {
      // Initialize FormationService with dependencies
      await initializeFormationService(mockBlockData);
      
      // Verify that FormationService is initialized
      const formationService = getFormationService();
      expect(formationService.isInitialized()).toBe(true);
      
      // Test FormationService functionality
      const formation = formationService.getRandomFormation(Role.CORE, Rarity.COMMON);
      expect(formation).not.toBeNull();
    });
    
    test('should initialize FormationService before RenderService', async () => {
      // Initialize FormationService first
      await initializeFormationService(mockBlockData);
      
      // Now RenderService can be initialized (mocked in this test)
      const renderService = getRenderService();
      await renderService.initialize();
      
      // Verify that both services are initialized
      expect(getFormationService().isInitialized()).toBe(true);
      expect(renderService.isInitialized()).toBe(true);
    });
  });
  
  describe('PhysicsService', () => {
    test('should initialize PhysicsService with configuration', async () => {
      // Initialize PhysicsService with custom configuration
      await initializePhysicsService({
        timeStep: 1/120,
        iterations: 2,
        gravity: { x: 0, y: -9.8, z: 0 }
      });
      
      // Verify that PhysicsService is initialized
      const physicsService = registry.get('PhysicsService');
      expect(physicsService.isInitialized()).toBe(true);
    });
  });
  
  describe('WorkerService', () => {
    test('should initialize WorkerService with worker count', async () => {
      // Initialize WorkerService with 2 workers
      await initializeWorkerService({ workerCount: 2 });
      
      // Verify that WorkerService is initialized
      const workerService = registry.get('WorkerService');
      expect(workerService.isInitialized()).toBe(true);
      expect(workerService.setMaxWorkers).toHaveBeenCalledWith(2);
    });
  });
});
