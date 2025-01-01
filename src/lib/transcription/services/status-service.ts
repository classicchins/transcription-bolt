import { supabase } from '@/lib/supabase';
import { TranscriptionError } from '../errors';
import type { TranscriptionStatus } from '@/lib/types';

interface UpdateStatusOptions {
  transcriptionId: string;
  fileId: string;
  status: TranscriptionStatus;
  content?: string | null;
}

class StatusService {
  async updateStatus({
    transcriptionId,
    fileId,
    status,
    content
  }: UpdateStatusOptions): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_transcription_status', {
        p_transcription_id: transcriptionId,
        p_file_id: fileId,
        p_status: status,
        p_content: content
      });

      if (error) throw error;
    } catch (error) {
      console.error('Status update error:', error);
      throw TranscriptionError.processingFailed(
        'Failed to update transcription status',
        { error }
      );
    }
  }
}

export const statusService = new StatusService();