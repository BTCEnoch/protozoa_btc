/**
 * Rendering Types for Bitcoin Protozoa
 *
 * This file defines the types for the rendering system.
 */

import * as THREE from 'three';
import { Vector3 } from '../../../shared/types/common';

/**
 * Instanced render options
 */
export interface InstancedRenderOptions {
  maxInstances?: number;
  geometry: string;
  geometryParams?: {
    radius?: number;
    segments?: number;
    width?: number;
    height?: number;
    depth?: number;
    tube?: number;
    radialSegments?: number;
    tubularSegments?: number;
  };
  material: string;
  materialParams?: {
    color?: THREE.ColorRepresentation;
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
    emissive?: boolean;
    emissiveColor?: THREE.ColorRepresentation;
    emissiveIntensity?: number;
  };
  frustumCulled?: boolean;
}

/**
 * Instance data for updating instanced meshes
 */
export interface InstanceData {
  positions: Vector3[];
  scales?: (number | Vector3)[];
  colors?: THREE.ColorRepresentation[];
  rotations?: { x: number; y: number; z: number; w: number }[];
  customAttributes?: Record<string, {
    data: Float32Array;
    itemSize: number;
  }>;
}

/**
 * Trail render options
 */
export interface TrailRenderOptions {
  maxPoints?: number;
  pointsPerParticle?: number;
  width?: number;
  color?: THREE.ColorRepresentation;
  fadeTime?: number;
  minDistance?: number;
  maxDistance?: number;
}

/**
 * Shader type
 */
export enum ShaderType {
  VERTEX = 'vertex',
  FRAGMENT = 'fragment',
  COMPUTE = 'compute'
}

/**
 * Shader definition
 */
export interface ShaderDefinition {
  name: string;
  type: ShaderType;
  source: string;
  uniforms?: Record<string, {
    type: string;
    value: any;
  }>;
}

/**
 * LOD Level interface
 * Defines a level of detail based on distance
 */
export interface LODLevel {
  distance: number;
  scale: number;
  detail: number;
}

/**
 * Level of detail configuration
 */
export interface LODConfig {
  levels: LODLevel[];
  fadeTransitions?: boolean;
  transitionDuration?: number;
}

/**
 * Render quality settings
 */
export enum RenderQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

/**
 * Render configuration
 */
export interface RenderConfig {
  quality: RenderQuality;
  bloom: {
    strength: number;
    radius: number;
    threshold: number;
    enabled: boolean;
  };
  shadows: {
    enabled: boolean;
    type: THREE.ShadowMapType;
    resolution: number;
  };
  antialiasing: boolean;
  postProcessing: {
    enabled: boolean;
    effects: string[];
  };
  instancing: {
    maxInstancesPerMesh: number;
    useSharedBuffers: boolean;
    dynamicDrawUsage: boolean;
  };
  lod: LODConfig;
}

/**
 * Particle render data
 */
export interface ParticleRenderData {
  position: Vector3;
  velocity?: Vector3;
  scale?: number | Vector3;
  color?: THREE.ColorRepresentation;
  rotation?: { x: number; y: number; z: number; w: number };
  trail?: boolean;
  effect?: string;
}
