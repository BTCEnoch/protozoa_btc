/**
 * Visual Bank Loader for Bitcoin Protozoa
 *
 * This service is responsible for loading visual trait data from various sources
 * and creating a visual registry for use by the visual service.
 */

import { Role, Tier } from '../../types/abilities/ability';
import {
  VisualTrait,
  VisualRegistry,
  ParticleAppearance,
  ParticleShape,
  Animation,
  AnimationType,
  VisualEffect,
  VisualEffectType,
  VisualEffectTrigger
} from '../../types/visuals/visual';

/**
 * Visual bank loader class
 */
export class VisualBankLoader {
  /**
   * Load visual trait data from JSON files
   * @param basePath The base path to the visual trait data files
   * @returns A promise resolving to a visual registry
   */
  public async loadFromFiles(basePath: string = 'src/data/visuals'): Promise<VisualRegistry> {
    try {
      // Create empty visual registry
      const visualRegistry: VisualRegistry = {
        [Role.CORE]: {},
        [Role.ATTACK]: {},
        [Role.DEFENSE]: {},
        [Role.CONTROL]: {},
        [Role.MOVEMENT]: {}
      };

      // Initialize empty arrays for each role and tier
      for (const role of Object.values(Role)) {
        for (const tier of Object.values(Tier)) {
          visualRegistry[role][tier] = [];
        }
      }

      // Load visual traits for each role and tier
      for (const role of Object.values(Role)) {
        for (const tier of Object.values(Tier)) {
          try {
            const tierName = tier.toString().toLowerCase();
            const filePath = `${basePath}/${role.toLowerCase()}/${tierName}.json`;

            try {
              // Fetch the file
              const response = await fetch(filePath);

              if (!response.ok) {
                console.warn(`No visual trait file found for ${role}, tier ${tier}: ${response.status} ${response.statusText}`);
                continue;
              }

              const data = await response.json();

              if (!Array.isArray(data)) {
                console.warn(`Invalid visual trait data for ${role}, tier ${tier}: not an array`);
                continue;
              }

              // Validate and process each visual trait
              const validTraits = data.filter(trait => this.validateVisualTrait(trait, role, tier));

              // Add to registry
              visualRegistry[role][tier] = validTraits;
              console.log(`Loaded ${validTraits.length} visual traits for ${role}, tier ${tier}`);
            } catch (fetchError) {
              console.warn(`Error fetching visual trait file for ${role}, tier ${tier}:`, fetchError);
              console.warn(`Falling back to mock data for ${role}, tier ${tier}`);
              visualRegistry[role][tier] = this.createMockVisualTraits(role, tier);
            }
          } catch (error) {
            console.error(`Error processing visual traits for ${role}, tier ${tier}:`, error);
            visualRegistry[role][tier] = this.createMockVisualTraits(role, tier);
          }
        }
      }

      return visualRegistry;
    } catch (error) {
      console.error('Error loading visual registry:', error);
      console.warn('Falling back to mock data');
      return this.createMockVisualRegistry();
    }
  }

  /**
   * Validate a visual trait
   * @param trait The visual trait to validate
   * @param role The expected role
   * @param tier The expected tier
   * @returns True if the trait is valid, false otherwise
   */
  private validateVisualTrait(trait: any, role: Role, tier: Tier): boolean {
    // Check required fields
    if (!trait.id || !trait.name || !trait.description || !trait.role || !trait.tier ||
        !trait.particleAppearance || !trait.animation || !trait.effects) {
      console.warn(`Invalid visual trait: missing required fields`, trait);
      return false;
    }

    // Check role and tier
    if (trait.role !== role || trait.tier !== tier) {
      console.warn(`Invalid visual trait: role or tier mismatch`, trait);
      return false;
    }

    // Check particle appearance
    const appearance = trait.particleAppearance;
    if (!appearance.shape || !appearance.color || appearance.size === undefined ||
        appearance.opacity === undefined || appearance.emissive === undefined) {
      console.warn(`Invalid visual trait: invalid particle appearance`, trait);
      return false;
    }

    // Check animation
    const animation = trait.animation;
    if (!animation.type || animation.speed === undefined) {
      console.warn(`Invalid visual trait: invalid animation`, trait);
      return false;
    }

    // Check effects
    if (!Array.isArray(trait.effects)) {
      console.warn(`Invalid visual trait: effects is not an array`, trait);
      return false;
    }

    // Validate each effect
    for (const effect of trait.effects) {
      if (!effect.type || effect.intensity === undefined) {
        console.warn(`Invalid visual trait: invalid effect`, effect);
        return false;
      }
    }

    return true;
  }

  /**
   * Create a mock visual registry for testing
   * @returns A visual registry with mock data
   */
  public createMockVisualRegistry(): VisualRegistry {
    // Create empty visual registry
    const visualRegistry: VisualRegistry = {
      [Role.CORE]: {},
      [Role.ATTACK]: {},
      [Role.DEFENSE]: {},
      [Role.CONTROL]: {},
      [Role.MOVEMENT]: {}
    };

    // Initialize with mock data for each role and tier
    for (const role of Object.values(Role)) {
      for (const tier of Object.values(Tier)) {
        visualRegistry[role][tier] = this.createMockVisualTraits(role, tier);
      }
    }

    return visualRegistry;
  }

  /**
   * Create mock visual traits for a role and tier
   * @param role The role
   * @param tier The tier
   * @returns An array of mock visual traits
   */
  private createMockVisualTraits(role: Role, tier: Tier): VisualTrait[] {
    const visualTraits: VisualTrait[] = [];

    // Create 3 mock visual traits for each role and tier
    for (let i = 1; i <= 3; i++) {
      visualTraits.push(this.createMockVisualTrait(role, tier, i));
    }

    return visualTraits;
  }

  /**
   * Create a mock visual trait
   * @param role The role
   * @param tier The tier
   * @param index The index of the visual trait
   * @returns A mock visual trait
   */
  private createMockVisualTrait(role: Role, tier: Tier, index: number): VisualTrait {
    // Create a unique ID for the visual trait
    const id = `${role.toLowerCase()}_${tier}_visual_${index}`;

    // Create a name for the visual trait
    const name = `${role} ${Tier[tier]} Visual ${index}`;

    // Create a description for the visual trait
    const description = `A ${Tier[tier].toLowerCase()} visual trait for ${role.toLowerCase()} particles.`;

    // Create a particle appearance based on role and tier
    const particleAppearance = this.createMockParticleAppearance(role, tier);

    // Create an animation based on role and tier
    const animation = this.createMockAnimation(role, tier);

    // Create visual effects based on role and tier
    const effects = this.createMockVisualEffects(role, tier);

    // Create evolution parameters for higher tiers
    let evolutionParameters: import('../../types/visuals/visual').EvolutionParameters | undefined;
    if (tier >= Tier.RARE) {
      evolutionParameters = {
        confirmationThresholds: [1000, 5000, 10000],
        evolutionStages: [
          {
            name: 'Stage 1',
            description: 'First evolution stage',
            particleAppearance: {
              emissive: true,
              emissiveIntensity: 0.5
            }
          },
          {
            name: 'Stage 2',
            description: 'Second evolution stage',
            particleAppearance: {
              emissive: true,
              emissiveIntensity: 0.8
            },
            effects: [
              {
                type: VisualEffectType.GLOW,
                intensity: 0.5,
                trigger: VisualEffectTrigger.ALWAYS
              }
            ]
          }
        ]
      };
    }

    // Return the visual trait
    return {
      id,
      name,
      description,
      role,
      tier,
      particleAppearance,
      animation,
      effects,
      evolutionParameters
    };
  }

  /**
   * Create a mock particle appearance
   * @param role The role
   * @param tier The tier
   * @returns A mock particle appearance
   */
  private createMockParticleAppearance(role: Role, tier: Tier): ParticleAppearance {
    // Define role-specific colors
    const roleColors: Record<Role, string> = {
      [Role.CORE]: '#00FFFF', // Cyan
      [Role.ATTACK]: '#FF0000', // Red
      [Role.DEFENSE]: '#0000FF', // Blue
      [Role.CONTROL]: '#800080', // Purple
      [Role.MOVEMENT]: '#00FF00' // Green
    };

    // Define tier-specific size multipliers
    const tierSizeMultipliers: Record<Tier, number> = {
      [Tier.COMMON]: 1.0,
      [Tier.UNCOMMON]: 1.2,
      [Tier.RARE]: 1.4,
      [Tier.EPIC]: 1.6,
      [Tier.LEGENDARY]: 1.8,
      [Tier.MYTHIC]: 2.0
    };

    // Define role-specific shapes
    const roleShapes: Record<Role, ParticleShape> = {
      [Role.CORE]: ParticleShape.SPHERE,
      [Role.ATTACK]: ParticleShape.TETRAHEDRON,
      [Role.DEFENSE]: ParticleShape.CUBE,
      [Role.CONTROL]: ParticleShape.OCTAHEDRON,
      [Role.MOVEMENT]: ParticleShape.ICOSAHEDRON
    };

    // Create the particle appearance
    return {
      shape: roleShapes[role],
      size: 1.0 * tierSizeMultipliers[tier],
      color: roleColors[role],
      opacity: 0.8 + (Number(tier) * 0.04),
      emissive: tier >= Tier.EPIC,
      emissiveColor: tier >= Tier.EPIC ? roleColors[role] : undefined,
      emissiveIntensity: tier >= Tier.EPIC ? 0.5 + ((Number(tier) - Number(Tier.EPIC)) * 0.25) : undefined,
      roughness: 0.5,
      metalness: 0.3
    };
  }

  /**
   * Create a mock animation
   * @param role The role
   * @param tier The tier
   * @returns A mock animation
   */
  private createMockAnimation(role: Role, tier: Tier): Animation {
    // Define role-specific animation types
    const roleAnimationTypes: Record<Role, AnimationType> = {
      [Role.CORE]: AnimationType.PULSE,
      [Role.ATTACK]: AnimationType.SPIN,
      [Role.DEFENSE]: AnimationType.STATIC,
      [Role.CONTROL]: AnimationType.ORBIT,
      [Role.MOVEMENT]: AnimationType.WAVE
    };

    // Define tier-specific animation speed multipliers
    const tierSpeedMultipliers: Record<Tier, number> = {
      [Tier.COMMON]: 1.0,
      [Tier.UNCOMMON]: 1.2,
      [Tier.RARE]: 1.4,
      [Tier.EPIC]: 1.6,
      [Tier.LEGENDARY]: 1.8,
      [Tier.MYTHIC]: 2.0
    };

    // Create the animation
    return {
      type: roleAnimationTypes[role],
      speed: 1.0 * tierSpeedMultipliers[tier],
      parameters: this.createAnimationParameters(roleAnimationTypes[role], tier)
    };
  }

  /**
   * Create animation parameters
   * @param type The animation type
   * @param tier The tier
   * @returns Animation parameters
   */
  private createAnimationParameters(type: AnimationType, tier: Tier): Record<string, any> {
    // Get tier as number for calculations
    const tierValue = Number(tier);

    // Create parameters based on animation type
    switch (type) {
      case AnimationType.PULSE:
        return {
          minSize: 0.8,
          maxSize: 1.2 + (tierValue * 0.1),
          frequency: 1.0 + (tierValue * 0.2)
        };

      case AnimationType.SPIN:
        return {
          axis: { x: 0, y: 1, z: 0 },
          speed: 1.0 + (tierValue * 0.2)
        };

      case AnimationType.ORBIT:
        return {
          center: { x: 0, y: 0, z: 0 },
          radius: 2.0 + (tierValue * 0.5),
          speed: 1.0 + (tierValue * 0.2)
        };

      case AnimationType.WAVE:
        return {
          amplitude: 0.5 + (tierValue * 0.1),
          frequency: 1.0 + (tierValue * 0.2),
          direction: { x: 1, y: 0, z: 0 }
        };

      case AnimationType.FLICKER:
        return {
          minOpacity: 0.5,
          maxOpacity: 1.0,
          frequency: 2.0 + (tierValue * 0.5)
        };

      case AnimationType.TRAIL:
        return {
          length: 5 + (tierValue * 2),
          fadeRate: 0.1 - (tierValue * 0.01)
        };

      case AnimationType.STATIC:
        return {};

      default:
        return {};
    }
  }

  /**
   * Create mock visual effects
   * @param role The role
   * @param tier The tier
   * @returns An array of mock visual effects
   */
  private createMockVisualEffects(role: Role, tier: Tier): VisualEffect[] {
    const effects: VisualEffect[] = [];
    const tierValue = Number(tier);
    const rareValue = Number(Tier.RARE);
    const epicValue = Number(Tier.EPIC);
    const legendaryValue = Number(Tier.LEGENDARY);

    // Only add effects for higher tiers
    if (tier >= Tier.RARE) {
      // Define role-specific effect types
      const roleEffectTypes: Record<Role, VisualEffectType> = {
        [Role.CORE]: VisualEffectType.ENERGY,
        [Role.ATTACK]: VisualEffectType.FIRE,
        [Role.DEFENSE]: VisualEffectType.SHIELD,
        [Role.CONTROL]: VisualEffectType.AURA,
        [Role.MOVEMENT]: VisualEffectType.TRAIL
      };

      // Add a role-specific effect
      effects.push({
        type: roleEffectTypes[role],
        trigger: VisualEffectTrigger.ALWAYS,
        intensity: 0.5 + ((tierValue - rareValue) * 0.1),
        parameters: {}
      });

      // Add a movement effect for higher tiers
      if (tier >= Tier.EPIC) {
        effects.push({
          type: VisualEffectType.TRAIL,
          trigger: VisualEffectTrigger.MOVING,
          duration: 0.5,
          intensity: 0.7 + ((tierValue - epicValue) * 0.1),
          parameters: {
            length: 10 + ((tierValue - epicValue) * 5),
            fadeRate: 0.1
          }
        });
      }

      // Add an ability effect for legendary and mythic tiers
      if (tier >= Tier.LEGENDARY) {
        effects.push({
          type: VisualEffectType.BURST,
          trigger: VisualEffectTrigger.ABILITY_USE,
          duration: 0.3,
          intensity: 0.8 + ((tierValue - legendaryValue) * 0.1),
          parameters: {
            radius: 3.0 + ((tierValue - legendaryValue) * 1.0),
            particleCount: 20 + ((tierValue - legendaryValue) * 10)
          }
        });
      }
    }

    return effects;
  }

  /**
   * Lighten a color
   * @param hex The hex color code
   * @param amount The amount to lighten (0-1)
   * @returns The lightened hex color code
   */
  private lightenColor(hex: string, amount: number): string {
    // Remove the # if present
    hex = hex.replace('#', '');

    // Parse the hex color
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Lighten the color
    const newR = Math.min(255, r + Math.round((255 - r) * amount));
    const newG = Math.min(255, g + Math.round((255 - g) * amount));
    const newB = Math.min(255, b + Math.round((255 - b) * amount));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}

// Singleton instance
let visualBankLoaderInstance: VisualBankLoader | null = null;

/**
 * Get the visual bank loader instance
 * @returns The visual bank loader instance
 */
export function getVisualBankLoader(): VisualBankLoader {
  if (!visualBankLoaderInstance) {
    visualBankLoaderInstance = new VisualBankLoader();
  }
  return visualBankLoaderInstance;
}

