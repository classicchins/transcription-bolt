import { supabase } from '../supabase';
import type { StorageError } from './types';

const STORAGE_BUCKET = 'audio';
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000; // 1 second
const MAX_TIMEOUT = 30000; // 30 seconds

export async function getStorageClient() {
  return supabase.storage.from(STORAGE_BUCKET);
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  retryCount: number = 0
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT);

    try {
      return await operation();
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createStorageError(new Error('Operation timed out'));
    }

    // Log error for debugging
    console.error('Storage operation failed:', {
      error,
      retryCount,
      isRetryable: isRetryableError(error)
    });

    if (retryCount < MAX_RETRIES && isRetryableError(error)) {
      const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount) * (0.5 + Math.random());
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retryCount + 1);
    }
    throw error;
  }
}

export function createStorageError(error: unknown): StorageError {
  if (error instanceof Error) {
    return Object.assign(new Error(error.message), {
      name: 'StorageError',
      code: (error as any).code || 'STORAGE_ERROR',
      statusCode: (error as any).statusCode || 500,
      stack: error.stack,
      cause: error
    });
  }
  
  return Object.assign(new Error('Unknown storage error'), {
    name: 'StorageError',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  });
}

function isRetryableError(error: any): boolean {
  // Add more specific error codes
  const retryableCodes = [
    'storage/object-not-found',
    'storage/retry-limit-exceeded',
    'storage/server-error',
    '404',
    '429',
    '500',
    '502',
    '503',
    '504'
  ];

  const retryableMessages = [
    'network error',
    'timeout',
    'rate limit',
    'internal server error',
    'socket hang up',
    'econnreset',
    'not found',
    'object not found'
  ];

  const errorCode = error?.code?.toLowerCase() || '';
  const errorMessage = error?.message?.toLowerCase() || '';
  const statusCode = error?.statusCode?.toString() || '';

  return (
    retryableCodes.includes(errorCode) ||
    retryableCodes.includes(statusCode) ||
    retryableMessages.some(msg => errorMessage.includes(msg))
  );
}