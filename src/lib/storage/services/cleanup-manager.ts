import { cleanupService } from '../cleanup/cleanup-service';
import { handleError } from '@/lib/core/errors/error-handler';
import { supabase } from '@/lib/supabase';
import { StorageError } from '../types';

class CleanupManager {
  private cleanupTasks: Map<string, () => Promise<void>> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  async cleanupFailedUpload(userId: string, storagePath: string) {
    try {
      // Delete from storage first
      await this.deleteStorageFile(storagePath);

      // Then cleanup database records
      await this.cleanupDatabaseRecords(userId, storagePath);
    } catch (error) {
      // Log error but don't throw to prevent blocking other operations
      await handleError(error, {
        context: 'failed_upload_cleanup',
        userId,
        storagePath
      });
    }
  }

  private async deleteStorageFile(path: string, attempt = 0): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('audio')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      if (attempt < this.MAX_RETRIES - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, attempt))
        );
        return this.deleteStorageFile(path, attempt + 1);
      }
      throw new StorageError('Failed to delete storage file', error);
    }
  }

  private async cleanupDatabaseRecords(userId: string, storagePath: string, attempt = 0): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_failed_upload', {
        p_user_id: userId,
        p_storage_path: storagePath
      });

      if (error) throw error;
    } catch (error) {
      if (attempt < this.MAX_RETRIES - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, attempt))
        );
        return this.cleanupDatabaseRecords(userId, storagePath, attempt + 1);
      }
      throw new Error('Failed to cleanup database records');
    }
  }
}

export const cleanupManager = new CleanupManager();