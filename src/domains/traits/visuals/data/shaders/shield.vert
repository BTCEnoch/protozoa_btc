/**
 * Shield effect vertex shader
 */

uniform float time;
uniform float intensity;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Pass UV coordinates to fragment shader
  vUv = uv;
  
  // Calculate normal in world space
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate position with slight pulsing based on time
  vec3 pos = position;
  float scale = 1.0 + sin(time * 1.5) * 0.05 * intensity;
  pos *= scale;
  
  // Calculate position in world space
  vPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  
  // Output position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
