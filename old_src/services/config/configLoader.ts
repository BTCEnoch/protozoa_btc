/**
 * Config Loader for Bitcoin Protozoa
 *
 * This service loads configuration files for the application.
 */

import { Role, Tier } from '../../types/core';

/**
 * Role configuration interface
 */
export interface RoleConfig {
  multiplier: number;
  color: string;
  description: string;
  primaryAttribute: string;
  secondaryAttribute: string;
  defaultFormation: string;
  defaultBehavior: string;
}

/**
 * Particle configuration interface
 */
export interface ParticleConfig {
  defaults: {
    mass: number;
    size: number;
    opacity: number;
    emissive: boolean;
    geometry: string;
    material: string;
    trailLength: number;
    pulseRate: number;
    rotationSpeed: number;
  };
  tierModifiers: Record<Tier, {
    size: number;
    emissiveIntensity: number;
    trailLength: number;
    pulseRate: number;
  }>;
  physics: {
    maxSpeed: number;
    maxForce: number;
    damping: number;
    gravity: number;
    collisionRadius: number;
    bounceCoefficient: number;
  };
  performance: {
    workerThreshold: number;
    lodLevels: Array<{
      distance: number;
      detail: number;
    }>;
    maxParticlesPerGroup: number;
    useSharedArrayBuffers: boolean;
    useTransferables: boolean;
  };
  entanglement: {
    maxLinks: number;
    maxSharePercentage: number;
    cooldownReductionCap: number;
    linkVisualEffect: string;
  };
}

/**
 * Config Loader class
 */
class ConfigLoader {
  private static instance: ConfigLoader | null = null;
  private roleConfig: Record<Role, RoleConfig> | null = null;
  private particleConfig: ParticleConfig | null = null;
  private initialized = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Initialize the config loader
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Config Loader already initialized');
      return;
    }

    try {
      // Load role config
      const roleConfigResponse = await fetch('src/data/config/roles.json');
      const roleConfigData = await roleConfigResponse.json();
      this.roleConfig = roleConfigData.roles;

      // Load particle config
      const particleConfigResponse = await fetch('src/data/config/particles.json');
      this.particleConfig = await particleConfigResponse.json();

      this.initialized = true;
      console.log('Config Loader initialized');
    } catch (error) {
      console.error('Error initializing Config Loader:', error);
      throw error;
    }
  }

  /**
   * Get role configuration
   * @param role The role to get configuration for
   * @returns Role configuration
   */
  public getRoleConfig(role: Role): RoleConfig {
    if (!this.initialized || !this.roleConfig) {
      throw new Error('Config Loader not initialized');
    }

    return this.roleConfig[role];
  }

  /**
   * Get role multiplier
   * @param role The role to get multiplier for
   * @returns Role multiplier
   */
  public getRoleMultiplier(role: Role): number {
    return this.getRoleConfig(role).multiplier;
  }

  /**
   * Get role color
   * @param role The role to get color for
   * @returns Role color
   */
  public getRoleColor(role: Role): string {
    return this.getRoleConfig(role).color;
  }

  /**
   * Get particle configuration
   * @returns Particle configuration
   */
  public getParticleConfig(): ParticleConfig {
    if (!this.initialized || !this.particleConfig) {
      throw new Error('Config Loader not initialized');
    }

    return this.particleConfig;
  }

  /**
   * Get particle defaults
   * @returns Particle defaults
   */
  public getParticleDefaults(): ParticleConfig['defaults'] {
    return this.getParticleConfig().defaults;
  }

  /**
   * Get tier modifiers
   * @param tier The tier to get modifiers for
   * @returns Tier modifiers
   */
  public getTierModifiers(tier: Tier): ParticleConfig['tierModifiers'][Tier] {
    return this.getParticleConfig().tierModifiers[tier];
  }

  /**
   * Get physics configuration
   * @returns Physics configuration
   */
  public getPhysicsConfig(): ParticleConfig['physics'] {
    return this.getParticleConfig().physics;
  }

  /**
   * Get performance configuration
   * @returns Performance configuration
   */
  public getPerformanceConfig(): ParticleConfig['performance'] {
    return this.getParticleConfig().performance;
  }

  /**
   * Get entanglement configuration
   * @returns Entanglement configuration
   */
  public getEntanglementConfig(): ParticleConfig['entanglement'] {
    return this.getParticleConfig().entanglement;
  }

  /**
   * Reset the config loader
   */
  public reset(): void {
    this.roleConfig = null;
    this.particleConfig = null;
    this.initialized = false;
  }
}

/**
 * Get the config loader instance
 * @returns The config loader instance
 */
export function getConfigLoader(): ConfigLoader {
  return ConfigLoader.getInstance();
}
