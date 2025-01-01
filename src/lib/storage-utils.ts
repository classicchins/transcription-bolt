import { supabase } from './supabase';

const STORAGE_BUCKET = 'audio';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface GetMediaUrlOptions {
  retryCount?: number;
  signal?: AbortSignal;
}

export async function getMediaUrl(
  storagePath: string, 
  options: GetMediaUrlOptions = {}
): Promise<string> {
  try {
    if (!storagePath) {
      throw new Error('Storage path is required');
    }

    // Clean up storage path
    const cleanPath = normalizeStoragePath(storagePath);
    validateStoragePath(cleanPath);

    // Get signed URL with retry logic
    const { signedUrl, error } = await getSignedUrlWithRetry(
      cleanPath, 
      options.retryCount || 0
    );

    if (error) throw error;
    if (!signedUrl) throw new Error('No URL returned from storage');

    // Verify media file is accessible
    await verifyMediaAccess(signedUrl);

    return signedUrl;
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Failed to get media URL';
    console.error('Error getting media URL:', { error, path: storagePath });
    throw new Error(message);
  }
}

function normalizeStoragePath(path: string): string {
  // Remove leading/trailing slashes and spaces
  return path.trim().replace(/^\/+|\/+$/g, '');
}

function validateStoragePath(path: string): void {
  // Path should be: uploads/user_id/filename
  const parts = path.split('/');
  
  if (parts.length !== 3) {
    throw new Error('Invalid storage path structure');
  }

  if (parts[0] !== 'uploads') {
    throw new Error('Storage path must start with "uploads"');
  }

  if (!parts[1] || !parts[2]) {
    throw new Error('Invalid storage path segments');
  }
}

async function getSignedUrlWithRetry(
  path: string, 
  retryCount: number = 0
): Promise<{ signedUrl?: string; error?: Error }> {
  try {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) throw error;
    return { signedUrl: data.signedUrl };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount))
      );
      return getSignedUrlWithRetry(path, retryCount + 1);
    }
    
    return { 
      error: new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to generate signed URL'
      )
    };
  }
}

async function verifyMediaAccess(url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Media file not accessible: ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to verify media access'
    );
  }
}