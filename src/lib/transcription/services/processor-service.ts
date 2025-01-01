import { openAIService } from '@/lib/openai/services/openai-service';
import { storageService } from '@/lib/storage/services/storage-service';
import { statusService } from './status-service';
import { errorService } from './error-service';
import { TranscriptionError } from '../errors';
import type { TranscriptionStatus } from '@/lib/types';

interface ProcessOptions {
  transcriptionId: string;
  fileId: string;
  userId: string;
  file: File;
  storagePath: string;
  language?: string;
}

class ProcessorService {
  async processTranscription({
    transcriptionId,
    fileId,
    userId,
    file,
    storagePath,
    language = 'en'
  }: ProcessOptions): Promise<void> {
    try {
      await this.updateStatus(transcriptionId, fileId, 'processing');

      // Get file from storage
      const blob = await storageService.downloadFile(storagePath);
      const audioFile = new File([blob], file.name, { type: file.type });

      // Transcribe using OpenAI
      const content = await openAIService.transcribe(
        audioFile,
        { language },
        (progress) => {
          if (progress.status === 'error') {
            throw new TranscriptionError(
              progress.error || 'Transcription failed',
              'OPENAI_ERROR'
            );
          }
          this.updateStatus(transcriptionId, fileId, progress.status);
        }
      );

      if (!content) {
        throw TranscriptionError.processingFailed('No transcription content received');
      }

      await this.updateStatus(transcriptionId, fileId, 'completed', content);
    } catch (error) {
      console.error('Processing error:', error);
      await this.updateStatus(transcriptionId, fileId, 'error');
      await errorService.logError(
        error instanceof Error ? error : new Error('Processing failed'),
        { transcriptionId, fileId, userId }
      );
      throw error;
    }
  }

  private async updateStatus(
    transcriptionId: string,
    fileId: string,
    status: TranscriptionStatus,
    content?: string
  ) {
    await statusService.updateStatus({
      transcriptionId,
      fileId,
      status,
      content
    });
  }
}

export const processorService = new ProcessorService();