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
