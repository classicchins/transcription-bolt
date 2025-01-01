import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Transcription } from '@/lib/types';

export function useTranscriptionStatus(transcriptionId: string) {
  const [status, setStatus] = useState<Transcription['status']>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transcriptionId) return;

    // Subscribe to transcription status changes
    const channel = supabase
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
        }
      )
      .subscribe();

    // Initial status fetch
    supabase
      .from('transcriptions')
      .select('status')
      .eq('id', transcriptionId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setStatus(data.status);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [transcriptionId]);

  return { status, error };
}