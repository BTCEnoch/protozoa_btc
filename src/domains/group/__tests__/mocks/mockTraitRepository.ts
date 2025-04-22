/**
 * Mock Trait Repository
 * 
 * This file provides a mock implementation of the Trait Repository for testing.
 */
import { Role, Rarity } from '../../../../shared/types/core';
import { GroupTrait, GroupTraitType } from '../../models/traits';

/**
 * MockTraitRepository class
 * A mock implementation of the Trait Repository for testing
 */
export class MockTraitRepository {
  private traits: Map<string, GroupTrait[]>;
  
  /**
   * Constructor
   */
  constructor() {
    this.traits = new Map();
    this.initializeTraits();
  }
  
  /**
   * Gets traits by role and rarity
   * @param role The role
   * @param rarity The rarity
   * @returns The traits
   */
  public getTraitsByRoleAndRarity(role: Role, rarity: Rarity): GroupTrait[] {
    const key = `${role}-${rarity}`;
    return this.traits.get(key) || [];
  }
  
  /**
   * Initializes the traits
   */
  private initializeTraits(): void {
    for (const role of Object.values(Role)) {
      for (const rarity of Object.values(Rarity)) {
        const key = `${role}-${rarity}`;
        const traits = this.createMockTraits(role, rarity);
        this.traits.set(key, traits);
      }
    }
  }
  
  /**
   * Creates mock traits for a role and rarity
   * @param role The role
   * @param rarity The rarity
   * @returns The mock traits
   */
  private createMockTraits(role: Role, rarity: Rarity): GroupTrait[] {
    const traits: GroupTrait[] = [];
    
    // Create 3 traits for each role and rarity
    for (let i = 1; i <= 3; i++) {
      const traitId = `${role}-${rarity}-${i}`;
      const traitName = `${role} ${rarity} Trait ${i}`;
      const traitDescription = `A ${rarity.toLowerCase()} trait for ${role.toLowerCase()} groups`;
      const traitType = this.getTraitType(i);
      const effectValue = this.getEffectValue(rarity);
      
      const trait: GroupTrait = {
        id: traitId,
        name: traitName,
        description: traitDescription,
        type: traitType,
        rarity,
        effect: `Increases ${role.toLowerCase()} effectiveness by ${effectValue}%`,
        modifiers: {
          [role.toLowerCase()]: effectValue / 100
        }
      };
      
      traits.push(trait);
    }
    
    return traits;
  }
  
  /**
   * Gets a trait type based on an index
   * @param index The index
   * @returns The trait type
   */
  private getTraitType(index: number): GroupTraitType {
    const types = Object.values(GroupTraitType);
    return types[index % types.length];
  }
  
  /**
   * Gets the effect value based on the rarity
   * @param rarity The rarity
   * @returns The effect value
   */
  private getEffectValue(rarity: Rarity): number {
    switch (rarity) {
      case Rarity.COMMON:
        return 5;
      case Rarity.UNCOMMON:
        return 10;
      case Rarity.RARE:
        return 15;
      case Rarity.EPIC:
        return 20;
      case Rarity.LEGENDARY:
        return 25;
      case Rarity.MYTHIC:
        return 30;
      default:
        return 5;
    }
  }
}
