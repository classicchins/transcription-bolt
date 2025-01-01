export class StorageError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export interface StorageFile {
  path: string;
  size: number;
  type: string;
  lastModified?: number;
}