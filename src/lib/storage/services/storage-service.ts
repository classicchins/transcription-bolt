import { supabase } from '@/lib/supabase';
import { StorageError } from '../types';
import { validateStoragePath } from '../validation/path-validator';
import { verifyMediaAccess } from '../validation/media-validator';

class StorageService {
  private readonly BUCKET = 'audio';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .createSignedUrl(path, expiresIn, {
          download: false,
          transform: {
            quality: 'auto'
          }
        });

      if (error) throw error;
      if (!data?.signedUrl) throw new StorageError('No URL generated');

      // Verify URL is accessible
      await verifyMediaAccess(data.signedUrl);
      
      return data.signedUrl;
    } catch (error) {
      throw error instanceof StorageError ? error : new StorageError('Failed to get signed URL', error);
    }
  }

  async verifyFileExists(path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: path.split('/').pop()
        });

      if (error) throw error;
      return data?.length > 0;
    } catch (error) {
      throw new StorageError('Failed to verify file existence', error);
    }
  }
}

export const storageService = new StorageService();