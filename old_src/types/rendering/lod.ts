/**
 * Level of Detail (LOD) Types for Bitcoin Protozoa
 * 
 * This file defines the types for level of detail rendering, which is used to
 * optimize rendering by using simpler geometries for distant objects.
 */

/**
 * LOD level interface
 * Defines a level of detail
 */
export interface LODLevel {
  // Distance threshold
  distance: number;
  
  // Geometry options
  geometry: 'sphere' | 'box' | 'cone' | 'cylinder' | 'torus' | 'custom' | 'point';
  geometryParams?: {
    radius?: number;
    width?: number;
    height?: number;
    depth?: number;
    segments?: number;
    detail?: number;
  };
  
  // Material options
  material: 'standard' | 'basic' | 'phong' | 'lambert' | 'toon' | 'shader' | 'point';
  materialParams?: {
    color?: string;
    emissive?: boolean;
    emissiveColor?: string;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
    flatShading?: boolean;
    size?: number;
    sizeAttenuation?: boolean;
  };
  
  // Instance count (for instanced rendering)
  instanceCount?: number;
  
  // Particle count (for particle systems)
  particleCount?: number;
  
  // Custom render function
  customRender?: (object: any, camera: any) => void;
}

/**
 * LOD options interface
 * Options for level of detail rendering
 */
export interface LODOptions {
  // LOD levels
  levels: LODLevel[];
  
  // Auto-generate levels
  autoGenerate?: boolean;
  autoLevelCount?: number;
  
  // Update options
  updateFrequency?: number;
  frustumCulled?: boolean;
  
  // Transition options
  fadeTransition?: boolean;
  transitionDuration?: number;
}
