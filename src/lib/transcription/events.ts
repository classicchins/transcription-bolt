import { supabase } from '../supabase';
import type { TranscriptionStatus } from '../types';

interface TranscriptionStatusEvent {
  transcriptionId: string;
  status: TranscriptionStatus;
  error?: string;
}

type StatusCallback = (event: TranscriptionStatusEvent) => void;

export function subscribeToTranscriptionStatus(
  transcriptionId: string,
  callback: StatusCallback
) {
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
        callback({
          transcriptionId,
          status: payload.new.status,
          error: payload.new.error
        });
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}