/**
 * Formation Patterns Index
 *
 * This file exports all formation pattern data.
 */

// Import JSON pattern data
import corePatterns from './core.json';
import attackPatterns from './attack.json';
import defensePatterns from './defense.json';
import controlPatterns from './control.json';
import movementPatterns from './movement.json';

// Export pattern data
export const formationPatterns = {
  core: corePatterns,
  attack: attackPatterns,
  defense: defensePatterns,
  control: controlPatterns,
  movement: movementPatterns
};

// Export individual pattern sets
export const coreFormationPatterns = corePatterns;
export const attackFormationPatterns = attackPatterns;
export const defenseFormationPatterns = defensePatterns;
export const controlFormationPatterns = controlPatterns;
export const movementFormationPatterns = movementPatterns;

// Export default as combined patterns
export default formationPatterns;
