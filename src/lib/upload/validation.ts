import { z } from 'zod';
import { FILE_UPLOAD_CONFIG } from '../constants';

export const uploadSchema = z.object({
  file: z.instanceof(File)
    .refine(
      file => file.size <= FILE_UPLOAD_CONFIG.maxSize,
      `File size must not exceed ${FILE_UPLOAD_CONFIG.maxSize / 1024 / 1024}MB`
    )
    .refine(
      file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const acceptedExtensions = Object.values(FILE_UPLOAD_CONFIG.acceptedTypes)
          .flat()
          .map(type => type.replace('.', ''));
        return ext && acceptedExtensions.includes(ext);
      },
      'Unsupported file format. Please upload an audio or video file.'
    ),
  userId: z.string().uuid('Invalid user ID')
});

export function validateUpload(file: File, userId: string) {
  return uploadSchema.safeParse({ file, userId });
}