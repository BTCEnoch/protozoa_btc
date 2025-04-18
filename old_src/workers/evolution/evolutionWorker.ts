/**
 * Evolution Worker for Bitcoin Protozoa
 * 
 * This worker calculates and applies mutations based on block confirmations.
 * It handles the evolution of creatures over time following the project rules.
 */

import { WorkerMessage } from '../../types/workers/messages';
import { Mutation, MutationCategory } from '../../types/mutations';
import { Role, Rarity } from '../../types/core';
import { CreatureGroup } from '../../types/creatures';

// Confirmation milestones and corresponding mutation chances
const CONFIRMATION_MILESTONES = [10000, 50000, 100000, 250000, 500000, 1000000];
const MUTATION_CHANCES = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

// Rarity distribution weights
const RARITY_WEIGHTS = {
  [Rarity.COMMON]: 0.4,      // 40%
  [Rarity.UNCOMMON]: 0.3,    // 30%
  [Rarity.RARE]: 0.2,        // 20%
  [Rarity.EPIC]: 0.08,       // 8%
  [Rarity.LEGENDARY]: 0.02,  // 2%
  [Rarity.MYTHIC]: 0.0       // Not available through standard mutations
};

// Worker state
let seedValue = 0;
let rngState = 0;
let maxMutationsPerEvent = 3;
let enableSubclassMutations = true;
let enableExoticMutations = false;
let mutationIntensity = 0.5;

/**
 * Simple Mulberry32 RNG implementation
 * @param seed The seed value
 * @returns Random number between 0 and 1
 */
function mulberry32(seed: number): number {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

/**
 * Get next random number
 * @returns Random number between 0 and 1
 */
function random(): number {
  rngState = mulberry32(rngState) * 4294967296;
  return mulberry32(rngState);
}

/**
 * Get random boolean with given probability
 * @param probability The probability of returning true (0-1)
 * @returns Random boolean
 */
function randomBool(probability: number = 0.5): boolean {
  return random() < probability;
}

/**
 * Get random integer between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Choose a random item from an array
 * @param array The array to choose from
 * @returns Random item from the array
 */
function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Get the mutation chance based on confirmation count
 * @param confirmations Number of block confirmations
 * @returns Mutation chance (0-1)
 */
function getMutationChance(confirmations: number): number {
  for (let i = CONFIRMATION_MILESTONES.length - 1; i >= 0; i--) {
    if (confirmations >= CONFIRMATION_MILESTONES[i]) {
      return MUTATION_CHANCES[i];
    }
  }
  return 0; // No chance of mutation below lowest milestone
}

/**
 * Select mutation rarity based on weights
 * @returns Selected rarity
 */
function selectMutationRarity(): Rarity {
  const roll = random();
  let cumulativeWeight = 0;
  
  for (const rarity of Object.values(Rarity)) {
    if (typeof rarity === 'number') {
      const weight = RARITY_WEIGHTS[rarity] || 0;
      cumulativeWeight += weight;
      
      if (roll < cumulativeWeight) {
        return rarity;
      }
    }
  }
  
  return Rarity.COMMON; // Fallback
}

/**
 * Check if mutations should be applied based on confirmation count
 * @param confirmations Number of block confirmations
 * @returns Whether mutations should be applied
 */
function shouldApplyMutations(confirmations: number): boolean {
  const chance = getMutationChance(confirmations);
  return randomBool(chance);
}

/**
 * Generate mutations for a creature group
 * @param creatureGroup The creature group
 * @param confirmations Number of block confirmations
 * @param currentMutations Current mutations
 * @returns Array of new mutations
 */
function generateMutations(
  creatureGroup: CreatureGroup,
  confirmations: number,
  currentMutations: Mutation[]
): Mutation[] {
  if (!shouldApplyMutations(confirmations)) {
    return [];
  }
  
  const role = creatureGroup.role;
  const newMutations: Mutation[] = [];
  const mutationCount = randomInt(1, maxMutationsPerEvent);
  
  for (let i = 0; i < mutationCount; i++) {
    // Select mutation rarity
    const rarity = selectMutationRarity();
    
    // Generate a mutation (this is a placeholder, actual mutation would be drawn from a pool)
    const mutation: Mutation = {
      id: `mutation_${Date.now()}_${i}`,
      name: `${rarity} ${role} Mutation`,
      description: `A mutation affecting the ${role} role with ${rarity} rarity`,
      category: MutationCategory.ATTRIBUTE, // Using the proper enum value
      rarity,
      confirmationThreshold: confirmations,
      appliedAt: Date.now(),
      
      // Attribute bonuses - would be more specific in real implementation
      attributeBonuses: {},
      
      // Apply effect function - would have actual implementation
      applyEffect: (group: CreatureGroup): CreatureGroup => {
        // Placeholder implementation
        return group;
      },
      
      // Metadata
      compatibleRoles: [role],
      incompatibleWith: [],
      requiresMutations: []
    };
    
    newMutations.push(mutation);
  }
  
  return newMutations;
}

/**
 * Apply mutations to a creature
 * @param creatureData Creature data
 * @param confirmations Block confirmations
 * @returns Updated creature data with applied mutations
 */
function applyEvolution(creatureData: any, confirmations: number): any {
  const updatedCreature = { ...creatureData };
  
  // Iterate through each group in the creature
  if (updatedCreature.groups) {
    for (const groupId in updatedCreature.groups) {
      let group = updatedCreature.groups[groupId]; // Changed to let instead of const
      
      // Get current mutations for this group
      const currentMutations: Mutation[] = group.mutations || [];
      
      // Generate new mutations
      const newMutations = generateMutations(
        group,
        confirmations,
        currentMutations
      );
      
      if (newMutations.length > 0) {
        // Apply the effects of each new mutation
        for (const mutation of newMutations) {
          group = mutation.applyEffect(group);
        }
        
        // Add new mutations to the list
        group.mutations = [...currentMutations, ...newMutations];
        
        // Store the updated group
        updatedCreature.groups[groupId] = group;
      }
    }
  }
  
  return updatedCreature;
}

/**
 * Set the worker configuration
 * @param config Worker configuration
 */
function setConfig(config: any): void {
  seedValue = config.seed !== undefined ? config.seed : seedValue;
  rngState = seedValue;
  maxMutationsPerEvent = config.maxMutationsPerEvent || maxMutationsPerEvent;
  enableSubclassMutations = config.enableSubclassMutations !== undefined ? 
    config.enableSubclassMutations : enableSubclassMutations;
  enableExoticMutations = config.enableExoticMutations !== undefined ?
    config.enableExoticMutations : enableExoticMutations;
  mutationIntensity = config.mutationIntensity !== undefined ?
    config.mutationIntensity : mutationIntensity;
}

/**
 * Reset the worker to its initial state
 */
function resetWorker(): void {
  seedValue = 0;
  rngState = 0;
  maxMutationsPerEvent = 3;
  enableSubclassMutations = true;
  enableExoticMutations = false;
  mutationIntensity = 0.5;
}

/**
 * Handle messages from the main thread
 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'evolution.calculate':
      const result = applyEvolution(data.creature, data.confirmations);
      self.postMessage({ 
        type: 'evolution.result',
        data: {
          creatureId: data.creature.id,
          evolutionResult: result
        }
      });
      break;
    
    case 'evolution.setConfig':
      setConfig(data);
      break;
    
    case 'evolution.reset':
      resetWorker();
      break;
      
    default:
      console.warn(`Unknown message type: ${type}`);
  }
};

// Let main thread know worker is ready
self.postMessage({ type: 'evolution.ready' }); 