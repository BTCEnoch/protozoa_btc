/**
 * Render Service for Bitcoin Protozoa
 *
 * This service orchestrates the rendering process, managing the scene,
 * camera, and renderer, and coordinating with other rendering services.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Role } from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { Logging } from '../../../shared/utils';

// Import the migrated rendering services
import { getInstancedRenderer } from './instancedRenderer';
import { getTrailRenderer } from './trailRenderer';
import { getParticleRenderer } from './particleRenderer';
import { getShaderManager } from './shaderManager';
import { getLODManager } from './lodManager';

// Singleton instance
let instance: RenderService | null = null;

/**
 * Render Service class
 * Orchestrates the rendering process
 */
export class RenderService {
  private container: HTMLElement | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private composer: EffectComposer | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  private animationId: number | null = null;
  private blockData: BlockData | null = null;
  private initialized: boolean = false;
  private config: any = null;
  private logger = Logging.createLogger('RenderService');

  /**
   * Initialize the render service
   * @param container DOM element to render to (optional)
   */
  public async initialize(container?: HTMLElement): Promise<void> {
    if (!container) {
      this.logger.warn('No container provided, using document.body');
      container = document.body;
    }
    this.container = container;

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
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Use THREE.sRGBEncoding if available
    if ('outputColorSpace' in this.renderer) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    container.appendChild(this.renderer.domElement);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Create composer for post-processing
    this.composer = new EffectComposer(this.renderer);

    // Add render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Add bloom pass with settings from config
    const bloomStrength = this.config?.bloom?.strength || 0.5;
    const bloomRadius = this.config?.bloom?.radius || 0.4;
    const bloomThreshold = this.config?.bloom?.threshold || 0.85;

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    this.composer.addPass(bloomPass);

    // Initialize other rendering services
    // Initialize the migrated services
    getInstancedRenderer().initialize(this.scene);
    getTrailRenderer().initialize(this.scene);
    await getParticleRenderer().initialize(container);
    getShaderManager().initialize();
    await getLODManager().initialize(this.camera);

    // Set up resize handler
    window.addEventListener('resize', () => this.handleResize());

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);

    this.initialized = true;
    this.logger.info('Render Service initialized');
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
        bloom: {
          strength: 0.5,
          radius: 0.4,
          threshold: 0.85,
          enabled: true
        }
      };
    }
  }

  /**
   * Set block data for rendering
   * @param blockData Bitcoin block data
   */
  public setBlockData(blockData: BlockData): void {
    this.blockData = blockData;

    // Update rendering based on block data
    // This will be implemented when the particle system is ready
  }

  /**
   * Update particle positions
   * @param role Particle role
   * @param positions Array of particle positions
   * @param velocities Optional array of particle velocities
   * @param scales Optional array of particle scales
   */
  public updateParticles(
    role: Role,
    positions: Vector3[],
    velocities?: Vector3[],
    scales?: number[]
  ): void {
    if (!this.initialized) {
      this.logger.warn('Render service not initialized');
      return;
    }

    // Apply LOD to scales if provided
    let lodScales = scales;
    if (scales && this.camera) {
      lodScales = [...scales];
      getLODManager().applyLOD(positions, lodScales, this.camera);
    }

    // Update particles using the particle renderer
    getParticleRenderer().updateParticles(role, positions, velocities, lodScales);

    this.logger.debug(`Updating ${positions.length} particles for role ${role}`);
  }

  /**
   * Start the render loop
   */
  public startRenderLoop(): void {
    if (!this.initialized) {
      this.logger.warn('Render service not initialized');
      return;
    }

    // Stop any existing animation
    this.stopRenderLoop();

    // Start animation loop
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.renderInternal();
    };

    animate();
    this.logger.info('Render loop started');
  }

  /**
   * Stop the render loop
   */
  public stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.logger.info('Render loop stopped');
    }
  }

  /**
   * Render the scene (private implementation)
   */
  private renderInternal(): void {
    if (!this.initialized || !this.scene || !this.camera || !this.composer) {
      return;
    }

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Update shader uniforms
    getShaderManager().updateUniforms(this.clock.getDelta());

    // Render scene with composer
    this.composer.render();
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    if (!this.initialized || !this.container || !this.camera || !this.renderer || !this.composer) {
      return;
    }

    // Update camera aspect ratio
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    // Update composer size
    this.composer.setSize(this.container.clientWidth, this.container.clientHeight);

    this.logger.debug('Resized renderer to match container');
  }

  /**
   * Render the scene (public method)
   */
  public render(): void {
    this.renderInternal();
  }

  /**
   * Take a screenshot of the current view
   * @returns Data URL of the screenshot
   */
  public takeScreenshot(): string {
    if (!this.initialized || !this.renderer) {
      this.logger.warn('Cannot take screenshot, renderer not initialized');
      return '';
    }

    // Render scene
    this.renderInternal();

    // Get data URL
    return this.renderer.domElement.toDataURL('image/png');
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
   * Check if the service is initialized
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

    // Stop render loop
    this.stopRenderLoop();

    // Dispose of other rendering services
    // Dispose of migrated services
    getInstancedRenderer().disposeAll();
    getTrailRenderer().disposeAll();
    getParticleRenderer().dispose();
    getShaderManager().dispose();
    getLODManager().dispose();

    // Dispose of composer
    if (this.composer) {
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
    }

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
    this.controls = null;
    this.composer = null;
    this.container = null;
    this.config = null;

    this.initialized = false;
    this.logger.info('Render Service disposed');
  }
}

/**
 * Get the render service instance
 * @returns The render service instance
 */
export function getRenderService(): RenderService {
  if (!instance) {
    instance = new RenderService();
  }
  return instance;
}
