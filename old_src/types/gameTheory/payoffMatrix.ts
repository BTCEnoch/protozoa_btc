/**
 * Payoff Matrix Types
 * 
 * This file defines types for payoff matrices used in game theory calculations.
 */

/**
 * Payoff matrix interface
 * Represents the outcomes of strategic interactions between creatures or groups
 */
export interface PayoffMatrix {
  players: string[];
  strategies: Record<string, string[]>;
  payoffs: Record<string, Record<string, Record<string, number>>>;
}

/**
 * Payoff entry interface
 * Represents a single entry in a payoff matrix
 */
export interface PayoffEntry {
  player: string;
  strategy: string;
  opponentStrategy: string;
  payoff: number;
}

/**
 * Strategy profile interface
 * Represents a combination of strategies chosen by players
 */
export interface StrategyProfile {
  [player: string]: string; // Maps player ID to their chosen strategy
}

/**
 * Payoff result interface
 * Represents the outcome of a strategic interaction
 */
export interface PayoffResult {
  profile: StrategyProfile;
  payoffs: Record<string, number>;
  isNashEquilibrium: boolean;
  isParetoDominant: boolean;
}

/**
 * Create a new payoff matrix
 * @param players Array of player IDs
 * @param strategies Record mapping player IDs to their available strategies
 * @param payoffs Record of payoff values
 * @returns A new PayoffMatrix object
 */
export function createPayoffMatrix(
  players: string[],
  strategies: Record<string, string[]>,
  payoffs: Record<string, Record<string, Record<string, number>>>
): PayoffMatrix {
  return {
    players,
    strategies,
    payoffs
  };
}

/**
 * Create a symmetric 2-player payoff matrix
 * @param strategies Array of strategies available to both players
 * @param payoffValues Record mapping strategy pairs to payoff values
 * @returns A new symmetric PayoffMatrix
 */
export function createSymmetricPayoffMatrix(
  strategies: string[],
  payoffValues: Record<string, Record<string, number>>
): PayoffMatrix {
  const players = ['player1', 'player2'];
  const playerStrategies: Record<string, string[]> = {
    player1: strategies,
    player2: strategies
  };
  
  const payoffs: Record<string, Record<string, Record<string, number>>> = {
    player1: {},
    player2: {}
  };
  
  // Fill in payoffs for player1
  for (const strat1 of strategies) {
    payoffs.player1[strat1] = {};
    for (const strat2 of strategies) {
      payoffs.player1[strat1][strat2] = payoffValues[strat1][strat2];
    }
  }
  
  // Fill in payoffs for player2 (symmetric)
  for (const strat1 of strategies) {
    payoffs.player2[strat1] = {};
    for (const strat2 of strategies) {
      payoffs.player2[strat1][strat2] = payoffValues[strat2][strat1];
    }
  }
  
  return {
    players,
    strategies: playerStrategies,
    payoffs
  };
}
