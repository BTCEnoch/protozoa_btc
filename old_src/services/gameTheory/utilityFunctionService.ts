/**
 * Utility Function Service
 *
 * This service provides functionality for creating and using utility functions.
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import {
  UtilityFunction,
  createUtilityFunction,
  linearNormalizer,
  sigmoidNormalizer
} from '../../types/gameTheory/utilityFunction';
import { calculateUtility, createNormalizedUtilityFunction } from '../../lib/gameTheory';
import { Role } from '../../types/core';

/**
 * Singleton instance
 */
let instance: UtilityFunctionService | null = null;

/**
 * Utility Function Service class
 */
export class UtilityFunctionService {
  private blockData: BlockData | null = null;
  private cachedFunctions: Map<string, UtilityFunction> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): UtilityFunctionService {
    if (!instance) {
      instance = new UtilityFunctionService();
    }
    return instance;
  }

  /**
   * Initialize the service with block data
   * @param blockData Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.cachedFunctions.clear();
  }

  /**
   * Create a utility function for a role
   * @param role The role
   * @param customWeights Optional custom weights
   * @returns A utility function
   */
  createUtilityFunction(
    role: Role,
    customWeights?: Record<string, number>
  ): UtilityFunction {
    const functionKey = `${role}_${JSON.stringify(customWeights || {})}`;
    
    if (this.cachedFunctions.has(functionKey)) {
      return this.cachedFunctions.get(functionKey)!;
    }
    
    // Get role-specific weights
    const weights = customWeights || this.getRoleWeights(role);
    
    // Get role-specific ranges for normalization
    const ranges = this.getRoleRanges(role);
    
    // Create a normalized utility function
    const utilityFunction = createNormalizedUtilityFunction(weights, ranges);
    
    // Cache the function
    this.cachedFunctions.set(functionKey, utilityFunction);
    
    return utilityFunction;
  }

  /**
   * Calculate utility based on factors
   * @param factors The factors
   * @param weights The weights
   * @returns The calculated utility
   */
  calculateUtility(
    factors: Record<string, number>,
    weights: Record<string, number>
  ): number {
    return calculateUtility(factors, weights);
  }

  /**
   * Create a normalizer function
   * @param type The normalizer type
   * @param params The normalizer parameters
   * @returns A normalizer function
   */
  createNormalizer(
    type: 'linear' | 'sigmoid',
    params: { min?: number; max?: number; midpoint?: number; steepness?: number }
  ): (value: number) => number {
    switch (type) {
      case 'linear':
        return linearNormalizer(params.min || 0, params.max || 1);
      case 'sigmoid':
        return sigmoidNormalizer(params.midpoint || 0.5, params.steepness || 1);
      default:
        return value => value; // Identity function
    }
  }

  /**
   * Combine multiple utility functions
   * @param functions The utility functions to combine
   * @param weights The weights for each function
   * @returns A combined utility function
   */
  combineUtilityFunctions(
    functions: UtilityFunction[],
    weights: number[]
  ): UtilityFunction {
    // Ensure weights are normalized
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = weights.map(weight => weight / totalWeight);
    
    // Combine the weights from all functions
    const combinedWeights: Record<string, number> = {};
    
    functions.forEach((func, index) => {
      const functionWeight = normalizedWeights[index];
      
      Object.entries(func.weights).forEach(([factor, weight]) => {
        if (!combinedWeights[factor]) {
          combinedWeights[factor] = 0;
        }
        
        combinedWeights[factor] += weight * functionWeight;
      });
    });
    
    // Create a new utility function with the combined weights
    return createUtilityFunction(combinedWeights);
  }

  /**
   * Get role-specific weights
   * @param role The role
   * @returns Role-specific weights
   */
  private getRoleWeights(role: Role): Record<string, number> {
    switch (role) {
      case Role.ATTACK:
        return {
          damage: 0.5,
          speed: 0.3,
          health: 0.1,
          energy: 0.1
        };
      case Role.DEFENSE:
        return {
          health: 0.5,
          damageReduction: 0.3,
          energy: 0.1,
          allies: 0.1
        };
      case Role.CONTROL:
        return {
          influence: 0.4,
          energy: 0.3,
          allies: 0.2,
          position: 0.1
        };
      case Role.MOVEMENT:
        return {
          speed: 0.5,
          position: 0.3,
          energy: 0.1,
          obstacles: 0.1
        };
      case Role.CORE:
        return {
          energy: 0.4,
          health: 0.3,
          allies: 0.2,
          formation: 0.1
        };
      default:
        return {
          health: 0.25,
          energy: 0.25,
          position: 0.25,
          allies: 0.25
        };
    }
  }

  /**
   * Get role-specific ranges for normalization
   * @param role The role
   * @returns Role-specific ranges
   */
  private getRoleRanges(role: Role): Record<string, [number, number]> {
    switch (role) {
      case Role.ATTACK:
        return {
          damage: [0, 100],
          speed: [0, 10],
          health: [0, 100],
          energy: [0, 100]
        };
      case Role.DEFENSE:
        return {
          health: [0, 100],
          damageReduction: [0, 0.9],
          energy: [0, 100],
          allies: [0, 10]
        };
      case Role.CONTROL:
        return {
          influence: [0, 100],
          energy: [0, 100],
          allies: [0, 10],
          position: [-1, 1]
        };
      case Role.MOVEMENT:
        return {
          speed: [0, 10],
          position: [-1, 1],
          energy: [0, 100],
          obstacles: [0, 10]
        };
      case Role.CORE:
        return {
          energy: [0, 100],
          health: [0, 100],
          allies: [0, 10],
          formation: [0, 100]
        };
      default:
        return {
          health: [0, 100],
          energy: [0, 100],
          position: [-1, 1],
          allies: [0, 10]
        };
    }
  }
}

/**
 * Get the utility function service instance
 * @returns The utility function service instance
 */
export function getUtilityFunctionService(): UtilityFunctionService {
  return UtilityFunctionService.getInstance();
}

