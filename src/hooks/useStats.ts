import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserStats } from '@/lib/types';

export function useStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        
        setStats(data ? {
          totalTranscriptions: data.total_transcriptions,
          completedTranscriptions: data.completed_transcriptions,
          processingTranscriptions: data.processing_transcriptions,
          failedTranscriptions: data.failed_transcriptions
        } : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Subscribe to stats changes
    const channel = supabase
      .channel(`user_stats_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${userId}`
        },
        loadStats
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { stats, loading, error };
}