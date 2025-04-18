/**
 * LOD Manager for Bitcoin Protozoa
 *
 * This service manages Level of Detail (LOD) for particles, optimizing
 * rendering performance by reducing detail for distant particles.
 */

import * as THREE from 'three';
import { Vector3 } from '../../../shared/types/common';
import { LODConfig, LODLevel } from '../types/rendering';
import { Logging } from '../../../shared/utils';

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
  { 
    distance: 10, 
    scale: 1.0, 
    detail: 1.0 
  },
  { 
    distance: 25, 
    scale: 0.8, 
    detail: 0.8 
  },
  { 
    distance: 50, 
    scale: 0.6, 
    detail: 0.6 
  },
  { 
    distance: 100, 
    scale: 0.4, 
    detail: 0.4 
  },
  { 
    distance: 200, 
    scale: 0.2, 
    detail: 0.2 
  }
];

// Singleton instance
let instance: LODManager | null = null;

/**
 * LOD Manager class
 * Manages Level of Detail for particles
 */
export class LODManager {
  private camera: THREE.Camera | null = null;
  private lodLevels: LODLevel[] = DEFAULT_LOD_LEVELS;
  private frustumCulling: boolean = true;
  private frustum: THREE.Frustum = new THREE.Frustum();
  private projScreenMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private initialized: boolean = false;
  private config: any = null;
  private logger = Logging.createLogger('LODManager');

  /**
   * Initialize the LOD manager
   * @param camera THREE.Camera to use for LOD calculations
   */
  public async initialize(camera: THREE.Camera): Promise<void> {
    if (this.initialized) {
      this.logger.warn('LOD Manager already initialized');
      return;
    }

    this.camera = camera;

    // Load configuration
    await this.loadConfig();

    this.initialized = true;
    this.logger.info('LOD Manager initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/rendering.json');
      this.config = await response.json();

      if (this.config.lod && Array.isArray(this.config.lod.levels)) {
        this.lodLevels = this.config.lod.levels.map((level: any) => ({
          distance: level.distance,
          scale: level.scale || level.detail,
          detail: level.detail
        }));

        this.frustumCulling = this.config.lod.frustumCulled !== undefined ?
          this.config.lod.frustumCulled : true;

        this.logger.info(`Loaded ${this.lodLevels.length} LOD levels from configuration`);
      }
    } catch (error) {
      this.logger.error('Failed to load LOD configuration:', error);
      this.logger.warn('Using default LOD levels');
    }
  }

  /**
   * Check if the manager is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Set LOD levels
   * @param levels Array of LOD levels
   */
  public setLODLevels(levels: LODLevel[]): void {
    this.lodLevels = levels;
    this.logger.debug(`Set ${levels.length} LOD levels`);
  }

  /**
   * Enable or disable frustum culling
   * @param enabled Whether frustum culling is enabled
   */
  public setFrustumCulling(enabled: boolean): void {
    this.frustumCulling = enabled;
    this.logger.debug(`Frustum culling ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Apply LOD to particle scales
   * @param positions Array of particle positions
   * @param scales Array of particle scales to modify
   * @param camera Camera to use for LOD calculations
   */
  public applyLOD(positions: Vector3[], scales: number[], camera: THREE.Camera): void {
    if (!this.initialized) {
      this.logger.warn('LOD Manager not initialized');
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
      let detailLevel = this.lodLevels[this.lodLevels.length - 1].scale;

      for (const level of this.lodLevels) {
        if (distance <= level.distance) {
          detailLevel = level.scale;
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
      this.logger.warn('LOD Manager not initialized');
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
    if (!this.initialized) {
      this.logger.warn('LOD Manager not initialized');
      return {
        detailLevel: 1.0,
        geometryDetail: 'medium',
        textureDetail: 'medium',
        effectsEnabled: true
      };
    }

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

  /**
   * Get the current LOD configuration
   * @returns LOD configuration
   */
  public getLODConfig(): LODConfig {
    return {
      levels: this.lodLevels,
      fadeTransitions: this.config?.lod?.fadeTransition || false,
      transitionDuration: this.config?.lod?.transitionDuration || 0
    };
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.camera = null;
    this.initialized = false;
    this.logger.info('LOD Manager disposed');
  }
}

/**
 * Get the LOD manager instance
 * @returns LODManager instance
 */
export function getLODManager(): LODManager {
  if (!instance) {
    instance = new LODManager();
  }
  return instance;
}
