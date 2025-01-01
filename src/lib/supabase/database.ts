import { supabase } from './';
import type { Database } from '../database.types';

type Tables = Database['public']['Tables'];

export async function getTranscriptions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select(`
        *,
        file:files(
          name,
          size,
          type,
          storage_path
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    return { data: null, error };
  }
}

export async function getTranscriptionById(id: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select(`
        *,
        file:files(
          name,
          size,
          type,
          storage_path
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return { data: null, error };
  }
}