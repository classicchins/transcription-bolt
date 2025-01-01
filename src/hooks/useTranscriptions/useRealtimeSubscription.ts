import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTranscriptionChannelName } from './utils';

export function useRealtimeSubscription(userId: string | undefined, onUpdate: () => void) {
  useEffect(() => {
    if (!userId) return;

    const channelName = getTranscriptionChannelName(userId);
    const filterCondition = `user_id=eq.${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transcriptions',
          filter: filterCondition
        },
        onUpdate
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, onUpdate]);
}