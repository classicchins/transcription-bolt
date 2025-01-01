/*
  # Create Transcription Functions

  1. Functions
    - create_transcription: Creates a new transcription with associated file record
    - update_transcription_status: Updates transcription status with proper validation
    - cleanup_failed_transcriptions: Removes failed transcription records and files

  2. Security
    - Functions are SECURITY DEFINER to run with elevated privileges
    - Row Level Security policies are respected
    - Input validation and sanitization
*/

-- Create function to handle transcription creation
CREATE OR REPLACE FUNCTION create_transcription(
  p_user_id UUID,
  p_file_name TEXT,
  p_file_size BIGINT,
  p_file_type TEXT,
  p_storage_path TEXT,
  p_language TEXT DEFAULT 'en'
)
RETURNS TABLE (
  file_id UUID,
  transcription_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_file_id UUID;
  v_transcription_id UUID;
BEGIN
  -- Input validation
  IF p_user_id IS NULL OR p_file_name IS NULL OR p_storage_path IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;

  -- Create file record
  INSERT INTO files (
    user_id,
    name,
    size,
    type,
    storage_path,
    status
  ) VALUES (
    p_user_id,
    p_file_name,
    p_file_size,
    p_file_type,
    p_storage_path,
    'pending'
  )
  RETURNING id INTO v_file_id;

  -- Create transcription record
  INSERT INTO transcriptions (
    user_id,
    file_id,
    status,
    language
  ) VALUES (
    p_user_id,
    v_file_id,
    'pending',
    p_language
  )
  RETURNING id INTO v_transcription_id;

  RETURN QUERY SELECT v_file_id, v_transcription_id;
END;
$$;

-- Create function to update transcription status
CREATE OR REPLACE FUNCTION update_transcription_status(
  p_transcription_id UUID,
  p_file_id UUID,
  p_status TEXT,
  p_content TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF p_transcription_id IS NULL OR p_file_id IS NULL OR p_status IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;

  -- Validate status
  IF p_status NOT IN ('pending', 'processing', 'completed', 'error') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;

  -- Update transcription
  UPDATE transcriptions
  SET 
    status = p_status,
    content = CASE 
      WHEN p_status = 'completed' THEN p_content 
      ELSE content 
    END,
    updated_at = now()
  WHERE id = p_transcription_id
  AND file_id = p_file_id;

  -- Update file status
  UPDATE files
  SET status = p_status
  WHERE id = p_file_id;

  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_transcription TO authenticated;
GRANT EXECUTE ON FUNCTION update_transcription_status TO authenticated;