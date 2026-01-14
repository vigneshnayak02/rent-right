-- FIX RLS POLICIES for rent-right-images bucket
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Step 2: Create new policies for rent-right-images bucket
-- Allow public read access to files in rent-right-images bucket
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'rent-right-images');

-- Allow authenticated users to upload files to rent-right-images bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rent-right-images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update files in rent-right-images bucket
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'rent-right-images' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files in rent-right-images bucket
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE WITH CHECK (
  bucket_id = 'rent-right-images' AND 
  auth.role() = 'authenticated'
);

-- Step 3: Verify policies are created
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
    qual LIKE '%rent-right-images%' OR 
    qual LIKE '%rent-right-images%'
  );

-- Step 4: Check if bucket is public
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'rent-right-images';
