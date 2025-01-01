import { validateUpload } from './validation';
import { uploadToStorage } from './storage';
import { cleanupStorageFile } from './cleanup';
import { createTranscription } from '../transcription/services/transcription-service';
import { UploadError } from './errors';
import type { UploadResult } from '../types';

export async function processUpload(file: File, userId: string): Promise<UploadResult> {
  let storagePath: string | null = null;

  try {
    // Validate upload
    const validation = validateUpload(file, userId);
    if (!validation.success) {
      throw UploadError.validationFailed(validation.error.errors[0].message);
    }

    // Upload to storage with retry
    storagePath = await uploadToStorage(file, userId);
    if (!storagePath) {
      throw UploadError.storageFailed('Failed to upload file');
    }

    // Create transcription
    const result = await createTranscription(file, userId, {
      language: 'en',
      storagePath
    });

    if (!result) {
      throw UploadError.transcriptionFailed('Failed to create transcription');
    }

    return {
      success: true,
      data: result,
      error: null
    };

  } catch (error) {
    console.error('Upload processing error:', error);

    // Cleanup storage file if upload succeeded but transcription failed
    if (storagePath) {
      try {
        await cleanupStorageFile(storagePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup storage file:', cleanupError);
      }
    }

    return {
      success: false,
      data: null,
      error: {
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Failed to process upload'
      }
    };
  }
}