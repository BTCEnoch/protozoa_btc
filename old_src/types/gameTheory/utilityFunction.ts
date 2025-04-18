/**
 * Utility Function Types
 * 
 * This file defines types for utility functions used in game theory calculations.
 */

/**
 * Utility function interface
 * Represents a function that evaluates the desirability of different outcomes
 */
export interface UtilityFunction {
  calculate: (factors: Record<string, number>) => number;
  weights: Record<string, number>;
}

/**
 * Utility factor interface
 * Represents a factor that contributes to utility
 */
export interface UtilityFactor {
  name: string;
  weight: number;
  normalize?: (value: number) => number;
}

/**
 * Create a new utility function
 * @param weights Weights for different factors
 * @param normalizers Optional normalizer functions for factors
 * @returns A new UtilityFunction object
 */
export function createUtilityFunction(
  weights: Record<string, number>,
  normalizers?: Record<string, (value: number) => number>
): UtilityFunction {
  return {
    weights,
    calculate: (factors: Record<string, number>) => {
      let utility = 0;
      
      for (const factor in factors) {
        if (weights[factor]) {
          let value = factors[factor];
          
          // Apply normalizer if available
          if (normalizers && normalizers[factor]) {
            value = normalizers[factor](value);
          }
          
          utility += value * weights[factor];
        }
      }
      
      return utility;
    }
  };
}

/**
 * Linear normalizer function
 * Normalizes a value to the range [0, 1] based on min and max
 * @param min Minimum value
 * @param max Maximum value
 * @returns Normalizer function
 */
export function linearNormalizer(min: number, max: number): (value: number) => number {
  return (value: number) => {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  };
}

/**
 * Sigmoid normalizer function
 * Normalizes a value using a sigmoid function
 * @param midpoint Value at which the normalized result should be 0.5
 * @param steepness Controls how quickly the function transitions (higher = steeper)
 * @returns Normalizer function
 */
export function sigmoidNormalizer(midpoint: number, steepness: number = 1): (value: number) => number {
  return (value: number) => {
    return 1 / (1 + Math.exp(-steepness * (value - midpoint)));
  };
}
