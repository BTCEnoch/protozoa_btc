/**
 * Utility Function Types for Bitcoin Protozoa
 * 
 * This file defines the types for utility functions in game theory.
 */

/**
 * Utility function interface
 * Represents a utility function for evaluating outcomes
 */
export interface UtilityFunction {
  // Calculate the utility of an outcome
  calculate: (outcome: any) => number;
  
  // Normalize a utility value to a standard range (usually 0-1)
  normalize: (value: number) => number;
}

/**
 * Create a utility function
 * @param calculator Function to calculate utility
 * @param normalizer Function to normalize utility values
 * @returns A utility function
 */
export function createUtilityFunction(
  calculator: (outcome: any) => number,
  normalizer: (value: number) => number = linearNormalizer()
): UtilityFunction {
  return {
    calculate: calculator,
    normalize: normalizer
  };
}

/**
 * Create a linear normalizer function
 * @param min Minimum value (default: 0)
 * @param max Maximum value (default: 1)
 * @returns A function that normalizes values to the range [min, max]
 */
export function linearNormalizer(min: number = 0, max: number = 1): (value: number) => number {
  return (value: number) => {
    // Clamp value to range [min, max]
    return Math.min(max, Math.max(min, value));
  };
}

/**
 * Create a sigmoid normalizer function
 * @param steepness Steepness of the sigmoid curve (default: 1)
 * @returns A function that normalizes values using a sigmoid function
 */
export function sigmoidNormalizer(steepness: number = 1): (value: number) => number {
  return (value: number) => {
    // Sigmoid function: 1 / (1 + e^(-steepness * value))
    return 1 / (1 + Math.exp(-steepness * value));
  };
}
