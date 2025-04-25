/**
 * Strategy Factory Service for Bitcoin Protozoa
 *
 * This service creates and manages game theory strategies.
 */

import {
  StrategyType,
  OutcomeType,
  StrategyParameters,
  StrategyFactory
} from '../types/gameTheory';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: StrategyFactoryService | null = null;

/**
 * Strategy Factory Service class
 */
export class StrategyFactoryService {
  private strategyFactories: Map<string, StrategyFactory> = new Map();
  private initialized: boolean = false;
  private logger = Logging.createLogger('StrategyFactoryService');

  /**
   * Initialize the strategy factory service
   */
  public initialize(): void {
    if (this.initialized) {
      this.logger.warn('Strategy Factory Service already initialized');
      return;
    }

    // Register built-in strategies
    this.registerBuiltInStrategies();

    this.initialized = true;
    this.logger.info('Strategy Factory Service initialized');
  }

  /**
   * Register built-in strategies
   */
  private registerBuiltInStrategies(): void {
    // Always Cooperate
    this.registerStrategy('alwaysCooperate', () => {
      return (_history: OutcomeType[], _opponentHistory: OutcomeType[]) => StrategyType.COOPERATIVE;
    });

    // Always Defect
    this.registerStrategy('alwaysDefect', () => {
      return (_history: OutcomeType[], _opponentHistory: OutcomeType[]) => StrategyType.COMPETITIVE;
    });

    // Random
    this.registerStrategy('random', (params?: Partial<StrategyParameters>) => {
      const cooperationProbability = params?.cooperationProbability || 0.5;
      return (_history: OutcomeType[], _opponentHistory: OutcomeType[]) => {
        return Math.random() < cooperationProbability ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
      };
    });

    // Tit for Tat
    this.registerStrategy('titForTat', () => {
      return (history: OutcomeType[], opponentHistory: OutcomeType[]) => {
        // If no history, start with cooperation
        if (opponentHistory.length === 0) {
          return StrategyType.COOPERATIVE;
        }

        // Otherwise, do what the opponent did last time
        const lastOpponentOutcome = opponentHistory[opponentHistory.length - 1];
        return lastOpponentOutcome === OutcomeType.COOPERATE ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
      };
    });

    // Tit for Two Tats
    this.registerStrategy('titForTwoTats', () => {
      return (history: OutcomeType[], opponentHistory: OutcomeType[]) => {
        // If less than 2 rounds of history, cooperate
        if (opponentHistory.length < 2) {
          return StrategyType.COOPERATIVE;
        }

        // Defect only if opponent defected twice in a row
        const lastOpponentOutcome = opponentHistory[opponentHistory.length - 1];
        const secondLastOpponentOutcome = opponentHistory[opponentHistory.length - 2];
        if (lastOpponentOutcome === OutcomeType.DEFECT && secondLastOpponentOutcome === OutcomeType.DEFECT) {
          return StrategyType.COMPETITIVE;
        } else {
          return StrategyType.COOPERATIVE;
        }
      };
    });

    // Pavlov (Win-Stay, Lose-Shift)
    this.registerStrategy('pavlov', () => {
      return (history: OutcomeType[], opponentHistory: OutcomeType[]) => {
        // If no history, start with cooperation
        if (history.length === 0) {
          return StrategyType.COOPERATIVE;
        }

        // If last outcome was a win (COOPERATE or WIN), stay with the same strategy
        // If last outcome was a loss (DEFECT or LOSE), switch strategy
        const lastOutcome = history[history.length - 1];
        const lastStrategy = lastOutcome === OutcomeType.COOPERATE ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
        const lastOpponentStrategy = opponentHistory[opponentHistory.length - 1] === OutcomeType.COOPERATE ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;

        // Calculate payoff based on prisoner's dilemma
        let payoff = 0;
        if (lastStrategy === StrategyType.COOPERATIVE && lastOpponentStrategy === StrategyType.COOPERATIVE) {
          payoff = 3; // Both cooperate
        } else if (lastStrategy === StrategyType.COOPERATIVE && lastOpponentStrategy === StrategyType.COMPETITIVE) {
          payoff = 0; // Sucker's payoff
        } else if (lastStrategy === StrategyType.COMPETITIVE && lastOpponentStrategy === StrategyType.COOPERATIVE) {
          payoff = 5; // Temptation to defect
        } else {
          payoff = 1; // Both defect
        }

        // Win-Stay, Lose-Shift
        if (payoff > 2) {
          // Win, stay with the same strategy
          return lastStrategy;
        } else {
          // Lose, shift to the opposite strategy
          return lastStrategy === StrategyType.COOPERATIVE ? StrategyType.COMPETITIVE : StrategyType.COOPERATIVE;
        }
      };
    });

    // Grudger (Grim Trigger)
    this.registerStrategy('grudger', () => {
      return (history: OutcomeType[], opponentHistory: OutcomeType[]) => {
        // If opponent has ever defected, always defect
        if (opponentHistory.some(outcome => outcome === OutcomeType.DEFECT)) {
          return StrategyType.COMPETITIVE;
        } else {
          return StrategyType.COOPERATIVE;
        }
      };
    });

    // Adaptive
    this.registerStrategy('adaptive', (params?: Partial<StrategyParameters>) => {
      const adaptationRate = params?.adaptationRate || 0.1;
      const explorationRate = params?.explorationRate || 0.1;
      let cooperationProbability = 0.5;

      return (history: OutcomeType[], opponentHistory: OutcomeType[]) => {
        // If no history, start with cooperation
        if (history.length === 0) {
          return StrategyType.COOPERATIVE;
        }

        // Get last outcome
        const lastOutcome = history[history.length - 1];
        const lastOpponentOutcome = opponentHistory[opponentHistory.length - 1];

        // Update cooperation probability based on outcome
        if (lastOutcome === OutcomeType.COOPERATE && lastOpponentOutcome === OutcomeType.COOPERATE) {
          // Both cooperated, increase cooperation probability
          cooperationProbability += adaptationRate * (1 - cooperationProbability);
        } else if (lastOutcome === OutcomeType.DEFECT && lastOpponentOutcome === OutcomeType.DEFECT) {
          // Both defected, decrease cooperation probability
          cooperationProbability -= adaptationRate * cooperationProbability;
        } else if (lastOutcome === OutcomeType.COOPERATE && lastOpponentOutcome === OutcomeType.DEFECT) {
          // Player cooperated but opponent defected, decrease cooperation probability
          cooperationProbability -= adaptationRate * cooperationProbability;
        } else if (lastOutcome === OutcomeType.DEFECT && lastOpponentOutcome === OutcomeType.COOPERATE) {
          // Player defected but opponent cooperated, increase cooperation probability
          cooperationProbability += adaptationRate * (1 - cooperationProbability);
        }

        // Explore with some probability
        if (Math.random() < explorationRate) {
          return Math.random() < 0.5 ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
        }

        // Otherwise, use learned probability
        return Math.random() < cooperationProbability ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
      };
    });
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Register a strategy factory
   * @param name Strategy name
   * @param factory Strategy factory function
   */
  public registerStrategy(name: string, factory: StrategyFactory): void {
    this.strategyFactories.set(name, factory);
    this.logger.debug(`Registered strategy: ${name}`);
  }

  /**
   * Get a strategy factory by name
   * @param name Strategy name
   * @returns Strategy factory, or undefined if not found
   */
  public getStrategyFactory(name: string): StrategyFactory | undefined {
    return this.strategyFactories.get(name);
  }

  /**
   * Create a strategy function
   * @param name Strategy name
   * @param params Strategy parameters
   * @returns Strategy function
   */
  public createStrategy(
    name: string,
    params?: Partial<StrategyParameters>
  ): (history: OutcomeType[], opponentHistory: OutcomeType[]) => StrategyType {
    const factory = this.strategyFactories.get(name);
    if (!factory) {
      throw new Error(`Strategy not found: ${name}`);
    }

    return factory(params);
  }

  /**
   * Get all strategy names
   * @returns Array of strategy names
   */
  public getStrategyNames(): string[] {
    return Array.from(this.strategyFactories.keys());
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.strategyFactories.clear();
    this.initialized = false;
    this.registerBuiltInStrategies();
    this.initialized = true;
    this.logger.info('Strategy Factory Service reset');
  }
}

/**
 * Get the strategy factory service instance
 * @returns The strategy factory service instance
 */
export function getStrategyFactoryService(): StrategyFactoryService {
  if (!instance) {
    instance = new StrategyFactoryService();
  }
  return instance;
}
