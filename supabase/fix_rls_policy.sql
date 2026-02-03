-- Fix Row Level Security for profiles table
-- This allows the server to create profiles for authenticated users

-- First, check if RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Allow insert for authenticated users (for server-side profile creation)
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policy: Allow service role to do everything (for server-side operations)
CREATE POLICY "Enable all for service role"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Also fix the credit_transactions table policies
DROP POLICY IF EXISTS "Users can view own credit transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Enable all for service role on credit_transactions" ON credit_transactions;

CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable all for service role on credit_transactions"
  ON credit_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix checkout_sessions table policies
DROP POLICY IF EXISTS "Users can view own checkout sessions" ON checkout_sessions;
DROP POLICY IF EXISTS "Enable all for service role on checkout_sessions" ON checkout_sessions;

CREATE POLICY "Users can view own checkout sessions"
  ON checkout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable all for service role on checkout_sessions"
  ON checkout_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions on new tables
GRANT ALL ON credit_transactions TO authenticated;
GRANT ALL ON credit_transactions TO service_role;
GRANT ALL ON checkout_sessions TO authenticated;
GRANT ALL ON checkout_sessions TO service_role;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
