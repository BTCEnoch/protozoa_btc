/**
 * Types index
 *
 * This file exports all types for the Bitcoin Protozoa project.
 */

// Core and common types - Renaming exports to avoid ambiguity
export * as CoreTypes from './core';
export * as CommonTypes from './common';
export * as ConfigTypes from './config';

// Domain-specific types - Use namespaces to avoid ambiguity
export * as AbilityTypes from './abilities';
export * as BehaviorTypes from './behaviors';
export * as BitcoinTypes from './bitcoin';
export * as CreatureTypes from './creatures';
export * as EventTypes from './events';
// Export from evolution once it has actual exports
// export * as EvolutionTypes from './evolution';
export * as FormationTypes from './formations';
export * as GameTheoryTypes from './gameTheory';
export * as MutationTypes from './mutations';
export * as ParticleTypes from './particles';
// Export from storage once it has actual exports
// export * as StorageTypes from './storage';
export * as TraitTypes from './traits';
export * as UtilTypes from './utils';
export * as VisualTypes from './visuals';

// Technical systems
export * as RenderingTypes from './rendering';
export * as WorkerTypes from './workers';

// Re-export specific types that are used frequently
// Add specific re-exports as needed
