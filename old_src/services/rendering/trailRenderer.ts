/**
 * Trail Renderer for Bitcoin Protozoa
 *
 * This service manages particle trails, creating visual effects
 * that follow particles as they move.
 */

import * as THREE from 'three';
import { Role } from '../../types/core';
import { Vector3 } from '../../types/common';
import { getShaderManager } from './shaderManager';

// Singleton instance
let instance: TrailRenderer | null = null;

/**
 * Trail Renderer class
 */
class TrailRenderer {
  private scene: THREE.Scene | null = null;
  private trailMeshes: Map<string, THREE.LineSegments> = new Map();
  private trailGeometries: Map<string, THREE.BufferGeometry> = new Map();
  private trailMaterials: Map<string, THREE.Material> = new Map();
  private trailData: Map<string, {
    positions: Float32Array;
    colors: Float32Array;
    indices: Uint16Array;
    lastPositions: Vector3[];
    maxPoints: number;
    pointsPerParticle: number;
    currentIndex: number;
  }> = new Map();
  private initialized: boolean = false;
  private config: any = null;

  /**
   * Initialize the trail renderer
   * @param scene THREE.js scene
   */
  initialize(scene: THREE.Scene): void {
    if (!scene) {
      throw new Error('Scene cannot be null');
    }
    this.scene = scene;
    this.initialized = true;

    // Load configuration
    this.loadConfig();

    console.log('Trail Renderer initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/rendering.json');
      this.config = await response.json();
      console.log('Loaded rendering configuration for trails');
    } catch (error) {
      console.error('Failed to load rendering configuration for trails:', error);
      // Use default configuration
      this.config = {
        trails: {
          enabled: true,
          maxPoints: 100,
          fadeTime: 2.0,
          minDistance: 0.1,
          width: 0.1
        }
      };
    }
  }

  /**
   * Check if the renderer is initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a trail for a particle group
   * @param id Trail ID
   * @param role Particle role
   * @param particleCount Number of particles
   * @param options Trail options
   */
  createTrail(
    id: string,
    role: Role,
    particleCount: number,
    options?: {
      maxPoints?: number;
      pointsPerParticle?: number;
      width?: number;
      color?: string;
      fadeTime?: number;
    }
  ): void {
    if (!this.scene || !this.initialized) {
      return;
    }

    // Remove existing trail if it exists
    if (this.trailMeshes.has(id)) {
      this.removeTrail(id);
    }

    // Get options from config or parameters
    const maxPoints = options?.maxPoints || this.config?.trails?.maxPoints || 100;
    const pointsPerParticle = options?.pointsPerParticle || 10;
    const width = options?.width || this.config?.trails?.width || 0.1;
    const color = options?.color || this.getRoleColor(role);

    // Calculate total points and segments
    const totalPoints = particleCount * pointsPerParticle;
    const totalIndices = particleCount * (pointsPerParticle - 1) * 2;

    // Create geometry
    const geometry = new THREE.BufferGeometry();

    // Create position buffer (xyz for each point)
    const positions = new Float32Array(totalPoints * 3);

    // Create color buffer (rgb for each point)
    const colors = new Float32Array(totalPoints * 3);

    // Create index buffer (pairs of point indices for line segments)
    const indices = new Uint16Array(totalIndices);

    // Initialize positions and colors
    for (let i = 0; i < totalPoints; i++) {
      // Set initial positions to origin
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Set initial colors to transparent
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0;
      colors[i * 3 + 2] = 0;
    }

    // Initialize indices for line segments
    let indexOffset = 0;
    for (let i = 0; i < particleCount; i++) {
      const baseIndex = i * pointsPerParticle;
      for (let j = 0; j < pointsPerParticle - 1; j++) {
        indices[indexOffset++] = baseIndex + j;
        indices[indexOffset++] = baseIndex + j + 1;
      }
    }

    // Set attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    // Create material
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      linewidth: width,
      opacity: 0.7
    });

    // Create mesh
    const mesh = new THREE.LineSegments(geometry, material);

    // Add to scene
    this.scene.add(mesh);

    // Store trail data
    this.trailMeshes.set(id, mesh);
    this.trailGeometries.set(id, geometry);
    this.trailMaterials.set(id, material);
    this.trailData.set(id, {
      positions,
      colors,
      indices,
      lastPositions: new Array(particleCount).fill(null),
      maxPoints,
      pointsPerParticle,
      currentIndex: 0
    });

    console.log(`Created trail for ${id} with ${particleCount} particles`);
  }

  /**
   * Check if a trail exists
   * @param id Trail ID
   * @returns True if the trail exists, false otherwise
   */
  hasTrail(id: string): boolean {
    return this.trailMeshes.has(id);
  }

  /**
   * Remove a trail
   * @param id Trail ID
   */
  removeTrail(id: string): void {
    if (!this.scene) {
      return;
    }

    // Get trail mesh
    const mesh = this.trailMeshes.get(id);
    if (!mesh) {
      return;
    }

    // Remove from scene
    this.scene.remove(mesh);

    // Dispose resources
    const geometry = this.trailGeometries.get(id);
    if (geometry) {
      geometry.dispose();
      this.trailGeometries.delete(id);
    }

    const material = this.trailMaterials.get(id);
    if (material) {
      material.dispose();
      this.trailMaterials.delete(id);
    }

    // Remove from maps
    this.trailMeshes.delete(id);
    this.trailData.delete(id);
  }

  /**
   * Update a trail with new particle positions
   * @param id Trail ID
   * @param positions Particle positions
   * @param velocities Particle velocities
   * @param deltaTime Time since last update
   */
  updateTrail(
    id: string,
    positions: Vector3[],
    velocities?: Vector3[],
    deltaTime: number = 1/60
  ): void {
    if (!this.initialized) {
      return;
    }

    // Get trail data
    const trailData = this.trailData.get(id);
    if (!trailData) {
      return;
    }

    // Get trail mesh
    const mesh = this.trailMeshes.get(id);
    if (!mesh) {
      return;
    }

    // Get minimum distance from config
    const minDistance = this.config?.trails?.minDistance || 0.1;

    // Update trail positions
    const particleCount = positions.length;
    const pointsPerParticle = trailData.pointsPerParticle;

    // For each particle
    for (let i = 0; i < particleCount; i++) {
      const position = positions[i];
      const lastPosition = trailData.lastPositions[i];

      // Skip if position is undefined
      if (!position) {
        continue;
      }

      // If this is the first position, initialize last position
      if (!lastPosition) {
        trailData.lastPositions[i] = { ...position };
        continue;
      }

      // Calculate distance from last position
      const dx = position.x - lastPosition.x;
      const dy = position.y - lastPosition.y;
      const dz = position.z - lastPosition.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Skip if distance is too small
      if (distance < minDistance) {
        continue;
      }

      // Update last position
      trailData.lastPositions[i] = { ...position };

      // Calculate base index for this particle
      const baseIndex = i * pointsPerParticle;

      // Shift positions back
      for (let j = pointsPerParticle - 1; j > 0; j--) {
        const currentIndex = baseIndex + j;
        const prevIndex = baseIndex + j - 1;

        // Copy position
        trailData.positions[currentIndex * 3] = trailData.positions[prevIndex * 3];
        trailData.positions[currentIndex * 3 + 1] = trailData.positions[prevIndex * 3 + 1];
        trailData.positions[currentIndex * 3 + 2] = trailData.positions[prevIndex * 3 + 2];

        // Fade color
        const fade = 1.0 - (j / pointsPerParticle);
        trailData.colors[currentIndex * 3] *= fade;
        trailData.colors[currentIndex * 3 + 1] *= fade;
        trailData.colors[currentIndex * 3 + 2] *= fade;
      }

      // Set new position at the front
      trailData.positions[baseIndex * 3] = position.x;
      trailData.positions[baseIndex * 3 + 1] = position.y;
      trailData.positions[baseIndex * 3 + 2] = position.z;

      // Set new color at the front (full opacity)
      const threeColor = new THREE.Color(this.getRoleColor(id.split('-')[1] as Role));
      trailData.colors[baseIndex * 3] = threeColor.r;
      trailData.colors[baseIndex * 3 + 1] = threeColor.g;
      trailData.colors[baseIndex * 3 + 2] = threeColor.b;
    }

    // Update geometry attributes
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute;

    positionAttribute.array = trailData.positions;
    colorAttribute.array = trailData.colors;

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  }

  /**
   * Clear all trails
   */
  clearTrails(): void {
    if (!this.scene) {
      return;
    }

    // Remove all trail meshes from scene
    for (const mesh of this.trailMeshes.values()) {
      this.scene.remove(mesh);
    }

    // Dispose all geometries
    for (const geometry of this.trailGeometries.values()) {
      geometry.dispose();
    }

    // Dispose all materials
    for (const material of this.trailMaterials.values()) {
      material.dispose();
    }

    // Clear maps
    this.trailMeshes.clear();
    this.trailGeometries.clear();
    this.trailMaterials.clear();
    this.trailData.clear();
  }

  /**
   * Get role color
   * @param role Particle role
   * @returns Color string
   */
  private getRoleColor(role: Role): string {
    // Get color from config
    const roleColors = this.config?.roleColors;
    if (roleColors && roleColors[role]) {
      return roleColors[role];
    }

    // Default colors
    const defaultColors: Record<Role, string> = {
      CORE: '#00FFFF',
      CONTROL: '#FF00FF',
      MOVEMENT: '#FFFF00',
      DEFENSE: '#00FF00',
      ATTACK: '#FF0000'
    };

    return defaultColors[role] || '#FFFFFF';
  }

  /**
   * Dispose of all resources
   */
  disposeAll(): void {
    // Clear all trails
    this.clearTrails();

    // Reset state
    this.scene = null;
    this.initialized = false;
    this.config = null;

    console.log('Trail Renderer disposed');
  }
}

/**
 * Get the trail renderer instance
 * @returns The trail renderer instance
 */
export function getTrailRenderer(): TrailRenderer {
  if (!instance) {
    instance = new TrailRenderer();
  }
  return instance;
}
