/**
 * Transferable Utilities for Bitcoin Protozoa
 *
 * This module provides utilities for working with transferable objects in web workers.
 * It helps optimize performance by allowing efficient transfer of data between
 * the main thread and worker threads.
 */

import { Vector3 } from '../../types/common';

/**
 * Create a transferable Float32Array from an array of Vector3 objects
 * @param vectors Array of Vector3 objects
 * @returns Float32Array containing the vector data and the transferable buffer
 */
export function createTransferableVectors(vectors: Vector3[]): {
  data: Float32Array;
  transferables: ArrayBuffer[];
} {
  // Create a Float32Array to hold the vector data (3 floats per vector)
  const data = new Float32Array(vectors.length * 3);

  // Fill the array with vector data
  for (let i = 0; i < vectors.length; i++) {
    const vector = vectors[i];
    const offset = i * 3;

    data[offset] = vector.x;
    data[offset + 1] = vector.y;
    data[offset + 2] = vector.z;
  }

  // Return the data and the transferable buffer
  return {
    data,
    transferables: [data.buffer]
  };
}

/**
 * Convert a transferable Float32Array back to an array of Vector3 objects
 * @param data Float32Array containing the vector data
 * @returns Array of Vector3 objects
 */
export function parseTransferableVectors(data: Float32Array): Vector3[] {
  const vectors: Vector3[] = [];

  // Parse the Float32Array into Vector3 objects
  for (let i = 0; i < data.length; i += 3) {
    vectors.push({
      x: data[i],
      y: data[i + 1],
      z: data[i + 2]
    });
  }

  return vectors;
}

/**
 * Create a transferable object from a complex data structure
 * @param data Complex data structure
 * @returns Simplified data structure with transferable buffers
 */
export function createTransferable(data: any): {
  data: any;
  transferables: ArrayBuffer[];
} {
  const transferables: ArrayBuffer[] = [];
  const result = deepCloneWithTransferables(data, transferables);

  return {
    data: result,
    transferables
  };
}

/**
 * Deep clone an object, converting typed arrays to transferable buffers
 * @param obj Object to clone
 * @param transferables Array to collect transferable buffers
 * @returns Cloned object with transferable buffers
 */
function deepCloneWithTransferables(obj: any, transferables: ArrayBuffer[]): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle typed arrays
  if (
    obj instanceof Int8Array ||
    obj instanceof Uint8Array ||
    obj instanceof Uint8ClampedArray ||
    obj instanceof Int16Array ||
    obj instanceof Uint16Array ||
    obj instanceof Int32Array ||
    obj instanceof Uint32Array ||
    obj instanceof Float32Array ||
    obj instanceof Float64Array
  ) {
    transferables.push(obj.buffer);
    return obj;
  }

  // Handle ArrayBuffer
  if (obj instanceof ArrayBuffer) {
    transferables.push(obj);
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneWithTransferables(item, transferables));
  }

  // Handle Object
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepCloneWithTransferables(obj[key], transferables);
    }
  }

  return result;
}

/**
 * Apply a transferable object to a complex data structure
 * @param target Target data structure
 * @param source Source data structure with transferable buffers
 * @returns Updated target data structure
 */
export function applyTransferable(target: any, source: any): any {
  // If the target doesn't exist, return the source
  if (!target) {
    return source;
  }

  // If the source is a primitive or a typed array, return it
  if (
    source === null ||
    typeof source !== 'object' ||
    source instanceof Int8Array ||
    source instanceof Uint8Array ||
    source instanceof Uint8ClampedArray ||
    source instanceof Int16Array ||
    source instanceof Uint16Array ||
    source instanceof Int32Array ||
    source instanceof Uint32Array ||
    source instanceof Float32Array ||
    source instanceof Float64Array ||
    source instanceof ArrayBuffer
  ) {
    return source;
  }

  // Handle Date
  if (source instanceof Date) {
    return new Date(source);
  }

  // Handle Array
  if (Array.isArray(source)) {
    if (!Array.isArray(target)) {
      return source.map(item => deepCloneWithTransferables(item, []));
    }

    // Update the target array
    target.length = 0;
    source.forEach(item => {
      target.push(deepCloneWithTransferables(item, []));
    });

    return target;
  }

  // Handle Object
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = applyTransferable(target[key], source[key]);
    }
  }

  return target;
}

/**
 * Create a transferable Float32Array from a Float32Array
 * @param array Float32Array to transfer
 * @returns Object with the array and transferable buffer
 */
export function createTransferableFloat32Array(array: Float32Array): {
  data: Float32Array;
  transferables: ArrayBuffer[];
} {
  return {
    data: array,
    transferables: [array.buffer]
  };
}

/**
 * Create a transferable Uint32Array from a Uint32Array
 * @param array Uint32Array to transfer
 * @returns Object with the array and transferable buffer
 */
export function createTransferableUint32Array(array: Uint32Array): {
  data: Uint32Array;
  transferables: ArrayBuffer[];
} {
  return {
    data: array,
    transferables: [array.buffer]
  };
}

/**
 * Create a transferable Int32Array from an Int32Array
 * @param array Int32Array to transfer
 * @returns Object with the array and transferable buffer
 */
export function createTransferableInt32Array(array: Int32Array): {
  data: Int32Array;
  transferables: ArrayBuffer[];
} {
  return {
    data: array,
    transferables: [array.buffer]
  };
}
