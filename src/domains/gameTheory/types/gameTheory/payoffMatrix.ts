/**
 * Payoff Matrix Types for Bitcoin Protozoa
 * 
 * This file defines the types for payoff matrices in game theory.
 */

/**
 * Strategy profile interface
 * Maps player IDs to their chosen strategies
 */
export interface StrategyProfile {
  [playerId: string]: string;
}

/**
 * Payoff matrix interface
 * Represents a game theory payoff matrix
 */
export interface PayoffMatrix {
  // List of players in the game
  players: string[];
  
  // Available strategies for each player
  strategies: {
    [playerId: string]: string[];
  };
  
  // Payoff function that calculates payoffs for a given strategy profile
  payoffs: (profile: StrategyProfile) => {
    [playerId: string]: number;
  };
}
