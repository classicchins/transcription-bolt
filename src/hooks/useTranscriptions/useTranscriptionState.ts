```typescript
import { useState } from 'react';
import type { Transcription } from '@/lib/types';
import type { UseTranscriptionsState } from './types';

export function useTranscriptionState(): UseTranscriptionsState {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  return {
    transcriptions,
    setTranscriptions,
    loading,
    setLoading,
    error,
    setError,
    deleting,
    setDeleting
  };
}
```