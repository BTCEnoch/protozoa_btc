/**
 * Event Bus Implementation
 *
 * This file implements the event bus system for the Bitcoin Protozoa project.
 * The event bus enables decoupled communication between different components
 * through an event-driven architecture.
 */

import {
  Event,
  EventType,
  EventBus,
  EventListener,
  EventPriority,
  EventSubscription
} from '../types/events/events';
import { EventCategory } from '../types/events/eventCategory';
import { v4 as uuidv4 } from 'uuid';
import {
  loadEventConfig,
  EventConfig,
  DEFAULT_EVENT_CONFIG,
  loadEventCategories,
  getCategoryForEventType,
  getDefaultPriorityForEventType
} from '../services/events/eventConfigLoader';

// Define a simple type for timeout handles
type TimeoutHandle = ReturnType<typeof setTimeout>;

/**
 * Event Bus class
 * Implementation of the EventBus interface
 */
export class EventBusImpl implements EventBus {
  private subscriptions: Map<EventType, EventSubscription[]> = new Map();
  private eventHistory: Event[] = [];
  private loggingEnabled: boolean = false;
  private loggedTypes: Set<EventType> | null = null;
  private pendingEvents: Event[] = [];
  private historyLimit: number = 1000; // Default limit for event history
  private autoPurgeInterval: number = 3600000; // Default: 1 hour
  private autoPurgeTimer: TimeoutHandle | null = null;
  private config: EventConfig = DEFAULT_EVENT_CONFIG;
  private categoryMap: Record<string, any> = {};
  private initialized: boolean = false;

  /**
   * Constructor
   */
  constructor() {
    this.initialize();
  }

  /**
   * Initialize the event bus
   */
  private async initialize(): Promise<void> {
    try {
      // Load configuration
      this.config = await loadEventConfig();
      this.categoryMap = await loadEventCategories();

      // Set history limit
      this.historyLimit = this.config.historySettings.defaultHistoryLimit;

      // Set auto-purge interval
      this.autoPurgeInterval = this.config.historySettings.autoPurgeInterval;
      this.startAutoPurge();

      this.initialized = true;
      console.log('Event bus initialized');
    } catch (error) {
      console.error('Error initializing event bus:', error);
      // Use default configuration
      this.config = DEFAULT_EVENT_CONFIG;
      this.historyLimit = DEFAULT_EVENT_CONFIG.historySettings.defaultHistoryLimit;
      this.autoPurgeInterval = DEFAULT_EVENT_CONFIG.historySettings.autoPurgeInterval;
      this.startAutoPurge();

      this.initialized = true;
      console.warn('Using default event bus configuration');
    }
  }

  /**
   * Subscribe to an event
   * @param type Event type to subscribe to
   * @param listener Listener function to be called when event is emitted
   * @param priority Priority of the listener (optional)
   * @param timeout Optional timeout in milliseconds
   * @param serviceId Optional service ID for service-specific subscriptions
   * @returns Subscription object
   */
  public on(
    type: EventType,
    listener: EventListener,
    priority: EventPriority = EventPriority.MEDIUM,
    timeout?: number,
    serviceId?: string
  ): EventSubscription {
    const subscription: EventSubscription = {
      id: uuidv4(),
      type,
      listener,
      priority,
      once: false,
      createdAt: Date.now(),
      timeout,
      serviceId
    };

    this.addSubscription(subscription);

    // Set timeout if provided
    if (timeout) {
      setTimeout(() => {
        this.off(subscription.id);
      }, timeout);
    }

    return subscription;
  }

  /**
   * Subscribe to an event for one-time execution
   * @param type Event type to subscribe to
   * @param listener Listener function to be called when event is emitted
   * @param priority Priority of the listener (optional)
   * @param timeout Optional timeout in milliseconds
   * @param serviceId Optional service ID for service-specific subscriptions
   * @returns Subscription object
   */
  public once(
    type: EventType,
    listener: EventListener,
    priority: EventPriority = EventPriority.MEDIUM,
    timeout?: number,
    serviceId?: string
  ): EventSubscription {
    const subscription: EventSubscription = {
      id: uuidv4(),
      type,
      listener,
      priority,
      once: true,
      createdAt: Date.now(),
      timeout,
      serviceId
    };

    this.addSubscription(subscription);

    // Set timeout if provided
    if (timeout) {
      setTimeout(() => {
        this.off(subscription.id);
      }, timeout);
    }

    return subscription;
  }

  /**
   * Unsubscribe from an event
   * @param subscriptionId ID of the subscription to remove
   * @returns True if subscription was removed, false otherwise
   */
  public off(subscriptionId: string): boolean {
    for (const [type, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Emit an event
   * @param event Event to emit
   */
  public emit(event: Event): void {
    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Add category if not provided
    if (!event.category && this.categoryMap) {
      event.category = getCategoryForEventType(event.type, this.categoryMap) || undefined;
    }

    // Add priority if not provided
    if (!event.priority && this.categoryMap) {
      event.priority = getDefaultPriorityForEventType(event.type, this.categoryMap);
    }

    // Log event if logging is enabled
    this.logEvent(event);

    // Add event to history
    this.addToHistory(event);

    // Get subscriptions for this event type
    const subs = this.subscriptions.get(event.type) || [];

    // Sort subscriptions by priority
    const sortedSubs = [...subs].sort((a, b) => {
      const priorityOrder: Record<EventPriority, number> = {
        [EventPriority.HIGH]: 0,
        [EventPriority.MEDIUM]: 1,
        [EventPriority.LOW]: 2
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Execute listeners
    const onceSubs: EventSubscription[] = [];

    // Get all the once subscriptions to be removed
    sortedSubs.forEach(sub => {
      try {
        sub.listener(event);
        if (sub.once) {
          onceSubs.push(sub);
        }
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);

        // Emit an error event
        if (this.config.errorHandling.propagateErrors) {
          this.emit({
            type: EventType.ERROR,
            timestamp: Date.now(),
            priority: this.config.errorHandling.errorEventPriority,
            source: 'EventBus',
            data: {
              message: `Error in event listener for ${event.type}`,
              error,
              originalEvent: event
            }
          });
        }
      }
    });

    // Remove once subscriptions
    onceSubs.forEach(sub => this.off(sub.id));
  }

  /**
   * Remove all listeners
   * @param type Event type to remove listeners for (optional)
   */
  public removeAllListeners(type?: EventType): void {
    if (type) {
      this.subscriptions.delete(type);
    } else {
      this.subscriptions.clear();
    }
  }

  /**
   * Remove all listeners for a specific service
   * @param serviceId Service ID to remove listeners for
   * @returns Number of listeners removed
   */
  public removeServiceListeners(serviceId: string): number {
    let count = 0;

    for (const [type, subs] of this.subscriptions.entries()) {
      const initialLength = subs.length;
      const filteredSubs = subs.filter(sub => sub.serviceId !== serviceId);

      if (filteredSubs.length !== initialLength) {
        count += initialLength - filteredSubs.length;
        this.subscriptions.set(type, filteredSubs);
      }
    }

    return count;
  }

  /**
   * Get the number of listeners
   * @param type Event type to get listener count for (optional)
   * @returns The number of listeners
   */
  public getListenerCount(type?: EventType): number {
    if (type) {
      return this.subscriptions.get(type)?.length || 0;
    } else {
      let count = 0;
      for (const subs of this.subscriptions.values()) {
        count += subs.length;
      }
      return count;
    }
  }

  /**
   * Get event history
   * @param type Event type to get history for (optional)
   * @param limit Maximum number of events to return (optional)
   * @returns Array of events
   */
  public getEventHistory(type?: EventType, limit?: number): Event[] {
    let filteredHistory = [...this.eventHistory];

    if (type) {
      filteredHistory = filteredHistory.filter(event => event.type === type);
    }

    const actualLimit = limit || filteredHistory.length;
    return filteredHistory.slice(-actualLimit);
  }

  /**
   * Clear event history
   */
  public clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable event logging
   * @param types Event types to log (optional, logs all if not provided)
   */
  public enableLogging(types?: EventType[]): void {
    this.loggingEnabled = true;

    if (types && types.length > 0) {
      this.loggedTypes = new Set(types);
    } else {
      this.loggedTypes = null; // Log all types
    }
  }

  /**
   * Disable event logging
   */
  public disableLogging(): void {
    this.loggingEnabled = false;
  }

  /**
   * Get pending events
   * @returns Array of pending events
   */
  public getPendingEvents(): Event[] {
    return [...this.pendingEvents];
  }

  /**
   * Purge events older than a specified time
   * @param olderThan Time in milliseconds
   * @returns Number of events purged
   */
  public purgeEvents(olderThan: number = 3600000): number { // Default: 1 hour
    const now = Date.now();
    const initialCount = this.eventHistory.length;

    this.eventHistory = this.eventHistory.filter(
      event => (now - event.timestamp) <= olderThan
    );

    return initialCount - this.eventHistory.length;
  }

  /**
   * Set the history limit
   * @param limit Maximum number of events to keep in history
   */
  public setHistoryLimit(limit: number): void {
    this.historyLimit = limit;

    // Trim history if it exceeds the new limit
    if (this.eventHistory.length > this.historyLimit) {
      this.eventHistory = this.eventHistory.slice(-this.historyLimit);
    }
  }

  /**
   * Get the history limit
   * @returns The history limit
   */
  public getHistoryLimit(): number {
    return this.historyLimit;
  }

  /**
   * Set the auto-purge interval
   * @param interval Interval in milliseconds
   */
  public setAutoPurgeInterval(interval: number): void {
    this.autoPurgeInterval = interval;

    // Restart auto-purge with new interval
    this.stopAutoPurge();
    this.startAutoPurge();
  }

  /**
   * Get the auto-purge interval
   * @returns The auto-purge interval
   */
  public getAutoPurgeInterval(): number {
    return this.autoPurgeInterval;
  }

  /**
   * Pause auto-purge
   */
  public pauseAutoPurge(): void {
    this.stopAutoPurge();
  }

  /**
   * Resume auto-purge
   */
  public resumeAutoPurge(): void {
    this.startAutoPurge();
  }

  /**
   * Start auto-purge
   */
  private startAutoPurge(): void {
    if (this.autoPurgeTimer) {
      clearInterval(this.autoPurgeTimer);
    }

    this.autoPurgeTimer = setInterval(() => {
      this.purgeEvents(this.config.historySettings.defaultRetentionTime);
    }, this.autoPurgeInterval);
  }

  /**
   * Stop auto-purge
   */
  private stopAutoPurge(): void {
    if (this.autoPurgeTimer) {
      clearInterval(this.autoPurgeTimer);
      this.autoPurgeTimer = null;
    }
  }

  /**
   * Add a subscription to the event bus
   * @param subscription Subscription to add
   */
  private addSubscription(subscription: EventSubscription): void {
    if (!this.subscriptions.has(subscription.type)) {
      this.subscriptions.set(subscription.type, []);
    }

    this.subscriptions.get(subscription.type)!.push(subscription);
  }

  /**
   * Add an event to the history
   * @param event Event to add
   */
  private addToHistory(event: Event): void {
    this.eventHistory.push(event);

    // Get history limit for this event category
    let limit = this.historyLimit;
    if (event.category && this.config.historySettings.historyLimitByCategory[event.category]) {
      limit = this.config.historySettings.historyLimitByCategory[event.category];
    }

    // Trim history if it exceeds the limit
    if (this.eventHistory.length > limit) {
      this.eventHistory.shift();
    }
  }

  /**
   * Log an event
   * @param event Event to log
   */
  private logEvent(event: Event): void {
    if (!this.loggingEnabled) return;

    if (this.loggedTypes === null || this.loggedTypes.has(event.type)) {
      const logData = {
        type: event.type,
        category: event.category,
        priority: event.priority,
        timestamp: new Date(event.timestamp).toISOString(),
        source: event.source,
        data: event.data
      };

      console.log(`[EVENT] ${event.type}:`, logData);
    }
  }
}

// Singleton instance
let eventBusInstance: EventBus | null = null;

/**
 * Get the event bus instance
 * @returns The singleton event bus instance
 */
export function getEventBus(): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBusImpl();
  }
  return eventBusInstance;
}

/**
 * Reset the event bus instance (for testing)
 */
export function resetEventBus(): void {
  if (eventBusInstance) {
    const impl = eventBusInstance as EventBusImpl;
    impl.pauseAutoPurge();
  }
  eventBusInstance = null;
}
