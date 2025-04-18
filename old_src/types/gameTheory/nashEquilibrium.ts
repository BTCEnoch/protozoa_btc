/**
 * Nash Equilibrium Types
 * 
 * This file defines types for Nash equilibrium calculations.
 */

import { PayoffMatrix, StrategyProfile } from './payoffMatrix';

/**
 * Nash equilibrium interface
 * Represents a Nash equilibrium in a game
 */
export interface NashEquilibrium {
  profile: StrategyProfile;
  payoffs: Record<string, number>;
  isPure: boolean;
  isStrict: boolean;
}

/**
 * Mixed strategy interface
 * Represents a probability distribution over strategies
 */
export interface MixedStrategy {
  [strategy: string]: number; // Maps strategy to probability
}

/**
 * Mixed strategy profile interface
 * Represents a combination of mixed strategies chosen by players
 */
export interface MixedStrategyProfile {
  [player: string]: MixedStrategy;
}

/**
 * Mixed strategy Nash equilibrium interface
 * Represents a Nash equilibrium with mixed strategies
 */
export interface MixedStrategyNashEquilibrium {
  profile: MixedStrategyProfile;
  expectedPayoffs: Record<string, number>;
}

/**
 * Check if a strategy profile is a Nash equilibrium
 * @param matrix The payoff matrix
 * @param profile The strategy profile to check
 * @returns Whether the profile is a Nash equilibrium
 */
export function isNashEquilibrium(
  matrix: PayoffMatrix,
  profile: StrategyProfile
): boolean {
  for (const player of matrix.players) {
    const currentStrategy = profile[player];
    const currentPayoff = getPayoff(matrix, player, profile);
    
    // Check if player can improve by deviating
    for (const alternativeStrategy of matrix.strategies[player]) {
      if (alternativeStrategy === currentStrategy) {
        continue;
      }
      
      const deviationProfile = { ...profile, [player]: alternativeStrategy };
      const deviationPayoff = getPayoff(matrix, player, deviationProfile);
      
      if (deviationPayoff > currentPayoff) {
        return false; // Not a Nash equilibrium
      }
    }
  }
  
  return true;
}

/**
 * Get the payoff for a player given a strategy profile
 * @param matrix The payoff matrix
 * @param player The player
 * @param profile The strategy profile
 * @returns The payoff value
 */
export function getPayoff(
  matrix: PayoffMatrix,
  player: string,
  profile: StrategyProfile
): number {
  const playerStrategy = profile[player];
  
  // For 2-player games
  if (matrix.players.length === 2) {
    const opponent = matrix.players.find(p => p !== player)!;
    const opponentStrategy = profile[opponent];
    
    return matrix.payoffs[player][playerStrategy][opponentStrategy];
  }
  
  // For n-player games (more complex)
  // This is a simplified implementation
  const strategyKey = matrix.players
    .filter(p => p !== player)
    .map(p => profile[p])
    .join(',');
  
  return matrix.payoffs[player][playerStrategy][strategyKey];
}
