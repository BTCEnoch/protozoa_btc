/**
 * Math Utilities for Bitcoin Protozoa
 *
 * This file provides common math functions used throughout the project.
 */

import { Vector3 } from '../types/common';

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
 * Linear interpolation between two values
 * @param a Start value
 * @param b End value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Linear interpolation between two vectors
 * @param a Start vector
 * @param b End vector
 * @param t Interpolation factor (0-1)
 * @returns Interpolated vector
 */
export function lerpVector(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t)
  };
}

/**
 * Clamp a value between a minimum and maximum
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
  const cosAngle = clamp(dotProduct / (magA * magB), -1, 1);
  return Math.acos(cosAngle);
}

/**
 * Map a value from one range to another
 * @param value Value to map
 * @param inMin Input range minimum
 * @param inMax Input range maximum
 * @param outMin Output range minimum
 * @param outMax Output range maximum
 * @returns Mapped value
 */
export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export function radToDeg(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Add two vectors
 * @param a First vector
 * @param b Second vector
 * @returns A new vector that is the sum of a and b
 */
export function addVectors(a: Vector3, b: Vector3): Vector3 {
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
export function subtractVectors(a: Vector3, b: Vector3): Vector3 {
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
export function multiplyVector(v: Vector3, scalar: number): Vector3 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar
  };
}

/**
 * Normalize a vector (alias for normalize function)
 * @param v Vector to normalize
 * @returns A new normalized vector
 */
export function normalizeVector(v: Vector3): Vector3 {
  return normalize(v);
}
