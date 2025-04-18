/**
 * Instanced Rendering Types for Bitcoin Protozoa
 *
 * This file defines the types for instanced rendering, which is used to efficiently
 * render large numbers of particles with the same geometry and material.
 */

import { Vector3 } from '../common';
import { Color, ColorTheme } from '../core';

/**
 * Instanced render options interface
 * Options for instanced rendering
 */
export interface InstancedRenderOptions {
  // Geometry options
  geometry: 'sphere' | 'box' | 'cone' | 'cylinder' | 'torus' | 'custom';
  geometryParams?: {
    radius?: number;
    width?: number;
    height?: number;
    depth?: number;
    segments?: number;
    detail?: number;
  };

  // Material options
  material: 'standard' | 'basic' | 'phong' | 'lambert' | 'toon' | 'shader';
  materialParams?: {
    color?: Color;
    emissive?: boolean;
    emissiveColor?: Color;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
    flatShading?: boolean;
  };

  // Instance options
  maxInstances: number;
  frustumCulled: boolean;

  // Performance options
  useSharedBuffers?: boolean;
  updateFrequency?: number;
  lodLevels?: number;
}

/**
 * Instanced render data interface
 * Data for instanced rendering
 */
export interface InstancedRenderData {
  // Instance data
  positions: Vector3[];
  scales: Vector3[] | number[];
  colors?: Color[];
  opacities?: number[];

  // Animation data
  rotations?: {
    x: number;
    y: number;
    z: number;
    w: number;
  }[];
  velocities?: Vector3[];

  // Custom data
  customAttributes?: Record<string, InstanceAttribute>;
}

/**
 * Instance attribute interface
 * Custom attribute for instanced rendering
 */
export interface InstanceAttribute {
  // Attribute data
  data: Float32Array | Int32Array | Uint32Array;
  itemSize: number;
  normalized?: boolean;

  // Update function
  updateFunction?: (index: number, time: number) => void;
}
