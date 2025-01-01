import { supabase } from '@/lib/supabase';
import { TranscriptionError } from '../errors';

class DeletionService {
  async deleteTranscription(transcriptionId: string, userId: string): Promise<void> {
    try {
      // Get transcription with file info first
      const { data: transcription, error: fetchError } = await supabase
        .from('transcriptions')
        .select(`
          id,
          file_id,
          files (
            id,
            storage_path
          )
        `)
        .eq('id', transcriptionId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw new TranscriptionError('Failed to fetch transcription', 'FETCH_ERROR');
      }

      if (!transcription) {
        throw new TranscriptionError('Transcription not found', 'NOT_FOUND');
      }

      // Delete storage file first if it exists
      if (transcription.files?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('audio')
          .remove([transcription.files.storage_path]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Continue with database deletion even if storage fails
        }
      }

      // Delete transcription (will cascade to file)
      const { error: deleteError } = await supabase
        .from('transcriptions')
        .delete()
        .eq('id', transcriptionId)
        .eq('user_id', userId);

      if (deleteError) {
        throw new TranscriptionError('Failed to delete transcription', 'DELETE_ERROR');
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw error instanceof TranscriptionError 
        ? error 
        : new TranscriptionError('Failed to delete transcription', 'UNKNOWN_ERROR');
    }
  }
}

export const deletionService = new DeletionService();