/**
 * Group Domain Events
 * 
 * This file defines the events for the Group Domain.
 */
import { Role, Tier } from '../../../shared/types/core';
import { ClassAssignment } from '../models/class';
import { ParticleGroups } from '../models/particleGroups';
import { GroupTraits } from '../models/traits';
import { GroupDomainEventType } from './types';

/**
 * BaseGroupDomainEvent interface
 * Base interface for all Group Domain events
 */
export interface BaseGroupDomainEvent {
  type: GroupDomainEventType;
  timestamp: number;
  creatureId?: string;
}

/**
 * ParticleGroupsCreatedEvent interface
 * Event emitted when particle groups are created
 */
export interface ParticleGroupsCreatedEvent extends BaseGroupDomainEvent {
  type: GroupDomainEventType.PARTICLE_GROUPS_CREATED;
  particleGroups: ParticleGroups;
  seed: string;
}

/**
 * ClassAssignedEvent interface
 * Event emitted when a class is assigned to a creature
 */
export interface ClassAssignedEvent extends BaseGroupDomainEvent {
  type: GroupDomainEventType.CLASS_ASSIGNED;
  classAssignment: ClassAssignment;
  seed: string;
}

/**
 * TraitsAssignedEvent interface
 * Event emitted when traits are assigned to a particle group
 */
export interface TraitsAssignedEvent extends BaseGroupDomainEvent {
  type: GroupDomainEventType.TRAITS_ASSIGNED;
  role: Role;
  traits: GroupTraits;
  seed: string;
}

/**
 * GroupAttributesCalculatedEvent interface
 * Event emitted when attributes are calculated for a particle group
 */
export interface GroupAttributesCalculatedEvent extends BaseGroupDomainEvent {
  type: GroupDomainEventType.GROUP_ATTRIBUTES_CALCULATED;
  role: Role;
  particleCount: number;
  attributes: Record<string, number>;
}

/**
 * GroupTierCalculatedEvent interface
 * Event emitted when the tier of a creature is calculated
 */
export interface GroupTierCalculatedEvent extends BaseGroupDomainEvent {
  type: GroupDomainEventType.GROUP_TIER_CALCULATED;
  totalParticles: number;
  tier: Tier;
}

/**
 * GroupDomainEvent type
 * Union type of all Group Domain events
 */
export type GroupDomainEvent =
  | ParticleGroupsCreatedEvent
  | ClassAssignedEvent
  | TraitsAssignedEvent
  | GroupAttributesCalculatedEvent
  | GroupTierCalculatedEvent;
