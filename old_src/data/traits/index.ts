// Trait data index file
// This file exports all trait data for the Bitcoin Protozoa project

// Visual Traits
export { CORE_VISUAL_TRAITS } from './coreVisualTraits';
export { CONTROL_VISUAL_TRAITS } from './controlVisualTraits';
export { ATTACK_VISUAL_TRAITS } from './attackVisualTraits';
export { DEFENSE_VISUAL_TRAITS } from './defenseVisualTraits';
export { MOVEMENT_VISUAL_TRAITS } from './movementVisualTraits';

// Formation Traits
export { CORE_FORMATION_TRAITS } from './coreFormationTraits';
export { CONTROL_FORMATION_TRAITS } from './controlFormationTraits';
export { ATTACK_FORMATION_TRAITS } from './attackFormationTraits';
export { DEFENSE_FORMATION_TRAITS } from './defenseFormationTraits';
export { MOVEMENT_FORMATION_TRAITS } from './movementFormationTraits';

// Behavior Traits
export { CORE_BEHAVIOR_TRAITS } from './coreBehaviorTraits';
export { CONTROL_BEHAVIOR_TRAITS } from './controlBehaviorTraits';
export { ATTACK_BEHAVIOR_TRAITS } from './attackBehaviorTraits';
export { DEFENSE_BEHAVIOR_TRAITS } from './defenseBehaviorTraits';
export { MOVEMENT_BEHAVIOR_TRAITS } from './movementBehaviorTraits';

// Class Bonus Traits
export { CORE_CLASS_BONUS_TRAITS } from './coreClassBonusTraits';
export { CONTROL_CLASS_BONUS_TRAITS } from './controlClassBonusTraits';
export { ATTACK_CLASS_BONUS_TRAITS } from './attackClassBonusTraits';
export { DEFENSE_CLASS_BONUS_TRAITS } from './defenseClassBonusTraits';
export { MOVEMENT_CLASS_BONUS_TRAITS } from './movementClassBonusTraits';

// Force Calculation Traits
export { CORE_FORCE_CALCULATION_TRAITS } from './coreForceCalculationTraits';
export { CONTROL_FORCE_CALCULATION_TRAITS } from './controlForceCalculationTraits';
export { ATTACK_FORCE_CALCULATION_TRAITS } from './attackForceCalculationTraits';
export { DEFENSE_FORCE_CALCULATION_TRAITS } from './defenseForceCalculationTraits';
export { MOVEMENT_FORCE_CALCULATION_TRAITS } from './movementForceCalculationTraits';

// Subclass Traits
export { CORE_SUBCLASS_TRAITS } from './coreSubclassTraits';
export { CONTROL_SUBCLASS_TRAITS } from './controlSubclassTraits';
export { ATTACK_SUBCLASS_TRAITS } from './attackSubclassTraits';
export { DEFENSE_SUBCLASS_TRAITS } from './defenseSubclassTraits';
export { MOVEMENT_SUBCLASS_TRAITS } from './movementSubclassTraits';

// Trait Maps by Role
export const VISUAL_TRAITS_BY_ROLE = {
  CORE: CORE_VISUAL_TRAITS,
  CONTROL: CONTROL_VISUAL_TRAITS,
  ATTACK: ATTACK_VISUAL_TRAITS,
  DEFENSE: DEFENSE_VISUAL_TRAITS,
  MOVEMENT: MOVEMENT_VISUAL_TRAITS
};

export const FORMATION_TRAITS_BY_ROLE = {
  CORE: CORE_FORMATION_TRAITS,
  CONTROL: CONTROL_FORMATION_TRAITS,
  ATTACK: ATTACK_FORMATION_TRAITS,
  DEFENSE: DEFENSE_FORMATION_TRAITS,
  MOVEMENT: MOVEMENT_FORMATION_TRAITS
};

export const BEHAVIOR_TRAITS_BY_ROLE = {
  CORE: CORE_BEHAVIOR_TRAITS,
  CONTROL: CONTROL_BEHAVIOR_TRAITS,
  ATTACK: ATTACK_BEHAVIOR_TRAITS,
  DEFENSE: DEFENSE_BEHAVIOR_TRAITS,
  MOVEMENT: MOVEMENT_BEHAVIOR_TRAITS
};

export const CLASS_BONUS_TRAITS_BY_ROLE = {
  CORE: CORE_CLASS_BONUS_TRAITS,
  CONTROL: CONTROL_CLASS_BONUS_TRAITS,
  ATTACK: ATTACK_CLASS_BONUS_TRAITS,
  DEFENSE: DEFENSE_CLASS_BONUS_TRAITS,
  MOVEMENT: MOVEMENT_CLASS_BONUS_TRAITS
};

export const FORCE_CALCULATION_TRAITS_BY_ROLE = {
  CORE: CORE_FORCE_CALCULATION_TRAITS,
  CONTROL: CONTROL_FORCE_CALCULATION_TRAITS,
  ATTACK: ATTACK_FORCE_CALCULATION_TRAITS,
  DEFENSE: DEFENSE_FORCE_CALCULATION_TRAITS,
  MOVEMENT: MOVEMENT_FORCE_CALCULATION_TRAITS
};

export const SUBCLASS_TRAITS_BY_ROLE = {
  CORE: CORE_SUBCLASS_TRAITS,
  CONTROL: CONTROL_SUBCLASS_TRAITS,
  ATTACK: ATTACK_SUBCLASS_TRAITS,
  DEFENSE: DEFENSE_SUBCLASS_TRAITS,
  MOVEMENT: MOVEMENT_SUBCLASS_TRAITS
};
