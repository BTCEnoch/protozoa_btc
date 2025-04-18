/**
 * Physics Service for Bitcoin Protozoa
 *
 * This service manages the physics simulation for particles.
 */

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

// Default physics world configuration
const DEFAULT_CONFIG: PhysicsWorldConfig = {
  gravity: { x: 0, y: 0, z: 0 },
  bounds: {
    min: { x: -100, y: -100, z: -100 },
    max: { x: 100, y: 100, z: 100 }
  },
  timeStep: 1 / 60,
  iterations: 10,
  broadphase: BroadphaseType.GRID,
  sleepThreshold: 0.01,
  maxBodies: 10000
};

// Singleton instance
let instance: PhysicsService | null = null;

/**
 * Physics Service class
 * Manages the physics simulation
 */
export class PhysicsService {
  private bodies: Map<string, PhysicsBody> = new Map();
  private config: PhysicsWorldConfig = DEFAULT_CONFIG;
  private initialized: boolean = false;
  private lastUpdateTime: number = 0;
  private accumulator: number = 0;
  private collisions: Collision[] = [];
  private logger = Logging.createLogger('PhysicsService');

  /**
   * Initialize the physics service
   * @param config Physics world configuration
   */
  public initialize(config?: Partial<PhysicsWorldConfig>): void {
    if (this.initialized) {
      this.logger.warn('Physics service already initialized');
      return;
    }

    // Apply custom configuration
    if (config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
    }

    this.bodies.clear();
    this.collisions = [];
    this.lastUpdateTime = Date.now();
    this.accumulator = 0;

    this.initialized = true;
    this.logger.info('Physics service initialized');
  }

  /**
   * Check if the service is initialized
   * @returns True if the service is initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a physics body
   * @param body Physics body
   * @returns Body ID
   */
  public createBody(body: Omit<PhysicsBody, 'id'>): string {
    if (!this.initialized) {
      throw new Error('Physics service not initialized');
    }

    // Generate a unique ID
    const id = `body-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create the body
    const newBody: PhysicsBody = {
      ...body,
      id
    };

    // Add the body to the map
    this.bodies.set(id, newBody);
    this.logger.debug(`Created physics body: ${id}`);

    return id;
  }

  /**
   * Get a physics body by ID
   * @param id Body ID
   * @returns Physics body or undefined if not found
   */
  public getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  /**
   * Get all physics bodies
   * @returns Array of physics bodies
   */
  public getBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  /**
   * Update the physics simulation
   * @param deltaTime Time step in seconds
   * @returns Physics update result
   */
  public update(deltaTime?: number): PhysicsUpdateResult {
    if (!this.initialized) {
      throw new Error('Physics service not initialized');
    }

    // Calculate delta time if not provided
    if (deltaTime === undefined) {
      const currentTime = Date.now();
      deltaTime = (currentTime - this.lastUpdateTime) / 1000;
      this.lastUpdateTime = currentTime;
    }

    // Add to accumulator
    this.accumulator += deltaTime;

    // Perform fixed time step updates
    let iterations = 0;
    while (this.accumulator >= this.config.timeStep && iterations < this.config.iterations) {
      this.step(this.config.timeStep);
      this.accumulator -= this.config.timeStep;
      iterations++;
    }

    // Return update result
    return {
      bodies: Array.from(this.bodies.values()),
      collisions: this.collisions,
      time: deltaTime,
      iterations
    };
  }

  /**
   * Perform a single physics step
   * @param timeStep Time step in seconds
   */
  private step(timeStep: number): void {
    // Apply forces
    this.applyForces(timeStep);

    // Integrate positions
    this.integratePositions(timeStep);

    // Detect and resolve collisions
    this.collisions = this.detectCollisions();
    this.resolveCollisions(this.collisions);

    // Apply constraints
    this.applyConstraints();
  }

  /**
   * Apply forces to bodies
   * @param timeStep Time step in seconds
   */
  private applyForces(timeStep: number): void {
    // Apply gravity
    if (this.config.gravity.x !== 0 || this.config.gravity.y !== 0 || this.config.gravity.z !== 0) {
      for (const body of this.bodies.values()) {
        if (!body.fixed && body.active) {
          body.acceleration.x += this.config.gravity.x;
          body.acceleration.y += this.config.gravity.y;
          body.acceleration.z += this.config.gravity.z;
        }
      }
    }

    // Apply other forces (to be implemented)
  }

  /**
   * Integrate positions using Euler integration
   * @param timeStep Time step in seconds
   */
  private integratePositions(timeStep: number): void {
    for (const body of this.bodies.values()) {
      if (body.fixed || !body.active) {
        continue;
      }

      // Update velocity
      body.velocity.x += body.acceleration.x * timeStep;
      body.velocity.y += body.acceleration.y * timeStep;
      body.velocity.z += body.acceleration.z * timeStep;

      // Update position
      body.position.x += body.velocity.x * timeStep;
      body.position.y += body.velocity.y * timeStep;
      body.position.z += body.velocity.z * timeStep;

      // Reset acceleration
      body.acceleration.x = 0;
      body.acceleration.y = 0;
      body.acceleration.z = 0;
    }
  }

  /**
   * Detect collisions between bodies
   * @returns Array of collisions
   */
  private detectCollisions(): Collision[] {
    // Simple implementation for now
    const collisions: Collision[] = [];
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

    return collisions;
  }

  /**
   * Check if two bodies can collide
   * @param bodyA First body
   * @param bodyB Second body
   * @returns True if bodies can collide, false otherwise
   */
  private canCollide(bodyA: PhysicsBody, bodyB: PhysicsBody): boolean {
    // Check collision groups
    if (bodyA.collidesWith.includes(bodyB.group) && bodyB.collidesWith.includes(bodyA.group)) {
      return true;
    }
    return false;
  }

  /**
   * Check for collision between two bodies
   * @param bodyA First body
   * @param bodyB Second body
   * @returns Collision or null if no collision
   */
  private checkCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): Collision | null {
    // Simple sphere-sphere collision detection
    const dx = bodyB.position.x - bodyA.position.x;
    const dy = bodyB.position.y - bodyA.position.y;
    const dz = bodyB.position.z - bodyA.position.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const radiusSum = bodyA.radius + bodyB.radius;

    if (distanceSquared < radiusSum * radiusSum) {
      const distance = Math.sqrt(distanceSquared);
      const depth = radiusSum - distance;

      // Calculate collision normal
      const nx = dx / distance;
      const ny = dy / distance;
      const nz = dz / distance;

      // Calculate collision point
      const px = bodyA.position.x + nx * bodyA.radius;
      const py = bodyA.position.y + ny * bodyA.radius;
      const pz = bodyA.position.z + nz * bodyA.radius;

      return {
        bodyA: bodyA.id,
        bodyB: bodyB.id,
        point: { x: px, y: py, z: pz },
        normal: { x: nx, y: ny, z: nz },
        depth,
        impulse: 0,
        time: Date.now()
      };
    }

    return null;
  }

  /**
   * Resolve collisions
   * @param collisions Array of collisions
   */
  private resolveCollisions(collisions: Collision[]): void {
    for (const collision of collisions) {
      const bodyA = this.bodies.get(collision.bodyA);
      const bodyB = this.bodies.get(collision.bodyB);

      if (!bodyA || !bodyB) continue;

      // Skip if both bodies are fixed
      if (bodyA.fixed && bodyB.fixed) continue;

      // Calculate relative velocity
      const rvx = bodyB.velocity.x - bodyA.velocity.x;
      const rvy = bodyB.velocity.y - bodyA.velocity.y;
      const rvz = bodyB.velocity.z - bodyA.velocity.z;

      // Calculate relative velocity along normal
      const velAlongNormal = rvx * collision.normal.x + rvy * collision.normal.y + rvz * collision.normal.z;

      // Skip if bodies are separating
      if (velAlongNormal > 0) continue;

      // Calculate restitution (bounciness)
      const restitution = Math.min(bodyA.restitution, bodyB.restitution);

      // Calculate impulse scalar
      let j = -(1 + restitution) * velAlongNormal;
      j /= (bodyA.fixed ? 0 : 1 / bodyA.mass) + (bodyB.fixed ? 0 : 1 / bodyB.mass);

      // Apply impulse
      const impulseX = j * collision.normal.x;
      const impulseY = j * collision.normal.y;
      const impulseZ = j * collision.normal.z;

      if (!bodyA.fixed) {
        bodyA.velocity.x -= impulseX / bodyA.mass;
        bodyA.velocity.y -= impulseY / bodyA.mass;
        bodyA.velocity.z -= impulseZ / bodyA.mass;
      }

      if (!bodyB.fixed) {
        bodyB.velocity.x += impulseX / bodyB.mass;
        bodyB.velocity.y += impulseY / bodyB.mass;
        bodyB.velocity.z += impulseZ / bodyB.mass;
      }

      // Store impulse in collision
      collision.impulse = j;

      // Positional correction to prevent sinking
      const percent = 0.2; // Penetration percentage to correct
      const slop = 0.01; // Penetration allowance
      const correction = Math.max(collision.depth - slop, 0) * percent;
      const correctionX = collision.normal.x * correction;
      const correctionY = collision.normal.y * correction;
      const correctionZ = collision.normal.z * correction;

      if (!bodyA.fixed) {
        bodyA.position.x -= correctionX / bodyA.mass;
        bodyA.position.y -= correctionY / bodyA.mass;
        bodyA.position.z -= correctionZ / bodyA.mass;
      }

      if (!bodyB.fixed) {
        bodyB.position.x += correctionX / bodyB.mass;
        bodyB.position.y += correctionY / bodyB.mass;
        bodyB.position.z += correctionZ / bodyB.mass;
      }
    }
  }

  /**
   * Apply constraints to bodies
   */
  private applyConstraints(): void {
    // Apply bounds constraint
    for (const body of this.bodies.values()) {
      if (body.fixed || !body.active) continue;

      // Constrain to bounds
      if (body.position.x - body.radius < this.config.bounds.min.x) {
        body.position.x = this.config.bounds.min.x + body.radius;
        body.velocity.x = -body.velocity.x * body.restitution;
      } else if (body.position.x + body.radius > this.config.bounds.max.x) {
        body.position.x = this.config.bounds.max.x - body.radius;
        body.velocity.x = -body.velocity.x * body.restitution;
      }

      if (body.position.y - body.radius < this.config.bounds.min.y) {
        body.position.y = this.config.bounds.min.y + body.radius;
        body.velocity.y = -body.velocity.y * body.restitution;
      } else if (body.position.y + body.radius > this.config.bounds.max.y) {
        body.position.y = this.config.bounds.max.y - body.radius;
        body.velocity.y = -body.velocity.y * body.restitution;
      }

      if (body.position.z - body.radius < this.config.bounds.min.z) {
        body.position.z = this.config.bounds.min.z + body.radius;
        body.velocity.z = -body.velocity.z * body.restitution;
      } else if (body.position.z + body.radius > this.config.bounds.max.z) {
        body.position.z = this.config.bounds.max.z - body.radius;
        body.velocity.z = -body.velocity.z * body.restitution;
      }
    }
  }

  /**
   * Reset the physics service
   */
  public reset(): void {
    this.bodies.clear();
    this.collisions = [];
    this.lastUpdateTime = Date.now();
    this.accumulator = 0;
    this.logger.info('Physics service reset');
  }
}

/**
 * Get the physics service instance
 * @returns The physics service instance
 */
export function getPhysicsService(): PhysicsService {
  if (!instance) {
    instance = new PhysicsService();
  }
  return instance;
}
