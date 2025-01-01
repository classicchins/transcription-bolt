import { supabase } from '@/lib/supabase';
import { TranscriptionError } from '../errors';

export async function getTranscriptionContent(transcriptionId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select('content')
      .eq('id', transcriptionId)
      .single();

    if (error) throw error;
    return data?.content || null;
  } catch (error) {
    console.error('Error fetching transcription content:', error);
    throw new TranscriptionError('Failed to fetch transcription content');
  }
}