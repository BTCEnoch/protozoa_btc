/**
 * Spatial Utilities for Bitcoin Protozoa
 *
 * This file provides utilities for spatial calculations and optimizations.
 */

import { Vector3 } from '../types/common';
import { distance } from './mathUtils';

/**
 * Spatial grid cell interface
 */
interface SpatialGridCell {
  x: number;
  y: number;
  z: number;
  items: string[];
}

/**
 * Spatial grid class for efficient spatial queries
 */
export class SpatialGrid {
  private cells: Map<string, SpatialGridCell> = new Map();
  private positions: Map<string, Vector3> = new Map();
  private cellSize: number;

  /**
   * Create a new spatial grid
   * @param cellSize Size of each grid cell
   */
  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
  }

  /**
   * Get the cell key for a position
   * @param position Position vector
   * @returns Cell key string
   */
  private getCellKey(position: Vector3): string {
    const cellX = Math.floor(position.x / this.cellSize);
    const cellY = Math.floor(position.y / this.cellSize);
    const cellZ = Math.floor(position.z / this.cellSize);
    return `${cellX},${cellY},${cellZ}`;
  }

  /**
   * Get the cell for a position
   * @param position Position vector
   * @returns Spatial grid cell
   */
  private getCell(position: Vector3): SpatialGridCell {
    const key = this.getCellKey(position);
    let cell = this.cells.get(key);

    if (!cell) {
      cell = {
        x: Math.floor(position.x / this.cellSize),
        y: Math.floor(position.y / this.cellSize),
        z: Math.floor(position.z / this.cellSize),
        items: []
      };
      this.cells.set(key, cell);
    }

    return cell;
  }

  /**
   * Add an item to the grid
   * @param id Item ID
   * @param position Item position
   */
  public addItem(id: string, position: Vector3): void {
    const cell = this.getCell(position);

    if (!cell.items.includes(id)) {
      cell.items.push(id);
      this.positions.set(id, { ...position });
    }
  }

  /**
   * Remove an item from the grid
   * @param id Item ID
   */
  public removeItem(id: string): void {
    const position = this.positions.get(id);

    if (position) {
      const key = this.getCellKey(position);
      const cell = this.cells.get(key);

      if (cell) {
        const index = cell.items.indexOf(id);
        if (index !== -1) {
          cell.items.splice(index, 1);
        }

        // Remove empty cells
        if (cell.items.length === 0) {
          this.cells.delete(key);
        }
      }

      this.positions.delete(id);
    }
  }

  /**
   * Update an item's position
   * @param id Item ID
   * @param newPosition New position
   */
  public updateItem(id: string, newPosition: Vector3): void {
    const oldPosition = this.positions.get(id);

    if (oldPosition) {
      const oldKey = this.getCellKey(oldPosition);
      const newKey = this.getCellKey(newPosition);

      // If the cell hasn't changed, just update the position
      if (oldKey === newKey) {
        this.positions.set(id, { ...newPosition });
        return;
      }

      // Remove from old cell
      const oldCell = this.cells.get(oldKey);
      if (oldCell) {
        const index = oldCell.items.indexOf(id);
        if (index !== -1) {
          oldCell.items.splice(index, 1);
        }

        // Remove empty cells
        if (oldCell.items.length === 0) {
          this.cells.delete(oldKey);
        }
      }

      // Add to new cell
      const newCell = this.getCell(newPosition);
      if (!newCell.items.includes(id)) {
        newCell.items.push(id);
      }

      // Update position
      this.positions.set(id, { ...newPosition });
    } else {
      // If the item doesn't exist, add it
      this.addItem(id, newPosition);
    }
  }

  /**
   * Find items within a radius of a position
   * @param position Center position
   * @param radius Search radius
   * @returns Array of item IDs within the radius
   */
  public findNearby(position: Vector3, radius: number): string[] {
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerCell = this.getCell(position);
    const nearby: string[] = [];

    // Check all cells within the cell radius
    for (let x = centerCell.x - cellRadius; x <= centerCell.x + cellRadius; x++) {
      for (let y = centerCell.y - cellRadius; y <= centerCell.y + cellRadius; y++) {
        for (let z = centerCell.z - cellRadius; z <= centerCell.z + cellRadius; z++) {
          const key = `${x},${y},${z}`;
          const cell = this.cells.get(key);

          if (cell) {
            // Check each item in the cell
            for (const id of cell.items) {
              const itemPosition = this.positions.get(id);

              if (itemPosition && distance(position, itemPosition) <= radius) {
                nearby.push(id);
              }
            }
          }
        }
      }
    }

    return nearby;
  }

  /**
   * Clear the grid
   */
  public clear(): void {
    this.cells.clear();
    this.positions.clear();
  }

  /**
   * Get the number of items in the grid
   * @returns Number of items
   */
  public getItemCount(): number {
    return this.positions.size;
  }

  /**
   * Get the number of cells in the grid
   * @returns Number of cells
   */
  public getCellCount(): number {
    return this.cells.size;
  }

  /**
   * Get the position of an item
   * @param id Item ID
   * @returns Item position or undefined if not found
   */
  public getItemPosition(id: string): Vector3 | undefined {
    const position = this.positions.get(id);
    return position ? { ...position } : undefined;
  }

  /**
   * Get all items in the grid
   * @returns Array of item IDs
   */
  public getAllItems(): string[] {
    return Array.from(this.positions.keys());
  }
}

/**
 * Create a spatial grid
 * @param cellSize Size of each grid cell
 * @returns A new spatial grid
 */
export function createSpatialGrid(cellSize: number = 10): SpatialGrid {
  return new SpatialGrid(cellSize);
}

/**
 * Find neighbors within a radius
 * @param grid Spatial grid
 * @param position Center position
 * @param radius Search radius
 * @returns Array of neighbor IDs
 */
export function findNeighbors(grid: SpatialGrid, position: Vector3, radius: number): string[] {
  return grid.findNearby(position, radius);
}
