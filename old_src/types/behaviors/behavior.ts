/**
 * Types for behaviors
 *
 * This file defines the types for behaviors, behavior patterns, and behavior triggers.
 */

import { Role, Tier } from '../core';

// Behavior interface
export interface Behavior {
  name: string;
  description: string;
  role: Role;
  tier: Tier;
  subclass: string;
  trigger: BehaviorTrigger;
  action: BehaviorAction;
  priority: number; // 0-100, higher values take precedence
}

// Behavior Trigger interface
export interface BehaviorTrigger {
  type: BehaviorTriggerType;
  condition: string; // Description of the trigger condition
  parameters: Record<string, any>; // Trigger-specific parameters
}

// Behavior Trigger Type enum
export enum BehaviorTriggerType {
  COMBAT_START = 'COMBAT_START', // When combat begins
  HEALTH_THRESHOLD = 'HEALTH_THRESHOLD', // When health reaches a certain percentage
  ABILITY_READY = 'ABILITY_READY', // When a specific ability is ready to use
  ENEMY_PROXIMITY = 'ENEMY_PROXIMITY', // When enemies are within a certain range
  ALLY_STATUS = 'ALLY_STATUS', // When allies have a certain status
  FORMATION_STATUS = 'FORMATION_STATUS', // When formation reaches a certain state
  ENVIRONMENT = 'ENVIRONMENT', // When environmental conditions are met
  PERIODIC = 'PERIODIC' // Triggers periodically
}

// Behavior Action interface
export interface BehaviorAction {
  type: BehaviorActionType;
  description: string; // Description of the action
  parameters: Record<string, any>; // Action-specific parameters
}

// Behavior Action Type enum
export enum BehaviorActionType {
  TARGET_SELECTION = 'TARGET_SELECTION', // Selects a target
  ABILITY_USAGE = 'ABILITY_USAGE', // Uses an ability
  MOVEMENT = 'MOVEMENT', // Moves in a specific way
  FORMATION_CHANGE = 'FORMATION_CHANGE', // Changes formation
  COORDINATION = 'COORDINATION', // Coordinates with allies
  RETREAT = 'RETREAT', // Retreats from combat
  DEFENSIVE = 'DEFENSIVE', // Takes defensive action
  AGGRESSIVE = 'AGGRESSIVE' // Takes aggressive action
}

// Behavior Registry interface
export interface BehaviorRegistry {
  [role: string]: {
    [tier: string]: Behavior[];
  };
}

/**
 * Get behaviors by role, tier, and subclass
 * @param registry The behavior registry
 * @param role The role
 * @param tier The tier
 * @param subclass The subclass
 * @returns Array of behaviors, or empty array if none found
 */
export function getBehaviors(
  registry: BehaviorRegistry,
  role: Role,
  tier: Tier,
  subclass: string
): Behavior[] {
  const tierBehaviors = registry[role]?.[tier];
  if (!tierBehaviors) return [];

  return tierBehaviors.filter(behavior => behavior.subclass === subclass);
}

/**
 * Get the highest priority behavior for a given trigger type
 * @param behaviors Array of behaviors
 * @param triggerType The trigger type to filter by
 * @returns The highest priority behavior, or undefined if none found
 */
export function getHighestPriorityBehavior(
  behaviors: Behavior[],
  triggerType: BehaviorTriggerType
): Behavior | undefined {
  const matchingBehaviors = behaviors.filter(
    behavior => behavior.trigger.type === triggerType
  );

  if (matchingBehaviors.length === 0) return undefined;

  return matchingBehaviors.reduce((highest, current) =>
    current.priority > highest.priority ? current : highest
  );
}
