import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { deletionService } from '@/lib/transcription/services/deletion-service';
import { useTranscriptionsState } from './useTranscriptionsState';
import { useTranscriptionsData } from './useTranscriptionsData';
import { useTranscriptionsFilters } from './useTranscriptionsFilters';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { Transcription } from '@/lib/types';
import type { UseTranscriptionsReturn } from './types';

export function useTranscriptions(userId: string | undefined): UseTranscriptionsReturn {
  const state = useTranscriptionsState();
  const { fetchTranscriptions } = useTranscriptionsData(userId);
  const { handleSearch, handleStatusFilter, handleSort } = useTranscriptionsFilters(
    state.transcriptions,
    state.setFilteredTranscriptions
  );

  const refresh = useCallback(async () => {
    if (!userId) return;

    try {
      state.setError(null);
      const data = await fetchTranscriptions();
      if (data) {
        state.setTranscriptions(data);
        state.setFilteredTranscriptions(data);
      }
    } catch (err) {
      state.setError(err instanceof Error ? err.message : 'Failed to load transcriptions');
    } finally {
      state.setLoading(false);
    }
  }, [userId, fetchTranscriptions, state]);

  const handleDelete = async (transcription: Transcription) => {
    if (!userId || state.deleting) return;
    
    try {
      state.setDeleting(transcription.id);
      state.setError(null);
      await deletionService.deleteTranscription(transcription.id, userId);
      await refresh();
    } catch (err) {
      state.setError('Failed to delete transcription');
    } finally {
      state.setDeleting(null);
    }
  };

  // Initial data load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime subscription
  useRealtimeSubscription(userId, refresh);

  return {
    transcriptions: state.filteredTranscriptions,
    loading: state.loading,
    error: state.error,
    deleting: state.deleting,
    handleDelete,
    handleSearch,
    handleStatusFilter,
    handleSort,
    refresh
  };
}

export type { UseTranscriptionsReturn };