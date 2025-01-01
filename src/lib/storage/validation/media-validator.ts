import { StorageError } from '../types';

const TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function verifyMediaAccess(url: string): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await verifyMediaAccessAttempt(url);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt))
        );
        continue;
      }
    }
  }

  throw new StorageError(
    'Unable to access media file. Please try again.',
    lastError
  );
}

async function verifyMediaAccessAttempt(url: string): Promise<void> {
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
      signal: controller.signal,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new StorageError(`Media file not accessible (${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (!isValidMediaType(contentType)) {
      throw new StorageError('Invalid media type');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new StorageError('Media access verification timed out');
    }
    throw error instanceof StorageError ? error : new StorageError('Failed to verify media access');
  } finally {
    clearTimeout(timeoutId);
  }
}

function isValidMediaType(contentType: string | null): boolean {
  if (!contentType) return false;
  
  const validTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4', 
    'audio/aac',
    'audio/ogg',
    'audio/flac',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm'
  ];

  return validTypes.some(type => contentType.startsWith(type));
}