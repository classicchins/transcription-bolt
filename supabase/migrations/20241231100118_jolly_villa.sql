-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_transcription_delete ON transcriptions;
DROP TRIGGER IF EXISTS on_file_delete ON files;

-- Improve transcription deletion function with better error handling
CREATE OR REPLACE FUNCTION handle_transcription_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete associated file record
  DELETE FROM files WHERE id = OLD.file_id AND user_id = OLD.user_id;
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to delete file record: %', SQLERRM;
  RETURN OLD;
END;
$$;

-- Improve file deletion function with better error handling
CREATE OR REPLACE FUNCTION handle_file_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete file from storage bucket
  BEGIN
    PERFORM storage.delete_object('audio', OLD.storage_path);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to delete storage file: %', SQLERRM;
  END;
  RETURN OLD;
END;
$$;

-- Add improved triggers
CREATE TRIGGER on_transcription_delete
  AFTER DELETE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transcription_deletion();

CREATE TRIGGER on_file_delete
  BEFORE DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION handle_file_deletion();

-- Add cascade delete to foreign key constraints
ALTER TABLE transcriptions 
  DROP CONSTRAINT IF EXISTS transcriptions_file_id_fkey,
  ADD CONSTRAINT transcriptions_file_id_fkey 
    FOREIGN KEY (file_id) 
    REFERENCES files(id) 
    ON DELETE CASCADE;