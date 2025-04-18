/**
 * Entanglement Service for Bitcoin Protozoa
 *
 * This service manages quantum entanglement between particle groups.
 * It allows sharing attributes and cooldown reductions between groups.
 */

import { ParticleGroup, EntanglementLink } from '../../types/particles/particle';
import { getConfigLoader } from '../config';
import { getParticleService } from './particleService';

/**
 * Entanglement Service class
 */
class EntanglementService {
  private static instance: EntanglementService | null = null;
  private initialized = false;
  private entanglementLinks: Map<string, EntanglementLink[]> = new Map();
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance
   * @returns The singleton instance
   */
  public static getInstance(): EntanglementService {
    if (!EntanglementService.instance) {
      EntanglementService.instance = new EntanglementService();
    }
    return EntanglementService.instance;
  }
  
  /**
   * Initialize the service
   */
  public initialize(): void {
    if (this.initialized) {
      console.warn('Entanglement Service already initialized');
      return;
    }
    
    this.initialized = true;
    console.log('Entanglement Service initialized');
  }
  
  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Create an entanglement link between two particle groups
   * @param sourceGroupId Source group ID
   * @param targetGroupId Target group ID
   * @param attributeSharePercentage Percentage of attributes to share
   * @param cooldownReductionPercentage Percentage of cooldown reduction
   * @returns True if the link was created, false otherwise
   */
  public createEntanglementLink(
    sourceGroupId: string,
    targetGroupId: string,
    attributeSharePercentage: number,
    cooldownReductionPercentage: number
  ): boolean {
    // Check if the service is initialized
    if (!this.initialized) {
      console.error('Entanglement Service not initialized');
      return false;
    }
    
    // Check if the groups exist
    const sourceGroup = getParticleService().getGroup(sourceGroupId);
    const targetGroup = getParticleService().getGroup(targetGroupId);
    
    if (!sourceGroup || !targetGroup) {
      console.error('Source or target group not found');
      return false;
    }
    
    // Check if the link already exists
    const sourceLinks = this.entanglementLinks.get(sourceGroupId) || [];
    const existingLink = sourceLinks.find(link => link.targetGroupId === targetGroupId);
    
    if (existingLink) {
      console.warn('Entanglement link already exists');
      return false;
    }
    
    // Get entanglement config
    let maxLinks = 5;
    let maxSharePercentage = 0.5;
    let cooldownReductionCap = 0.75;
    
    try {
      const entanglementConfig = getConfigLoader().getEntanglementConfig();
      maxLinks = entanglementConfig.maxLinks;
      maxSharePercentage = entanglementConfig.maxSharePercentage;
      cooldownReductionCap = entanglementConfig.cooldownReductionCap;
    } catch (error) {
      console.warn('Error getting entanglement config:', error);
    }
    
    // Check if the source group has reached the maximum number of links
    if (sourceLinks.length >= maxLinks) {
      console.warn(`Source group has reached the maximum number of links (${maxLinks})`);
      return false;
    }
    
    // Clamp the share percentages
    const clampedAttributeShare = Math.max(0, Math.min(maxSharePercentage, attributeSharePercentage));
    const clampedCooldownReduction = Math.max(0, Math.min(cooldownReductionCap, cooldownReductionPercentage));
    
    // Create the entanglement link
    const link: EntanglementLink = {
      sourceGroupId,
      targetGroupId,
      attributeSharePercentage: clampedAttributeShare,
      cooldownReductionPercentage: clampedCooldownReduction
    };
    
    // Add the link to the source group
    sourceLinks.push(link);
    this.entanglementLinks.set(sourceGroupId, sourceLinks);
    
    // Add the link to the source group's entanglement links
    if (!sourceGroup.entanglementLinks) {
      sourceGroup.entanglementLinks = [];
    }
    sourceGroup.entanglementLinks.push(link);
    
    console.log(`Created entanglement link from ${sourceGroupId} to ${targetGroupId}`);
    return true;
  }
  
  /**
   * Remove an entanglement link
   * @param sourceGroupId Source group ID
   * @param targetGroupId Target group ID
   * @returns True if the link was removed, false otherwise
   */
  public removeEntanglementLink(
    sourceGroupId: string,
    targetGroupId: string
  ): boolean {
    // Check if the service is initialized
    if (!this.initialized) {
      console.error('Entanglement Service not initialized');
      return false;
    }
    
    // Check if the source group has any links
    const sourceLinks = this.entanglementLinks.get(sourceGroupId);
    
    if (!sourceLinks) {
      console.warn('Source group has no entanglement links');
      return false;
    }
    
    // Find the link
    const linkIndex = sourceLinks.findIndex(link => link.targetGroupId === targetGroupId);
    
    if (linkIndex === -1) {
      console.warn('Entanglement link not found');
      return false;
    }
    
    // Remove the link from the source group
    sourceLinks.splice(linkIndex, 1);
    
    if (sourceLinks.length === 0) {
      this.entanglementLinks.delete(sourceGroupId);
    } else {
      this.entanglementLinks.set(sourceGroupId, sourceLinks);
    }
    
    // Remove the link from the source group's entanglement links
    const sourceGroup = getParticleService().getGroup(sourceGroupId);
    
    if (sourceGroup && sourceGroup.entanglementLinks) {
      const groupLinkIndex = sourceGroup.entanglementLinks.findIndex(link => link.targetGroupId === targetGroupId);
      
      if (groupLinkIndex !== -1) {
        sourceGroup.entanglementLinks.splice(groupLinkIndex, 1);
      }
    }
    
    console.log(`Removed entanglement link from ${sourceGroupId} to ${targetGroupId}`);
    return true;
  }
  
  /**
   * Get all entanglement links for a group
   * @param groupId Group ID
   * @returns Array of entanglement links
   */
  public getEntanglementLinks(groupId: string): EntanglementLink[] {
    return this.entanglementLinks.get(groupId) || [];
  }
  
  /**
   * Apply entanglement effects to a group
   * @param group Particle group
   */
  public applyEntanglementEffects(group: ParticleGroup): void {
    // Check if the service is initialized
    if (!this.initialized) {
      return;
    }
    
    // Check if the group has entanglement links
    if (!group.entanglementLinks || group.entanglementLinks.length === 0) {
      return;
    }
    
    // Apply entanglement effects for each link
    for (const link of group.entanglementLinks) {
      this.applyEntanglementLink(group, link);
    }
  }
  
  /**
   * Apply an entanglement link to a group
   * @param sourceGroup Source group
   * @param link Entanglement link
   */
  private applyEntanglementLink(
    sourceGroup: ParticleGroup,
    link: EntanglementLink
  ): void {
    // Get the target group
    const targetGroup = getParticleService().getGroup(link.targetGroupId);
    
    if (!targetGroup) {
      console.warn(`Target group ${link.targetGroupId} not found`);
      return;
    }
    
    // Apply attribute sharing
    if (link.attributeSharePercentage > 0) {
      this.shareAttributes(sourceGroup, targetGroup, link.attributeSharePercentage);
    }
    
    // Apply cooldown reduction (not implemented yet)
    if (link.cooldownReductionPercentage > 0) {
      // TODO: Implement cooldown reduction
    }
  }
  
  /**
   * Share attributes between groups
   * @param sourceGroup Source group
   * @param targetGroup Target group
   * @param sharePercentage Percentage of attributes to share
   */
  private shareAttributes(
    sourceGroup: ParticleGroup,
    targetGroup: ParticleGroup,
    sharePercentage: number
  ): void {
    // Get the attributes from the target group
    const targetAttributes = targetGroup.attributes;
    
    // Apply the shared attributes to the source group
    for (const [key, value] of Object.entries(targetAttributes)) {
      // Skip if the source group doesn't have this attribute
      if (!(key in sourceGroup.attributes)) {
        continue;
      }
      
      // Calculate the shared value
      const sharedValue = value * sharePercentage;
      
      // Add the shared value to the source group's attribute
      sourceGroup.attributes[key] += sharedValue;
    }
  }
  
  /**
   * Reset the service
   */
  public reset(): void {
    this.entanglementLinks.clear();
    this.initialized = false;
  }
}

/**
 * Get the entanglement service instance
 * @returns The entanglement service instance
 */
export function getEntanglementService(): EntanglementService {
  return EntanglementService.getInstance();
}
