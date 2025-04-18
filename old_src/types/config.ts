/**
 * Configuration Types for Bitcoin Protozoa
 *
 * This file defines the types for configuration settings used throughout the application.
 * It includes environment settings, rendering options, physics settings, and feature flags.
 */

/**
 * Environment enum
 * Defines the different environments the application can run in
 */
export enum Environment {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production'
}

/**
 * LogLevel enum
 * Defines the different logging levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

/**
 * Performance mode enum
 * Defines the different performance modes
 */
export enum PerformanceMode {
  HIGH = 'high',     // Maximum quality, potentially lower performance
  BALANCED = 'balanced', // Balance between quality and performance
  LOW = 'low'       // Maximum performance, lower quality
}

/**
 * LODLevel interface
 * Defines a level of detail configuration
 */
export interface LODLevel {
  distance: number;
  geometry: 'sphere' | 'box' | 'cone' | 'cylinder' | 'torus' | 'custom' | 'point';
  geometryParams?: {
    radius?: number;
    width?: number;
    height?: number;
    depth?: number;
    segments?: number;
    detail?: number;
  };
  material: 'standard' | 'basic' | 'phong' | 'lambert' | 'toon' | 'shader' | 'point';
  materialParams?: {
    color?: string;
    emissive?: boolean;
    emissiveColor?: string;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    wireframe?: boolean;
    flatShading?: boolean;
    size?: number;
    sizeAttenuation?: boolean;
  };
  instanceCount?: number;
  particleCount?: number;
}

/**
 * LODSettings interface
 * Defines level of detail settings
 */
export interface LODSettings {
  levels: LODLevel[];
  autoGenerate: boolean;
  autoLevelCount: number;
  updateFrequency: number;
  frustumCulled: boolean;
  fadeTransition: boolean;
  transitionDuration: number;
}

/**
 * RenderingConfig interface
 * Configuration for rendering settings
 */
export interface RenderingConfig {
  maxParticles: number;
  particleSize: number;
  lodLevels: number;
  lodDistances: number[];
  enablePostProcessing: boolean;
  enableBloom: boolean;
  bloomIntensity?: number;
  shadowQuality: 'high' | 'medium' | 'low' | 'off';
  antialiasing: boolean;
  textureQuality: 'high' | 'medium' | 'low';
  fps: number;
  useWebGL2: boolean;
  enableInstancing: boolean;
  fxaa: boolean;
  maxLights: number;
  lod: LODSettings;
}

/**
 * PhysicsConfig interface
 * Configuration for physics simulation
 */
export interface PhysicsConfig {
  simulationRate: number; // Updates per second
  maxForce: number;
  damping: number;
  useWorkers: boolean;
  numWorkers: number;
  spatialGridResolution: number;
  integrationMethod: 'euler' | 'verlet' | 'rk4';
  collisionDetection: boolean;
  optimizationLevel: 'high' | 'medium' | 'low';
  useBarnesHut: boolean;
  barnesHutTheta: number;
  stepsPerFrame: number;
}

/**
 * BitcoinConfig interface
 * Configuration for Bitcoin data integration
 */
export interface BitcoinConfig {
  apiEndpoint: string;
  fetchInterval: number; // in milliseconds
  maxRetries: number;
  timeoutMs: number;
  cacheExpiration: number; // in minutes
  startingBlock?: number;
  blockInterval?: number;
  enableMockData: boolean;
}

/**
 * EvolutionConfig interface
 * Configuration for evolution and mutation system
 */
export interface EvolutionConfig {
  confirmationMilestones: number[];
  mutationChances: number[];
  maxMutationsPerEvent: number;
  enableSubclassMutations: boolean;
  enableExoticMutations: boolean;
  mutationIntensity: number; // 0-1 scale
}

/**
 * GameTheoryConfig interface
 * Configuration for game theory system
 */
export interface GameTheoryConfig {
  defaultPlayers: number;
  autoCalculateNash: boolean;
  calculationTimeout: number; // in milliseconds
  cacheResults: boolean;
  cacheSize: number;
  payoffNormalization: boolean;
  equilibriumPrecision: number; // e.g., 0.001 for comparing payoffs
  useThreading: boolean;
  threadPoolSize: number;
  defaultStrategies: string[];
  enableDynamicStrategies: boolean;
  enableLearning: boolean;
  learningRate: number; // 0-1 scale
}

/**
 * NetworkConfig interface
 * Configuration for networking settings
 */
export interface NetworkConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  cacheControl: boolean;
  cacheMaxAge: number;
  enableCompression: boolean;
  batchRequests: boolean;
  connectionPoolSize: number;
}

/**
 * StorageConfig interface
 * Configuration for local storage and data persistence
 */
export interface StorageConfig {
  storageType: 'localStorage' | 'indexedDB' | 'custom';
  prefix: string;
  maxSize: number; // in KB
  compression: boolean;
  encryption: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in minutes
  persistenceLevel: 'session' | 'permanent';
}

/**
 * AudioConfig interface
 * Configuration for audio settings
 */
export interface AudioConfig {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  spatialAudio: boolean;
  enableMusicReactivity: boolean;
  highQualityAudio: boolean;
}

/**
 * DebugConfig interface
 * Configuration for debugging features
 */
export interface DebugConfig {
  showStats: boolean;
  logLevel: LogLevel;
  showGrids: boolean;
  showForces: boolean;
  showBounds: boolean;
  inspectorEnabled: boolean;
  logEvents: boolean;
  showFrameTimes: boolean;
}

/**
 * FeatureFlags interface
 * Toggles for enabling/disabling features
 */
export interface FeatureFlags {
  enableGameTheory: boolean;
  enableEvolution: boolean;
  enableBitcoinFetching: boolean;
  enableAdvancedRendering: boolean;
  enableParticleEffects: boolean;
  enableAudio: boolean;
  enableExperimentalFeatures: boolean;
}

/**
 * AppConfig interface
 * Main application configuration
 */
export interface AppConfig {
  environment: Environment;
  rendering: RenderingConfig;
  physics: PhysicsConfig;
  bitcoin: BitcoinConfig;
  evolution: EvolutionConfig;
  gameTheory: GameTheoryConfig;
  network: NetworkConfig;
  storage: StorageConfig;
  audio: AudioConfig;
  debug: DebugConfig;
  features: FeatureFlags;
  performanceMode: PerformanceMode;
  version: string;
  buildDate?: string;
  maxMemoryUsage?: number; // in MB
  autoSaveInterval?: number; // in minutes
}

/**
 * Default configuration factory
 * Creates a configuration with default values
 */
export interface ConfigFactory {
  createDefaultConfig(): AppConfig;
  createDevConfig(): AppConfig;
  createTestConfig(): AppConfig;
  createProdConfig(): AppConfig;
  createCustomConfig(overrides: Partial<AppConfig>): AppConfig;
}

/**
 * Config service interface
 * Defines the methods for a configuration service
 */
export interface ConfigService {
  getConfig(): AppConfig;
  updateConfig(updates: Partial<AppConfig>): void;
  setPerformanceMode(mode: PerformanceMode): void;
  resetToDefaults(): void;
  save(): Promise<void>;
  load(): Promise<void>;
} 