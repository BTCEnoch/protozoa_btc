/**
 * Shader Manager for Bitcoin Protozoa
 * 
 * This service manages custom shaders for particle rendering, providing
 * a centralized way to create, update, and manage shader materials.
 */

import * as THREE from 'three';
import { ShaderDefinition, ShaderMaterialOptions, ShaderUniform } from '../../types/rendering/shaders';

// Default shaders
const DEFAULT_SHADERS: Record<string, ShaderDefinition> = {
  // Basic particle shader
  'particle': {
    name: 'Basic Particle',
    type: 'particle',
    vertexShader: `
      uniform float time;
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vColor;
      
      void main() {
        float r = length(gl_PointCoord - vec2(0.5, 0.5));
        if (r > 0.5) discard;
        
        gl_FragColor = vec4(vColor, 1.0);
      }
    `,
    defaultUniforms: {
      time: { value: 0 }
    }
  },
  
  // Glow effect shader
  'glow': {
    name: 'Glow Effect',
    type: 'effect',
    vertexShader: `
      uniform float time;
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vColor;
      
      void main() {
        float r = length(gl_PointCoord - vec2(0.5, 0.5));
        if (r > 0.5) discard;
        
        float glow = 0.5 + 0.5 * sin(time * 2.0);
        gl_FragColor = vec4(vColor * glow, 1.0);
      }
    `,
    defaultUniforms: {
      time: { value: 0 }
    }
  },
  
  // Trail effect shader
  'trail': {
    name: 'Trail Effect',
    type: 'trail',
    vertexShader: `
      uniform float time;
      attribute float size;
      attribute vec3 color;
      attribute float age;
      varying vec3 vColor;
      varying float vAge;
      
      void main() {
        vColor = color;
        vAge = age;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 - age);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vColor;
      varying float vAge;
      
      void main() {
        float r = length(gl_PointCoord - vec2(0.5, 0.5));
        if (r > 0.5) discard;
        
        float alpha = 1.0 - vAge;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    defaultUniforms: {
      time: { value: 0 }
    }
  },
  
  // Post-processing bloom shader
  'bloom': {
    name: 'Bloom Effect',
    type: 'post',
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float bloomStrength;
      uniform float bloomRadius;
      varying vec2 vUv;
      
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        vec3 luminance = vec3(0.299, 0.587, 0.114);
        float lum = dot(color.rgb, luminance);
        vec3 bloomColor = color.rgb * smoothstep(0.7, 0.8, lum);
        
        gl_FragColor = vec4(color.rgb + bloomColor * bloomStrength, color.a);
      }
    `,
    defaultUniforms: {
      tDiffuse: { value: null },
      bloomStrength: { value: 1.5 },
      bloomRadius: { value: 0.4 }
    }
  }
};

/**
 * Shader Manager class
 * Manages custom shaders for particle rendering
 */
class ShaderManager {
  private shaders: Map<string, ShaderDefinition> = new Map();
  private materials: Map<string, THREE.ShaderMaterial> = new Map();
  private animatedMaterials: THREE.ShaderMaterial[] = [];
  private clock: THREE.Clock;
  
  /**
   * Initialize the shader manager
   */
  public initialize(): void {
    this.clock = new THREE.Clock();
    
    // Register default shaders
    for (const [name, shader] of Object.entries(DEFAULT_SHADERS)) {
      this.registerShader(name, shader);
    }
    
    console.log('Shader Manager initialized with default shaders');
  }
  
  /**
   * Register a new shader
   * @param name Shader name
   * @param shader Shader definition
   */
  public registerShader(name: string, shader: ShaderDefinition): void {
    this.shaders.set(name, shader);
    console.log(`Registered shader: ${name}`);
  }
  
  /**
   * Get a shader by name
   * @param name Shader name
   * @returns Shader definition or undefined if not found
   */
  public getShader(name: string): ShaderDefinition | undefined {
    return this.shaders.get(name);
  }
  
  /**
   * Create a shader material
   * @param options Shader material options
   * @returns THREE.ShaderMaterial
   */
  public createShader(options: ShaderMaterialOptions): THREE.ShaderMaterial {
    // Get shader definition
    const shaderDef = typeof options.shader === 'string' 
      ? this.shaders.get(options.shader) 
      : options.shader;
    
    if (!shaderDef) {
      throw new Error(`Shader not found: ${options.shader}`);
    }
    
    // Create uniforms
    const uniforms: Record<string, { value: any }> = {};
    
    // Add default uniforms
    if (shaderDef.defaultUniforms) {
      for (const [key, value] of Object.entries(shaderDef.defaultUniforms)) {
        uniforms[key] = { value };
      }
    }
    
    // Add custom uniforms
    if (options.uniforms) {
      for (const [key, uniform] of Object.entries(options.uniforms)) {
        uniforms[key] = { value: uniform.value };
      }
    }
    
    // Create material
    const material = new THREE.ShaderMaterial({
      vertexShader: shaderDef.vertexShader,
      fragmentShader: shaderDef.fragmentShader,
      uniforms,
      transparent: options.transparent !== undefined ? options.transparent : true,
      depthTest: options.depthTest !== undefined ? options.depthTest : true,
      depthWrite: options.depthWrite !== undefined ? options.depthWrite : true,
      side: this.getSide(options.side),
      blending: this.getBlending(options.blending)
    });
    
    // Store material for updates if animated
    if (options.animated) {
      this.animatedMaterials.push(material);
    }
    
    // Generate a unique ID for this material
    const materialId = `${shaderDef.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.materials.set(materialId, material);
    
    return material;
  }
  
  /**
   * Update shader uniforms
   * @param deltaTime Time since last update
   */
  public updateUniforms(deltaTime: number = this.clock.getDelta()): void {
    const time = this.clock.getElapsedTime();
    
    // Update all animated materials
    for (const material of this.animatedMaterials) {
      if (material.uniforms.time) {
        material.uniforms.time.value = time;
      }
      
      // Update custom animated uniforms
      for (const [key, uniform] of Object.entries(material.uniforms)) {
        if (uniform.animated && uniform.animationFunction) {
          uniform.value = uniform.animationFunction(time, uniform.value);
        }
      }
    }
  }
  
  /**
   * Get THREE.Side from string
   * @param side Side string
   * @returns THREE.Side
   */
  private getSide(side?: string): THREE.Side {
    switch (side) {
      case 'front':
        return THREE.FrontSide;
      case 'back':
        return THREE.BackSide;
      case 'double':
        return THREE.DoubleSide;
      default:
        return THREE.FrontSide;
    }
  }
  
  /**
   * Get THREE.Blending from string
   * @param blending Blending string
   * @returns THREE.Blending
   */
  private getBlending(blending?: string): THREE.Blending {
    switch (blending) {
      case 'additive':
        return THREE.AdditiveBlending;
      case 'multiply':
        return THREE.MultiplyBlending;
      case 'subtract':
        return THREE.SubtractiveBlending;
      default:
        return THREE.NormalBlending;
    }
  }
  
  /**
   * Dispose of all materials
   */
  public dispose(): void {
    for (const material of this.materials.values()) {
      material.dispose();
    }
    
    this.materials.clear();
    this.animatedMaterials = [];
  }
}

// Singleton instance
let shaderManagerInstance: ShaderManager | null = null;

/**
 * Get the shader manager instance
 * @returns ShaderManager instance
 */
export function getShaderManager(): ShaderManager {
  if (!shaderManagerInstance) {
    shaderManagerInstance = new ShaderManager();
  }
  
  return shaderManagerInstance;
}
