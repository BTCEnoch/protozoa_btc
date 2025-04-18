/**
 * Game Theory Strategy Service
 *
 * This service provides a unified way to make strategic decisions using
 * payoff matrices, Nash equilibria, decision trees, and utility functions.
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import { Role } from '../../types/core';
import { Creature } from '../../types/creatures/creature';
import { PayoffMatrix, StrategyProfile } from '../../types/gameTheory/payoffMatrix';
import { NashEquilibrium } from '../../types/gameTheory/nashEquilibrium';
import { DecisionPath, DecisionNode, DecisionTree } from '../../types/gameTheory/decisionTree';
import { getPayoffMatrixService } from './payoffMatrixService';
import { getNashEquilibriumFinder } from './nashEquilibriumFinder';
import { getDecisionTreeService } from './decisionTreeService';
import { getUtilityFunctionService } from './utilityFunctionService';

/**
 * Strategy decision result interface
 * Contains the result of a strategic decision
 */
export interface StrategyDecisionResult {
  chosenStrategy: string;
  expectedPayoff: number;
  confidence: number;
  alternativeStrategies: string[];
  reasoning: string;
  equilibrium?: NashEquilibrium;
}

/**
 * Multi-step decision result interface
 * Contains the result of a multi-step decision process
 */
export interface MultiStepDecisionResult {
  // The sequence of decisions to be made
  decisions: string[];
  // The expected total payoff
  expectedTotalPayoff: number;
  // Confidence in the decision path (0-1)
  confidence: number;
  // Alternative decision paths
  alternativePaths: string[][];
  // Reasoning for the decision path
  reasoning: string;
  // The full decision path from the decision tree
  path?: DecisionPath;
}

/**
 * Creature interaction context interface
 * Contains context for creature interactions
 */
export interface CreatureInteractionContext {
  environment?: 'battle' | 'cooperation' | 'exploration' | 'evolution';
  threatLevel?: number; // 0-1 scale
  resourceScarcity?: number; // 0-1 scale
  socialFactor?: number; // 0-1 scale
  timeConstraint?: number; // 0-1 scale
  previousInteractions?: Record<string, number>; // Maps creature IDs to interaction counts
}

/**
 * Singleton instance
 */
let instance: GameTheoryStrategyService | null = null;

/**
 * Game Theory Strategy Service class
 * Provides unified methods for strategic decision-making
 */
export class GameTheoryStrategyService {
  private blockData: BlockData | null = null;
  private initialized: boolean = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): GameTheoryStrategyService {
    if (!instance) {
      instance = new GameTheoryStrategyService();
    }
    return instance;
  }

  /**
   * Initialize the service with block data
   * @param blockData Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    if (!blockData) {
      throw new Error('Invalid blockData provided to GameTheoryStrategyService');
    }
    
    try {
      // Initialize dependent services
      const payoffService = getPayoffMatrixService();
      const nashFinder = getNashEquilibriumFinder();
      const decisionService = getDecisionTreeService();
      const utilityService = getUtilityFunctionService();
      
      // Check if any service is already initialized
      const alreadyInitialized = false;
      
      // Initialize each service and track success
      const successful = [
        this.initializeService(payoffService, blockData, 'PayoffMatrixService'),
        this.initializeService(nashFinder, blockData, 'NashEquilibriumFinder'),
        this.initializeService(decisionService, blockData, 'DecisionTreeService'),
        this.initializeService(utilityService, blockData, 'UtilityFunctionService')
      ];
      
      // Set our block data and initialized state
      this.blockData = blockData;
      
      // Only mark as initialized if all dependent services initialized
      if (successful.every(success => success)) {
        this.initialized = true;
        console.log('Game Theory Strategy Service initialized successfully');
      } else {
        console.warn('Game Theory Strategy Service initialized with warnings');
        this.initialized = true; // Still mark as initialized but with reduced functionality
      }
    } catch (error) {
      console.error('Failed to initialize Game Theory Strategy Service:', error);
      throw new Error(`Game Theory Strategy Service initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Initialize a service and handle errors
   * @param service The service to initialize
   * @param blockData The block data to initialize with
   * @param serviceName The name of the service for logging
   * @returns Whether initialization was successful
   */
  private initializeService(service: any, blockData: BlockData, serviceName: string): boolean {
    try {
      service.initialize(blockData);
      return true;
    } catch (error) {
      console.error(`Failed to initialize ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Check if the service is initialized
   * @returns Whether the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Determine the optimal strategy for a creature in an interaction with another creature
   * @param creature1 The first creature (for whom we're determining strategy)
   * @param creature2 The second creature (opponent/partner)
   * @param context Interaction context
   * @returns The optimal strategy decision
   */
  determineCreatureStrategy(
    creature1: Creature,
    creature2: Creature,
    context?: CreatureInteractionContext
  ): StrategyDecisionResult {
    if (!this.isInitialized()) {
      throw new Error('Game Theory Strategy Service not initialized');
    }
    
    // Create payoff matrix for the interaction
    const payoffMatrix = this.createCreatureInteractionMatrix(creature1, creature2, context);
    
    // Find Nash equilibria in the matrix
    const equilibria = getNashEquilibriumFinder().findNashEquilibria(payoffMatrix);
    
    // Select the best equilibrium for the first creature
    const bestEquilibrium = getNashEquilibriumFinder().findBestNashEquilibrium(
      payoffMatrix, 
      creature1.id
    );
    
    // If no Nash equilibrium found, choose based on max payoff
    if (!bestEquilibrium) {
      return this.determineMaxPayoffStrategy(creature1, payoffMatrix);
    }
    
    // Extract the chosen strategy and payoff
    const chosenStrategy = bestEquilibrium.profile[creature1.id];
    const expectedPayoff = bestEquilibrium.payoffs[creature1.id];
    
    // Calculate confidence based on equilibrium type and payoff difference
    const confidence = this.calculateStrategyConfidence(
      payoffMatrix,
      bestEquilibrium,
      creature1.id
    );
    
    // Get alternative strategies ordered by payoff
    const alternativeStrategies = this.getAlternativeStrategies(
      payoffMatrix,
      bestEquilibrium,
      creature1.id
    );
    
    // Generate reasoning for the decision
    const reasoning = this.generateStrategyReasoning(
      bestEquilibrium,
      creature1,
      creature2,
      context
    );
    
    return {
      chosenStrategy,
      expectedPayoff,
      confidence,
      alternativeStrategies,
      reasoning,
      equilibrium: bestEquilibrium
    };
  }
  
  /**
   * Create a payoff matrix for creature interaction
   * @param creature1 The first creature
   * @param creature2 The second creature
   * @param context Interaction context
   * @returns Payoff matrix for the interaction
   */
  private createCreatureInteractionMatrix(
    creature1: Creature,
    creature2: Creature,
    context?: CreatureInteractionContext
  ): PayoffMatrix {
    if (!this.isInitialized()) {
      throw new Error('Game Theory Strategy Service not initialized');
    }
    
    try {
      // Determine the dominant role for each creature
      const creature1Role = this.getDominantRole(creature1);
      const creature2Role = this.getDominantRole(creature2);
      
      // Use PayoffMatrixService to create a standard matrix
      const matrix = getPayoffMatrixService().createStandardCreatureMatrix(
        creature1.id,
        creature2.id,
        creature1Role,
        creature2Role
      );
      
      // Apply context modifiers if provided
      if (context) {
        this.applyContextToMatrix(matrix, context, creature1Role, creature2Role);
      }
      
      return matrix;
    } catch (error) {
      console.error('Error creating interaction matrix:', error);
      
      // Fallback to a simple 2x2 matrix
      return this.createFallbackMatrix(creature1, creature2);
    }
  }
  
  /**
   * Create a simple fallback matrix when normal creation fails
   * @param creature1 First creature
   * @param creature2 Second creature
   * @returns Simple fallback payoff matrix
   */
  private createFallbackMatrix(creature1: Creature, creature2: Creature): PayoffMatrix {
    const strategies = {
      [creature1.id]: ['balanced', 'aggressive'],
      [creature2.id]: ['balanced', 'aggressive']
    };
    
    const payoffs = {
      [creature1.id]: {
        'balanced': {
          'balanced': 5,
          'aggressive': 3
        },
        'aggressive': {
          'balanced': 7,
          'aggressive': 2
        }
      },
      [creature2.id]: {
        'balanced': {
          'balanced': 5,
          'aggressive': 7
        },
        'aggressive': {
          'balanced': 3,
          'aggressive': 2
        }
      }
    };
    
    return {
      players: [creature1.id, creature2.id],
      strategies,
      payoffs
    };
  }
  
  /**
   * Apply context modifiers to a payoff matrix
   * @param matrix The payoff matrix to modify
   * @param context The interaction context
   * @param role1 Role of the first creature
   * @param role2 Role of the second creature
   */
  private applyContextToMatrix(
    matrix: PayoffMatrix,
    context: CreatureInteractionContext,
    role1: Role,
    role2: Role
  ): void {
    // Strategy modifiers based on environment type
    const environmentModifiers: Record<string, Record<string, number>> = {
      'battle': {
        'aggressive': 2.5,
        'tactical': 2,
        'counter': 2,
        'opportunistic': 1.5,
        'evasive': 1
      },
      'cooperation': {
        'supportive': 3,
        'balanced': 2,
        'adaptive': 2,
        'commanding': 1.5
      },
      'exploration': {
        'unpredictable': 2.5,
        'swift': 2,
        'flanking': 1.5,
        'adaptive': 1.5
      },
      'evolution': {
        'adaptive': 3,
        'resilient': 2.5,
        'balanced': 1.5
      }
    };
    
    // Threat level modifiers
    const threatModifiers: Record<string, number> = {
      'protective': 3,
      'evasive': 2.5,
      'counter': 2,
      'tactical': 1.5,
      'resilient': 1.5
    };
    
    // Resource scarcity modifiers
    const scarcityModifiers: Record<string, number> = {
      'aggressive': 2.5,
      'opportunistic': 3,
      'tactical': 1.5,
      'disruptive': 2
    };
    
    // Role synergy/counter modifiers
    const roleSynergies: Record<Role, Record<Role, number>> = {
      [Role.ATTACK]: {
        [Role.ATTACK]: 0.8,    // Diminishing returns with two attackers
        [Role.DEFENSE]: 1.2,   // Attack+Defense is balanced
        [Role.CONTROL]: 1.5,   // Attack benefits from control
        [Role.MOVEMENT]: 1.3,  // Attack benefits from movement
        [Role.CORE]: 1.1       // Core provides stability
      },
      [Role.DEFENSE]: {
        [Role.ATTACK]: 1.2,    // Defense complements attack
        [Role.DEFENSE]: 0.9,   // Diminishing returns with two defenders
        [Role.CONTROL]: 1.4,   // Defense benefits from control
        [Role.MOVEMENT]: 0.9,  // Less benefit from movement
        [Role.CORE]: 1.3       // Core enhances defense
      },
      [Role.CONTROL]: {
        [Role.ATTACK]: 1.4,    // Control enhances attack
        [Role.DEFENSE]: 1.3,   // Control enhances defense
        [Role.CONTROL]: 0.7,   // Diminishing returns with two controllers
        [Role.MOVEMENT]: 1.2,  // Movement enhances control
        [Role.CORE]: 1.1       // Core provides stability
      },
      [Role.MOVEMENT]: {
        [Role.ATTACK]: 1.3,    // Movement enhances attack
        [Role.DEFENSE]: 1.0,   // Neutral with defense
        [Role.CONTROL]: 1.1,   // Slight benefit with control
        [Role.MOVEMENT]: 0.8,  // Diminishing returns with two movers
        [Role.CORE]: 1.2       // Core stabilizes movement
      },
      [Role.CORE]: {
        [Role.ATTACK]: 1.1,    // Core supports attack
        [Role.DEFENSE]: 1.3,   // Core significantly enhances defense
        [Role.CONTROL]: 1.2,   // Core enhances control
        [Role.MOVEMENT]: 1.1,  // Core supports movement
        [Role.CORE]: 1.0       // Neutral with another core
      }
    };
    
    // Apply modifiers to each strategy pair
    for (const player of matrix.players) {
      for (const strategy in matrix.payoffs[player]) {
        for (const opponentStrategy in matrix.payoffs[player][strategy]) {
          // Get current payoff
          const currentPayoff = matrix.payoffs[player][strategy][opponentStrategy];
          let modifiedPayoff = currentPayoff;
          
          // Apply environment modifier
          if (context.environment && environmentModifiers[context.environment]) {
            const modifiers = environmentModifiers[context.environment];
            if (modifiers[strategy]) {
              modifiedPayoff += modifiers[strategy];
            }
          }
          
          // Apply threat level modifier
          if (context.threatLevel !== undefined && context.threatLevel > 0.5) {
            const threatFactor = context.threatLevel - 0.5; // 0 to 0.5
            for (const [strategyType, modifier] of Object.entries(threatModifiers)) {
              if (strategy === strategyType) {
                modifiedPayoff += Math.floor(modifier * threatFactor * 2); // Scale from 0-3
              }
            }
          }
          
          // Apply resource scarcity modifier
          if (context.resourceScarcity !== undefined && context.resourceScarcity > 0.4) {
            const scarcityFactor = context.resourceScarcity - 0.4; // 0 to 0.6
            for (const [strategyType, modifier] of Object.entries(scarcityModifiers)) {
              if (strategy === strategyType) {
                modifiedPayoff += Math.floor(modifier * scarcityFactor * 2); // Scale from 0-3
              }
            }
          }
          
          // Apply role synergy modifier
          const otherPlayer = matrix.players.find(p => p !== player)!;
          const otherIndex = matrix.players.indexOf(otherPlayer);
          const roleMultiplier = player === matrix.players[0] 
            ? roleSynergies[role1][role2]
            : roleSynergies[role2][role1];
            
          modifiedPayoff = Math.round(modifiedPayoff * roleMultiplier);
          
          // Apply social factor if provided (increases cooperative payoffs)
          if (context.socialFactor !== undefined && context.socialFactor > 0.5) {
            const socialBonus = Math.floor((context.socialFactor - 0.5) * 4);
            // If both strategies are cooperative (not aggressive/opportunistic)
            if (!['aggressive', 'opportunistic'].includes(strategy) && 
                !['aggressive', 'opportunistic'].includes(opponentStrategy)) {
              modifiedPayoff += socialBonus;
            }
          }
          
          // Apply previous interaction modifier if available
          if (context.previousInteractions) {
            const otherPlayer = matrix.players.find(p => p !== player)!;
            const interactionCount = context.previousInteractions[otherPlayer] || 0;
            
            if (interactionCount > 0) {
              // Familiarity bonus (scales with number of previous interactions)
              const familiarityBonus = Math.min(2, Math.log2(interactionCount + 1));
              modifiedPayoff += familiarityBonus;
            }
          }
          
          // Cap payoff to avoid extreme values (minimum 1, maximum 20)
          modifiedPayoff = Math.max(1, Math.min(20, modifiedPayoff));
          
          // Update the payoff
          matrix.payoffs[player][strategy][opponentStrategy] = modifiedPayoff;
        }
      }
    }
  }
  
  /**
   * Determine the dominant role for a creature
   * @param creature The creature
   * @returns The dominant role
   */
  private getDominantRole(creature: Creature): Role {
    // Simple implementation - find the role with the most particles
    const roleCounts: Record<Role, number> = {} as Record<Role, number>;
    
    // Initialize counts
    for (const role of Object.values(Role)) {
      roleCounts[role] = 0;
    }
    
    // Count particles by role
    for (const group of creature.groups) {
      roleCounts[group.role] += group.particles;
    }
    
    // Find role with maximum particles
    let maxCount = 0;
    let dominantRole = Role.CORE;
    
    for (const role of Object.values(Role)) {
      if (roleCounts[role] > maxCount) {
        maxCount = roleCounts[role];
        dominantRole = role;
      }
    }
    
    return dominantRole;
  }
  
  /**
   * Determine strategy based on maximum payoff
   * @param creature The creature
   * @param matrix The payoff matrix
   * @returns Strategy decision result
   */
  private determineMaxPayoffStrategy(
    creature: Creature,
    matrix: PayoffMatrix
  ): StrategyDecisionResult {
    const player = creature.id;
    const strategies = matrix.strategies[player];
    const opponentId = matrix.players.find(p => p !== player)!;
    
    // Find strategy with maximum average payoff
    let maxPayoff = -Infinity;
    let bestStrategy = strategies[0];
    
    for (const strategy of strategies) {
      let totalPayoff = 0;
      let count = 0;
      
      for (const opponentStrategy of matrix.strategies[opponentId]) {
        totalPayoff += matrix.payoffs[player][strategy][opponentStrategy];
        count++;
      }
      
      const avgPayoff = totalPayoff / count;
      
      if (avgPayoff > maxPayoff) {
        maxPayoff = avgPayoff;
        bestStrategy = strategy;
      }
    }
    
    // Get alternative strategies
    const alternatives = strategies
      .filter(s => s !== bestStrategy)
      .sort((a, b) => {
        const avgA = this.getAveragePayoff(matrix, player, a);
        const avgB = this.getAveragePayoff(matrix, player, b);
        return avgB - avgA;
      });
    
    return {
      chosenStrategy: bestStrategy,
      expectedPayoff: maxPayoff,
      confidence: 0.5, // Medium confidence when no Nash equilibrium
      alternativeStrategies: alternatives,
      reasoning: `No Nash equilibrium found. Strategy '${bestStrategy}' chosen based on maximum average payoff.`
    };
  }
  
  /**
   * Calculate average payoff for a strategy
   * @param matrix Payoff matrix
   * @param player Player ID
   * @param strategy Strategy to evaluate
   * @returns Average payoff
   */
  private getAveragePayoff(
    matrix: PayoffMatrix,
    player: string,
    strategy: string
  ): number {
    const opponentId = matrix.players.find(p => p !== player)!;
    let totalPayoff = 0;
    let count = 0;
    
    for (const opponentStrategy of matrix.strategies[opponentId]) {
      totalPayoff += matrix.payoffs[player][strategy][opponentStrategy];
      count++;
    }
    
    return totalPayoff / count;
  }
  
  /**
   * Calculate confidence in a strategy
   * @param matrix Payoff matrix
   * @param equilibrium Nash equilibrium
   * @param player Player ID
   * @returns Confidence score (0-1)
   */
  private calculateStrategyConfidence(
    matrix: PayoffMatrix,
    equilibrium: NashEquilibrium,
    player: string
  ): number {
    // Strict equilibria give higher confidence
    const strictBonus = equilibrium.isStrict ? 0.3 : 0;
    
    // Calculate payoff advantage over next best strategy
    const chosenStrategy = equilibrium.profile[player];
    const chosenPayoff = equilibrium.payoffs[player];
    
    // Get payoffs for alternative strategies
    const strategies = matrix.strategies[player];
    const opponent = matrix.players.find(p => p !== player)!;
    const opponentStrategy = equilibrium.profile[opponent];
    
    let nextBestPayoff = -Infinity;
    
    for (const strategy of strategies) {
      if (strategy !== chosenStrategy) {
        const payoff = matrix.payoffs[player][strategy][opponentStrategy];
        if (payoff > nextBestPayoff) {
          nextBestPayoff = payoff;
        }
      }
    }
    
    // Calculate payoff advantage as percentage of chosen payoff
    const payoffAdvantage = chosenPayoff - nextBestPayoff;
    const payoffRatio = payoffAdvantage > 0 ? 
      Math.min(payoffAdvantage / Math.max(1, chosenPayoff), 0.5) : 0;
    
    // Base confidence
    const baseConfidence = 0.5;
    
    return Math.min(1, baseConfidence + strictBonus + payoffRatio);
  }
  
  /**
   * Get alternative strategies ordered by payoff
   * @param matrix Payoff matrix
   * @param equilibrium Nash equilibrium
   * @param player Player ID
   * @returns Alternative strategies in order of preference
   */
  private getAlternativeStrategies(
    matrix: PayoffMatrix,
    equilibrium: NashEquilibrium,
    player: string
  ): string[] {
    const chosenStrategy = equilibrium.profile[player];
    const opponent = matrix.players.find(p => p !== player)!;
    const opponentStrategy = equilibrium.profile[opponent];
    
    // Get all strategies except the chosen one
    const alternatives = matrix.strategies[player].filter(s => s !== chosenStrategy);
    
    // Sort by payoff (descending)
    return alternatives.sort((a, b) => {
      const payoffA = matrix.payoffs[player][a][opponentStrategy];
      const payoffB = matrix.payoffs[player][b][opponentStrategy];
      return payoffB - payoffA;
    });
  }
  
  /**
   * Generate reasoning for a strategy decision
   * @param equilibrium Nash equilibrium
   * @param creature1 First creature
   * @param creature2 Second creature
   * @param context Interaction context
   * @returns Reasoning string
   */
  private generateStrategyReasoning(
    equilibrium: NashEquilibrium,
    creature1: Creature,
    creature2: Creature,
    context?: CreatureInteractionContext
  ): string {
    const strategy = equilibrium.profile[creature1.id];
    const payoff = equilibrium.payoffs[creature1.id];
    const equilibriumType = equilibrium.isStrict ? 'strict' : 'weak';
    const creature1Role = this.getDominantRole(creature1);
    const creature2Role = this.getDominantRole(creature2);
    
    let reasoning = `Strategy '${strategy}' is a ${equilibriumType} Nash equilibrium with expected payoff ${payoff}. `;
    
    reasoning += `${creature1Role} vs ${creature2Role} interaction favors this approach. `;
    
    if (context?.environment) {
      reasoning += `The ${context.environment} environment was a factor in this decision. `;
    }
    
    if (context?.threatLevel && context.threatLevel > 0.7) {
      reasoning += `High threat level (${context.threatLevel.toFixed(2)}) influenced the decision. `;
    }
    
    if (context?.resourceScarcity && context.resourceScarcity > 0.5) {
      reasoning += `Resource scarcity (${context.resourceScarcity.toFixed(2)}) was considered. `;
    }
    
    return reasoning;
  }

  /**
   * Determine a multi-step strategy for a creature using decision trees
   * @param creature The creature for which to determine strategy
   * @param context The current context/state information
   * @param options Optional parameters for decision tree generation
   * @returns The multi-step decision result
   */
  determineMultiStepStrategy(
    creature: Creature,
    context: any,
    options?: {
      maxDepth?: number;
      payoffMultiplier?: number;
    }
  ): MultiStepDecisionResult {
    if (!this.isInitialized()) {
      throw new Error('Game Theory Strategy Service not initialized');
    }
    
    // Determine the dominant role for the creature
    const role = this.getDominantRole(creature);
    
    // Create a decision tree
    const decisionTree = getDecisionTreeService().createDecisionTree(
      creature.id,
      role,
      options
    );
    
    // Evaluate the decision tree to find the optimal path
    const path = getDecisionTreeService().evaluateDecisionTree(decisionTree, context) as DecisionPath;
    
    if (Array.isArray(path)) {
      // If multiple paths were returned, use the first one (best path)
      return this.processDecisionPath(path[0], decisionTree, creature, context);
    }
    
    // Process a single path
    return this.processDecisionPath(path, decisionTree, creature, context);
  }
  
  /**
   * Process a decision path into a MultiStepDecisionResult
   * @param path The decision path to process
   * @param decisionTree The decision tree
   * @param creature The creature
   * @param context The context/state information
   * @returns Processed multi-step decision result
   */
  private processDecisionPath(
    path: DecisionPath,
    decisionTree: DecisionTree,
    creature: Creature,
    context: any
  ): MultiStepDecisionResult {
    // Extract decisions from the path
    const decisions = path.nodes.map(node => node.decision);
    
    // Calculate confidence based on path payoff and alternative paths
    const confidence = this.calculatePathConfidence(path, decisionTree, context);
    
    // Get alternative paths
    const alternativePaths = this.getAlternativePaths(decisionTree, path, context);
    
    // Generate reasoning for the decision path
    const reasoning = this.generatePathReasoning(path, creature, context);
    
    return {
      decisions,
      expectedTotalPayoff: path.totalPayoff,
      confidence,
      alternativePaths,
      reasoning,
      path
    };
  }
  
  /**
   * Calculate confidence for a decision path
   * @param path The selected path
   * @param tree The decision tree
   * @param context The current context
   * @returns Confidence score (0-1)
   */
  private calculatePathConfidence(
    path: DecisionPath,
    tree: any,
    context: any
  ): number {
    // Base confidence starts at 0.6
    let confidence = 0.6;
    
    // Adjust confidence based on payoff
    // Higher payoffs generally mean more confidence
    if (path.totalPayoff > 20) {
      confidence += 0.2;
    } else if (path.totalPayoff > 10) {
      confidence += 0.1;
    } else if (path.totalPayoff < 5) {
      confidence -= 0.1;
    }
    
    // Adjust confidence based on path length
    // Longer paths generally have lower confidence
    if (path.nodes.length > 4) {
      confidence -= 0.1;
    } else if (path.nodes.length <= 2) {
      confidence += 0.1;
    }
    
    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Get alternative decision paths
   * @param tree The decision tree
   * @param selectedPath The selected path
   * @param context The current context
   * @returns Array of alternative decision paths
   */
  private getAlternativePaths(
    tree: any,
    selectedPath: DecisionPath,
    context: any
  ): string[][] {
    // Request multiple paths from the decision tree service
    try {
      const allPaths = getDecisionTreeService().evaluateDecisionTree(
        tree,
        context,
        { returnTopN: 3 }
      ) as DecisionPath[];
      
      if (Array.isArray(allPaths)) {
        // Filter out the selected path and extract decisions
        return allPaths
          .filter(p => p.totalPayoff !== selectedPath.totalPayoff) // Exclude selected path
          .map(p => p.nodes.map(n => n.decision));
      }
    } catch (error) {
      console.error('Error getting alternative paths:', error);
    }
    
    // Fallback to simpler approach if the above fails
    const alternatives: string[][] = [];
    
    // Create a modified version of the selected path
    if (selectedPath.nodes.length > 1) {
      // Create an alternative by swapping the last two decisions
      const altPath1 = [...selectedPath.nodes.map(node => node.decision)];
      if (altPath1.length > 2) {
        const temp = altPath1[altPath1.length - 1];
        altPath1[altPath1.length - 1] = altPath1[altPath1.length - 2];
        altPath1[altPath1.length - 2] = temp;
        alternatives.push(altPath1);
      }
      
      // Create an alternative by removing the last decision
      const altPath2 = selectedPath.nodes.slice(0, -1).map(node => node.decision);
      if (altPath2.length > 0) {
        alternatives.push(altPath2);
      }
    }
    
    return alternatives;
  }
  
  /**
   * Generate reasoning for a decision path
   * @param path The decision path
   * @param creature The creature
   * @param context The current context
   * @returns Reasoning string
   */
  private generatePathReasoning(
    path: DecisionPath,
    creature: Creature,
    context: any
  ): string {
    const role = this.getDominantRole(creature);
    const decisionNames = path.nodes.map(node => node.decision).join(' → ');
    
    let reasoning = `Multi-step strategy: ${decisionNames} with total payoff ${path.totalPayoff}. `;
    
    reasoning += `Based on ${role} role characteristics and current conditions. `;
    
    // Add context-specific reasoning
    if (context.environment) {
      reasoning += `Consideration given to ${context.environment} environment factors. `;
    }
    
    if (context.threatLevel && context.threatLevel > 0.5) {
      reasoning += `Threat level (${context.threatLevel.toFixed(2)}) influenced the decision sequence. `;
    }
    
    // Add path-specific reasoning
    reasoning += `Decision path optimized for ${path.nodes.length} steps ahead. `;
    
    return reasoning;
  }

  /**
   * Evaluate multiple strategies using utility functions
   * @param creature The creature
   * @param strategies Array of strategies to evaluate
   * @param factors Current situation factors
   * @param customWeights Optional custom weights for utility calculation
   * @returns Array of strategies with their utility scores
   */
  evaluateStrategiesWithUtility(
    creature: Creature,
    strategies: string[],
    factors: Record<string, number>,
    customWeights?: Record<string, number>
  ): Array<{ strategy: string; utility: number; reasoning: string; confidence: number }> {
    if (!this.isInitialized()) {
      throw new Error('Game Theory Strategy Service not initialized');
    }
    
    try {
      // Determine the dominant role for the creature
      const role = this.getDominantRole(creature);
      
      // Create a utility function for the role
      const utilityFunction = getUtilityFunctionService().createUtilityFunction(
        role,
        customWeights
      );
      
      // Evaluate each strategy
      const evaluations = strategies.map(strategy => {
        // Modify factors based on strategy
        const modifiedFactors = this.getStrategyFactors(strategy, factors);
        
        // Calculate utility
        const utility = utilityFunction.calculate(modifiedFactors);
        
        // Generate reasoning
        const reasoning = this.generateUtilityReasoning(strategy, modifiedFactors, utility, role);
        
        return {
          strategy,
          utility,
          reasoning,
          confidence: 0.5 // Initial placeholder value
        };
      });
      
      // Calculate statistical measures across all evaluations for better confidence
      if (evaluations.length > 1) {
        const utilities = evaluations.map(e => e.utility);
        const maxUtility = Math.max(...utilities);
        const minUtility = Math.min(...utilities);
        const range = maxUtility - minUtility;
        const mean = utilities.reduce((sum, u) => sum + u, 0) / utilities.length;
        
        // Calculate variance and standard deviation
        const variance = utilities.reduce((sum, u) => sum + Math.pow(u - mean, 2), 0) / utilities.length;
        const stdDev = Math.sqrt(variance);
        
        // Calculate coefficient of variation (CV) to gauge relative spread
        const cv = mean !== 0 ? stdDev / mean : 0;
        
        // Update confidence for each evaluation based on statistical significance
        evaluations.forEach(evaluation => {
          // 1. Distance from mean (z-score) - higher z-score means more significant difference
          const zScore = stdDev > 0 ? Math.abs(evaluation.utility - mean) / stdDev : 0;
          
          // 2. Relative position in the range - higher is better
          const positionFactor = range > 0 ? (evaluation.utility - minUtility) / range : 0;
          
          // 3. Overall utility level - higher raw utility provides more confidence
          const utilityLevel = Math.min(0.2, evaluation.utility / 100);
          
          // 4. Penalty for high overall variance (if coefficient of variation is high)
          const variancePenalty = Math.min(0.2, cv);
          
          // 5. Bonus for strategies that align well with creature's role
          const roleAlignmentBonus = this.getStrategyRoleAlignment(evaluation.strategy, role);
          
          // Calculate final confidence (base 0.5 plus adjustments)
          const baseConfidence = 0.5;
          const confidence = Math.min(1, Math.max(0.1, 
            baseConfidence + 
            (zScore * 0.1) +        // Statistical significance bonus
            (positionFactor * 0.2) + // Position in range bonus
            utilityLevel -           // Raw utility level bonus
            variancePenalty +        // Penalty for high variance
            roleAlignmentBonus       // Role alignment bonus
          ));
          
          evaluation.confidence = confidence;
          
          // Add confidence explanation to reasoning
          evaluation.reasoning += ` Confidence: ${confidence.toFixed(2)} based on statistical significance and role alignment.`;
        });
      }
      
      // Sort by utility (descending)
      return evaluations.sort((a, b) => b.utility - a.utility);
      
    } catch (error) {
      console.error('Error evaluating strategies with utility:', error);
      
      // Return a minimal fallback evaluation
      return [{
        strategy: strategies[0] || 'balanced',
        utility: 5,
        reasoning: 'Fallback evaluation due to error.',
        confidence: 0.2
      }];
    }
  }
  
  /**
   * Get the alignment bonus between a strategy and a role
   * @param strategy The strategy
   * @param role The creature's role
   * @returns Alignment bonus for confidence (0-0.2)
   */
  private getStrategyRoleAlignment(strategy: string, role: Role): number {
    // Define which strategies align best with each role
    const roleAlignments: Record<Role, string[]> = {
      [Role.ATTACK]: ['aggressive', 'tactical', 'opportunistic'],
      [Role.DEFENSE]: ['protective', 'counter', 'evasive'],
      [Role.CONTROL]: ['commanding', 'disruptive', 'supportive'],
      [Role.MOVEMENT]: ['swift', 'flanking', 'unpredictable'],
      [Role.CORE]: ['balanced', 'adaptive', 'resilient']
    };
    
    // Check if strategy is in the top aligned strategies for this role
    if (roleAlignments[role].includes(strategy)) {
      const position = roleAlignments[role].indexOf(strategy);
      // First position gets highest bonus
      return 0.2 - (position * 0.05);
    }
    
    return 0; // No alignment bonus
  }
  
  /**
   * Get modified factors based on strategy
   * @param strategy The strategy to evaluate
   * @param baseFactor Base situation factors
   * @returns Modified factors for the strategy
   */
  private getStrategyFactors(
    strategy: string,
    baseFactors: Record<string, number>
  ): Record<string, number> {
    // Copy base factors
    const factors = { ...baseFactors };
    
    // Apply strategy-specific modifications
    switch (strategy.toLowerCase()) {
      case 'aggressive':
        factors.damage = (factors.damage || 0) * 1.3;
        factors.energy = (factors.energy || 0) * 0.8;
        factors.health = (factors.health || 0) * 0.9;
        break;
      case 'tactical':
        factors.damage = (factors.damage || 0) * 1.1;
        factors.position = (factors.position || 0) * 1.2;
        factors.energy = (factors.energy || 0) * 0.9;
        break;
      case 'opportunistic':
        factors.damage = (factors.damage || 0) * 1.2;
        factors.speed = (factors.speed || 0) * 1.2;
        factors.health = (factors.health || 0) * 0.8;
        break;
      case 'protective':
        factors.health = (factors.health || 0) * 1.3;
        factors.damageReduction = (factors.damageReduction || 0) * 1.4;
        factors.energy = (factors.energy || 0) * 0.9;
        factors.damage = (factors.damage || 0) * 0.7;
        break;
      case 'counter':
        factors.damageReduction = (factors.damageReduction || 0) * 1.2;
        factors.damage = (factors.damage || 0) * 1.1;
        factors.speed = (factors.speed || 0) * 0.8;
        break;
      case 'evasive':
        factors.speed = (factors.speed || 0) * 1.4;
        factors.health = (factors.health || 0) * 0.8;
        factors.damage = (factors.damage || 0) * 0.7;
        break;
      case 'commanding':
        factors.influence = (factors.influence || 0) * 1.5;
        factors.allies = (factors.allies || 0) * 1.3;
        factors.energy = (factors.energy || 0) * 0.8;
        break;
      case 'disruptive':
        factors.influence = (factors.influence || 0) * 1.2;
        factors.position = (factors.position || 0) * 1.3;
        factors.energy = (factors.energy || 0) * 0.9;
        break;
      case 'supportive':
        factors.allies = (factors.allies || 0) * 1.5;
        factors.energy = (factors.energy || 0) * 1.2;
        factors.damage = (factors.damage || 0) * 0.6;
        break;
      case 'swift':
        factors.speed = (factors.speed || 0) * 1.5;
        factors.energy = (factors.energy || 0) * 0.8;
        break;
      case 'flanking':
        factors.position = (factors.position || 0) * 1.4;
        factors.speed = (factors.speed || 0) * 1.2;
        factors.energy = (factors.energy || 0) * 0.9;
        break;
      case 'unpredictable':
        factors.position = (factors.position || 0) * 1.3;
        factors.speed = (factors.speed || 0) * 1.1;
        factors.obstacles = (factors.obstacles || 0) * 0.7;
        break;
      case 'balanced':
        // Balanced strategy has no extreme effects
        factors.damage = (factors.damage || 0) * 1.1;
        factors.health = (factors.health || 0) * 1.1;
        factors.energy = (factors.energy || 0) * 1.1;
        factors.speed = (factors.speed || 0) * 1.1;
        break;
      case 'adaptive':
        factors.energy = (factors.energy || 0) * 1.3;
        factors.allies = (factors.allies || 0) * 1.2;
        factors.health = (factors.health || 0) * 1.1;
        break;
      case 'resilient':
        factors.health = (factors.health || 0) * 1.4;
        factors.energy = (factors.energy || 0) * 1.2;
        factors.damage = (factors.damage || 0) * 0.8;
        break;
      default:
        // No modifications for unknown strategies
        break;
    }
    
    return factors;
  }
  
  /**
   * Generate reasoning for utility-based evaluation
   * @param strategy The strategy
   * @param factors The factors used for evaluation
   * @param utility The calculated utility
   * @param role The creature's role
   * @returns Reasoning string
   */
  private generateUtilityReasoning(
    strategy: string,
    factors: Record<string, number>,
    utility: number,
    role: Role
  ): string {
    // Find the top 3 factors by value
    const topFactors = Object.entries(factors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => `${name}: ${value.toFixed(2)}`);
    
    let reasoning = `Strategy '${strategy}' has utility ${utility.toFixed(2)}. `;
    
    reasoning += `Top factors for this ${role} strategy are ${topFactors.join(', ')}. `;
    
    // Add strategy-specific reasoning
    switch (strategy.toLowerCase()) {
      case 'aggressive':
        reasoning += 'Emphasizes damage output at the cost of sustainability. ';
        break;
      case 'protective':
        reasoning += 'Prioritizes survival and damage reduction over offense. ';
        break;
      case 'evasive':
        reasoning += 'Focuses on mobility and avoiding direct confrontation. ';
        break;
      case 'balanced':
        reasoning += 'Provides moderate boosts to all attributes without specialization. ';
        break;
      case 'supportive':
        reasoning += 'Maximizes ally effectiveness while reducing direct damage output. ';
        break;
      // Add more as needed
    }
    
    return reasoning;
  }

  /**
   * Make a comprehensive strategic decision using multiple approaches
   * @param creature The creature
   * @param opponent Optional opponent creature for interaction
   * @param context Current context and state information
   * @returns A comprehensive strategy recommendation
   */
  makeComprehensiveDecision(
    creature: Creature,
    opponent?: Creature,
    context?: any
  ): {
    recommendedStrategy: string;
    confidence: number;
    reasoning: string;
    alternatives: string[];
    detailedAnalysis: {
      nashEquilibrium?: StrategyDecisionResult;
      utilityRanking?: Array<{ strategy: string; utility: number }>;
      decisionTree?: MultiStepDecisionResult;
      combinationMethod: string;
      weights: { nash: number; utility: number; tree: number };
    };
  } {
    if (!this.isInitialized()) {
      throw new Error('Game Theory Strategy Service not initialized');
    }
    
    try {
      // Results storage
      let nashResult: StrategyDecisionResult | undefined;
      let utilityResults: Array<{ strategy: string; utility: number; reasoning: string }> | undefined;
      let treeResult: MultiStepDecisionResult | undefined;
      
      // 1. If we have an opponent, use Nash equilibrium approach
      if (opponent) {
        nashResult = this.determineCreatureStrategy(creature, opponent, context);
      }
      
      // 2. Use utility functions to evaluate individual strategies
      const baseFactors = this.extractFactorsFromContext(context, creature);
      const strategies = this.getStrategiesForRole(this.getDominantRole(creature));
      utilityResults = this.evaluateStrategiesWithUtility(creature, strategies, baseFactors);
      
      // 3. For complex scenarios, use decision tree
      if (context && (context.complexScenario || context.timeHorizon > 1)) {
        treeResult = this.determineMultiStepStrategy(creature, context);
      }
      
      // Combine the results using weighted decision method
      const combinedDecision = this.combineStrategicApproaches(
        nashResult,
        utilityResults,
        treeResult,
        context
      );
      
      return {
        recommendedStrategy: combinedDecision.strategy,
        confidence: combinedDecision.confidence,
        reasoning: combinedDecision.reasoning,
        alternatives: combinedDecision.alternatives,
        detailedAnalysis: {
          nashEquilibrium: nashResult,
          utilityRanking: utilityResults,
          decisionTree: treeResult,
          combinationMethod: combinedDecision.method,
          weights: combinedDecision.weights
        }
      };
    } catch (error) {
      console.error('Error in makeComprehensiveDecision:', error);
      
      // Fallback to a simple utility-based decision
      const fallbackFactors = this.extractFactorsFromContext(context, creature);
      const fallbackStrategies = this.getStrategiesForRole(this.getDominantRole(creature));
      const fallbackResults = this.evaluateStrategiesWithUtility(
        creature, 
        fallbackStrategies, 
        fallbackFactors
      );
      
      // Use the best strategy from utility evaluation
      const bestStrategy = fallbackResults[0];
      
      return {
        recommendedStrategy: bestStrategy.strategy,
        confidence: 0.4, // Low confidence for fallback
        reasoning: `Fallback strategy due to decision error. ${bestStrategy.reasoning}`,
        alternatives: fallbackResults.slice(1, 3).map(r => r.strategy),
        detailedAnalysis: {
          utilityRanking: fallbackResults,
          combinationMethod: 'Fallback to utility-only',
          weights: { nash: 0, utility: 1, tree: 0 }
        }
      };
    }
  }
  
  /**
   * Extract factors from context for utility calculation
   * @param context The context object
   * @param creature The creature
   * @returns Factor values for utility calculation
   */
  private extractFactorsFromContext(
    context: any,
    creature: Creature
  ): Record<string, number> {
    const factors: Record<string, number> = {
      // Default values
      health: 50,
      energy: 50,
      damage: 20,
      speed: 5,
      position: 0
    };
    
    // Extract from context if available
    if (context) {
      if (context.health !== undefined) factors.health = context.health;
      if (context.energy !== undefined) factors.energy = context.energy;
      if (context.damage !== undefined) factors.damage = context.damage;
      if (context.speed !== undefined) factors.speed = context.speed;
      if (context.position !== undefined) factors.position = context.position;
      
      // Additional factors
      if (context.allies !== undefined) factors.allies = context.allies;
      if (context.obstacles !== undefined) factors.obstacles = context.obstacles;
      if (context.influence !== undefined) factors.influence = context.influence;
      if (context.damageReduction !== undefined) factors.damageReduction = context.damageReduction;
      
      // Environmental factors affect weights
      if (context.threatLevel !== undefined) factors.threatLevel = context.threatLevel;
      if (context.resourceScarcity !== undefined) factors.resourceScarcity = context.resourceScarcity;
    }
    
    // Extract from creature if possible
    // This is a simplified implementation
    const role = this.getDominantRole(creature);
    switch (role) {
      case Role.ATTACK:
        factors.damage += 10;
        break;
      case Role.DEFENSE:
        factors.health += 10;
        factors.damageReduction = (factors.damageReduction || 0) + 0.2;
        break;
      case Role.CONTROL:
        factors.influence = (factors.influence || 0) + 10;
        break;
      case Role.MOVEMENT:
        factors.speed += 3;
        break;
      case Role.CORE:
        factors.energy += 10;
        break;
    }
    
    return factors;
  }
  
  /**
   * Combine results from different strategic approaches
   * @param nashResult Nash equilibrium result
   * @param utilityResults Utility-based results
   * @param treeResult Decision tree result
   * @param context Context information
   * @returns Combined strategic decision
   */
  private combineStrategicApproaches(
    nashResult?: StrategyDecisionResult,
    utilityResults?: Array<{ strategy: string; utility: number; reasoning: string }>,
    treeResult?: MultiStepDecisionResult,
    context?: any
  ): {
    strategy: string;
    confidence: number;
    reasoning: string;
    alternatives: string[];
    method: string;
    weights: { nash: number; utility: number; tree: number };
  } {
    // Default weights for each approach
    let nashWeight = 0.4;
    let utilityWeight = 0.4;
    let treeWeight = 0.2;
    
    // Adjust weights based on context-specific factors
    if (context) {
      // If context specifies reliability scores directly, use them
      if (context.nashReliability !== undefined) {
        nashWeight = Math.min(0.8, Math.max(0.1, context.nashReliability));
      }
      
      if (context.utilityReliability !== undefined) {
        utilityWeight = Math.min(0.8, Math.max(0.1, context.utilityReliability));
      }
      
      if (context.treeReliability !== undefined) {
        treeWeight = Math.min(0.8, Math.max(0.1, context.treeReliability));
      }
      
      // Adjust based on scenario complexity
      if (context.complexityScore !== undefined) {
        // Complex scenarios favor decision trees
        const complexity = Math.min(1, Math.max(0, context.complexityScore));
        treeWeight = Math.min(0.6, treeWeight + (complexity * 0.2));
        nashWeight = Math.max(0.2, nashWeight - (complexity * 0.1));
      }
      
      // Adjust based on interaction type
      if (context.environment) {
        switch(context.environment) {
          case 'battle':
            // Battles favor Nash equilibria
            nashWeight = Math.min(0.7, nashWeight * 1.25);
            break;
          case 'cooperation':
            // Cooperation favors utility functions
            utilityWeight = Math.min(0.7, utilityWeight * 1.25);
            break;
          case 'exploration':
            // Exploration favors decision trees
            treeWeight = Math.min(0.6, treeWeight * 1.5);
            break;
        }
      }
      
      // Time horizon affects weights
      if (context.timeHorizon !== undefined) {
        const horizon = Math.max(1, context.timeHorizon);
        if (horizon > 3) {
          // Long time horizons favor decision trees
          treeWeight = Math.min(0.7, treeWeight + (horizon * 0.05));
          nashWeight = Math.max(0.1, nashWeight - (horizon * 0.03));
        }
      }
    }
    
    // Normalize weights based on available approaches
    const totalWeight = 
      (nashResult ? nashWeight : 0) + 
      (utilityResults ? utilityWeight : 0) + 
      (treeResult ? treeWeight : 0);
    
    if (totalWeight === 0) {
      throw new Error('No strategic approach available');
    }
    
    const normalizedNashWeight = nashResult ? (nashWeight / totalWeight) : 0;
    const normalizedUtilityWeight = utilityResults ? (utilityWeight / totalWeight) : 0;
    const normalizedTreeWeight = treeResult ? (treeWeight / totalWeight) : 0;
    
    // Score each strategy
    const strategyScores: Record<string, { 
      score: number; 
      sources: string[]; 
      confidences: number[]; 
      rawScores: number[];
    }> = {};
    
    // Add Nash equilibrium result
    if (nashResult) {
      const strategy = nashResult.chosenStrategy;
      strategyScores[strategy] = strategyScores[strategy] || { 
        score: 0, 
        sources: [],
        confidences: [],
        rawScores: []
      };
      strategyScores[strategy].score += normalizedNashWeight * nashResult.confidence;
      strategyScores[strategy].sources.push('Nash');
      strategyScores[strategy].confidences.push(nashResult.confidence);
      strategyScores[strategy].rawScores.push(nashResult.expectedPayoff);
      
      // Add alternative strategies with lower scores
      nashResult.alternativeStrategies.forEach((alt, index) => {
        // Use statistical decay rather than arbitrary factor
        // Decay is exponential based on position in alternatives list
        const position = index + 1;
        const decayFactor = Math.exp(-position / 2); // e^(-pos/2)
        
        strategyScores[alt] = strategyScores[alt] || { 
          score: 0, 
          sources: [],
          confidences: [],
          rawScores: []
        };
        const altScore = normalizedNashWeight * nashResult.confidence * decayFactor;
        strategyScores[alt].score += altScore;
        strategyScores[alt].sources.push('Nash-alt');
        strategyScores[alt].confidences.push(nashResult.confidence * decayFactor);
        // Estimate payoff for alternative (not always available)
        strategyScores[alt].rawScores.push(nashResult.expectedPayoff * decayFactor);
      });
    }
    
    // Add utility rankings with variance-based confidence
    if (utilityResults && utilityResults.length > 0) {
      // Calculate utility statistics for confidence
      const utilities = utilityResults.map(r => r.utility);
      const maxUtility = Math.max(...utilities);
      const minUtility = Math.min(...utilities);
      const range = maxUtility - minUtility || 1;
      const mean = utilities.reduce((sum, u) => sum + u, 0) / utilities.length;
      
      // Calculate variance
      const variance = utilities.reduce((sum, u) => sum + Math.pow(u - mean, 2), 0) / utilities.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate coefficient of variation (CV) to gauge relative spread
      const cv = mean !== 0 ? stdDev / mean : 0;
      
      // Score each strategy, with confidence based on statistical measures
      utilityResults.forEach((result, index) => {
        // Normalize utility to 0-1 range
        const normalizedUtility = (result.utility - minUtility) / range;
        
        // Calculate Z-score (how many standard deviations from the mean)
        const zScore = stdDev > 0 ? Math.abs(result.utility - mean) / stdDev : 0;
        
        // Higher Z-score means more statistical confidence in the result
        // Cap confidence boost to avoid overconfidence
        const confidenceBoost = Math.min(0.3, zScore * 0.1);
        const confidence = 0.5 + confidenceBoost;
        
        strategyScores[result.strategy] = strategyScores[result.strategy] || { 
          score: 0, 
          sources: [],
          confidences: [],
          rawScores: []
        };
        strategyScores[result.strategy].score += normalizedUtilityWeight * normalizedUtility * confidence;
        strategyScores[result.strategy].sources.push('Utility');
        strategyScores[result.strategy].confidences.push(confidence);
        strategyScores[result.strategy].rawScores.push(result.utility);
      });
    }
    
    // Add decision tree result (first decision only)
    if (treeResult && treeResult.decisions.length > 0) {
      const strategy = treeResult.decisions[0]; // First decision in the path
      
      // Calculate confidence based on payoff advantage
      let confidence = treeResult.confidence;
      
      // Check if there are alternative paths to compare
      if (treeResult.alternativePaths && treeResult.alternativePaths.length > 0) {
        // Use payoff advantage for additional confidence adjustment
        const nextBestPath = treeResult.alternativePaths[0];
        const payoffAdvantage = (treeResult.expectedTotalPayoff - treeResult.expectedTotalPayoff * 0.8) / 
          Math.max(1, treeResult.expectedTotalPayoff);
        const advantageBonus = Math.min(0.2, payoffAdvantage);
        confidence = Math.min(1, confidence + advantageBonus);
      }
      
      strategyScores[strategy] = strategyScores[strategy] || { 
        score: 0, 
        sources: [],
        confidences: [],
        rawScores: []
      };
      strategyScores[strategy].score += normalizedTreeWeight * confidence;
      strategyScores[strategy].sources.push('Tree');
      strategyScores[strategy].confidences.push(confidence);
      strategyScores[strategy].rawScores.push(treeResult.expectedTotalPayoff);
      
      // Add alternative paths first decisions with statistical decay
      treeResult.alternativePaths.forEach((path, index) => {
        if (path.length > 0) {
          const altStrategy = path[0];
          // Use statistical decay rather than arbitrary factor
          const position = index + 1;
          const decayFactor = Math.exp(-position / 2); // e^(-pos/2)
          
          strategyScores[altStrategy] = strategyScores[altStrategy] || { 
            score: 0, 
            sources: [],
            confidences: [],
            rawScores: []
          };
          const altScore = normalizedTreeWeight * confidence * decayFactor;
          strategyScores[altStrategy].score += altScore;
          strategyScores[altStrategy].sources.push('Tree-alt');
          strategyScores[altStrategy].confidences.push(confidence * decayFactor);
          // Estimate payoff for alternative (not always available)
          strategyScores[altStrategy].rawScores.push(treeResult.expectedTotalPayoff * decayFactor);
        }
      });
    }
    
    // Select the best strategy
    const sortedStrategies = Object.entries(strategyScores)
      .sort(([, a], [, b]) => b.score - a.score);
    
    if (sortedStrategies.length === 0) {
      throw new Error('No strategies available for evaluation');
    }
    
    const [bestStrategy, bestScore] = sortedStrategies[0];
    const alternatives = sortedStrategies
      .slice(1, 4) // Top 3 alternatives
      .map(([strategy]) => strategy);
    
    // Calculate confidence based on statistical measures
    // 1. Score difference between best and next best (if any)
    let scoreDifferenceConfidence = 0;
    if (sortedStrategies.length > 1) {
      const nextBestScore = sortedStrategies[1][1].score;
      const scoreGap = bestScore.score - nextBestScore;
      const relativeGap = scoreGap / Math.max(0.01, bestScore.score);
      scoreDifferenceConfidence = Math.min(0.3, relativeGap);
    }
    
    // 2. Average confidence from individual approaches
    const avgSourceConfidence = bestScore.confidences.length > 0 
      ? bestScore.confidences.reduce((sum, c) => sum + c, 0) / bestScore.confidences.length
      : 0.5;
    
    // 3. Bonus for agreement across multiple approaches
    const agreementBonus = Math.min(0.2, (bestScore.sources.length - 1) * 0.1);
    
    // Combined confidence with limits
    const confidence = Math.min(1, Math.max(0.1, 
      avgSourceConfidence + scoreDifferenceConfidence + agreementBonus
    ));
    
    // Generate reasoning
    const agreementCount = bestScore.sources.length;
    const approachesCount = 
      (nashResult ? 1 : 0) + 
      (utilityResults ? 1 : 0) + 
      (treeResult ? 1 : 0);
    
    let method: string;
    if (agreementCount === approachesCount && approachesCount > 1) {
      method = 'Full consensus';
    } else if (bestScore.sources.includes('Nash') && bestScore.sources.includes('Utility')) {
      method = 'Nash-Utility agreement';
    } else if (bestScore.sources.includes('Nash') && bestScore.sources.includes('Tree')) {
      method = 'Nash-Tree agreement';
    } else if (bestScore.sources.includes('Utility') && bestScore.sources.includes('Tree')) {
      method = 'Utility-Tree agreement';
    } else if (bestScore.sources.includes('Nash')) {
      method = 'Nash-dominated';
    } else if (bestScore.sources.includes('Utility')) {
      method = 'Utility-dominated';
    } else {
      method = 'Tree-dominated';
    }
    
    // Average raw score for reasoning
    const avgRawScore = bestScore.rawScores.length > 0
      ? bestScore.rawScores.reduce((sum, s) => sum + s, 0) / bestScore.rawScores.length
      : 0;
    
    const reasoning = `Strategy '${bestStrategy}' selected using ${method} approach. ` +
      `Based on ${bestScore.sources.join(', ')} with confidence ${confidence.toFixed(2)}. ` +
      `Expected value: ${avgRawScore.toFixed(1)}. ` +
      `${alternatives.length > 0 ? `Alternative strategies: ${alternatives.join(', ')}.` : ''}`;
    
    return {
      strategy: bestStrategy,
      confidence,
      reasoning,
      alternatives,
      method,
      weights: {
        nash: nashWeight,
        utility: utilityWeight,
        tree: treeWeight
      }
    };
  }
  
  /**
   * Get available strategies for a role
   * @param role The role
   * @returns Array of strategies
   */
  private getStrategiesForRole(role: Role): string[] {
    // Same implementation as in PayoffMatrixService
    switch (role) {
      case Role.ATTACK:
        return ['aggressive', 'tactical', 'opportunistic'];
      case Role.DEFENSE:
        return ['protective', 'counter', 'evasive'];
      case Role.CONTROL:
        return ['commanding', 'disruptive', 'supportive'];
      case Role.MOVEMENT:
        return ['swift', 'flanking', 'unpredictable'];
      case Role.CORE:
        return ['balanced', 'adaptive', 'resilient'];
      default:
        return ['balanced', 'aggressive', 'evasive'];
    }
  }
}

/**
 * Get the Game Theory Strategy Service instance
 * @returns The Game Theory Strategy Service instance
 */
export function getGameTheoryStrategyService(): GameTheoryStrategyService {
  return GameTheoryStrategyService.getInstance();
} 