/**
 * Evolution Service
 * 
 * Service for managing creature evolution.
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import { Creature } from '../../types/creatures/creature';
import { 
  EvolutionOptions, 
  EvolutionResult, 
  calculateMutationProbability,
  getEvolutionStage
} from '../../types/evolution/evolution';
import { getEvolutionTracker } from './evolutionTracker';
import { getMutationService } from '../mutations/mutationService';
import { Mutation, MutationCategory } from '../../types/mutations/mutation';

// Singleton instance
let instance: EvolutionService | null = null;

/**
 * Evolution Service
 * 
 * Service for handling creature evolution based on block confirmations,
 * applies mutations, and tracks evolution progress.
 */
export class EvolutionService {
  private initialized: boolean = false;
  private blockData: BlockData | null = null;
  private mutationService: any = null;
  
  // Default evolution options
  private evolutionOptions: EvolutionOptions = {
    mutationIntensity: 0.5,
    maxMutationsPerEvent: 3,
    enableExoticMutations: false,
    enableSubclassMutations: true
  };
  
  // Additional mutation configuration
  private mutationWeights: Record<MutationCategory, number> = {
    [MutationCategory.ATTRIBUTE]: 40,
    [MutationCategory.BEHAVIOR]: 25,
    [MutationCategory.ABILITY]: 15,
    [MutationCategory.PARTICLE]: 5,
    [MutationCategory.SUBCLASS]: 5,
    [MutationCategory.SYNERGY]: 5,
    [MutationCategory.FORMATION]: 3,
    [MutationCategory.EXOTIC]: 2
  };
  
  private blockConfirmationThresholds = [1, 3, 6, 12, 24, 48, 96, 144];
  private baseMutationRate = 0.05;
  private rarityMultiplier = 1.2;
  
  /**
   * Initialize the evolution service
   * @param blockData Current block data
   */
  initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.initialized = true;
    
    // Get the mutation service
    this.mutationService = getMutationService();
    
    // Initialize the evolution tracker if not already initialized
    const tracker = getEvolutionTracker();
    if (!tracker.isInitialized()) {
      tracker.initialize();
    }
    
    console.log('Evolution service initialized');
  }
  
  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Set evolution options
   * @param options Evolution options
   */
  setEvolutionOptions(options: Partial<EvolutionOptions>): void {
    this.evolutionOptions = {
      ...this.evolutionOptions,
      ...options
    };
  }
  
  /**
   * Evolve a creature based on current block confirmations
   * @param creature Creature to evolve
   * @returns Evolution result
   */
  evolveCreature(creature: Creature): EvolutionResult {
    if (!this.initialized || !this.blockData) {
      throw new Error('Evolution service not initialized');
    }
    
    if (!this.mutationService || !this.mutationService.isInitialized()) {
      throw new Error('Mutation service not initialized');
    }
    
    // Get the current block confirmations
    const confirmations = this.blockData.confirmations;
    
    // Calculate mutation probability
    const mutationProbability = calculateMutationProbability(confirmations);
    
    // Get the evolution stage based on confirmations
    const evolutionStage = getEvolutionStage(confirmations);
    
    console.log(`Evolving creature ${creature.id} at stage ${evolutionStage} with probability ${mutationProbability}`);
    
    // Apply mutations based on probability
    const appliedMutations: Mutation[] = [];
    
    // Determine how many mutations to apply (at least 1 for important evolution stages)
    const isSignificantStage = evolutionStage !== 'Nascent'; // Any stage above the lowest
    const baseMutationCount = isSignificantStage ? 
      Math.max(1, Math.floor(this.getStageValue(evolutionStage) / 2)) : 
      Math.random() < mutationProbability ? 1 : 0;
      
    // Get mutation count based on stage and probability
    const mutationCount = Math.min(
      baseMutationCount,
      this.evolutionOptions.maxMutationsPerEvent
    );
    
    // Apply mutations if applicable
    if (mutationCount > 0) {
      // Get available mutation categories based on weights
      const availableCategories = this.getWeightedMutationCategories();
      
      // Apply the mutations
      for (let i = 0; i < mutationCount; i++) {
        try {
          // Select a random category based on weights
          const category = this.selectRandomWeightedCategory(availableCategories);
          
          // Generate and apply a mutation of the selected category
          const mutation = this.mutationService.generateMutation(creature, category);
          
          if (mutation) {
            // Apply the mutation to the creature (this modifies the creature)
            this.mutationService.applyMutation(creature, mutation);
            
            // Add to list of applied mutations
            appliedMutations.push(mutation);
          }
        } catch (error) {
          console.error('Error applying mutation:', error);
        }
      }
    }
    
    // Create the evolution result
    const result: EvolutionResult = {
      creatureId: creature.id,
      blockNumber: this.blockData.height,
      confirmations,
      mutations: appliedMutations,
      timestamp: Date.now(),
      strategy: 'DEFAULT'
    };
    
    // Track the evolution
    const tracker = getEvolutionTracker();
    tracker.trackEvolution(
      creature.id,
      this.blockData.height,
      confirmations,
      appliedMutations
    );
    
    return result;
  }
  
  /**
   * Get weighted mutation categories based on configuration
   * @returns Array of categories with weights
   */
  private getWeightedMutationCategories(): Array<{ category: MutationCategory, weight: number }> {
    const categories: Array<{ category: MutationCategory, weight: number }> = [];
    
    for (const category in this.mutationWeights) {
      if (Object.prototype.hasOwnProperty.call(this.mutationWeights, category)) {
        const typedCategory = category as unknown as MutationCategory;
        const weight = this.mutationWeights[typedCategory];
        
        // Only include categories for enabled mutation types
        if (
          typedCategory !== MutationCategory.EXOTIC || this.evolutionOptions.enableExoticMutations
        ) {
          if (
            typedCategory !== MutationCategory.SUBCLASS || this.evolutionOptions.enableSubclassMutations
          ) {
            categories.push({
              category: typedCategory,
              weight
            });
          }
        }
      }
    }
    
    return categories;
  }
  
  /**
   * Select a random category based on weights
   * @param categories Categories with weights
   * @returns Selected category
   */
  private selectRandomWeightedCategory(
    categories: Array<{ category: MutationCategory, weight: number }>
  ): MutationCategory {
    // Calculate total weight
    const totalWeight = categories.reduce((sum, item) => sum + item.weight, 0);
    
    // Generate random value
    const random = Math.random() * totalWeight;
    
    // Find category based on weight
    let weightSum = 0;
    for (const item of categories) {
      weightSum += item.weight;
      if (random <= weightSum) {
        return item.category;
      }
    }
    
    // Fallback to first category
    return categories[0].category;
  }
  
  /**
   * Get numeric value for a stage name
   * @param stage The evolution stage name
   * @returns A numeric value for the stage (higher = better)
   */
  private getStageValue(stage: string): number {
    switch (stage) {
      case 'Transcendent': return 6;
      case 'Awakened': return 5;
      case 'Ascendant': return 4;
      case 'Evolved': return 3;
      case 'Mature': return 2;
      case 'Developing': return 1;
      case 'Nascent':
      default:
        return 0;
    }
  }
}

/**
 * Get the evolution service instance
 * @returns The evolution service instance
 */
export function getEvolutionService(): EvolutionService {
  if (!instance) {
    instance = new EvolutionService();
  }
  return instance;
}

