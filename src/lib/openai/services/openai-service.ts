import { TranscriptionError } from '../errors';
import { validateApiConfig } from '../config/validation';
import type { TranscriptionProgress } from '../types';

class OpenAIService {
  async transcribe(
    file: File,
    options: { language?: string } = {},
    onProgress?: (progress: TranscriptionProgress) => void
  ): Promise<string> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw TranscriptionError.validationError('Missing OpenAI API key');
      }

      const config = validateApiConfig({ apiKey });
      if (!config.success) {
        throw TranscriptionError.validationError('Invalid API configuration');
      }

      onProgress?.({ status: 'processing', progress: 0 });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-1');
      if (options.language) formData.append('language', options.language);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw TranscriptionError.apiError(error.error?.message || 'Transcription failed');
      }

      onProgress?.({ status: 'processing', progress: 50 });

      const result = await response.json();
      
      if (!result.text) {
        throw TranscriptionError.processingError('No transcription text received');
      }

      onProgress?.({ status: 'completed', progress: 100 });
      return result.text;

    } catch (error) {
      console.error('OpenAI transcription error:', error);
      onProgress?.({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error instanceof TranscriptionError ? error : TranscriptionError.processingError('Transcription failed');
    }
  }
}

export const openAIService = new OpenAIService();