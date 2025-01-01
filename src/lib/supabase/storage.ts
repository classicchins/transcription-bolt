import { supabase } from './';

export async function uploadFile(file: File, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from('audio')
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return { data: null, error };
  }
}