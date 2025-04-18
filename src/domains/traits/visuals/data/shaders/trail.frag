/**
 * Trail effect fragment shader
 */

uniform float time;
uniform float length;
uniform float fadeRate;

varying vec2 vUv;
varying vec3 vColor;
varying float vLifetime;

void main() {
  // Calculate fade based on lifetime
  float fade = 1.0 - vLifetime * fadeRate;
  
  // Calculate alpha based on v coordinate (along the trail)
  float alpha = smoothstep(1.0, 0.0, vUv.y) * fade;
  
  // Output
  gl_FragColor = vec4(vColor, alpha);
}
