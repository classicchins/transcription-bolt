import { openAIService } from '@/lib/openai/services/openai-service';
import { supabase } from '@/lib/supabase';
import { formatTranscript } from '../utils/formatter';
import { TranscriptionError } from '../errors';

class TranscriptionProcessor {
  async processTranscription(transcriptionId: string): Promise<void> {
    try {
      // Get transcription details
      const { data: transcription, error: fetchError } = await supabase
        .from('transcriptions')
        .select(`
          id,
          file_id,
          language,
          files!inner(
            storage_path
          )
        `)
        .eq('id', transcriptionId)
        .single();

      if (fetchError) throw fetchError;
      if (!transcription) throw new TranscriptionError('Transcription not found');

      // Update status to processing
      await this.updateStatus(transcriptionId, 'processing');

      // Get file from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('audio')
        .download(transcription.files.storage_path);

      if (storageError) throw storageError;

      // Convert to File object for OpenAI API
      const file = new File([fileData], 'audio', { type: 'audio/mpeg' });

      // Transcribe using OpenAI
      const rawContent = await openAIService.transcribe(
        file,
        { language: transcription.language || 'en' }
      );

      // Format the transcript
      const { text: formattedContent } = formatTranscript(rawContent);

      // Update transcription with formatted content
      await this.updateTranscription(transcriptionId, formattedContent);

    } catch (error) {
      console.error('Transcription processing error:', error);
      await this.updateStatus(transcriptionId, 'error');
      throw error;
    }
  }

  private async updateStatus(transcriptionId: string, status: 'processing' | 'error'): Promise<void> {
    const { error } = await supabase
      .from('transcriptions')
      .update({ status })
      .eq('id', transcriptionId);

    if (error) throw error;
  }

  private async updateTranscription(transcriptionId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('transcriptions')
      .update({
        content,
        status: 'completed'
      })
      .eq('id', transcriptionId);

    if (error) throw error;
  }
}

export const transcriptionProcessor = new TranscriptionProcessor();