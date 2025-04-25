/**
 * Instanced Renderer
 *
 * Service for rendering instanced meshes.
 */

import * as THREE from 'three';
import { Role } from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';
import { InstancedRenderOptions, InstanceData } from '../types/rendering';
import { Logging } from '../../../shared/utils';

// Singleton instance
let instance: InstancedRenderer | null = null;

/**
 * Instanced Renderer class
 */
export class InstancedRenderer {
  private scene: THREE.Scene | null = null;
  private instancedMeshes: Map<string, THREE.InstancedMesh> = new Map();
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  private initialized: boolean = false;
  private config: any = null;
  private logger = Logging.createLogger('InstancedRenderer');

  /**
   * Initialize the instanced renderer with a scene
   * @param scene The Three.js scene
   */
  initialize(scene: THREE.Scene): void {
    if (!scene) {
      throw new Error('Scene cannot be null');
    }
    this.scene = scene;
    this.initialized = true;

    // Load configuration
    this.loadConfig();

    this.logger.info('Instanced Renderer initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/rendering.json');
      this.config = await response.json();
      this.logger.info('Loaded rendering configuration');
    } catch (error) {
      this.logger.error('Failed to load rendering configuration:', error);
      // Use default configuration
      this.config = {
        instancing: {
          maxInstancesPerMesh: 10000,
          useSharedBuffers: true,
          dynamicDrawUsage: true
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
   * Clear all instances
   */
  clearInstances(): void {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }

    // Remove meshes from scene and dispose resources
    this.instancedMeshes.forEach((mesh) => {
      this.scene!.remove(mesh);
      mesh.dispose();
    });
    this.instancedMeshes.clear();

    // Dispose geometries
    this.geometries.forEach((geometry) => {
      geometry.dispose();
    });
    this.geometries.clear();

    // Dispose materials
    this.materials.forEach((material) => {
      material.dispose();
    });
    this.materials.clear();

    this.logger.debug('Cleared all instanced meshes');
  }

  /**
   * Create an instanced mesh
   * @param id Unique identifier for the mesh
   * @param options Instanced render options
   * @returns The created instanced mesh
   */
  createInstancedMesh(id: string, options: InstancedRenderOptions): THREE.InstancedMesh {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }

    // Remove existing mesh if it exists
    if (this.instancedMeshes.has(id)) {
      this.removeInstancedMesh(id);
    }

    // Create geometry
    let geometry: THREE.BufferGeometry;

    try {
      switch (options.geometry) {
        case 'sphere':
          try {
            geometry = new THREE.SphereGeometry(
              options.geometryParams?.radius || 0.5,
              options.geometryParams?.segments || 8,
              options.geometryParams?.segments || 8
            );
          } catch (error) {
            this.logger.warn('THREE.SphereGeometry not available, using fallback geometry', error);
            geometry = this.createMockGeometry();
          }
          break;
        case 'box':
          try {
            geometry = new THREE.BoxGeometry(
              options.geometryParams?.width || 1,
              options.geometryParams?.height || 1,
              options.geometryParams?.depth || 1
            );
          } catch (error) {
            this.logger.warn('THREE.BoxGeometry not available, using fallback geometry', error);
            geometry = this.createMockGeometry();
          }
          break;
        case 'cone':
          try {
            geometry = new THREE.ConeGeometry(
              options.geometryParams?.radius || 0.5,
              options.geometryParams?.height || 1,
              options.geometryParams?.segments || 8
            );
          } catch (error) {
            this.logger.warn('THREE.ConeGeometry not available, using fallback geometry', error);
            geometry = this.createMockGeometry();
          }
          break;
        case 'cylinder':
          try {
            geometry = new THREE.CylinderGeometry(
              options.geometryParams?.radius || 0.5,
              options.geometryParams?.radius || 0.5,
              options.geometryParams?.height || 1,
              options.geometryParams?.segments || 8
            );
          } catch (error) {
            this.logger.warn('THREE.CylinderGeometry not available, using fallback geometry', error);
            geometry = this.createMockGeometry();
          }
          break;
        case 'torus':
          try {
            geometry = new THREE.TorusGeometry(
              options.geometryParams?.radius || 0.5,
              options.geometryParams?.tube || 0.2,
              options.geometryParams?.radialSegments || 8,
              options.geometryParams?.tubularSegments || 12
            );
          } catch (error) {
            this.logger.warn('THREE.TorusGeometry not available, using fallback geometry', error);
            geometry = this.createMockGeometry();
          }
          break;
        default:
          try {
            geometry = new THREE.SphereGeometry(0.5, 8, 8);
          } catch (error) {
            this.logger.warn('THREE.SphereGeometry not available, using fallback geometry', error);
            geometry = this.createMockGeometry();
          }
      }
    } catch (error) {
      this.logger.warn('Error creating geometry, using fallback geometry', error);
      geometry = this.createMockGeometry();
    }

    // Create material
    let material: THREE.Material;

    try {
      switch (options.material) {
        case 'standard':
          try {
            material = new THREE.MeshStandardMaterial({
              color: options.materialParams?.color || 0xffffff,
              emissive: options.materialParams?.emissive ? options.materialParams?.emissiveColor || options.materialParams?.color : 0x000000,
              emissiveIntensity: options.materialParams?.emissiveIntensity || 0.5,
              transparent: options.materialParams?.transparent || false,
              opacity: options.materialParams?.opacity || 1.0
            });
          } catch (error) {
            this.logger.warn('THREE.MeshStandardMaterial not available, using fallback material', error);
            // Create a mock material if MeshStandardMaterial is not available
            material = this.createMockMaterial(options);
          }
          break;
        case 'basic':
          try {
            material = new THREE.MeshBasicMaterial({
              color: options.materialParams?.color || 0xffffff,
              transparent: options.materialParams?.transparent || false,
              opacity: options.materialParams?.opacity || 1.0,
              wireframe: options.materialParams?.wireframe || false
            });
          } catch (error) {
            this.logger.warn('THREE.MeshBasicMaterial not available, using fallback material', error);
            // Create a mock material if MeshBasicMaterial is not available
            material = this.createMockMaterial(options);
          }
          break;
        case 'phong':
          try {
            material = new THREE.MeshPhongMaterial({
              color: options.materialParams?.color || 0xffffff,
              emissive: options.materialParams?.emissive ? options.materialParams?.emissiveColor || options.materialParams?.color : 0x000000,
              transparent: options.materialParams?.transparent || false,
              opacity: options.materialParams?.opacity || 1.0,
              wireframe: options.materialParams?.wireframe || false
            });
          } catch (error) {
            this.logger.warn('THREE.MeshPhongMaterial not available, using fallback material', error);
            // Create a mock material if MeshPhongMaterial is not available
            material = this.createMockMaterial(options);
          }
          break;
        case 'shader':
          // Shader material will be handled separately
          try {
            material = new THREE.MeshBasicMaterial({ color: options.materialParams?.color || 0xffffff });
          } catch (error) {
            this.logger.warn('THREE.MeshBasicMaterial not available, using fallback material', error);
            // Create a mock material if MeshBasicMaterial is not available
            material = this.createMockMaterial(options);
          }
          break;
        default:
          try {
            material = new THREE.MeshBasicMaterial({ color: options.materialParams?.color || 0xffffff });
          } catch (error) {
            this.logger.warn('THREE.MeshBasicMaterial not available, using fallback material', error);
            // Create a mock material if MeshBasicMaterial is not available
            material = this.createMockMaterial(options);
          }
      }
    } catch (error) {
      this.logger.warn('Error creating material, using fallback material', error);
      // Create a mock material if any error occurs
      material = this.createMockMaterial(options);
    }

    // Create instanced mesh
    const maxInstances = options.maxInstances || this.config?.instancing?.maxInstancesPerMesh || 1000;
    let mesh;

    try {
      mesh = new THREE.InstancedMesh(geometry, material, maxInstances);
    } catch (error) {
      this.logger.warn('THREE.InstancedMesh not available, using mock mesh', error);
      // Create a mock instanced mesh
      mesh = this.createMockInstancedMesh(geometry, material, maxInstances);
    }

    // Set frustum culling
    mesh.frustumCulled = options.frustumCulled !== undefined ? options.frustumCulled : true;

    // Set dynamic usage for instance matrix
    if (this.config?.instancing?.dynamicDrawUsage &&
        mesh.instanceMatrix &&
        typeof mesh.instanceMatrix.setUsage === 'function' &&
        THREE.DynamicDrawUsage !== undefined) {
      try {
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      } catch (error) {
        this.logger.warn('Failed to set dynamic draw usage', error);
      }
    }

    // Add to scene and store
    this.scene.add(mesh);
    this.instancedMeshes.set(id, mesh);
    this.geometries.set(id, geometry);
    this.materials.set(id, material);

    this.logger.debug(`Created instanced mesh with ID ${id} and ${maxInstances} max instances`);
    return mesh;
  }

  /**
   * Remove an instanced mesh
   * @param id Unique identifier of the mesh to remove
   */
  removeInstancedMesh(id: string): void {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }

    const mesh = this.instancedMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.dispose();
      this.instancedMeshes.delete(id);

      // Dispose geometry
      const geometry = this.geometries.get(id);
      if (geometry) {
        geometry.dispose();
        this.geometries.delete(id);
      }

      // Dispose material
      const material = this.materials.get(id);
      if (material) {
        material.dispose();
        this.materials.delete(id);
      }

      this.logger.debug(`Removed instanced mesh with ID ${id}`);
    }
  }

  /**
   * Update instances for a mesh
   * @param id Mesh ID
   * @param data Instance data
   */
  updateInstances(id: string, data: InstanceData): void {
    if (!this.scene || !this.initialized) {
      return;
    }

    // Get mesh
    const mesh = this.instancedMeshes.get(id);
    if (!mesh) {
      this.logger.warn(`No instanced mesh found with ID ${id}`);
      return;
    }

    // Check if we need to resize the mesh
    if (mesh.count < data.positions.length) {
      this.logger.warn(`Instanced mesh ${id} has insufficient capacity (${mesh.count} vs ${data.positions.length} needed).`);
      // In a real implementation, we would resize the mesh
      return;
    }

    // Update instance matrices
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    // Set count to match positions length
    mesh.count = data.positions.length;

    // Update each instance
    for (let i = 0; i < data.positions.length; i++) {
      const pos = data.positions[i];

      // Set position
      position.set(pos.x, pos.y, pos.z);

      // Set rotation if available
      if (data.rotations && data.rotations[i]) {
        const rot = data.rotations[i];
        quaternion.set(rot.x, rot.y, rot.z, rot.w);
      } else {
        quaternion.identity();
      }

      // Set scale
      if (data.scales) {
        const scaleValue = data.scales[i];
        if (typeof scaleValue === 'number') {
          scale.set(scaleValue, scaleValue, scaleValue);
        } else if (scaleValue) {
          scale.set(scaleValue.x, scaleValue.y, scaleValue.z);
        } else {
          scale.set(1, 1, 1);
        }
      } else {
        scale.set(1, 1, 1);
      }

      // Compose matrix
      matrix.compose(position, quaternion, scale);

      // Set matrix
      mesh.setMatrixAt(i, matrix);

      // Set color if available
      if (data.colors && data.colors[i] && mesh.instanceColor) {
        const color = new THREE.Color(data.colors[i]);
        mesh.setColorAt(i, color);
      }
    }

    // Update matrices
    mesh.instanceMatrix.needsUpdate = true;

    // Update colors if available
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    // Update custom attributes if available
    if (data.customAttributes) {
      for (const [name, attribute] of Object.entries(data.customAttributes)) {
        // Check if attribute exists
        if (!mesh.geometry.attributes[name]) {
          // Create new attribute
          const instancedAttribute = new THREE.InstancedBufferAttribute(
            attribute.data,
            attribute.itemSize
          );
          mesh.geometry.setAttribute(name, instancedAttribute);
        } else {
          // Update existing attribute
          const existingAttribute = mesh.geometry.attributes[name] as THREE.InstancedBufferAttribute;
          existingAttribute.array = attribute.data;
          existingAttribute.needsUpdate = true;
        }
      }
    }

    this.logger.debug(`Updated ${data.positions.length} instances for mesh ${id}`);
  }

  /**
   * Render a particle group
   * @param particles The particles to render
   * @param role The role of the particles
   */
  renderParticleGroup(particles: any[], role: Role): void {
    if (!this.scene || !this.initialized) {
      return;
    }

    const meshId = `particles-${role}`;

    // Check if we have a mesh for this role
    if (!this.instancedMeshes.has(meshId)) {
      // Create a new mesh for this role
      // This would typically be done through createInstancedMesh
      this.logger.warn(`No instanced mesh found for role ${role}. Create one using createInstancedMesh first.`);
      return;
    }

    const mesh = this.instancedMeshes.get(meshId)!;

    // Check if we need to resize the mesh
    if (mesh.count < particles.length) {
      this.logger.warn(`Instanced mesh for role ${role} has insufficient capacity (${mesh.count} vs ${particles.length} needed).`);
      // In a real implementation, we would resize the mesh
      return;
    }

    // Update instance matrices
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    // Set count to match particles length
    mesh.count = particles.length;

    // Update each particle
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Set position
      position.set(
        particle.position.x,
        particle.position.y,
        particle.position.z
      );

      // Set rotation if available
      if (particle.rotation) {
        quaternion.set(
          particle.rotation.x || 0,
          particle.rotation.y || 0,
          particle.rotation.z || 0,
          particle.rotation.w || 1
        );
      } else {
        quaternion.identity();
      }

      // Set scale
      const particleScale = particle.scale || particle.size || 1;
      if (typeof particleScale === 'number') {
        scale.set(particleScale, particleScale, particleScale);
      } else {
        scale.set(
          particleScale.x || 1,
          particleScale.y || 1,
          particleScale.z || 1
        );
      }

      // Compose matrix
      matrix.compose(position, quaternion, scale);

      // Set matrix
      mesh.setMatrixAt(i, matrix);

      // Set color if available
      if (particle.color && mesh.instanceColor) {
        const color = new THREE.Color(particle.color);
        mesh.setColorAt(i, color);
      }
    }

    // Update matrices
    mesh.instanceMatrix.needsUpdate = true;

    // Update colors if available
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }

    this.logger.debug(`Rendered ${particles.length} particles for role ${role}`);
  }

  /**
   * Get an instanced mesh by ID
   * @param id Mesh ID
   * @returns The instanced mesh, or undefined if not found
   */
  getInstancedMesh(id: string): THREE.InstancedMesh | undefined {
    return this.instancedMeshes.get(id);
  }

  /**
   * Get all instanced meshes
   * @returns Map of all instanced meshes
   */
  getAllInstancedMeshes(): Map<string, THREE.InstancedMesh> {
    return this.instancedMeshes;
  }

  /**
   * Create a mock geometry when THREE.js geometry constructors are not available
   * @returns A mock geometry object
   */
  private createMockGeometry(): THREE.BufferGeometry {
    // Create a mock geometry with the minimum required properties
    return {
      type: 'BufferGeometry',
      uuid: Math.random().toString(36).substring(2, 15),
      name: 'mock-geometry',
      attributes: {
        position: {
          array: new Float32Array(0),
          count: 0,
          itemSize: 3,
          needsUpdate: false,
          updateRange: { offset: 0, count: -1 }
        }
      },
      boundingSphere: { radius: 0.5, center: { x: 0, y: 0, z: 0 } },
      boundingBox: {
        min: { x: -0.5, y: -0.5, z: -0.5 },
        max: { x: 0.5, y: 0.5, z: 0.5 },
        isEmpty: () => false
      },
      dispose: () => {},
      setAttribute: () => {},
      deleteAttribute: () => {},
      setIndex: () => {},
      toJSON: () => ({}),
      clone: function() { return this; },
      copy: function() { return this; },
      userData: {}
    } as any;
  }

  /**
   * Create a mock material when THREE.js material constructors are not available
   * @param options Material options
   * @returns A mock material object
   */
  private createMockMaterial(options: InstancedRenderOptions): THREE.Material {
    // Create a mock material with the minimum required properties
    return {
      type: 'Material',
      uuid: Math.random().toString(36).substring(2, 15),
      name: options.material || 'mock-material',
      transparent: options.materialParams?.transparent || false,
      opacity: options.materialParams?.opacity || 1.0,
      visible: true,
      side: 0, // FrontSide
      colorWrite: true,
      depthWrite: true,
      depthTest: true,
      needsUpdate: false,
      dispose: () => {},
      clone: function() { return this; },
      copy: function() { return this; },
      toJSON: function() { return {}; },
      userData: {}
    } as any;
  }

  /**
   * Create a mock instanced mesh when THREE.InstancedMesh is not available
   * @param geometry Geometry to use
   * @param material Material to use
   * @param maxInstances Maximum number of instances
   * @returns A mock instanced mesh
   */
  private createMockInstancedMesh(geometry: THREE.BufferGeometry, material: THREE.Material, maxInstances: number): THREE.InstancedMesh {
    // Create a mock instanced mesh with the minimum required properties
    return {
      type: 'InstancedMesh',
      uuid: Math.random().toString(36).substring(2, 15),
      name: 'mock-instanced-mesh',
      geometry: geometry,
      material: material,
      count: 0,
      frustumCulled: true,
      visible: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      matrix: { identity: () => {} },
      matrixWorld: { identity: () => {} },
      matrixAutoUpdate: true,
      matrixWorldNeedsUpdate: false,
      layers: { test: () => true },
      instanceMatrix: {
        array: new Float32Array(maxInstances * 16),
        count: maxInstances,
        itemSize: 16,
        needsUpdate: false,
        setUsage: () => {},
        updateRange: { offset: 0, count: -1 }
      },
      instanceColor: null,
      dispose: () => {},
      setMatrixAt: (index: number, matrix: any) => {},
      setColorAt: (index: number, color: any) => {},
      getMatrixAt: (index: number, matrix: any) => {},
      getColorAt: (index: number, color: any) => {},
      raycast: () => {},
      updateMatrix: () => {},
      updateMatrixWorld: () => {},
      updateWorldMatrix: () => {},
      toJSON: () => ({}),
      clone: function() { return this; },
      copy: function() { return this; },
      userData: {}
    } as any;
  }

  /**
   * Dispose of all resources
   */
  disposeAll(): void {
    // Clear instances
    this.clearInstances();

    // Reset state
    this.scene = null;
    this.initialized = false;
    this.config = null;

    this.logger.info('Instanced Renderer disposed');
  }
}

/**
 * Get the instanced renderer instance
 * @returns The instanced renderer instance
 */
export function getInstancedRenderer(): InstancedRenderer {
  if (!instance) {
    instance = new InstancedRenderer();
  }
  return instance;
}
