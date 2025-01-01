import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TranscriptionStatus } from '@/types/transcription';

export function useTranscriptionProgress(transcriptionId: string | null) {
  const [status, setStatus] = useState<TranscriptionStatus>('pending');
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!transcriptionId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('transcriptions')
        .select('status')
        .eq('id', transcriptionId)
        .single();

      if (fetchError) throw fetchError;
      if (data) setStatus(data.status);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch status';
      console.error('Error fetching transcription status:', message);
      setError(message);
    }
  }, [transcriptionId]);

  useEffect(() => {
    if (!transcriptionId) return;

    // Initial fetch
    fetchStatus();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`transcription-${transcriptionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transcriptions',
          filter: `id=eq.${transcriptionId}`
        },
        (payload) => {
          if (payload.new.status) {
            setStatus(payload.new.status as TranscriptionStatus);
          }
        }
      )
      .subscribe();

    // Polling fallback
    const pollInterval = setInterval(fetchStatus, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [transcriptionId, fetchStatus]);

  return { status, error };
}