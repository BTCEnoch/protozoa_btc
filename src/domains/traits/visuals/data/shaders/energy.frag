/**
 * Energy effect fragment shader
 */

uniform float time;
uniform float intensity;
uniform vec3 color;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  // Calculate fresnel effect
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = dot(viewDirection, vNormal);
  fresnel = pow(1.0 - fresnel, 3.0);
  
  // Pulse effect based on time
  float pulse = 0.5 + 0.5 * sin(time * 2.0);
  
  // Combine effects
  float energyIntensity = fresnel * intensity * pulse;
  
  // Final color
  vec3 energyColor = color * energyIntensity;
  
  // Output
  gl_FragColor = vec4(energyColor, energyIntensity);
}
