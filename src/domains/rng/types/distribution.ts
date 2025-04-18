/**
 * Distribution Types for Bitcoin Protozoa
 * 
 * This file defines the types for probability distributions.
 */

/**
 * Distribution type enum
 */
export enum DistributionType {
  UNIFORM = 'UNIFORM',
  NORMAL = 'NORMAL',
  EXPONENTIAL = 'EXPONENTIAL',
  POISSON = 'POISSON',
  BINOMIAL = 'BINOMIAL',
  WEIGHTED = 'WEIGHTED'
}

/**
 * Base distribution interface
 */
export interface Distribution {
  type: DistributionType;
  sample(): number;
}

/**
 * Uniform distribution interface
 * Generates random numbers uniformly between min and max
 */
export interface UniformDistribution extends Distribution {
  type: DistributionType.UNIFORM;
  min: number;
  max: number;
}

/**
 * Normal distribution interface
 * Generates random numbers with a normal (Gaussian) distribution
 */
export interface NormalDistribution extends Distribution {
  type: DistributionType.NORMAL;
  mean: number;
  standardDeviation: number;
}

/**
 * Exponential distribution interface
 * Generates random numbers with an exponential distribution
 */
export interface ExponentialDistribution extends Distribution {
  type: DistributionType.EXPONENTIAL;
  lambda: number; // Rate parameter
}

/**
 * Poisson distribution interface
 * Generates random integers with a Poisson distribution
 */
export interface PoissonDistribution extends Distribution {
  type: DistributionType.POISSON;
  lambda: number; // Mean
}

/**
 * Binomial distribution interface
 * Generates random integers with a binomial distribution
 */
export interface BinomialDistribution extends Distribution {
  type: DistributionType.BINOMIAL;
  n: number; // Number of trials
  p: number; // Probability of success
}

/**
 * Weighted distribution interface
 * Generates random items based on weights
 */
export interface WeightedDistribution<T> {
  type: DistributionType.WEIGHTED;
  items: T[];
  weights: number[];
  sample(): T;
}

/**
 * Distribution factory interface
 * Creates distribution instances
 */
export interface DistributionFactory {
  createUniform(min: number, max: number): UniformDistribution;
  createNormal(mean: number, standardDeviation: number): NormalDistribution;
  createExponential(lambda: number): ExponentialDistribution;
  createPoisson(lambda: number): PoissonDistribution;
  createBinomial(n: number, p: number): BinomialDistribution;
  createWeighted<T>(items: T[], weights: number[]): WeightedDistribution<T>;
}
