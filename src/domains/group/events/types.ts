/**
 * Group Domain Event Types
 * 
 * This file defines the event types for the Group Domain.
 */

/**
 * GroupDomainEventType enum
 * Defines the types of events that can occur in the Group Domain
 */
export enum GroupDomainEventType {
  PARTICLE_GROUPS_CREATED = 'PARTICLE_GROUPS_CREATED',
  CLASS_ASSIGNED = 'CLASS_ASSIGNED',
  TRAITS_ASSIGNED = 'TRAITS_ASSIGNED',
  GROUP_ATTRIBUTES_CALCULATED = 'GROUP_ATTRIBUTES_CALCULATED',
  GROUP_TIER_CALCULATED = 'GROUP_TIER_CALCULATED'
}
