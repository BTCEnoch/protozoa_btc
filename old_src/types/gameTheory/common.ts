/**
 * Common Game Theory Types
 * 
 * This file contains simple versions of game theory interfaces for basic usage.
 * For more detailed implementations, see the specific files:
 * - payoffMatrix.ts: Contains detailed payoff matrix types
 * - nashEquilibrium.ts: Contains detailed Nash equilibrium types
 */

/**
 * Represents a payoff matrix for a 2-player game
 * This is a simplified version of the PayoffMatrix interface in payoffMatrix.ts
 */
export interface SimplePayoffMatrix {
  // Number of rows (player 1 strategies)
  rows: number;
  // Number of columns (player 2 strategies)
  cols: number;
  // Payoffs for player 1
  playerOnePayoffs: number[][];
  // Payoffs for player 2
  playerTwoPayoffs: number[][];
}

/**
 * Represents a Nash equilibrium solution
 * This is a simplified version of the NashEquilibrium interface in nashEquilibrium.ts
 */
export interface SimpleNashEquilibrium {
  // The type of equilibrium (pure or mixed)
  type: 'pure' | 'mixed';
  // Player 1's equilibrium strategy (probabilities)
  playerOneStrategy: number[];
  // Player 2's equilibrium strategy (probabilities)
  playerTwoStrategy: number[];
  // Expected payoff for player 1
  playerOnePayoff: number;
  // Expected payoff for player 2
  playerTwoPayoff: number;
} 