/**
 * Hash Utilities for Bitcoin Protozoa
 * 
 * This file provides utilities for hashing data.
 */

/**
 * Simple string hash function
 * @param str The string to hash
 * @returns A numeric hash value
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * FNV-1a hash function
 * @param str The string to hash
 * @returns A numeric hash value
 */
export function fnv1aHash(str: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * djb2 hash function
 * @param str The string to hash
 * @returns A numeric hash value
 */
export function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * sdbm hash function
 * @param str The string to hash
 * @returns A numeric hash value
 */
export function sdbmHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Combine multiple hash values
 * @param hashes Hash values to combine
 * @returns A combined hash value
 */
export function combineHashes(...hashes: number[]): number {
  return hashes.reduce((acc, hash) => acc ^ hash, 0);
}

/**
 * Hash a number
 * @param num The number to hash
 * @returns A numeric hash value
 */
export function hashNumber(num: number): number {
  return Math.abs((num * 9301 + 49297) % 233280);
}
