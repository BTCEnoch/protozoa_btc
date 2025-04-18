/**
 * Particle Renderer for Bitcoin Protozoa
 *
 * This service provides specialized rendering for particles, including
 * role-based appearance, formations, and visual effects.
 */

import * as THREE from 'three';
import { Role } from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';
import { getInstancedRenderer } from './instancedRenderer';
import { getTrailRenderer } from './trailRenderer';
import { getShaderManager } from './shaderManager';
import { getLODManager } from './lodManager';
import { Logging } from '../../../shared/utils';

// Role-based colors
const ROLE_COLORS: Record<Role, string> = {
  [Role.CORE]: '#FFD700',      // Gold
  [Role.CONTROL]: '#4169E1',   // Royal Blue
  [Role.ATTACK]: '#FF4500',    // Red-Orange
  [Role.DEFENSE]: '#2E8B57',   // Sea Green
  [Role.MOVEMENT]: '#9370DB'   // Medium Purple
};

// Role-based geometries
const ROLE_GEOMETRIES: Record<Role, string> = {
  [Role.CORE]: 'sphere',
  [Role.CONTROL]: 'torus',
  [Role.ATTACK]: 'cone',
  [Role.DEFENSE]: 'box',
  [Role.MOVEMENT]: 'cylinder'
};

// Singleton instance
let instance: ParticleRenderer | null = null;

/**
 * Particle Renderer class
 * Manages rendering of particles with role-based appearance
 */
export class ParticleRenderer {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  private particleGroups: Map<Role, string> = new Map();
  private trailsEnabled: boolean = true;
  // Whether effects are enabled
  private _effectsEnabled: boolean = true;

  // Getter for effectsEnabled
  get effectsEnabled(): boolean {
    return this._effectsEnabled;
  }
  private initialized: boolean = false;
  private config: any = null;
  private logger = Logging.createLogger('ParticleRenderer');

  /**
   * Initialize the particle renderer
   * @param container DOM element to render to
   */
  public async initialize(container: HTMLElement): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Particle Renderer already initialized');
      return;
    }

    // Load configuration
    await this.loadConfig();

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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Initialize instanced renderer
    getInstancedRenderer().initialize(this.scene);

    // Initialize trail renderer
    getTrailRenderer().initialize(this.scene);

    // Initialize shader manager
    getShaderManager().initialize();

    // Initialize LOD manager
    await getLODManager().initialize(this.camera);

    // Create particle groups for each role
    for (const role of Object.values(Role)) {
      this.createParticleGroup(role);
    }

    // Set up resize handler
    window.addEventListener('resize', () => this.handleResize(container));

    this.initialized = true;
    this.logger.info('Particle Renderer initialized');
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
        particles: {
          maxParticles: 1000,
          defaultSize: 0.5,
          enableTrails: true,
          enableEffects: true,
          lodLevels: 3
        }
      };
    }
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
      maxInstances: this.config?.particles?.maxParticles || 1000,
      geometry: ROLE_GEOMETRIES[role],
      geometryParams: {
        radius: this.config?.particles?.defaultSize || 0.5,
        segments: 8
      },
      material: 'standard',
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
    this.logger.debug(`Created particle group for role ${role}`);
    return id;
  }

  /**
   * Update particle positions
   * @param role Particle role
   * @param positions Array of particle positions
   * @param velocities Optional array of particle velocities
   * @param scales Optional array of particle scales
   * @param colors Optional array of particle colors
   */
  public updateParticles(
    role: Role,
    positions: Vector3[],
    velocities?: Vector3[],
    scales?: number[],
    colors?: string[]
  ): void {
    if (!this.initialized) {
      this.logger.warn('Particle Renderer not initialized');
      return;
    }

    const groupId = this.particleGroups.get(role);

    if (!groupId) {
      this.logger.warn(`No particle group found for role ${role}`);
      return;
    }

    // Apply LOD to scales
    const lodScales = scales ? scales.slice() : new Array(positions.length).fill(1);

    // Apply LOD if camera is available
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
      customAttributes: velocities ? {
        velocity: {
          data: new Float32Array(velocities.flatMap(v => [v.x, v.y, v.z])),
          itemSize: 3
        }
      } : undefined
    });

    // Update trails if enabled
    if (this.trailsEnabled && velocities) {
      this.updateTrails(role, positions, velocities);
    }

    this.logger.debug(`Updated ${positions.length} particles for role ${role}`);
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
        color: ROLE_COLORS[role]
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
      this.logger.warn('Cannot start animation, Particle Renderer not initialized');
      return;
    }

    const animate = () => {
      requestAnimationFrame(animate);
      this.render();
    };

    animate();
    this.logger.info('Animation loop started');
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
    this.logger.debug('Resized renderer to match container');
  }

  /**
   * Enable or disable trails
   * @param enabled Whether trails are enabled
   */
  public setTrailsEnabled(enabled: boolean): void {
    this.trailsEnabled = enabled;
    this.logger.debug(`Trails ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable or disable effects
   * @param enabled Whether effects are enabled
   */
  public setEffectsEnabled(enabled: boolean): void {
    this._effectsEnabled = enabled;
    this.logger.debug(`Effects ${enabled ? 'enabled' : 'disabled'}`);
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
   * Check if the renderer is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
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

    // Dispose of trail renderer
    getTrailRenderer().disposeAll();

    // Dispose of shader manager
    getShaderManager().dispose();

    // Dispose of LOD manager
    getLODManager().dispose();

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
    this.logger.info('Particle Renderer disposed');
  }
}

/**
 * Get the particle renderer instance
 * @returns ParticleRenderer instance
 */
export function getParticleRenderer(): ParticleRenderer {
  if (!instance) {
    instance = new ParticleRenderer();
  }
  return instance;
}
