/**
 * Behaviors Services Index for Bitcoin Protozoa
 * 
 * This file exports all behavior-related services.
 */

// Export behavior service
export { getBehaviorService } from './behaviorService';

// Export behavior bank loader
export { BehaviorBankLoader, getBehaviorBankLoader } from './behaviorBankLoader';

// Export behavior factory
export { BehaviorFactory, getBehaviorFactory } from './behaviorFactory';

// Export behavior generators
export * from './behaviorGenerators';
