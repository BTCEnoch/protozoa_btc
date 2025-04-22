/**
 * Particle Groups Model
 *
 * This file defines the data structures for particle groups in the Group Domain.
 */
import { Rarity, Role } from '../../../shared/types/core';
import { GroupTraits } from './traits';

/**
 * GroupAttributes interface
 * Defines the single primary attribute for a particle group
 */
export interface GroupAttributes {
  attribute: number;
}

/**
 * ParticleGroup interface
 * Defines a group of particles with a specific role
 */
export interface ParticleGroup {
  role: Role;
  particleCount: number;
  attributes: GroupAttributes;
  traits?: GroupTraits;
  rarity?: Rarity;
}

/**
 * ParticleGroups interface
 * Defines the distribution of particles across the five roles
 */
export interface ParticleGroups {
  [Role.CORE]: ParticleGroup;
  [Role.CONTROL]: ParticleGroup;
  [Role.MOVEMENT]: ParticleGroup;
  [Role.DEFENSE]: ParticleGroup;
  [Role.ATTACK]: ParticleGroup;
  totalParticles: number;
}

/**
 * RoleAttributeNames
 * Maps roles to their attribute names
 */
export const RoleAttributeNames: Record<Role, string> = {
  [Role.CORE]: 'wisdom',
  [Role.CONTROL]: 'intelligence',
  [Role.ATTACK]: 'strength',
  [Role.DEFENSE]: 'vitality',
  [Role.MOVEMENT]: 'agility'
};

/**
 * RoleToClass mapping
 * Maps roles to their class types
 */
export const RoleToClass: Record<Role, string> = {
  [Role.CORE]: 'Healer',
  [Role.CONTROL]: 'Caster',
  [Role.ATTACK]: 'Striker',
  [Role.DEFENSE]: 'Tank',
  [Role.MOVEMENT]: 'Rogue'
};
