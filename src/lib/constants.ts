export const FILE_UPLOAD_CONFIG = {
  maxFiles: 10,
  maxSize: 100 * 1024 * 1024, // 100MB
  acceptedTypes: {
    'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
    'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  }
} as const;

export const TRANSCRIPTION_STATUS = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  error: 'Failed'
} as const;