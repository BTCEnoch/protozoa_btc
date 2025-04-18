/**
 * Battle Outcome Types
 * 
 * This file defines types for battle outcomes in the game theory system.
 */

/**
 * Battle outcome interface
 * Represents the outcome of a battle between creatures
 */
export interface BattleOutcome {
  winner: string | null; // ID of the winning creature, or null for a draw
  participants: string[]; // IDs of participating creatures
  rounds: BattleRound[];
  finalScores: Record<string, number>;
  duration: number; // Duration in milliseconds
}

/**
 * Battle round interface
 * Represents a single round in a battle
 */
export interface BattleRound {
  roundNumber: number;
  actions: BattleAction[];
  scores: Record<string, number>;
}

/**
 * Battle action interface
 * Represents an action taken by a creature during a battle
 */
export interface BattleAction {
  creatureId: string;
  strategy: string;
  target?: string;
  result: BattleActionResult;
}

/**
 * Battle action result interface
 * Represents the result of a battle action
 */
export interface BattleActionResult {
  success: boolean;
  damage?: number;
  healing?: number;
  effects?: BattleEffect[];
  description: string;
}

/**
 * Battle effect interface
 * Represents an effect applied during a battle
 */
export interface BattleEffect {
  type: BattleEffectType;
  duration: number; // Duration in rounds
  strength: number; // Effect strength (0-1)
  description: string;
}

/**
 * Battle effect type enum
 * Defines the types of effects that can be applied during a battle
 */
export enum BattleEffectType {
  DAMAGE_OVER_TIME = 'DAMAGE_OVER_TIME',
  HEALING_OVER_TIME = 'HEALING_OVER_TIME',
  STUN = 'STUN',
  SLOW = 'SLOW',
  WEAKEN = 'WEAKEN',
  STRENGTHEN = 'STRENGTHEN',
  SHIELD = 'SHIELD'
}

/**
 * Create a new battle outcome
 * @param participants IDs of participating creatures
 * @returns A new BattleOutcome object
 */
export function createBattleOutcome(participants: string[]): BattleOutcome {
  return {
    winner: null,
    participants,
    rounds: [],
    finalScores: participants.reduce((scores, id) => {
      scores[id] = 0;
      return scores;
    }, {} as Record<string, number>),
    duration: 0
  };
}
