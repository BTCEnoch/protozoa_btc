/**
 * Trait Factory for Bitcoin Protozoa
 *
 * This factory is responsible for creating traits for particle groups.
 * It ensures deterministic trait creation based on Bitcoin block data.
 */

import { Role } from '../../types/core';
import { RNGSystem } from '../../types/utils/rng';
import { BaseTrait, BehaviorTrait, ClassBonusTrait, ForceCalculationTrait, FormationTrait, SubclassTrait, TraitBank, VisualTrait } from '../../types/traits/trait';
import { createRNGFromBlockNonce } from '../../lib/rngSystem';

/**
 * Trait Factory class
 */
export class TraitFactory {
  private rngSystem: RNGSystem;
  private traitBank: TraitBank | null = null;

  /**
   * Constructor
   * @param nonce The Bitcoin block nonce to use for RNG
   * @param traitBank Optional trait bank to use
   */
  constructor(nonce: number, traitBank?: TraitBank) {
    this.rngSystem = createRNGFromBlockNonce(nonce);
    this.traitBank = traitBank || null;
  }

  /**
   * Set the trait bank
   * @param traitBank The trait bank to use
   */
  public setTraitBank(traitBank: TraitBank): void {
    this.traitBank = traitBank;
  }

  /**
   * Create a visual trait for a role
   * @param role The particle role
   * @returns A visual trait
   */
  public createVisualTrait(role: Role): VisualTrait {
    if (!this.traitBank) {
      throw new Error('Trait bank not set');
    }

    const visualRng = this.rngSystem.getStream('visual');
    const visualTraits = this.traitBank.visualTraits[role];

    if (!visualTraits || visualTraits.length === 0) {
      throw new Error(`No visual traits available for role ${role}`);
    }

    return visualRng.nextItem(visualTraits);
  }

  /**
   * Create a formation trait for a role
   * @param role The particle role
   * @returns A formation trait
   */
  public createFormationTrait(role: Role): FormationTrait {
    if (!this.traitBank) {
      throw new Error('Trait bank not set');
    }

    const formationRng = this.rngSystem.getStream('formation');
    const formationTraits = this.traitBank.formationTraits[role];

    if (!formationTraits || formationTraits.length === 0) {
      throw new Error(`No formation traits available for role ${role}`);
    }

    return formationRng.nextItem(formationTraits);
  }

  /**
   * Create a behavior trait for a role
   * @param role The particle role
   * @returns A behavior trait
   */
  public createBehaviorTrait(role: Role): BehaviorTrait {
    if (!this.traitBank) {
      throw new Error('Trait bank not set');
    }

    const behaviorRng = this.rngSystem.getStream('behavior');
    const behaviorTraits = this.traitBank.behaviorTraits[role];

    if (!behaviorTraits || behaviorTraits.length === 0) {
      throw new Error(`No behavior traits available for role ${role}`);
    }

    return behaviorRng.nextItem(behaviorTraits);
  }

  /**
   * Create a class bonus trait for a role
   * @param role The particle role
   * @returns A class bonus trait
   */
  public createClassBonusTrait(role: Role): ClassBonusTrait {
    if (!this.traitBank) {
      throw new Error('Trait bank not set');
    }

    const classBonusRng = this.rngSystem.getStream('classBonus');
    const classBonusTraits = this.traitBank.classBonusTraits[role];

    if (!classBonusTraits || classBonusTraits.length === 0) {
      throw new Error(`No class bonus traits available for role ${role}`);
    }

    return classBonusRng.nextItem(classBonusTraits);
  }

  /**
   * Create a force calculation trait for a role
   * @param role The particle role
   * @returns A force calculation trait
   */
  public createForceCalculationTrait(role: Role): ForceCalculationTrait {
    if (!this.traitBank) {
      throw new Error('Trait bank not set');
    }

    const forceCalculationRng = this.rngSystem.getStream('forceCalculation');
    const forceCalculationTraits = this.traitBank.forceCalculationTraits[role];

    if (!forceCalculationTraits || forceCalculationTraits.length === 0) {
      throw new Error(`No force calculation traits available for role ${role}`);
    }

    return forceCalculationRng.nextItem(forceCalculationTraits);
  }

  /**
   * Create a subclass trait for a role
   * @param role The particle role
   * @returns A subclass trait or undefined if none available
   */
  public createSubclassTrait(role: Role): SubclassTrait | undefined {
    if (!this.traitBank) {
      throw new Error('Trait bank not set');
    }

    const subclassRng = this.rngSystem.getStream('subclass');
    const subclassTraits = this.traitBank.subclassTraits[role];

    if (!subclassTraits || subclassTraits.length === 0) {
      return undefined;
    }

    return subclassRng.nextItem(subclassTraits);
  }

  /**
   * Create all traits for a role
   * @param role The particle role
   * @returns An object containing all traits for the role
   */
  public createAllTraits(role: Role): {
    visual: VisualTrait;
    formation: FormationTrait;
    behavior: BehaviorTrait;
    classBonus: ClassBonusTrait;
    forceCalculation: ForceCalculationTrait;
    subclass?: SubclassTrait;
  } {
    return {
      visual: this.createVisualTrait(role),
      formation: this.createFormationTrait(role),
      behavior: this.createBehaviorTrait(role),
      classBonus: this.createClassBonusTrait(role),
      forceCalculation: this.createForceCalculationTrait(role),
      subclass: this.createSubclassTrait(role)
    };
  }
}

/**
 * Create a trait factory
 * @param nonce The Bitcoin block nonce to use for RNG
 * @param traitBank Optional trait bank to use
 * @returns A trait factory
 */
export function createTraitFactory(nonce: number, traitBank?: TraitBank): TraitFactory {
  return new TraitFactory(nonce, traitBank);
}

