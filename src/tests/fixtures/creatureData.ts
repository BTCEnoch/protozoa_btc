/**
 * Creature Data Fixtures
 *
 * This file provides predefined creature data for testing.
 * These fixtures ensure consistent test data across all tests.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Role,
  AttributeType,
  Rarity,
  Tier
} from '../../shared/types/core';
import { mockBlockData } from './bitcoinData';
import { Creature, CreatureGroup, LoadingStage } from '../../domains/creature/types/creature';
import { Particle } from '../../domains/creature/types/particle';

/**
 * Mock particle for testing
 */
export const mockParticle: Particle = {
  id: '1',
  role: Role.CORE,
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  acceleration: { x: 0, y: 0, z: 0 },
  mass: 1.0,
  size: 1.0,
  color: '#00FFFF',
  opacity: 1.0,
  emissive: false,
  geometry: 'sphere',
  material: 'standard'
};

/**
 * Mock particles by role
 */
export const mockParticlesByRole: Record<Role, Particle> = {
  [Role.CORE]: {
    ...mockParticle,
    id: '1',
    role: Role.CORE,
    color: '#00FFFF'
  },
  [Role.CONTROL]: {
    ...mockParticle,
    id: '2',
    role: Role.CONTROL,
    color: '#00FF00'
  },
  [Role.ATTACK]: {
    ...mockParticle,
    id: '3',
    role: Role.ATTACK,
    color: '#FF0000'
  },
  [Role.DEFENSE]: {
    ...mockParticle,
    id: '4',
    role: Role.DEFENSE,
    color: '#0000FF'
  },
  [Role.MOVEMENT]: {
    ...mockParticle,
    id: '5',
    role: Role.MOVEMENT,
    color: '#FF00FF'
  }
};

/**
 * Mock creature group for testing
 */
export const mockCreatureGroup: CreatureGroup = {
  id: '1',
  role: Role.CORE,
  count: 100,
  traits: {},
  attributes: {
    [AttributeType.STRENGTH]: 0,
    [AttributeType.AGILITY]: 0,
    [AttributeType.INTELLIGENCE]: 0,
    [AttributeType.VITALITY]: 200,
    [AttributeType.RESILIENCE]: 0
  },
  particles: [],
  mutations: [],
  subclass: null,
  baseAttributeValue: 200,
  attributeMultipliers: {
    base: 1.0,
    fromTraits: 0.0,
    fromMutations: 0.0
  }
};

/**
 * Mock creature groups by role
 */
export const mockCreatureGroupsByRole: Record<Role, CreatureGroup> = {
  [Role.CORE]: {
    ...mockCreatureGroup,
    id: '1',
    role: Role.CORE,
    attributes: {
      [AttributeType.STRENGTH]: 0,
      [AttributeType.AGILITY]: 0,
      [AttributeType.INTELLIGENCE]: 0,
      [AttributeType.VITALITY]: 200,
      [AttributeType.RESILIENCE]: 0
    }
  },
  [Role.CONTROL]: {
    ...mockCreatureGroup,
    id: '2',
    role: Role.CONTROL,
    attributes: {
      [AttributeType.STRENGTH]: 0,
      [AttributeType.AGILITY]: 0,
      [AttributeType.INTELLIGENCE]: 200,
      [AttributeType.VITALITY]: 0,
      [AttributeType.RESILIENCE]: 0
    }
  },
  [Role.ATTACK]: {
    ...mockCreatureGroup,
    id: '3',
    role: Role.ATTACK,
    attributes: {
      [AttributeType.STRENGTH]: 200,
      [AttributeType.AGILITY]: 0,
      [AttributeType.INTELLIGENCE]: 0,
      [AttributeType.VITALITY]: 0,
      [AttributeType.RESILIENCE]: 0
    }
  },
  [Role.DEFENSE]: {
    ...mockCreatureGroup,
    id: '4',
    role: Role.DEFENSE,
    attributes: {
      [AttributeType.STRENGTH]: 0,
      [AttributeType.AGILITY]: 0,
      [AttributeType.INTELLIGENCE]: 0,
      [AttributeType.VITALITY]: 0,
      [AttributeType.RESILIENCE]: 200
    }
  },
  [Role.MOVEMENT]: {
    ...mockCreatureGroup,
    id: '5',
    role: Role.MOVEMENT,
    attributes: {
      [AttributeType.STRENGTH]: 0,
      [AttributeType.AGILITY]: 200,
      [AttributeType.INTELLIGENCE]: 0,
      [AttributeType.VITALITY]: 0,
      [AttributeType.RESILIENCE]: 0
    }
  }
};

/**
 * Mock creature for testing
 */
export const mockCreature: Creature = {
  id: '1',
  blockNumber: 800000,
  blockData: mockBlockData,
  groups: Object.values(mockCreatureGroupsByRole),
  mutations: [],
  createdAt: 1672531200000, // 2023-01-01
  lastUpdatedAt: 1672531200000, // 2023-01-01
  loadingStage: LoadingStage.COMPLETE,
  attributes: {
    [AttributeType.STRENGTH]: 200,
    [AttributeType.AGILITY]: 200,
    [AttributeType.INTELLIGENCE]: 200,
    [AttributeType.VITALITY]: 200,
    [AttributeType.RESILIENCE]: 200
  }
};

/**
 * Mock creature with only basic data loaded
 */
export const mockCreatureBasic: Creature = {
  ...mockCreature,
  id: '2',
  groups: [],
  loadingStage: LoadingStage.BASIC
};

/**
 * Mock creature with detailed data loaded
 */
export const mockCreatureDetailed: Creature = {
  ...mockCreature,
  id: '3',
  loadingStage: LoadingStage.DETAILED
};

/**
 * Mock creature with mutations
 */
export const mockCreatureWithMutations: Creature = {
  ...mockCreature,
  id: '4',
  mutations: [
    {
      id: '1',
      name: 'Enhanced Strength',
      description: 'Increases strength by 10%',
      rarity: Rarity.RARE,
      affectedRole: Role.ATTACK,
      attributeModifier: {
        attribute: AttributeType.STRENGTH,
        value: 0.1
      }
    },
    {
      id: '2',
      name: 'Improved Resilience',
      description: 'Increases resilience by 15%',
      rarity: Rarity.EPIC,
      affectedRole: Role.DEFENSE,
      attributeModifier: {
        attribute: AttributeType.RESILIENCE,
        value: 0.15
      }
    }
  ]
};

/**
 * Mock creatures by ID
 */
export const mockCreaturesById: Record<string, Creature> = {
  '1': mockCreature,
  '2': mockCreatureBasic,
  '3': mockCreatureDetailed,
  '4': mockCreatureWithMutations
};

/**
 * Get a mock creature by ID
 * @param id The creature ID
 * @returns The mock creature with the specified ID, or the default mock creature if not found
 */
export function getMockCreature(id: string): Creature {
  return mockCreaturesById[id] || mockCreature;
}

/**
 * Create a mock creature with custom properties
 * @param overrides Properties to override in the mock creature
 * @returns A new mock creature with the specified overrides
 */
export function createMockCreature(overrides: Partial<Creature> = {}): Creature {
  return {
    ...mockCreature,
    id: uuidv4(),
    ...overrides
  };
}

/**
 * Create a mock creature group with custom properties
 * @param role The role of the group
 * @param overrides Properties to override in the mock creature group
 * @returns A new mock creature group with the specified overrides
 */
export function createMockCreatureGroup(
  role: Role,
  overrides: Partial<CreatureGroup> = {}
): CreatureGroup {
  return {
    ...mockCreatureGroupsByRole[role],
    id: uuidv4(),
    ...overrides
  };
}

/**
 * Create a mock particle with custom properties
 * @param role The role of the particle
 * @param overrides Properties to override in the mock particle
 * @returns A new mock particle with the specified overrides
 */
export function createMockParticle(
  role: Role,
  overrides: Partial<Particle> = {}
): Particle {
  return {
    ...mockParticlesByRole[role],
    id: uuidv4(),
    ...overrides
  };
}

export default {
  mockParticle,
  mockParticlesByRole,
  mockCreatureGroup,
  mockCreatureGroupsByRole,
  mockCreature,
  mockCreatureBasic,
  mockCreatureDetailed,
  mockCreatureWithMutations,
  mockCreaturesById,
  getMockCreature,
  createMockCreature,
  createMockCreatureGroup,
  createMockParticle
};
