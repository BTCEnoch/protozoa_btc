/**
 * Compression Utilities for Bitcoin Protozoa
 * 
 * This file provides utilities for compressing and decompressing data.
 */

import { CompressionStrategy } from '../types/persistence';

/**
 * Simple RLE (Run-Length Encoding) compression strategy
 */
export const RleCompression: CompressionStrategy = {
  /**
   * Compress data using RLE
   * @param data The data to compress
   * @returns The compressed data
   */
  compress(data: string): string {
    if (!data) {
      return '';
    }
    
    let result = '';
    let count = 1;
    let char = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] === char) {
        count++;
      } else {
        result += count > 3 ? `${count}${char}` : char.repeat(count);
        char = data[i];
        count = 1;
      }
    }
    
    result += count > 3 ? `${count}${char}` : char.repeat(count);
    
    return result;
  },
  
  /**
   * Decompress data using RLE
   * @param compressed The compressed data
   * @returns The decompressed data
   */
  decompress(compressed: string): string {
    if (!compressed) {
      return '';
    }
    
    let result = '';
    let i = 0;
    
    while (i < compressed.length) {
      // Check if current character is a digit
      if (/\d/.test(compressed[i])) {
        let countStr = '';
        
        // Read all consecutive digits
        while (i < compressed.length && /\d/.test(compressed[i])) {
          countStr += compressed[i];
          i++;
        }
        
        // Get the character to repeat
        if (i < compressed.length) {
          const char = compressed[i];
          const count = parseInt(countStr, 10);
          
          // Append repeated character
          result += char.repeat(count);
          i++;
        }
      } else {
        // Not a compressed sequence, just append the character
        result += compressed[i];
        i++;
      }
    }
    
    return result;
  }
};

/**
 * Base64 compression strategy
 */
export const Base64Compression: CompressionStrategy = {
  /**
   * Compress data using Base64
   * @param data The data to compress
   * @returns The compressed data
   */
  compress(data: string): string {
    return btoa(data);
  },
  
  /**
   * Decompress data using Base64
   * @param compressed The compressed data
   * @returns The decompressed data
   */
  decompress(compressed: string): string {
    return atob(compressed);
  }
};

/**
 * LZW compression strategy
 */
export const LzwCompression: CompressionStrategy = {
  /**
   * Compress data using LZW
   * @param data The data to compress
   * @returns The compressed data
   */
  compress(data: string): string {
    const dict: Record<string, number> = {};
    const result: number[] = [];
    let phrase = '';
    let code = 256;
    
    // Initialize dictionary with ASCII values
    for (let i = 0; i < 256; i++) {
      dict[String.fromCharCode(i)] = i;
    }
    
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      const newPhrase = phrase + char;
      
      if (dict[newPhrase] !== undefined) {
        phrase = newPhrase;
      } else {
        result.push(dict[phrase]);
        dict[newPhrase] = code++;
        phrase = char;
      }
    }
    
    if (phrase !== '') {
      result.push(dict[phrase]);
    }
    
    // Convert to string for storage
    return result.map(code => String.fromCharCode(code)).join('');
  },
  
  /**
   * Decompress data using LZW
   * @param compressed The compressed data
   * @returns The decompressed data
   */
  decompress(compressed: string): string {
    const dict: Record<number, string> = {};
    const data = compressed.split('').map(char => char.charCodeAt(0));
    let character = String.fromCharCode(data[0]);
    let result = character;
    let code = 256;
    let word = '';
    
    // Initialize dictionary with ASCII values
    for (let i = 0; i < 256; i++) {
      dict[i] = String.fromCharCode(i);
    }
    
    for (let i = 1; i < data.length; i++) {
      const currentCode = data[i];
      
      if (dict[currentCode] !== undefined) {
        word = dict[currentCode];
      } else if (currentCode === code) {
        word = character + character[0];
      } else {
        throw new Error('Invalid compressed data');
      }
      
      result += word;
      dict[code++] = character + word[0];
      character = word;
    }
    
    return result;
  }
};

/**
 * Get the best compression strategy for the data
 * @param data The data to compress
 * @returns The best compression strategy
 */
export function getBestCompressionStrategy(data: string): CompressionStrategy {
  // For simplicity, always use Base64 compression
  // In a real implementation, we would test different strategies and choose the best one
  return Base64Compression;
}
