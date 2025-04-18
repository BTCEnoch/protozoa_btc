/**
 * Decision Tree Service
 *
 * This service provides functionality for creating and evaluating decision trees.
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import {
  DecisionTree,
  DecisionNode,
  DecisionPath,
  createDecisionNode,
  createDecisionTree
} from '../../types/gameTheory/decisionTree';
import { evaluateDecisionTree } from '../../lib/gameTheory';
import { Role } from '../../types/core';

/**
 * Role configuration interface
 * Defines role-specific decision tree configuration
 */
interface RoleConfig {
  decisions: string[];
  conditions: ((state: any) => boolean)[];
  basePayoffs: number[];
  description: string[];
}

/**
 * Decision tree options
 */
export interface DecisionTreeOptions {
  maxDepth?: number;
  payoffMultiplier?: number;
  returnTopN?: number;
}

/**
 * Singleton instance
 */
let instance: DecisionTreeService | null = null;

/**
 * Decision Tree Service class
 */
export class DecisionTreeService {
  private blockData: BlockData | null = null;
  private cachedTrees: Map<string, DecisionTree> = new Map();
  private initialized: boolean = false;
  
  // Role-specific configurations for decisions, conditions, and payoffs
  private readonly roleConfigs: Record<Role, RoleConfig> = {
    [Role.ATTACK]: {
      decisions: ['Aggressive', 'Tactical', 'Opportunistic'],
      conditions: [
        state => state.enemyHealth < 50,
        state => state.ownHealth > 70,
        state => state.enemyCount > 1
      ],
      basePayoffs: [10, 8, 6],
      description: [
        'Focus on maximum damage output',
        'Balance damage with positioning',
        'Wait for openings to strike'
      ]
    },
    [Role.DEFENSE]: {
      decisions: ['Protective', 'Counter', 'Evasive'],
      conditions: [
        state => state.ownHealth < 50,
        state => state.underAttack === true,
        state => state.alliesNearby === true
      ],
      basePayoffs: [8, 10, 6],
      description: [
        'Focus on damage reduction',
        'Return attacks when threatened',
        'Avoid damage through movement'
      ]
    },
    [Role.CONTROL]: {
      decisions: ['Commanding', 'Disruptive', 'Supportive'],
      conditions: [
        state => state.controlPoints > 0,
        state => state.alliesNearby === true,
        state => state.enemyDisrupted === false
      ],
      basePayoffs: [6, 8, 10],
      description: [
        'Direct allies for coordinated actions',
        'Interfere with enemy actions',
        'Enhance ally capabilities'
      ]
    },
    [Role.MOVEMENT]: {
      decisions: ['Swift', 'Flanking', 'Unpredictable'],
      conditions: [
        state => state.obstaclesNearby === true,
        state => state.enemyNearby === true,
        state => state.alliesScattered === true
      ],
      basePayoffs: [10, 6, 8],
      description: [
        'Maximize movement speed',
        'Approach from advantageous angles',
        'Use random patterns to confuse enemies'
      ]
    },
    [Role.CORE]: {
      decisions: ['Balanced', 'Adaptive', 'Resilient'],
      conditions: [
        state => state.energyLevel < 50,
        state => state.alliesHealth < 70,
        state => state.formationIntegrity < 80
      ],
      basePayoffs: [8, 10, 6],
      description: [
        'Maintain equal focus on all aspects',
        'Change strategy based on circumstances',
        'Prioritize survival above all else'
      ]
    }
  };

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): DecisionTreeService {
    if (!instance) {
      instance = new DecisionTreeService();
    }
    return instance;
  }

  /**
   * Initialize the service with block data
   * @param blockData Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    if (!blockData || typeof blockData !== 'object') {
      throw new Error('Invalid blockData provided to DecisionTreeService');
    }
    
    this.blockData = blockData;
    this.cachedTrees.clear();
    this.initialized = true;
    
    console.log('Decision Tree Service initialized');
  }
  
  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a decision tree for a strategic decision
   * @param id Tree identifier
   * @param role The role making the decision
   * @param options Tree creation options
   * @returns A decision tree
   */
  createDecisionTree(
    id: string,
    role: Role,
    options?: DecisionTreeOptions
  ): DecisionTree {
    if (!this.isInitialized()) {
      throw new Error('Decision Tree Service not initialized');
    }
    
    const maxDepth = options?.maxDepth || 3;
    const payoffMultiplier = options?.payoffMultiplier || 1.0;
    
    // Include all parameters in the cache key
    const treeKey = `${id}_${role}_${maxDepth}_${payoffMultiplier}`;
    
    if (this.cachedTrees.has(treeKey)) {
      return this.cachedTrees.get(treeKey)!;
    }
    
    // Validate role
    if (!(role in this.roleConfigs)) {
      throw new Error(`Invalid role: ${role}`);
    }
    
    // Create a root node for the decision tree
    const rootNode = this.createRootNode(role);
    
    // Build the decision tree based on the role
    const tree = createDecisionTree(this.buildDecisionTree(rootNode, role, 1, maxDepth, payoffMultiplier));
    
    // Cache the tree
    this.cachedTrees.set(treeKey, tree);
    
    return tree;
  }

  /**
   * Evaluate a decision tree
   * @param tree The decision tree
   * @param state The current state
   * @param options Evaluation options
   * @returns The optimal path through the tree
   */
  evaluateDecisionTree(
    tree: DecisionTree,
    state: any,
    options?: { returnTopN?: number }
  ): DecisionPath | DecisionPath[] {
    if (!this.isInitialized()) {
      throw new Error('Decision Tree Service not initialized');
    }
    
    if (!tree || !tree.root) {
      throw new Error('Invalid decision tree provided for evaluation');
    }
    
    if (!state || typeof state !== 'object') {
      throw new Error('Invalid state provided for evaluation');
    }
    
    try {
      // If returnTopN is specified, evaluate multiple paths
      if (options?.returnTopN && options.returnTopN > 1) {
        return this.evaluateMultiplePaths(tree, state, options.returnTopN);
      }
      
      // Otherwise, evaluate a single path
      const path = evaluateDecisionTree(tree, state);
      
      if (!path || !path.nodes || path.nodes.length === 0) {
        throw new Error('Invalid decision path returned from evaluation');
      }
      
      return path;
    } catch (error) {
      console.error('Error evaluating decision tree:', error);
      // Fallback to a simple path with just the root node
      return {
        nodes: [tree.root],
        totalPayoff: tree.root.payoff || 0
      };
    }
  }

  /**
   * Find the optimal path through a decision tree
   * @param tree The decision tree
   * @param state The current state
   * @param options Evaluation options
   * @returns The optimal path(s) through the tree
   */
  findOptimalPath(
    tree: DecisionTree,
    state: any,
    options?: { returnTopN?: number }
  ): DecisionPath | DecisionPath[] {
    return this.evaluateDecisionTree(tree, state, options);
  }
  
  /**
   * Evaluate and return multiple paths through a decision tree
   * @param tree The decision tree
   * @param state The current state
   * @param topN Number of top paths to return
   * @returns Array of decision paths ordered by payoff
   */
  private evaluateMultiplePaths(
    tree: DecisionTree,
    state: any,
    topN: number
  ): DecisionPath[] {
    // Get all possible paths through the tree
    const allPaths = this.getAllPaths(tree.root);
    
    // Calculate payoff for each path based on current state
    const scoredPaths: DecisionPath[] = allPaths.map(nodes => {
      let totalPayoff = 0;
      
      // Check if all conditions in the path are satisfied
      let validPath = true;
      for (const node of nodes) {
        if (node.payoff !== undefined) {
          totalPayoff += node.payoff;
        }
        
        // If any condition is false, mark path as invalid
        if (node.condition && !node.condition(state)) {
          validPath = false;
          break;
        }
      }
      
      // Apply penalty to invalid paths
      if (!validPath) {
        totalPayoff *= 0.5;
      }
      
      return { nodes, totalPayoff };
    });
    
    // Sort by payoff (descending) and return top N
    return scoredPaths
      .sort((a, b) => b.totalPayoff - a.totalPayoff)
      .slice(0, topN);
  }
  
  /**
   * Get all possible paths through a decision tree
   * @param node The current node
   * @param currentPath The current path being explored
   * @returns Array of all possible paths (each an array of nodes)
   */
  private getAllPaths(
    node: DecisionNode,
    currentPath: DecisionNode[] = []
  ): DecisionNode[][] {
    // Add current node to path
    const path = [...currentPath, node];
    
    // If leaf node, return the path
    if (!node.children || node.children.length === 0) {
      return [path];
    }
    
    // Otherwise, explore all children
    return node.children.flatMap(child => this.getAllPaths(child, path));
  }

  /**
   * Create a root node for a decision tree
   * @param role The role
   * @returns A root decision node
   */
  private createRootNode(role: Role): DecisionNode {
    return createDecisionNode('root', `${role} Initial Decision`, {
      payoff: 0,
      children: []
    });
  }

  /**
   * Build a decision tree recursively
   * @param node The current node
   * @param role The role
   * @param depth The current depth
   * @param maxDepth The maximum depth
   * @param payoffMultiplier The payoff multiplier
   * @param state Optional state for state-based payoffs
   * @returns The built decision tree
   */
  private buildDecisionTree(
    node: DecisionNode,
    role: Role,
    depth: number,
    maxDepth: number,
    payoffMultiplier: number,
    state?: any
  ): DecisionNode {
    // If we've reached the maximum depth, return the node as a leaf
    if (depth >= maxDepth) {
      return node;
    }
    
    // Create child nodes based on the role
    const children: DecisionNode[] = this.createChildNodes(role, depth, payoffMultiplier, state);
    
    // Recursively build the tree for each child
    const builtChildren = children.map(child => 
      this.buildDecisionTree(child, role, depth + 1, maxDepth, payoffMultiplier, state)
    );
    
    // Add the built children to the node
    node.children = builtChildren;
    
    return node;
  }

  /**
   * Create child nodes for a decision tree
   * @param role The role
   * @param depth The current depth
   * @param payoffMultiplier The payoff multiplier
   * @param state Optional state for state-based payoffs
   * @returns An array of child nodes
   */
  private createChildNodes(
    role: Role,
    depth: number,
    payoffMultiplier: number,
    state?: any
  ): DecisionNode[] {
    const config = this.roleConfigs[role];
    
    // Calculate state-based adjustments if state is provided
    const stateAdjustments = state ? this.calculateStateAdjustments(role, state) : [0, 0, 0];
    
    // Create a child node for each decision option
    return config.decisions.map((decision, index) => {
      // Base payoff from role config
      let payoff = config.basePayoffs[index] * payoffMultiplier;
      
      // Apply state-based adjustment if available
      if (stateAdjustments[index] !== undefined) {
        payoff += stateAdjustments[index];
      }
      
      // Scale slightly with depth for decision chains
      // But less aggressively than before
      const depthFactor = 1 + (depth * 0.05);
      payoff *= depthFactor;
      
      return createDecisionNode(
        `${role}_${decision}_${depth}`,
        decision,
        {
          condition: config.conditions[index],
          payoff,
          children: []
        }
      );
    });
  }
  
  /**
   * Calculate state-based payoff adjustments
   * @param role The role
   * @param state The current state
   * @returns Array of payoff adjustments for each decision
   */
  private calculateStateAdjustments(role: Role, state: any): number[] {
    // Base adjustments
    const adjustments = [0, 0, 0];
    
    // Apply role-specific state adjustments
    switch (role) {
      case Role.ATTACK:
        // Aggressive gets bonus when enemy health is low
        if (state.enemyHealth && state.enemyHealth < 30) {
          adjustments[0] += 5;
        }
        // Tactical gets bonus when own health is high
        if (state.ownHealth && state.ownHealth > 80) {
          adjustments[1] += 3;
        }
        // Opportunistic gets bonus when enemy count is high
        if (state.enemyCount && state.enemyCount > 1) {
          adjustments[2] += state.enemyCount;
        }
        break;
        
      case Role.DEFENSE:
        // Protective gets bonus when own health is low
        if (state.ownHealth && state.ownHealth < 40) {
          adjustments[0] += (40 - state.ownHealth) / 4;
        }
        // Counter gets bonus when under attack
        if (state.underAttack) {
          adjustments[1] += 4;
        }
        // Evasive gets bonus when allies are nearby
        if (state.alliesNearby) {
          adjustments[2] += 3;
        }
        break;
        
      // Add similar adjustments for other roles
      case Role.CONTROL:
      case Role.MOVEMENT:
      case Role.CORE:
        // Default minor adjustments based on energy
        if (state.energyLevel) {
          const energyFactor = state.energyLevel / 100;
          adjustments[0] += energyFactor * 2;
          adjustments[1] += energyFactor * 2;
          adjustments[2] += energyFactor * 2;
        }
        break;
    }
    
    return adjustments;
  }
}

/**
 * Get the decision tree service instance
 * @returns The decision tree service instance
 */
export function getDecisionTreeService(): DecisionTreeService {
  return DecisionTreeService.getInstance();
}

