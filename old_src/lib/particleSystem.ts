/**
 * Particle System for Bitcoin Protozoa
 *
 * This library provides core functionality for creating and managing particles.
 * It handles particle creation, updates, and physics calculations.
 */

import { v4 as uuidv4 } from 'uuid';
import { Role, Tier } from '../types/core';
import { Particle, ParticleGroup, ParticleCreationOptions, ParticleGroupCreationOptions } from '../types/particles/particle';
import { TraitCollection } from '../types/traits/trait';
import { Vector3, AttributeValues } from '../types/common';
import { RNGSystem } from '../types/utils/rng';
import { SubclassData } from '../types/abilities/ability_reference';
import { getConfigLoader } from '../services/config';

// Get config loader
const configLoader = getConfigLoader();

// Function to get default values from config
function getDefaultValue<T extends keyof typeof defaults>(key: T): typeof defaults[T] {
  try {
    if (configLoader.getParticleDefaults) {
      return configLoader.getParticleDefaults()[key];
    }
  } catch (error) {
    console.warn('Config not loaded, using default values');
  }
  return defaults[key];
}

// Function to get role color from config
function getRoleColor(role: Role): string {
  try {
    if (configLoader.getRoleColor) {
      return configLoader.getRoleColor(role);
    }
  } catch (error) {
    console.warn('Config not loaded, using default colors');
  }
  return roleColors[role] || defaults.color;
}

// Default values for particles (fallback if config not loaded)
const defaults = {
  mass: 1.0,
  size: 1.0,
  color: '#FFFFFF',
  opacity: 1.0,
  emissive: true,
  geometry: 'sphere',
  material: 'standard'
};

// Role-specific colors (fallback if config not loaded)
const roleColors = {
  [Role.CORE]: '#00FFFF',     // Cyan
  [Role.CONTROL]: '#FF00FF',  // Magenta
  [Role.MOVEMENT]: '#FFFF00', // Yellow
  [Role.DEFENSE]: '#00FF00',  // Green
  [Role.ATTACK]: '#FF0000'    // Red
};

/**
 * Create a new particle
 * @param options Particle creation options
 * @returns A new particle instance
 */
export function createParticle(options: ParticleCreationOptions): Particle {
  const id = uuidv4();
  const role = options.role;
  const position = options.position || { x: 0, y: 0, z: 0 };
  const velocity = options.velocity || { x: 0, y: 0, z: 0 };
  const acceleration = { x: 0, y: 0, z: 0 };

  // Get values from config or fallback to defaults
  let mass, size, color, opacity, emissive, geometry, material;

  try {
    // Try to get values from config
    if (configLoader.getParticleDefaults && configLoader.getRoleColor) {
      const particleDefaults = configLoader.getParticleDefaults();
      mass = options.mass || particleDefaults.mass;
      size = options.size || particleDefaults.size;
      color = options.color || configLoader.getRoleColor(role) || particleDefaults.color;
      opacity = options.opacity !== undefined ? options.opacity : particleDefaults.opacity;
      emissive = options.emissive !== undefined ? options.emissive : particleDefaults.emissive;
      geometry = options.geometry || particleDefaults.geometry;
      material = options.material || particleDefaults.material;
    } else {
      // Fallback to hardcoded defaults
      mass = options.mass || defaults.mass;
      size = options.size || defaults.size;
      color = options.color || roleColors[role] || defaults.color;
      opacity = options.opacity !== undefined ? options.opacity : defaults.opacity;
      emissive = options.emissive !== undefined ? options.emissive : defaults.emissive;
      geometry = options.geometry || defaults.geometry;
      material = options.material || defaults.material;
    }
  } catch (error) {
    // Fallback to hardcoded defaults if config fails
    console.warn('Error getting config values, using defaults:', error);
    mass = options.mass || defaults.mass;
    size = options.size || defaults.size;
    color = options.color || roleColors[role] || defaults.color;
    opacity = options.opacity !== undefined ? options.opacity : defaults.opacity;
    emissive = options.emissive !== undefined ? options.emissive : defaults.emissive;
    geometry = options.geometry || defaults.geometry;
    material = options.material || defaults.material;
  }

  return {
    id,
    role,
    position,
    velocity,
    acceleration,
    mass,
    size,
    color,
    opacity,
    emissive,
    geometry,
    material
  };
}

/**
 * Create a new particle group
 * @param options Particle group creation options
 * @param rngSystem RNG system for deterministic creation
 * @param subclass Subclass data for the group
 * @param traits Trait collection for the group
 * @returns A new particle group instance
 */
export function createParticleGroup(
  options: ParticleGroupCreationOptions,
  rngSystem: RNGSystem,
  subclass: SubclassData,
  traits: TraitCollection
): ParticleGroup {
  const id = `group-${options.role}-${options.index}-${Date.now()}`;
  const role = options.role;
  const count = options.count;
  const particles: Particle[] = [];

  // Create RNG stream for this group
  const particleRng = rngSystem.getStream(`particles-${id.replace(/[^a-zA-Z0-9-]/g, '_')}` as any);

  // Create particles for this group
  for (let i = 0; i < count; i++) {
    // Create random initial position within a small sphere
    const theta = particleRng.next() * Math.PI * 2;
    const phi = Math.acos(2 * particleRng.next() - 1);
    const radius = particleRng.next() * 5; // 5 unit radius

    const position: Vector3 = {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi)
    };

    // Create random initial velocity
    const velocity: Vector3 = {
      x: (particleRng.next() - 0.5) * 0.1,
      y: (particleRng.next() - 0.5) * 0.1,
      z: (particleRng.next() - 0.5) * 0.1
    };

    // Create the particle
    const particle = createParticle({
      role,
      position,
      velocity
    });

    // Apply tier-specific visual effects if config is available
    try {
      if (configLoader.getTierModifiers) {
        const tierModifiers = configLoader.getTierModifiers(subclass.tier);
        if (tierModifiers) {
          // Apply tier-specific modifiers
          particle.size *= tierModifiers.size;
          particle.emissiveIntensity = tierModifiers.emissiveIntensity;
          particle.trailLength = tierModifiers.trailLength;
          particle.pulseRate = tierModifiers.pulseRate;
        }
      }
    } catch (error) {
      console.warn('Error applying tier modifiers:', error);
    }

    particles.push(particle);
  }

  // Calculate base attribute value based on nonce and index
  let baseAttributeValue = (options.nonce % 1000) + (options.index * 100);

  // Apply role multiplier if available
  try {
    if (configLoader.getRoleMultiplier) {
      baseAttributeValue *= configLoader.getRoleMultiplier(role);
    }
  } catch (error) {
    console.warn('Error applying role multiplier:', error);
    // Fallback to hardcoded multipliers
    const roleMultipliers = {
      [Role.CORE]: 1.2,
      [Role.CONTROL]: 1.1,
      [Role.MOVEMENT]: 1.0,
      [Role.DEFENSE]: 1.3,
      [Role.ATTACK]: 1.4
    };
    baseAttributeValue *= roleMultipliers[role] || 1.0;
  }

  // Create attribute multipliers
  const attributeMultipliers = {
    base: 1.0,
    fromTraits: 0.0,
    fromMutations: 0.0
  };

  // Apply trait effects to multipliers
  if (traits.classBonus && traits.classBonus.length > 0) {
    // Use the first class bonus trait for simplicity
    const classBonusTrait = traits.classBonus[0];
    attributeMultipliers.fromTraits += classBonusTrait.bonusAmount || 0.0;
  }

  // Calculate attributes based on traits and role
  let primaryAttribute = '';
  let secondaryAttribute = '';

  // Try to get primary and secondary attributes from config
  try {
    if (configLoader.getRoleConfig) {
      const roleConfig = configLoader.getRoleConfig(role);
      primaryAttribute = roleConfig.primaryAttribute;
      secondaryAttribute = roleConfig.secondaryAttribute;
    }
  } catch (error) {
    console.warn('Error getting role attributes from config:', error);
    // Fallback to hardcoded attributes
    const roleAttributes = {
      [Role.CORE]: { primary: 'WIS', secondary: 'INT' },
      [Role.CONTROL]: { primary: 'INT', secondary: 'WIS' },
      [Role.MOVEMENT]: { primary: 'AGI', secondary: 'STR' },
      [Role.DEFENSE]: { primary: 'DEF', secondary: 'WIS' },
      [Role.ATTACK]: { primary: 'STR', secondary: 'AGI' }
    };
    primaryAttribute = roleAttributes[role]?.primary || 'STR';
    secondaryAttribute = roleAttributes[role]?.secondary || 'AGI';
  }

  // Calculate attribute values
  const baseMultiplier = 1 + attributeMultipliers.base + attributeMultipliers.fromTraits + attributeMultipliers.fromMutations;
  const attributes: AttributeValues = {
    STR: baseAttributeValue * (primaryAttribute === 'STR' ? baseMultiplier * 1.5 :
                              secondaryAttribute === 'STR' ? baseMultiplier * 1.2 : baseMultiplier),
    AGI: baseAttributeValue * (primaryAttribute === 'AGI' ? baseMultiplier * 1.5 :
                              secondaryAttribute === 'AGI' ? baseMultiplier * 1.2 : baseMultiplier),
    DEF: baseAttributeValue * (primaryAttribute === 'DEF' ? baseMultiplier * 1.5 :
                              secondaryAttribute === 'DEF' ? baseMultiplier * 1.2 : baseMultiplier),
    INT: baseAttributeValue * (primaryAttribute === 'INT' ? baseMultiplier * 1.5 :
                              secondaryAttribute === 'INT' ? baseMultiplier * 1.2 : baseMultiplier),
    WIS: baseAttributeValue * (primaryAttribute === 'WIS' ? baseMultiplier * 1.5 :
                              secondaryAttribute === 'WIS' ? baseMultiplier * 1.2 : baseMultiplier)
  };

  // Create the particle group
  return {
    id,
    role,
    count,
    traits,
    attributes,
    particles,
    mutations: [],
    subclass,
    baseAttributeValue,
    attributeMultipliers
  };
}

/**
 * Update particle positions based on velocities
 * @param particles Array of particles to update
 * @param deltaTime Time step for the update
 */
export function updateParticlePositions(particles: Particle[], deltaTime: number): void {
  for (const particle of particles) {
    // Update velocity based on acceleration
    particle.velocity.x += particle.acceleration.x * deltaTime;
    particle.velocity.y += particle.acceleration.y * deltaTime;
    particle.velocity.z += particle.acceleration.z * deltaTime;

    // Update position based on velocity
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    particle.position.z += particle.velocity.z * deltaTime;

    // Reset acceleration
    particle.acceleration.x = 0;
    particle.acceleration.y = 0;
    particle.acceleration.z = 0;
  }
}

/**
 * Apply forces to particles
 * @param particles Array of particles to apply forces to
 * @param forces Array of forces to apply
 */
export function applyForcesToParticles(
  particles: Particle[],
  forces: Vector3[]
): void {
  if (particles.length !== forces.length) {
    throw new Error('Number of particles and forces must match');
  }

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const force = forces[i];

    // F = ma, so a = F/m
    particle.acceleration.x += force.x / particle.mass;
    particle.acceleration.y += force.y / particle.mass;
    particle.acceleration.z += force.z / particle.mass;
  }
}

/**
 * Get positions from particles
 * @param particles Array of particles
 * @returns Array of positions
 */
export function getParticlePositions(particles: Particle[]): Vector3[] {
  return particles.map(p => p.position);
}

/**
 * Get velocities from particles
 * @param particles Array of particles
 * @returns Array of velocities
 */
export function getParticleVelocities(particles: Particle[]): Vector3[] {
  return particles.map(p => p.velocity);
}

/**
 * Determine tier based on attribute value
 * @param attributeValue The attribute value
 * @returns The corresponding tier
 */
export function determineTierFromAttributeValue(attributeValue: number): Tier {
  if (attributeValue >= 1501) return Tier.MYTHIC;
  if (attributeValue >= 1201) return Tier.LEGENDARY;
  if (attributeValue >= 901) return Tier.EPIC;
  if (attributeValue >= 601) return Tier.RARE;
  if (attributeValue >= 301) return Tier.UNCOMMON;
  return Tier.COMMON;
}

