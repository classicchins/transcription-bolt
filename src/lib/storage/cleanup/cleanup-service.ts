import { supabase } from '@/lib/supabase';
import { errorService } from '@/lib/transcription/services/error-service';

class CleanupService {
  async cleanupStorageFile(storagePath: string): Promise<void> {
    if (!storagePath) return;

    try {
      const { error } = await supabase.storage
        .from('audio')
        .remove([storagePath]);

      if (error) throw error;
    } catch (error) {
      await errorService.logError(error, {
        context: 'storage_cleanup',
        storagePath
      });
      throw error;
    }
  }

  async cleanupFailedUpload(userId: string, storagePath: string): Promise<void> {
    try {
      await this.cleanupStorageFile(storagePath);

      await supabase
        .from('files')
        .delete()
        .eq('user_id', userId)
        .eq('storage_path', storagePath);
    } catch (error) {
      console.error('Failed to cleanup failed upload:', error);
      // Don't throw here to prevent cascading failures
    }
  }
}

export const cleanupService = new CleanupService();