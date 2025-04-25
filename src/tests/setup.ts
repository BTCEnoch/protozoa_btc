/**
 * Jest setup file
 *
 * This file is executed before each test file is run.
 * It sets up global mocks and other test environment configurations.
 */

// Fix for Jest and Chai assertion conflicts
// Add Jest assertion methods to global scope
try {
  // Ensure Jest's expect is properly set up
  if (typeof expect === 'function') {
    // Make sure all assertion methods are available
    const jestAssertions = [
      'toBe',
      'toBeNull',
      'toBeDefined',
      'toBeUndefined',
      'toBeGreaterThan',
      'toBeGreaterThanOrEqual',
      'toBeLessThan',
      'toBeLessThanOrEqual',
      'toBeCloseTo',
      'toHaveLength',
      'toContain',
      'toEqual',
      'toMatch',
      'toMatchObject',
      'toMatchSnapshot',
      'toMatchInlineSnapshot',
      'toThrow',
      'toThrowError',
      'toBeInstanceOf',
      'toHaveProperty'
    ];

    // Make sure all assertion methods are available on the expect object
    const expectResult = expect({});
    for (const assertion of jestAssertions) {
      if (typeof expectResult[assertion] !== 'function') {
        console.warn(`Missing assertion method: ${assertion}`);
      }
    }
  }
} catch (error) {
  console.warn('Error setting up Jest assertions:', error);
}

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({})
  } as Response);
});

// Mock Worker API
// Instead of trying to mock the Worker class, let's just disable the tests that use it
// This is a temporary solution until we can properly mock the Worker class
jest.mock('worker_threads', () => ({}));

// Create a simple mock for the Worker constructor
const MockWorker = jest.fn().mockImplementation((stringUrl) => ({
  onmessage: null,
  onerror: null,
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Add the prototype property to make it look like a constructor
MockWorker.prototype = {
  onmessage: null,
  onerror: null,
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

// Cast to any to avoid TypeScript errors
global.Worker = MockWorker as any;

// Mock URL API
global.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
} as any;

// Mock Worker API
global.Worker = MockWorker as any;

// Mock performance API if not available
if (!global.performance) {
  global.performance = {
    now: jest.fn(() => Date.now())
  } as any;
}

// Mock requestAnimationFrame
global.requestAnimationFrame = function(callback: FrameRequestCallback): number {
  return setTimeout(() => callback(Date.now()), 0) as unknown as number;
};

// Mock cancelAnimationFrame
global.cancelAnimationFrame = function(handle: number): void {
  clearTimeout(handle as unknown as NodeJS.Timeout);
};

// Mock THREE.js
jest.mock('three', () => {
  return {
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn()
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      lookAt: jest.fn()
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement('canvas')
    })),
    BufferGeometry: jest.fn().mockImplementation(() => ({
      setAttribute: jest.fn()
    })),
    BufferAttribute: jest.fn(),
    PointsMaterial: jest.fn(),
    Points: jest.fn(),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(),
    Vector3: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      z: 0,
      set: jest.fn()
    })),
    Clock: jest.fn().mockImplementation(() => ({
      getDelta: jest.fn().mockReturnValue(0.016),
      getElapsedTime: jest.fn().mockReturnValue(1.0)
    })),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    })),
    Mesh: jest.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    })),
    MeshBasicMaterial: jest.fn(),
    BoxGeometry: jest.fn(),
    SphereGeometry: jest.fn(),
    Color: jest.fn().mockImplementation(() => ({
      set: jest.fn()
    })),
    Raycaster: jest.fn().mockImplementation(() => ({
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn().mockReturnValue([])
    }))
  };
});

// Mock service registry
jest.mock('../shared/services/serviceRegistry', () => {
  const registry = new Map();

  // Add default mock services
  const mockTraitService = {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true),
    getTraitById: jest.fn().mockReturnValue({
      id: 'mock-trait',
      name: 'Mock Trait',
      description: 'A mock trait for testing',
      rarityTier: 'COMMON',
      role: 'CORE'
    }),
    getTraitsForRole: jest.fn().mockReturnValue([])
  };

  const mockRNGService = {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true),
    getRandomNumber: jest.fn().mockReturnValue(0.5),
    getRandomInt: jest.fn().mockReturnValue(42),
    getRandomFromArray: jest.fn().mockImplementation(arr => arr[0]),
    getWeightedRandom: jest.fn().mockImplementation((weights) => {
      const keys = Object.keys(weights);
      return keys[0];
    }),
    setSeed: jest.fn(),
    getRNGSystem: jest.fn().mockReturnValue({
      getStream: jest.fn().mockReturnValue({
        nextItem: jest.fn().mockImplementation(arr => arr[0]),
        nextInt: jest.fn().mockReturnValue(42),
        nextFloat: jest.fn().mockReturnValue(0.5)
      })
    }),
    reset: jest.fn()
  };

  const mockWorkerService = {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true),
    executeTask: jest.fn().mockResolvedValue({ result: 'mock-result' }),
    executeTaskWithPriority: jest.fn().mockResolvedValue({ result: 'mock-result' }),
    terminateWorkers: jest.fn(),
    reset: jest.fn(),
    setMaxWorkers: jest.fn()
  };

  const mockParticleService = {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true),
    createParticleGroups: jest.fn(),
    getGroup: jest.fn().mockReturnValue({
      id: 'mock-group',
      role: 'CORE',
      particles: []
    }),
    reset: jest.fn()
  };

  const mockFormationService = {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true),
    getRandomFormation: jest.fn().mockReturnValue({
      id: 'mock-formation',
      name: 'Mock Formation',
      pattern: []
    }),
    reset: jest.fn()
  };

  const mockPhysicsService = {
    initialize: jest.fn().mockResolvedValue(true),
    isInitialized: jest.fn().mockReturnValue(true),
    createBody: jest.fn().mockReturnValue('mock-body-id'),
    getBody: jest.fn().mockReturnValue({
      id: 'mock-body-id',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    }),
    update: jest.fn(),
    reset: jest.fn()
  };

  // Pre-populate registry with common services
  registry.set('TraitService', mockTraitService);
  registry.set('RNGService', mockRNGService);
  registry.set('WorkerService', mockWorkerService);
  registry.set('ParticleService', mockParticleService);
  registry.set('FormationService', mockFormationService);
  registry.set('PhysicsService', mockPhysicsService);

  const mockRegistry = {
    register: jest.fn().mockImplementation((name, service) => {
      registry.set(name, service);
    }),
    get: jest.fn().mockImplementation((name) => {
      return registry.get(name);
    }),
    has: jest.fn().mockImplementation((name) => {
      return registry.has(name);
    }),
    getAll: jest.fn().mockImplementation(() => Array.from(registry.entries())),
    clear: jest.fn().mockImplementation(() => registry.clear())
  };

  return {
    getServiceRegistry: jest.fn().mockReturnValue(mockRegistry),
    registry: mockRegistry // Export directly for tests that need it
  };
});
