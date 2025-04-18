/**
 * Domain Integration Tests
 * 
 * This file contains tests to ensure that the different domains
 * can work together properly.
 */

import { getBitcoinService } from '../../domains/bitcoin/services/bitcoinService';
import { getCreatureService } from '../../domains/creature/services/creatureService';
import { getParticleService } from '../../domains/particle/services/particleService';
import { getRenderService } from '../../domains/rendering/services/renderService';
import { getTraitService } from '../../domains/traits/services/traitService';
import { getWorkerService } from '../../domains/workers/services/workerService';
import { getGameTheoryService } from '../../domains/gameTheory/services/gameTheoryService';

describe('Domain Integration', () => {
  // Mock DOM element for rendering
  const mockContainer = document.createElement('div');
  
  beforeAll(() => {
    // Set up mock container
    mockContainer.style.width = '800px';
    mockContainer.style.height = '600px';
    document.body.appendChild(mockContainer);
  });
  
  afterAll(() => {
    // Clean up
    document.body.removeChild(mockContainer);
  });
  
  test('Bitcoin service can initialize', async () => {
    const bitcoinService = getBitcoinService();
    await bitcoinService.initialize();
    expect(bitcoinService.isInitialized()).toBe(true);
  });
  
  test('Bitcoin service can provide block data to other services', async () => {
    const bitcoinService = getBitcoinService();
    await bitcoinService.initialize();
    
    const blockData = await bitcoinService.getBlockData('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
    expect(blockData).toBeDefined();
    
    // Initialize particle service with block data
    const particleService = getParticleService();
    await particleService.initialize(blockData);
    expect(particleService.isInitialized()).toBe(true);
    
    // Initialize creature service with block data
    const creatureService = getCreatureService();
    await creatureService.initialize(blockData);
    expect(creatureService.isInitialized()).toBe(true);
  });
  
  test('Rendering service can initialize and render particles', async () => {
    const renderService = getRenderService();
    await renderService.initialize(mockContainer);
    expect(renderService.isInitialized()).toBe(true);
    
    // Get block data
    const bitcoinService = getBitcoinService();
    const blockData = await bitcoinService.getBlockData('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
    
    // Initialize particle service
    const particleService = getParticleService();
    await particleService.initialize(blockData);
    
    // Create some particles
    const particleCounts = new Map();
    particleCounts.set('CORE', 10);
    particleCounts.set('CONTROL', 20);
    particleCounts.set('ATTACK', 30);
    particleCounts.set('DEFENSE', 40);
    particleCounts.set('MOVEMENT', 50);
    
    particleService.createParticleGroups(particleCounts);
    
    // Update particles
    await particleService.update();
    
    // Render a frame
    renderService.render();
    
    // Check that rendering is working
    expect(renderService.isRendering()).toBe(true);
  });
  
  test('Worker service can process particle updates', async () => {
    // Initialize worker service
    const workerService = getWorkerService();
    await workerService.initialize();
    expect(workerService.isInitialized()).toBe(true);
    
    // Get block data
    const bitcoinService = getBitcoinService();
    const blockData = await bitcoinService.getBlockData('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
    
    // Initialize particle service
    const particleService = getParticleService();
    await particleService.initialize(blockData);
    
    // Create some particles
    const particleCounts = new Map();
    particleCounts.set('CORE', 1000); // Use a large number to trigger worker usage
    particleService.createParticleGroups(particleCounts);
    
    // Update particles (should use workers)
    await particleService.update();
    
    // Check that worker service is being used
    expect(workerService.getActiveWorkers().length).toBeGreaterThan(0);
  });
  
  test('Trait service can apply traits to creatures', async () => {
    // Initialize trait service
    const traitService = getTraitService();
    await traitService.initialize();
    expect(traitService.isInitialized()).toBe(true);
    
    // Get block data
    const bitcoinService = getBitcoinService();
    const blockData = await bitcoinService.getBlockData('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
    
    // Initialize creature service
    const creatureService = getCreatureService();
    await creatureService.initialize(blockData);
    
    // Create a creature
    const creature = await creatureService.createCreature();
    expect(creature).toBeDefined();
    
    // Apply traits
    const traits = await traitService.generateTraitsForCreature(creature);
    expect(traits).toBeDefined();
    expect(Object.keys(traits).length).toBeGreaterThan(0);
    
    // Apply traits to creature
    await creatureService.applyTraitsToCreature(creature.id, traits);
    
    // Get updated creature
    const updatedCreature = creatureService.getCreature(creature.id);
    expect(updatedCreature).toBeDefined();
    expect(updatedCreature?.traits).toBeDefined();
  });
  
  test('Game theory service can simulate creature interactions', async () => {
    // Initialize game theory service
    const gameTheoryService = getGameTheoryService();
    await gameTheoryService.initialize();
    expect(gameTheoryService.isInitialized()).toBe(true);
    
    // Get block data
    const bitcoinService = getBitcoinService();
    const blockData = await bitcoinService.getBlockData('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
    
    // Initialize creature service
    const creatureService = getCreatureService();
    await creatureService.initialize(blockData);
    
    // Create two creatures
    const creature1 = await creatureService.createCreature();
    const creature2 = await creatureService.createCreature();
    
    // Simulate interaction
    const result = await gameTheoryService.simulateInteraction(creature1, creature2);
    expect(result).toBeDefined();
    expect(result.winner).toBeDefined();
    expect(result.loser).toBeDefined();
    expect(result.rounds).toBeGreaterThan(0);
  });
  
  test('Full integration test', async () => {
    // Initialize all services
    const bitcoinService = getBitcoinService();
    await bitcoinService.initialize();
    
    const blockData = await bitcoinService.getBlockData('000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
    
    const workerService = getWorkerService();
    await workerService.initialize();
    
    const renderService = getRenderService();
    await renderService.initialize(mockContainer);
    
    const particleService = getParticleService();
    await particleService.initialize(blockData);
    
    const creatureService = getCreatureService();
    await creatureService.initialize(blockData);
    
    const traitService = getTraitService();
    await traitService.initialize();
    
    const gameTheoryService = getGameTheoryService();
    await gameTheoryService.initialize();
    
    // Create a creature
    const creature = await creatureService.createCreature();
    
    // Generate and apply traits
    const traits = await traitService.generateTraitsForCreature(creature);
    await creatureService.applyTraitsToCreature(creature.id, traits);
    
    // Update creature particles
    await creatureService.updateCreature(creature.id);
    
    // Render the creature
    renderService.render();
    
    // Simulate self-interaction (evolution)
    const result = await gameTheoryService.simulateInteraction(creature, creature);
    
    // Check that everything worked
    expect(bitcoinService.isInitialized()).toBe(true);
    expect(workerService.isInitialized()).toBe(true);
    expect(renderService.isInitialized()).toBe(true);
    expect(particleService.isInitialized()).toBe(true);
    expect(creatureService.isInitialized()).toBe(true);
    expect(traitService.isInitialized()).toBe(true);
    expect(gameTheoryService.isInitialized()).toBe(true);
    
    expect(creature).toBeDefined();
    expect(traits).toBeDefined();
    expect(result).toBeDefined();
  });
});
