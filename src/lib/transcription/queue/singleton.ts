import { TranscriptionQueue } from './queue';

// Private instance
let instance: TranscriptionQueue | null = null;

// Get or create singleton instance
export function getTranscriptionQueue(): TranscriptionQueue {
  if (!instance) {
    instance = new TranscriptionQueue();
  }
  return instance;
}

// Export singleton instance
export const transcriptionQueue = getTranscriptionQueue();