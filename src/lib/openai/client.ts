import { OPENAI_CONFIG } from './config';
import { OpenAIError } from './errors';
import type { TranscriptionStatus } from '@/lib/types';

interface TranscribeOptions {
  file: File;
  language?: string;
  prompt?: string;
  onProgress?: (status: TranscriptionStatus) => void;
}

export async function transcribeAudio({
  file,
  language,
  prompt,
  onProgress
}: TranscribeOptions): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new OpenAIError('Missing OpenAI API key', 'INVALID_API_KEY');
  }

  try {
    onProgress?.('processing');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', OPENAI_CONFIG.model);
    if (language) formData.append('language', language);
    if (prompt) formData.append('prompt', prompt);

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

    const result = await response.json();
    
    if (!result.text) {
      throw new Error('No transcription text received');
    }

    onProgress?.('completed');
    return result.text;
  } catch (error) {
    console.error('Transcription error:', error);
    onProgress?.('error');
    throw OpenAIError.fromError(error);
  }
}