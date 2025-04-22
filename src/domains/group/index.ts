/**
 * Group Domain
 * 
 * This file is the entry point for the Group Domain.
 */
import { IGroupService } from './interfaces/groupService';
import { GroupService } from './services/groupService';
import { ParticleDistributionService } from './services/particleDistributionService';
import { ClassAssignmentService } from './services/classAssignmentService';
import { TraitAssignmentService } from './services/traitAssignmentService';

// Export all models, interfaces, and services
export * from './models';
export * from './interfaces';
export * from './services';
export * from './utils';
export * from './events';
export * from './constants';

/**
 * Creates a Group Service
 * @param rngService The RNG service
 * @param traitRepository The trait repository
 * @returns The Group Service
 */
export const createGroupService = (
  rngService: any,
  traitRepository: any
): IGroupService => {
  // Create services
  const particleDistributionService = new ParticleDistributionService(rngService);
  const classAssignmentService = new ClassAssignmentService(rngService);
  const traitAssignmentService = new TraitAssignmentService(rngService, traitRepository);
  
  // Create and return the Group Service
  return new GroupService(
    particleDistributionService,
    classAssignmentService,
    traitAssignmentService
  );
};
