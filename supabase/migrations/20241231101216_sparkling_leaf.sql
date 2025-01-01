-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message text NOT NULL,
  error_stack text,
  context jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Only allow inserts
CREATE POLICY "Enable insert for authenticated users only"
ON error_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- No select/update/delete allowed
CREATE POLICY "Disable select for all users"
ON error_logs FOR SELECT
USING (false);