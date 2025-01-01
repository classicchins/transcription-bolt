import type { TranscriptionStatus } from '@/lib/types';

export function formatTranscriptionStatus(status: TranscriptionStatus): string {
  const statusMap: Record<TranscriptionStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    error: 'Failed'
  };
  return statusMap[status] || status;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}