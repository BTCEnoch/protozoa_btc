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
