export class TranscriptionError extends Error {
  constructor(
    message: string,
    public code: string = 'TRANSCRIPTION_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }

  static apiError(message: string, details?: Record<string, any>) {
    return new TranscriptionError(message, 'API_ERROR', details);
  }

  static validationError(message: string, details?: Record<string, any>) {
    return new TranscriptionError(message, 'VALIDATION_ERROR', details);
  }

  static processingError(message: string, details?: Record<string, any>) {
    return new TranscriptionError(message, 'PROCESSING_ERROR', details);
  }
}