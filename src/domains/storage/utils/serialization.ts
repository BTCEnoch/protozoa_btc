/**
 * Serialization Utilities for Bitcoin Protozoa
 * 
 * This file provides utilities for serializing and deserializing data.
 */

import { SerializationStrategy } from '../types/persistence';

/**
 * JSON serialization strategy
 */
export const JsonSerialization: SerializationStrategy = {
  /**
   * Serialize data to JSON string
   * @param data The data to serialize
   * @returns The serialized data
   */
  serialize<T>(data: T): string {
    return JSON.stringify(data);
  },
  
  /**
   * Deserialize JSON string to data
   * @param serialized The serialized data
   * @returns The deserialized data
   */
  deserialize<T>(serialized: string): T {
    return JSON.parse(serialized) as T;
  }
};

/**
 * Convert object to URL query string
 * @param obj The object to convert
 * @returns The URL query string
 */
export function objectToQueryString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        return '';
      }
      
      const encodedKey = encodeURIComponent(key);
      
      if (typeof value === 'object') {
        return `${encodedKey}=${encodeURIComponent(JSON.stringify(value))}`;
      }
      
      return `${encodedKey}=${encodeURIComponent(value)}`;
    })
    .filter(Boolean)
    .join('&');
}

/**
 * Convert URL query string to object
 * @param queryString The URL query string
 * @returns The object
 */
export function queryStringToObject(queryString: string): Record<string, any> {
  if (!queryString) {
    return {};
  }
  
  const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  
  return query.split('&').reduce((result, param) => {
    if (!param) {
      return result;
    }
    
    const [key, value] = param.split('=');
    
    if (!key) {
      return result;
    }
    
    const decodedKey = decodeURIComponent(key);
    const decodedValue = value ? decodeURIComponent(value) : '';
    
    // Try to parse JSON values
    try {
      result[decodedKey] = JSON.parse(decodedValue);
    } catch (e) {
      result[decodedKey] = decodedValue;
    }
    
    return result;
  }, {} as Record<string, any>);
}

/**
 * Convert object to base64 string
 * @param obj The object to convert
 * @returns The base64 string
 */
export function objectToBase64<T>(obj: T): string {
  const json = JSON.stringify(obj);
  return btoa(json);
}

/**
 * Convert base64 string to object
 * @param base64 The base64 string
 * @returns The object
 */
export function base64ToObject<T>(base64: string): T {
  const json = atob(base64);
  return JSON.parse(json) as T;
}
