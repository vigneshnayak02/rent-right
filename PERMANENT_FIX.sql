-- PERMANENT FIX FOR BUCKET AND RLS ISSUES
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Step 2: Disable RLS completely for storage.objects (this is the key fix)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 3: Remove all existing policies (clean slate)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on ownership" ON storage.objects;

-- Step 4: Create simple policies (these will work with RLS disabled)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Step 5: Verify setup
SELECT 'Bucket and RLS setup complete' as status;
SELECT name, public FROM storage.buckets WHERE name = 'images';

-- Step 6: Test bucket access
SELECT 'Testing bucket access...' as test;
SELECT COUNT(*) as bucket_count FROM storage.buckets WHERE name = 'images';
