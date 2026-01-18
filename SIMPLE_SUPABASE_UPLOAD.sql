-- SIMPLE SUPABASE SETUP - Complete Solution
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Create images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Step 2: Disable RLS completely (no policies needed)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify setup
SELECT 'Supabase setup complete - images bucket ready' as status;
SELECT name, public FROM storage.buckets WHERE name = 'images';
