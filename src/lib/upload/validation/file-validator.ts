import { z } from 'zod';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/flac'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];

export const fileSchema = z.object({
  file: z.instanceof(File)
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      file => [...SUPPORTED_AUDIO_TYPES, ...SUPPORTED_VIDEO_TYPES].includes(file.type),
      'Unsupported file type. Please upload an audio or video file.'
    ),
  userId: z.string().uuid('Invalid user ID')
});

export function validateFile(file: File, userId: string) {
  return fileSchema.safeParse({ file, userId });
}