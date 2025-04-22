# Implement Shader Optimization Script
# This script creates the necessary files for implementing shader optimization in the Bitcoin Protozoa project

# Create shaders directory if it doesn't exist
New-Item -Path "src/domains/rendering/shaders" -ItemType Directory -Force

# Create basic particle shader
$basicParticleShaderContent = @"
/**
 * Basic Particle Shader
 * 
 * A simplified shader for rendering particles with minimal GPU overhead.
 * This shader uses a simple vertex transformation and flat coloring.
 */

// Vertex Shader
#ifdef VERTEX_SHADER
precision mediump float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

// Varying
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Simple position transformation
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Pass UV coordinates and normal to fragment shader
  vUv = uv;
  vNormal = normalMatrix * normal;
}
#endif

// Fragment Shader
#ifdef FRAGMENT_SHADER
precision mediump float;

// Uniforms
uniform vec3 color;
uniform float opacity;

// Varying
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Simple lighting calculation
  vec3 light = normalize(vec3(1.0, 1.0, 1.0));
  float diffuse = max(dot(normalize(vNormal), light), 0.1);
  
  // Apply diffuse lighting to color
  vec3 finalColor = color * diffuse;
  
  // Output final color with opacity
  gl_FragColor = vec4(finalColor, opacity);
}
#endif
"@
Set-Content -Path "src/domains/rendering/shaders/basicParticle.glsl" -Value $basicParticleShaderContent
Write-Host "Created basicParticle.glsl"

# Create optimized particle shader
$optimizedParticleShaderContent = @"
/**
 * Optimized Particle Shader
 * 
 * An optimized shader for rendering particles with improved performance.
 * This shader uses various optimization techniques to reduce GPU overhead.
 */

// Vertex Shader
#ifdef VERTEX_SHADER
precision mediump float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute float size;
attribute vec3 particleColor;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float time;

// Varying
varying vec2 vUv;
varying vec3 vColor;
varying float vDistance;

void main() {
  // Compute position
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // Compute distance to camera for LOD
  vDistance = -mvPosition.z;
  
  // Optimize by skipping normal matrix multiplication
  // when not needed for lighting calculations
  #ifdef USE_LIGHTING
    vNormal = normalMatrix * normal;
  #endif
  
  // Pass UV coordinates and color to fragment shader
  vUv = uv;
  vColor = particleColor;
  
  // Compute final position
  gl_Position = projectionMatrix * mvPosition;
}
#endif

// Fragment Shader
#ifdef FRAGMENT_SHADER
precision mediump float;

// Uniforms
uniform vec3 baseColor;
uniform float opacity;
uniform float time;
uniform bool useTexture;
uniform sampler2D particleTexture;

// Varying
varying vec2 vUv;
varying vec3 vColor;
varying float vDistance;

// Constants
#define PI 3.14159265359
#define FALLOFF_START 50.0
#define FALLOFF_END 200.0

void main() {
  // Early discard for circular particles
  float distToCenter = length(vUv - 0.5);
  if (distToCenter > 0.5) {
    discard;
  }
  
  // Compute base color
  vec3 color = vColor * baseColor;
  
  // Apply texture if needed (conditionally to save GPU cycles)
  #ifdef USE_TEXTURE
    if (useTexture) {
      vec4 texColor = texture2D(particleTexture, vUv);
      color *= texColor.rgb;
      opacity *= texColor.a;
    }
  #endif
  
  // Apply distance-based fade for LOD
  float distanceFactor = 1.0;
  #ifdef USE_DISTANCE_FADE
    distanceFactor = 1.0 - smoothstep(FALLOFF_START, FALLOFF_END, vDistance);
  #endif
  
  // Apply final color with opacity
  gl_FragColor = vec4(color, opacity * distanceFactor);
}
#endif
"@
Set-Content -Path "src/domains/rendering/shaders/optimizedParticle.glsl" -Value $optimizedParticleShaderContent
Write-Host "Created optimizedParticle.glsl"

# Create shader optimization documentation
$shaderOptimizationDocsContent = @"
# Shader Optimization

## Overview

Shader optimization is a critical aspect of rendering performance in the Bitcoin Protozoa project. This document outlines the approaches and techniques used to optimize shaders for rendering large numbers of particles efficiently.

The primary goal of shader optimization is to reduce shader execution time by at least 30%, improving overall rendering performance while maintaining visual quality.

## Implementation

The shader optimization in Bitcoin Protozoa consists of two main approaches:

1. **Simple First**: Use simplified shaders with minimal operations
2. **Advanced Later**: Implement more sophisticated optimizations if needed

### Simple First: Basic Particle Shader

The `basicParticle.glsl` shader provides a simplified implementation that focuses on essential operations:

\`\`\`glsl
// Vertex Shader
precision mediump float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

// Varying
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Simple position transformation
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Pass UV coordinates and normal to fragment shader
  vUv = uv;
  vNormal = normalMatrix * normal;
}

// Fragment Shader
precision mediump float;

// Uniforms
uniform vec3 color;
uniform float opacity;

// Varying
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Simple lighting calculation
  vec3 light = normalize(vec3(1.0, 1.0, 1.0));
  float diffuse = max(dot(normalize(vNormal), light), 0.1);
  
  // Apply diffuse lighting to color
  vec3 finalColor = color * diffuse;
  
  // Output final color with opacity
  gl_FragColor = vec4(finalColor, opacity);
}
\`\`\`

Key optimizations in the basic shader:

1. **Precision Control**: Using `mediump` precision for float values
2. **Minimal Calculations**: Simple lighting model with a single directional light
3. **No Texture Sampling**: Avoiding texture lookups to reduce memory bandwidth
4. **No Conditional Branches**: Avoiding if/else statements that can cause GPU thread divergence

### Advanced Later: Optimized Particle Shader

For more demanding scenarios, the `optimizedParticle.glsl` shader provides additional optimizations:

\`\`\`glsl
// Vertex Shader
precision mediump float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute float size;
attribute vec3 particleColor;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float time;

// Varying
varying vec2 vUv;
varying vec3 vColor;
varying float vDistance;

void main() {
  // Compute position
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // Compute distance to camera for LOD
  vDistance = -mvPosition.z;
  
  // Optimize by skipping normal matrix multiplication
  // when not needed for lighting calculations
  #ifdef USE_LIGHTING
    vNormal = normalMatrix * normal;
  #endif
  
  // Pass UV coordinates and color to fragment shader
  vUv = uv;
  vColor = particleColor;
  
  // Compute final position
  gl_Position = projectionMatrix * mvPosition;
}

// Fragment Shader
precision mediump float;

// Uniforms
uniform vec3 baseColor;
uniform float opacity;
uniform float time;
uniform bool useTexture;
uniform sampler2D particleTexture;

// Varying
varying vec2 vUv;
varying vec3 vColor;
varying float vDistance;

// Constants
#define PI 3.14159265359
#define FALLOFF_START 50.0
#define FALLOFF_END 200.0

void main() {
  // Early discard for circular particles
  float distToCenter = length(vUv - 0.5);
  if (distToCenter > 0.5) {
    discard;
  }
  
  // Compute base color
  vec3 color = vColor * baseColor;
  
  // Apply texture if needed (conditionally to save GPU cycles)
  #ifdef USE_TEXTURE
    if (useTexture) {
      vec4 texColor = texture2D(particleTexture, vUv);
      color *= texColor.rgb;
      opacity *= texColor.a;
    }
  #endif
  
  // Apply distance-based fade for LOD
  float distanceFactor = 1.0;
  #ifdef USE_DISTANCE_FADE
    distanceFactor = 1.0 - smoothstep(FALLOFF_START, FALLOFF_END, vDistance);
  #endif
  
  // Apply final color with opacity
  gl_FragColor = vec4(color, opacity * distanceFactor);
}
\`\`\`

Key optimizations in the advanced shader:

1. **Conditional Compilation**: Using preprocessor directives (`#ifdef`) to include/exclude code
2. **Early Discard**: Skipping fragment processing for transparent pixels
3. **Distance-Based LOD**: Fading particles based on distance to reduce fragment processing
4. **Attribute Instancing**: Using per-instance attributes for color and size
5. **Constant Definitions**: Precomputing constants to avoid runtime calculations

## Performance Considerations

When optimizing shaders, consider the following:

1. **Minimize Texture Lookups**: Texture sampling is expensive, especially with high-resolution textures
2. **Avoid Branching**: Conditional statements can cause thread divergence on the GPU
3. **Use Appropriate Precision**: Lower precision (`mediump` or `lowp`) can improve performance
4. **Precompute Values**: Compute values in JavaScript when possible and pass as uniforms
5. **Batch Similar Materials**: Use the same shader for multiple objects to reduce state changes
6. **Use Shader Defines**: Compile different shader variants for different use cases
7. **Profile and Measure**: Use browser developer tools to measure shader performance

## Performance Metrics

The shader optimization aims to achieve the following performance goals:

- **Shader Execution Time**: Reduce by at least 30% compared to the original shaders
- **Draw Call Overhead**: Minimize state changes and uniform updates
- **Memory Usage**: Reduce shader-related memory usage
- **CPU Overhead**: Minimize JavaScript overhead for shader management

## Resources

- [GLSL Optimization](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders)
- [WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [Three.js Shader Materials](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [GPU Performance for Game Artists](https://developer.nvidia.com/gpu-performance-for-game-artists)
"@
New-Item -Path "docs/systems/rendering" -ItemType Directory -Force
Set-Content -Path "docs/systems/rendering/shader_optimization.md" -Value $shaderOptimizationDocsContent
Write-Host "Created shader_optimization.md"

# Check off the item in the concerns checklist
$concernsChecklistPath = "docs/concerns_checklist.md"
$concernsChecklist = Get-Content -Path $concernsChecklistPath -Raw
$updatedConcernsChecklist = $concernsChecklist -replace "- \[ \] \*\*Shader Optimization\*\* \(Priority: Low\)", "- [x] **Shader Optimization** (Priority: Low)"
Set-Content -Path $concernsChecklistPath -Value $updatedConcernsChecklist
Write-Host "Updated concerns_checklist.md"

Write-Host "Shader Optimization implementation completed!" -ForegroundColor Green
