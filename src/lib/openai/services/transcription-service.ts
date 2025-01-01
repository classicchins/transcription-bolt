import { openAIService } from './openai-service';
import { rateLimiter } from '../rate-limiter';
import { validateApiConfig } from '../config/validation';
import { TranscriptionError } from '../errors';
import type { TranscriptionProgress } from '../types';

class TranscriptionService {
  private retryAttempts = 3;
  private retryDelay = 1000;

  async transcribe(
    file: File,
    options: { language?: string } = {},
    onProgress?: (progress: TranscriptionProgress) => void
  ): Promise<string> {
    try {
      const config = {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        model: 'whisper-1'
      };

      const configValidation = validateApiConfig(config);
      if (!configValidation.success) {
        throw new TranscriptionError('Invalid API configuration');
      }

      await rateLimiter.checkLimit();

      return await this.transcribeWithRetry(file, options, onProgress);
    } catch (error) {
      console.error('Transcription error:', error);
      throw error instanceof TranscriptionError ? error : new TranscriptionError('Transcription failed');
    }
  }

  private async transcribeWithRetry(
    file: File,
    options: { language?: string },
    onProgress?: (progress: TranscriptionProgress) => void,
    attempt = 1
  ): Promise<string> {
    try {
      return await openAIService.transcribe(file, options, onProgress);
    } catch (error) {
      if (attempt >= this.retryAttempts) throw error;

      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.transcribeWithRetry(file, options, onProgress, attempt + 1);
    }
  }
}

export const transcriptionService = new TranscriptionService();