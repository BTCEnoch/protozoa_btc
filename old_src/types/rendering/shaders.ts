/**
 * Shader Types for Bitcoin Protozoa
 * 
 * This file defines the types for custom shaders, which are used to create
 * visually appealing effects for particles.
 */

import { Color } from '../core';

/**
 * Shader definition interface
 * Defines a custom shader
 */
export interface ShaderDefinition {
  // Shader code
  vertexShader: string;
  fragmentShader: string;
  
  // Shader name and description
  name: string;
  description?: string;
  
  // Default uniforms
  defaultUniforms?: Record<string, any>;
  
  // Shader type
  type: 'particle' | 'trail' | 'effect' | 'post';
}

/**
 * Shader material options interface
 * Options for creating a shader material
 */
export interface ShaderMaterialOptions {
  // Shader definition
  shader: ShaderDefinition | string;
  
  // Uniforms
  uniforms?: Record<string, ShaderUniform>;
  
  // Render options
  transparent?: boolean;
  depthTest?: boolean;
  depthWrite?: boolean;
  blending?: 'normal' | 'additive' | 'multiply' | 'subtract';
  side?: 'front' | 'back' | 'double';
  
  // Animation options
  animated?: boolean;
  animationSpeed?: number;
}

/**
 * Shader uniform interface
 * Uniform value for a shader
 */
export interface ShaderUniform {
  // Uniform value
  value: number | number[] | Float32Array | Color | any;
  
  // Animation options
  animated?: boolean;
  animationFunction?: (time: number, value: any) => any;
  
  // Range for animated values
  min?: number;
  max?: number;
}
