/**
 * Attribute Utilities
 *
 * This file provides utility functions for attribute calculations in the Group Domain.
 */
import { GroupAttributes } from '../models/particleGroups';

/**
 * Linear interpolation function
 * @param x The input value
 * @param x0 The minimum input value
 * @param x1 The maximum input value
 * @param y0 The minimum output value
 * @param y1 The maximum output value
 * @returns The interpolated value
 */
export const lerp = (
  x: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): number => {
  // Ensure x is within the range [x0, x1]
  const clampedX = Math.max(x0, Math.min(x, x1));

  // Calculate the interpolation factor
  const t = (clampedX - x0) / (x1 - x0);

  // Interpolate between y0 and y1
  return Math.round(y0 + t * (y1 - y0));
};

/**
 * Maps a particle count to an attribute value
 * @param particleCount The number of particles
 * @returns The attribute value
 */
export const mapParticlesToAttribute = (
  particleCount: number
): number => {
  // Use the particle count directly as the attribute value
  return particleCount;
};

/**
 * Calculates the attribute for a particle group
 * @param particleCount The number of particles in the group
 * @returns The attribute for the particle group
 */
export const calculateAttributes = (
  particleCount: number
): GroupAttributes => {
  // Calculate the attribute value directly from particle count
  return {
    attribute: mapParticlesToAttribute(particleCount)
  };
};
