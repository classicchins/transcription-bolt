import { supabase } from '../supabase';
import { TranscriptionError } from './errors';

export async function deleteTranscription(transcriptionId: string, userId: string) {
  try {
    // Get file info first
    const { data: transcription, error: fetchError } = await supabase
      .from('transcriptions')
      .select('file_id, files!inner(storage_path)')
      .eq('id', transcriptionId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!transcription) throw TranscriptionError.fileNotFound(transcriptionId);

    // Delete from storage first
    if (transcription.files?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('audio')
        .remove([transcription.files.storage_path]);

      if (storageError) throw storageError;
    }

    // Delete transcription and file records
    const { error: deleteError } = await supabase
      .from('transcriptions')
      .delete()
      .eq('id', transcriptionId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    console.error('Failed to delete transcription:', error);
    throw TranscriptionError.processingFailed(
      'Failed to delete transcription',
      { error }
    );
  }
}