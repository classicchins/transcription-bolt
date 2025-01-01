import { supabase } from '../supabase';
import { StorageError } from './types';

interface GetMediaUrlOptions {
  expiresIn?: number;
  download?: boolean;
}

export async function getMediaUrl(
  path: string,
  options: GetMediaUrlOptions = {}
): Promise<string> {
  try {
    if (!path) {
      throw new Error('Storage path is required');
    }

    // Clean path
    const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');

    // Get signed URL
    const { data, error } = await supabase.storage
      .from('audio')
      .createSignedUrl(cleanPath, options.expiresIn || 3600, {
        download: options.download
      });

    if (error) throw error;
    if (!data?.signedUrl) throw new Error('Failed to generate signed URL');

    // Verify URL is accessible
    await verifyMediaAccess(data.signedUrl);

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting media URL:', { error, path, options });
    throw new StorageError('Failed to get media URL', error);
  }
}

async function verifyMediaAccess(url: string): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Media file not accessible: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!isValidMediaType(contentType)) {
      throw new Error('Invalid media type');
    }
  } catch (error) {
    throw new StorageError('Failed to verify media access', error);
  }
}

function isValidMediaType(contentType: string | null): boolean {
  if (!contentType) return false;
  return contentType.startsWith('audio/') || contentType.startsWith('video/');
}