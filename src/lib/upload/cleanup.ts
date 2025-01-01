import { supabase } from '../supabase';

export async function cleanupStorageFile(storagePath: string): Promise<void> {
  if (!storagePath) return;

  try {
    const { error } = await supabase.storage
      .from('audio')
      .remove([storagePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to cleanup storage file:', error);
    throw error; // Rethrow to handle at higher level
  }
}