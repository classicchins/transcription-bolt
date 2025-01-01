import { supabase } from '@/lib/supabase';
import { UploadError } from '../errors/upload-error';

export function generateStoragePath(userId: string, fileName: string): string {
  if (!userId || !fileName) {
    throw new UploadError('User ID and file name are required');
  }

  // Clean and validate file extension
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  if (!fileExt) {
    throw new UploadError('Invalid file name - no extension');
  }

  // Generate unique name with timestamp for uniqueness
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).slice(2, 10);
  const sanitizedName = `${timestamp}-${randomId}.${fileExt}`;
  
  return `uploads/${userId}/${sanitizedName}`;
}

export function validateStoragePath(path: string): boolean {
  if (!path) return false;
  
  const segments = path.trim().split('/');
  if (segments.length !== 3) return false;
  
  const [root, userId, fileName] = segments;
  return (
    root === 'uploads' &&
    userId?.length > 0 &&
    fileName?.length > 0 &&
    /^[\w.-]+$/.test(fileName)
  );
}

export async function cleanupStorageFile(bucket: string, path: string): Promise<void> {
  try {
    if (!validateStoragePath(path)) {
      throw new UploadError('Invalid storage path');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Storage cleanup error:', error);
    throw new UploadError('Failed to cleanup storage file', { error });
  }
}