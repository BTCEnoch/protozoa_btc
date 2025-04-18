/**
 * Shield effect fragment shader
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
  fresnel = pow(1.0 - fresnel, 2.0);
  
  // Hexagonal pattern
  vec2 hexUv = vUv * 10.0;
  vec2 r = vec2(1.0, 1.73);
  vec2 h = r * 0.5;
  vec2 a = mod(hexUv, r) - h;
  vec2 b = mod(hexUv - h, r) - h;
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  float hexPattern = length(gv) / length(h);
  
  // Pulse effect based on time
  float pulse = 0.5 + 0.5 * sin(time * 1.5);
  
  // Shield impact effect (circular waves)
  float impact = sin(length(vPosition.xz) * 10.0 - time * 5.0) * 0.5 + 0.5;
  impact = pow(impact, 4.0) * 0.3;
  
  // Combine effects
  float shieldIntensity = mix(fresnel, hexPattern, 0.5) * intensity;
  shieldIntensity = mix(shieldIntensity, impact, 0.3) * pulse;
  
  // Final color
  vec3 shieldColor = color * shieldIntensity;
  
  // Output
  gl_FragColor = vec4(shieldColor, shieldIntensity * 0.7);
}
