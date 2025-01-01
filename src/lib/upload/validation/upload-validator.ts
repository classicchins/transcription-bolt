import { z } from 'zod';
import { BaseError } from '@/lib/core/errors/base-error';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/flac'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];

export class UploadValidationError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'UPLOAD_VALIDATION_ERROR', details);
  }
}

const uploadSchema = z.object({
  file: z.instanceof(File)
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      file => {
        const type = file.type.toLowerCase();
        return [...SUPPORTED_AUDIO_TYPES, ...SUPPORTED_VIDEO_TYPES].includes(type);
      },
      'Unsupported file type. Please upload an audio or video file.'
    )
    .refine(
      file => file.name && file.name.length <= 255,
      'File name is too long'
    )
    .refine(
      file => /^[a-zA-Z0-9._-]+$/.test(file.name),
      'File name contains invalid characters'
    ),
  userId: z.string().uuid('Invalid user ID')
});

export function validateUpload(file: File, userId: string) {
  const result = uploadSchema.safeParse({ file, userId });
  
  if (!result.success) {
    throw new UploadValidationError('Invalid upload', {
      errors: result.error.errors
    });
  }
  
  return result.data;
}