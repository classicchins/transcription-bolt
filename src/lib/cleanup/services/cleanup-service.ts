import { supabase } from '@/lib/supabase';
import { storageService } from '@/lib/storage/services/storage-service';

class CleanupService {
  async cleanupUserData(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user ID from email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData?.id) {
        throw new Error('User not found');
      }

      const userId = userData.id;

      // Delete all transcriptions first (will cascade to files)
      const { error: deleteError } = await supabase
        .from('transcriptions')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Delete storage files
      const { data: storageFiles } = await supabase.storage
        .from('audio')
        .list(`uploads/${userId}`);

      if (storageFiles?.length) {
        const filePaths = storageFiles.map(file => `uploads/${userId}/${file.name}`);
        await storageService.deleteFile(filePaths[0]); // Delete one by one to handle errors
      }

      // Reset user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          total_transcriptions: 0,
          completed_transcriptions: 0,
          processing_transcriptions: 0,
          failed_transcriptions: 0,
          updated_at: new Date().toISOString()
        });

      if (statsError) throw statsError;

      return { success: true };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cleanup user data'
      };
    }
  }
}

export const cleanupService = new CleanupService();