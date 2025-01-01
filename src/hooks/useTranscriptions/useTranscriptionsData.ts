import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Transcription } from '@/lib/types';

export function useTranscriptionsData(userId: string | undefined) {
  const fetchTranscriptions = useCallback(async () => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('transcriptions')
      .select(`
        *,
        files (
          name,
          size,
          type,
          storage_path
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      ...item,
      file: item.files
    })) as Transcription[];
  }, [userId]);

  return { fetchTranscriptions };
}