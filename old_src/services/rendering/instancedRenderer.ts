/**
 * Instanced Renderer
 *
 * Service for rendering instanced meshes.
 */

import * as THREE from 'three';
import { Role } from '../../types/core';
import { Vector3 } from '../../types/common';
import { InstancedRenderOptions } from '../../types/rendering/instanced';

// Singleton instance
let instance: InstancedRenderer | null = null;

/**
 * Instanced Renderer class
 */
class InstancedRenderer {
  private scene: THREE.Scene | null = null;
  private instancedMeshes: Map<string, THREE.InstancedMesh> = new Map();
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  private initialized: boolean = false;
  private config: any = null;

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

    console.log('Instanced Renderer initialized');
  }

  /**
   * Load configuration from file
   */
  private async loadConfig(): Promise<void> {
    try {
      const response = await fetch('src/data/config/rendering.json');
      this.config = await response.json();
      console.log('Loaded rendering configuration');
    } catch (error) {
      console.error('Failed to load rendering configuration:', error);
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
  }

  /**
   * Create an instanced mesh
   * @param id Unique identifier for the mesh
   * @param options Instanced render options
   * @returns The created instanced mesh
   */
  createInstancedMesh(id: string, options: any): THREE.InstancedMesh {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }

    // Remove existing mesh if it exists
    if (this.instancedMeshes.has(id)) {
      this.removeInstancedMesh(id);
    }

    // Create geometry
    let geometry: THREE.BufferGeometry;

    switch (options.geometry) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          options.geometryParams?.radius || 0.5,
          options.geometryParams?.segments || 8,
          options.geometryParams?.segments || 8
        );
        break;
      case 'box':
        geometry = new THREE.BoxGeometry(
          options.geometryParams?.width || 1,
          options.geometryParams?.height || 1,
          options.geometryParams?.depth || 1
        );
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(
          options.geometryParams?.radius || 0.5,
          options.geometryParams?.height || 1,
          options.geometryParams?.segments || 8
        );
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          options.geometryParams?.radius || 0.5,
          options.geometryParams?.radius || 0.5,
          options.geometryParams?.height || 1,
          options.geometryParams?.segments || 8
        );
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(
          options.geometryParams?.radius || 0.5,
          options.geometryParams?.tube || 0.2,
          options.geometryParams?.radialSegments || 8,
          options.geometryParams?.tubularSegments || 12
        );
        break;
      default:
        geometry = new THREE.SphereGeometry(0.5, 8, 8);
    }

    // Create material
    let material: THREE.Material;

    switch (options.material) {
      case 'standard':
        material = new THREE.MeshStandardMaterial({
          color: options.materialParams?.color || 0xffffff,
          emissive: options.materialParams?.emissive ? options.materialParams?.emissiveColor || options.materialParams?.color : 0x000000,
          emissiveIntensity: options.materialParams?.emissiveIntensity || 0.5,
          transparent: options.materialParams?.transparent || false,
          opacity: options.materialParams?.opacity || 1.0
        });
        break;
      case 'basic':
        material = new THREE.MeshBasicMaterial({
          color: options.materialParams?.color || 0xffffff,
          transparent: options.materialParams?.transparent || false,
          opacity: options.materialParams?.opacity || 1.0,
          wireframe: options.materialParams?.wireframe || false
        });
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial({
          color: options.materialParams?.color || 0xffffff,
          emissive: options.materialParams?.emissive ? options.materialParams?.emissiveColor || options.materialParams?.color : 0x000000,
          transparent: options.materialParams?.transparent || false,
          opacity: options.materialParams?.opacity || 1.0,
          wireframe: options.materialParams?.wireframe || false
        });
        break;
      case 'shader':
        // Shader material will be handled separately
        material = new THREE.MeshBasicMaterial({ color: options.materialParams?.color || 0xffffff });
        break;
      default:
        material = new THREE.MeshBasicMaterial({ color: options.materialParams?.color || 0xffffff });
    }

    // Create instanced mesh
    const maxInstances = options.maxInstances || this.config?.instancing?.maxInstancesPerMesh || 1000;
    const mesh = new THREE.InstancedMesh(geometry, material, maxInstances);

    // Set frustum culling
    mesh.frustumCulled = options.frustumCulled !== undefined ? options.frustumCulled : true;

    // Set dynamic usage for instance matrix
    if (this.config?.instancing?.dynamicDrawUsage) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }

    // Add to scene and store
    this.scene.add(mesh);
    this.instancedMeshes.set(id, mesh);
    this.geometries.set(id, geometry);
    this.materials.set(id, material);

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
    }
  }

  /**
   * Update instances for a mesh
   * @param id Mesh ID
   * @param data Instance data
   */
  updateInstances(id: string, data: {
    positions: Vector3[];
    scales?: (number | Vector3)[];
    colors?: string[];
    rotations?: { x: number; y: number; z: number; w: number }[];
    customAttributes?: Record<string, {
      data: Float32Array;
      itemSize: number;
    }>;
  }): void {
    if (!this.scene || !this.initialized) {
      return;
    }

    // Get mesh
    const mesh = this.instancedMeshes.get(id);
    if (!mesh) {
      console.warn(`No instanced mesh found with ID ${id}`);
      return;
    }

    // Check if we need to resize the mesh
    if (mesh.count < data.positions.length) {
      console.warn(`Instanced mesh ${id} has insufficient capacity (${mesh.count} vs ${data.positions.length} needed).`);
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
      console.warn(`No instanced mesh found for role ${role}. Create one using createInstancedMesh first.`);
      return;
    }

    const mesh = this.instancedMeshes.get(meshId)!;

    // Check if we need to resize the mesh
    if (mesh.count < particles.length) {
      console.warn(`Instanced mesh for role ${role} has insufficient capacity (${mesh.count} vs ${particles.length} needed).`);
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

    console.log('Instanced Renderer disposed');
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
