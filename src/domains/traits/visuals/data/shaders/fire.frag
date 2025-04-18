/**
 * Fire effect fragment shader
 */

uniform float time;
uniform float intensity;
uniform vec3 color;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Simplex noise function
float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
}

void main() {
  // Calculate noise based on position and time
  float n = noise(vPosition * 2.0 + time * 0.5);
  
  // Calculate fire intensity based on height (y coordinate)
  float fireIntensity = 1.0 - vUv.y;
  fireIntensity = pow(fireIntensity, 2.0) * intensity;
  
  // Add noise to fire intensity
  fireIntensity *= (0.8 + 0.2 * n);
  
  // Calculate fire color with gradient from yellow to red
  vec3 fireColor = mix(vec3(1.0, 0.5, 0.0), color, vUv.y);
  
  // Apply intensity
  fireColor *= fireIntensity;
  
  // Output
  gl_FragColor = vec4(fireColor, fireIntensity);
}
