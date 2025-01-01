export class UploadError extends Error {
  constructor(
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'UploadError';
    this.code = 'UPLOAD_ERROR';
  }
}