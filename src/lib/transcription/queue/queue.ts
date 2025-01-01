import { processorService } from '../services/processor-service';
import { errorService } from '../services/error-service';
import { TranscriptionError } from '../errors';
import type { QueueItem } from './types';

export class TranscriptionQueue {
  private queue: Map<string, QueueItem> = new Map();
  private processing: Set<string> = new Set();
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPolling();
  }

  async add(item: Omit<QueueItem, 'status' | 'retryCount'>) {
    if (!this.validateQueueItem(item)) {
      throw TranscriptionError.queueError('Invalid queue item');
    }

    this.queue.set(item.id, {
      ...item,
      status: 'pending',
      retryCount: 0
    });

    await this.processQueue();
  }

  getItemStatus(id: string) {
    return this.queue.get(id)?.status || null;
  }

  remove(id: string) {
    this.queue.delete(id);
    this.processing.delete(id);
  }

  clear() {
    this.queue.clear();
    this.processing.clear();
  }

  private validateQueueItem(item: any): boolean {
    return Boolean(
      item?.id &&
      item?.fileId &&
      item?.userId &&
      item?.file instanceof File &&
      item?.storagePath
    );
  }

  private async processQueue() {
    if (this.queue.size === 0) return;

    const items = Array.from(this.queue.values())
      .filter(item => !this.processing.has(item.id))
      .slice(0, 3); // Process 3 items at a time

    await Promise.all(items.map(item => this.processItem(item)));
  }

  private async processItem(item: QueueItem) {
    this.processing.add(item.id);

    try {
      await processorService.processTranscription({
        transcriptionId: item.id,
        fileId: item.fileId,
        userId: item.userId,
        file: item.file,
        storagePath: item.storagePath,
        language: item.language
      });

      this.queue.delete(item.id);
    } catch (error) {
      await errorService.logError(
        error instanceof Error ? error : new Error('Queue processing failed'),
        { item }
      );

      if (item.retryCount < 2) { // Max 2 retries
        this.queue.set(item.id, {
          ...item,
          retryCount: item.retryCount + 1,
          status: 'pending'
        });
      } else {
        this.queue.delete(item.id);
      }
    } finally {
      this.processing.delete(item.id);
    }
  }

  private startPolling() {
    this.interval = setInterval(() => {
      this.processQueue().catch(console.error);
    }, 5000); // Poll every 5 seconds
  }

  dispose() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.queue.clear();
    this.processing.clear();
  }
}