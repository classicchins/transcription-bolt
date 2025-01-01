import { supabase } from '@/lib/supabase';
import { validateStoragePath } from '../utils/storage-utils';
import { UploadError } from '../errors/upload-error';

class CleanupService {
  private readonly BUCKET = 'audio';

  async cleanupFailedUpload(userId: string, storagePath: string): Promise<void> {
    try {
      // Validate storage path
      if (!validateStoragePath(storagePath)) {
        throw new UploadError('Invalid storage path');
      }

      // Delete from storage first
      await this.cleanupStorageFile(storagePath);

      // Then cleanup database records using RPC
      const { error: dbError } = await supabase.rpc('cleanup_failed_upload', {
        p_user_id: userId,
        p_storage_path: storagePath
      });

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Cleanup error:', error);
      throw new UploadError('Failed to cleanup upload', { error });
    }
  }

  private async cleanupStorageFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET)
      .remove([path]);

    if (error) {
      throw new UploadError('Failed to cleanup storage file', { error });
    }
  }
}

export const cleanupService = new CleanupService();