import { supabase } from '../supabase';
import { validateStatus } from './validation';
import { TranscriptionError } from './errors';
import type { TranscriptionStatus } from '../types';

interface UpdateStatusOptions {
  transcriptionId: string;
  fileId: string;
  status: TranscriptionStatus;
  content?: string | null;
}

export async function updateTranscriptionStatus({
  transcriptionId,
  fileId,
  status,
  content
}: UpdateStatusOptions): Promise<void> {
  try {
    // Validate status
    const statusResult = validateStatus(status);
    if (!statusResult.success) {
      throw TranscriptionError.invalidStatus(status);
    }

    // Update status using stored procedure
    const { error } = await supabase.rpc('update_transcription_status', {
      p_transcription_id: transcriptionId,
      p_file_id: fileId,
      p_status: status,
      p_content: content
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update transcription status:', error);
    throw TranscriptionError.processingFailed(
      'Failed to update transcription status',
      { error }
    );
  }
}