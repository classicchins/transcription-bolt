import { supabase } from '../supabase';
import { UploadError } from './errors';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function uploadToStorage(file: File, userId: string): Promise<string> {
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).slice(2);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      const storagePath = `uploads/${userId}/${fileName}`;

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      if (!data?.path) throw new Error('No storage path returned');

      // Verify upload with retries
      const verifyResult = await verifyUpload(userId, fileName);
      if (!verifyResult) {
        throw new Error('File verification failed');
      }

      return storagePath;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      retryCount++;

      if (retryCount < MAX_RETRIES) {
        console.warn(`Storage upload retry ${retryCount}/${MAX_RETRIES}:`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
      }
    }
  }

  throw UploadError.storageFailed(
    'Failed to upload file after retries',
    { error: lastError }
  );
}

async function verifyUpload(userId: string, fileName: string): Promise<boolean> {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      const { data, error } = await supabase.storage
        .from('audio')
        .list(`uploads/${userId}`, {
          limit: 1,
          search: fileName
        });

      if (error) throw error;
      return Boolean(data?.length);
    } catch (error) {
      retryCount++;
      
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
      }
    }
  }

  return false;
}