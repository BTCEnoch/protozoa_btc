/**
 * Frustum Culling Utility
 *
 * This utility provides advanced frustum culling capabilities beyond
 * the built-in Three.js frustum culling.
 */

import * as THREE from 'three';
import { Logging } from '../../../shared/utils';
import { Vector3 } from '../../../shared/types/common';

// Singleton instance
let instance: FrustumCullingService | null = null;

/**
 * Frustum Culling Service
 * Provides advanced frustum culling capabilities
 */
export class FrustumCullingService {
  private frustum: THREE.Frustum = new THREE.Frustum();
  private projScreenMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private initialized: boolean = false;
  private camera: THREE.Camera | null = null;
  private cullingEnabled: boolean = true;
  private cullingStatistics = {
    totalObjects: 0,
    culledObjects: 0,
    lastUpdateTime: 0
  };
  private logger = Logging.createLogger('FrustumCullingService');

  /**
   * Initialize the frustum culling service
   * @param camera The camera to use for frustum culling
   */
  initialize(camera: THREE.Camera): void {
    if (this.initialized) {
      return;
    }

    this.camera = camera;
    this.updateFrustum();
    this.initialized = true;
    this.logger.info('Frustum Culling Service initialized');
  }

  /**
   * Update the frustum based on the current camera
   */
  updateFrustum(): void {
    if (!this.camera) {
      this.logger.warn('Cannot update frustum: camera not set');
      return;
    }

    // Update the projection screen matrix
    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );

    // Update the frustum
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }

  /**
   * Check if a point is visible in the frustum
   * @param point The point to check
   * @param radius Optional radius around the point (for sphere culling)
   * @returns True if the point is visible, false otherwise
   */
  isPointVisible(point: Vector3, radius: number = 0): boolean {
    if (!this.initialized || !this.cullingEnabled) {
      return true;
    }

    // Create a sphere at the point with the given radius
    const sphere = new THREE.Sphere(
      new THREE.Vector3(point.x, point.y, point.z),
      radius
    );

    // Check if the sphere intersects the frustum
    return this.frustum.intersectsSphere(sphere);
  }

  /**
   * Check if a sphere is visible in the frustum
   * @param center The center of the sphere
   * @param radius The radius of the sphere
   * @returns True if the sphere is visible, false otherwise
   */
  isSphereVisible(center: Vector3, radius: number): boolean {
    if (!this.initialized || !this.cullingEnabled) {
      return true;
    }

    // Create a sphere at the center with the given radius
    const sphere = new THREE.Sphere(
      new THREE.Vector3(center.x, center.y, center.z),
      radius
    );

    // Check if the sphere intersects the frustum
    return this.frustum.intersectsSphere(sphere);
  }

  /**
   * Check if a box is visible in the frustum
   * @param min The minimum corner of the box
   * @param max The maximum corner of the box
   * @returns True if the box is visible, false otherwise
   */
  isBoxVisible(min: Vector3, max: Vector3): boolean {
    if (!this.initialized || !this.cullingEnabled) {
      return true;
    }

    // Create a box with the given min and max corners
    const box = new THREE.Box3(
      new THREE.Vector3(min.x, min.y, min.z),
      new THREE.Vector3(max.x, max.y, max.z)
    );

    // Check if the box intersects the frustum
    return this.frustum.intersectsBox(box);
  }

  /**
   * Filter an array of points to only include visible points
   * @param points Array of points to filter
   * @param radius Optional radius around each point (for sphere culling)
   * @returns Array of visible points
   */
  filterVisiblePoints(points: Vector3[], radius: number = 0): Vector3[] {
    if (!this.initialized || !this.cullingEnabled) {
      return points;
    }

    this.updateFrustum();

    // Update statistics
    this.cullingStatistics.totalObjects = points.length;
    this.cullingStatistics.lastUpdateTime = Date.now();

    // Filter points
    const visiblePoints = points.filter(point => this.isPointVisible(point, radius));

    // Update statistics
    this.cullingStatistics.culledObjects = points.length - visiblePoints.length;

    // Log statistics if significant culling occurred
    const cullingPercentage = (this.cullingStatistics.culledObjects / this.cullingStatistics.totalObjects) * 100;
    if (cullingPercentage > 10) {
      this.logger.debug(
        `Culled ${this.cullingStatistics.culledObjects} of ${this.cullingStatistics.totalObjects} points (${cullingPercentage.toFixed(2)}%)`
      );
    }

    return visiblePoints;
  }

  /**
   * Enable or disable frustum culling
   * @param enabled Whether frustum culling should be enabled
   */
  setCullingEnabled(enabled: boolean): void {
    this.cullingEnabled = enabled;
    this.logger.info(`Frustum culling ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get the current culling statistics
   * @returns The current culling statistics
   */
  getCullingStatistics(): {
    totalObjects: number;
    culledObjects: number;
    cullingPercentage: number;
    lastUpdateTime: number;
  } {
    return {
      ...this.cullingStatistics,
      cullingPercentage: (this.cullingStatistics.culledObjects / this.cullingStatistics.totalObjects) * 100
    };
  }

  /**
   * Reset the culling statistics
   */
  resetCullingStatistics(): void {
    this.cullingStatistics = {
      totalObjects: 0,
      culledObjects: 0,
      lastUpdateTime: 0
    };
  }
}

/**
 * Get the frustum culling service instance
 * @returns The frustum culling service instance
 */
export function getFrustumCullingService(): FrustumCullingService {
  if (!instance) {
    instance = new FrustumCullingService();
  }
  return instance;
}
