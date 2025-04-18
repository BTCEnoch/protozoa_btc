/**
 * Game Theory Types for Bitcoin Protozoa
 * 
 * This file defines the types for the game theory system.
 */

/**
 * Game theory strategy types
 */
export enum StrategyType {
  COOPERATIVE = 'cooperative',
  COMPETITIVE = 'competitive',
  MIXED = 'mixed',
  ADAPTIVE = 'adaptive',
  RANDOM = 'random'
}

/**
 * Game theory outcome types
 */
export enum OutcomeType {
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
  COOPERATE = 'cooperate',
  DEFECT = 'defect'
}

/**
 * Game theory payoff matrix
 */
export interface PayoffMatrix {
  [player1Strategy: string]: {
    [player2Strategy: string]: {
      player1: number;
      player2: number;
    }
  }
}

/**
 * Game theory player interface
 */
export interface GameTheoryPlayer {
  id: string;
  name: string;
  strategy: StrategyType;
  history: OutcomeType[];
  score: number;
  adaptationRate?: number;
}

/**
 * Game theory game interface
 */
export interface GameTheoryGame {
  id: string;
  name: string;
  description: string;
  players: GameTheoryPlayer[];
  payoffMatrix: PayoffMatrix;
  rounds: number;
  currentRound: number;
  history: {
    round: number;
    moves: {
      playerId: string;
      strategy: StrategyType;
      outcome: OutcomeType;
      payoff: number;
    }[];
  }[];
}

/**
 * Game theory simulation configuration
 */
export interface GameTheorySimulationConfig {
  gameType: string;
  rounds: number;
  playerCount: number;
  initialStrategies: StrategyType[];
  adaptationEnabled: boolean;
  adaptationRate: number;
  mutationRate: number;
  payoffMatrix?: PayoffMatrix;
}

/**
 * Game theory simulation results
 */
export interface GameTheorySimulationResults {
  gameId: string;
  rounds: number;
  players: GameTheoryPlayer[];
  strategyDistribution: {
    [strategy in StrategyType]: number;
  };
  averageScores: {
    [strategy in StrategyType]: number;
  };
  dominantStrategy?: StrategyType;
  equilibriumReached: boolean;
  equilibriumRound?: number;
}

/**
 * Game theory strategy parameters
 */
export interface StrategyParameters {
  cooperationProbability: number;
  defectionProbability: number;
  memoryLength: number;
  adaptationRate: number;
  explorationRate: number;
}

/**
 * Game theory strategy factory function type
 */
export type StrategyFactory = (params?: Partial<StrategyParameters>) => (history: OutcomeType[], opponentHistory: OutcomeType[]) => StrategyType;
