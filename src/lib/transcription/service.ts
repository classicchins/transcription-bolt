import { supabase } from '../supabase';
import { transcriptionQueue } from './queue';
import { validateTranscriptionInput } from './validation';
import { TranscriptionError } from './errors';
import type { TranscriptionOptions } from './types';

export async function createTranscription(
  file: File,
  userId: string,
  options: TranscriptionOptions = {}
) {
  try {
    // Validate input
    const validation = validateTranscriptionInput({ file, userId });
    if (!validation.success) {
      throw TranscriptionError.validationFailed(validation.error.errors[0].message);
    }

    // Verify storage path exists
    if (!options.storagePath) {
      throw TranscriptionError.validationFailed('Storage path is required');
    }

    // Create records using stored procedure
    const { data, error } = await supabase.rpc('create_transcription', {
      p_user_id: userId,
      p_file_name: file.name,
      p_file_size: file.size,
      p_file_type: file.type,
      p_storage_path: options.storagePath,
      p_language: options.language || 'en'
    });

    if (error) throw error;
    if (!data?.file_id || !data?.transcription_id) {
      throw new Error('Failed to create transcription records');
    }

    // Add to processing queue
    await transcriptionQueue.add({
      id: data.transcription_id,
      fileId: data.file_id,
      userId,
      file,
      language: options.language,
      storagePath: options.storagePath
    });

    // Return created records
    const { data: records, error: fetchError } = await supabase
      .from('transcriptions')
      .select('*, file:files(*)')
      .eq('id', data.transcription_id)
      .single();

    if (fetchError) throw fetchError;
    return records;

  } catch (error) {
    console.error('Error creating transcription:', error);
    throw TranscriptionError.processingFailed(
      'Failed to create transcription',
      { error }
    );
  }
}