/**
 * Mock RNG Service
 * 
 * This file provides a mock implementation of the RNG Service for testing.
 */

/**
 * MockRNGService class
 * A mock implementation of the RNG Service for testing
 */
export class MockRNGService {
  private mockValues: Map<string, number[]>;
  private defaultValue: number;
  
  /**
   * Constructor
   * @param defaultValue The default value to return when no mock value is set
   */
  constructor(defaultValue = 0.5) {
    this.mockValues = new Map();
    this.defaultValue = defaultValue;
  }
  
  /**
   * Sets a mock value for a specific seed
   * @param seed The seed
   * @param values The values to return for the seed
   */
  public setMockValue(seed: string, values: number[]): void {
    this.mockValues.set(seed, [...values]);
  }
  
  /**
   * Gets a random number for a seed
   * @param seed The seed
   * @returns A random number
   */
  public getRandomNumber(seed: string): number {
    if (this.mockValues.has(seed)) {
      const values = this.mockValues.get(seed)!;
      if (values.length > 0) {
        return values.shift()!;
      }
    }
    
    return this.defaultValue;
  }
  
  /**
   * Gets a random integer in a range for a seed
   * @param seed The seed
   * @param min The minimum value (inclusive)
   * @param max The maximum value (inclusive)
   * @returns A random integer
   */
  public getRandomInt(seed: string, min: number, max: number): number {
    const r = this.getRandomNumber(seed);
    return Math.floor(r * (max - min + 1)) + min;
  }
  
  /**
   * Gets a random element from an array for a seed
   * @param seed The seed
   * @param array The array
   * @returns A random element from the array
   */
  public getRandomElement<T>(seed: string, array: T[]): T {
    const r = this.getRandomNumber(seed);
    const index = Math.floor(r * array.length);
    return array[index];
  }
  
  /**
   * Shuffles an array for a seed
   * @param seed The seed
   * @param array The array
   * @returns The shuffled array
   */
  public shuffle<T>(seed: string, array: T[]): T[] {
    const result = [...array];
    
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.getRandomNumber(`${seed}-${i}`) * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    
    return result;
  }
}
