/**
 * Vector Math Utilities for Bitcoin Protozoa
 *
 * This file provides vector math functions used throughout the project.
 */

import { Vector3 } from '../../types/common';

/**
 * Calculate the distance between two points
 * @param a First point
 * @param b Second point
 * @returns The distance between the points
 */
export function distance(a: Vector3, b: Vector3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Normalize a vector to unit length
 * @param v Vector to normalize
 * @returns A new normalized vector
 */
export function normalize(v: Vector3): Vector3 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length
  };
}

/**
 * Linear interpolation between two vectors
 * @param a Start vector
 * @param b End vector
 * @param t Interpolation factor (0-1)
 * @returns Interpolated vector
 */
export function lerp(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  };
}

/**
 * Calculate the dot product of two vectors
 * @param a First vector
 * @param b Second vector
 * @returns The dot product
 */
export function dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calculate the magnitude (length) of a vector
 * @param v Vector
 * @returns The magnitude
 */
export function magnitude(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Calculate the squared magnitude of a vector
 * @param v Vector
 * @returns The squared magnitude
 */
export function magnitudeSquared(v: Vector3): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

/**
 * Limit the magnitude of a vector
 * @param v Vector to limit
 * @param max Maximum magnitude
 * @returns A new vector with limited magnitude
 */
export function limit(v: Vector3, max: number): Vector3 {
  const magSq = magnitudeSquared(v);
  if (magSq > max * max) {
    const normalized = normalize(v);
    return {
      x: normalized.x * max,
      y: normalized.y * max,
      z: normalized.z * max
    };
  }
  return { ...v };
}

/**
 * Calculate the angle between two vectors in radians
 * @param a First vector
 * @param b Second vector
 * @returns The angle in radians
 */
export function angleBetween(a: Vector3, b: Vector3): number {
  const magA = magnitude(a);
  const magB = magnitude(b);

  if (magA === 0 || magB === 0) {
    return 0;
  }

  const dotProduct = dot(a, b);
  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magA * magB)));
  return Math.acos(cosAngle);
}

/**
 * Add two vectors
 * @param a First vector
 * @param b Second vector
 * @returns A new vector that is the sum of a and b
 */
export function add(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
}

/**
 * Subtract vector b from vector a
 * @param a First vector
 * @param b Second vector
 * @returns A new vector that is a - b
 */
export function subtract(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

/**
 * Multiply a vector by a scalar
 * @param v Vector to multiply
 * @param scalar Scalar value
 * @returns A new vector that is v * scalar
 */
export function multiply(v: Vector3, scalar: number): Vector3 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar
  };
}

/**
 * Calculate the cross product of two vectors
 * @param a First vector
 * @param b Second vector
 * @returns The cross product vector
 */
export function cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

/**
 * Calculate the distance squared between two points (more efficient than distance)
 * @param a First point
 * @param b Second point
 * @returns The squared distance between the points
 */
export function distanceSquared(a: Vector3, b: Vector3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Create a zero vector
 * @returns A vector with all components set to zero
 */
export function zero(): Vector3 {
  return { x: 0, y: 0, z: 0 };
}

/**
 * Create a unit vector in the X direction
 * @returns A unit vector in the X direction
 */
export function unitX(): Vector3 {
  return { x: 1, y: 0, z: 0 };
}

/**
 * Create a unit vector in the Y direction
 * @returns A unit vector in the Y direction
 */
export function unitY(): Vector3 {
  return { x: 0, y: 1, z: 0 };
}

/**
 * Create a unit vector in the Z direction
 * @returns A unit vector in the Z direction
 */
export function unitZ(): Vector3 {
  return { x: 0, y: 0, z: 1 };
}
