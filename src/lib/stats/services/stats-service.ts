import { supabase } from '@/lib/supabase';

export interface UserStats {
  totalTranscriptions: number;
  completedTranscriptions: number;
  processingTranscriptions: number;
  failedTranscriptions: number;
}

export class StatsService {
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        totalTranscriptions: data.total_transcriptions,
        completedTranscriptions: data.completed_transcriptions,
        processingTranscriptions: data.processing_transcriptions,
        failedTranscriptions: data.failed_transcriptions
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const statsService = new StatsService();