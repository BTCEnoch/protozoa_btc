/**
 * Event Types for Bitcoin Protozoa
 *
 * This file defines the types for the event system, including event types,
 * event data structures, and observer pattern interfaces.
 */

import { Role, Tier } from '../core';
import { Mutation } from '../mutations/mutation';
import { Formation } from '../formations/formation';
import { Behavior } from '../behaviors/behavior';
import { Ability } from '../abilities/ability';
import { BlockData } from '../../services/bitcoin/bitcoinService';
import { Vector3 } from '../common';
import { AppConfig } from '../config';
import { PayoffMatrix, StrategyProfile } from '../gameTheory/payoffMatrix';
import { NashEquilibrium } from '../gameTheory/nashEquilibrium';
import { EventCategory } from './eventCategory';

/**
 * EventType enum
 * Defines the different types of events in the system
 */
export enum EventType {
  // System events
  INITIALIZATION = 'INITIALIZATION',
  APP_START = 'APP_START',
  APP_SHUTDOWN = 'APP_SHUTDOWN',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  LOAD_COMPLETE = 'LOAD_COMPLETE',

  // Service initialization events
  SERVICE_INITIALIZED = 'SERVICE_INITIALIZED',
  BITCOIN_SERVICE_READY = 'BITCOIN_SERVICE_READY',
  RENDERER_READY = 'RENDERER_READY',
  PHYSICS_READY = 'PHYSICS_READY',
  EVOLUTION_READY = 'EVOLUTION_READY',
  GAME_THEORY_READY = 'GAME_THEORY_READY',
  TRAIT_BANK_LOADED = 'TRAIT_BANK_LOADED',

  // Bitcoin events
  BLOCK_FETCHED = 'BLOCK_FETCHED',
  BLOCK_PROCESSED = 'BLOCK_PROCESSED',
  CONFIRMATIONS_UPDATED = 'CONFIRMATIONS_UPDATED',

  // Creature events
  CREATURE_CREATED = 'CREATURE_CREATED',
  CREATURE_UPDATED = 'CREATURE_UPDATED',
  CREATURE_SELECTED = 'CREATURE_SELECTED',

  // Particle events
  PARTICLES_UPDATED = 'PARTICLES_UPDATED',
  PARTICLE_GROUP_CREATED = 'PARTICLE_GROUP_CREATED',
  PARTICLE_GROUP_UPDATED = 'PARTICLE_GROUP_UPDATED',

  // Evolution events
  EVOLUTION_TRIGGERED = 'EVOLUTION_TRIGGERED',
  MUTATION_APPLIED = 'MUTATION_APPLIED',
  EVOLUTION_TRACKED = 'EVOLUTION_TRACKED',

  // Formation events
  FORMATION_CHANGED = 'FORMATION_CHANGED',
  FORMATION_COMPLETED = 'FORMATION_COMPLETED',

  // Behavior events
  BEHAVIOR_TRIGGERED = 'BEHAVIOR_TRIGGERED',
  BEHAVIOR_COMPLETED = 'BEHAVIOR_COMPLETED',

  // Ability events
  ABILITY_USED = 'ABILITY_USED',
  ABILITY_COOLDOWN = 'ABILITY_COOLDOWN',
  ABILITY_UNLOCKED = 'ABILITY_UNLOCKED',

  // Rendering events
  RENDER_FRAME = 'RENDER_FRAME',
  CAMERA_MOVED = 'CAMERA_MOVED',
  VIEWPORT_RESIZED = 'VIEWPORT_RESIZED',

  // Battle events
  BATTLE_STARTED = 'BATTLE_STARTED',
  BATTLE_ENDED = 'BATTLE_ENDED',
  BATTLE_ROUND_COMPLETED = 'BATTLE_ROUND_COMPLETED',

  // UI events
  UI_ACTION = 'UI_ACTION',
  UI_STATE_CHANGED = 'UI_STATE_CHANGED',

  // Worker events
  WORKER_CREATED = 'WORKER_CREATED',
  WORKER_TERMINATED = 'WORKER_TERMINATED',
  WORKER_MESSAGE = 'WORKER_MESSAGE',
  WORKER_ERROR = 'WORKER_ERROR',

  // Config events
  CONFIG_UPDATED = 'CONFIG_UPDATED',
  CONFIG_LOADED = 'CONFIG_LOADED',
  CONFIG_SAVED = 'CONFIG_SAVED',

  // Game Theory events
  GAME_THEORY_CALCULATED = 'GAME_THEORY_CALCULATED',
  NASH_EQUILIBRIUM_FOUND = 'NASH_EQUILIBRIUM_FOUND'
}

/**
 * EventPriority enum
 * Defines the different priority levels for events
 */
export enum EventPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

/**
 * Event interface
 * Base interface for all events
 */
export interface Event {
  type: EventType;
  timestamp: number;
  priority?: EventPriority;
  category?: EventCategory;
  source?: string;
  data?: any;
}

/**
 * Specific event data interfaces
 */

export interface BlockEvent extends Event {
  type: EventType.BLOCK_FETCHED | EventType.BLOCK_PROCESSED;
  data: {
    blockNumber: number;
    blockData: BlockData;
  };
}

export interface ConfirmationsEvent extends Event {
  type: EventType.CONFIRMATIONS_UPDATED;
  data: {
    blockNumber: number;
    confirmations: number;
  };
}

export interface CreatureEvent extends Event {
  type: EventType.CREATURE_CREATED | EventType.CREATURE_UPDATED | EventType.CREATURE_SELECTED;
  data: {
    creatureId: string;
    blockNumber?: number;
  };
}

export interface ParticleEvent extends Event {
  type: EventType.PARTICLES_UPDATED;
  data: {
    creatureId: string;
    groupId?: string;
    role?: Role;
    positions?: Vector3[];
  };
}

export interface EvolutionTriggerEvent extends Event {
  type: EventType.EVOLUTION_TRIGGERED;
  data: {
    creatureId: string;
    blockNumber: number;
    confirmations: number;
    groupId?: string;
    role?: Role;
  };
}

export interface MutationEvent extends Event {
  type: EventType.MUTATION_APPLIED;
  data: {
    creatureId: string;
    groupId: string;
    role: Role;
    mutation: Mutation;
    previousTraitId?: string;
    newTraitId?: string;
  };
}

export interface EvolutionTrackedEvent extends Event {
  type: EventType.EVOLUTION_TRACKED;
  data: {
    creatureId: string;
    blockNumber: number;
    confirmations: number;
    mutations: Mutation[];
    timestamp: number;
  };
}

export interface FormationEvent extends Event {
  type: EventType.FORMATION_CHANGED | EventType.FORMATION_COMPLETED;
  data: {
    creatureId: string;
    groupId: string;
    role: Role;
    formation: Formation;
  };
}

export interface BehaviorEvent extends Event {
  type: EventType.BEHAVIOR_TRIGGERED | EventType.BEHAVIOR_COMPLETED;
  data: {
    creatureId: string;
    groupId: string;
    role: Role;
    behavior: Behavior;
  };
}

export interface AbilityEvent extends Event {
  type: EventType.ABILITY_USED | EventType.ABILITY_COOLDOWN | EventType.ABILITY_UNLOCKED;
  data: {
    creatureId: string;
    groupId?: string;
    role?: Role;
    ability: Ability;
    target?: string;
  };
}

export interface RenderEvent extends Event {
  type: EventType.RENDER_FRAME | EventType.CAMERA_MOVED | EventType.VIEWPORT_RESIZED;
  data: {
    deltaTime?: number;
    camera?: {
      position: Vector3;
      rotation: Vector3;
    };
    viewport?: {
      width: number;
      height: number;
    };
  };
}

export interface BattleEvent extends Event {
  type: EventType.BATTLE_STARTED | EventType.BATTLE_ENDED | EventType.BATTLE_ROUND_COMPLETED;
  data: {
    battleId: string;
    creatures: string[];
    winner?: string;
    round?: number;
  };
}

export interface UIEvent extends Event {
  type: EventType.UI_ACTION | EventType.UI_STATE_CHANGED;
  data: {
    action?: string;
    component?: string;
    state?: any;
  };
}

export interface WorkerEvent extends Event {
  type: EventType.WORKER_CREATED | EventType.WORKER_TERMINATED | EventType.WORKER_MESSAGE | EventType.WORKER_ERROR;
  data: {
    workerId: number;
    workerType?: string;
    message?: any;
    error?: Error;
  };
}

export interface ErrorEvent extends Event {
  type: EventType.ERROR | EventType.WARNING;
  data: {
    message: string;
    stack?: string;
    code?: string;
    component?: string;
  };
}

export interface ConfigEvent extends Event {
  type: EventType.CONFIG_UPDATED | EventType.CONFIG_LOADED | EventType.CONFIG_SAVED;
  data: {
    previousConfig?: Partial<AppConfig>;
    currentConfig: Partial<AppConfig>;
    changedKeys?: string[];
  };
}

export interface ServiceEvent extends Event {
  type: EventType.SERVICE_INITIALIZED | EventType.BITCOIN_SERVICE_READY | EventType.RENDERER_READY |
        EventType.PHYSICS_READY | EventType.EVOLUTION_READY | EventType.GAME_THEORY_READY |
        EventType.TRAIT_BANK_LOADED;
  data: {
    serviceName: string;
    success: boolean;
    error?: Error;
    details?: any;
    timeElapsed?: number; // Time it took to initialize in ms
  };
}

export interface GameTheoryEvent extends Event {
  type: EventType.GAME_THEORY_CALCULATED | EventType.NASH_EQUILIBRIUM_FOUND;
  data: {
    matrixId: string;
    matrix: PayoffMatrix;
    players: string[];
    equilibria?: NashEquilibrium[];
    optimalStrategy?: StrategyProfile;
    executionTime?: number; // in milliseconds
    calculationMethod?: string;
  };
}

/**
 * EventListener interface
 * Defines a listener function for events
 */
export interface EventListener {
  (event: Event): void;
}

/**
 * EventSubscription interface
 * Represents a subscription to an event
 */
export interface EventSubscription {
  id: string;
  type: EventType;
  listener: EventListener;
  priority: EventPriority;
  once: boolean;
  timeout?: number; // Optional timeout in milliseconds
  createdAt: number; // Timestamp when the subscription was created
  serviceId?: string; // Optional service ID for service-specific subscriptions
}

/**
 * EventEmitter interface
 * Defines the methods for an event emitter
 */
export interface EventEmitter {
  on(type: EventType, listener: EventListener, priority?: EventPriority, timeout?: number, serviceId?: string): EventSubscription;
  once(type: EventType, listener: EventListener, priority?: EventPriority, timeout?: number, serviceId?: string): EventSubscription;
  off(subscriptionId: string): boolean;
  emit(event: Event): void;
  removeAllListeners(type?: EventType): void;
  removeServiceListeners(serviceId: string): number;
  getListenerCount(type?: EventType): number;
}

/**
 * EventBus interface
 * Defines the methods for the global event bus
 */
export interface EventBus extends EventEmitter {
  getEventHistory(type?: EventType, limit?: number): Event[];
  clearEventHistory(): void;
  enableLogging(types?: EventType[]): void;
  disableLogging(): void;
  getPendingEvents(): Event[];
  purgeEvents(olderThan?: number): number;
  setHistoryLimit(limit: number): void;
  getHistoryLimit(): number;
  setAutoPurgeInterval(interval: number): void;
  getAutoPurgeInterval(): number;
  pauseAutoPurge(): void;
  resumeAutoPurge(): void;
}