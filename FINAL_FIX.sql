-- FINAL FIX for images bucket - Handle existing policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Drop ALL existing policies on storage.objects (ignore if they don't exist)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for users based on ownership" ON storage.objects;

-- Step 2: Create clean policies for 'images' bucket
-- Allow public read access to files in images bucket
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload files to images bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update files in images bucket
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files in images bucket
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Step 3: Verify policies are created correctly
SELECT 
  policyname, 
  tablename, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'storage.objects' 
  AND (
    qual LIKE '%images%' OR 
    qual LIKE '%images%'
  )
ORDER BY policyname;

-- Step 4: Check if images bucket exists and is public
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'images';

-- Step 5: If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Step 6: Final verification
SELECT 'Setup complete for images bucket' as status;
