import { z } from 'zod';

export const OPENAI_CONFIG = {
  model: 'whisper-1',
  maxDurationMinutes: 120,
  supportedFormats: [
    'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'
  ],
  maxFileSize: 25 * 1024 * 1024 // 25MB (OpenAI limit)
} as const;

export const transcriptionSchema = z.object({
  file: z.instanceof(File).refine(
    file => OPENAI_CONFIG.supportedFormats.some(format => 
      file.name.toLowerCase().endsWith(`.${format}`)
    ),
    'Unsupported file format'
  ).refine(
    file => file.size <= OPENAI_CONFIG.maxFileSize,
    'File size exceeds 25MB limit'
  ),
  language: z.string().optional(),
  prompt: z.string().optional(),
});