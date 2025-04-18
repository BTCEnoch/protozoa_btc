/**
 * Collision Types for Bitcoin Protozoa
 * 
 * This file defines the types for collision detection in the physics system.
 */

import { Vector3 } from '../../../shared/types/common';
import { PhysicsBody, Collision } from './physics';

/**
 * Collision detector interface
 * Detects collisions between bodies
 */
export interface CollisionDetector {
  detectCollisions(bodies: PhysicsBody[]): Collision[];
  detectCollisionPair(bodyA: PhysicsBody, bodyB: PhysicsBody): Collision | null;
}

/**
 * Collision resolver interface
 * Resolves collisions between bodies
 */
export interface CollisionResolver {
  resolveCollisions(bodies: PhysicsBody[], collisions: Collision[]): void;
  resolveCollision(bodyA: PhysicsBody, bodyB: PhysicsBody, collision: Collision): void;
}

/**
 * Collision filter interface
 * Filters collisions based on various criteria
 */
export interface CollisionFilter {
  shouldCollide(bodyA: PhysicsBody, bodyB: PhysicsBody): boolean;
}

/**
 * Collision callback interface
 * Callbacks for collision events
 */
export interface CollisionCallbacks {
  onCollisionStart?: (collision: Collision, bodyA: PhysicsBody, bodyB: PhysicsBody) => void;
  onCollisionActive?: (collision: Collision, bodyA: PhysicsBody, bodyB: PhysicsBody) => void;
  onCollisionEnd?: (bodyAId: string, bodyBId: string) => void;
}

/**
 * Collision pair interface
 * Represents a pair of bodies that could collide
 */
export interface CollisionPair {
  bodyAId: string;
  bodyBId: string;
  active: boolean;
  lastCollision?: Collision;
}

/**
 * Collision shape type enum
 */
export enum CollisionShapeType {
  SPHERE = 'SPHERE',
  BOX = 'BOX',
  CAPSULE = 'CAPSULE',
  CYLINDER = 'CYLINDER',
  CONVEX = 'CONVEX',
  COMPOUND = 'COMPOUND'
}

/**
 * Collision shape interface
 * Base interface for collision shapes
 */
export interface CollisionShape {
  type: CollisionShapeType;
  position: Vector3; // Local position offset
  rotation: Vector3; // Local rotation offset
}

/**
 * Sphere collision shape interface
 */
export interface SphereShape extends CollisionShape {
  type: CollisionShapeType.SPHERE;
  radius: number;
}

/**
 * Box collision shape interface
 */
export interface BoxShape extends CollisionShape {
  type: CollisionShapeType.BOX;
  width: number;
  height: number;
  depth: number;
}

/**
 * Capsule collision shape interface
 */
export interface CapsuleShape extends CollisionShape {
  type: CollisionShapeType.CAPSULE;
  radius: number;
  height: number;
  direction: 'x' | 'y' | 'z';
}

/**
 * Cylinder collision shape interface
 */
export interface CylinderShape extends CollisionShape {
  type: CollisionShapeType.CYLINDER;
  radius: number;
  height: number;
  direction: 'x' | 'y' | 'z';
}

/**
 * Convex collision shape interface
 */
export interface ConvexShape extends CollisionShape {
  type: CollisionShapeType.CONVEX;
  vertices: Vector3[];
}

/**
 * Compound collision shape interface
 */
export interface CompoundShape extends CollisionShape {
  type: CollisionShapeType.COMPOUND;
  shapes: CollisionShape[];
}
