/**
 * Fire effect vertex shader
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
  
  // Calculate position with displacement based on time
  vec3 pos = position;
  float displacement = sin(time * 3.0 + position.x * 5.0 + position.z * 5.0) * 0.1 * intensity;
  displacement *= (1.0 - position.y); // More displacement at the bottom
  pos.x += displacement;
  pos.z += displacement;
  
  // Calculate position in world space
  vPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  
  // Output position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
