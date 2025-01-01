import { supabase } from './supabase';
import type { Transcription, TranscriptionStatus } from './types';

export async function getTranscriptions(userId: string, query?: string) {
  try {
    let queryBuilder = supabase
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

    if (query) {
      queryBuilder = queryBuilder.or(`content.ilike.%${query}%,files.name.ilike.%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return { data: data as Transcription[], error: null };
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
    return { data: data as Transcription, error: null };
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return { data: null, error };
  }
}

export function formatTranscriptionStatus(status: TranscriptionStatus): string {
  const statusMap: Record<TranscriptionStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    error: 'Failed'
  };
  return statusMap[status] || status;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}