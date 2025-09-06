-- Fix RLS policies for custom authentication
-- This migration fixes the infinite recursion in RLS policies

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;

-- Since we're using custom authentication through API routes,
-- we'll disable RLS and rely on our API-level authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled for future use,
-- you can create simple policies that allow all operations for now:

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
-- CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true);
