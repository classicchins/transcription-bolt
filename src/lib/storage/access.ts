import { retryOperation, createStorageError } from './core';
import type { StorageError } from './types';

const TIMEOUT = 10000; // 10 seconds

export async function verifyFileAccess(url: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw Object.assign(new Error('File not accessible'), {
          statusCode: response.status,
          code: 'FILE_ACCESS_ERROR'
        } as StorageError);
      }

      // Verify content type
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.startsWith('audio/') && !contentType.startsWith('video/')) {
        throw Object.assign(new Error('Invalid media type'), {
          code: 'INVALID_MEDIA_TYPE'
        } as StorageError);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createStorageError(new Error('File access verification timed out'));
    }
    throw createStorageError(error);
  }
}