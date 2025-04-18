/**
 * Buffer Types for Bitcoin Protozoa
 * 
 * This file defines the types for buffer geometry, which is used to efficiently
 * render particles with custom attributes.
 */

/**
 * Buffer geometry data interface
 * Data for buffer geometry
 */
export interface BufferGeometryData {
  // Vertex positions
  positions: Float32Array;
  
  // Optional attributes
  normals?: Float32Array;
  uvs?: Float32Array;
  colors?: Float32Array;
  indices?: Uint16Array | Uint32Array;
  
  // Custom attributes
  customAttributes?: Record<string, AttributeData>;
}

/**
 * Attribute data interface
 * Custom attribute for buffer geometry
 */
export interface AttributeData {
  // Attribute data
  data: Float32Array | Int32Array | Uint32Array;
  itemSize: number;
  normalized?: boolean;
  
  // Update function
  updateFunction?: (time: number) => void;
  
  // Animation options
  animated?: boolean;
  animationSpeed?: number;
}
