/**
 * Nash Equilibrium Types for Bitcoin Protozoa
 * 
 * This file defines the types for Nash equilibrium calculations in game theory.
 */

import { PayoffMatrix, StrategyProfile } from './payoffMatrix';

/**
 * Nash equilibrium interface
 * Represents a Nash equilibrium in a game
 */
export interface NashEquilibrium {
  // The strategy profile that constitutes the Nash equilibrium
  profile: StrategyProfile;
  
  // The payoffs for each player at this equilibrium
  payoffs: {
    [playerId: string]: number;
  };
  
  // Whether this is a strict Nash equilibrium
  isStrict: boolean;
}

/**
 * Get the payoff for a player given a strategy profile
 * @param matrix The payoff matrix
 * @param player The player ID
 * @param profile The strategy profile
 * @returns The payoff for the player
 */
export function getPayoff(
  matrix: PayoffMatrix,
  player: string,
  profile: StrategyProfile
): number {
  return matrix.payoffs(profile)[player];
}

/**
 * Check if a strategy profile is a Nash equilibrium
 * @param matrix The payoff matrix
 * @param profile The strategy profile to check
 * @returns True if the profile is a Nash equilibrium, false otherwise
 */
export function isNashEquilibrium(
  matrix: PayoffMatrix,
  profile: StrategyProfile
): boolean {
  // Check for each player if they can improve by deviating
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
