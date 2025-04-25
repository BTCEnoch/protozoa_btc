/**
 * Game Theory Service for Bitcoin Protozoa
 *
 * This service manages game theory simulations and strategies.
 */

import {
  StrategyType,
  OutcomeType,
  PayoffMatrix,
  GameTheoryPlayer,
  GameTheoryGame
} from '../types/gameTheory';
import { Logging } from '../../../shared/utils';
import { registry } from '../../../shared/services/serviceRegistry';
import { IRenderService } from '../../rendering/interfaces/renderService';
import { Creature } from '../../creature/types/creature';
import { Role } from '../../../shared/types/core';

// Singleton instance
let instance: GameTheoryService | null = null;

/**
 * Game Theory Service class
 */
export class GameTheoryService {
  private games: Map<string, GameTheoryGame> = new Map();
  private payoffMatrices: Map<string, PayoffMatrix> = new Map();
  private initialized: boolean = false;
  private config: any = null;
  private logger = Logging.createLogger('GameTheoryService');

  /**
   * Initialize the game theory service
   * @throws Error if Rendering service is not initialized
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Game Theory Service already initialized');
      return;
    }

    // Check if Rendering service is available and initialized
    if (!registry.has('RenderService')) {
      throw new Error('Rendering service not available. Cannot initialize Game Theory service.');
    }

    const renderService = registry.get<IRenderService>('RenderService');
    if (!renderService.isInitialized()) {
      throw new Error('Rendering service must be initialized before Game Theory service. Check initialization order.');
    }

    this.logger.info('Rendering service is initialized. Proceeding with Game Theory service initialization.');

    // Load configuration
    await this.loadConfig();

    // Initialize default payoff matrices
    this.initializeDefaultPayoffMatrices();

    this.initialized = true;
    this.logger.info('Game Theory Service initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/gameTheory.json');
      this.config = await response.json();
      this.logger.info('Loaded game theory configuration');
    } catch (error) {
      this.logger.error('Failed to load game theory configuration:', error);
      // Use default configuration
      this.config = {
        defaultRounds: 100,
        defaultPlayerCount: 10,
        defaultAdaptationRate: 0.1,
        defaultMutationRate: 0.05
      };
    }
  }

  /**
   * Initialize default payoff matrices
   */
  private initializeDefaultPayoffMatrices(): void {
    // Prisoner's Dilemma
    this.payoffMatrices.set('prisonersDilemma', {
      [StrategyType.COOPERATIVE]: {
        [StrategyType.COOPERATIVE]: { player1: 3, player2: 3 },
        [StrategyType.COMPETITIVE]: { player1: 0, player2: 5 }
      },
      [StrategyType.COMPETITIVE]: {
        [StrategyType.COOPERATIVE]: { player1: 5, player2: 0 },
        [StrategyType.COMPETITIVE]: { player1: 1, player2: 1 }
      }
    });

    // Hawk-Dove Game
    this.payoffMatrices.set('hawkDove', {
      [StrategyType.COOPERATIVE]: {
        [StrategyType.COOPERATIVE]: { player1: 3, player2: 3 },
        [StrategyType.COMPETITIVE]: { player1: 1, player2: 4 }
      },
      [StrategyType.COMPETITIVE]: {
        [StrategyType.COOPERATIVE]: { player1: 4, player2: 1 },
        [StrategyType.COMPETITIVE]: { player1: 0, player2: 0 }
      }
    });

    // Stag Hunt
    this.payoffMatrices.set('stagHunt', {
      [StrategyType.COOPERATIVE]: {
        [StrategyType.COOPERATIVE]: { player1: 4, player2: 4 },
        [StrategyType.COMPETITIVE]: { player1: 0, player2: 3 }
      },
      [StrategyType.COMPETITIVE]: {
        [StrategyType.COOPERATIVE]: { player1: 3, player2: 0 },
        [StrategyType.COMPETITIVE]: { player1: 2, player2: 2 }
      }
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
   * Create a new game
   * @param name Game name
   * @param description Game description
   * @param payoffMatrixName Name of payoff matrix to use
   * @param playerCount Number of players
   * @returns Game ID
   */
  public createGame(
    name: string,
    description: string,
    payoffMatrixName: string = 'prisonersDilemma',
    playerCount: number = 2
  ): string {
    if (!this.initialized) {
      throw new Error('Game Theory Service not initialized');
    }

    // Get payoff matrix
    const payoffMatrix = this.payoffMatrices.get(payoffMatrixName);
    if (!payoffMatrix) {
      throw new Error(`Payoff matrix not found: ${payoffMatrixName}`);
    }

    // Create game ID
    const gameId = `game-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create players
    const players: GameTheoryPlayer[] = [];
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `player-${i}`,
        name: `Player ${i + 1}`,
        strategy: this.getRandomStrategy(),
        history: [],
        score: 0,
        adaptationRate: this.config?.defaultAdaptationRate || 0.1
      });
    }

    // Create game
    const game: GameTheoryGame = {
      id: gameId,
      name,
      description,
      players,
      payoffMatrix,
      rounds: this.config?.defaultRounds || 100,
      currentRound: 0,
      history: []
    };

    // Store game
    this.games.set(gameId, game);

    this.logger.debug(`Created game ${gameId} with ${playerCount} players`);
    return gameId;
  }

  /**
   * Get a random strategy
   * @returns Random strategy
   */
  private getRandomStrategy(): StrategyType {
    const strategies = [
      StrategyType.COOPERATIVE,
      StrategyType.COMPETITIVE,
      StrategyType.MIXED,
      StrategyType.ADAPTIVE,
      StrategyType.RANDOM
    ];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  /**
   * Get a game by ID
   * @param gameId Game ID
   * @returns Game, or undefined if not found
   */
  public getGame(gameId: string): GameTheoryGame | undefined {
    return this.games.get(gameId);
  }

  /**
   * Get all games
   * @returns Map of all games
   */
  public getAllGames(): Map<string, GameTheoryGame> {
    return this.games;
  }

  /**
   * Play a single round of a game
   * @param gameId Game ID
   * @returns Updated game
   */
  public playRound(gameId: string): GameTheoryGame {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Check if game is already complete
    if (game.currentRound >= game.rounds) {
      this.logger.warn(`Game ${gameId} is already complete`);
      return game;
    }

    // Increment round
    game.currentRound++;

    // Play round
    const roundHistory: {
      round: number;
      moves: {
        playerId: string;
        strategy: StrategyType;
        outcome: OutcomeType;
        payoff: number;
      }[];
    } = {
      round: game.currentRound,
      moves: []
    };

    // For each pair of players
    for (let i = 0; i < game.players.length; i++) {
      for (let j = i + 1; j < game.players.length; j++) {
        const player1 = game.players[i];
        const player2 = game.players[j];

        // Get strategies
        const strategy1 = this.getPlayerStrategy(player1);
        const strategy2 = this.getPlayerStrategy(player2);

        // Get payoffs
        const payoff = game.payoffMatrix[strategy1][strategy2];
        const player1Payoff = payoff.player1;
        const player2Payoff = payoff.player2;

        // Update scores
        player1.score += player1Payoff;
        player2.score += player2Payoff;

        // Determine outcomes
        const outcome1 = this.determineOutcome(strategy1, strategy2, player1Payoff, player2Payoff);
        const outcome2 = this.determineOutcome(strategy2, strategy1, player2Payoff, player1Payoff);

        // Update history
        player1.history.push(outcome1);
        player2.history.push(outcome2);

        // Add moves to round history
        roundHistory.moves.push({
          playerId: player1.id,
          strategy: strategy1,
          outcome: outcome1,
          payoff: player1Payoff
        });
        roundHistory.moves.push({
          playerId: player2.id,
          strategy: strategy2,
          outcome: outcome2,
          payoff: player2Payoff
        });
      }
    }

    // Add round history
    game.history.push(roundHistory);

    // Update game
    this.games.set(gameId, game);

    this.logger.debug(`Played round ${game.currentRound} of game ${gameId}`);
    return game;
  }

  /**
   * Get a player's strategy for the current round
   * @param player Player
   * @returns Strategy
   */
  private getPlayerStrategy(player: GameTheoryPlayer): StrategyType {
    switch (player.strategy) {
      case StrategyType.COOPERATIVE:
        return StrategyType.COOPERATIVE;
      case StrategyType.COMPETITIVE:
        return StrategyType.COMPETITIVE;
      case StrategyType.MIXED:
        // 50% chance of cooperation
        return Math.random() < 0.5 ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
      case StrategyType.ADAPTIVE:
        // Adapt based on history
        return this.getAdaptiveStrategy(player);
      case StrategyType.RANDOM:
        // Random strategy
        return Math.random() < 0.5 ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
      default:
        return StrategyType.COOPERATIVE;
    }
  }

  /**
   * Get an adaptive strategy based on player history
   * @param player Player
   * @returns Strategy
   */
  private getAdaptiveStrategy(player: GameTheoryPlayer): StrategyType {
    // If no history, start with cooperation
    if (player.history.length === 0) {
      return StrategyType.COOPERATIVE;
    }

    // Count outcomes
    let cooperateCount = 0;
    let defectCount = 0;

    // Look at last 5 rounds or all history if less
    const historyToConsider = player.history.slice(-5);
    for (const outcome of historyToConsider) {
      if (outcome === OutcomeType.COOPERATE) {
        cooperateCount++;
      } else if (outcome === OutcomeType.DEFECT) {
        defectCount++;
      }
    }

    // If more defections, defect
    if (defectCount > cooperateCount) {
      return StrategyType.COMPETITIVE;
    }
    // If more cooperations, cooperate
    else if (cooperateCount > defectCount) {
      return StrategyType.COOPERATIVE;
    }
    // If equal, random
    else {
      return Math.random() < 0.5 ? StrategyType.COOPERATIVE : StrategyType.COMPETITIVE;
    }
  }

  /**
   * Determine the outcome of a move
   * @param playerStrategy Player's strategy
   * @param opponentStrategy Opponent's strategy
   * @returns Outcome
   */
  private determineOutcome(
    playerStrategy: StrategyType,
    opponentStrategy: StrategyType,
    // These parameters are reserved for future use when we implement more complex outcome determination
    _playerPayoff?: number,
    _opponentPayoff?: number
  ): OutcomeType {
    // If both cooperate
    if (playerStrategy === StrategyType.COOPERATIVE && opponentStrategy === StrategyType.COOPERATIVE) {
      return OutcomeType.COOPERATE;
    }
    // If player cooperates but opponent defects
    else if (playerStrategy === StrategyType.COOPERATIVE && opponentStrategy === StrategyType.COMPETITIVE) {
      return OutcomeType.DEFECT;
    }
    // If player defects but opponent cooperates
    else if (playerStrategy === StrategyType.COMPETITIVE && opponentStrategy === StrategyType.COOPERATIVE) {
      return OutcomeType.DEFECT;
    }
    // If both defect
    else {
      return OutcomeType.DEFECT;
    }
  }

  /**
   * Play all rounds of a game
   * @param gameId Game ID
   * @returns Updated game
   */
  public playAllRounds(gameId: string): GameTheoryGame {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Play remaining rounds
    while (game.currentRound < game.rounds) {
      this.playRound(gameId);
    }

    this.logger.debug(`Played all rounds of game ${gameId}`);
    return game;
  }

  /**
   * Reset a game
   * @param gameId Game ID
   * @returns Updated game
   */
  public resetGame(gameId: string): GameTheoryGame {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Reset game state
    game.currentRound = 0;
    game.history = [];

    // Reset players
    for (const player of game.players) {
      player.history = [];
      player.score = 0;
    }

    // Update game
    this.games.set(gameId, game);

    this.logger.debug(`Reset game ${gameId}`);
    return game;
  }

  /**
   * Delete a game
   * @param gameId Game ID
   * @returns True if game was deleted, false otherwise
   */
  public deleteGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }

  /**
   * Simulate an interaction between two creatures
   * @param creature1 First creature
   * @param creature2 Second creature
   * @returns Simulation results
   */
  public async simulateInteraction(creature1: Creature, creature2: Creature): Promise<{
    winner: Creature;
    loser: Creature;
    rounds: number;
    details: any;
  }> {
    if (!this.initialized) {
      throw new Error('Game Theory Service not initialized');
    }

    // Create a game for the interaction
    const gameId = this.createGame(
      `Interaction-${creature1.id}-${creature2.id}`,
      `Interaction between creatures ${creature1.id} and ${creature2.id}`,
      'hawkDove',
      2
    );

    // Get the game
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error(`Failed to create game for interaction: ${gameId}`);
    }

    // Assign creature attributes to players
    // Player 1 = creature1
    game.players[0].name = `Creature ${creature1.id}`;
    // Player 2 = creature2
    game.players[1].name = `Creature ${creature2.id}`;

    // Determine strategies based on creature attributes
    game.players[0].strategy = this.determineCreatureStrategy(creature1);
    game.players[1].strategy = this.determineCreatureStrategy(creature2);

    // Play all rounds
    this.playAllRounds(gameId);

    // Determine winner
    const player1Score = game.players[0].score;
    const player2Score = game.players[1].score;

    let winner: Creature;
    let loser: Creature;
    let rounds = game.currentRound;

    if (player1Score > player2Score) {
      winner = creature1;
      loser = creature2;
    } else if (player2Score > player1Score) {
      winner = creature2;
      loser = creature1;
    } else {
      // In case of a tie, the creature with more particles wins
      const creature1Particles = creature1.groups.reduce((sum, group) => {
        const particleCount = Array.isArray(group.particles) ? group.particles.length : (group.count || 0);
        return sum + particleCount;
      }, 0);
      const creature2Particles = creature2.groups.reduce((sum, group) => {
        const particleCount = Array.isArray(group.particles) ? group.particles.length : (group.count || 0);
        return sum + particleCount;
      }, 0);

      if (creature1Particles >= creature2Particles) {
        winner = creature1;
        loser = creature2;
      } else {
        winner = creature2;
        loser = creature1;
      }
    }

    // Clean up the game
    this.deleteGame(gameId);

    return {
      winner,
      loser,
      rounds,
      details: {
        player1Score,
        player2Score,
        player1Strategy: game.players[0].strategy,
        player2Strategy: game.players[1].strategy,
        history: game.history
      }
    };
  }

  /**
   * Determine a creature's strategy based on its attributes
   * @param creature The creature
   * @returns The strategy
   */
  private determineCreatureStrategy(creature: Creature): StrategyType {
    // Count particles by role
    const particleCounts: Record<Role, number> = {
      [Role.CORE]: 0,
      [Role.CONTROL]: 0,
      [Role.ATTACK]: 0,
      [Role.DEFENSE]: 0,
      [Role.MOVEMENT]: 0
    };

    // Calculate total particles and count by role
    let totalParticles = 0;
    for (const group of creature.groups) {
      const particleCount = Array.isArray(group.particles) ? group.particles.length : (group.count || 0);
      particleCounts[group.role] = particleCount;
      totalParticles += particleCount;
    }

    // Calculate percentages
    const attackPercentage = particleCounts[Role.ATTACK] / totalParticles;
    const defensePercentage = particleCounts[Role.DEFENSE] / totalParticles;
    const controlPercentage = particleCounts[Role.CONTROL] / totalParticles;

    // Determine strategy based on particle distribution
    if (attackPercentage > 0.3) {
      // Aggressive creatures are competitive
      return StrategyType.COMPETITIVE;
    } else if (defensePercentage > 0.3) {
      // Defensive creatures are cooperative
      return StrategyType.COOPERATIVE;
    } else if (controlPercentage > 0.3) {
      // Control-focused creatures are adaptive
      return StrategyType.ADAPTIVE;
    } else {
      // Balanced creatures use mixed strategy
      return StrategyType.MIXED;
    }
  }

  /**
   * Reset the service
   */
  public reset(): void {
    this.games.clear();
    this.initialized = false;
    this.logger.info('Game Theory Service reset');
  }
}

/**
 * Get the game theory service instance
 * @returns The game theory service instance
 */
export function getGameTheoryService(): GameTheoryService {
  if (!instance) {
    instance = new GameTheoryService();
  }
  return instance;
}

