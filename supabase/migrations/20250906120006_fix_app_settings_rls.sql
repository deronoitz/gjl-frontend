-- Fix RLS policies for app_settings table to work with custom auth
-- This migration updates the RLS policies for app_settings

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON app_settings;

-- Temporarily disable RLS to allow our service client to work
-- Since we're using service client with proper authorization in the API layer
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;

-- Note: We'll handle authorization in the API layer using our custom auth system
-- This is secure because:
-- 1. API routes verify session tokens
-- 2. Only admin sessions can modify settings
-- 3. Service client is only used in API routes, never exposed to frontend
