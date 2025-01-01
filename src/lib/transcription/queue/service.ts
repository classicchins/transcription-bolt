import { TranscriptionQueue } from './queue';
import { TranscriptionError } from '../errors';
import type { QueueItem } from './types';

class QueueService {
  private static instance: QueueService;
  private queue: TranscriptionQueue;

  private constructor() {
    this.queue = new TranscriptionQueue();
  }

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  async add(item: Omit<QueueItem, 'status' | 'retryCount'>) {
    try {
      await this.queue.add(item);
    } catch (error) {
      throw TranscriptionError.queueError('Failed to add item to queue', { error });
    }
  }

  dispose() {
    this.queue.dispose();
  }
}

export { QueueService };