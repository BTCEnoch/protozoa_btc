/**
 * General Math Utilities for Bitcoin Protozoa
 *
 * This file provides general math functions used throughout the project.
 */

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
 * Calculate the factorial of a number
 * @param n The number
 * @returns The factorial of n
 */
export function factorial(n: number): number {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Calculate the binomial coefficient (n choose k)
 * @param n Total number of items
 * @param k Number of items to choose
 * @returns The binomial coefficient
 */
export function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) {
    return 0;
  }
  if (k === 0 || k === n) {
    return 1;
  }
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 0; i < k; i++) {
    c = c * (n - i) / (i + 1);
  }
  return Math.round(c);
}

/**
 * Check if a number is a power of 2
 * @param n The number to check
 * @returns True if n is a power of 2, false otherwise
 */
export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Get the next power of 2 greater than or equal to n
 * @param n The number
 * @returns The next power of 2
 */
export function nextPowerOfTwo(n: number): number {
  if (n <= 0) {
    return 1;
  }
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n + 1;
}

/**
 * Linear interpolation with clamping
 * @param a Start value
 * @param b End value
 * @param t Interpolation factor (clamped to 0-1)
 * @returns Interpolated value
 */
export function lerpClamped(a: number, b: number, t: number): number {
  return lerp(a, b, clamp(t, 0, 1));
}

/**
 * Smooth step interpolation
 * @param a Start value
 * @param b End value
 * @param t Interpolation factor (0-1)
 * @returns Smoothly interpolated value
 */
export function smoothStep(a: number, b: number, t: number): number {
  const x = clamp(t, 0, 1);
  const factor = x * x * (3 - 2 * x);
  return a + factor * (b - a);
}

/**
 * Smoother step interpolation (5th order)
 * @param a Start value
 * @param b End value
 * @param t Interpolation factor (0-1)
 * @returns More smoothly interpolated value
 */
export function smootherStep(a: number, b: number, t: number): number {
  const x = clamp(t, 0, 1);
  const factor = x * x * x * (x * (x * 6 - 15) + 10);
  return a + factor * (b - a);
}
