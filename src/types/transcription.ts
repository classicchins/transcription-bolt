```typescript
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Transcription {
  id: string;
  file_id: string;
  user_id: string;
  content: string | null;
  status: TranscriptionStatus;
  language: string;
  created_at: string;
  updated_at: string;
  file: TranscriptionFile | null;
}

export interface TranscriptionFile {
  name: string;
  size: number;
  type: string;
}
```