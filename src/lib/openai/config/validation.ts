import { z } from 'zod';

export const apiConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  model: z.string().default('whisper-1'),
  maxDurationMinutes: z.number().default(120),
  maxFileSize: z.number().default(25 * 1024 * 1024), // 25MB
  supportedFormats: z.array(z.string()).default([
    'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'
  ])
});

export const validateApiConfig = (config: unknown) => {
  return apiConfigSchema.safeParse(config);
};