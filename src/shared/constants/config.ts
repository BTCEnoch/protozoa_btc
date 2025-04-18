/**
 * Configuration Constants
 *
 * This file defines configuration constants used throughout the application.
 */

import { 
  AppConfig, 
  Environment, 
  LogLevel, 
  PerformanceMode 
} from '../types/config';

/**
 * Default application configuration
 */
export const DEFAULT_CONFIG: AppConfig = {
  environment: Environment.DEVELOPMENT,
  version: '0.1.0',
  performanceMode: PerformanceMode.BALANCED,
  
  // Rendering configuration
  rendering: {
    maxParticles: 5000,
    particleSize: 0.5,
    lodLevels: 3,
    lodDistances: [10, 50, 100],
    enablePostProcessing: true,
    enableBloom: true,
    bloomIntensity: 0.5,
    shadowQuality: 'medium',
    antialiasing: true,
    textureQuality: 'medium',
    fps: 60,
    useWebGL2: true,
    enableInstancing: true,
    fxaa: true,
    maxLights: 4,
    lod: {
      levels: [],
      autoGenerate: true,
      autoLevelCount: 3,
      updateFrequency: 1000,
      frustumCulled: true,
      fadeTransition: true,
      transitionDuration: 500
    }
  },
  
  // Physics configuration
  physics: {
    simulationRate: 60,
    maxForce: 10,
    damping: 0.05,
    useWorkers: true,
    numWorkers: 4,
    spatialGridResolution: 10,
    integrationMethod: 'verlet',
    collisionDetection: true,
    optimizationLevel: 'medium',
    useBarnesHut: true,
    barnesHutTheta: 0.5,
    stepsPerFrame: 1
  },
  
  // Bitcoin configuration
  bitcoin: {
    apiEndpoint: 'https://ordinals.com',
    fetchInterval: 60000,
    maxRetries: 3,
    timeoutMs: 10000,
    cacheExpiration: 60,
    enableMockData: false
  },
  
  // Evolution configuration
  evolution: {
    confirmationMilestones: [10000, 50000, 100000, 250000, 500000, 1000000],
    mutationChances: [0.01, 0.05, 0.1, 0.25, 0.5, 1.0],
    maxMutationsPerEvent: 3,
    enableSubclassMutations: true,
    enableExoticMutations: false,
    mutationIntensity: 0.5
  },
  
  // Game theory configuration
  gameTheory: {
    defaultPlayers: 2,
    autoCalculateNash: true,
    calculationTimeout: 5000,
    cacheResults: true,
    cacheSize: 100,
    payoffNormalization: true,
    equilibriumPrecision: 0.001,
    useThreading: true,
    threadPoolSize: 4,
    defaultStrategies: ['aggressive', 'defensive', 'balanced'],
    enableDynamicStrategies: true,
    enableLearning: false,
    learningRate: 0.1
  },
  
  // Network configuration
  network: {
    baseUrl: 'https://api.example.com',
    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000,
    cacheControl: true,
    cacheMaxAge: 3600,
    enableCompression: true,
    batchRequests: true,
    connectionPoolSize: 10
  },
  
  // Storage configuration
  storage: {
    storageType: 'localStorage',
    prefix: 'btc_protozoa_',
    maxSize: 5120,
    compression: true,
    encryption: false,
    autoSave: true,
    autoSaveInterval: 5,
    persistenceLevel: 'permanent'
  },
  
  // Audio configuration
  audio: {
    masterVolume: 0.5,
    musicVolume: 0.5,
    sfxVolume: 0.5,
    spatialAudio: true,
    enableMusicReactivity: true,
    highQualityAudio: false
  },
  
  // Debug configuration
  debug: {
    showStats: false,
    logLevel: LogLevel.INFO,
    showGrids: false,
    showForces: false,
    showBounds: false,
    inspectorEnabled: false,
    logEvents: false,
    showFrameTimes: false
  },
  
  // Feature flags
  features: {
    enableGameTheory: true,
    enableEvolution: true,
    enableBitcoinFetching: true,
    enableAdvancedRendering: true,
    enableParticleEffects: true,
    enableAudio: true,
    enableExperimentalFeatures: false
  }
};

/**
 * Development configuration
 */
export const DEV_CONFIG: Partial<AppConfig> = {
  environment: Environment.DEVELOPMENT,
  debug: {
    ...DEFAULT_CONFIG.debug,
    showStats: true,
    logLevel: LogLevel.DEBUG,
    inspectorEnabled: true
  },
  bitcoin: {
    ...DEFAULT_CONFIG.bitcoin,
    enableMockData: true
  }
};

/**
 * Test configuration
 */
export const TEST_CONFIG: Partial<AppConfig> = {
  environment: Environment.TEST,
  debug: {
    ...DEFAULT_CONFIG.debug,
    logLevel: LogLevel.DEBUG
  },
  bitcoin: {
    ...DEFAULT_CONFIG.bitcoin,
    enableMockData: true
  },
  rendering: {
    ...DEFAULT_CONFIG.rendering,
    enablePostProcessing: false,
    enableBloom: false,
    antialiasing: false,
    textureQuality: 'low'
  },
  physics: {
    ...DEFAULT_CONFIG.physics,
    simulationRate: 30,
    useWorkers: false
  }
};

/**
 * Production configuration
 */
export const PROD_CONFIG: Partial<AppConfig> = {
  environment: Environment.PRODUCTION,
  debug: {
    ...DEFAULT_CONFIG.debug,
    showStats: false,
    logLevel: LogLevel.ERROR,
    inspectorEnabled: false
  },
  bitcoin: {
    ...DEFAULT_CONFIG.bitcoin,
    enableMockData: false
  }
};
