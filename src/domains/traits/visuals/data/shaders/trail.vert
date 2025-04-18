/**
 * Trail effect vertex shader
 */

uniform float time;
uniform float length;
uniform float fadeRate;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 color;
attribute float lifetime;

varying vec2 vUv;
varying vec3 vColor;
varying float vLifetime;

void main() {
  // Pass values to fragment shader
  vUv = uv;
  vColor = color;
  vLifetime = lifetime;
  
  // Calculate position
  vec3 pos = position;
  
  // Output position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
