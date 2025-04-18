/**
 * Behavior Generators for Bitcoin Protozoa
 *
 * This file contains implementations of various behavior generators
 * that can be registered with the behavior service.
 *
 * Each generator function takes a BehaviorTrait, an array of particle positions,
 * the current time, and an RNG stream, and returns an array of force vectors
 * to be applied to the particles.
 *
 * The behavior trait's physicsLogic properties (strength, range, priority, etc.)
 * are used to customize the behavior's effect. Additional parameters can be
 * provided in the additionalParameters object.
 *
 * Available behavior generators:
 * - generateOscillationBehavior: Particles oscillate back and forth
 * - generateRotationBehavior: Particles rotate around the center of mass
 * - generateSwarmingBehavior: Particles swarm around with random movement and center attraction
 * - generateHuntingBehavior: One particle is hunted by all others
 *
 * These generators are used by the BehaviorService to apply forces to particles
 * based on their assigned behaviors.
 */

import { BehaviorTrait } from '../../types/traits/trait';
import { Vector3 } from '../../types/common';
import { RNGStream } from '../../types/utils/rng';

/**
 * Generate oscillation behavior forces
 *
 * Creates a sinusoidal oscillation pattern where particles move back and forth
 * along the x-axis. Each particle oscillates with a slightly different phase
 * based on its index, creating a wave-like effect across the group.
 *
 * Relevant physicsLogic properties:
 * - strength: Controls the amplitude of oscillation
 * - frequency: Controls how quickly the oscillation cycles
 *
 * @param behaviorTrait The behavior trait containing physics parameters
 * @param positions The current positions of particles
 * @param time The current time in seconds
 * @param rng The RNG stream for deterministic randomness
 * @returns An array of force vectors to apply to each particle
 */
export function generateOscillationBehavior(
  behaviorTrait: BehaviorTrait,
  positions: Vector3[],
  time: number,
  rng: RNGStream
): Vector3[] {
  const forces: Vector3[] = [];
  const strength = behaviorTrait.physicsLogic.strength;
  const frequency = behaviorTrait.physicsLogic.frequency;

  // Generate forces for each particle
  for (let i = 0; i < positions.length; i++) {
    // Each particle oscillates with a slightly different phase
    const phase = (i / positions.length) * Math.PI * 2;
    const oscillation = Math.sin(time * frequency + phase) * strength;

    // Apply force in the x direction
    forces.push({ x: oscillation, y: 0, z: 0 });
  }

  return forces;
}

/**
 * Generate rotation behavior forces
 *
 * Creates a rotational pattern where particles orbit around their collective
 * center of mass. The force applied is perpendicular to the radius from the
 * center, creating a circular motion.
 *
 * Relevant physicsLogic properties:
 * - strength: Controls the speed of rotation
 * - additionalParameters.clockwise: If true, rotation is clockwise (default: counter-clockwise)
 *
 * @param behaviorTrait The behavior trait containing physics parameters
 * @param positions The current positions of particles
 * @param time The current time in seconds
 * @param rng The RNG stream for deterministic randomness
 * @returns An array of force vectors to apply to each particle
 */
export function generateRotationBehavior(
  behaviorTrait: BehaviorTrait,
  positions: Vector3[],
  time: number,
  rng: RNGStream
): Vector3[] {
  const forces: Vector3[] = [];
  const strength = behaviorTrait.physicsLogic.strength;

  // Calculate center of mass
  const center = calculateCenterOfMass(positions);

  // Generate forces for each particle
  for (const position of positions) {
    const dx = position.x - center.x;
    const dy = position.y - center.y;

    // Apply rotational force (perpendicular to radius)
    const forceX = -dy * strength;
    const forceY = dx * strength;

    forces.push({ x: forceX, y: forceY, z: 0 });
  }

  return forces;
}

/**
 * Generate swarming behavior forces
 *
 * Creates a swarming pattern where particles move with a combination of random
 * movement and attraction to the center of mass. The attraction increases as
 * particles get further from the center, keeping the swarm cohesive while
 * allowing individual movement.
 *
 * Relevant physicsLogic properties:
 * - strength: Controls the overall force magnitude
 * - range: Distance at which attraction to center reaches maximum
 * - additionalParameters.randomness: Controls the random movement component (0-1)
 * - additionalParameters.cohesion: Controls the attraction to center (0-1)
 *
 * @param behaviorTrait The behavior trait containing physics parameters
 * @param positions The current positions of particles
 * @param time The current time in seconds
 * @param rng The RNG stream for deterministic randomness
 * @returns An array of force vectors to apply to each particle
 */
export function generateSwarmingBehavior(
  behaviorTrait: BehaviorTrait,
  positions: Vector3[],
  time: number,
  rng: RNGStream
): Vector3[] {
  const forces: Vector3[] = [];
  const strength = behaviorTrait.physicsLogic.strength;
  const range = behaviorTrait.physicsLogic.range;

  // Calculate center of mass
  const center = calculateCenterOfMass(positions);

  // Generate forces for each particle
  for (const position of positions) {
    // Random force component
    const randomX = (rng.next() * 2 - 1) * strength;
    const randomY = (rng.next() * 2 - 1) * strength;
    const randomZ = (rng.next() * 2 - 1) * strength;

    // Attraction to center
    const toCenterX = center.x - position.x;
    const toCenterY = center.y - position.y;
    const toCenterZ = center.z - position.z;

    const distSq = toCenterX * toCenterX + toCenterY * toCenterY + toCenterZ * toCenterZ;
    const attraction = Math.min(1, distSq / (range * range)) * strength * 0.5;

    // Combine forces
    const forceX = randomX + toCenterX * attraction;
    const forceY = randomY + toCenterY * attraction;
    const forceZ = randomZ + toCenterZ * attraction;

    forces.push({ x: forceX, y: forceY, z: forceZ });
  }

  return forces;
}

/**
 * Generate hunting behavior forces
 *
 * Creates a hunting pattern where one particle is randomly selected as the target,
 * and all other particles move toward it. The target particle moves randomly,
 * creating a chase dynamic within the group.
 *
 * Relevant physicsLogic properties:
 * - strength: Controls the speed of both hunters and target
 * - additionalParameters.targetSpeed: Multiplier for target movement speed
 * - additionalParameters.hunterSpeed: Multiplier for hunter movement speed
 * - additionalParameters.targetChangeInterval: How often to change the target (in seconds)
 *
 * @param behaviorTrait The behavior trait containing physics parameters
 * @param positions The current positions of particles
 * @param time The current time in seconds
 * @param rng The RNG stream for deterministic randomness
 * @returns An array of force vectors to apply to each particle
 */
export function generateHuntingBehavior(
  behaviorTrait: BehaviorTrait,
  positions: Vector3[],
  time: number,
  rng: RNGStream
): Vector3[] {
  const forces: Vector3[] = [];
  const strength = behaviorTrait.physicsLogic.strength;

  // Select a random target particle
  const targetIndex = Math.floor(rng.next() * positions.length);
  const target = positions[targetIndex];

  // Generate forces for each particle
  for (let i = 0; i < positions.length; i++) {
    if (i === targetIndex) {
      // Target particle moves randomly
      const randomX = (rng.next() * 2 - 1) * strength;
      const randomY = (rng.next() * 2 - 1) * strength;
      const randomZ = (rng.next() * 2 - 1) * strength;

      forces.push({ x: randomX, y: randomY, z: randomZ });
    } else {
      // Other particles hunt the target
      const position = positions[i];
      const toTargetX = target.x - position.x;
      const toTargetY = target.y - position.y;
      const toTargetZ = target.z - position.z;

      const distSq = toTargetX * toTargetX + toTargetY * toTargetY + toTargetZ * toTargetZ;
      const dist = Math.sqrt(distSq);

      if (dist > 0) {
        const forceX = toTargetX / dist * strength;
        const forceY = toTargetY / dist * strength;
        const forceZ = toTargetZ / dist * strength;

        forces.push({ x: forceX, y: forceY, z: forceZ });
      } else {
        forces.push({ x: 0, y: 0, z: 0 });
      }
    }
  }

  return forces;
}

/**
 * Calculate center of mass for a set of positions
 * @param positions The positions
 * @returns The center of mass
 */
export function calculateCenterOfMass(positions: Vector3[]): Vector3 {
  if (positions.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  for (const position of positions) {
    sumX += position.x;
    sumY += position.y;
    sumZ += position.z;
  }

  return {
    x: sumX / positions.length,
    y: sumY / positions.length,
    z: sumZ / positions.length
  };
}

