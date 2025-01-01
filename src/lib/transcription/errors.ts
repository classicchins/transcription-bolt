export class TranscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }

  static validationFailed(message: string) {
    return new TranscriptionError(message, 'VALIDATION_FAILED');
  }

  static processingFailed(message: string, details?: Record<string, any>) {
    return new TranscriptionError(message, 'PROCESSING_FAILED', details);
  }

  static queueError(message: string, details?: Record<string, any>) {
    return new TranscriptionError(message, 'QUEUE_ERROR', details);
  }

  static invalidStatus(status: string) {
    return new TranscriptionError(
      `Invalid status: ${status}`,
      'INVALID_STATUS'
    );
  }

  static fileNotFound(id: string) {
    return new TranscriptionError(
      `Transcription not found: ${id}`,
      'FILE_NOT_FOUND'
    );
  }
}