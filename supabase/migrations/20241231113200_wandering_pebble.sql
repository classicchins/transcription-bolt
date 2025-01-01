-- Create function to cleanup failed uploads
CREATE OR REPLACE FUNCTION cleanup_failed_upload(
  p_user_id UUID,
  p_storage_path TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete file record first (will cascade to transcription)
  DELETE FROM files
  WHERE user_id = p_user_id
  AND storage_path = p_storage_path;

  -- Update user stats
  UPDATE user_stats
  SET 
    total_transcriptions = (
      SELECT COUNT(*) FROM transcriptions WHERE user_id = p_user_id
    ),
    failed_transcriptions = (
      SELECT COUNT(*) FROM transcriptions 
      WHERE user_id = p_user_id AND status = 'error'
    )
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_failed_upload TO authenticated;