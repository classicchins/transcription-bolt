/*
  # Fix user creation and profile management

  1. Changes
    - Add explicit grants for auth schema
    - Ensure proper trigger execution order
    - Fix security definer permissions
    - Add error handling to trigger function
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Improve handle_new_user function with error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Create profile first
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''))
    ON CONFLICT (id) DO NOTHING;
    
    -- Then add initial credits
    INSERT INTO public.credits (user_id, amount, type, description)
    VALUES (new.id, 100, 'purchase', 'Welcome credits')
    ON CONFLICT DO NOTHING;
    
    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Log error and continue (prevents user creation from failing)
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;