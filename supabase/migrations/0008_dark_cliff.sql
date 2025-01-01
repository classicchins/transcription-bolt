/*
  # Update Storage and Security Policies

  1. Changes
    - Update audio bucket configuration
    - Set proper MIME types and size limits
    - Update storage policies for proper file access

  2. Security
    - Maintain RLS protection
    - Ensure users can only access their own files
    - Add proper file type restrictions
*/

-- Update audio bucket settings if it exists
DO $$
BEGIN
  UPDATE storage.buckets
  SET 
    public = false,
    file_size_limit = 104857600, -- 100MB limit
    allowed_mime_types = ARRAY[
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
      'audio/flac',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/webm'
    ]
  WHERE id = 'audio';
END $$;

-- Update storage policies
DROP POLICY IF EXISTS "Users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;

CREATE POLICY "Users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = 'uploads' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can read own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = 'uploads' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = 'uploads' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Fix transcriptions policies
DROP POLICY IF EXISTS "Users can insert their own transcriptions" ON transcriptions;

CREATE POLICY "Users can insert their own transcriptions"
ON transcriptions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM files
    WHERE files.id = file_id
    AND files.user_id = auth.uid()
  )
);