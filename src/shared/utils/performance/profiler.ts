/**
 * Profiler Utility
 *
 * Provides utilities for profiling code performance.
 */

import * as Logging from '../logging';

// Store profiling data
interface ProfileData {
  count: number;
  totalTime: number;
  minTime: number;
  maxTime: number;
  lastTime: number;
}

const profiles: Record<string, ProfileData> = {};

/**
 * Start profiling a section of code
 * @param name The name of the profile
 * @returns A function to end the profile
 */
export function startProfile(name: string): () => void {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;
    
    if (!profiles[name]) {
      profiles[name] = {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: -Infinity,
        lastTime: 0
      };
    }
    
    const profile = profiles[name];
    profile.count++;
    profile.totalTime += elapsedTime;
    profile.minTime = Math.min(profile.minTime, elapsedTime);
    profile.maxTime = Math.max(profile.maxTime, elapsedTime);
    profile.lastTime = elapsedTime;
  };
}

/**
 * Profile a function
 * @param name The name of the profile
 * @param func The function to profile
 * @returns The result of the function
 */
export function profile<T>(name: string, func: () => T): T {
  const endProfile = startProfile(name);
  try {
    return func();
  } finally {
    endProfile();
  }
}

/**
 * Create a profiled version of a function
 * @param name The name of the profile
 * @param func The function to profile
 * @returns A profiled version of the function
 */
export function profiledFunction<T extends (...args: any[]) => any>(name: string, func: T): (...args: Parameters<T>) => ReturnType<T> {
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const endProfile = startProfile(name);
    try {
      return func.apply(this, args);
    } finally {
      endProfile();
    }
  };
}

/**
 * Get profile data
 * @param name The name of the profile (optional)
 * @returns The profile data
 */
export function getProfileData(name?: string): Record<string, ProfileData> {
  if (name) {
    return { [name]: profiles[name] };
  }
  
  return { ...profiles };
}

/**
 * Log profile data
 * @param name The name of the profile (optional)
 */
export function logProfileData(name?: string): void {
  const data = getProfileData(name);
  
  Object.entries(data).forEach(([profileName, profile]) => {
    const avgTime = profile.totalTime / profile.count;
    
    Logging.info(`Profile: ${profileName}`);
    Logging.info(`  Count: ${profile.count}`);
    Logging.info(`  Total Time: ${profile.totalTime.toFixed(2)}ms`);
    Logging.info(`  Average Time: ${avgTime.toFixed(2)}ms`);
    Logging.info(`  Min Time: ${profile.minTime.toFixed(2)}ms`);
    Logging.info(`  Max Time: ${profile.maxTime.toFixed(2)}ms`);
    Logging.info(`  Last Time: ${profile.lastTime.toFixed(2)}ms`);
  });
}

/**
 * Reset profile data
 * @param name The name of the profile (optional)
 */
export function resetProfileData(name?: string): void {
  if (name) {
    delete profiles[name];
  } else {
    Object.keys(profiles).forEach(key => delete profiles[key]);
  }
}

/**
 * Create a profiler for a specific component
 * @param component The component name
 * @returns A profiler for the component
 */
export function createProfiler(component: string) {
  return {
    start: (name: string) => startProfile(`${component}.${name}`),
    profile: <T>(name: string, func: () => T) => profile(`${component}.${name}`, func),
    profiledFunction: <T extends (...args: any[]) => any>(name: string, func: T) => 
      profiledFunction(`${component}.${name}`, func),
    getData: () => {
      const componentProfiles: Record<string, ProfileData> = {};
      
      Object.entries(profiles).forEach(([name, data]) => {
        if (name.startsWith(`${component}.`)) {
          componentProfiles[name] = data;
        }
      });
      
      return componentProfiles;
    },
    log: () => {
      const componentProfiles = Object.keys(profiles).filter(name => 
        name.startsWith(`${component}.`)
      );
      
      componentProfiles.forEach(name => {
        const profile = profiles[name];
        const avgTime = profile.totalTime / profile.count;
        
        Logging.info(`Profile: ${name}`);
        Logging.info(`  Count: ${profile.count}`);
        Logging.info(`  Total Time: ${profile.totalTime.toFixed(2)}ms`);
        Logging.info(`  Average Time: ${avgTime.toFixed(2)}ms`);
        Logging.info(`  Min Time: ${profile.minTime.toFixed(2)}ms`);
        Logging.info(`  Max Time: ${profile.maxTime.toFixed(2)}ms`);
        Logging.info(`  Last Time: ${profile.lastTime.toFixed(2)}ms`);
      });
    },
    reset: () => {
      Object.keys(profiles).forEach(name => {
        if (name.startsWith(`${component}.`)) {
          delete profiles[name];
        }
      });
    }
  };
}
