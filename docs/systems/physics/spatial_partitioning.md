# Spatial Partitioning

## Overview

Spatial partitioning is a technique used to optimize collision detection and physics calculations in the Bitcoin Protozoa project. By dividing the 3D space into cells and only checking for collisions between objects in the same or neighboring cells, we can significantly reduce the number of collision checks required.

The primary goal of spatial partitioning is to reduce the complexity of collision detection from O(n²) to O(n), where n is the number of physics bodies in the simulation.

## Implementation

The spatial partitioning in Bitcoin Protozoa consists of a grid-based approach implemented in the `SpatialGrid` class. This class provides methods for adding, removing, and updating items in the grid, as well as finding nearby items and potential collision pairs.

### Grid Structure

The spatial grid divides the 3D space into uniform cells. Each cell contains a list of item IDs that are located within that cell. The size of the cells is configurable and should be chosen based on the typical size and distribution of objects in the simulation.

```typescript
interface SpatialGridCell {
  x: number;
  y: number;
  z: number;
  items: string[];
}
```

### Key Components

The `SpatialGrid` class provides the following key methods:

1. **addItem**: Adds an item to the grid at a specific position
2. **removeItem**: Removes an item from the grid
3. **updateItem**: Updates an item's position in the grid
4. **findNearby**: Finds all items within a radius of a position
5. **getPotentialCollisionPairs**: Gets all potential collision pairs in the grid

### Integration with Physics Service

The spatial grid is integrated with the `PhysicsService` to optimize collision detection:

```typescript
private detectCollisions(): Collision[] {
  const collisions: Collision[] = [];
  
  // Use spatial grid if available and configured
  if (this.spatialGrid && this.config.broadphase === BroadphaseType.GRID) {
    // Get potential collision pairs from spatial grid
    const pairs = this.spatialGrid.getPotentialCollisionPairs();
    
    // Check each pair for collision
    for (const [bodyAId, bodyBId] of pairs) {
      const bodyA = this.bodies.get(bodyAId);
      const bodyB = this.bodies.get(bodyBId);
      
      if (!bodyA || !bodyB || !bodyA.active || !bodyB.active) continue;
      
      // Skip if bodies don't collide with each other
      if (bodyA.fixed && bodyB.fixed) continue;
      if (!this.canCollide(bodyA, bodyB)) continue;
      
      // Check for collision
      const collision = this.checkCollision(bodyA, bodyB);
      if (collision) {
        collisions.push(collision);
      }
    }
    
    this.logger.debug(`Checked ${pairs.length} potential collision pairs using spatial grid`);
  } else {
    // Fallback to brute force method
    // ...
  }
  
  return collisions;
}
```

## Performance Considerations

When using spatial partitioning, consider the following:

1. **Cell Size**: The size of the grid cells affects performance. If cells are too small, objects may span multiple cells, increasing overhead. If cells are too large, too many objects will be in the same cell, reducing the benefit of partitioning.

2. **Object Distribution**: Spatial partitioning works best when objects are evenly distributed. If all objects are clustered in a small area, most will be in the same cell, reducing the effectiveness of partitioning.

3. **Dynamic vs. Static Objects**: Consider separating dynamic and static objects. Static objects don't need to be checked against each other, only against dynamic objects.

4. **Grid Updates**: Updating the grid can be expensive if many objects are moving. Consider optimizing by only updating the grid when an object moves to a different cell.

## Performance Metrics

The spatial partitioning aims to achieve the following performance goals:

- **Collision Detection**: Reduce complexity from O(n²) to O(n)
- **Physics Calculations**: Limit force calculations to nearby particles
- **Memory Usage**: Minimize memory overhead for grid structure
- **CPU Overhead**: Reduce CPU usage for collision detection

## Example Usage

Here's an example of how to use the spatial grid:

```typescript
// Create a spatial grid with cell size 10
const grid = createSpatialGrid(10);

// Add items to the grid
grid.addItem('item1', { x: 5, y: 10, z: 15 });
grid.addItem('item2', { x: 7, y: 12, z: 18 });

// Find items near a position
const nearbyItems = grid.findNearby({ x: 6, y: 11, z: 16 }, 5);

// Get potential collision pairs
const pairs = grid.getPotentialCollisionPairs();
```

## Future Enhancements

Potential future enhancements to spatial partitioning include:

1. **Octree/Quadtree**: Implement hierarchical spatial partitioning for better handling of unevenly distributed objects
2. **Sweep and Prune**: Implement axis-aligned bounding box sorting for faster collision detection
3. **Parallel Processing**: Utilize worker threads for parallel collision detection
4. **Adaptive Grid**: Dynamically adjust grid cell size based on object distribution
5. **Spatial Hashing**: Implement spatial hashing for more efficient memory usage

## Conclusion

Spatial partitioning is a critical optimization technique for the Bitcoin Protozoa project, enabling efficient collision detection and physics calculations for large numbers of particles. By reducing the complexity from O(n²) to O(n), we can significantly improve performance and support more complex simulations.

## Resources

- [Spatial Partitioning](https://en.wikipedia.org/wiki/Space_partitioning)
- [Collision Detection Optimization](https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection)
- [Quadtrees and Octrees](https://en.wikipedia.org/wiki/Quadtree)
- [Sweep and Prune Algorithm](https://en.wikipedia.org/wiki/Sweep_and_prune)
