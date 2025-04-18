/**
 * Event Category Types for Bitcoin Protozoa
 *
 * This file defines the types for event categories, which group related event types
 * and provide default settings for those events.
 */

import { EventType, EventPriority } from './events';

/**
 * EventCategory enum
 * Defines the different categories of events in the system
 */
export enum EventCategory {
  SYSTEM = 'SYSTEM',
  SERVICE = 'SERVICE',
  ERROR = 'ERROR',
  BITCOIN = 'BITCOIN',
  CREATURE = 'CREATURE',
  PARTICLE = 'PARTICLE',
  EVOLUTION = 'EVOLUTION',
  FORMATION = 'FORMATION',
  BEHAVIOR = 'BEHAVIOR',
  ABILITY = 'ABILITY',
  RENDER = 'RENDER',
  BATTLE = 'BATTLE',
  UI = 'UI',
  WORKER = 'WORKER',
  CONFIG = 'CONFIG',
  GAME_THEORY = 'GAME_THEORY'
}

/**
 * EventCategoryInfo interface
 * Defines the structure of event category information
 */
export interface EventCategoryInfo {
  name: string;
  description: string;
  events: EventType[];
  defaultPriority: EventPriority;
}

/**
 * EventCategoryMap interface
 * Maps event categories to their information
 */
export interface EventCategoryMap {
  [key: string]: EventCategoryInfo;
}

/**
 * EventTypeToCategory interface
 * Maps event types to their categories
 */
export interface EventTypeToCategory {
  [key: string]: EventCategory;
}

/**
 * Get the category for an event type
 * @param eventType The event type
 * @returns The event category
 */
export function getCategoryForEventType(eventType: EventType, categoryMap: EventCategoryMap): EventCategory | null {
  for (const [category, info] of Object.entries(categoryMap)) {
    if (info.events.includes(eventType)) {
      return category as EventCategory;
    }
  }
  return null;
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
  const category = getCategoryForEventType(eventType, categoryMap);
  if (category && categoryMap[category]) {
    return categoryMap[category].defaultPriority;
  }
  return EventPriority.MEDIUM; // Default to MEDIUM if category not found
}
