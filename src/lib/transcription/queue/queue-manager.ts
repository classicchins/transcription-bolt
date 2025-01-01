import { QueueProcessor } from './processor';
import { BaseError } from '@/lib/core/errors/base-error';
import type { QueueItem } from './types';

export class QueueError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'QUEUE_ERROR', details);
  }
}

class QueueManager {
  private queue: Map<string, QueueItem> = new Map();
  private processor: QueueProcessor;
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.processor = new QueueProcessor();
    this.startProcessing();
  }

  async add(item: Omit<QueueItem, 'status' | 'retryCount'>) {
    try {
      this.queue.set(item.id, {
        ...item,
        status: 'pending',
        retryCount: 0
      });

      await this.processQueue();
    } catch (error) {
      throw new QueueError('Failed to add item to queue', { error });
    }
  }

  private async processQueue() {
    if (this.queue.size === 0 || !this.processor.canProcess()) return;

    const items = Array.from(this.queue.values())
      .filter(item => item.status === 'pending')
      .slice(0, 3);

    for (const item of items) {
      await this.processor.processItem(item);
      this.queue.delete(item.id);
    }
  }

  private startProcessing() {
    this.interval = setInterval(() => {
      this.processQueue().catch(console.error);
    }, 5000);
  }

  dispose() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.queue.clear();
  }
}

export const queueManager = new QueueManager();