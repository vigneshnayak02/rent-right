-- QUICK FIX - Disable RLS completely for immediate solution
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Completely disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 2: Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'images';

-- Step 3: Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Step 4: Verify
SELECT 'RLS disabled - uploads should work now' as status;
SELECT name, public FROM storage.buckets WHERE name = 'images';
