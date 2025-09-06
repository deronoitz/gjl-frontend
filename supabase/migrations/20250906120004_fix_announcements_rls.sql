-- Fix announcements RLS policies to work with custom auth
-- Since we're using custom auth (not Supabase Auth), auth.uid() will always be null
-- We'll handle authorization in the application layer using service role key

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Only admins can create announcements" ON announcements;
DROP POLICY IF EXISTS "Only admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Only admins can delete announcements" ON announcements;

-- For now, we'll disable RLS on announcements table since we're handling auth in the API layer
-- This is safe because we're using service role key and validating permissions in our API routes
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- Note: Authorization is now handled in the API routes:
-- 1. GET /api/announcements - Public (anyone can read)
-- 2. POST /api/announcements - Admin only (checked via CustomAuth.verifySession)
-- 3. PUT /api/announcements/[id] - Admin only (checked via CustomAuth.verifySession)
-- 4. DELETE /api/announcements/[id] - Admin only (checked via CustomAuth.verifySession)
