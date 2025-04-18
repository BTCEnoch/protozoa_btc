/**
 * LOD Manager for Bitcoin Protozoa
 *
 * This service manages Level of Detail (LOD) for particles, optimizing
 * rendering performance by reducing detail for distant particles.
 */

import * as THREE from 'three';
import { Vector3 } from '../../types/common';

/**
 * LOD Level interface
 * Defines a level of detail based on distance
 */
interface LODLevel {
  distance: number;
  detail: number;
}

/**
 * LOD Settings interface
 * Defines settings for a specific LOD level
 */
interface LODSettings {
  detailLevel: number;
  geometryDetail: 'high' | 'medium' | 'low';
  textureDetail: 'high' | 'medium' | 'low';
  effectsEnabled: boolean;
}

// Default LOD levels
const DEFAULT_LOD_LEVELS: LODLevel[] = [
  { distance: 10, detail: 1.0 },
  { distance: 25, detail: 0.8 },
  { distance: 50, detail: 0.6 },
  { distance: 100, detail: 0.4 },
  { distance: 200, detail: 0.2 }
];

/**
 * LOD Manager class
 * Manages Level of Detail for particles
 */
class LODManager {
  private camera: THREE.Camera | null = null;
  private lodLevels: LODLevel[] = DEFAULT_LOD_LEVELS;
  private frustumCulling: boolean = true;
  private frustum: THREE.Frustum = new THREE.Frustum();
  private projScreenMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private initialized: boolean = false;

  /**
   * Initialize the LOD manager
   * @param camera THREE.Camera to use for LOD calculations
   */
  public async initialize(camera: THREE.Camera): Promise<void> {
    this.camera = camera;

    // Load configuration
    await this.loadConfig();

    this.initialized = true;
    console.log('LOD Manager initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/rendering.json');
      const config = await response.json();

      if (config.lod && Array.isArray(config.lod.levels)) {
        this.lodLevels = config.lod.levels.map((level: any) => ({
          distance: level.distance,
          detail: level.detail
        }));

        this.frustumCulling = config.lod.frustumCulling !== undefined ?
          config.lod.frustumCulling : true;

        console.log(`Loaded ${this.lodLevels.length} LOD levels from configuration`);
      }
    } catch (error) {
      console.error('Failed to load LOD configuration:', error);
      console.warn('Using default LOD levels');
    }
  }

  /**
   * Set LOD levels
   * @param levels Array of LOD levels
   */
  public setLODLevels(levels: LODLevel[]): void {
    this.lodLevels = levels;
  }

  /**
   * Enable or disable frustum culling
   * @param enabled Whether frustum culling is enabled
   */
  public setFrustumCulling(enabled: boolean): void {
    this.frustumCulling = enabled;
  }

  /**
   * Apply LOD to particle scales
   * @param positions Array of particle positions
   * @param scales Array of particle scales to modify
   * @param camera Camera to use for LOD calculations
   */
  public applyLOD(positions: Vector3[], scales: number[], camera: THREE.Camera): void {
    if (!this.initialized) {
      return;
    }

    // Update frustum for culling
    if (this.frustumCulling) {
      this.projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
    }

    // Get camera position
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);

    // Apply LOD to each particle
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];

      // Skip if position is undefined
      if (!position) {
        continue;
      }

      // Create THREE.Vector3 for calculations
      const particlePosition = new THREE.Vector3(position.x, position.y, position.z);

      // Check if particle is in frustum
      if (this.frustumCulling && !this.frustum.containsPoint(particlePosition)) {
        scales[i] = 0; // Hide particle if outside frustum
        continue;
      }

      // Calculate distance to camera
      const distance = particlePosition.distanceTo(cameraPosition);

      // Find appropriate LOD level
      let detailLevel = this.lodLevels[this.lodLevels.length - 1].detail;

      for (const level of this.lodLevels) {
        if (distance <= level.distance) {
          detailLevel = level.detail;
          break;
        }
      }

      // Apply detail level to scale
      scales[i] *= detailLevel;
    }
  }

  /**
   * Calculate visible particles
   * @param positions Array of particle positions
   * @param camera Camera to use for visibility calculations
   * @returns Array of visible particle indices
   */
  public getVisibleParticles(positions: Vector3[], camera: THREE.Camera): number[] {
    if (!this.initialized) {
      return [];
    }

    const visibleIndices: number[] = [];

    // Update frustum for culling
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

    // Check each particle
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];

      // Skip if position is undefined
      if (!position) {
        continue;
      }

      // Create THREE.Vector3 for calculations
      const particlePosition = new THREE.Vector3(position.x, position.y, position.z);

      // Check if particle is in frustum
      if (this.frustum.containsPoint(particlePosition)) {
        visibleIndices.push(i);
      }
    }

    return visibleIndices;
  }

  /**
   * Get LOD settings for a distance
   * @param distance Distance from camera
   * @returns LOD settings for the distance
   */
  public getLODForDistance(distance: number): LODSettings {
    // Find appropriate LOD level
    let detailLevel = this.lodLevels[this.lodLevels.length - 1].detail;
    let geometryDetail = 'low';
    let textureDetail = 'low';
    let effectsEnabled = false;

    for (const level of this.lodLevels) {
      if (distance <= level.distance) {
        detailLevel = level.detail;

        // Set geometry detail based on distance
        if (distance <= 25) {
          geometryDetail = 'high';
          textureDetail = 'high';
          effectsEnabled = true;
        } else if (distance <= 50) {
          geometryDetail = 'medium';
          textureDetail = 'medium';
          effectsEnabled = true;
        } else if (distance <= 100) {
          geometryDetail = 'low';
          textureDetail = 'low';
          effectsEnabled = false;
        }

        break;
      }
    }

    return {
      detailLevel,
      geometryDetail: geometryDetail as 'high' | 'medium' | 'low',
      textureDetail: textureDetail as 'high' | 'medium' | 'low',
      effectsEnabled
    };
  }
}

// Singleton instance
let lodManagerInstance: LODManager | null = null;

/**
 * Get the LOD manager instance
 * @returns LODManager instance
 */
export function getLODManager(): LODManager {
  if (!lodManagerInstance) {
    lodManagerInstance = new LODManager();
  }

  return lodManagerInstance;
}
