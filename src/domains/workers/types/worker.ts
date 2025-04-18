/**
 * Worker Types for Bitcoin Protozoa
 * 
 * This file defines the types for the worker system.
 */

/**
 * Worker message types
 */
export enum WorkerMessageType {
  INITIALIZE = 'initialize',
  PROCESS = 'process',
  RESULT = 'result',
  ERROR = 'error',
  TERMINATE = 'terminate'
}

/**
 * Base worker message interface
 */
export interface WorkerMessage {
  type: WorkerMessageType;
  id: string;
  timestamp: number;
}

/**
 * Worker initialization message
 */
export interface WorkerInitMessage extends WorkerMessage {
  type: WorkerMessageType.INITIALIZE;
  config: any;
}

/**
 * Worker process message
 */
export interface WorkerProcessMessage extends WorkerMessage {
  type: WorkerMessageType.PROCESS;
  data: any;
  taskType: string;
}

/**
 * Worker result message
 */
export interface WorkerResultMessage extends WorkerMessage {
  type: WorkerMessageType.RESULT;
  result: any;
  processingTime: number;
}

/**
 * Worker error message
 */
export interface WorkerErrorMessage extends WorkerMessage {
  type: WorkerMessageType.ERROR;
  error: string;
  stack?: string;
}

/**
 * Worker terminate message
 */
export interface WorkerTerminateMessage extends WorkerMessage {
  type: WorkerMessageType.TERMINATE;
  reason?: string;
}

/**
 * Worker task types
 */
export enum WorkerTaskType {
  PHYSICS = 'physics',
  PARTICLE = 'particle',
  FORMATION = 'formation',
  BEHAVIOR = 'behavior',
  EVOLUTION = 'evolution',
  GAME_THEORY = 'gameTheory'
}

/**
 * Worker pool configuration
 */
export interface WorkerPoolConfig {
  minWorkers: number;
  maxWorkers: number;
  idleTimeout: number;
  taskTimeout: number;
  workerScript: string;
}

/**
 * Worker status
 */
export enum WorkerStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  ERROR = 'error',
  TERMINATED = 'terminated'
}

/**
 * Worker info
 */
export interface WorkerInfo {
  id: string;
  status: WorkerStatus;
  createdAt: number;
  lastActiveAt: number;
  taskCount: number;
  currentTask?: string;
  errors: number;
}

/**
 * Task priority
 */
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**
 * Task status
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

/**
 * Task info
 */
export interface TaskInfo {
  id: string;
  type: WorkerTaskType;
  data: any;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  workerId?: string;
  result?: any;
  error?: string;
}

/**
 * Task callback
 */
export type TaskCallback = (error: Error | null, result?: any) => void;
