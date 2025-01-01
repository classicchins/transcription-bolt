export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'error';

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

// Upload Types
export interface UploadError {
  fileName: string;
  error: string;
}

export interface UploadResult {
  data: any[];
  errors: UploadError[] | null;
}

// Transcription Types
export interface TranscriptionFile {
  name: string;
  size: number;
  type: string;
}

export interface Transcription {
  id: string;
  file_id: string;
  user_id: string;
  content: string | null;
  status: TranscriptionStatus;
  language: string;
  created_at: string;
  updated_at: string;
  file: TranscriptionFile | null;
}