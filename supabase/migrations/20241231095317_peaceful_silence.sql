/*
  # Add Deletion Trigger

  1. Functions
    - Add function to handle file cleanup on transcription deletion
    - Add function to handle storage cleanup on file deletion

  2. Triggers
    - Add trigger for transcription deletion
    - Add trigger for file deletion
*/

-- Function to handle transcription deletion
CREATE OR REPLACE FUNCTION handle_transcription_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete associated file record
  DELETE FROM files WHERE id = OLD.file_id;
  RETURN OLD;
END;
$$;

-- Function to handle file deletion
CREATE OR REPLACE FUNCTION handle_file_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete file from storage bucket
  PERFORM storage.delete_object('audio', OLD.storage_path);
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  -- Log error but allow deletion to proceed
  RAISE WARNING 'Failed to delete storage file: %', SQLERRM;
  RETURN OLD;
END;
$$;

-- Add triggers
DROP TRIGGER IF EXISTS on_transcription_delete ON transcriptions;
CREATE TRIGGER on_transcription_delete
  AFTER DELETE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transcription_deletion();

DROP TRIGGER IF EXISTS on_file_delete ON files;
CREATE TRIGGER on_file_delete
  BEFORE DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION handle_file_deletion();