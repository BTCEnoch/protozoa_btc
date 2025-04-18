/**
 * Three.js Utilities for Bitcoin Protozoa
 *
 * This module provides utility functions for working with Three.js,
 * including conversions, optimizations, and helper functions.
 */

import * as THREE from 'three';
import { Vector3 } from '../types/common';
import { Color, ColorTheme } from '../types/core';

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
 * Convert a Color to a THREE.Color
 * @param color Color object
 * @returns THREE.Color
 */
export function toThreeColor(color: Color): THREE.Color {
  return new THREE.Color(color.r, color.g, color.b);
}

/**
 * Convert a ColorTheme to a THREE.Color
 * @param colorTheme ColorTheme object
 * @returns THREE.Color
 */
export function toThreeColorFromTheme(colorTheme: ColorTheme): THREE.Color {
  return new THREE.Color(colorTheme.primary);
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
 * @param colors Optional array of Color objects
 * @param sizes Optional array of point sizes
 * @returns THREE.BufferGeometry
 */
export function createPointCloudGeometry(
  positions: Vector3[],
  colors?: Color[],
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
      const color = toThreeColor(colors[i]);
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
 * Create a ribbon geometry from points
 * @param points Array of Vector3 objects
 * @param width Ribbon width
 * @param closed Whether the ribbon should be closed
 * @returns THREE.BufferGeometry
 */
export function createRibbonGeometry(
  points: Vector3[],
  width: number = 0.5,
  closed: boolean = false
): THREE.BufferGeometry {
  // Convert points to THREE.Vector3 array
  const threePoints = points.map(p => toThreeVector3(p));

  // Create curve
  const curve = new THREE.CatmullRomCurve3(threePoints, closed);
  const curvePoints = curve.getPoints(points.length * 10);

  // Create geometry
  const geometry = new THREE.BufferGeometry();
  const vertices: THREE.Vector3[] = [];
  const indices: number[] = [];

  // Calculate tangents and normals
  for (let i = 0; i < curvePoints.length; i++) {
    const point = curvePoints[i];

    // Calculate tangent
    const tangent = curve.getTangent(i / (curvePoints.length - 1));

    // Calculate normal (perpendicular to tangent)
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();

    // Create ribbon vertices
    vertices.push(
      new THREE.Vector3().copy(point).add(normal.clone().multiplyScalar(width / 2)),
      new THREE.Vector3().copy(point).add(normal.clone().multiplyScalar(-width / 2))
    );

    // Create indices for triangles
    if (i < curvePoints.length - 1) {
      const base = i * 2;
      indices.push(
        base, base + 1, base + 2,
        base + 1, base + 3, base + 2
      );
    }
  }

  // Convert vertices to Float32Array
  const vertexArray = new Float32Array(vertices.length * 3);

  for (let i = 0; i < vertices.length; i++) {
    vertexArray[i * 3] = vertices[i].x;
    vertexArray[i * 3 + 1] = vertices[i].y;
    vertexArray[i * 3 + 2] = vertices[i].z;
  }

  // Set position attribute
  geometry.setAttribute('position', new THREE.BufferAttribute(vertexArray, 3));

  // Set indices
  geometry.setIndex(indices);

  // Compute vertex normals
  geometry.computeVertexNormals();

  return geometry;
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
 * @param color Color object
 * @param options Material options
 * @returns THREE.MeshBasicMaterial
 */
export function createBasicMaterial(
  color: Color | ColorTheme,
  options: {
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
  } = {}
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: 'primary' in color ? color.primary : new THREE.Color(color.r, color.g, color.b),
    transparent: options.transparent,
    opacity: options.opacity,
    wireframe: options.wireframe
  });
}

/**
 * Create a standard material
 * @param color Color object
 * @param options Material options
 * @returns THREE.MeshStandardMaterial
 */
export function createStandardMaterial(
  color: Color | ColorTheme,
  options: {
    transparent?: boolean;
    opacity?: number;
    metalness?: number;
    roughness?: number;
    emissive?: boolean;
    emissiveColor?: Color | ColorTheme;
    emissiveIntensity?: number;
  } = {}
): THREE.MeshStandardMaterial {
  const mainColor = 'primary' in color ? color.primary : new THREE.Color(color.r, color.g, color.b);
  let emissiveColor;

  if (options.emissive && options.emissiveColor) {
    emissiveColor = 'primary' in options.emissiveColor
      ? options.emissiveColor.primary
      : new THREE.Color(options.emissiveColor.r, options.emissiveColor.g, options.emissiveColor.b);
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
 * @param color Color object
 * @param options Material options
 * @returns THREE.PointsMaterial
 */
export function createPointMaterial(
  color: Color | ColorTheme,
  options: {
    size?: number;
    sizeAttenuation?: boolean;
    transparent?: boolean;
    opacity?: number;
  } = {}
): THREE.PointsMaterial {
  const mainColor = 'primary' in color ? color.primary : new THREE.Color(color.r, color.g, color.b);

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
 * @param color Color object
 * @param options Material options
 * @returns THREE.LineBasicMaterial
 */
export function createLineMaterial(
  color: Color | ColorTheme,
  options: {
    linewidth?: number;
    transparent?: boolean;
    opacity?: number;
  } = {}
): THREE.LineBasicMaterial {
  const mainColor = 'primary' in color ? color.primary : new THREE.Color(color.r, color.g, color.b);

  return new THREE.LineBasicMaterial({
    color: mainColor,
    linewidth: options.linewidth || 1,
    transparent: options.transparent,
    opacity: options.opacity
  });
}

/**
 * Create a sprite material
 * @param color Color object
 * @param options Material options
 * @returns THREE.SpriteMaterial
 */
export function createSpriteMaterial(
  color: Color | ColorTheme,
  options: {
    map?: THREE.Texture;
    transparent?: boolean;
    opacity?: number;
  } = {}
): THREE.SpriteMaterial {
  const mainColor = 'primary' in color ? color.primary : new THREE.Color(color.r, color.g, color.b);

  return new THREE.SpriteMaterial({
    color: mainColor,
    map: options.map,
    transparent: options.transparent !== undefined ? options.transparent : true,
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
 * @param color Color object
 * @param options Particle options
 * @returns THREE.Texture
 */
export function createParticleTexture(
  size: number = 64,
  color: Color | ColorTheme,
  options: {
    glow?: boolean;
    glowColor?: Color | ColorTheme;
    glowSize?: number;
    shape?: 'circle' | 'square' | 'ring' | 'star';
  } = {}
): THREE.Texture {
  return createCanvasTexture(size, size, (ctx) => {
    const center = size / 2;
    const radius = size / 2 - 2;

    const mainColor = 'primary' in color ? color.primary : `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;

    // Draw glow if enabled
    if (options.glow && options.glowColor) {
      let glowColor;

      if ('primary' in options.glowColor) {
        glowColor = options.glowColor.primary;
      } else {
        glowColor = `rgb(${options.glowColor.r * 255}, ${options.glowColor.g * 255}, ${options.glowColor.b * 255})`;
      }

      const glowSize = options.glowSize || 1.5;

      const gradient = ctx.createRadialGradient(
        center, center, 0,
        center, center, radius * glowSize
      );

      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw shape
    ctx.fillStyle = mainColor;

    switch (options.shape) {
      case 'square':
        ctx.fillRect(center - radius / 2, center - radius / 2, radius, radius);
        break;

      case 'ring':
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.arc(center, center, radius * 0.6, 0, Math.PI * 2, true);
        ctx.fill();
        break;

      case 'star':
        ctx.beginPath();
        const points = 5;
        const innerRadius = radius * 0.4;

        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? radius : innerRadius;
          const angle = (i / (points * 2)) * Math.PI * 2;

          const x = center + r * Math.sin(angle);
          const y = center + r * Math.cos(angle);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.fill();
        break;

      case 'circle':
      default:
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  });
}

/**
 * Create a trail texture
 * @param width Texture width
 * @param height Texture height
 * @param color Color object
 * @param options Trail options
 * @returns THREE.Texture
 */
export function createTrailTexture(
  width: number = 64,
  height: number = 256,
  color: Color,
  options: {
    fade?: boolean;
    fadeDirection?: 'horizontal' | 'vertical';
    pattern?: 'solid' | 'dashed' | 'dotted';
  } = {}
): THREE.Texture {
  return createCanvasTexture(width, height, (ctx) => {
    // Create gradient if fade is enabled
    if (options.fade) {
      const gradient = options.fadeDirection === 'horizontal'
        ? ctx.createLinearGradient(0, 0, width, 0)
        : ctx.createLinearGradient(0, 0, 0, height);

      const mainColor: string = 'primary' in color ? color.primary as string : `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
      gradient.addColorStop(0, mainColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
    } else {
      const mainColor: string = 'primary' in color ? color.primary as string : `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
      ctx.fillStyle = mainColor;
    }

    // Draw pattern
    switch (options.pattern) {
      case 'dashed':
        const dashHeight = height / 10;

        for (let y = 0; y < height; y += dashHeight * 2) {
          ctx.fillRect(0, y, width, dashHeight);
        }
        break;

      case 'dotted':
        const dotSize = width / 2;
        const dotSpacing = height / 8;

        for (let y = dotSize; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(width / 2, y, dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'solid':
      default:
        ctx.fillRect(0, 0, width, height);
        break;
    }
  });
}

/**
 * Dispose of a Three.js object
 * @param object Object to dispose
 */
export function disposeObject(object: THREE.Object3D): void {
  // Dispose of geometry
  if ((object as any).geometry) {
    (object as any).geometry.dispose();
  }

  // Dispose of material
  if ((object as any).material) {
    if (Array.isArray((object as any).material)) {
      (object as any).material.forEach((material: THREE.Material) => {
        disposeMaterial(material);
      });
    } else {
      disposeMaterial((object as any).material);
    }
  }

  // Dispose of children
  while (object.children.length > 0) {
    disposeObject(object.children[0]);
    object.remove(object.children[0]);
  }
}

/**
 * Dispose of a Three.js material
 * @param material Material to dispose
 */
export function disposeMaterial(material: THREE.Material): void {
  // Dispose of textures
  for (const key in material) {
    const value = (material as any)[key];

    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }

  // Dispose of material
  material.dispose();
}
