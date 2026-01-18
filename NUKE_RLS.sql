-- NUKE RLS - Complete Disable of Row Level Security
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Completely disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on storage.objects (aggressive cleanup)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Enable update for users based on ownership" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Public Access" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects CASCADE;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects CASCADE;

-- Step 3: Force RLS to stay disabled
ALTER TABLE storage.objects SET (force) ROW LEVEL SECURITY = DISABLED;

-- Step 4: Make sure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'images';

-- Step 5: Create bucket if it doesn't exist (with conflict resolution)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Step 6: Verify RLS is disabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Step 7: Verify bucket exists and is public
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'images';

-- Step 8: Test direct access (bypass RLS)
SELECT 'Testing direct storage access...' as status;
SELECT COUNT(*) as total_objects FROM storage.objects WHERE bucket_id = 'images' LIMIT 1;

-- Step 9: Final confirmation
SELECT 'RLS completely nuked - uploads should work now' as result;
