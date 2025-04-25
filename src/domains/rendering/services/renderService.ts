/**
 * Render Service for Bitcoin Protozoa
 *
 * This service orchestrates the rendering process, managing the scene,
 * camera, and renderer, and coordinating with other rendering services.
 */

import * as THREE from 'three';

// Mock imports for testing
class OrbitControls {
  constructor(camera: any, domElement: any) {
    this.camera = camera;
    this.domElement = domElement;
    this.enableDamping = false;
    this.dampingFactor = 0.05;
  }
  camera: any;
  domElement: any;
  enableDamping: boolean;
  dampingFactor: number;
  update() {}
}

class EffectComposer {
  constructor(renderer: any) {
    this.renderer = renderer;
    this.renderTarget1 = { dispose: () => {} };
    this.renderTarget2 = { dispose: () => {} };
  }
  renderer: any;
  renderTarget1: { dispose: () => void };
  renderTarget2: { dispose: () => void };
  addPass(pass: any) {}
  setSize(width: number, height: number) {}
  render() {}
}

class RenderPass {
  constructor(scene: any, camera: any) {
    this.scene = scene;
    this.camera = camera;
  }
  scene: any;
  camera: any;
}

class UnrealBloomPass {
  constructor(resolution: any, strength: number, radius: number, threshold: number) {
    this.resolution = resolution;
    this.strength = strength;
    this.radius = radius;
    this.threshold = threshold;
  }
  resolution: any;
  strength: number;
  radius: number;
  threshold: number;
}
import { Role } from '../../../shared/types/core';
import { Vector3 } from '../../../shared/types/common';
import { BlockData } from '../../bitcoin/types/bitcoin';
import { Logging } from '../../../shared/utils';
import { registry } from '../../../shared/services/serviceRegistry';
import { IFormationService } from '../../traits/formations/interfaces/formationService';
import { Creature, LoadingStage } from '../../creature/types/creature';

// Import the migrated rendering services
import { getInstancedRenderer } from './instancedRenderer';
import { getTrailRenderer } from './trailRenderer';
import { getParticleRenderer } from './particleRenderer';
import { getShaderManager } from './shaderManager';
import { getLODManager } from './lodManager';
import { getBatchManager } from '../utils/batchManager';
// Import the types but mock the implementation
import { QualityLevel } from '../../../shared/utils/ui/progressiveRender';

// Mock ProgressiveRender for testing
class ProgressiveRender {
  constructor(
    renderer: any,
    scene: any,
    camera: any,
    composer: any,
    options: any
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.composer = composer;
    this.options = options;
  }
  renderer: any;
  scene: any;
  camera: any;
  composer: any;
  options: any;
  render() {}
  renderInChunks<T>(objects: T[], renderFunction: (object: T) => void) {}
  getFPS(): number { return 60; }
  getQualityLevel(): QualityLevel { return QualityLevel.MEDIUM; }
  getRenderDuration(): number { return 0; }
  isRenderingInProgress(): boolean { return false; }
  getPerformanceMetrics(): any { return {}; }
  setQualityLevel(quality: QualityLevel) {}
}

// Mock getProgressiveRender function
function getProgressiveRender(
  renderer?: any,
  scene?: any,
  camera?: any,
  composer?: any,
  options?: any
): ProgressiveRender {
  return new ProgressiveRender(renderer, scene, camera, composer, options);
}

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
  private progressiveRender: ProgressiveRender | null = null;
  private useProgressiveRendering: boolean = false;
  private logger = Logging.createLogger('RenderService');

  /**
   * Initialize the render service
   * @param container DOM element to render to (optional)
   * @throws Error if Formation service is not initialized
   */
  public async initialize(container?: HTMLElement): Promise<void> {
    if (!container) {
      this.logger.warn('No container provided, using document.body');
      container = document.body;
    }
    this.container = container;

    // Check if Formation service is available and initialized
    if (!registry.has('FormationService')) {
      throw new Error('Formation service not available. Cannot initialize Render service.');
    }

    const formationService = registry.get<IFormationService>('FormationService');
    if (!formationService.isInitialized()) {
      throw new Error('Formation service must be initialized before Render service. Check initialization order.');
    }

    this.logger.info('Formation service is initialized. Proceeding with Render service initialization.');

    // Load configuration
    await this.loadConfig();

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#000000');

    // Enable frustum culling for the scene
    this.scene.frustumCulled = true;

    // Enable frustum culling for the scene
    this.scene.frustumCulled = true;

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

    // Initialize batch rendering
    this.initializeBatchRendering();

    // Initialize progressive rendering
    this.initializeProgressiveRendering();

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
   * Render a creature with progressive loading
   * @param creature The creature to render
   * @param useBatching Whether to use batch rendering (default: false)
   */
  public renderCreature(creature: Creature, useBatching: boolean = false): void {
    if (!this.initialized) {
      this.logger.warn('Render service not initialized');
      return;
    }

    // If using batching, add to batch manager and return
    if (useBatching) {
      getBatchManager().addCreature(creature);
      return;
    }

    // Check if the creature has a loading stage
    if (!creature.loadingStage) {
      creature.loadingStage = LoadingStage.NONE;
    }

    // Render the creature based on its loading stage
    switch (creature.loadingStage) {
      case LoadingStage.NONE:
        // Don't render anything
        break;
      case LoadingStage.BASIC:
        this.renderCreatureBasic(creature);
        break;
      case LoadingStage.DETAILED:
        this.renderCreatureDetailed(creature);
        break;
      case LoadingStage.COMPLETE:
        this.renderCreatureComplete(creature);
        break;
    }
  }

  /**
   * Render a creature at the basic detail level
   * @param creature The creature to render
   */
  private renderCreatureBasic(creature: Creature): void {
    // In a real implementation, this would render a simplified version of the creature
    // For now, we'll just render a placeholder for each group

    for (const group of creature.groups) {
      // Create a simple placeholder for the group
      const positions: Vector3[] = [];
      const scales: number[] = [];

      // Create a single particle at the group's position (or a default position)
      positions.push({ x: 0, y: 0, z: 0 });
      scales.push(1.0);

      // Update particles with basic rendering
      this.updateParticles(group.role, positions, undefined, scales);
    }

    this.logger.debug(`Rendered creature ${creature.id} at BASIC detail level`);
  }

  /**
   * Render a creature at the detailed detail level
   * @param creature The creature to render
   */
  private renderCreatureDetailed(creature: Creature): void {
    // In a real implementation, this would render a more detailed version of the creature
    // For now, we'll just render a placeholder for each group with more particles

    for (const group of creature.groups) {
      // Create a more detailed placeholder for the group
      const positions: Vector3[] = [];
      const scales: number[] = [];

      // Create multiple particles in a simple formation
      const particleCount = Math.min(10, Array.isArray(group.particles) ? group.particles.length : (group.count || 0));
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        positions.push({
          x: Math.cos(angle) * 2,
          y: Math.sin(angle) * 2,
          z: 0
        });
        scales.push(0.5);
      }

      // Update particles with detailed rendering
      this.updateParticles(group.role, positions, undefined, scales);
    }

    this.logger.debug(`Rendered creature ${creature.id} at DETAILED detail level`);
  }

  /**
   * Render a creature at the complete detail level
   * @param creature The creature to render
   */
  private renderCreatureComplete(creature: Creature): void {
    // In a real implementation, this would render the full creature with all details
    // For now, we'll just render a placeholder for each group with all particles

    for (const group of creature.groups) {
      // Create a full placeholder for the group
      const positions: Vector3[] = [];
      const scales: number[] = [];

      // Create all particles in a more complex formation
      const particleCount = Array.isArray(group.particles) ? group.particles.length : (group.count || 0);
      for (let i = 0; i < particleCount; i++) {
        // Create a spiral formation
        const ratio = i / Math.max(1, particleCount);
        const angle = ratio * Math.PI * 10;
        const radius = ratio * 5;
        positions.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: ratio * 2
        });
        scales.push(0.3);
      }

      // Update particles with complete rendering
      this.updateParticles(group.role, positions, undefined, scales);
    }

    this.logger.debug(`Rendered creature ${creature.id} at COMPLETE detail level`);
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

    // Render batches if any
    const batchManager = getBatchManager();
    const batchStats = batchManager.getBatchStats();
    if (batchStats.totalBatches > 0) {
      batchManager.renderBatches();
    }

    // Use progressive rendering if enabled
    if (this.useProgressiveRendering && this.progressiveRender) {
      this.progressiveRender.render();
    } else {
      // Render scene with composer
      this.composer.render();
    }
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
   * Initialize batch rendering
   */
  private initializeBatchRendering(): void {
    // Clear any existing batches
    getBatchManager().clearBatches();
    this.logger.info('Batch rendering initialized');
  }

  /**
   * Initialize progressive rendering
   */
  private initializeProgressiveRendering(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.composer) {
      this.logger.warn('Cannot initialize progressive rendering: missing renderer, scene, camera, or composer');
      return;
    }

    // Create progressive render instance
    this.progressiveRender = getProgressiveRender(
      this.renderer,
      this.scene,
      this.camera,
      this.composer,
      {
        adaptiveQuality: true,
        qualityLevel: QualityLevel.ADAPTIVE,
        targetFPS: 60
      }
    );

    this.logger.info('Progressive rendering initialized');
  }

  /**
   * Enable or disable progressive rendering
   * @param enabled Whether to enable progressive rendering
   */
  public setProgressiveRenderingEnabled(enabled: boolean): void {
    this.useProgressiveRendering = enabled;
    this.logger.info(`Progressive rendering ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set quality level for progressive rendering
   * @param quality Quality level to set
   */
  public setQualityLevel(quality: QualityLevel): void {
    if (!this.progressiveRender) {
      this.logger.warn('Progressive rendering not initialized');
      return;
    }

    this.progressiveRender.setQualityLevel(quality);
    this.logger.info(`Quality level set to: ${quality}`);
  }

  /**
   * Get current quality level
   * @returns Current quality level or null if progressive rendering is not initialized
   */
  public getQualityLevel(): QualityLevel | null {
    if (!this.progressiveRender) {
      return null;
    }

    return this.progressiveRender.getQualityLevel();
  }

  /**
   * Get performance metrics
   * @returns Performance metrics or null if progressive rendering is not initialized
   */
  public getPerformanceMetrics(): any | null {
    if (!this.progressiveRender) {
      return null;
    }

    return this.progressiveRender.getPerformanceMetrics();
  }

  /**
   * Render creatures in batches
   * @param creatures Array of creatures to render
   */
  public renderCreaturesBatched(creatures: Creature[]): void {
    if (!this.initialized) {
      this.logger.warn('Render service not initialized');
      return;
    }

    // Clear existing batches
    getBatchManager().clearBatches();

    // Add all creatures to batches
    for (const creature of creatures) {
      getBatchManager().addCreature(creature);
    }

    // Render all batches
    getBatchManager().renderBatches();

    // Log batch statistics
    const stats = getBatchManager().getBatchStats();
    this.logger.debug(`Rendered ${stats.totalParticles} particles in ${stats.totalBatches} batches`);
  }

  /**
   * Render creatures progressively
   * @param creatures Array of creatures to render
   */
  public renderCreaturesProgressively(creatures: Creature[]): void {
    if (!this.initialized) {
      this.logger.warn('Render service not initialized');
      return;
    }

    if (!this.progressiveRender) {
      this.logger.warn('Progressive rendering not initialized');
      this.renderCreaturesBatched(creatures);
      return;
    }

    // Use progressive render to render creatures in chunks
    this.progressiveRender.renderInChunks(creatures, (creature) => {
      this.renderCreature(creature);
    });

    this.logger.debug(`Progressively rendering ${creatures.length} creatures`);
  }

  /**
   * Reset the render service
   * Clears the scene and resets all rendering services without disposing resources
   */
  public reset(): void {
    if (!this.initialized) {
      this.logger.warn('Render service not initialized');
      return;
    }

    // Stop render loop
    this.stopRenderLoop();

    // Clear scene (except lights and camera)
    if (this.scene) {
      // Keep track of lights and other essential objects
      const essentialObjects: THREE.Object3D[] = [];
      this.scene.traverse(object => {
        if (object instanceof THREE.Light ||
            object instanceof THREE.Camera ||
            object.userData.essential) {
          essentialObjects.push(object);
        }
      });

      // Clear the scene
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }

      // Add back essential objects
      essentialObjects.forEach(object => {
        if (this.scene) {
          this.scene.add(object);
        }
      });
    }

    // Reset other rendering services
    // Just clear batches and reinitialize if needed
    getInstancedRenderer().disposeAll();
    if (this.scene) {
      getInstancedRenderer().initialize(this.scene);
    }

    getTrailRenderer().disposeAll();
    if (this.scene) {
      getTrailRenderer().initialize(this.scene);
    }

    // For other services, just reinitialize
    if (this.container) {
      getParticleRenderer().dispose();
      getParticleRenderer().initialize(this.container);
    }

    getShaderManager().dispose();
    getShaderManager().initialize();

    getLODManager().dispose();
    if (this.camera) {
      getLODManager().initialize(this.camera);
    }

    // Reset batch manager
    getBatchManager().clearBatches();

    // Reset progressive rendering by reinitializing
    if (this.renderer && this.scene && this.camera && this.composer) {
      this.progressiveRender = getProgressiveRender(
        this.renderer,
        this.scene,
        this.camera,
        this.composer,
        {
          adaptiveQuality: true,
          qualityLevel: QualityLevel.ADAPTIVE,
          targetFPS: 60
        }
      );
    }

    this.logger.info('Render Service reset');
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


