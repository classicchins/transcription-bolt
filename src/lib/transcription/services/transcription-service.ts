import { supabase } from '@/lib/supabase';
import { queueService } from './queue-service';
import { validateTranscriptionInput } from '../validation';
import { TranscriptionError } from '../errors';
import type { TranscriptionOptions, Transcription } from '@/lib/types';

class TranscriptionService {
  async createTranscription(
    file: File,
    userId: string,
    options: TranscriptionOptions = {}
  ) {
    try {
      const validation = validateTranscriptionInput({ file, userId });
      if (!validation.success) {
        throw TranscriptionError.validationFailed(validation.error.errors[0].message);
      }

      if (!options.storagePath) {
        throw TranscriptionError.validationFailed('Storage path is required');
      }

      const { data, error } = await supabase.rpc('create_transcription', {
        p_user_id: userId,
        p_file_name: file.name,
        p_file_size: file.size,
        p_file_type: file.type,
        p_storage_path: options.storagePath,
        p_language: options.language || 'en'
      });

      if (error) throw error;
      if (!data?.file_id || !data?.transcription_id) {
        throw new Error('Failed to create transcription records');
      }

      await queueService.addToQueue({
        id: data.transcription_id,
        fileId: data.file_id,
        userId,
        file,
        language: options.language,
        storagePath: options.storagePath
      });

      return this.getTranscriptionById(data.transcription_id, userId);
    } catch (error) {
      console.error('Error creating transcription:', error);
      throw TranscriptionError.processingFailed(
        'Failed to create transcription',
        { error }
      );
    }
  }

  async getTranscriptions(userId: string) {
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
      return { data: data as Transcription[], error: null };
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
      return { data: null, error };
    }
  }

  async getTranscriptionById(id: string, userId: string) {
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

  subscribeToUpdates(userId: string, onUpdate: () => void) {
    return supabase
      .channel(`transcriptions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transcriptions',
          filter: `user_id=eq.${userId}`
        },
        onUpdate
      )
      .subscribe();
  }
}

export const transcriptionService = new TranscriptionService();