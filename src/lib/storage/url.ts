import { getStorageClient, retryOperation, createStorageError } from './core';
import { validateStoragePath } from './validation';
import type { SignedUrlOptions } from './types';

const DEFAULT_EXPIRY = 3600; // 1 hour

export async function createSignedUrl(
  path: string, 
  options: SignedUrlOptions = {}
): Promise<string> {
  try {
    const cleanPath = validateStoragePath(path);
    const storage = await getStorageClient();
    
    const { data, error } = await retryOperation(async () => {
      // First check if file exists
      const { data: exists, error: existsError } = await storage.list(cleanPath);
      if (existsError || !exists?.length) {
        throw new Error('File not found in storage');
      }

      // Then generate signed URL
      return await storage.createSignedUrl(
        cleanPath, 
        options.expiresIn || DEFAULT_EXPIRY,
        {
          download: options.download,
          transform: options.transform
        }
      );
    });

    if (error) throw error;
    if (!data?.signedUrl) throw new Error('Failed to generate signed URL');

    return data.signedUrl;
  } catch (error) {
    throw createStorageError(error);
  }
}