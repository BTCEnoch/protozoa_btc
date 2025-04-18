/**
 * @ai-navigation
 * System: Game Theory
 * Dependencies: mathUtils.ts, creatureModel.ts
 * Consumers: behaviorService.ts, battleService.ts
 * Critical Path: Yes
 * Implementation Status: In Progress
 * 
 * Handles Nash equilibrium calculations and strategic
 * decision-making for creature behaviors and battles.
 */

import { BlockData } from '../../types/bitcoin/bitcoin';
import {
  PayoffMatrix,
  StrategyProfile
} from '../../types/gameTheory/payoffMatrix';
import { calculatePayoffMatrix } from '../../lib/gameTheory';
import { Role } from '../../types/core';

/**
 * Singleton instance
 */
let instance: PayoffMatrixService | null = null;

/**
 * Payoff Matrix Service class
 */
export class PayoffMatrixService {
  private blockData: BlockData | null = null;
  private cachedMatrices: Map<string, PayoffMatrix> = new Map();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): PayoffMatrixService {
    if (!instance) {
      instance = new PayoffMatrixService();
    }
    return instance;
  }

  /**
   * Initialize the service with block data
   * @param blockData Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    this.blockData = blockData;
    this.cachedMatrices.clear();
  }

  /**
   * Create a payoff matrix for a strategic interaction
   * @param players Array of player IDs
   * @param strategies Record mapping player IDs to their available strategies
   * @param payoffCalculator Function to calculate payoffs for a strategy profile
   * @returns A payoff matrix
   */
  createPayoffMatrix(
    players: string[],
    strategies: Record<string, string[]>,
    payoffCalculator: (profile: StrategyProfile) => Record<string, number>
  ): PayoffMatrix {
    const matrixKey = this.getMatrixKey(players, strategies);

    if (this.cachedMatrices.has(matrixKey)) {
      return this.cachedMatrices.get(matrixKey)!;
    }

    const matrix = calculatePayoffMatrix(players, strategies, payoffCalculator);
    this.cachedMatrices.set(matrixKey, matrix);

    return matrix;
  }

  /**
   * Create a standard 2-player payoff matrix for creature interactions
   * @param creature1Id ID of the first creature
   * @param creature2Id ID of the second creature
   * @param creature1Role Role of the first creature
   * @param creature2Role Role of the second creature
   * @returns A payoff matrix
   */
  createStandardCreatureMatrix(
    creature1Id: string,
    creature2Id: string,
    creature1Role: Role,
    creature2Role: Role
  ): PayoffMatrix {
    const players = [creature1Id, creature2Id];

    // Define strategies based on roles
    const strategies: Record<string, string[]> = {
      [creature1Id]: this.getStrategiesForRole(creature1Role),
      [creature2Id]: this.getStrategiesForRole(creature2Role)
    };

    // Define payoff calculator
    const payoffCalculator = (profile: StrategyProfile): Record<string, number> => {
      const strategy1 = profile[creature1Id];
      const strategy2 = profile[creature2Id];

      // Calculate payoffs based on role interactions
      return {
        [creature1Id]: this.calculateRoleInteractionPayoff(creature1Role, strategy1, creature2Role, strategy2),
        [creature2Id]: this.calculateRoleInteractionPayoff(creature2Role, strategy2, creature1Role, strategy1)
      };
    };

    return this.createPayoffMatrix(players, strategies, payoffCalculator);
  }

  /**
   * Get strategies available for a role
   * @param role The role
   * @returns Array of strategy names
   */
  private getStrategiesForRole(role: Role): string[] {
    switch (role) {
      case Role.ATTACK:
        return ['aggressive', 'tactical', 'opportunistic'];
      case Role.DEFENSE:
        return ['protective', 'counter', 'evasive'];
      case Role.CONTROL:
        return ['commanding', 'disruptive', 'supportive'];
      case Role.MOVEMENT:
        return ['swift', 'flanking', 'unpredictable'];
      case Role.CORE:
        return ['balanced', 'adaptive', 'resilient'];
      default:
        return ['balanced', 'aggressive', 'evasive'];
    }
  }

  /**
   * Calculate payoff for role interaction
   * @param role1 First role
   * @param strategy1 First strategy
   * @param role2 Second role
   * @param strategy2 Second strategy
   * @returns Payoff value
   */
  private calculateRoleInteractionPayoff(
    role1: Role,
    strategy1: string,
    role2: Role,
    strategy2: string
  ): number {
    // Base payoff matrix for role interactions
    const basePayoffs: Record<Role, Record<Role, number>> = {
      [Role.ATTACK]: {
        [Role.ATTACK]: 0,      // Neutral against other attackers
        [Role.DEFENSE]: -5,    // Disadvantage against defenders
        [Role.CONTROL]: 5,     // Advantage against controllers
        [Role.MOVEMENT]: 10,   // Strong advantage against movement
        [Role.CORE]: 0         // Neutral against core
      },
      [Role.DEFENSE]: {
        [Role.ATTACK]: 10,     // Strong advantage against attackers
        [Role.DEFENSE]: 0,     // Neutral against other defenders
        [Role.CONTROL]: -5,    // Disadvantage against controllers
        [Role.MOVEMENT]: 0,    // Neutral against movement
        [Role.CORE]: 5         // Advantage against core
      },
      [Role.CONTROL]: {
        [Role.ATTACK]: 0,      // Neutral against attackers
        [Role.DEFENSE]: 10,    // Strong advantage against defenders
        [Role.CONTROL]: 0,     // Neutral against other controllers
        [Role.MOVEMENT]: -5,   // Disadvantage against movement
        [Role.CORE]: 5         // Advantage against core
      },
      [Role.MOVEMENT]: {
        [Role.ATTACK]: -5,     // Disadvantage against attackers
        [Role.DEFENSE]: 5,     // Advantage against defenders
        [Role.CONTROL]: 10,    // Strong advantage against controllers
        [Role.MOVEMENT]: 0,    // Neutral against other movement
        [Role.CORE]: 0         // Neutral against core
      },
      [Role.CORE]: {
        [Role.ATTACK]: 5,      // Advantage against attackers
        [Role.DEFENSE]: 0,     // Neutral against defenders
        [Role.CONTROL]: -5,    // Disadvantage against controllers
        [Role.MOVEMENT]: 5,    // Advantage against movement
        [Role.CORE]: 0         // Neutral against other core
      }
    };

    // Strategy modifiers
    const strategyModifiers: Record<string, number> = {
      'aggressive': 3,
      'tactical': 1,
      'opportunistic': 2,
      'protective': 2,
      'counter': 3,
      'evasive': 1,
      'commanding': 3,
      'disruptive': 2,
      'supportive': 1,
      'swift': 3,
      'flanking': 2,
      'unpredictable': 1,
      'balanced': 2,
      'adaptive': 3,
      'resilient': 1
    };

    // Calculate base payoff from role interaction
    let payoff = basePayoffs[role1][role2];

    // Apply strategy modifiers
    payoff += strategyModifiers[strategy1];

    // Apply counter-strategy effects
    if (
      (strategy1 === 'aggressive' && strategy2 === 'counter') ||
      (strategy1 === 'tactical' && strategy2 === 'unpredictable') ||
      (strategy1 === 'opportunistic' && strategy2 === 'protective') ||
      (strategy1 === 'protective' && strategy2 === 'disruptive') ||
      (strategy1 === 'counter' && strategy2 === 'swift') ||
      (strategy1 === 'evasive' && strategy2 === 'commanding') ||
      (strategy1 === 'commanding' && strategy2 === 'resilient') ||
      (strategy1 === 'disruptive' && strategy2 === 'adaptive') ||
      (strategy1 === 'supportive' && strategy2 === 'aggressive') ||
      (strategy1 === 'swift' && strategy2 === 'tactical') ||
      (strategy1 === 'flanking' && strategy2 === 'evasive') ||
      (strategy1 === 'unpredictable' && strategy2 === 'flanking') ||
      (strategy1 === 'balanced' && strategy2 === 'opportunistic') ||
      (strategy1 === 'adaptive' && strategy2 === 'supportive') ||
      (strategy1 === 'resilient' && strategy2 === 'balanced')
    ) {
      payoff -= 5; // Disadvantage against counter-strategy
    }

    return payoff;
  }

  /**
   * Generate a unique key for a payoff matrix
   * @param players Array of player IDs
   * @param strategies Record mapping player IDs to their available strategies
   * @returns A unique key
   */
  private getMatrixKey(
    players: string[],
    strategies: Record<string, string[]>
  ): string {
    const playersKey = players.join(',');
    const strategiesKey = Object.entries(strategies)
      .map(([player, strats]) => `${player}:${strats.join('|')}`)
      .join(';');

    return `${playersKey}|${strategiesKey}`;
  }
}

/**
 * Get the payoff matrix service instance
 * @returns The payoff matrix service instance
 */
export function getPayoffMatrixService(): PayoffMatrixService {
  return PayoffMatrixService.getInstance();
}




