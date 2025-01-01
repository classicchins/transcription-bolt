```typescript
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { deletionService } from '@/lib/transcription/services/deletion-service';
import type { Transcription, TranscriptionStatus } from '@/lib/types';
import type { UseTranscriptionsState } from './types';

export function useTranscriptionsActions(
  userId: string | undefined,
  state: UseTranscriptionsState
) {
  const { setTranscriptions, setFilteredTranscriptions, setLoading, setError, setDeleting } = state;

  const loadTranscriptions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*, files(name, size, type, storage_path)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        file: item.files
      })) || [];

      setTranscriptions(transformedData);
      setFilteredTranscriptions(transformedData);
    } catch (err) {
      console.error('Error fetching transcriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transcriptions');
    } finally {
      setLoading(false);
    }
  }, [userId, setTranscriptions, setFilteredTranscriptions, setLoading, setError]);

  const handleDelete = async (transcription: Transcription) => {
    if (!userId || state.deleting) return;
    
    try {
      setDeleting(transcription.id);
      setError(null);
      
      await deletionService.deleteTranscription(transcription.id, userId);
      await loadTranscriptions();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete transcription');
    } finally {
      setDeleting(null);
    }
  };

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredTranscriptions(state.transcriptions);
      return;
    }

    const searchTerm = query.toLowerCase();
    setFilteredTranscriptions(
      state.transcriptions.filter(t => 
        t.file?.name.toLowerCase().includes(searchTerm) ||
        t.content?.toLowerCase().includes(searchTerm)
      )
    );
  }, [state.transcriptions, setFilteredTranscriptions]);

  const handleStatusFilter = useCallback((status: TranscriptionStatus | 'all') => {
    if (status === 'all') {
      setFilteredTranscriptions(state.transcriptions);
      return;
    }

    setFilteredTranscriptions(
      state.transcriptions.filter(t => t.status === status)
    );
  }, [state.transcriptions, setFilteredTranscriptions]);

  const handleSort = useCallback((sort: 'newest' | 'oldest') => {
    setFilteredTranscriptions(prev => 
      [...prev].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sort === 'newest' ? dateB - dateA : dateA - dateB;
      })
    );
  }, [setFilteredTranscriptions]);

  return {
    handleDelete,
    handleSearch,
    handleStatusFilter,
    handleSort,
    refresh: loadTranscriptions
  };
}
```