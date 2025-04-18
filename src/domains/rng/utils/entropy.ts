/**
 * Entropy Utilities for Bitcoin Protozoa
 * 
 * This file provides utilities for collecting entropy from various sources.
 */

/**
 * Collect entropy from the current time
 * @returns A number derived from the current time
 */
export function collectTimeEntropy(): number {
  return Date.now();
}

/**
 * Collect entropy from performance timing
 * @returns A number derived from performance timing
 */
export function collectPerformanceEntropy(): number {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
}

/**
 * Collect entropy from mouse movements
 * @param callback Callback function to receive entropy
 */
export function collectMouseEntropy(callback: (entropy: number) => void): void {
  let entropy = 0;
  let lastX = 0;
  let lastY = 0;
  let count = 0;

  const handleMouseMove = (event: MouseEvent) => {
    const x = event.clientX;
    const y = event.clientY;
    
    // Calculate entropy from mouse movement
    entropy += Math.abs(x - lastX) + Math.abs(y - lastY);
    lastX = x;
    lastY = y;
    
    count++;
    
    // After collecting enough samples, return entropy
    if (count >= 10) {
      document.removeEventListener('mousemove', handleMouseMove);
      callback(entropy);
    }
  };

  document.addEventListener('mousemove', handleMouseMove);
}

/**
 * Collect entropy from keyboard input
 * @param callback Callback function to receive entropy
 */
export function collectKeyboardEntropy(callback: (entropy: number) => void): void {
  let entropy = 0;
  let lastTime = Date.now();
  let count = 0;

  const handleKeyDown = (event: KeyboardEvent) => {
    const time = Date.now();
    
    // Calculate entropy from key timing and code
    entropy += (time - lastTime) + event.keyCode;
    lastTime = time;
    
    count++;
    
    // After collecting enough samples, return entropy
    if (count >= 5) {
      document.removeEventListener('keydown', handleKeyDown);
      callback(entropy);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Collect entropy from multiple sources
 * @returns A promise that resolves to a number
 */
export async function collectEntropy(): Promise<number> {
  // Collect time entropy
  const timeEntropy = collectTimeEntropy();
  
  // Collect performance entropy
  const performanceEntropy = collectPerformanceEntropy();
  
  // Combine entropy sources
  return timeEntropy ^ performanceEntropy;
}
