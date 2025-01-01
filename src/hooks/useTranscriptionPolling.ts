import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TranscriptionStatus } from '@/lib/types';

interface UseTranscriptionPollingOptions {
  transcriptionId: string | null;
  onComplete?: () => void;
  onError?: (error: string) => void;
  interval?: number;
}

export function useTranscriptionPolling({
  transcriptionId,
  onComplete,
  onError,
  interval = 10000 // 10 seconds default
}: UseTranscriptionPollingOptions) {
  const [status, setStatus] = useState<TranscriptionStatus>('pending');
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!transcriptionId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('transcriptions')
        .select('status')
        .eq('id', transcriptionId)
        .single();

      if (fetchError) throw fetchError;

      setStatus(data.status);

      if (data.status === 'completed') {
        onComplete?.();
      } else if (data.status === 'error') {
        const errorMsg = 'Transcription failed';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check transcription status';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [transcriptionId, onComplete, onError]);

  useEffect(() => {
    if (!transcriptionId) return;

    // Initial check
    checkStatus();

    // Set up polling
    const pollInterval = setInterval(checkStatus, interval);

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
          setStatus(payload.new.status);
          if (payload.new.status === 'completed') {
            onComplete?.();
          } else if (payload.new.status === 'error') {
            const errorMsg = 'Transcription failed';
            setError(errorMsg);
            onError?.(errorMsg);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      subscription.unsubscribe();
    };
  }, [transcriptionId, interval, checkStatus, onComplete, onError]);

  return { status, error };
}