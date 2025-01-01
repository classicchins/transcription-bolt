/*
  # Add User Stats Tracking

  1. New Tables
    - `user_stats`
      - `user_id` (uuid, primary key)
      - `total_transcriptions` (integer)
      - `completed_transcriptions` (integer)
      - `processing_transcriptions` (integer)
      - `failed_transcriptions` (integer)
      - `updated_at` (timestamptz)

  2. Functions
    - Add function to calculate user stats
    - Add trigger to update stats on transcription changes

  3. Security
    - Enable RLS on user_stats table
    - Add policy for users to view their own stats
*/

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  total_transcriptions integer DEFAULT 0,
  completed_transcriptions integer DEFAULT 0,
  processing_transcriptions integer DEFAULT 0,
  failed_transcriptions integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "Users can view their own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total integer;
  v_completed integer;
  v_processing integer;
  v_failed integer;
BEGIN
  -- Calculate stats
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status IN ('pending', 'processing')),
    COUNT(*) FILTER (WHERE status = 'error')
  INTO
    v_total,
    v_completed,
    v_processing,
    v_failed
  FROM transcriptions
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Insert or update stats
  INSERT INTO user_stats (
    user_id,
    total_transcriptions,
    completed_transcriptions,
    processing_transcriptions,
    failed_transcriptions,
    updated_at
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    v_total,
    v_completed,
    v_processing,
    v_failed,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_transcriptions = EXCLUDED.total_transcriptions,
    completed_transcriptions = EXCLUDED.completed_transcriptions,
    processing_transcriptions = EXCLUDED.processing_transcriptions,
    failed_transcriptions = EXCLUDED.failed_transcriptions,
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$;

-- Add triggers for transcription changes
DROP TRIGGER IF EXISTS update_user_stats_trigger ON transcriptions;

CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Initialize stats for existing users
INSERT INTO user_stats (
  user_id,
  total_transcriptions,
  completed_transcriptions,
  processing_transcriptions,
  failed_transcriptions
)
SELECT
  t.user_id,
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'completed'),
  COUNT(*) FILTER (WHERE status IN ('pending', 'processing')),
  COUNT(*) FILTER (WHERE status = 'error')
FROM transcriptions t
GROUP BY t.user_id
ON CONFLICT (user_id) DO UPDATE SET
  total_transcriptions = EXCLUDED.total_transcriptions,
  completed_transcriptions = EXCLUDED.completed_transcriptions,
  processing_transcriptions = EXCLUDED.processing_transcriptions,
  failed_transcriptions = EXCLUDED.failed_transcriptions,
  updated_at = now();