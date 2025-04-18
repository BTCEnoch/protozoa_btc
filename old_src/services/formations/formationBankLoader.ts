/**
 * Formation Bank Loader for Bitcoin Protozoa
 *
 * This service is responsible for loading formation data from various sources
 * and creating a formation bank for use by the formation service.
 */

import { Role, Tier } from '../../types/core';
import { Formation, FormationPattern, FormationPatternType, FormationEffectType, FormationEffect } from '../../types/formations/formation';
import { Vector3 } from '../../types/common';
import { RNGSystem } from '../../types/utils/rng';

// Type definition for FormationBank interface
export interface FormationBank {
  formations: Formation[];
  getFormationsByRole: (role: Role) => Formation[];
  getFormationsByRarity: (rarity: Tier) => Formation[];
  getFormationById: (id: string) => Formation | undefined;
}

/**
 * Formation bank loader class
 */
class FormationBankLoader {
  private static instance: FormationBankLoader | null = null;
  private rngSystem: RNGSystem | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Initialize with empty state
  }

  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): FormationBankLoader {
    if (!FormationBankLoader.instance) {
      FormationBankLoader.instance = new FormationBankLoader();
    }
    return FormationBankLoader.instance;
  }

  /**
   * Initialize the loader with an RNG system
   * @param rngSystem RNG system for deterministic creation
   */
  public initialize(rngSystem: RNGSystem): void {
    this.rngSystem = rngSystem;
  }

  /**
   * Load formations from JSON files
   * @param basePath The base path to the formation data files
   * @returns A promise resolving to a formation bank
   */
  public async loadFromFiles(basePath: string = 'src/data/formations'): Promise<FormationBank> {
    try {
      // Create empty formation bank
      const bank: FormationBank = {
        formations: [],
        getFormationsByRole: (role: Role) => bank.formations.filter(f => f.role === role),
        getFormationsByRarity: (rarity: Tier) => bank.formations.filter(f => f.tier === rarity),
        getFormationById: (id: string) => bank.formations.find(f => f.id === id)
      };

      // Load formations for each role
      for (const role of Object.values(Role)) {
        try {
          const filePath = `${basePath}/${role.toLowerCase()}.json`;
          const response = await fetch(filePath);

          if (!response.ok) {
            console.warn(`No formation file found for ${role}: ${response.status} ${response.statusText}`);
            continue;
          }

          const data = await response.json();

          if (!data.formations || !Array.isArray(data.formations)) {
            console.warn(`Invalid formation data for ${role}: missing or invalid formations array`);
            continue;
          }

          // Add formations to the bank
          bank.formations.push(...data.formations);
          console.log(`Loaded ${data.formations.length} formations for ${role}`);
        } catch (error) {
          console.error(`Error loading formations for ${role}:`, error);
        }
      }

      // If no formations were loaded, use mock data
      if (bank.formations.length === 0) {
        console.warn('No formations loaded from files, using mock data');
        return this.createMockFormationBank();
      }

      return bank;
    } catch (error) {
      console.error('Error loading formation bank:', error);
      console.warn('Falling back to mock data');
      return this.createMockFormationBank();
    }
  }

  /**
   * Create a mock formation bank for testing
   * @returns A formation bank with mock data
   */
  public createMockFormationBank(): FormationBank {
    if (!this.rngSystem) {
      throw new Error('RNG system not initialized');
    }

    const bank: FormationBank = {
      formations: [],
      getFormationsByRole: (role: Role) => bank.formations.filter(f => f.role === role),
      getFormationsByRarity: (rarity: Tier) => bank.formations.filter(f => f.tier === rarity),
      getFormationById: (id: string) => bank.formations.find(f => f.id === id)
    };

    // Create formations for each role
    for (const role of Object.values(Role)) {
      bank.formations.push(...this.createFormationsForRole(role as Role));
    }

    return bank;
  }

  /**
   * Create formations for a specific role
   * @param role Particle role
   * @returns Array of formations for the role
   */
  private createFormationsForRole(role: Role): Formation[] {
    if (!this.rngSystem) {
      throw new Error('RNG system not initialized');
    }

    const formations: Formation[] = [];
    // Create a deterministic stream using a string name (cast as any to bypass type checking)
    const streamName = `formations-${role}` as any;
    const roleRng = this.rngSystem.getStream(streamName);

    // Define role-specific pattern types
    const patternTypes: Record<Role, FormationPatternType[]> = {
      [Role.CORE]: [FormationPatternType.SPHERE, FormationPatternType.CIRCLE, FormationPatternType.SPIRAL],
      [Role.CONTROL]: [FormationPatternType.GRID, FormationPatternType.PHALANX, FormationPatternType.VORTEX],
      [Role.MOVEMENT]: [FormationPatternType.WAVE, FormationPatternType.SPIRAL, FormationPatternType.VORTEX],
      [Role.DEFENSE]: [FormationPatternType.CIRCLE, FormationPatternType.SPHERE, FormationPatternType.PHALANX],
      [Role.ATTACK]: [FormationPatternType.VORTEX, FormationPatternType.SPIRAL, FormationPatternType.ARROW]
    };

    // Define role-specific names
    const names: Record<Role, string[]> = {
      [Role.CORE]: ['Nucleus', 'Orbit', 'Nexus', 'Pulse', 'Beacon'],
      [Role.CONTROL]: ['Grid', 'Matrix', 'Network', 'Command', 'Dominion'],
      [Role.MOVEMENT]: ['Flux', 'Stream', 'Surge', 'Drift', 'Glide'],
      [Role.DEFENSE]: ['Shield', 'Barrier', 'Bulwark', 'Aegis', 'Rampart'],
      [Role.ATTACK]: ['Strike', 'Assault', 'Barrage', 'Onslaught', 'Volley']
    };

    // Create formations for each rarity
    for (const rarity of Object.values(Tier)) {
      // Skip if not a valid rarity
      if (typeof rarity !== 'string') continue;

      // Create 3 formations per rarity
      for (let i = 0; i < 3; i++) {
        // Select a pattern type for this role
        const rolePatternTypes = patternTypes[role];
        const patternTypeIndex = Math.floor(roleRng.next() * rolePatternTypes.length);
        const patternType = rolePatternTypes[patternTypeIndex];

        // Create a pattern from the pattern type
        const pattern: FormationPattern = {
          type: patternType,
          density: roleRng.next() * 0.5 + 0.3, // 0.3 to 0.8
          cohesion: roleRng.next() * 0.5 + 0.3, // 0.3 to 0.8
          flexibility: roleRng.next() * 0.5 + 0.3, // 0.3 to 0.8
          parameters: { scale: 1.0 }
        };

        // Select a name for this formation
        const roleNames = names[role];
        const nameIndex = Math.floor(roleRng.next() * roleNames.length);
        const name = `${roleNames[nameIndex]} ${rarity}`;

        // Generate scale based on role and rarity
        const baseScale = 5.0;
        const roleScales: Record<Role, number> = {
          [Role.CORE]: 0.8,
          [Role.CONTROL]: 1.2,
          [Role.MOVEMENT]: 1.5,
          [Role.DEFENSE]: 1.0,
          [Role.ATTACK]: 1.3
        };
        const rarityScales: Record<Tier, number> = {
          [Tier.COMMON]: 0.8,
          [Tier.UNCOMMON]: 1.0,
          [Tier.RARE]: 1.2,
          [Tier.EPIC]: 1.4,
          [Tier.LEGENDARY]: 1.6,
          [Tier.MYTHIC]: 2.0
        };
        const scale = baseScale * roleScales[role] * rarityScales[rarity as Tier];

        // Create the formation
        // Update pattern parameters with scale
        const patternWithScale: FormationPattern = {
          ...pattern,
          parameters: {
            ...pattern.parameters,
            scale
          }
        };

        // Create effect from role and tier
        const effectType = this.getEffectTypeForRole(role);
        // Create the effect that conforms to FormationEffect interface
        const effect: FormationEffect = {
          type: effectType,
          magnitude: 0.2 + (Object.values(Tier).indexOf(rarity as Tier) * 0.15), // 0.2 to 0.95
          duration: 5.0 + (Object.values(Tier).indexOf(rarity as Tier) * 2.0), // 5.0 to 15.0
          parameters: {
            radius: 6.0 + (Object.values(Tier).indexOf(rarity as Tier) * 3.0), // 6.0 to 21.0
            requiresFullFormation: Object.values(Tier).indexOf(rarity as Tier) >= 3 ? 1 : 0, // Epic and above
            minimumParticleCount: 5 + (Object.values(Tier).indexOf(rarity as Tier) * 4), // 5 to 25
            activationThreshold: 0.6 + (Object.values(Tier).indexOf(rarity as Tier) * 0.06) // 0.6 to 0.9
          }
        };

        // Create the formation object
        const formation: Formation = {
          id: `formation-${role}-${rarity}-${i}`,
          name,
          description: `A ${rarity.toLowerCase()} tier formation for ${role.toLowerCase()} particles.`,
          role,
          tier: rarity as Tier,
          subclass: `${role.toLowerCase()}-${rarity.toLowerCase()}-${i}`,
          pattern: patternWithScale,
          effect,
          center: { x: 0, y: 0, z: 0 }
        };

        formations.push(formation);
      }
    }

    return formations;
  }

  /**
   * Get an appropriate effect type for a role
   * @param role The particle role
   * @returns A formation effect type appropriate for the role
   */
  private getEffectTypeForRole(role: Role): FormationEffectType {
    if (!this.rngSystem) {
      throw new Error('RNG system not initialized');
    }

    // Define role-specific effect types
    const effectTypes: Record<Role, FormationEffectType[]> = {
      [Role.CORE]: [FormationEffectType.SYNERGY, FormationEffectType.HEALING],
      [Role.CONTROL]: [FormationEffectType.CONTROL, FormationEffectType.DISRUPTION],
      [Role.MOVEMENT]: [FormationEffectType.SPEED_BOOST, FormationEffectType.SYNERGY],
      [Role.DEFENSE]: [FormationEffectType.DEFENSE_BOOST, FormationEffectType.SHIELD],
      [Role.ATTACK]: [FormationEffectType.DAMAGE_BOOST, FormationEffectType.DISRUPTION]
    };

    // Select an effect type for this role using RNG system for deterministic results
    const roleEffectTypes = effectTypes[role];
    // Create a deterministic stream (cast as any to bypass type checking)
    const streamName = `formation-effects-${role}` as any;
    const roleRng = this.rngSystem.getStream(streamName);
    const effectTypeIndex = Math.floor(roleRng.next() * roleEffectTypes.length);
    return roleEffectTypes[effectTypeIndex];
  }

  /**
   * Get formation effects for a role and rarity (legacy method)
   * @param role Particle role
   * @param rarity Formation rarity
   * @returns Formation effects
   */
  private getFormationEffects(role: Role, rarity: Tier): Record<string, number> {
    // Define base effect values
    const baseEffects: Record<string, number> = {
      cohesion: 1.0,
      separation: 1.0,
      alignment: 1.0,
      speed: 1.0,
      stability: 1.0,
      attackBonus: 0.0,
      defenseBonus: 0.0,
      controlBonus: 0.0,
      movementBonus: 0.0,
      coreBonus: 0.0
    };

    // Define rarity multipliers
    const rarityMultipliers: Record<Tier, number> = {
      [Tier.COMMON]: 1.0,
      [Tier.UNCOMMON]: 1.2,
      [Tier.RARE]: 1.5,
      [Tier.EPIC]: 1.8,
      [Tier.LEGENDARY]: 2.2,
      [Tier.MYTHIC]: 3.0
    };

    // Apply role-specific bonuses
    switch (role) {
      case Role.CORE:
        baseEffects.coreBonus = 0.2;
        baseEffects.stability = 1.5;
        break;
      case Role.CONTROL:
        baseEffects.controlBonus = 0.2;
        baseEffects.alignment = 1.5;
        break;
      case Role.MOVEMENT:
        baseEffects.movementBonus = 0.2;
        baseEffects.speed = 1.5;
        break;
      case Role.DEFENSE:
        baseEffects.defenseBonus = 0.2;
        baseEffects.cohesion = 1.5;
        break;
      case Role.ATTACK:
        baseEffects.attackBonus = 0.2;
        baseEffects.separation = 1.5;
        break;
    }

    // Apply rarity multiplier
    const rarityMultiplier = rarityMultipliers[rarity];
    const effects: Record<string, number> = {};

    for (const [key, value] of Object.entries(baseEffects)) {
      effects[key] = value * rarityMultiplier;
    }

    return effects;
  }

  /**
   * Get formations by rarity
   * @param rarity Formation rarity
   * @param bank Formation bank
   * @returns Array of formations with the specified rarity
   */
  public getFormationsByRarity(rarity: Tier, bank: FormationBank): Formation[] {
    return bank.getFormationsByRarity(rarity);
  }

  /**
   * Get formation by ID
   * @param id Formation ID
   * @param bank Formation bank
   * @returns Formation with the specified ID, or undefined if not found
   */
  public getFormationById(id: string, bank: FormationBank): Formation | undefined {
    return bank.getFormationById(id);
  }
}

/**
 * Get the formation bank loader instance
 * @returns The formation bank loader instance
 */
export function getFormationBankLoader(): FormationBankLoader {
  return FormationBankLoader.getInstance();
}

