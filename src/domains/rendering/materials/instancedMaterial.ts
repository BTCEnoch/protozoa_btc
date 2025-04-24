/**
 * Instanced Material
 *
 * This file provides specialized materials for instanced rendering.
 */

import * as THREE from 'three';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: InstancedMaterialService | null = null;

/**
 * Instanced Material Service
 * Provides optimized materials for instanced rendering
 */
export class InstancedMaterialService {
  private materials: Map<string, THREE.Material> = new Map();
  private initialized: boolean = false;
  private logger = Logging.createLogger('InstancedMaterialService');

  /**
   * Initialize the instanced material service
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.logger.info('Instanced Material Service initialized');
  }

  /**
   * Create a standard material optimized for instancing
   * @param id Material ID
   * @param color Base color
   * @param options Additional material options
   * @returns The created material
   */
  createStandardMaterial(
    id: string,
    color: THREE.ColorRepresentation = 0xffffff,
    options: {
      emissive?: boolean;
      emissiveColor?: THREE.ColorRepresentation;
      emissiveIntensity?: number;
      transparent?: boolean;
      opacity?: number;
      metalness?: number;
      roughness?: number;
    } = {}
  ): THREE.MeshStandardMaterial {
    // Remove existing material if it exists
    this.disposeMaterial(id);

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: options.emissive ? options.emissiveColor || color : 0x000000,
      emissiveIntensity: options.emissiveIntensity || 0.5,
      transparent: options.transparent || false,
      opacity: options.opacity || 1.0,
      metalness: options.metalness || 0.1,
      roughness: options.roughness || 0.8,
      // Optimize for instancing
      flatShading: true,
      toneMapped: false
    });

    // Store material
    this.materials.set(id, material);
    this.logger.debug(`Created standard material with ID ${id}`);
    return material;
  }

  /**
   * Create a basic material optimized for instancing
   * @param id Material ID
   * @param color Base color
   * @param options Additional material options
   * @returns The created material
   */
  createBasicMaterial(
    id: string,
    color: THREE.ColorRepresentation = 0xffffff,
    options: {
      transparent?: boolean;
      opacity?: number;
      wireframe?: boolean;
    } = {}
  ): THREE.MeshBasicMaterial {
    // Remove existing material if it exists
    this.disposeMaterial(id);

    // Create material
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: options.transparent || false,
      opacity: options.opacity || 1.0,
      wireframe: options.wireframe || false,
      // Optimize for instancing
      toneMapped: false
    });

    // Store material
    this.materials.set(id, material);
    this.logger.debug(`Created basic material with ID ${id}`);
    return material;
  }

  /**
   * Create a phong material optimized for instancing
   * @param id Material ID
   * @param color Base color
   * @param options Additional material options
   * @returns The created material
   */
  createPhongMaterial(
    id: string,
    color: THREE.ColorRepresentation = 0xffffff,
    options: {
      emissive?: boolean;
      emissiveColor?: THREE.ColorRepresentation;
      specular?: THREE.ColorRepresentation;
      shininess?: number;
      transparent?: boolean;
      opacity?: number;
    } = {}
  ): THREE.MeshPhongMaterial {
    // Remove existing material if it exists
    this.disposeMaterial(id);

    // Create material
    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: options.emissive ? options.emissiveColor || color : 0x000000,
      specular: options.specular || 0x111111,
      shininess: options.shininess || 30,
      transparent: options.transparent || false,
      opacity: options.opacity || 1.0,
      // Optimize for instancing
      flatShading: true,
      toneMapped: false
    });

    // Store material
    this.materials.set(id, material);
    this.logger.debug(`Created phong material with ID ${id}`);
    return material;
  }

  /**
   * Get a material by ID
   * @param id Material ID
   * @returns The material, or undefined if not found
   */
  getMaterial(id: string): THREE.Material | undefined {
    return this.materials.get(id);
  }

  /**
   * Dispose of a material
   * @param id Material ID
   */
  disposeMaterial(id: string): void {
    const material = this.materials.get(id);
    if (material) {
      material.dispose();
      this.materials.delete(id);
      this.logger.debug(`Disposed material with ID ${id}`);
    }
  }

  /**
   * Dispose of all materials
   */
  disposeAll(): void {
    this.materials.forEach((material) => {
      material.dispose();
    });
    this.materials.clear();
    this.logger.debug('Disposed all materials');
  }
}

/**
 * Get the instanced material service instance
 * @returns The instanced material service instance
 */
export function getInstancedMaterialService(): InstancedMaterialService {
  if (!instance) {
    instance = new InstancedMaterialService();
  }
  return instance;
}
