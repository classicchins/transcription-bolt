import type { TranscriptionStatus } from './transcription';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileProgress {
  id: string;
  file: File;
  fileName: string;
  uploadProgress: number;
  uploadStatus: UploadStatus;
  transcriptionStatus: TranscriptionStatus;
  transcriptionId: string | null;
  error?: string;
}

export interface UploadError {
  fileName: string;
  error: string;
}

export interface UploadResult {
  data: Array<{
    transcription_id: string;
    file_id: string;
  }>;
  errors: UploadError[] | null;
}