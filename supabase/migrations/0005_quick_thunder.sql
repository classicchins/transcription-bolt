/*
  # Add storage bucket for audio files

  1. New Storage
    - Creates 'audio' bucket for storing audio files
    - Sets up RLS policies for authenticated users
  
  2. Security
    - Enables RLS on the bucket
    - Adds policies for:
      - Authenticated users can upload their own files
      - Authenticated users can read their own files
      - Files are automatically deleted when corresponding database record is deleted
*/

-- Enable storage by inserting bucket
INSERT INTO storage.buckets (id, name)
VALUES ('audio', 'audio')
ON CONFLICT DO NOTHING;

-- Set up RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading files (only authenticated users can upload)
CREATE POLICY "Users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for reading files (users can only read their own files)
CREATE POLICY "Users can read own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting files (automatic cleanup)
CREATE POLICY "Delete files when database record is deleted"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);