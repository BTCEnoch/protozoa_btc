/**
 * Simulation Service for Bitcoin Protozoa
 *
 * This service runs game theory simulations.
 */

import { 
  StrategyType, 
  OutcomeType, 
  GameTheoryPlayer, 
  GameTheorySimulationConfig,
  GameTheorySimulationResults
} from '../types/gameTheory';
import { getGameTheoryService } from './gameTheoryService';
import { getStrategyFactoryService } from './strategyFactoryService';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: SimulationService | null = null;

/**
 * Simulation Service class
 */
export class SimulationService {
  private simulations: Map<string, GameTheorySimulationResults> = new Map();
  private initialized: boolean = false;
  private logger = Logging.createLogger('SimulationService');

  /**
   * Initialize the simulation service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Simulation Service already initialized');
      return;
    }

    // Initialize dependencies
    await getGameTheoryService().initialize();
    getStrategyFactoryService().initialize();

    this.initialized = true;
    this.logger.info('Simulation Service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Run a simulation
   * @param config Simulation configuration
   * @returns Simulation results
   */
  public async runSimulation(config: GameTheorySimulationConfig): Promise<GameTheorySimulationResults> {
    if (!this.initialized) {
      throw new Error('Simulation Service not initialized');
    }

    // Create game
    const gameId = getGameTheoryService().createGame(
      `Simulation ${Date.now()}`,
      `${config.gameType} simulation with ${config.playerCount} players`,
      config.gameType,
      config.playerCount
    );

    // Get game
    const game = getGameTheoryService().getGame(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Set up players with initial strategies
    for (let i = 0; i < game.players.length; i++) {
      const player = game.players[i];
      player.strategy = config.initialStrategies[i % config.initialStrategies.length];
      player.adaptationRate = config.adaptationEnabled ? config.adaptationRate : 0;
    }

    // Set rounds
    game.rounds = config.rounds;

    // Play all rounds
    getGameTheoryService().playAllRounds(gameId);

    // Calculate results
    const results = this.calculateSimulationResults(gameId, config);

    // Store results
    this.simulations.set(results.gameId, results);

    // Clean up
    getGameTheoryService().deleteGame(gameId);

    this.logger.debug(`Completed simulation ${results.gameId}`);
    return results;
  }

  /**
   * Calculate simulation results
   * @param gameId Game ID
   * @param config Simulation configuration
   * @returns Simulation results
   */
  private calculateSimulationResults(
    gameId: string,
    config: GameTheorySimulationConfig
  ): GameTheorySimulationResults {
    const game = getGameTheoryService().getGame(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Calculate strategy distribution
    const strategyDistribution: Record<StrategyType, number> = {
      [StrategyType.COOPERATIVE]: 0,
      [StrategyType.COMPETITIVE]: 0,
      [StrategyType.MIXED]: 0,
      [StrategyType.ADAPTIVE]: 0,
      [StrategyType.RANDOM]: 0
    };

    // Calculate average scores
    const averageScores: Record<StrategyType, number> = {
      [StrategyType.COOPERATIVE]: 0,
      [StrategyType.COMPETITIVE]: 0,
      [StrategyType.MIXED]: 0,
      [StrategyType.ADAPTIVE]: 0,
      [StrategyType.RANDOM]: 0
    };

    // Count strategies and sum scores
    const strategyCounts: Record<StrategyType, number> = {
      [StrategyType.COOPERATIVE]: 0,
      [StrategyType.COMPETITIVE]: 0,
      [StrategyType.MIXED]: 0,
      [StrategyType.ADAPTIVE]: 0,
      [StrategyType.RANDOM]: 0
    };

    for (const player of game.players) {
      strategyDistribution[player.strategy]++;
      averageScores[player.strategy] += player.score;
      strategyCounts[player.strategy]++;
    }

    // Calculate average scores
    for (const strategy of Object.values(StrategyType)) {
      if (strategyCounts[strategy] > 0) {
        averageScores[strategy] /= strategyCounts[strategy];
      }
    }

    // Calculate dominant strategy
    let dominantStrategy: StrategyType | undefined;
    let maxCount = 0;
    for (const [strategy, count] of Object.entries(strategyDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        dominantStrategy = strategy as StrategyType;
      }
    }

    // Check if equilibrium was reached
    let equilibriumReached = false;
    let equilibriumRound: number | undefined;

    // Check if strategy distribution stabilized
    if (game.history.length > 10) {
      // Check last 10 rounds
      const lastRounds = game.history.slice(-10);
      const strategyDistributions: Record<number, Record<StrategyType, number>> = {};

      // Calculate strategy distribution for each round
      for (let i = 0; i < lastRounds.length; i++) {
        const round = lastRounds[i];
        const distribution: Record<StrategyType, number> = {
          [StrategyType.COOPERATIVE]: 0,
          [StrategyType.COMPETITIVE]: 0,
          [StrategyType.MIXED]: 0,
          [StrategyType.ADAPTIVE]: 0,
          [StrategyType.RANDOM]: 0
        };

        // Count strategies used in this round
        for (const move of round.moves) {
          distribution[move.strategy]++;
        }

        strategyDistributions[i] = distribution;
      }

      // Check if distribution is stable
      let stable = true;
      for (const strategy of Object.values(StrategyType)) {
        const counts = Object.values(strategyDistributions).map(dist => dist[strategy]);
        const min = Math.min(...counts);
        const max = Math.max(...counts);
        if (max - min > 2) {
          stable = false;
          break;
        }
      }

      if (stable) {
        equilibriumReached = true;
        equilibriumRound = game.rounds - 10;
      }
    }

    // Create results
    const results: GameTheorySimulationResults = {
      gameId,
      rounds: game.rounds,
      players: game.players,
      strategyDistribution,
      averageScores,
      dominantStrategy,
      equilibriumReached,
      equilibriumRound
    };

    return results;
  }

  /**
   * Get a simulation by ID
   * @param simulationId Simulation ID
   * @returns Simulation results, or undefined if not found
   */
  public getSimulation(simulationId: string): GameTheorySimulationResults | undefined {
    return this.simulations.get(simulationId);
  }

  /**
   * Get all simulations
   * @returns Map of all simulations
   */
  public getAllSimulations(): Map<string, GameTheorySimulationResults> {
    return this.simulations;
  }

  /**
   * Delete a simulation
   * @param simulationId Simulation ID
   * @returns True if simulation was deleted, false otherwise
   */
  public deleteSimulation(simulationId: string): boolean {
    return this.simulations.delete(simulationId);
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.simulations.clear();
    this.initialized = false;
    this.logger.info('Simulation Service reset');
  }
}

/**
 * Get the simulation service instance
 * @returns The simulation service instance
 */
export function getSimulationService(): SimulationService {
  if (!instance) {
    instance = new SimulationService();
  }
  return instance;
}
