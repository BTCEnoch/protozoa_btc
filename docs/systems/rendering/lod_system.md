# Level of Detail (LOD) System

## Overview

The Level of Detail (LOD) system is a rendering optimization technique that reduces the detail of objects as they move further away from the camera. In the Bitcoin Protozoa project, this technique is used to improve performance by reducing the number of particles and their detail for distant creatures.

The LOD system works by adjusting the scale of particles based on their distance from the camera, effectively making them smaller or invisible when they are far away. This significantly reduces the rendering workload for distant creatures, improving overall performance.

## Implementation

The LOD system in Bitcoin Protozoa is implemented through the LODManager class in src/domains/rendering/services/lodManager.ts. This manager provides methods for:

1. Applying LOD to particle scales based on distance
2. Determining which particles are visible within the camera frustum
3. Getting LOD settings for specific distances
4. Configuring LOD levels and behavior

### LOD Levels

The LOD system uses a series of distance thresholds and corresponding detail levels:

`	ypescript
const DEFAULT_LOD_LEVELS: LODLevel[] = [
  {
    distance: 10,
    scale: 1.0,
    detail: 1.0
  },
  {
    distance: 25,
    scale: 0.8,
    detail: 0.8
  },
  {
    distance: 50,
    scale: 0.6,
    detail: 0.6
  },
  {
    distance: 100,
    scale: 0.4,
    detail: 0.4
  },
  {
    distance: 200,
    scale: 0.2,
    detail: 0.2
  }
];
`

Each level defines:
- distance: The maximum distance at which this level applies
- scale: The scale factor to apply to particles (1.0 = full size, 0.0 = invisible)
- detail: The detail level for other rendering aspects (textures, effects, etc.)

For example, particles between 50 and 100 units away from the camera will be scaled to 40% of their original size, effectively reducing their visual impact and rendering cost.

### Applying LOD

The pplyLOD method is the core of the LOD system:

`	ypescript
public applyLOD(positions: Vector3[], scales: number[], camera: THREE.Camera): void {
  // Update frustum for culling
  this.projScreenMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

  // Get camera position
  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);

  // Apply LOD to each particle
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];

    // Create THREE.Vector3 for calculations
    const particlePosition = new THREE.Vector3(position.x, position.y, position.z);

    // Check if particle is in frustum
    if (this.frustumCulling && !this.frustum.containsPoint(particlePosition)) {
      scales[i] = 0; // Hide particle if outside frustum
      continue;
    }

    // Calculate distance to camera
    const distance = particlePosition.distanceTo(cameraPosition);

    // Find appropriate LOD level
    let detailLevel = this.lodLevels[this.lodLevels.length - 1].scale;

    for (const level of this.lodLevels) {
      if (distance <= level.distance) {
        detailLevel = level.scale;
        break;
      }
    }

    // Apply detail level to scale
    scales[i] *= detailLevel;
  }
}
`

This method:
1. Updates the frustum for culling
2. Gets the camera position
3. For each particle:
   - Checks if it's within the camera frustum
   - Calculates its distance from the camera
   - Determines the appropriate LOD level
   - Applies the scale factor to the particle

### Integration with Rendering

The LOD system is integrated with the rendering system in enderService.ts:

`	ypescript
public updateParticles(
  role: Role,
  positions: Vector3[],
  velocities?: Vector3[],
  scales?: number[]
): void {
  // Apply LOD to scales if provided
  let lodScales = scales;
  if (scales && this.camera) {
    lodScales = [...scales];
    getLODManager().applyLOD(positions, lodScales, this.camera);
  }

  // Update particles using the particle renderer
  getParticleRenderer().updateParticles(role, positions, velocities, lodScales);
}
`

This ensures that particles are rendered with the appropriate level of detail based on their distance from the camera.

## Performance Considerations

The LOD system provides significant performance benefits:

1. **Reduced Particle Count**: By scaling distant particles to zero, they are effectively removed from rendering, reducing the particle count by 50-75% for distant creatures.
2. **Reduced Geometry Detail**: Distant particles use simpler geometry, reducing vertex count.
3. **Reduced Texture Detail**: Distant particles use lower-resolution textures, reducing memory usage.
4. **Disabled Effects**: Effects like glow and trails are disabled for distant particles, reducing shader complexity.

## Advanced Features

### Frustum Culling

The LOD system includes frustum culling, which completely removes particles that are outside the camera's view frustum. This is done by setting their scale to zero, effectively making them invisible.

### Visibility Calculation

The getVisibleParticles method returns an array of indices for particles that are visible within the camera frustum. This can be used for further optimizations, such as only updating physics for visible particles.

### LOD Settings

The getLODForDistance method returns detailed LOD settings for a given distance, including:

- detailLevel: The overall detail level (0.0 to 1.0)
- geometryDetail: The geometry detail level ('high', 'medium', 'low')
- 	extureDetail: The texture detail level ('high', 'medium', 'low')
- effectsEnabled: Whether effects like glow and trails are enabled

## Future Enhancements

Potential future enhancements to the LOD system include:

1. **Hierarchical LOD**: Group particles and apply LOD to entire groups, reducing CPU overhead.
2. **Smooth Transitions**: Implement smooth transitions between LOD levels to avoid popping.
3. **Adaptive LOD**: Adjust LOD levels based on performance metrics, ensuring a consistent frame rate.
4. **Importance-Based LOD**: Apply higher detail to important particles, regardless of distance.

## Conclusion

The LOD system is a critical optimization technique for the Bitcoin Protozoa project, enabling the rendering of large numbers of particles with good performance. By reducing detail for distant creatures, it achieves the performance goal of reducing particle count by 50-75% for distant creatures, significantly improving overall rendering performance.
