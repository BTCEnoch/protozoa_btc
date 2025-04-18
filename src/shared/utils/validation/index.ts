/**
 * Validation Utilities
 *
 * Provides utilities for validating data.
 */

/**
 * Check if a value is null or undefined
 * @param value The value to check
 * @returns True if the value is null or undefined
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is a number
 * @param value The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if a value is a string
 * @param value The value to check
 * @returns True if the value is a string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is a boolean
 * @param value The value to check
 * @returns True if the value is a boolean
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if a value is an object
 * @param value The value to check
 * @returns True if the value is an object
 */
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null;
}

/**
 * Check if a value is an array
 * @param value The value to check
 * @returns True if the value is an array
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a function
 * @param value The value to check
 * @returns True if the value is a function
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * Check if a value is a valid Bitcoin block number
 * @param value The value to check
 * @returns True if the value is a valid Bitcoin block number
 */
export function isValidBlockNumber(value: any): boolean {
  if (!isNumber(value)) {
    return false;
  }
  
  // Block number must be a non-negative integer
  if (value < 0 || !Number.isInteger(value)) {
    return false;
  }
  
  // Current Bitcoin block height is around 800,000 as of 2023
  // This is a loose validation to catch obvious errors
  if (value > 1000000) {
    return false;
  }
  
  return true;
}

/**
 * Check if a value is a valid Bitcoin block nonce
 * @param value The value to check
 * @returns True if the value is a valid Bitcoin block nonce
 */
export function isValidBlockNonce(value: any): boolean {
  if (!isNumber(value) && !isString(value)) {
    return false;
  }
  
  // Convert string to number if needed
  const nonce = typeof value === 'string' ? parseInt(value, 16) : value;
  
  // Nonce must be a non-negative integer
  if (nonce < 0 || !Number.isInteger(nonce)) {
    return false;
  }
  
  // Nonce is a 32-bit number
  if (nonce > 4294967295) {
    return false;
  }
  
  return true;
}

/**
 * Check if a value is a valid Bitcoin block confirmations count
 * @param value The value to check
 * @returns True if the value is a valid Bitcoin block confirmations count
 */
export function isValidBlockConfirmations(value: any): boolean {
  if (!isNumber(value)) {
    return false;
  }
  
  // Confirmations must be a non-negative integer
  if (value < 0 || !Number.isInteger(value)) {
    return false;
  }
  
  return true;
}

/**
 * Check if a value is a valid Vector3
 * @param value The value to check
 * @returns True if the value is a valid Vector3
 */
export function isValidVector3(value: any): boolean {
  if (!isObject(value)) {
    return false;
  }
  
  return (
    'x' in value && isNumber(value.x) &&
    'y' in value && isNumber(value.y) &&
    'z' in value && isNumber(value.z)
  );
}

/**
 * Check if a value is a valid color
 * @param value The value to check
 * @returns True if the value is a valid color
 */
export function isValidColor(value: any): boolean {
  if (!isObject(value)) {
    return false;
  }
  
  return (
    'r' in value && isNumber(value.r) && value.r >= 0 && value.r <= 255 &&
    'g' in value && isNumber(value.g) && value.g >= 0 && value.g <= 255 &&
    'b' in value && isNumber(value.b) && value.b >= 0 && value.b <= 255 &&
    (!('a' in value) || (isNumber(value.a) && value.a >= 0 && value.a <= 1))
  );
}

/**
 * Check if a value is a valid hex color string
 * @param value The value to check
 * @returns True if the value is a valid hex color string
 */
export function isValidHexColor(value: any): boolean {
  if (!isString(value)) {
    return false;
  }
  
  return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

/**
 * Check if a value is a valid UUID
 * @param value The value to check
 * @returns True if the value is a valid UUID
 */
export function isValidUUID(value: any): boolean {
  if (!isString(value)) {
    return false;
  }
  
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
