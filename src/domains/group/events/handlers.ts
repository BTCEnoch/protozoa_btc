/**
 * Group Domain Event Handlers
 * 
 * This file defines the event handlers for the Group Domain.
 */
import { GroupDomainEvent } from './events';
import { GroupDomainEventType } from './types';

/**
 * handleGroupDomainEvent
 * Handles Group Domain events
 * @param event The event to handle
 */
export const handleGroupDomainEvent = (event: GroupDomainEvent): void => {
  switch (event.type) {
    case GroupDomainEventType.PARTICLE_GROUPS_CREATED:
      console.log(`Particle groups created with ${event.particleGroups.totalParticles} total particles`);
      break;
    case GroupDomainEventType.CLASS_ASSIGNED:
      console.log(`Class assigned: ${event.classAssignment.mainClass} - ${event.classAssignment.subclass.name}`);
      break;
    case GroupDomainEventType.TRAITS_ASSIGNED:
      console.log(`Traits assigned to ${event.role} role`);
      break;
    case GroupDomainEventType.GROUP_ATTRIBUTES_CALCULATED:
      console.log(`Attributes calculated for ${event.role} role with ${event.particleCount} particles`);
      break;
    case GroupDomainEventType.GROUP_TIER_CALCULATED:
      console.log(`Tier calculated: ${event.tier} with ${event.totalParticles} total particles`);
      break;
    default:
      console.warn(`Unknown event type: ${(event as GroupDomainEvent).type}`);
  }
};
