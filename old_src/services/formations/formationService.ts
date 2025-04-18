/**
 * Formation Service
 *
 * Service for managing formations and generating particle positions.
 */

import { Role, Tier } from '../../types/core';
import { BlockData } from '../../services/bitcoin/bitcoinService';
import { Vector3 } from '../../types/common';
import { Formation, FormationPattern, FormationPatternType } from '../../types/formations/formation';
import { RNGSystem } from '../../types/utils/rng';
import { createRNGFromBlock } from '../../lib/rngSystem';
import { getFormationBankLoader } from './formationBankLoader';

// Import formation patterns
import { generateCircleFormation } from './patterns/circle/circleGenerator';
import { generateGridFormation } from './patterns/grid/gridGenerator';
import { generateSpiralFormation } from './patterns/spiral/spiralGenerator';
import { generateSphereFormation } from './patterns/sphere/sphereGenerator';
import { generateHelixFormation } from './patterns/helix/helixGenerator';
import { generateClusterFormation } from './patterns/cluster/clusterGenerator';
import { generateSwarmFormation } from './patterns/swarm/swarmGenerator';
import { generateTreeFormation } from './patterns/tree/treeGenerator';
import { generateSierpinskiFormation } from './patterns/sierpinski/sierpinskiGenerator';
import { generateMandelbrotFormation } from './patterns/mandelbrot/mandelbrotGenerator';
import { generateWebFormation } from './patterns/web/webGenerator';

// Singleton instance
let instance: FormationService | null = null;

/**
 * Helper function to adapt our simplified BlockData for use with RNG system
 * @param blockData Simplified BlockData with just nonce and confirmations
 * @returns Enhanced BlockData with required fields for RNG system
 */
function createEnhancedBlockData(blockData: BlockData): any {
  return {
    ...blockData,
    nonce: blockData.nonce.toString(), // Ensure nonce is a string as expected
    hash: `mock-hash-${blockData.nonce}`, // Create a mock hash based on nonce
    timestamp: Date.now() // Use current timestamp
  };
}

/**
 * Formation Service class
 */
class FormationService {
  private initialized: boolean = false;
  private rngSystem: RNGSystem | null = null;

  /**
   * Initialize the formation service with block data
   * @param blockData The Bitcoin block data
   */
  initialize(blockData: BlockData): void {
    // Create enhanced block data for RNG system
    const enhancedBlockData = createEnhancedBlockData(blockData);

    // Create RNG system from enhanced block data
    this.rngSystem = createRNGFromBlock(enhancedBlockData);
    this.initialized = true;

    // Log initialization
    console.log('Formation service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get formations for a specific role
   * @param role The role to get formations for
   * @returns Array of formations for the specified role
   */
  async getFormationsForRole(role: Role): Promise<FormationPattern[]> {
    if (!this.initialized || !this.rngSystem) {
      throw new Error('Formation service not initialized');
    }

    try {
      // Get the formation bank loader
      const loader = getFormationBankLoader();
      loader.initialize(this.rngSystem);

      // Load formations from files
      const bank = await loader.loadFromFiles();

      // Get formations for the role
      const formations = bank.getFormationsByRole(role);

      // Return the formation patterns
      return formations.map((formation: Formation) => formation.pattern);
    } catch (error) {
      console.error(`Error getting formations for role ${role}:`, error);
      return [];
    }
  }

  /**
   * Generate particle positions for a formation pattern
   * @param pattern The formation pattern
   * @param particleCount The number of particles to generate
   * @returns Array of particle positions
   */
  generatePositions(pattern: FormationPattern, particleCount: number): Vector3[] {
    if (!this.initialized || !this.rngSystem) {
      throw new Error('Formation service not initialized');
    }

    // Get a seed for the formation
    const formationRng = this.rngSystem.getStream('formation');
    const seed = Math.floor(formationRng.next() * 1000000);

    console.log(`Generating positions for ${particleCount} particles with pattern type ${pattern.type}`);

    // Create a copy of the pattern to modify if needed
    const patternCopy = { ...pattern };

    // For patterns that use 'count' or 'particles' parameter, update it with particleCount
    if (pattern.type === FormationPatternType.CIRCLE || pattern.type === FormationPatternType.SPHERE) {
      // These patterns use 'count' parameter
      patternCopy.parameters = { ...pattern.parameters, count: particleCount };
    } else if (pattern.type === FormationPatternType.SPIRAL || pattern.type === FormationPatternType.HELIX) {
      // These patterns use 'particles' parameter
      patternCopy.parameters = { ...pattern.parameters, particles: particleCount };
    }
    // Other patterns like CLUSTER, SWARM, etc. use density-based approaches

    // Generate positions based on pattern type
    switch (pattern.type) {
      case FormationPatternType.CIRCLE:
        // We know this is a CircleFormationPattern because of the type check
        return generateCircleFormation(patternCopy as any, seed);
      case FormationPatternType.GRID:
        return generateGridFormation(patternCopy as any, seed);
      case FormationPatternType.SPIRAL:
        return generateSpiralFormation(patternCopy as any, seed);
      case FormationPatternType.SPHERE:
        return generateSphereFormation(patternCopy as any, seed);
      case FormationPatternType.HELIX:
        return generateHelixFormation(patternCopy as any, seed);
      case FormationPatternType.CLUSTER:
        return generateClusterFormation(patternCopy as any, seed);
      case FormationPatternType.SWARM:
        return generateSwarmFormation(patternCopy as any, seed);
      case FormationPatternType.TREE:
        return generateTreeFormation(patternCopy as any, seed);
      case FormationPatternType.SIERPINSKI:
        return generateSierpinskiFormation(patternCopy as any, seed);
      case FormationPatternType.MANDELBROT:
        return generateMandelbrotFormation(patternCopy as any, seed);
      case FormationPatternType.WEB:
        return generateWebFormation(patternCopy as any, seed);
      default:
        throw new Error(`Formation pattern type ${pattern.type} not implemented`);
    }
  }

  /**
   * Get a formation pattern for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns A formation pattern
   */
  getFormationPattern(role: Role, tier: Tier): FormationPattern {
    if (!this.initialized || !this.rngSystem) {
      throw new Error('Formation service not initialized');
    }

    // Get a random formation pattern type based on role and tier
    const formationRng = this.rngSystem.getStream('formation');
    const patternTypes = this.getPatternTypesForRole(role, tier);
    const patternType = patternTypes[Math.floor(formationRng.next() * patternTypes.length)];

    // Create a formation pattern based on the type
    return this.createFormationPattern(patternType, role, tier);
  }

  /**
   * Get pattern types for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns Array of pattern types
   */
  private getPatternTypesForRole(role: Role, tier: Tier): FormationPatternType[] {
    console.log(`Getting pattern types for role ${role} and tier ${tier}`);

    // Define role-specific pattern types
    const rolePatterns: Record<Role, FormationPatternType[]> = {
      [Role.CORE]: [
        FormationPatternType.CIRCLE,
        FormationPatternType.SPIRAL,
        FormationPatternType.SPHERE
      ],
      [Role.ATTACK]: [
        FormationPatternType.SPIRAL,
        FormationPatternType.GRID,
        FormationPatternType.SWARM
      ],
      [Role.DEFENSE]: [
        FormationPatternType.CIRCLE,
        FormationPatternType.GRID,
        FormationPatternType.SPHERE
      ],
      [Role.CONTROL]: [
        FormationPatternType.GRID,
        FormationPatternType.CLUSTER,
        FormationPatternType.WEB
      ],
      [Role.MOVEMENT]: [
        FormationPatternType.SPIRAL,
        FormationPatternType.HELIX,
        FormationPatternType.SWARM
      ]
    };

    // Get patterns for the role
    return rolePatterns[role] || [FormationPatternType.CIRCLE];
  }

  /**
   * Create a formation pattern
   * @param type The pattern type
   * @param role The role
   * @param tier The tier
   * @returns A formation pattern
   */
  private createFormationPattern(type: FormationPatternType, role: Role, tier: Tier): FormationPattern {
    console.log(`Creating formation pattern of type ${type} for role ${role} and tier ${tier}`);

    // Create a basic formation pattern
    const pattern: FormationPattern = {
      type,
      density: 0.5,
      cohesion: 0.5,
      flexibility: 0.5,
      parameters: {}
    };

    // Adjust base values based on role and tier
    if (role === Role.CORE) {
      pattern.density = 0.7;
    } else if (role === Role.DEFENSE) {
      pattern.cohesion = 0.7;
    }

    // Higher tiers have better values
    if (tier === Tier.TIER_3 || tier === Tier.TIER_4) {
      pattern.flexibility += 0.1;
    } else if (tier === Tier.TIER_5 || tier === Tier.TIER_6) {
      pattern.flexibility += 0.2;
      pattern.density += 0.1;
    }

    // Adjust parameters based on type
    switch (type) {
      case FormationPatternType.CIRCLE:
        pattern.parameters = {
          radius: 5.0,
          count: 12,
          offset: { x: 0, y: 0, z: 0 },
          rotation: 0,
          jitter: 0.1
        };
        break;
      case FormationPatternType.GRID:
        pattern.parameters = {
          spacing: 2.0,
          dimensions: { x: 3, y: 3, z: 1 },
          offset: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          jitter: 0.1
        };
        break;
      case FormationPatternType.SPIRAL:
        pattern.parameters = {
          radius: 3.0,
          growth: 0.2,
          turns: 2,
          particles: 24,
          offset: { x: 0, y: 0, z: 0 },
          rotation: 0,
          jitter: 0.1
        };
        break;
      case FormationPatternType.SPHERE:
        pattern.parameters = {
          radius: 5.0,
          count: 32,
          offset: { x: 0, y: 0, z: 0 },
          jitter: 0.1,
          layers: 1,
          layerSpacing: 1.0
        };
        break;
      case FormationPatternType.HELIX:
        pattern.parameters = {
          radius: 3.0,
          height: 10.0,
          turns: 3,
          particles: 36,
          offset: { x: 0, y: 0, z: 0 },
          rotation: 0,
          jitter: 0.1,
          strands: 1
        };
        break;
      case FormationPatternType.CLUSTER:
        pattern.parameters = {
          density: 0.5,
          radius: 8.0,
          clusters: 3,
          clusterSize: 3.0,
          offset: { x: 0, y: 0, z: 0 },
          seed: 12345,
          jitter: 0.2
        };
        break;
      case FormationPatternType.SWARM:
        pattern.parameters = {
          volume: 10.0,
          density: 0.6,
          cohesion: 0.5,
          separation: 1.0,
          alignment: 0.5,
          offset: { x: 0, y: 0, z: 0 },
          jitter: 0.2,
          iterations: 3
        };
        break;
      case FormationPatternType.TREE:
        pattern.parameters = {
          height: 10.0,
          branchLevels: 3,
          branchFactor: 2,
          branchAngle: 0.5,
          branchLength: 2.0,
          trunkWidth: 1.0,
          leafDensity: 0.5,
          offset: { x: 0, y: 0, z: 0 },
          rotation: 0,
          jitter: 0.1
        };
        break;
      case FormationPatternType.SIERPINSKI:
        pattern.parameters = {
          size: 10.0,
          iterations: 3,
          shape: 'triangle',
          scale: 0.5,
          offset: { x: 0, y: 0, z: 0 },
          rotation: 0,
          jitter: 0.1
        };
        break;
      case FormationPatternType.MANDELBROT:
        pattern.parameters = {
          centerX: -0.5,
          centerY: 0.0,
          scale: 2.5,
          iterations: 50,
          threshold: 4.0,
          density: 0.5,
          offset: { x: 0, y: 0, z: 0 },
          rotation: 0,
          jitter: 0.05,
          is3D: false
        };
        break;
      case FormationPatternType.WEB:
        pattern.parameters = {
          radius: 10.0,
          density: 0.5,
          layers: 3,
          spokes: 8,
          irregularity: 0.3,
          offset: { x: 0, y: 0, z: 0 },
          rotation: 0,
          jitter: 0.1
        };
        break;
    }

    return pattern;
  }
}

/**
 * Get the formation service instance
 * @returns The formation service instance
 */
export function getFormationService(): FormationService {
  if (!instance) {
    instance = new FormationService();
  }
  return instance;
}

