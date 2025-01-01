import { z } from 'zod';
import { OPENAI_CONFIG } from '../openai/config';

export const transcriptionSchema = z.object({
  file: z.instanceof(File).refine(
    file => OPENAI_CONFIG.supportedFormats.some(format => 
      file.name.toLowerCase().endsWith(`.${format}`)
    ),
    'Unsupported file format'
  ).refine(
    file => file.size <= OPENAI_CONFIG.maxFileSize,
    'File size exceeds limit'
  ),
  userId: z.string().uuid(),
  language: z.string().optional(),
  prompt: z.string().optional()
});

export const statusSchema = z.enum(['pending', 'processing', 'completed', 'error']);

export function validateTranscriptionInput(input: unknown) {
  return transcriptionSchema.safeParse(input);
}

export function validateStatus(status: unknown) {
  return statusSchema.safeParse(status);
}