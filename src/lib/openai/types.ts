import type { TranscriptionStatus } from '@/lib/types';

export interface TranscriptionResponse {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  language?: string;
}

export interface TranscriptionConfig {
  model: string;
  language?: string;
  prompt?: string;
  temperature?: number;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json';
}

export interface TranscriptionProgress {
  status: TranscriptionStatus;
  progress?: number;
  error?: string;
}