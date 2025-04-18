/**
 * Three.js Utilities for Bitcoin Protozoa
 *
 * This module provides utility functions for working with Three.js,
 * including conversions, optimizations, and helper functions.
 */

import * as THREE from 'three';
import { Vector3 } from '../types/common';

/**
 * Convert a Vector3 to a THREE.Vector3
 * @param vector Vector3 object
 * @returns THREE.Vector3
 */
export function toThreeVector3(vector: Vector3): THREE.Vector3 {
  return new THREE.Vector3(vector.x, vector.y, vector.z);
}

/**
 * Convert a THREE.Vector3 to a Vector3
 * @param vector THREE.Vector3 object
 * @returns Vector3
 */
export function fromThreeVector3(vector: THREE.Vector3): Vector3 {
  return { x: vector.x, y: vector.y, z: vector.z };
}

/**
 * Convert a hex color string to a THREE.Color
 * @param hex Hex color string
 * @returns THREE.Color
 */
export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

/**
 * Create a buffer geometry from vertices
 * @param vertices Array of Vector3 objects
 * @param indices Optional array of indices
 * @returns THREE.BufferGeometry
 */
export function createBufferGeometry(
  vertices: Vector3[],
  indices?: number[]
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // Convert vertices to Float32Array
  const vertexArray = new Float32Array(vertices.length * 3);

  for (let i = 0; i < vertices.length; i++) {
    vertexArray[i * 3] = vertices[i].x;
    vertexArray[i * 3 + 1] = vertices[i].y;
    vertexArray[i * 3 + 2] = vertices[i].z;
  }

  // Set position attribute
  geometry.setAttribute('position', new THREE.BufferAttribute(vertexArray, 3));

  // Set indices if provided
  if (indices) {
    geometry.setIndex(indices);
  }

  // Compute vertex normals
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Create an instanced buffer geometry
 * @param baseGeometry Base geometry
 * @param count Number of instances
 * @returns THREE.InstancedBufferGeometry
 */
export function createInstancedGeometry(
  baseGeometry: THREE.BufferGeometry,
  count: number
): THREE.InstancedBufferGeometry {
  const instancedGeometry = new THREE.InstancedBufferGeometry();

  // Copy attributes from base geometry
  instancedGeometry.index = baseGeometry.index;

  for (const name in baseGeometry.attributes) {
    instancedGeometry.setAttribute(name, baseGeometry.attributes[name]);
  }

  // Set instance count
  instancedGeometry.instanceCount = count;

  return instancedGeometry;
}

/**
 * Create a point cloud geometry
 * @param positions Array of Vector3 objects
 * @param colors Optional array of color strings
 * @param sizes Optional array of point sizes
 * @returns THREE.BufferGeometry
 */
export function createPointCloudGeometry(
  positions: Vector3[],
  colors?: string[],
  sizes?: number[]
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // Convert positions to Float32Array
  const positionArray = new Float32Array(positions.length * 3);

  for (let i = 0; i < positions.length; i++) {
    positionArray[i * 3] = positions[i].x;
    positionArray[i * 3 + 1] = positions[i].y;
    positionArray[i * 3 + 2] = positions[i].z;
  }

  // Set position attribute
  geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

  // Set color attribute if provided
  if (colors) {
    const colorArray = new Float32Array(colors.length * 3);

    for (let i = 0; i < colors.length; i++) {
      const color = new THREE.Color(colors[i]);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
  }

  // Set size attribute if provided
  if (sizes) {
    const sizeArray = new Float32Array(sizes);
    geometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
  }

  return geometry;
}

/**
 * Create a line geometry from points
 * @param points Array of Vector3 objects
 * @param closed Whether the line should be closed
 * @returns THREE.BufferGeometry
 */
export function createLineGeometry(
  points: Vector3[],
  closed: boolean = false
): THREE.BufferGeometry {
  // Convert points to THREE.Vector3 array
  const threePoints = points.map(p => toThreeVector3(p));

  // Create curve
  const curve = new THREE.CatmullRomCurve3(threePoints, closed);

  // Create geometry
  return new THREE.BufferGeometry().setFromPoints(curve.getPoints(points.length * 10));
}

/**
 * Create a tube geometry from points
 * @param points Array of Vector3 objects
 * @param radius Tube radius
 * @param segments Number of segments
 * @param closed Whether the tube should be closed
 * @returns THREE.BufferGeometry
 */
export function createTubeGeometry(
  points: Vector3[],
  radius: number = 0.1,
  segments: number = 8,
  closed: boolean = false
): THREE.BufferGeometry {
  // Convert points to THREE.Vector3 array
  const threePoints = points.map(p => toThreeVector3(p));

  // Create curve
  const curve = new THREE.CatmullRomCurve3(threePoints, closed);

  // Create geometry
  return new THREE.TubeGeometry(curve, points.length * 10, radius, segments, closed);
}

/**
 * Optimize a buffer geometry
 * @param geometry Buffer geometry to optimize
 * @returns Optimized buffer geometry
 */
export function optimizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  // Merge vertices
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');

  // Compute vertex normals
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Create a basic material
 * @param color Color string
 * @param options Material options
 * @returns THREE.MeshBasicMaterial
 */
export function createBasicMaterial(
  color: string,
  options: {
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
  } = {}
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: options.transparent,
    opacity: options.opacity,
    wireframe: options.wireframe
  });
}

/**
 * Create a standard material
 * @param color Color string
 * @param options Material options
 * @returns THREE.MeshStandardMaterial
 */
export function createStandardMaterial(
  color: string,
  options: {
    transparent?: boolean;
    opacity?: number;
    metalness?: number;
    roughness?: number;
    emissive?: boolean;
    emissiveColor?: string;
    emissiveIntensity?: number;
  } = {}
): THREE.MeshStandardMaterial {
  const mainColor = new THREE.Color(color);
  let emissiveColor;

  if (options.emissive && options.emissiveColor) {
    emissiveColor = new THREE.Color(options.emissiveColor);
  }

  return new THREE.MeshStandardMaterial({
    color: mainColor,
    transparent: options.transparent,
    opacity: options.opacity,
    metalness: options.metalness,
    roughness: options.roughness,
    emissive: options.emissive ? emissiveColor : undefined,
    emissiveIntensity: options.emissiveIntensity
  });
}

/**
 * Create a point material
 * @param color Color string
 * @param options Material options
 * @returns THREE.PointsMaterial
 */
export function createPointMaterial(
  color: string,
  options: {
    size?: number;
    sizeAttenuation?: boolean;
    transparent?: boolean;
    opacity?: number;
  } = {}
): THREE.PointsMaterial {
  const mainColor = new THREE.Color(color);

  return new THREE.PointsMaterial({
    color: mainColor,
    size: options.size || 1,
    sizeAttenuation: options.sizeAttenuation !== undefined ? options.sizeAttenuation : true,
    transparent: options.transparent,
    opacity: options.opacity
  });
}

/**
 * Create a line material
 * @param color Color string
 * @param options Material options
 * @returns THREE.LineBasicMaterial
 */
export function createLineMaterial(
  color: string,
  options: {
    linewidth?: number;
    transparent?: boolean;
    opacity?: number;
  } = {}
): THREE.LineBasicMaterial {
  const mainColor = new THREE.Color(color);

  return new THREE.LineBasicMaterial({
    color: mainColor,
    linewidth: options.linewidth || 1,
    transparent: options.transparent,
    opacity: options.opacity
  });
}

/**
 * Create a texture from a canvas
 * @param width Canvas width
 * @param height Canvas height
 * @param drawFunction Function to draw on the canvas
 * @returns THREE.Texture
 */
export function createCanvasTexture(
  width: number,
  height: number,
  drawFunction: (ctx: CanvasRenderingContext2D) => void
): THREE.Texture {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Get context
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw on canvas
  drawFunction(ctx);

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

/**
 * Create a particle texture
 * @param size Texture size
 * @param color Color string
 * @param options Particle options
 * @returns THREE.Texture
 */
export function createParticleTexture(
  size: number = 64,
  color: string,
  options: {
    glow?: boolean;
    glowColor?: string;
    glowSize?: number;
    shape?: 'circle' | 'square' | 'ring' | 'star';
  } = {}
): THREE.Texture {
  return createCanvasTexture(size, size, (ctx) => {
    const center = size / 2;
    const radius = size / 2 - 2;
    const threeColor = new THREE.Color(color);
    const mainColor = `rgb(${Math.floor(threeColor.r * 255)}, ${Math.floor(threeColor.g * 255)}, ${Math.floor(threeColor.b * 255)})`;

    // Draw glow if enabled
    if (options.glow && options.glowColor) {
      const threeGlowColor = new THREE.Color(options.glowColor);
      const glowColor = `rgb(${Math.floor(threeGlowColor.r * 255)}, ${Math.floor(threeGlowColor.g * 255)}, ${Math.floor(threeGlowColor.b * 255)})`;
      const glowSize = options.glowSize || 1.5;

      const gradient = ctx.createRadialGradient(
        center, center, 0,
        center, center, radius * glowSize
      );

      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(0.5, glowColor.replace('rgb', 'rgba').replace(')', ', 0.5)'));
      gradient.addColorStop(1, glowColor.replace('rgb', 'rgba').replace(')', ', 0)'));

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw shape
    ctx.fillStyle = mainColor;
    
    const shape = options.shape || 'circle';
    
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'square':
        ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);
        break;
        
      case 'ring':
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.arc(center, center, radius * 0.6, 0, Math.PI * 2, true);
        ctx.fill();
        break;
        
      case 'star':
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        const spikes = 5;
        
        ctx.beginPath();
        ctx.moveTo(center + outerRadius, center);
        
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? innerRadius : outerRadius;
          const angle = (Math.PI * 2 * i) / (spikes * 2);
          
          ctx.lineTo(
            center + r * Math.cos(angle),
            center + r * Math.sin(angle)
          );
        }
        
        ctx.closePath();
        ctx.fill();
        break;
    }
  });
}
