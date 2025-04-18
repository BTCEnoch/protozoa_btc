/**
 * Nash Equilibrium Finder Service
 *
 * This service provides functionality for finding Nash equilibria in games.
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import {
  PayoffMatrix,
  StrategyProfile
} from '../../types/gameTheory/payoffMatrix';
import {
  NashEquilibrium,
  isNashEquilibrium
} from '../../types/gameTheory/nashEquilibrium';
import { findNashEquilibria, isStrictNashEquilibrium } from '../../lib/gameTheory';

/**
 * Singleton instance
 */
let instance: NashEquilibriumFinder | null = null;

/**
 * Nash Equilibrium Finder class
 */
export class NashEquilibriumFinder {
  private blockData: BlockData | null = null;
  private cachedEquilibria: Map<string, NashEquilibrium[]> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): NashEquilibriumFinder {
    if (!instance) {
      instance = new NashEquilibriumFinder();
    }
    return instance;
  }

  /**
   * Initialize the service with block data
   * @param blockData Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.cachedEquilibria.clear();
  }

  /**
   * Find all Nash equilibria in a game
   * @param matrix The payoff matrix
   * @returns Array of Nash equilibria
   */
  findNashEquilibria(matrix: PayoffMatrix): NashEquilibrium[] {
    const matrixKey = this.getMatrixKey(matrix);

    if (this.cachedEquilibria.has(matrixKey)) {
      return this.cachedEquilibria.get(matrixKey)!;
    }

    const equilibria = findNashEquilibria(matrix);
    this.cachedEquilibria.set(matrixKey, equilibria);

    return equilibria;
  }

  /**
   * Find the best Nash equilibrium for a player
   * @param matrix The payoff matrix
   * @param playerId The player ID
   * @returns The best Nash equilibrium for the player, or null if none exists
   */
  findBestNashEquilibrium(matrix: PayoffMatrix, playerId: string): NashEquilibrium | null {
    const equilibria = this.findNashEquilibria(matrix);

    if (equilibria.length === 0) {
      return null;
    }

    // Sort equilibria by payoff for the player
    const sortedEquilibria = [...equilibria].sort((a, b) => {
      return b.payoffs[playerId] - a.payoffs[playerId];
    });

    return sortedEquilibria[0];
  }

  /**
   * Find Pareto optimal Nash equilibria
   * @param matrix The payoff matrix
   * @returns Array of Pareto optimal Nash equilibria
   */
  findParetoOptimalNashEquilibria(matrix: PayoffMatrix): NashEquilibrium[] {
    const equilibria = this.findNashEquilibria(matrix);

    return equilibria.filter(equilibrium => {
      // Check if there's any other equilibrium that Pareto dominates this one
      return !equilibria.some(other => {
        if (other === equilibrium) {
          return false;
        }

        // Check if other equilibrium Pareto dominates this one
        const isDominated = matrix.players.every(player => {
          return other.payoffs[player] >= equilibrium.payoffs[player];
        }) && matrix.players.some(player => {
          return other.payoffs[player] > equilibrium.payoffs[player];
        });

        return isDominated;
      });
    });
  }

  /**
   * Check if a strategy profile is a Nash equilibrium
   * @param matrix The payoff matrix
   * @param profile The strategy profile to check
   * @returns Whether the profile is a Nash equilibrium
   */
  isNashEquilibrium(matrix: PayoffMatrix, profile: StrategyProfile): boolean {
    return isNashEquilibrium(matrix, profile);
  }

  /**
   * Check if a strategy profile is a strict Nash equilibrium
   * @param matrix The payoff matrix
   * @param profile The strategy profile to check
   * @returns Whether the profile is a strict Nash equilibrium
   */
  isStrictNashEquilibrium(matrix: PayoffMatrix, profile: StrategyProfile): boolean {
    return isStrictNashEquilibrium(matrix, profile);
  }

  /**
   * Generate a unique key for a payoff matrix
   * @param matrix The payoff matrix
   * @returns A unique key
   */
  private getMatrixKey(matrix: PayoffMatrix): string {
    const playersKey = matrix.players.join(',');
    const strategiesKey = Object.entries(matrix.strategies)
      .map(([player, strats]) => `${player}:${strats.join('|')}`)
      .join(';');

    // Include a sample of payoffs to ensure uniqueness
    const payoffsKey = matrix.players.map(player => {
      const strat = matrix.strategies[player][0];
      const opponentStrat = matrix.strategies[matrix.players.find(p => p !== player)!][0];
      return `${player}:${strat}:${opponentStrat}:${matrix.payoffs[player][strat][opponentStrat]}`;
    }).join(';');

    return `${playersKey}|${strategiesKey}|${payoffsKey}`;
  }
}

/**
 * Get the Nash equilibrium finder instance
 * @returns The Nash equilibrium finder instance
 */
export function getNashEquilibriumFinder(): NashEquilibriumFinder {
  return NashEquilibriumFinder.getInstance();
}

