/**
 * Service Initializer
 *
 * This file provides a simple function to initialize services in sequence.
 * It uses the initialization sequence defined in initializationSequence.ts.
 */

import { initializationSequence } from './initializationSequence';
import { logInitialization } from '../utils/logging';

/**
 * Initialize all services in sequence
 * @returns A promise that resolves when all services are initialized
 */
export async function initializeServices(): Promise<void> {
  logInitialization('ServiceInitializer', 'start');

  try {
    // Execute each initializer in sequence
    for (const initializer of initializationSequence) {
      await initializer();
    }

    logInitialization('ServiceInitializer', 'complete');
  } catch (error) {
    logInitialization('ServiceInitializer', 'error', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Initialize a specific service by name
 * @param serviceName The name of the service to initialize
 * @returns A promise that resolves when the service is initialized
 * @throws Error if the service is not found in the initialization sequence
 */
export async function initializeService(serviceName: string): Promise<void> {
  // Find the initializer for the specified service
  const initializer = initializationSequence.find(init => {
    // Extract the service name from the initializer function
    const funcStr = init.toString();
    const match = funcStr.match(/console\.log\(['"]Initializing\s+(\w+)\s+Service/);
    return match && match[1].toLowerCase() === serviceName.toLowerCase();
  });

  if (!initializer) {
    throw new Error(`Service '${serviceName}' not found in initialization sequence`);
  }

  // Execute the initializer
  await initializer();
}

/**
 * Get the list of services in the initialization sequence
 * @returns An array of service names
 */
export function getInitializationSequenceServices(): string[] {
  return initializationSequence.map(init => {
    // Extract the service name from the initializer function
    const funcStr = init.toString();
    const match = funcStr.match(/console\.log\(['"]Initializing\s+(\w+)\s+Service/);
    return match ? match[1] : 'Unknown';
  });
}
