/**
 * Persistence Types for Bitcoin Protozoa
 * 
 * This file defines the types for data persistence.
 */

/**
 * Persistence strategy interface
 */
export interface PersistenceStrategy {
  /**
   * Save data to persistent storage
   * @param key The storage key
   * @param data The data to save
   * @returns Promise that resolves to true if successful
   */
  save<T>(key: string, data: T): Promise<boolean>;
  
  /**
   * Load data from persistent storage
   * @param key The storage key
   * @returns Promise that resolves to the loaded data or null if not found
   */
  load<T>(key: string): Promise<T | null>;
  
  /**
   * Delete data from persistent storage
   * @param key The storage key
   * @returns Promise that resolves to true if successful
   */
  delete(key: string): Promise<boolean>;
  
  /**
   * Clear all data from persistent storage
   * @returns Promise that resolves to true if successful
   */
  clear(): Promise<boolean>;
  
  /**
   * Get all keys from persistent storage
   * @returns Promise that resolves to an array of keys
   */
  keys(): Promise<string[]>;
  
  /**
   * Check if persistence is available
   * @returns True if persistence is available
   */
  isAvailable(): boolean;
}

/**
 * Serialization strategy interface
 */
export interface SerializationStrategy {
  /**
   * Serialize data to string
   * @param data The data to serialize
   * @returns The serialized data
   */
  serialize<T>(data: T): string;
  
  /**
   * Deserialize string to data
   * @param serialized The serialized data
   * @returns The deserialized data
   */
  deserialize<T>(serialized: string): T;
}

/**
 * Compression strategy interface
 */
export interface CompressionStrategy {
  /**
   * Compress data
   * @param data The data to compress
   * @returns The compressed data
   */
  compress(data: string): string;
  
  /**
   * Decompress data
   * @param compressed The compressed data
   * @returns The decompressed data
   */
  decompress(compressed: string): string;
}

/**
 * Data export format
 */
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  BINARY = 'binary'
}

/**
 * Export options
 */
export interface ExportOptions {
  format?: ExportFormat;
  compress?: boolean;
  encrypt?: boolean;
  password?: string;
  includeMetadata?: boolean;
}

/**
 * Import options
 */
export interface ImportOptions {
  format?: ExportFormat;
  decompress?: boolean;
  decrypt?: boolean;
  password?: string;
  validateSchema?: boolean;
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  format: ExportFormat;
  timestamp: number;
  error?: string;
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  data?: any;
  format: ExportFormat;
  timestamp: number;
  error?: string;
}
