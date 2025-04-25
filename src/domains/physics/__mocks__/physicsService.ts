/**
 * Mock Physics Service
 *
 * This is a mock implementation of the physics service for testing.
 */

import { PhysicsBody, PhysicsConfig, PhysicsUpdateResult, Collision } from '../types';
import { Vector3 } from '../../../types/common';

export class PhysicsService {
  private initialized: boolean = false;
  private bodies: Map<string, PhysicsBody> = new Map();
  private collisions: Collision[] = [];
  private lastUpdateTime: number = Date.now();

  constructor(private config: PhysicsConfig = {
    timeStep: 1 / 60,
    iterations: 1,
    gravity: { x: 0, y: -9.8, z: 0 },
    bounds: { min: { x: -100, y: -100, z: -100 }, max: { x: 100, y: 100, z: 100 } }
  }) {}

  public async initialize(): Promise<void> {
    this.initialized = true;
    return Promise.resolve();
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public createBody(body: Omit<PhysicsBody, 'id'>): string {
    const id = `body-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newBody: PhysicsBody = {
      ...body,
      id
    };
    this.bodies.set(id, newBody);
    return id;
  }

  public getBody(id: string): PhysicsBody | undefined {
    return this.bodies.get(id);
  }

  public getBodies(): PhysicsBody[] {
    return Array.from(this.bodies.values());
  }

  public update(deltaTime?: number): PhysicsUpdateResult {
    if (!this.initialized) {
      throw new Error('Physics service not initialized');
    }

    if (deltaTime === undefined) {
      const currentTime = Date.now();
      deltaTime = (currentTime - this.lastUpdateTime) / 1000;
      this.lastUpdateTime = currentTime;
    }

    // Mock physics update - just return current state
    return {
      bodies: Array.from(this.bodies.values()),
      collisions: this.collisions,
      time: deltaTime,
      iterations: 1
    };
  }

  public applyForce(bodyId: string, force: Vector3): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.fixed) {
      body.acceleration.x += force.x;
      body.acceleration.y += force.y;
      body.acceleration.z += force.z;
    }
  }

  public setPosition(bodyId: string, position: Vector3): void {
    const body = this.bodies.get(bodyId);
    if (body) {
      body.position = { ...position };
    }
  }

  public setVelocity(bodyId: string, velocity: Vector3): void {
    const body = this.bodies.get(bodyId);
    if (body && !body.fixed) {
      body.velocity = { ...velocity };
    }
  }

  public reset(): void {
    this.bodies.clear();
    this.collisions = [];
    this.lastUpdateTime = Date.now();
  }
}

export const createPhysicsService = (config?: PhysicsConfig): PhysicsService => {
  return new PhysicsService(config);
};

export default PhysicsService;
