/**
 * Event Service
 *
 * This service provides a centralized interface for working with events in the application.
 * It wraps the EventBus and provides additional functionality for common event scenarios.
 */

import {
  Event,
  EventType,
  EventListener,
  EventPriority,
  EventSubscription,
  BlockEvent,
  CreatureEvent,
  MutationEvent
} from '../../types/events/events';
import { EventCategory } from '../../types/events/eventCategory';
import { getEventBus } from '../../lib/eventBus';
import { Creature } from '../../types/creatures/creature';
import { BlockData } from '../../services/bitcoin/bitcoinService';
import {
  loadEventConfig,
  EventConfig,
  DEFAULT_EVENT_CONFIG,
  loadEventCategories
} from './eventConfigLoader';

// Singleton instance
let instance: EventService | null = null;

/**
 * Event Service class
 */
class EventService {
  private initialized: boolean = false;
  private serviceEventListeners: Map<string, string[]> = new Map();
  private config: EventConfig = DEFAULT_EVENT_CONFIG;
  private categoryMap: Record<string, any> = {};
  private loggingMode: 'default' | 'development' | 'verbose' | 'custom' = 'default';

  /**
   * Initialize the event service
   * @param enableLogging Whether to enable event logging
   * @param loggingMode Logging mode (default, development, verbose, custom)
   * @param loggedTypes Specific event types to log (for custom mode)
   */
  async initialize(
    enableLogging: boolean = false,
    loggingMode: 'default' | 'development' | 'verbose' | 'custom' = 'default',
    loggedTypes?: EventType[]
  ): Promise<void> {
    if (this.initialized) return;

    try {
      // Load configuration
      this.config = await loadEventConfig();
      this.categoryMap = await loadEventCategories();

      // Set logging mode
      this.loggingMode = loggingMode;

      // Enable logging if requested
      if (enableLogging) {
        let typesToLog: EventType[] | undefined;

        switch (loggingMode) {
          case 'default':
            typesToLog = this.config.logging.defaultLoggedCategories.flatMap(category =>
              this.categoryMap[category]?.events || []
            );
            break;
          case 'development':
            typesToLog = this.config.logging.developmentLoggedCategories.flatMap(category =>
              this.categoryMap[category]?.events || []
            );
            break;
          case 'verbose':
            typesToLog = this.config.logging.verboseLoggedCategories.flatMap(category =>
              this.categoryMap[category]?.events || []
            );
            break;
          case 'custom':
            typesToLog = loggedTypes;
            break;
        }

        getEventBus().enableLogging(typesToLog);
      }

      // Configure auto-purge
      getEventBus().setAutoPurgeInterval(this.config.historySettings.autoPurgeInterval);
      getEventBus().setHistoryLimit(this.config.historySettings.defaultHistoryLimit);

      // Register global error handler
      window.addEventListener('error', (event) => {
        this.emitError('GLOBAL', event.error?.message || 'Unknown error', event.error);
      });

      // Register unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.emitError('PROMISE', event.reason?.message || 'Unhandled promise rejection', event.reason);
      });

      this.initialized = true;
      console.log('Event service initialized');
    } catch (error) {
      console.error('Error initializing event service:', error);
      // Use default configuration
      this.config = DEFAULT_EVENT_CONFIG;

      // Enable basic logging if requested
      if (enableLogging) {
        getEventBus().enableLogging(loggedTypes);
      }

      // Register global error handler
      window.addEventListener('error', (event) => {
        this.emitError('GLOBAL', event.error?.message || 'Unknown error', event.error);
      });

      // Register unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.emitError('PROMISE', event.reason?.message || 'Unhandled promise rejection', event.reason);
      });

      this.initialized = true;
      console.warn('Using default event service configuration');
    }
  }

  /**
   * Subscribe to an event
   * @param type Event type to subscribe to
   * @param listener Listener function to be called when event is emitted
   * @param priority Priority of the listener
   * @param serviceId Optional service ID for cleanup
   * @param timeout Optional timeout in milliseconds
   * @returns Subscription object
   */
  on(
    type: EventType,
    listener: EventListener,
    priority: EventPriority = EventPriority.MEDIUM,
    serviceId?: string,
    timeout?: number
  ): EventSubscription {
    // Get timeout from config if not provided
    if (timeout === undefined && serviceId && this.categoryMap) {
      const category = this.getCategoryForEventType(type);
      if (category && this.config.subscriptionSettings.timeoutByCategory[category]) {
        timeout = this.config.subscriptionSettings.timeoutByCategory[category];
      } else {
        timeout = this.config.subscriptionSettings.defaultTimeout || undefined;
      }
    }

    const subscription = getEventBus().on(type, listener, priority, timeout, serviceId);

    // Track subscription if serviceId is provided
    if (serviceId) {
      const subscriptions = this.serviceEventListeners.get(serviceId) || [];
      subscriptions.push(subscription.id);
      this.serviceEventListeners.set(serviceId, subscriptions);
    }

    return subscription;
  }

  /**
   * Subscribe to an event for one-time execution
   * @param type Event type to subscribe to
   * @param listener Listener function to be called when event is emitted
   * @param priority Priority of the listener
   * @param serviceId Optional service ID for cleanup
   * @param timeout Optional timeout in milliseconds
   * @returns Subscription object
   */
  once(
    type: EventType,
    listener: EventListener,
    priority: EventPriority = EventPriority.MEDIUM,
    serviceId?: string,
    timeout?: number
  ): EventSubscription {
    // Get timeout from config if not provided
    if (timeout === undefined && serviceId && this.categoryMap) {
      const category = this.getCategoryForEventType(type);
      if (category && this.config.subscriptionSettings.timeoutByCategory[category]) {
        timeout = this.config.subscriptionSettings.timeoutByCategory[category];
      } else {
        timeout = this.config.subscriptionSettings.defaultTimeout || undefined;
      }
    }

    const subscription = getEventBus().once(type, listener, priority, timeout, serviceId);

    // Track subscription if serviceId is provided
    if (serviceId) {
      const subscriptions = this.serviceEventListeners.get(serviceId) || [];
      subscriptions.push(subscription.id);
      this.serviceEventListeners.set(serviceId, subscriptions);
    }

    return subscription;
  }

  /**
   * Get the category for an event type
   * @param eventType The event type
   * @returns The event category or null if not found
   */
  private getCategoryForEventType(eventType: EventType): EventCategory | null {
    for (const [category, info] of Object.entries(this.categoryMap)) {
      if (info.events && info.events.includes(eventType)) {
        return category as EventCategory;
      }
    }
    return null;
  }

  /**
   * Unsubscribe from an event
   * @param subscriptionId ID of the subscription to remove
   * @returns True if subscription was removed, false otherwise
   */
  off(subscriptionId: string): boolean {
    return getEventBus().off(subscriptionId);
  }

  /**
   * Emit an event
   * @param event Event to emit
   */
  emit(event: Event): void {
    getEventBus().emit(event);
  }

  /**
   * Emit a block fetched event
   * @param blockNumber Block number
   * @param blockData Block data
   */
  emitBlockFetched(blockNumber: number, blockData: BlockData): void {
    // Create a more complete block data object for compatibility with BlockEvent
    const enhancedBlockData = {
      ...blockData,
      height: blockNumber,
      hash: `mock-hash-${blockNumber}-${blockData.nonce}`,
      timestamp: Date.now()
    };

    const event: BlockEvent = {
      type: EventType.BLOCK_FETCHED,
      timestamp: Date.now(),
      source: 'BitcoinService',
      data: {
        blockNumber,
        blockData: enhancedBlockData
      }
    };

    this.emit(event);
  }

  /**
   * Emit a creature created event
   * @param creature The created creature
   */
  emitCreatureCreated(creature: Creature): void {
    const event: CreatureEvent = {
      type: EventType.CREATURE_CREATED,
      timestamp: Date.now(),
      source: 'CreatureGenerator',
      data: {
        creatureId: creature.id,
        blockNumber: creature.blockNumber
      }
    };

    this.emit(event);
  }

  /**
   * Emit a mutation applied event
   * @param event Mutation event data
   */
  emitMutationApplied(event: MutationEvent): void {
    this.emit(event);
  }

  /**
   * Emit an error event
   * @param source Source of the error
   * @param message Error message
   * @param error Error object
   */
  emitError(source: string, message: string, error?: any): void {
    this.emit({
      type: EventType.ERROR,
      timestamp: Date.now(),
      source,
      priority: EventPriority.HIGH,
      data: {
        message,
        error
      }
    });
  }

  /**
   * Emit a warning event
   * @param source Source of the warning
   * @param message Warning message
   * @param data Additional data
   */
  emitWarning(source: string, message: string, data?: any): void {
    this.emit({
      type: EventType.WARNING,
      timestamp: Date.now(),
      source,
      data: {
        message,
        ...data
      }
    });
  }

  /**
   * Unsubscribe all listeners for a service
   * @param serviceId Service ID
   * @returns Number of subscriptions removed
   */
  unsubscribeService(serviceId: string): number {
    // Remove from EventBus
    const count = getEventBus().removeServiceListeners(serviceId);

    // Clean up local tracking
    this.serviceEventListeners.delete(serviceId);

    return count;
  }

  /**
   * Get event history
   * @param type Event type to get history for
   * @param limit Maximum number of events to return
   * @returns Array of events
   */
  getEventHistory(type?: EventType, limit?: number): Event[] {
    return getEventBus().getEventHistory(type, limit);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    getEventBus().clearEventHistory();
  }

  /**
   * Enable event logging
   * @param types Event types to log
   */
  enableLogging(types?: EventType[]): void {
    getEventBus().enableLogging(types);
  }

  /**
   * Disable event logging
   */
  disableLogging(): void {
    getEventBus().disableLogging();
  }

  /**
   * Purge events older than a specified time
   * @param olderThan Time in milliseconds
   * @returns Number of events purged
   */
  purgeEvents(olderThan: number = 3600000): number {
    return getEventBus().purgeEvents(olderThan);
  }

  /**
   * Set the history limit
   * @param limit Maximum number of events to keep in history
   */
  setHistoryLimit(limit: number): void {
    getEventBus().setHistoryLimit(limit);
  }

  /**
   * Get the history limit
   * @returns The history limit
   */
  getHistoryLimit(): number {
    return getEventBus().getHistoryLimit();
  }

  /**
   * Set the auto-purge interval
   * @param interval Interval in milliseconds
   */
  setAutoPurgeInterval(interval: number): void {
    getEventBus().setAutoPurgeInterval(interval);
  }

  /**
   * Get the auto-purge interval
   * @returns The auto-purge interval
   */
  getAutoPurgeInterval(): number {
    return getEventBus().getAutoPurgeInterval();
  }

  /**
   * Pause auto-purge
   */
  pauseAutoPurge(): void {
    getEventBus().pauseAutoPurge();
  }

  /**
   * Resume auto-purge
   */
  resumeAutoPurge(): void {
    getEventBus().resumeAutoPurge();
  }

  /**
   * Set logging mode
   * @param mode Logging mode
   * @param types Event types to log (for custom mode)
   */
  setLoggingMode(mode: 'default' | 'development' | 'verbose' | 'custom', types?: EventType[]): void {
    this.loggingMode = mode;

    let typesToLog: EventType[] | undefined;

    switch (mode) {
      case 'default':
        typesToLog = this.config.logging.defaultLoggedCategories.flatMap(category =>
          this.categoryMap[category]?.events || []
        );
        break;
      case 'development':
        typesToLog = this.config.logging.developmentLoggedCategories.flatMap(category =>
          this.categoryMap[category]?.events || []
        );
        break;
      case 'verbose':
        typesToLog = this.config.logging.verboseLoggedCategories.flatMap(category =>
          this.categoryMap[category]?.events || []
        );
        break;
      case 'custom':
        typesToLog = types;
        break;
    }

    getEventBus().enableLogging(typesToLog);
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Get the event service instance
 * @returns The event service singleton instance
 */
export function getEventService(): EventService {
  if (!instance) {
    instance = new EventService();
  }
  return instance;
}
