/*
  # Fix transcription policies

  1. Changes
    - Add INSERT policy for transcriptions table
    - Update existing policies for better security
  
  2. Security
    - Allow authenticated users to insert their own transcriptions
    - Ensure users can only access their own data
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own transcriptions" ON transcriptions;
DROP POLICY IF EXISTS "Users can update their own transcriptions" ON transcriptions;
DROP POLICY IF EXISTS "Users can insert their own transcriptions" ON transcriptions;

-- Create comprehensive policies for transcriptions
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

CREATE POLICY "Users can view their own transcriptions"
ON transcriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcriptions"
ON transcriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);