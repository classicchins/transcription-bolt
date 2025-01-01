import { OPENAI_CONFIG } from './config';
import { OpenAIError } from './errors';
import { validateApiKey, validateFile } from './validation';
import type { TranscriptionOptions, TranscriptionProgress } from './types';

export async function transcribeAudio(
  file: File,
  options: TranscriptionOptions = {},
  onProgress?: (progress: TranscriptionProgress) => void
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!validateApiKey(apiKey)) {
      throw new OpenAIError('Invalid or missing OpenAI API key', 'INVALID_API_KEY');
    }

    const fileValidation = validateFile(file);
    if (!fileValidation.success) {
      throw new OpenAIError(fileValidation.error.message, 'INVALID_FILE');
    }

    onProgress?.({ status: 'processing', progress: 0 });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', OPENAI_CONFIG.model);
    if (options.language) formData.append('language', options.language);
    if (options.prompt) formData.append('prompt', options.prompt);
    if (options.response_format) formData.append('response_format', options.response_format);
    if (options.temperature) formData.append('temperature', options.temperature.toString());

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw OpenAIError.fromResponse(response, error.error?.message);
    }

    onProgress?.({ status: 'processing', progress: 50 });

    const result = await response.json();
    
    if (!result.text) {
      throw new OpenAIError('No transcription text received', 'INVALID_RESPONSE');
    }

    onProgress?.({ status: 'completed', progress: 100 });
    return result.text;

  } catch (error) {
    console.error('Transcription error:', error);
    onProgress?.({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error instanceof OpenAIError ? error : OpenAIError.fromError(error);
  }
}