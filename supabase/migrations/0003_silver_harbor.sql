/*
  # Fix database schema

  1. Changes
    - Safely check for existing tables before creation
    - Update triggers and functions
    - Ensure RLS policies exist
*/

-- Check and create tables only if they don't exist
DO $$ 
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE profiles (
            id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            full_name text,
            avatar_url text,
            updated_at timestamptz DEFAULT now()
        );

        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own profile"
            ON profiles FOR SELECT
            TO authenticated
            USING (auth.uid() = id);

        CREATE POLICY "Users can update their own profile"
            ON profiles FOR UPDATE
            TO authenticated
            USING (auth.uid() = id);
    END IF;

    -- Create credits table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'credits') THEN
        CREATE TABLE credits (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users NOT NULL,
            amount integer NOT NULL,
            type text NOT NULL CHECK (type IN ('purchase', 'usage')),
            description text,
            created_at timestamptz DEFAULT now()
        );

        ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own credits"
            ON credits FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    -- Create files table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'files') THEN
        CREATE TABLE files (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users NOT NULL,
            name text NOT NULL,
            size bigint NOT NULL,
            type text NOT NULL,
            status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
            storage_path text NOT NULL,
            created_at timestamptz DEFAULT now()
        );

        ALTER TABLE files ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own files"
            ON files FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own files"
            ON files FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Create transcriptions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transcriptions') THEN
        CREATE TABLE transcriptions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            file_id uuid REFERENCES files NOT NULL,
            user_id uuid REFERENCES auth.users NOT NULL,
            content text,
            status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
            language text DEFAULT 'en',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );

        ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own transcriptions"
            ON transcriptions FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own transcriptions"
            ON transcriptions FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create or replace functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    
    INSERT INTO credits (user_id, amount, type, description)
    VALUES (new.id, 100, 'purchase', 'Welcome credits');
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transcriptions_updated_at ON transcriptions;
CREATE TRIGGER update_transcriptions_updated_at
    BEFORE UPDATE ON transcriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();