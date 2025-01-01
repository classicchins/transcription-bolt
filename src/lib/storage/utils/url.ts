import { supabase } from '@/lib/supabase';
import { withRetry } from './retry';
import { validateStoragePath } from './path';

interface SignedUrlOptions {
  expiresIn?: number;
  download?: boolean;
}

export async function createSignedUrl(
  path: string,
  options: SignedUrlOptions = {}
): Promise<string> {
  const cleanPath = validateStoragePath(path);
  const storage = supabase.storage.from('audio');

  return withRetry(async () => {
    // First verify file exists
    const { data: files, error: listError } = await storage.list(cleanPath);
    if (listError) throw listError;
    if (!files?.length) {
      throw new Error('File not found in storage');
    }

    // Generate signed URL
    const { data, error } = await storage.createSignedUrl(
      cleanPath,
      options.expiresIn || 3600,
      { download: options.download }
    );

    if (error) throw error;
    if (!data?.signedUrl) {
      throw new Error('Failed to generate signed URL');
    }

    return data.signedUrl;
  });
}