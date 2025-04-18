/**
 * Particle Renderer for Bitcoin Protozoa
 *
 * This service provides specialized rendering for particles, including
 * role-based appearance, formations, and visual effects.
 */

import * as THREE from 'three';
import { Role, Vector3, Color, createColor } from '../../types/core';
import { getInstancedRenderer } from './instancedRenderer';
import { getLODManager } from './lodManager';
import { getShaderManager } from './shaderManager';
import { getTrailRenderer } from './trailRenderer';

// Role-based colors
const ROLE_COLORS: Record<Role, Color> = {
  [Role.CORE]: createColor('#FFD700'),      // Gold
  [Role.CONTROL]: createColor('#4169E1'),   // Royal Blue
  [Role.ATTACK]: createColor('#FF4500'),    // Red-Orange
  [Role.DEFENSE]: createColor('#2E8B57'),   // Sea Green
  [Role.MOVEMENT]: createColor('#9370DB')   // Medium Purple
};

// Role-based geometries
const ROLE_GEOMETRIES: Record<Role, string> = {
  [Role.CORE]: 'sphere',
  [Role.CONTROL]: 'torus',
  [Role.ATTACK]: 'cone',
  [Role.DEFENSE]: 'box',
  [Role.MOVEMENT]: 'cylinder'
};

/**
 * Particle Renderer class
 * Manages rendering of particles with role-based appearance
 */
class ParticleRenderer {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  private particleGroups: Map<Role, string> = new Map();
  private trailsEnabled: boolean = true;
  private effectsEnabled: boolean = true;
  private initialized: boolean = false;

  /**
   * Initialize the particle renderer
   * @param container DOM element to render to
   */
  public initialize(container: HTMLElement): void {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#000000');

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Initialize instanced renderer
    getInstancedRenderer().initialize(this.scene);

    // Initialize LOD manager
    getLODManager().initialize(this.camera);

    // Initialize shader manager
    getShaderManager().initialize();

    // Create particle groups for each role
    for (const role of Object.values(Role)) {
      this.createParticleGroup(role);
    }

    // Set up resize handler
    window.addEventListener('resize', () => this.handleResize(container));

    this.initialized = true;
    console.log('Particle Renderer initialized');
  }

  /**
   * Create a particle group for a role
   * @param role Particle role
   * @returns Group ID
   */
  private createParticleGroup(role: Role): string {
    const id = `particles-${role}`;

    // Create instanced mesh for this role
    getInstancedRenderer().createInstancedMesh(id, {
      maxInstances: 1000,
      geometry: ROLE_GEOMETRIES[role],
      geometryParams: {
        radius: 0.5,
        segments: 8
      },
      material: 'shader',
      materialParams: {
        color: ROLE_COLORS[role],
        transparent: true,
        opacity: 1.0,
        emissive: true,
        emissiveColor: ROLE_COLORS[role],
        emissiveIntensity: 0.5
      },
      frustumCulled: true
    });

    this.particleGroups.set(role, id);
    return id;
  }

  /**
   * Update particle positions
   * @param role Particle role
   * @param positions Array of particle positions
   * @param velocities Optional array of particle velocities
   */
  public updateParticles(
    role: Role,
    positions: Vector3[],
    velocities?: Vector3[],
    scales?: number[],
    colors?: Color[]
  ): void {
    if (!this.initialized) {
      return;
    }

    const groupId = this.particleGroups.get(role);

    if (!groupId) {
      return;
    }

    // Apply LOD to scales
    const lodScales = scales ? scales.slice() : new Array(positions.length).fill(1);

    if (this.camera) {
      getLODManager().applyLOD(positions, lodScales, this.camera);
    }

    // Use role-based colors if not provided
    const particleColors = colors || new Array(positions.length).fill(ROLE_COLORS[role]);

    // Update instanced mesh
    getInstancedRenderer().updateInstances(groupId, {
      positions,
      scales: lodScales,
      colors: particleColors,
      customAttributes: {
        velocity: {
          data: velocities
            ? new Float32Array(velocities.flatMap(v => [v.x, v.y, v.z]))
            : new Float32Array(positions.length * 3),
          itemSize: 3
        }
      }
    });

    // Update trails if enabled
    if (this.trailsEnabled && velocities) {
      this.updateTrails(role, positions, velocities);
    }
  }

  /**
   * Update particle trails
   * @param role Particle role
   * @param positions Array of particle positions
   * @param velocities Array of particle velocities
   */
  private updateTrails(role: Role, positions: Vector3[], velocities: Vector3[]): void {
    if (!this.initialized || !this.trailsEnabled) {
      return;
    }

    const groupId = this.particleGroups.get(role);
    if (!groupId) {
      return;
    }

    const trailId = `trail-${role}`;
    const trailRenderer = getTrailRenderer();

    // Check if trail exists
    if (!trailRenderer.isInitialized()) {
      // Initialize trail renderer if needed
      if (this.scene) {
        trailRenderer.initialize(this.scene);
      } else {
        return;
      }
    }

    // Create trail if it doesn't exist
    if (!trailRenderer.hasTrail(trailId)) {
      trailRenderer.createTrail(trailId, role, positions.length, {
        maxPoints: 100,
        pointsPerParticle: 10,
        width: 0.05,
        color: `#${ROLE_COLORS[role].r.toString(16)}${ROLE_COLORS[role].g.toString(16)}${ROLE_COLORS[role].b.toString(16)}`
      });
    }

    // Update trail
    trailRenderer.updateTrail(trailId, positions, velocities, this.clock.getDelta());
  }

  /**
   * Render the scene
   */
  public render(): void {
    if (!this.initialized || !this.scene || !this.camera || !this.renderer) {
      return;
    }

    // Update shader uniforms
    getShaderManager().updateUniforms(this.clock.getDelta());

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start animation loop
   */
  public startAnimation(): void {
    if (!this.initialized) {
      return;
    }

    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
    };

    animate();
  }

  /**
   * Handle window resize
   * @param container DOM element
   */
  private handleResize(container: HTMLElement): void {
    if (!this.initialized || !this.camera || !this.renderer) {
      return;
    }

    // Update camera aspect ratio
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  /**
   * Enable or disable trails
   * @param enabled Whether trails are enabled
   */
  public setTrailsEnabled(enabled: boolean): void {
    this.trailsEnabled = enabled;
  }

  /**
   * Enable or disable effects
   * @param enabled Whether effects are enabled
   */
  public setEffectsEnabled(enabled: boolean): void {
    this.effectsEnabled = enabled;
  }

  /**
   * Get the scene
   * @returns THREE.Scene
   */
  public getScene(): THREE.Scene | null {
    return this.scene;
  }

  /**
   * Get the camera
   * @returns THREE.PerspectiveCamera
   */
  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  /**
   * Get the renderer
   * @returns THREE.WebGLRenderer
   */
  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  /**
   * Dispose of all resources
   */
  public dispose(): void {
    if (!this.initialized) {
      return;
    }

    // Dispose of instanced renderer
    getInstancedRenderer().disposeAll();

    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose();

      // Remove canvas from DOM
      const canvas = this.renderer.domElement;
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particleGroups.clear();

    this.initialized = false;
  }
}

// Singleton instance
let particleRendererInstance: ParticleRenderer | null = null;

/**
 * Get the particle renderer instance
 * @returns ParticleRenderer instance
 */
export function getParticleRenderer(): ParticleRenderer {
  if (!particleRendererInstance) {
    particleRendererInstance = new ParticleRenderer();
  }

  return particleRendererInstance;
}
