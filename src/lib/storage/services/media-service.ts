import { supabase } from '@/lib/supabase';
import { StorageError } from '../types';
import { validateStoragePath } from '../validation/path-validator';
import { errorService } from '@/lib/transcription/services/error-service';

class MediaService {
  private readonly BUCKET = 'audio';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly URL_EXPIRY = 3600; // 1 hour
  private readonly urlCache = new Map<string, { url: string; expires: number }>();

  async getMediaUrl(storagePath: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.getCachedUrl(storagePath);
      if (cached) return cached;

      // Validate and clean path
      const cleanPath = validateStoragePath(storagePath);

      // Get signed URL with retries
      const url = await this.getSignedUrlWithRetry(cleanPath);

      // Cache the URL
      this.cacheUrl(storagePath, url);

      return url;
    } catch (error) {
      await errorService.logError(error, {
        context: 'media_url_generation',
        storagePath
      });
      throw new StorageError('Failed to get media URL', error);
    }
  }

  private getCachedUrl(path: string): string | null {
    const cached = this.urlCache.get(path);
    if (cached && Date.now() < cached.expires) {
      return cached.url;
    }
    this.urlCache.delete(path);
    return null;
  }

  private cacheUrl(path: string, url: string): void {
    this.urlCache.set(path, {
      url,
      expires: Date.now() + (this.URL_EXPIRY * 1000 * 0.9) // 90% of expiry time
    });
  }

  private async getSignedUrlWithRetry(path: string, attempt = 0): Promise<string> {
    try {
      // First verify file exists
      const exists = await this.verifyFileExists(path);
      if (!exists) {
        throw new StorageError('Media file not found');
      }

      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .createSignedUrl(path, this.URL_EXPIRY);

      if (error) throw error;
      if (!data?.signedUrl) {
        throw new StorageError('Failed to generate media URL');
      }

      return data.signedUrl;
    } catch (error) {
      if (attempt < this.MAX_RETRIES - 1) {
        const delay = this.RETRY_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.getSignedUrlWithRetry(path, attempt + 1);
      }
      throw error;
    }
  }

  private async verifyFileExists(path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: path.split('/').pop()
        });

      if (error) throw error;
      return Boolean(data?.length);
    } catch (error) {
      throw new StorageError('Failed to verify media file', error);
    }
  }
}

export const mediaService = new MediaService();