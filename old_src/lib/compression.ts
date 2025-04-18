/**
 * Compression utilities for Bitcoin Protozoa
 * 
 * This module provides functions for compressing and decompressing data
 * to reduce storage size and network traffic.
 */

/**
 * Compress a string using a simple LZ-based algorithm
 * @param input The string to compress
 * @returns The compressed string
 */
export function compress(input: string): string {
  // For now, we'll use a simple base64 encoding as a placeholder
  // In a real implementation, we would use a proper compression algorithm like LZ-string
  try {
    return btoa(encodeURIComponent(input));
  } catch (error) {
    console.error('Compression failed:', error);
    return input;
  }
}

/**
 * Decompress a string that was compressed with the compress function
 * @param input The compressed string
 * @returns The decompressed string
 */
export function decompress(input: string): string {
  // For now, we'll use a simple base64 decoding as a placeholder
  // In a real implementation, we would use a proper decompression algorithm like LZ-string
  try {
    return decodeURIComponent(atob(input));
  } catch (error) {
    console.error('Decompression failed:', error);
    return input;
  }
}

/**
 * Check if a string is compressed
 * @param input The string to check
 * @returns True if the string appears to be compressed
 */
export function isCompressed(input: string): boolean {
  // Simple heuristic: check if the string is base64 encoded
  try {
    const regex = /^[a-zA-Z0-9+/]+={0,2}$/;
    return regex.test(input);
  } catch (error) {
    return false;
  }
}

/**
 * Compress an object by converting it to JSON and compressing the result
 * @param obj The object to compress
 * @returns The compressed string
 */
export function compressObject<T>(obj: T): string {
  return compress(JSON.stringify(obj));
}

/**
 * Decompress a string and parse it as JSON
 * @param input The compressed string
 * @returns The decompressed object
 */
export function decompressObject<T>(input: string): T {
  return JSON.parse(decompress(input));
}
