/**
 * Event Configuration Loader for Bitcoin Protozoa
 *
 * This utility loads event configuration from JSON files.
 */

import { EventType, EventPriority } from '../../types/events/events';
import { EventCategory, EventCategoryMap } from '../../types/events/eventCategory';

/**
 * Event history settings interface
 */
export interface EventHistorySettings {
  defaultHistoryLimit: number;
  historyLimitByCategory: Record<string, number>;
  autoPurgeInterval: number;
  defaultRetentionTime: number;
  retentionTimeByCategory: Record<string, number>;
}

/**
 * Event logging settings interface
 */
export interface EventLoggingSettings {
  defaultLoggingEnabled: boolean;
  defaultLoggedCategories: EventCategory[];
  developmentLoggedCategories: EventCategory[];
  verboseLoggedCategories: EventCategory[];
}

/**
 * Event error handling settings interface
 */
export interface EventErrorHandlingSettings {
  retryCount: number;
  retryDelay: number;
  propagateErrors: boolean;
  errorEventPriority: EventPriority;
}

/**
 * Event subscription settings interface
 */
export interface EventSubscriptionSettings {
  defaultTimeout: number | null;
  timeoutByCategory: Record<string, number>;
  maxListenersPerEvent: number;
  warnThreshold: number;
}

/**
 * Event configuration interface
 */
export interface EventConfig {
  historySettings: EventHistorySettings;
  logging: EventLoggingSettings;
  errorHandling: EventErrorHandlingSettings;
  subscriptionSettings: EventSubscriptionSettings;
}

/**
 * Default event configuration
 */
export const DEFAULT_EVENT_CONFIG: EventConfig = {
  historySettings: {
    defaultHistoryLimit: 1000,
    historyLimitByCategory: {
      RENDER: 100,
      WORKER: 500
    },
    autoPurgeInterval: 3600000, // 1 hour
    defaultRetentionTime: 3600000, // 1 hour
    retentionTimeByCategory: {
      SYSTEM: 86400000, // 24 hours
      ERROR: 86400000, // 24 hours
      BITCOIN: 43200000, // 12 hours
      RENDER: 300000 // 5 minutes
    }
  },
  logging: {
    defaultLoggingEnabled: false,
    defaultLoggedCategories: [
      EventCategory.SYSTEM,
      EventCategory.SERVICE
    ],
    developmentLoggedCategories: [
      EventCategory.SYSTEM,
      EventCategory.SERVICE,
      EventCategory.ERROR,
      EventCategory.BITCOIN,
      EventCategory.CREATURE
    ],
    verboseLoggedCategories: [
      EventCategory.SYSTEM,
      EventCategory.SERVICE,
      EventCategory.ERROR,
      EventCategory.BITCOIN,
      EventCategory.CREATURE,
      EventCategory.EVOLUTION,
      EventCategory.WORKER,
      EventCategory.CONFIG
    ]
  },
  errorHandling: {
    retryCount: 3,
    retryDelay: 1000,
    propagateErrors: true,
    errorEventPriority: EventPriority.HIGH
  },
  subscriptionSettings: {
    defaultTimeout: null,
    timeoutByCategory: {
      RENDER: 60000, // 1 minute
      WORKER: 300000 // 5 minutes
    },
    maxListenersPerEvent: 100,
    warnThreshold: 50
  }
};

/**
 * Load event categories from JSON file
 * @returns A promise resolving to the event category map
 */
export async function loadEventCategories(): Promise<EventCategoryMap> {
  try {
    const response = await fetch('src/data/events/eventCategories.json');
    if (!response.ok) {
      console.warn(`Failed to load event categories: ${response.status} ${response.statusText}`);
      return {};
    }

    const data = await response.json();
    return data.categories || {};
  } catch (error) {
    console.warn('Error loading event categories:', error);
    return {};
  }
}

/**
 * Load event configuration from JSON file
 * @returns A promise resolving to the event configuration
 */
export async function loadEventConfig(): Promise<EventConfig> {
  try {
    const response = await fetch('src/data/events/eventConfig.json');
    if (!response.ok) {
      console.warn(`Failed to load event config: ${response.status} ${response.statusText}`);
      return DEFAULT_EVENT_CONFIG;
    }

    const data = await response.json();
    return {
      historySettings: {
        ...DEFAULT_EVENT_CONFIG.historySettings,
        ...data.historySettings
      },
      logging: {
        ...DEFAULT_EVENT_CONFIG.logging,
        ...data.logging
      },
      errorHandling: {
        ...DEFAULT_EVENT_CONFIG.errorHandling,
        ...data.errorHandling
      },
      subscriptionSettings: {
        ...DEFAULT_EVENT_CONFIG.subscriptionSettings,
        ...data.subscriptionSettings
      }
    };
  } catch (error) {
    console.warn('Error loading event config:', error);
    return DEFAULT_EVENT_CONFIG;
  }
}

/**
 * Get the default priority for an event type
 * @param eventType The event type
 * @param categoryMap The event category map
 * @returns The default priority for the event type
 */
export function getDefaultPriorityForEventType(
  eventType: EventType, 
  categoryMap: EventCategoryMap
): EventPriority {
  for (const [category, info] of Object.entries(categoryMap)) {
    if (info.events.includes(eventType)) {
      return info.defaultPriority;
    }
  }
  return EventPriority.MEDIUM; // Default to MEDIUM if category not found
}

/**
 * Get the category for an event type
 * @param eventType The event type
 * @param categoryMap The event category map
 * @returns The category for the event type
 */
export function getCategoryForEventType(
  eventType: EventType, 
  categoryMap: EventCategoryMap
): EventCategory | null {
  for (const [category, info] of Object.entries(categoryMap)) {
    if (info.events.includes(eventType)) {
      return category as EventCategory;
    }
  }
  return null;
}
