import { supabase } from '../supabase';
import { transcribeAudio } from '../openai/client';
import { updateTranscriptionStatus } from './services/status-service';
import { cleanupStorageFile } from '../upload/cleanup';
import { TranscriptionError } from './errors';

interface ProcessOptions {
  fileId: string;
  userId: string;
  file: File;
  storagePath: string;
  language?: string;
}

export async function processTranscription({
  fileId,
  userId,
  file,
  storagePath,
  language = 'en'
}: ProcessOptions): Promise<void> {
  try {
    await updateTranscriptionStatus({
      transcriptionId: fileId,
      fileId,
      status: 'processing'
    });

    // Get file from storage
    const { data: storageFile, error: storageError } = await supabase
      .storage
      .from('audio')
      .download(storagePath);

    if (storageError || !storageFile) {
      throw TranscriptionError.processingFailed('Failed to download file');
    }

    // Convert Blob to File for OpenAI API
    const audioFile = new File([storageFile], file.name, { type: file.type });

    // Transcribe the audio
    const content = await transcribeAudio({
      file: audioFile,
      language,
      onProgress: (status) => {
        updateTranscriptionStatus({
          transcriptionId: fileId,
          fileId,
          status
        }).catch(console.error);
      }
    });

    if (!content) {
      throw TranscriptionError.processingFailed('No transcription content received');
    }

    // Update transcription with content
    await updateTranscriptionStatus({
      transcriptionId: fileId,
      fileId,
      status: 'completed',
      content
    });

  } catch (error) {
    console.error('Processing error:', error);

    await updateTranscriptionStatus({
      transcriptionId: fileId,
      fileId,
      status: 'error'
    });

    // Cleanup storage file on error
    try {
      await cleanupStorageFile(storagePath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    throw error;
  }
}