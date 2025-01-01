import { z } from 'zod';
import { OPENAI_CONFIG } from './config';

export const apiKeySchema = z.string().min(1, 'API key is required');

export const transcriptionOptionsSchema = z.object({
  language: z.string().optional(),
  prompt: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
  response_format: z.enum(['json', 'text', 'srt', 'verbose_json']).optional()
});

export const fileSchema = z.instanceof(File).refine(
  file => OPENAI_CONFIG.supportedFormats.some(format => 
    file.name.toLowerCase().endsWith(`.${format}`)
  ),
  'Unsupported file format'
).refine(
  file => file.size <= OPENAI_CONFIG.maxFileSize,
  'File size exceeds limit'
);

export function validateApiKey(apiKey: unknown): apiKey is string {
  return apiKeySchema.safeParse(apiKey).success;
}

export function validateTranscriptionOptions(options: unknown) {
  return transcriptionOptionsSchema.safeParse(options);
}

export function validateFile(file: unknown) {
  return fileSchema.safeParse(file);
}