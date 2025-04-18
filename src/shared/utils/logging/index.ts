/**
 * Logging Utilities
 *
 * Provides utilities for logging messages.
 */

import { LogLevel } from '../../types/config';

// Default log level
let currentLogLevel: LogLevel = LogLevel.INFO;

// Whether to include timestamps in logs
let includeTimestamp: boolean = true;

// Whether to include log level in logs
let includeLogLevel: boolean = true;

/**
 * Set the current log level
 * @param level The log level to set
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level
 * @returns The current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Set whether to include timestamps in logs
 * @param include Whether to include timestamps
 */
export function setIncludeTimestamp(include: boolean): void {
  includeTimestamp = include;
}

/**
 * Set whether to include log level in logs
 * @param include Whether to include log level
 */
export function setIncludeLogLevel(include: boolean): void {
  includeLogLevel = include;
}

/**
 * Format a log message
 * @param level The log level
 * @param message The message to log
 * @returns The formatted message
 */
function formatLogMessage(level: LogLevel, message: string): string {
  const parts: string[] = [];
  
  if (includeTimestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }
  
  if (includeLogLevel) {
    parts.push(`[${level.toUpperCase()}]`);
  }
  
  parts.push(message);
  
  return parts.join(' ');
}

/**
 * Check if a log level should be logged
 * @param level The log level to check
 * @returns True if the log level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = [
    LogLevel.ERROR,
    LogLevel.WARN,
    LogLevel.INFO,
    LogLevel.DEBUG,
    LogLevel.TRACE
  ];
  
  const currentIndex = levels.indexOf(currentLogLevel);
  const levelIndex = levels.indexOf(level);
  
  return levelIndex <= currentIndex;
}

/**
 * Log an error message
 * @param message The message to log
 * @param data Additional data to log
 */
export function error(message: string, ...data: any[]): void {
  if (shouldLog(LogLevel.ERROR)) {
    console.error(formatLogMessage(LogLevel.ERROR, message), ...data);
  }
}

/**
 * Log a warning message
 * @param message The message to log
 * @param data Additional data to log
 */
export function warn(message: string, ...data: any[]): void {
  if (shouldLog(LogLevel.WARN)) {
    console.warn(formatLogMessage(LogLevel.WARN, message), ...data);
  }
}

/**
 * Log an info message
 * @param message The message to log
 * @param data Additional data to log
 */
export function info(message: string, ...data: any[]): void {
  if (shouldLog(LogLevel.INFO)) {
    console.info(formatLogMessage(LogLevel.INFO, message), ...data);
  }
}

/**
 * Log a debug message
 * @param message The message to log
 * @param data Additional data to log
 */
export function debug(message: string, ...data: any[]): void {
  if (shouldLog(LogLevel.DEBUG)) {
    console.debug(formatLogMessage(LogLevel.DEBUG, message), ...data);
  }
}

/**
 * Log a trace message
 * @param message The message to log
 * @param data Additional data to log
 */
export function trace(message: string, ...data: any[]): void {
  if (shouldLog(LogLevel.TRACE)) {
    console.trace(formatLogMessage(LogLevel.TRACE, message), ...data);
  }
}

/**
 * Log a message at a specific level
 * @param level The log level
 * @param message The message to log
 * @param data Additional data to log
 */
export function log(level: LogLevel, message: string, ...data: any[]): void {
  switch (level) {
    case LogLevel.ERROR:
      error(message, ...data);
      break;
    case LogLevel.WARN:
      warn(message, ...data);
      break;
    case LogLevel.INFO:
      info(message, ...data);
      break;
    case LogLevel.DEBUG:
      debug(message, ...data);
      break;
    case LogLevel.TRACE:
      trace(message, ...data);
      break;
  }
}

/**
 * Create a logger for a specific component
 * @param component The component name
 * @returns A logger for the component
 */
export function createLogger(component: string) {
  return {
    error: (message: string, ...data: any[]) => error(`[${component}] ${message}`, ...data),
    warn: (message: string, ...data: any[]) => warn(`[${component}] ${message}`, ...data),
    info: (message: string, ...data: any[]) => info(`[${component}] ${message}`, ...data),
    debug: (message: string, ...data: any[]) => debug(`[${component}] ${message}`, ...data),
    trace: (message: string, ...data: any[]) => trace(`[${component}] ${message}`, ...data),
    log: (level: LogLevel, message: string, ...data: any[]) => log(level, `[${component}] ${message}`, ...data)
  };
}
