/**
 * Bitcoin Types for Bitcoin Protozoa
 *
 * This file contains the types related to Bitcoin block data.
 */

/**
 * BlockData interface
 * Defines the minimal data structure for Bitcoin block data needed for creature generation
 */
export interface BlockData {
  nonce: number;
  confirmations: number;
  height?: number;
}

/**
 * BlockInfo interface
 * Defines the comprehensive data structure for Bitcoin block info
 */
export interface BlockInfo {
  height: number;
  hash: string;
  nonce: number;
  confirmations: number;
  timestamp: number;
  difficulty: number;
  merkleRoot: string;
  version: number;
  bits: string;
  size: number;
  weight: number;
  transactions: number;
}
