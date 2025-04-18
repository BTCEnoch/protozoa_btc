/**
 * Spatial Grid for Bitcoin Protozoa
 *
 * This module provides a spatial partitioning system for efficient physics calculations.
 * It divides 3D space into cells and allows for fast neighbor queries, which is
 * essential for optimizing force calculations between particles.
 */

import { Vector3 } from '../../types/common';

/**
 * Cell in the spatial grid
 */
interface Cell {
  indices: number[];
}

/**
 * Spatial Grid class
 * Provides spatial partitioning for efficient physics calculations
 */
export class SpatialGrid {
  private cells: Map<string, Cell> = new Map();
  private cellSize: number;
  private positions: Float32Array;
  private positionCount: number;

  /**
   * Create a new spatial grid
   * @param cellSize Size of each cell in the grid
   */
  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
    this.positions = new Float32Array(0);
    this.positionCount = 0;
  }

  /**
   * Update the grid with new positions
   * @param positions Float32Array of positions (x, y, z triplets)
   */
  public update(positions: Float32Array): void {
    this.positions = positions;
    this.positionCount = positions.length / 3;

    // Clear the grid
    this.cells.clear();

    // Add each position to the grid
    for (let i = 0; i < this.positionCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      // Get the cell key
      const cellKey = this.getCellKey(x, y, z);

      // Get or create the cell
      let cell = this.cells.get(cellKey);
      if (!cell) {
        cell = { indices: [] };
        this.cells.set(cellKey, cell);
      }

      // Add the index to the cell
      cell.indices.push(i);
    }
  }

  /**
   * Get the key for a cell at the given position
   * @param x X coordinate
   * @param y Y coordinate
   * @param z Z coordinate
   * @returns Cell key
   */
  private getCellKey(x: number, y: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);

    return `${cellX},${cellY},${cellZ}`;
  }

  /**
   * Get the indices of particles within a radius of a position
   * @param position Position to query
   * @param radius Radius to search
   * @returns Array of particle indices
   */
  public getIndicesWithinRadius(position: Vector3, radius: number): number[] {
    const result: number[] = [];
    const radiusSquared = radius * radius;

    // Calculate the cell range to check
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCellX = Math.floor(position.x / this.cellSize);
    const centerCellY = Math.floor(position.y / this.cellSize);
    const centerCellZ = Math.floor(position.z / this.cellSize);

    // Check all cells within the cell radius
    for (let cellX = centerCellX - cellRadius; cellX <= centerCellX + cellRadius; cellX++) {
      for (let cellY = centerCellY - cellRadius; cellY <= centerCellY + cellRadius; cellY++) {
        for (let cellZ = centerCellZ - cellRadius; cellZ <= centerCellZ + cellRadius; cellZ++) {
          const cellKey = `${cellX},${cellY},${cellZ}`;
          const cell = this.cells.get(cellKey);

          if (cell) {
            // Check each particle in the cell
            for (const index of cell.indices) {
              const x = this.positions[index * 3];
              const y = this.positions[index * 3 + 1];
              const z = this.positions[index * 3 + 2];

              // Calculate the distance squared
              const dx = x - position.x;
              const dy = y - position.y;
              const dz = z - position.z;
              const distanceSquared = dx * dx + dy * dy + dz * dz;

              // If the particle is within the radius, add it to the result
              if (distanceSquared <= radiusSquared) {
                result.push(index);
              }
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Get the indices of particles within a radius of a particle
   * @param index Index of the particle
   * @param radius Radius to search
   * @returns Array of particle indices
   */
  public getNeighborIndices(index: number, radius: number): number[] {
    // Get the position of the particle
    const x = this.positions[index * 3];
    const y = this.positions[index * 3 + 1];
    const z = this.positions[index * 3 + 2];

    // Get the indices within the radius
    const indices = this.getIndicesWithinRadius({ x, y, z }, radius);

    // Remove the particle itself from the result
    return indices.filter(i => i !== index);
  }

  /**
   * Get all particle indices in the grid
   * @returns Array of all particle indices
   */
  public getAllIndices(): number[] {
    const result: number[] = [];

    // Add all indices from all cells
    for (const cell of this.cells.values()) {
      result.push(...cell.indices);
    }

    return result;
  }

  /**
   * Get the number of cells in the grid
   * @returns Number of cells
   */
  public getCellCount(): number {
    return this.cells.size;
  }

  /**
   * Get the cell size
   * @returns Cell size
   */
  public getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Set the cell size
   * @param cellSize New cell size
   */
  public setCellSize(cellSize: number): void {
    this.cellSize = cellSize;

    // Update the grid with the new cell size
    if (this.positions.length > 0) {
      this.update(this.positions);
    }
  }
}

/**
 * Create a new spatial grid
 * @param cellSize Size of each cell in the grid
 * @returns Spatial grid instance
 */
export function createSpatialGrid(cellSize: number = 10): SpatialGrid {
  return new SpatialGrid(cellSize);
}
