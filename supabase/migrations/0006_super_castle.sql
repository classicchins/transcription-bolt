/*
  # Fix storage bucket and policies

  1. Changes
    - Create audio bucket if it doesn't exist
    - Update RLS policies for storage objects
    - Add policies for file management
  
  2. Security
    - Enable RLS on storage objects
    - Add policies for authenticated users
    - Restrict access to own files only
*/

-- Create audio bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('audio', 'audio', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Delete files when database record is deleted" ON storage.objects;

-- Create new policies with proper checks
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