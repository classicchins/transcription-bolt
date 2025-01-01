export interface DatabaseResponse {
  file_id: string;
  transcription_id: string;
}

export interface UploadResult {
  data: Array<{
    file_id: string;
    transcription_id: string;
    file: {
      name: string;
      size: number;
      type: string;
      storage_path: string;
    };
  }>;
  errors: Array<{
    fileName: string;
    error: string;
  }> | null;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}