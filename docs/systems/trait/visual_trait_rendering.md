
# Visual Trait Rendering

## Purpose
This document outlines the methods and techniques used to render visual traits—such as colors, shapes, and graphical effects—in the Bitcoin Protozoa system. It serves as a comprehensive guide for developers and artists, providing a single source of truth for rendering these traits and ensuring consistency across the project.

## Location
`docs/traits/visual_trait_rendering.md`

## Overview
Visual traits determine the aesthetic properties of particles within creatures, including their color, shape, glow, and other effects. These traits are rendered using Three.js, a powerful JavaScript library, and employ techniques like shaders and color mapping to create dynamic, efficient visuals. The system is designed to be modular, allowing for easy customization and scalability.

## Rendering Techniques
The following techniques are utilized to render visual traits effectively:

### 1. Shaders
- **Purpose**: Apply advanced visual effects like glow, lighting, or texture blending to particles.
- **Implementation**: 
  - Custom vertex and fragment shaders are written in GLSL and applied to particle materials.
  - Uniform variables pass trait-specific data (e.g., color, glow intensity) to the shaders.
- **Example**:
  ```glsl
  // Fragment shader example
  uniform vec3 particleColor;
  uniform float glowIntensity;
  void main() {
    gl_FragColor = vec4(particleColor, 1.0) + vec4(0.0, 0.0, glowIntensity, 0.0);
  }
  ```

### 2. Color Mapping
- **Purpose**: Translate trait properties into visual representations like colors or textures.
- **Implementation**: 
  - A dedicated service maps trait data to Three.js color objects or textures.
  - Supports dynamic application based on trait attributes (e.g., rarity, type).
- **Example**:
  ```typescript
  // src/domains/traits/services/visualService.ts
  class VisualService {
    getColor(trait: IVisualTrait): THREE.Color {
      switch (trait.type) {
        case 'fire': return new THREE.Color(0xff0000);
        case 'water': return new THREE.Color(0x0000ff);
        default: return new THREE.Color(0xffffff);
      }
    }
  }
  ```

### 3. Geometry and Material Updates
- **Purpose**: Modify particle appearance by adjusting geometry or material properties.
- **Implementation**: 
  - Traits can alter size, shape, or material attributes like transparency.
  - Uses instanced rendering for performance optimization.
- **Example**:
  ```typescript
  // src/domains/rendering/services/particleRenderer.ts
  class ParticleRenderer {
    updateParticleVisuals(particle: IParticle, trait: IVisualTrait) {
      particle.mesh.material.color.set(visualService.getColor(trait));
      particle.mesh.scale.set(trait.size, trait.size, trait.size);
    }
  }
  ```

## Integration with the Rendering Pipeline
Visual traits are seamlessly integrated into the rendering pipeline through these steps:
1. **Trait Assignment**: Visual traits are assigned to particles during creature generation.
2. **Data Passing**: Trait data is transmitted to rendering services via particle models.
3. **Rendering Updates**: The `ParticleRenderer` service applies these traits during scene updates, ensuring real-time visual consistency.

## Examples

### Visual Trait Configuration
Below is an example of a visual trait configuration in JSON format:
```json
{
  "type": "fire",
  "color": "#ff0000",
  "glowIntensity": 0.5,
  "size": 1.2
}
```

### Rendered Output
- **Color**: Bright red (`#ff0000`).
- **Glow**: Moderate glow effect with an intensity of 0.5.
- **Size**: Particles are scaled 1.2 times larger than the default size.

## Migration Steps from Current GitHub Structure
To align the current project with this new structure:
1. **Identify Existing Logic**: Locate visual trait rendering code within the existing GitHub repository.
2. **Refactor**: Consolidate rendering logic into modular services (e.g., `visualService.ts`, `particleRenderer.ts`).
3. **Update Rendering Pipeline**: Modify the pipeline to leverage these new services.
4. **Test**: Use Three.js’s `Stats` module to verify performance and visual accuracy.

## Why
This document provides clear, actionable guidance for rendering visual traits, bridging the gap between artistic vision and technical implementation. It ensures a modular, efficient system that supports both developers and artists in crafting creature appearances.
