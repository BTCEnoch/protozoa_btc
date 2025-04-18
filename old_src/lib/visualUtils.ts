/**
 * Visual Utilities for Bitcoin Protozoa
 * 
 * This file contains utility functions for working with visual traits.
 */

import { Role, Tier } from '../types/abilities/ability';
import { 
  VisualTrait, 
  VisualRegistry, 
  ParticleShape, 
  AnimationType, 
  VisualEffectType, 
  VisualEffectTrigger 
} from '../types/visuals/visual';
import { RNGStream } from '../types/utils/rng';

/**
 * Get a random visual trait from the registry
 * @param registry The visual registry
 * @param role The role to get a visual trait for
 * @param tier The tier to get a visual trait for
 * @param rng The RNG stream to use
 * @returns A random visual trait, or undefined if none are available
 */
export function getRandomVisualTrait(
  registry: VisualRegistry,
  role: Role,
  tier: Tier,
  rng: RNGStream
): VisualTrait | undefined {
  // Get the visual traits for the role and tier
  const visualTraits = registry[role]?.[tier];
  
  // If there are no visual traits, return undefined
  if (!visualTraits || visualTraits.length === 0) {
    return undefined;
  }
  
  // Get a random visual trait
  const index = rng.nextInt(0, visualTraits.length - 1);
  return visualTraits[index];
}

/**
 * Create a default visual trait
 * @param role The role to create a visual trait for
 * @param tier The tier to create a visual trait for
 * @returns A default visual trait
 */
export function createDefaultVisualTrait(role: Role, tier: Tier): VisualTrait {
  // Define role-specific colors
  const roleColors: Record<Role, string> = {
    [Role.CORE]: '#00FFFF', // Cyan
    [Role.ATTACK]: '#FF0000', // Red
    [Role.DEFENSE]: '#00FF00', // Green
    [Role.CONTROL]: '#800080', // Purple
    [Role.MOVEMENT]: '#FFFF00' // Yellow
  };
  
  // Define role-specific shapes
  const roleShapes: Record<Role, ParticleShape> = {
    [Role.CORE]: ParticleShape.SPHERE,
    [Role.ATTACK]: ParticleShape.TETRAHEDRON,
    [Role.DEFENSE]: ParticleShape.CUBE,
    [Role.CONTROL]: ParticleShape.OCTAHEDRON,
    [Role.MOVEMENT]: ParticleShape.ICOSAHEDRON
  };
  
  // Define role-specific animation types
  const roleAnimationTypes: Record<Role, AnimationType> = {
    [Role.CORE]: AnimationType.PULSE,
    [Role.ATTACK]: AnimationType.SPIN,
    [Role.DEFENSE]: AnimationType.STATIC,
    [Role.CONTROL]: AnimationType.ORBIT,
    [Role.MOVEMENT]: AnimationType.WAVE
  };
  
  // Create a unique ID
  const id = `default_${role.toLowerCase()}_${tier.toString().toLowerCase()}`;
  
  // Create a name
  const name = `Default ${role} ${tier.toString()} Visual`;
  
  // Create a description
  const description = `A default visual trait for ${role.toLowerCase()} particles.`;
  
  // Create a particle appearance
  const particleAppearance = {
    shape: roleShapes[role],
    color: roleColors[role],
    size: 1.0,
    opacity: 0.8,
    emissive: false
  };
  
  // Create an animation
  const animation = {
    type: roleAnimationTypes[role],
    speed: 1.0
  };
  
  // Create visual effects
  const effects = [];
  
  // Return the visual trait
  return {
    id,
    name,
    description,
    role,
    tier,
    particleAppearance,
    animation,
    effects
  };
}

/**
 * Apply a visual trait to a particle
 * @param particle The particle to apply the visual trait to
 * @param visualTrait The visual trait to apply
 * @returns The updated particle
 */
export function applyVisualToParticle(particle: any, visualTrait: VisualTrait): any {
  // Create a deep copy of the particle
  const updatedParticle = { ...particle };
  
  // Apply the particle appearance
  updatedParticle.shape = visualTrait.particleAppearance.shape;
  updatedParticle.color = visualTrait.particleAppearance.color;
  updatedParticle.size = visualTrait.particleAppearance.size;
  updatedParticle.opacity = visualTrait.particleAppearance.opacity;
  updatedParticle.emissive = visualTrait.particleAppearance.emissive;
  
  if (visualTrait.particleAppearance.emissiveColor) {
    updatedParticle.emissiveColor = visualTrait.particleAppearance.emissiveColor;
  }
  
  if (visualTrait.particleAppearance.emissiveIntensity) {
    updatedParticle.emissiveIntensity = visualTrait.particleAppearance.emissiveIntensity;
  }
  
  if (visualTrait.particleAppearance.roughness) {
    updatedParticle.roughness = visualTrait.particleAppearance.roughness;
  }
  
  if (visualTrait.particleAppearance.metalness) {
    updatedParticle.metalness = visualTrait.particleAppearance.metalness;
  }
  
  // Apply the animation
  updatedParticle.animation = {
    type: visualTrait.animation.type,
    speed: visualTrait.animation.speed,
    parameters: visualTrait.animation.parameters
  };
  
  // Apply the visual effects
  updatedParticle.effects = visualTrait.effects.map(effect => ({
    type: effect.type,
    trigger: effect.trigger,
    intensity: effect.intensity,
    duration: effect.duration,
    parameters: effect.parameters
  }));
  
  return updatedParticle;
}

/**
 * Get the color for a role
 * @param role The role to get the color for
 * @returns The color for the role
 */
export function getRoleColor(role: Role): string {
  const roleColors: Record<Role, string> = {
    [Role.CORE]: '#00FFFF', // Cyan
    [Role.ATTACK]: '#FF0000', // Red
    [Role.DEFENSE]: '#00FF00', // Green
    [Role.CONTROL]: '#800080', // Purple
    [Role.MOVEMENT]: '#FFFF00' // Yellow
  };
  
  return roleColors[role];
}

/**
 * Get the shape for a role
 * @param role The role to get the shape for
 * @returns The shape for the role
 */
export function getRoleShape(role: Role): ParticleShape {
  const roleShapes: Record<Role, ParticleShape> = {
    [Role.CORE]: ParticleShape.SPHERE,
    [Role.ATTACK]: ParticleShape.TETRAHEDRON,
    [Role.DEFENSE]: ParticleShape.CUBE,
    [Role.CONTROL]: ParticleShape.OCTAHEDRON,
    [Role.MOVEMENT]: ParticleShape.ICOSAHEDRON
  };
  
  return roleShapes[role];
}

/**
 * Get the animation type for a role
 * @param role The role to get the animation type for
 * @returns The animation type for the role
 */
export function getRoleAnimationType(role: Role): AnimationType {
  const roleAnimationTypes: Record<Role, AnimationType> = {
    [Role.CORE]: AnimationType.PULSE,
    [Role.ATTACK]: AnimationType.SPIN,
    [Role.DEFENSE]: AnimationType.STATIC,
    [Role.CONTROL]: AnimationType.ORBIT,
    [Role.MOVEMENT]: AnimationType.WAVE
  };
  
  return roleAnimationTypes[role];
}

/**
 * Get the effect type for a role
 * @param role The role to get the effect type for
 * @returns The effect type for the role
 */
export function getRoleEffectType(role: Role): VisualEffectType {
  const roleEffectTypes: Record<Role, VisualEffectType> = {
    [Role.CORE]: VisualEffectType.ENERGY,
    [Role.ATTACK]: VisualEffectType.FIRE,
    [Role.DEFENSE]: VisualEffectType.SHIELD,
    [Role.CONTROL]: VisualEffectType.AURA,
    [Role.MOVEMENT]: VisualEffectType.TRAIL
  };
  
  return roleEffectTypes[role];
}
