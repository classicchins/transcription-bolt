import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { deletionService } from '@/lib/transcription/services/deletion-service';
import type { UseTranscriptionsState, UseTranscriptionsActions } from './types';
import type { Transcription } from '@/lib/types';

interface UseTranscriptionActionsOptions {
  userId?: string;
  state: UseTranscriptionsState;
  onError?: (error: string) => void;
}

export function useTranscriptionActions({
  userId,
  state,
  onError
}: UseTranscriptionActionsOptions): UseTranscriptionsActions {
  const { setTranscriptions, setLoading, setError, setDeleting } = state;

  const loadTranscriptions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Use proper join syntax
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*, file:files!inner(name, size, type, storage_path)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const transformedData = data?.map(item => ({
        ...item,
        file: item.file
      })) as Transcription[];

      setTranscriptions(transformedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transcriptions';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [userId, setTranscriptions, setLoading, setError, onError]);

  const handleDelete = useCallback(async (transcription: Transcription) => {
    if (!userId || state.deleting) return;
    
    try {
      setDeleting(transcription.id);
      setError(null);
      
      await deletionService.deleteTranscription(transcription.id, userId);
      await loadTranscriptions();
    } catch (error) {
      const message = 'Failed to delete transcription';
      setError(message);
      onError?.(message);
    } finally {
      setDeleting(null);
    }
  }, [userId, state.deleting, setDeleting, setError, loadTranscriptions, onError]);

  return {
    handleDelete,
    refresh: loadTranscriptions
  };
}
