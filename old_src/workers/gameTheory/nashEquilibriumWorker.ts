/**
 * Nash Equilibrium Worker for Bitcoin Protozoa
 * 
 * This worker calculates Nash equilibria for game theory calculations.
 * It handles both pure and mixed strategy equilibria for 2-player games.
 */

import { WorkerMessage } from '../../types/workers/messages';
import { PayoffMatrix, StrategyProfile } from '../../types/gameTheory/payoffMatrix';
import { NashEquilibrium } from '../../types/gameTheory/nashEquilibrium';

// Worker state
let iterations = 0;
let precision = 0.001;
let maxIterations = 1000;

/**
 * Handle messages from the main thread
 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'nashEquilibrium.calculate':
      const result = calculateNashEquilibria(data.payoffMatrix);
      self.postMessage({ 
        type: 'nashEquilibrium.result',
        data: result
      });
      break;
    
    case 'nashEquilibrium.setOptions':
      precision = data.precision || 0.001;
      maxIterations = data.maxIterations || 1000;
      break;
      
    default:
      console.warn(`Unknown message type: ${type}`);
  }
};

/**
 * Calculate Nash equilibria for a payoff matrix
 * @param payoffMatrix The payoff matrix
 * @returns Array of Nash equilibria
 */
function calculateNashEquilibria(payoffMatrix: PayoffMatrix): NashEquilibrium[] {
  iterations = 0;
  
  // First, check for pure strategy Nash equilibria
  const pureEquilibria = findPureStrategyEquilibria(payoffMatrix);
  
  // If there are pure strategy equilibria, return them
  if (pureEquilibria.length > 0) {
    return pureEquilibria;
  }
  
  // Otherwise, look for mixed strategy equilibria for 2x2 games
  if (payoffMatrix.rows === 2 && payoffMatrix.cols === 2) {
    const mixedEquilibrium = findMixedStrategyEquilibrium2x2(payoffMatrix);
    if (mixedEquilibrium) {
      return [mixedEquilibrium];
    }
  } else {
    // For larger games, use a more general algorithm
    const mixedEquilibria = findMixedStrategyEquilibriaGeneral(payoffMatrix);
    if (mixedEquilibria.length > 0) {
      return mixedEquilibria;
    }
  }
  
  return [];
}

/**
 * Find pure strategy Nash equilibria
 * @param payoffMatrix The payoff matrix
 * @returns Array of pure strategy Nash equilibria
 */
function findPureStrategyEquilibria(payoffMatrix: PayoffMatrix): NashEquilibrium[] {
  const equilibria: NashEquilibrium[] = [];
  const { playerOnePayoffs, playerTwoPayoffs, rows, cols } = payoffMatrix;
  
  // Check each strategy profile
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let isEquilibrium = true;
      
      // Check if player one can improve by switching strategy
      for (let newRow = 0; newRow < rows; newRow++) {
        if (newRow !== row && playerOnePayoffs[newRow][col] > playerOnePayoffs[row][col]) {
          isEquilibrium = false;
          break;
        }
      }
      
      if (!isEquilibrium) continue;
      
      // Check if player two can improve by switching strategy
      for (let newCol = 0; newCol < cols; newCol++) {
        if (newCol !== col && playerTwoPayoffs[row][newCol] > playerTwoPayoffs[row][col]) {
          isEquilibrium = false;
          break;
        }
      }
      
      if (isEquilibrium) {
        // Create pure strategy equilibrium
        const equilibrium: NashEquilibrium = {
          type: 'pure',
          strategy: {
            playerOne: createPureStrategyVector(row, rows),
            playerTwo: createPureStrategyVector(col, cols)
          },
          payoffs: {
            playerOne: playerOnePayoffs[row][col],
            playerTwo: playerTwoPayoffs[row][col]
          }
        };
        
        equilibria.push(equilibrium);
      }
    }
  }
  
  return equilibria;
}

/**
 * Find mixed strategy Nash equilibrium for 2x2 games
 * @param payoffMatrix The 2x2 payoff matrix
 * @returns Mixed strategy Nash equilibrium
 */
function findMixedStrategyEquilibrium2x2(payoffMatrix: PayoffMatrix): NashEquilibrium | null {
  const { playerOnePayoffs, playerTwoPayoffs } = payoffMatrix;
  
  // Extract payoffs for easier calculation
  const a = playerOnePayoffs[0][0]; // Player 1's payoff for (0,0)
  const b = playerOnePayoffs[0][1]; // Player 1's payoff for (0,1)
  const c = playerOnePayoffs[1][0]; // Player 1's payoff for (1,0)
  const d = playerOnePayoffs[1][1]; // Player 1's payoff for (1,1)
  
  const e = playerTwoPayoffs[0][0]; // Player 2's payoff for (0,0)
  const f = playerTwoPayoffs[0][1]; // Player 2's payoff for (0,1)
  const g = playerTwoPayoffs[1][0]; // Player 2's payoff for (1,0)
  const h = playerTwoPayoffs[1][1]; // Player 2's payoff for (1,1)
  
  // Calculate denominators
  const denomOne = (a - b - c + d);
  const denomTwo = (e - f - g + h);
  
  // Check if denominators are close to zero
  if (Math.abs(denomOne) < precision || Math.abs(denomTwo) < precision) {
    return null; // No unique mixed equilibrium
  }
  
  // Calculate probabilities
  let p = (h - f) / denomTwo; // Probability of player 1 playing strategy 0
  let q = (h - g) / denomTwo; // Probability of player 2 playing strategy 0
  
  // Check if probabilities are valid
  if (p < 0 || p > 1 || q < 0 || q > 1) {
    return null; // No valid mixed equilibrium
  }
  
  // Calculate expected payoffs
  const expectedPayoffOne = q * (p * a + (1 - p) * c) + (1 - q) * (p * b + (1 - p) * d);
  const expectedPayoffTwo = p * (q * e + (1 - q) * f) + (1 - p) * (q * g + (1 - q) * h);
  
  // Create mixed strategy equilibrium
  const equilibrium: NashEquilibrium = {
    type: 'mixed',
    strategy: {
      playerOne: [p, 1 - p],
      playerTwo: [q, 1 - q]
    },
    payoffs: {
      playerOne: expectedPayoffOne,
      playerTwo: expectedPayoffTwo
    }
  };
  
  return equilibrium;
}

/**
 * Find mixed strategy Nash equilibria for general games
 * using the support enumeration algorithm
 * @param payoffMatrix The payoff matrix
 * @returns Array of mixed strategy Nash equilibria
 */
function findMixedStrategyEquilibriaGeneral(payoffMatrix: PayoffMatrix): NashEquilibrium[] {
  // This is a simplified implementation of support enumeration
  // For real applications, you would use a more sophisticated algorithm
  
  // For now, we'll return an empty array as a placeholder
  // Implementation of support enumeration is complex and beyond scope
  return [];
}

/**
 * Create a pure strategy vector with 1 at the specified index
 * @param index Index to set to 1
 * @param size Size of the vector
 * @returns Pure strategy vector
 */
function createPureStrategyVector(index: number, size: number): number[] {
  const vector = new Array(size).fill(0);
  vector[index] = 1;
  return vector;
}

// Let main thread know worker is ready
self.postMessage({ type: 'nashEquilibrium.ready' }); 