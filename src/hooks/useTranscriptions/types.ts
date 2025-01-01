```typescript
import type { Transcription, TranscriptionStatus } from '@/lib/types';

export interface TranscriptionsState {
  transcriptions: Transcription[];
  filteredTranscriptions: Transcription[];
  loading: boolean;
  error: string | null;
  deleting: string | null;
}

export interface TranscriptionsActions {
  handleDelete: (transcription: Transcription) => Promise<void>;
  handleSearch: (query: string) => void;
  handleStatusFilter: (status: TranscriptionStatus | 'all') => void;
  handleSort: (sort: 'newest' | 'oldest') => void;
  refresh: () => Promise<void>;
}

export type UseTranscriptionsReturn = TranscriptionsState & TranscriptionsActions;
```