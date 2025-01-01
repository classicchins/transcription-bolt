export class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'UploadError';
  }

  static validationFailed(message: string) {
    return new UploadError(message, 'VALIDATION_FAILED');
  }

  static storageFailed(message: string, details?: Record<string, any>) {
    return new UploadError(message, 'STORAGE_FAILED', details);
  }

  static transcriptionFailed(message: string, details?: Record<string, any>) {
    return new UploadError(message, 'TRANSCRIPTION_FAILED', details);
  }
}