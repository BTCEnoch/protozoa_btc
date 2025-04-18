/**
 * Bitcoin Fetch Worker for Bitcoin Protozoa
 * 
 * This worker fetches Bitcoin block data and inscriptions from the Bitcoin API.
 * It handles caching, error handling, and retry logic.
 */

import { BitcoinWorkerMessage } from '../../types/workers/messages';

// Worker state
let options = {
  apiUrl: 'https://ordinals.com',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  cacheSize: 100
};

// Cache for block data
const blockCache = new Map<string, any>();
const inscriptionCache = new Map<string, any>();

/**
 * Fetch block information from the Bitcoin API
 * @param data Fetch data
 * @returns Block information
 */
async function fetchBlockInfo(data: any): Promise<any> {
  const { blockNumber, blockHash, apiUrl } = data;
  
  // Use provided API URL or default
  const baseUrl = apiUrl || options.apiUrl;
  
  // Check cache first
  const cacheKey = blockHash || `block-${blockNumber}`;
  if (blockCache.has(cacheKey)) {
    return {
      ...blockCache.get(cacheKey),
      fromCache: true
    };
  }
  
  // Determine the URL to fetch
  let url: string;
  if (blockHash) {
    url = `${baseUrl}/api/v1/block/${blockHash}`;
  } else if (blockNumber) {
    url = `${baseUrl}/api/v1/blockheight/${blockNumber}`;
  } else {
    throw new Error('Either blockNumber or blockHash must be provided');
  }
  
  // Fetch the block data
  const blockData = await fetchWithRetry(url);
  
  // Parse the response
  const parsedData = parseBlockResponse(blockData);
  
  // Cache the result
  blockCache.set(cacheKey, parsedData);
  
  // Limit cache size
  if (blockCache.size > options.cacheSize) {
    const firstKey = blockCache.keys().next().value;
    blockCache.delete(firstKey);
  }
  
  return parsedData;
}

/**
 * Fetch block confirmations from the Bitcoin API
 * @param data Fetch data
 * @returns Block confirmations
 */
async function fetchBlockConfirmations(data: any): Promise<any> {
  const { blockNumber, blockHash, apiUrl } = data;
  
  // Use provided API URL or default
  const baseUrl = apiUrl || options.apiUrl;
  
  // Fetch the current block height
  const currentBlockUrl = `${baseUrl}/api/v1/blocks/tip/height`;
  const currentBlockResponse = await fetchWithRetry(currentBlockUrl);
  const currentHeight = parseInt(currentBlockResponse);
  
  // Fetch the target block height if not provided
  let targetHeight: number;
  
  if (blockNumber) {
    targetHeight = blockNumber;
  } else if (blockHash) {
    // Fetch block info to get height
    const blockInfo = await fetchBlockInfo({ blockHash, apiUrl });
    targetHeight = blockInfo.height;
  } else {
    throw new Error('Either blockNumber or blockHash must be provided');
  }
  
  // Calculate confirmations
  const confirmations = currentHeight - targetHeight + 1;
  
  return {
    confirmations,
    currentHeight,
    targetHeight
  };
}

/**
 * Fetch inscription content from the Bitcoin API
 * @param data Fetch data
 * @returns Inscription content
 */
async function fetchInscriptionContent(data: any): Promise<any> {
  const { inscriptionId, apiUrl } = data;
  
  if (!inscriptionId) {
    throw new Error('inscriptionId must be provided');
  }
  
  // Use provided API URL or default
  const baseUrl = apiUrl || options.apiUrl;
  
  // Check cache first
  if (inscriptionCache.has(inscriptionId)) {
    return {
      ...inscriptionCache.get(inscriptionId),
      fromCache: true
    };
  }
  
  // Fetch the inscription data
  const url = `${baseUrl}/content/${inscriptionId}`;
  const response = await fetchWithRetry(url, true);
  
  // Parse the response based on content type
  const contentType = response.headers.get('content-type');
  let content: any;
  
  if (contentType.includes('application/json')) {
    content = await response.json();
  } else if (contentType.includes('text/')) {
    content = await response.text();
  } else {
    // For binary data, return a placeholder
    content = {
      type: contentType,
      size: response.headers.get('content-length'),
      url
    };
  }
  
  const result = {
    id: inscriptionId,
    contentType,
    content
  };
  
  // Cache the result
  inscriptionCache.set(inscriptionId, result);
  
  // Limit cache size
  if (inscriptionCache.size > options.cacheSize) {
    const firstKey = inscriptionCache.keys().next().value;
    inscriptionCache.delete(firstKey);
  }
  
  return result;
}

/**
 * Fetch data with retry logic
 * @param url URL to fetch
 * @param returnResponse Whether to return the response object
 * @returns Fetched data
 */
async function fetchWithRetry(url: string, returnResponse: boolean = false): Promise<any> {
  let retries = 0;
  let lastError: Error;
  
  while (retries <= options.retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      if (returnResponse) {
        return response;
      }
      
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      retries++;
      
      if (retries <= options.retries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, options.retryDelay));
      }
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${options.retries} retries: ${lastError.message}`);
}

/**
 * Parse block response
 * @param response Block response
 * @returns Parsed block data
 */
function parseBlockResponse(response: any): any {
  // Extract relevant fields
  return {
    height: response.height,
    hash: response.hash,
    timestamp: response.timestamp,
    nonce: response.nonce,
    difficulty: response.difficulty,
    merkleRoot: response.merkle_root,
    txCount: response.tx_count,
    size: response.size,
    weight: response.weight,
    version: response.version
  };
}

/**
 * Handle API error
 * @param error Error object
 * @returns Error information
 */
function handleApiError(error: Error): any {
  return {
    error: true,
    message: error.message,
    stack: error.stack
  };
}

// Set up message handling
self.addEventListener('message', async (event) => {
  const message = event.data as BitcoinWorkerMessage;
  
  try {
    let result: any;
    
    switch (message.type) {
      case 'fetchBlock':
        result = await fetchBlockInfo(message.data);
        self.postMessage({
          type: 'result',
          id: message.id,
          data: result
        });
        break;
        
      case 'fetchConfirmations':
        result = await fetchBlockConfirmations(message.data);
        self.postMessage({
          type: 'result',
          id: message.id,
          data: result
        });
        break;
        
      case 'fetchInscription':
        result = await fetchInscriptionContent(message.data);
        self.postMessage({
          type: 'result',
          id: message.id,
          data: result
        });
        break;
        
      case 'initialize':
        // Initialize worker state
        if (message.data?.options) {
          options = { ...options, ...message.data.options };
        }
        
        self.postMessage({
          type: 'result',
          id: message.id,
          data: { initialized: true }
        });
        break;
        
      case 'reset':
        // Reset worker state
        options = {
          apiUrl: 'https://ordinals.com',
          timeout: 30000,
          retries: 3,
          retryDelay: 1000,
          cacheSize: 100
        };
        
        blockCache.clear();
        inscriptionCache.clear();
        
        self.postMessage({
          type: 'result',
          id: message.id,
          data: { reset: true }
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      id: message.id,
      error: {
        message: (error as Error).message,
        stack: (error as Error).stack
      }
    });
  }
});
