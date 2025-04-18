/**
 * Distribution Service for Bitcoin Protozoa
 *
 * This service provides probability distributions for random number generation.
 */

import {
  Distribution,
  DistributionType,
  UniformDistribution,
  NormalDistribution,
  ExponentialDistribution,
  PoissonDistribution,
  BinomialDistribution,
  WeightedDistribution,
  DistributionFactory
} from '../types/distribution';
import { getRNGService } from './rngService';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: DistributionService | null = null;

/**
 * Distribution Service class
 * Provides probability distributions
 */
export class DistributionService implements DistributionFactory {
  private initialized: boolean = false;
  private logger = Logging.createLogger('DistributionService');

  /**
   * Initialize the distribution service
   */
  public initialize(): void {
    if (this.initialized) {
      this.logger.warn('Distribution service already initialized');
      return;
    }

    this.initialized = true;
    this.logger.info('Distribution service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a uniform distribution
   * @param min Minimum value
   * @param max Maximum value
   * @returns A uniform distribution
   */
  public createUniform(min: number, max: number): UniformDistribution {
    if (!this.initialized) {
      throw new Error('Distribution service not initialized');
    }

    return {
      type: DistributionType.UNIFORM,
      min,
      max,
      sample: () => {
        return getRNGService().getRandomFloat(min, max);
      }
    };
  }

  /**
   * Create a normal distribution
   * @param mean Mean value
   * @param standardDeviation Standard deviation
   * @returns A normal distribution
   */
  public createNormal(mean: number, standardDeviation: number): NormalDistribution {
    if (!this.initialized) {
      throw new Error('Distribution service not initialized');
    }

    return {
      type: DistributionType.NORMAL,
      mean,
      standardDeviation,
      sample: () => {
        // Box-Muller transform
        const u1 = getRNGService().getRandomFloat();
        const u2 = getRNGService().getRandomFloat();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + standardDeviation * z0;
      }
    };
  }

  /**
   * Create an exponential distribution
   * @param lambda Rate parameter
   * @returns An exponential distribution
   */
  public createExponential(lambda: number): ExponentialDistribution {
    if (!this.initialized) {
      throw new Error('Distribution service not initialized');
    }

    return {
      type: DistributionType.EXPONENTIAL,
      lambda,
      sample: () => {
        const u = getRNGService().getRandomFloat();
        return -Math.log(u) / lambda;
      }
    };
  }

  /**
   * Create a Poisson distribution
   * @param lambda Mean
   * @returns A Poisson distribution
   */
  public createPoisson(lambda: number): PoissonDistribution {
    if (!this.initialized) {
      throw new Error('Distribution service not initialized');
    }

    return {
      type: DistributionType.POISSON,
      lambda,
      sample: () => {
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;

        do {
          k++;
          p *= getRNGService().getRandomFloat();
        } while (p > L);

        return k - 1;
      }
    };
  }

  /**
   * Create a binomial distribution
   * @param n Number of trials
   * @param p Probability of success
   * @returns A binomial distribution
   */
  public createBinomial(n: number, p: number): BinomialDistribution {
    if (!this.initialized) {
      throw new Error('Distribution service not initialized');
    }

    return {
      type: DistributionType.BINOMIAL,
      n,
      p,
      sample: () => {
        let successes = 0;
        for (let i = 0; i < n; i++) {
          if (getRNGService().getRandomBool(p)) {
            successes++;
          }
        }
        return successes;
      }
    };
  }

  /**
   * Create a weighted distribution
   * @param items Items to choose from
   * @param weights Weights for each item
   * @returns A weighted distribution
   */
  public createWeighted<T>(items: T[], weights: number[]): WeightedDistribution<T> {
    if (!this.initialized) {
      throw new Error('Distribution service not initialized');
    }

    if (items.length !== weights.length) {
      throw new Error('Items and weights arrays must have the same length');
    }

    // Calculate cumulative weights
    const cumulativeWeights: number[] = [];
    let sum = 0;
    for (const weight of weights) {
      sum += weight;
      cumulativeWeights.push(sum);
    }

    return {
      type: DistributionType.WEIGHTED,
      items,
      weights,
      sample: () => {
        const r = getRNGService().getRandomFloat(0, sum);
        for (let i = 0; i < cumulativeWeights.length; i++) {
          if (r <= cumulativeWeights[i]) {
            return items[i];
          }
        }
        return items[items.length - 1]; // Fallback
      }
    };
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.initialized = false;
    this.logger.info('Distribution service reset');
  }
}

/**
 * Get the distribution service instance
 * @returns The distribution service instance
 */
export function getDistributionService(): DistributionService {
  if (!instance) {
    instance = new DistributionService();
  }
  return instance;
}
