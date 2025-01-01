import { getTranscriptionQueue } from '../queue';
import { TranscriptionError } from '../errors';
import type { QueueItem } from '../queue/types';

class QueueService {
  private queue = getTranscriptionQueue();

  async addToQueue(item: Omit<QueueItem, 'status' | 'retryCount'>) {
    try {
      await this.queue.add(item);
    } catch (error) {
      console.error('Queue error:', error);
      throw TranscriptionError.queueError('Failed to add item to queue', { error });
    }
  }

  async getQueueStatus(transcriptionId: string) {
    return this.queue.getItemStatus(transcriptionId);
  }

  async removeFromQueue(transcriptionId: string) {
    return this.queue.remove(transcriptionId);
  }
}

export const queueService = new QueueService();