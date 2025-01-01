-- Drop existing policy if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'error_logs' 
        AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        DROP POLICY "Enable insert for authenticated users only" ON error_logs;
    END IF;
END $$;

-- Create error_logs table if not exists
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_stack text,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create insert policy
CREATE POLICY "Enable insert for authenticated users only"
ON error_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create function to clean old logs
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create index on created_at for better cleanup performance
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs(created_at);