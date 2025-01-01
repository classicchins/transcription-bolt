```typescript
import { useTranscriptionState } from './useTranscriptionState';
import { useTranscriptionActions } from './useTranscriptionActions';
import { useTranscriptionFilters } from './useTranscriptionFilters';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { UseTranscriptionsOptions } from './types';

export function useTranscriptions(userId: string | undefined, options: UseTranscriptionsOptions = {}) {
  const state = useTranscriptionState();
  const actions = useTranscriptionActions({ userId, state, onError: options.onError });
  const filters = useTranscriptionFilters(state.transcriptions);

  // Use the extracted realtime subscription hook
  useRealtimeSubscription(userId, actions.refresh);

  return {
    transcriptions: filters.filteredTranscriptions,
    loading: state.loading,
    error: state.error,
    deleting: state.deleting,
    ...actions,
    ...filters
  };
}
```