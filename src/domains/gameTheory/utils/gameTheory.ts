/**
 * Game Theory Utilities
 *
 * This file provides utility functions for game theory calculations.
 */

import {
  PayoffMatrix,
  StrategyProfile
} from '../types/gameTheory/payoffMatrix';

import {
  isNashEquilibrium,
  getPayoff,
  NashEquilibrium
} from '../types/gameTheory/nashEquilibrium';

import {
  DecisionTree,
  DecisionNode,
  DecisionPath
} from '../types/gameTheory/decisionTree';

import {
  UtilityFunction,
  createUtilityFunction,
  linearNormalizer,
  sigmoidNormalizer
} from '../types/gameTheory/utilityFunction';

/**
 * Calculate payoff matrix for a strategic interaction
 * @param players Array of player IDs
 * @param strategies Record mapping player IDs to their available strategies
 * @param payoffCalculator Function to calculate payoffs for a strategy profile
 * @returns A payoff matrix
 */
export function calculatePayoffMatrix(
  players: string[],
  strategies: Record<string, string[]>,
  payoffCalculator: (profile: StrategyProfile) => Record<string, number>
): PayoffMatrix {
  const payoffs: Record<string, Record<string, Record<string, number>>> = {};

  // Initialize payoffs structure
  for (const player of players) {
    payoffs[player] = {};
    for (const strategy of strategies[player]) {
      payoffs[player][strategy] = {};
    }
  }

  // For 2-player games, we can enumerate all strategy profiles
  if (players.length === 2) {
    const [player1, player2] = players;

    for (const strategy1 of strategies[player1]) {
      for (const strategy2 of strategies[player2]) {
        const profile: StrategyProfile = {
          [player1]: strategy1,
          [player2]: strategy2
        };

        const profilePayoffs = payoffCalculator(profile);

        payoffs[player1][strategy1][strategy2] = profilePayoffs[player1];
        payoffs[player2][strategy2][strategy1] = profilePayoffs[player2];
      }
    }
  } else {
    // For n-player games, we need a more complex approach
    // This is a simplified implementation that works for small strategy spaces

    // Generate all possible strategy profiles
    const generateProfiles = (
      currentPlayer: number,
      currentProfile: StrategyProfile
    ): StrategyProfile[] => {
      if (currentPlayer >= players.length) {
        return [currentProfile];
      }

      const player = players[currentPlayer];
      const playerStrategies = strategies[player];

      return playerStrategies.flatMap(strategy => {
        const newProfile = { ...currentProfile, [player]: strategy };
        return generateProfiles(currentPlayer + 1, newProfile);
      });
    };

    const allProfiles = generateProfiles(0, {});

    // Calculate payoffs for each profile
    for (const profile of allProfiles) {
      const profilePayoffs = payoffCalculator(profile);

      for (const player of players) {
        const playerStrategy = profile[player];
        const otherPlayersKey = players
          .filter(p => p !== player)
          .map(p => profile[p])
          .join(',');

        payoffs[player][playerStrategy][otherPlayersKey] = profilePayoffs[player];
      }
    }
  }

  return {
    players,
    strategies,
    payoffs
  };
}

/**
 * Find all Nash equilibria in a game
 * @param matrix The payoff matrix
 * @returns Array of Nash equilibria
 */
export function findNashEquilibria(matrix: PayoffMatrix): NashEquilibrium[] {
  const equilibria: NashEquilibrium[] = [];

  // For 2-player games, we can check all strategy profiles
  if (matrix.players.length === 2) {
    const [player1, player2] = matrix.players;

    for (const strategy1 of matrix.strategies[player1]) {
      for (const strategy2 of matrix.strategies[player2]) {
        const profile: StrategyProfile = {
          [player1]: strategy1,
          [player2]: strategy2
        };

        if (isNashEquilibrium(matrix, profile)) {
          const payoffs: Record<string, number> = {
            [player1]: getPayoff(matrix, player1, profile),
            [player2]: getPayoff(matrix, player2, profile)
          };

          // Check if it's a strict Nash equilibrium
          const isStrict = isStrictNashEquilibrium(matrix, profile);

          equilibria.push({
            profile,
            payoffs,
            isPure: true,
            isStrict
          });
        }
      }
    }
  } else {
    // For n-player games, we need a more complex approach
    // This is a simplified implementation that works for small strategy spaces

    // Generate all possible strategy profiles
    const generateProfiles = (
      currentPlayer: number,
      currentProfile: StrategyProfile
    ): StrategyProfile[] => {
      if (currentPlayer >= matrix.players.length) {
        return [currentProfile];
      }

      const player = matrix.players[currentPlayer];
      const playerStrategies = matrix.strategies[player];

      return playerStrategies.flatMap(strategy => {
        const newProfile = { ...currentProfile, [player]: strategy };
        return generateProfiles(currentPlayer + 1, newProfile);
      });
    };

    const allProfiles = generateProfiles(0, {});

    // Check each profile for Nash equilibrium
    for (const profile of allProfiles) {
      if (isNashEquilibrium(matrix, profile)) {
        const payoffs: Record<string, number> = {};

        for (const player of matrix.players) {
          payoffs[player] = getPayoff(matrix, player, profile);
        }

        // Check if it's a strict Nash equilibrium
        const isStrict = isStrictNashEquilibrium(matrix, profile);

        equilibria.push({
          profile,
          payoffs,
          isPure: true,
          isStrict
        });
      }
    }
  }

  return equilibria;
}

/**
 * Check if a strategy profile is a strict Nash equilibrium
 * @param matrix The payoff matrix
 * @param profile The strategy profile to check
 * @returns Whether the profile is a strict Nash equilibrium
 */
export function isStrictNashEquilibrium(
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

      if (deviationPayoff >= currentPayoff) {
        return false; // Not a strict Nash equilibrium
      }
    }
  }

  return true;
}

/**
 * Evaluate a decision tree to find the optimal path
 * @param tree The decision tree
 * @param state The current state
 * @returns The optimal path through the tree
 */
export function evaluateDecisionTree(
  tree: DecisionTree,
  state: any
): DecisionPath {
  return tree.evaluate(state);
}

/**
 * Calculate utility based on multiple factors
 * @param factors Object containing factor values
 * @param weights Object containing factor weights
 * @returns The calculated utility value
 */
export function calculateUtility(
  factors: Record<string, number>,
  weights: Record<string, number>
): number {
  const utilityFunction = createUtilityFunction(weights);
  return utilityFunction.calculate(factors);
}

/**
 * Create a utility function with normalized factors
 * @param weights Weights for different factors
 * @param ranges Ranges for normalizing factors (min, max)
 * @returns A utility function
 */
export function createNormalizedUtilityFunction(
  weights: Record<string, number>,
  ranges: Record<string, [number, number]>
): UtilityFunction {
  const normalizers: Record<string, (value: number) => number> = {};

  for (const factor in ranges) {
    const [min, max] = ranges[factor];
    normalizers[factor] = linearNormalizer(min, max);
  }

  return createUtilityFunction(weights, normalizers);
}

/**
 * Calculate the expected utility of a strategy profile
 * @param matrix The payoff matrix
 * @param profile The strategy profile
 * @param utilityWeights Weights for different factors in utility calculation
 * @returns The expected utility for each player
 */
export function calculateExpectedUtility(
  matrix: PayoffMatrix,
  profile: StrategyProfile,
  utilityWeights: Record<string, Record<string, number>>
): Record<string, number> {
  const expectedUtility: Record<string, number> = {};

  for (const player of matrix.players) {
    const payoff = getPayoff(matrix, player, profile);

    // Convert payoff to utility using player-specific weights
    const weights = utilityWeights[player] || {};
    const factors = { payoff };

    expectedUtility[player] = calculateUtility(factors, weights);
  }

  return expectedUtility;
}
