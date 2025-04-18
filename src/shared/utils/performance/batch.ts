/**
 * Batch Processing Utility
 *
 * Provides utilities for batch processing.
 */

/**
 * Process an array in batches
 * @param items The array to process
 * @param batchSize The size of each batch
 * @param processBatch The function to process each batch
 * @returns A promise that resolves when all batches have been processed
 */
export async function processBatches<T, R>(
  items: T[],
  batchSize: number,
  processBatch: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Process an array in batches with a delay between batches
 * @param items The array to process
 * @param batchSize The size of each batch
 * @param processBatch The function to process each batch
 * @param delayMs The delay between batches in milliseconds
 * @returns A promise that resolves when all batches have been processed
 */
export async function processBatchesWithDelay<T, R>(
  items: T[],
  batchSize: number,
  processBatch: (batch: T[]) => Promise<R[]>,
  delayMs: number
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Process an array in batches with a callback for each batch
 * @param items The array to process
 * @param batchSize The size of each batch
 * @param processBatch The function to process each batch
 * @param onBatchComplete The callback to call when each batch is complete
 * @returns A promise that resolves when all batches have been processed
 */
export async function processBatchesWithCallback<T, R>(
  items: T[],
  batchSize: number,
  processBatch: (batch: T[]) => Promise<R[]>,
  onBatchComplete: (batchResults: R[], batchIndex: number, totalBatches: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const totalBatches = Math.ceil(items.length / batchSize);
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
    
    const batchIndex = Math.floor(i / batchSize);
    onBatchComplete(batchResults, batchIndex, totalBatches);
  }
  
  return results;
}

/**
 * Process an array in batches with a maximum time per batch
 * @param items The array to process
 * @param maxTimeMs The maximum time per batch in milliseconds
 * @param processItem The function to process each item
 * @returns A promise that resolves when all items have been processed
 */
export async function processBatchesWithMaxTime<T, R>(
  items: T[],
  maxTimeMs: number,
  processItem: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let currentBatch: T[] = [];
  let currentBatchStartTime = performance.now();
  
  for (let i = 0; i < items.length; i++) {
    currentBatch.push(items[i]);
    
    // Process the current batch if it's the last item or we've reached the time limit
    if (i === items.length - 1 || performance.now() - currentBatchStartTime >= maxTimeMs) {
      const batchResults = await Promise.all(currentBatch.map(processItem));
      results.push(...batchResults);
      
      currentBatch = [];
      currentBatchStartTime = performance.now();
    }
  }
  
  return results;
}

/**
 * Create a batch processor
 * @param batchSize The default batch size
 * @returns A batch processor
 */
export function createBatchProcessor(batchSize: number = 100) {
  return {
    processBatches: <T, R>(
      items: T[],
      processBatch: (batch: T[]) => Promise<R[]>,
      customBatchSize?: number
    ) => processBatches(items, customBatchSize || batchSize, processBatch),
    
    processBatchesWithDelay: <T, R>(
      items: T[],
      processBatch: (batch: T[]) => Promise<R[]>,
      delayMs: number,
      customBatchSize?: number
    ) => processBatchesWithDelay(items, customBatchSize || batchSize, processBatch, delayMs),
    
    processBatchesWithCallback: <T, R>(
      items: T[],
      processBatch: (batch: T[]) => Promise<R[]>,
      onBatchComplete: (batchResults: R[], batchIndex: number, totalBatches: number) => void,
      customBatchSize?: number
    ) => processBatchesWithCallback(items, customBatchSize || batchSize, processBatch, onBatchComplete),
    
    processBatchesWithMaxTime: <T, R>(
      items: T[],
      maxTimeMs: number,
      processItem: (item: T) => Promise<R>
    ) => processBatchesWithMaxTime(items, maxTimeMs, processItem)
  };
}
