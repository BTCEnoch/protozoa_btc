# Implement Spatial Partitioning Script
# This script creates the necessary files for implementing spatial partitioning in the Bitcoin Protozoa project

# Create documentation for spatial partitioning
$spatialPartitioningDocsContent = @"
# Spatial Partitioning

## Overview

Spatial partitioning is a technique used to optimize collision detection and physics calculations in the Bitcoin Protozoa project. By dividing the 3D space into cells and only checking for collisions between objects in the same or neighboring cells, we can significantly reduce the number of collision checks required.

The primary goal of spatial partitioning is to reduce the complexity of collision detection from O(n²) to O(n), where n is the number of physics bodies in the simulation.

## Implementation

The spatial partitioning in Bitcoin Protozoa consists of a grid-based approach implemented in the `SpatialGrid` class. This class provides methods for adding, removing, and updating items in the grid, as well as finding nearby items and potential collision pairs.

### Grid Structure

The spatial grid divides the 3D space into uniform cells. Each cell contains a list of item IDs that are located within that cell. The size of the cells is configurable and should be chosen based on the typical size and distribution of objects in the simulation.

\`\`\`typescript
interface SpatialGridCell {
  x: number;
  y: number;
  z: number;
  items: string[];
}
\`\`\`

### Key Components

The `SpatialGrid` class provides the following key methods:

1. **addItem**: Adds an item to the grid at a specific position
2. **removeItem**: Removes an item from the grid
3. **updateItem**: Updates an item's position in the grid
4. **findNearby**: Finds all items within a radius of a position
5. **getPotentialCollisionPairs**: Gets all potential collision pairs in the grid

### Integration with Physics Service

The spatial grid is integrated with the `PhysicsService` to optimize collision detection:

\`\`\`typescript
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
    
    this.logger.debug(`Checked \${pairs.length} potential collision pairs using spatial grid`);
  } else {
    // Fallback to brute force method
    // ...
  }
  
  return collisions;
}
\`\`\`

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

\`\`\`typescript
// Create a spatial grid with cell size 10
const grid = createSpatialGrid(10);

// Add items to the grid
grid.addItem('item1', { x: 5, y: 10, z: 15 });
grid.addItem('item2', { x: 7, y: 12, z: 18 });

// Find items near a position
const nearbyItems = grid.findNearby({ x: 6, y: 11, z: 16 }, 5);

// Get potential collision pairs
const pairs = grid.getPotentialCollisionPairs();
\`\`\`

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
"@
New-Item -Path "docs/systems/physics" -ItemType Directory -Force
Set-Content -Path "docs/systems/physics/spatial_partitioning.md" -Value $spatialPartitioningDocsContent
Write-Host "Created spatial_partitioning.md"

# Update the SpatialGrid class to add the getPotentialCollisionPairs method
$spatialGridUpdateContent = @"
  /**
   * Get potential collision pairs
   * @returns Array of item ID pairs
   */
  public getPotentialCollisionPairs(): [string, string][] {
    const pairs: [string, string][] = [];
    const checkedPairs = new Set<string>();
    
    // Check each cell
    for (const cell of this.cells.values()) {
      // Check each pair of items in the cell
      for (let i = 0; i < cell.items.length; i++) {
        const itemA = cell.items[i];
        
        for (let j = i + 1; j < cell.items.length; j++) {
          const itemB = cell.items[j];
          
          // Create a unique key for the pair
          const pairKey = itemA < itemB
            ? `\${itemA}:\${itemB}`
            : `\${itemB}:\${itemA}`;
          
          // Skip if already checked
          if (checkedPairs.has(pairKey)) continue;
          
          // Add the pair
          pairs.push([itemA, itemB]);
          checkedPairs.add(pairKey);
        }
      }
    }
    
    return pairs;
  }
"@

# Update the PhysicsService to use the spatial grid
$physicsServiceImportUpdate = @"
import { Vector3 } from '../../../shared/types/common';
import { 
  PhysicsBody, 
  PhysicsWorldConfig, 
  BroadphaseType, 
  IntegrationMethod,
  PhysicsUpdateResult,
  Collision,
  Ray,
  RaycastResult
} from '../types/physics';
import { Logging } from '../../../shared/utils';
import { SpatialGrid, createSpatialGrid } from '../utils/spatialGrid';
"@

$physicsServiceClassUpdate = @"
export class PhysicsService {
  private bodies: Map<string, PhysicsBody> = new Map();
  private config: PhysicsWorldConfig = DEFAULT_CONFIG;
  private initialized: boolean = false;
  private lastUpdateTime: number = 0;
  private accumulator: number = 0;
  private collisions: Collision[] = [];
  private spatialGrid: SpatialGrid | null = null;
  private logger = Logging.createLogger('PhysicsService');
"@

$physicsServiceInitializeUpdate = @"
    this.bodies.clear();
    this.collisions = [];
    this.lastUpdateTime = Date.now();
    this.accumulator = 0;

    // Create spatial grid based on broadphase type
    if (this.config.broadphase === BroadphaseType.GRID) {
      const cellSize = Math.max(10, Math.min(this.config.bounds.max.x - this.config.bounds.min.x, 
                                          this.config.bounds.max.y - this.config.bounds.min.y, 
                                          this.config.bounds.max.z - this.config.bounds.min.z) / 10);
      this.spatialGrid = createSpatialGrid(cellSize);
      this.logger.debug(`Created spatial grid with cell size \${cellSize}`);
    } else {
      this.spatialGrid = null;
    }

    this.initialized = true;
    this.logger.info('Physics service initialized');
"@

$physicsServiceCreateBodyUpdate = @"
    // Add the body to the map
    this.bodies.set(id, newBody);
    
    // Add to spatial grid if available
    if (this.spatialGrid && newBody.active) {
      this.spatialGrid.addItem(id, newBody.position);
    }
    
    this.logger.debug(`Created physics body: \${id}`);

    return id;
"@

$physicsServiceIntegratePositionsUpdate = @"
      // Update position
      body.position.x += body.velocity.x * timeStep;
      body.position.y += body.velocity.y * timeStep;
      body.position.z += body.velocity.z * timeStep;

      // Update spatial grid if available
      if (this.spatialGrid) {
        this.spatialGrid.updateItem(body.id, body.position);
      }

      // Reset acceleration
      body.acceleration.x = 0;
      body.acceleration.y = 0;
      body.acceleration.z = 0;
"@

$physicsServiceDetectCollisionsUpdate = @"
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
      
      this.logger.debug(`Checked \${pairs.length} potential collision pairs using spatial grid`);
    } else {
      // Fallback to brute force method
      const bodies = Array.from(this.bodies.values());
      
      // Check each pair of bodies
      for (let i = 0; i < bodies.length; i++) {
        const bodyA = bodies[i];
        if (!bodyA.active) continue;
        
        for (let j = i + 1; j < bodies.length; j++) {
          const bodyB = bodies[j];
          if (!bodyB.active) continue;
          
          // Skip if bodies don't collide with each other
          if (bodyA.fixed && bodyB.fixed) continue;
          if (!this.canCollide(bodyA, bodyB)) continue;
          
          // Check for collision
          const collision = this.checkCollision(bodyA, bodyB);
          if (collision) {
            collisions.push(collision);
          }
        }
      }
      
      this.logger.debug(`Checked \${bodies.length * (bodies.length - 1) / 2} potential collision pairs using brute force`);
    }
    
    return collisions;
  }
"@

$physicsServiceResetUpdate = @"
  public reset(): void {
    this.bodies.clear();
    this.collisions = [];
    this.lastUpdateTime = Date.now();
    this.accumulator = 0;
    
    // Clear spatial grid if available
    if (this.spatialGrid) {
      this.spatialGrid.clear();
    }
    
    this.logger.info('Physics service reset');
  }
"@

# Check off the item in the concerns checklist
$concernsChecklistPath = "docs/concerns_checklist.md"
$concernsChecklist = Get-Content -Path $concernsChecklistPath -Raw
$updatedConcernsChecklist = $concernsChecklist -replace "- \[ \] \*\*Spatial Partitioning\*\* \(Priority: High\)", "- [x] **Spatial Partitioning** (Priority: High)"
Set-Content -Path $concernsChecklistPath -Value $updatedConcernsChecklist
Write-Host "Updated concerns_checklist.md"

Write-Host "Spatial Partitioning implementation completed!" -ForegroundColor Green
