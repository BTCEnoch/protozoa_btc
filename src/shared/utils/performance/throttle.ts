/**
 * Throttle Utility
 *
 * Provides a utility for throttling function calls.
 */

/**
 * Throttle a function to limit how often it can be called
 * @param func The function to throttle
 * @param limit The minimum time between function calls in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let lastResult: ReturnType<T> | undefined;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      lastCall = now;
      lastResult = func.apply(this, args);
    }
    
    return lastResult;
  };
}

/**
 * Debounce a function to delay its execution until after a period of inactivity
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @param immediate Whether to call the function immediately on the leading edge
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number, immediate: boolean = false): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const callNow = immediate && !timeout;
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);
    
    if (callNow) {
      func.apply(this, args);
    }
  };
}

/**
 * Throttle a function with a trailing call
 * @param func The function to throttle
 * @param limit The minimum time between function calls in milliseconds
 * @returns A throttled function with a trailing call
 */
export function throttleWithTrailing<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const now = Date.now();
    const context = this;
    
    if (now - lastCall >= limit) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      lastCall = now;
      func.apply(context, args);
    } else {
      lastArgs = args;
      
      if (timeout === null) {
        timeout = window.setTimeout(() => {
          lastCall = Date.now();
          timeout = null;
          
          if (lastArgs !== null) {
            func.apply(context, lastArgs);
            lastArgs = null;
          }
        }, limit - (now - lastCall));
      }
    }
  };
}
