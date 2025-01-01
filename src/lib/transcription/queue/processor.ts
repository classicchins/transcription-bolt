import { transcriptionService } from '../services/transcription-service';
import { statusService } from '../services/status-service';
import { cleanupService } from '@/lib/storage/cleanup/cleanup-service';
import { errorService } from '../services/error-service';
import type { QueueItem } from './types';

export class QueueProcessor {
  private processing = new Set<string>();
  private maxConcurrent = 3;

  async processItem(item: QueueItem): Promise<void> {
    if (this.processing.has(item.id)) return;
    this.processing.add(item.id);

    try {
      await statusService.updateStatus({
        transcriptionId: item.id,
        fileId: item.fileId,
        status: 'processing'
      });

      const content = await transcriptionService.transcribe(
        item.file,
        { language: item.language },
        (status) => {
          statusService.updateStatus({
            transcriptionId: item.id,
            fileId: item.fileId,
            status
          });
        }
      );

      await statusService.updateStatus({
        transcriptionId: item.id,
        fileId: item.fileId,
        status: 'completed',
        content
      });
    } catch (error) {
      await errorService.logError(error, {
        context: 'queue_processing',
        item
      });

      await statusService.updateStatus({
        transcriptionId: item.id,
        fileId: item.fileId,
        status: 'error'
      });

      await cleanupService.cleanupFailedUpload(item.userId, item.storagePath);
    } finally {
      this.processing.delete(item.id);
    }
  }

  canProcess(): boolean {
    return this.processing.size < this.maxConcurrent;
  }
}

export const queueProcessor = new QueueProcessor();