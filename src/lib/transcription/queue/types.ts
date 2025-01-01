import type { TranscriptionStatus } from '@/lib/types';

export interface QueueItem {
  id: string;
  fileId: string;
  userId: string;
  file: File;
  storagePath: string;
  language?: string;
  status: TranscriptionStatus;
  retryCount: number;
}