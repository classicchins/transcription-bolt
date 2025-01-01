import { supabase } from '@/lib/supabase';
import { generateStoragePath } from '../utils/storage-utils';
import { validateUpload } from '../validation/upload-validator';
import { validateDatabaseResponse } from '../validation/database-validator';
import { UploadError } from '../errors/upload-error';
import { cleanupService } from './cleanup-service';
import { transcriptionProcessor } from '@/lib/transcription/services/openai-service';
import type { UploadResult } from '../types';

class UploadService {
  private readonly BUCKET = 'audio';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  async uploadFile(file: File, userId: string): Promise<UploadResult> {
    let storagePath: string | null = null;

    try {
      // Validate upload
      validateUpload(file, userId);

      // Generate storage path
      storagePath = generateStoragePath(userId, file.name);

      // Upload to storage with retry
      await this.uploadToStorageWithRetry(file, storagePath);

      // Create database records
      const { data, error } = await supabase.rpc('create_transcription', {
        p_user_id: userId,
        p_file_name: file.name,
        p_file_size: file.size,
        p_file_type: file.type,
        p_storage_path: storagePath,
        p_language: 'en'
      });

      if (error) {
        throw new UploadError('Failed to create database records', { error });
      }

      if (!data) {
        throw new UploadError('No response from database');
      }

      // Validate database response
      const validationResult = validateDatabaseResponse(data);
      if (!validationResult.success) {
        throw new UploadError(validationResult.error || 'Invalid database response');
      }

      // Start transcription process
      transcriptionProcessor.processTranscription(validationResult.data.transcription_id)
        .catch(console.error); // Non-blocking

      return {
        data: [{
          ...validationResult.data,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
            storage_path: storagePath
          }
        }],
        errors: null
      };

    } catch (error) {
      console.error('Upload error:', error);

      // Cleanup failed upload if needed
      if (storagePath) {
        try {
          await cleanupService.cleanupFailedUpload(userId, storagePath);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }

      return {
        data: [],
        errors: [{
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Upload failed'
        }]
      };
    }
  }

  private async uploadToStorageWithRetry(
    file: File,
    path: string,
    attempt = 0
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
    } catch (error) {
      if (attempt < this.MAX_RETRIES - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, attempt))
        );
        return this.uploadToStorageWithRetry(file, path, attempt + 1);
      }
      throw new UploadError('Failed to upload file', { error });
    }
  }
}

export const uploadService = new UploadService();