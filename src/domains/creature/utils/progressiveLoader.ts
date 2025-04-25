/**
 * Progressive Loader for Bitcoin Protozoa
 *
 * This utility manages the progressive loading of creatures,
 * prioritizing creatures based on distance from camera and importance.
 */

import * as THREE from 'three';
import { Creature, LoadingStage } from '../types/creature';
import { Vector3 } from '../../../shared/types/common';
import { Logging } from '../../../shared/utils';

/**
 * Loading priority options
 */
export interface LoadingPriorityOptions {
  distanceWeight: number;
  importanceWeight: number;
  ageWeight: number;
  visibilityWeight: number;
}

/**
 * Progressive loading options
 */
export interface ProgressiveLoadingOptions {
  maxConcurrentLoads: number;
  loadingInterval: number;
  priorityOptions: LoadingPriorityOptions;
  distanceThresholds: {
    near: number;
    medium: number;
    far: number;
  };
}

/**
 * Default progressive loading options
 */
const DEFAULT_LOADING_OPTIONS: ProgressiveLoadingOptions = {
  maxConcurrentLoads: 5,
  loadingInterval: 100, // ms
  priorityOptions: {
    distanceWeight: 0.5,
    importanceWeight: 0.2,
    ageWeight: 0.1,
    visibilityWeight: 0.2
  },
  distanceThresholds: {
    near: 50,
    medium: 150,
    far: 300
  }
};

/**
 * Progressive Loader class
 * Manages the progressive loading of creatures
 */
export class ProgressiveLoader {
  private options: ProgressiveLoadingOptions;
  private loadQueue: Creature[] = [];
  private loadingInProgress: boolean = false;
  private camera: THREE.Camera | null = null;
  private frustum: any = null;
  private projScreenMatrix: any = null;
  private logger = Logging.createLogger('ProgressiveLoader');

  /**
   * Constructor
   * @param options Progressive loading options
   */
  constructor(options: Partial<ProgressiveLoadingOptions> = {}) {
    this.options = {
      ...DEFAULT_LOADING_OPTIONS,
      ...options,
      priorityOptions: {
        ...DEFAULT_LOADING_OPTIONS.priorityOptions,
        ...options.priorityOptions
      },
      distanceThresholds: {
        ...DEFAULT_LOADING_OPTIONS.distanceThresholds,
        ...options.distanceThresholds
      }
    };

    // Initialize THREE objects with try-catch to handle missing constructors
    try {
      this.frustum = new THREE.Frustum();
      this.projScreenMatrix = new THREE.Matrix4();
    } catch (error) {
      this.logger.warn('Failed to create THREE.Frustum or THREE.Matrix4, using mock objects', error);
      // Create mock objects
      this.frustum = {
        setFromProjectionMatrix: () => {},
        containsPoint: () => true
      };
      this.projScreenMatrix = {
        multiplyMatrices: () => {}
      };
    }

    this.logger.info('Progressive Loader initialized');
  }

  /**
   * Set camera for distance calculations
   * @param camera THREE.Camera to use for distance calculations
   */
  public setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  /**
   * Add creatures to the loading queue
   * @param creatures Creatures to add to the queue
   */
  public queueCreatures(creatures: Creature[]): void {
    // Filter out creatures that are already fully loaded
    const newCreatures = creatures.filter(
      creature => !creature.loadingStage || creature.loadingStage !== LoadingStage.COMPLETE
    );

    if (newCreatures.length === 0) {
      return;
    }

    // Add creatures to the queue
    this.loadQueue.push(...newCreatures);
    this.logger.debug(`Added ${newCreatures.length} creatures to the loading queue`);

    // Update priorities
    this.updatePriorities();

    // Start loading if not already in progress
    if (!this.loadingInProgress) {
      this.processQueue();
    }
  }

  /**
   * Update loading priorities for all creatures in the queue
   */
  private updatePriorities(): void {
    if (!this.camera) {
      this.logger.warn('No camera set for distance calculations');
      return;
    }

    // Update frustum for visibility checks
    if (this.projScreenMatrix && typeof this.projScreenMatrix.multiplyMatrices === 'function') {
      try {
        this.projScreenMatrix.multiplyMatrices(
          this.camera.projectionMatrix,
          this.camera.matrixWorldInverse
        );

        if (this.frustum && typeof this.frustum.setFromProjectionMatrix === 'function') {
          this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
        }
      } catch (error) {
        this.logger.warn('Error updating frustum', error);
      }
    }

    // Get camera position
    let cameraPosition;
    try {
      cameraPosition = new THREE.Vector3();
      this.camera.getWorldPosition(cameraPosition);
    } catch (error) {
      this.logger.warn('Error getting camera position, using default', error);
      cameraPosition = { x: 0, y: 0, z: 0, distanceTo: () => 0 };
    }

    // Update priorities for all creatures in the queue
    for (const creature of this.loadQueue) {
      // Calculate distance from camera if not already set
      if (creature.distanceFromCamera === undefined) {
        // For now, we'll use a simple distance calculation
        // In a real implementation, we would use the creature's position
        // This is a placeholder until we have actual creature positions
        let creaturePosition;
        try {
          creaturePosition = new THREE.Vector3(0, 0, 0);
          creature.distanceFromCamera = creaturePosition.distanceTo(cameraPosition);
        } catch (error) {
          this.logger.warn('Error creating Vector3, using default distance', error);
          creature.distanceFromCamera = 0;
        }
      }

      // Calculate distance priority (closer = higher priority)
      const distancePriority = this.calculateDistancePriority(creature.distanceFromCamera);

      // Calculate importance priority (more important = higher priority)
      // This is a placeholder until we have actual creature importance
      const importancePriority = 0.5;

      // Calculate age priority (newer = higher priority)
      const agePriority = this.calculateAgePriority(creature.createdAt);

      // Calculate visibility priority (visible = higher priority)
      // This is a placeholder until we have actual creature positions
      const visibilityPriority = 1.0;

      // Calculate overall priority
      creature.loadingPriority = (
        distancePriority * this.options.priorityOptions.distanceWeight +
        importancePriority * this.options.priorityOptions.importanceWeight +
        agePriority * this.options.priorityOptions.ageWeight +
        visibilityPriority * this.options.priorityOptions.visibilityWeight
      );
    }

    // Sort the queue by priority (higher priority first)
    this.loadQueue.sort((a, b) => (b.loadingPriority || 0) - (a.loadingPriority || 0));
  }

  /**
   * Calculate distance priority
   * @param distance Distance from camera
   * @returns Priority value (0-1, higher = higher priority)
   */
  private calculateDistancePriority(distance: number): number {
    if (distance <= this.options.distanceThresholds.near) {
      return 1.0;
    } else if (distance <= this.options.distanceThresholds.medium) {
      return 0.7;
    } else if (distance <= this.options.distanceThresholds.far) {
      return 0.3;
    } else {
      return 0.1;
    }
  }

  /**
   * Calculate age priority
   * @param createdAt Creation timestamp
   * @returns Priority value (0-1, higher = higher priority)
   */
  private calculateAgePriority(createdAt: number): number {
    const age = Date.now() - createdAt;
    const maxAge = 1000 * 60 * 60; // 1 hour
    return Math.max(0, 1 - age / maxAge);
  }

  /**
   * Process the loading queue
   */
  private async processQueue(): Promise<void> {
    if (this.loadQueue.length === 0) {
      this.loadingInProgress = false;
      return;
    }

    this.loadingInProgress = true;

    // Get the next batch of creatures to load
    const batch = this.loadQueue.slice(0, this.options.maxConcurrentLoads);

    // Remove the batch from the queue
    this.loadQueue = this.loadQueue.slice(this.options.maxConcurrentLoads);

    // Load each creature in the batch
    const loadPromises = batch.map(creature => this.loadCreature(creature));

    // Wait for all loads to complete
    await Promise.all(loadPromises);

    // Schedule the next batch
    setTimeout(() => this.processQueue(), this.options.loadingInterval);
  }

  /**
   * Load a creature progressively
   * @param creature Creature to load
   */
  private async loadCreature(creature: Creature): Promise<void> {
    try {
      // Determine the next loading stage
      const currentStage = creature.loadingStage || LoadingStage.NONE;
      let nextStage: LoadingStage;

      switch (currentStage) {
        case LoadingStage.NONE:
          nextStage = LoadingStage.BASIC;
          break;
        case LoadingStage.BASIC:
          nextStage = LoadingStage.DETAILED;
          break;
        case LoadingStage.DETAILED:
          nextStage = LoadingStage.COMPLETE;
          break;
        default:
          return; // Already complete
      }

      // Load the next stage
      await this.loadCreatureStage(creature, nextStage);

      // Update the creature's loading stage
      creature.loadingStage = nextStage;
      creature.lastUpdatedAt = Date.now();

      this.logger.debug(`Loaded creature ${creature.id} to stage ${nextStage}`);

      // If not complete, add back to the queue
      if (nextStage !== LoadingStage.COMPLETE) {
        this.loadQueue.push(creature);
      }
    } catch (error) {
      this.logger.error(`Error loading creature ${creature.id}:`, error);
      // Add back to the queue to retry
      this.loadQueue.push(creature);
    }
  }

  /**
   * Load a specific stage for a creature
   * @param creature Creature to load
   * @param stage Loading stage to load
   */
  private async loadCreatureStage(creature: Creature, stage: LoadingStage): Promise<void> {
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real implementation, we would load the actual data for each stage
    // This is a placeholder for the actual loading logic
    switch (stage) {
      case LoadingStage.BASIC:
        // Load basic data (position, type, etc.)
        break;
      case LoadingStage.DETAILED:
        // Load detailed attributes (traits, particles, etc.)
        break;
      case LoadingStage.COMPLETE:
        // Load any remaining data
        break;
    }
  }

  /**
   * Check if a creature is visible to the camera
   * @param position Creature position
   * @returns True if visible, false otherwise
   *
   * Note: This method is currently unused but will be used when we implement
   * visibility-based loading prioritization.
   */
  private isVisible(position: Vector3): boolean {
    if (!this.camera || !this.frustum) {
      return true;
    }

    try {
      const pos = new THREE.Vector3(position.x, position.y, position.z);
      return this.frustum.containsPoint(pos);
    } catch (error) {
      this.logger.warn('Error checking visibility, assuming visible', error);
      return true;
    }
  }

  /**
   * Get the current loading queue
   * @returns Array of creatures in the loading queue
   */
  public getLoadQueue(): Creature[] {
    return [...this.loadQueue];
  }

  /**
   * Clear the loading queue
   */
  public clearQueue(): void {
    this.loadQueue = [];
    this.loadingInProgress = false;
    this.logger.info('Loading queue cleared');
  }

  /**
   * Get loading statistics
   * @returns Loading statistics
   */
  public getStats(): any {
    return {
      queueLength: this.loadQueue.length,
      loadingInProgress: this.loadingInProgress,
      stageStats: this.getStageStats()
    };
  }

  /**
   * Get statistics about loading stages
   * @returns Stage statistics
   */
  private getStageStats(): Record<LoadingStage, number> {
    const stats: Record<LoadingStage, number> = {
      [LoadingStage.NONE]: 0,
      [LoadingStage.BASIC]: 0,
      [LoadingStage.DETAILED]: 0,
      [LoadingStage.COMPLETE]: 0
    };

    for (const creature of this.loadQueue) {
      const stage = creature.loadingStage || LoadingStage.NONE;
      stats[stage]++;
    }

    return stats;
  }
}

// Singleton instance
let instance: ProgressiveLoader | null = null;

/**
 * Get the progressive loader instance
 * @returns ProgressiveLoader instance
 */
export function getProgressiveLoader(): ProgressiveLoader {
  if (!instance) {
    instance = new ProgressiveLoader();
  }
  return instance;
}
