-- PERMISSION FIX - Use only what you have access to
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Check what permissions you have
SELECT 
  schemaname, 
  tablename, 
  hasinsert, 
  hasupdate, 
  hasdelete, 
  hasselect, 
  owner 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Step 2: Try to create bucket with INSERT (this usually works)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Step 3: Check if bucket was created
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'images';

-- Step 4: Try to create simple policy (if you have permission)
CREATE POLICY "Public read for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Step 5: If policy creation fails, try this alternative
-- Create a service role key with storage permissions
-- Go to Supabase Dashboard → Settings → API → Service Role Key
-- Generate new key with storage permissions

-- Step 6: Check current policies
SELECT 
  policyname, 
  tablename, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'storage.objects' 
ORDER BY policyname;

-- Step 7: If all else fails, use this workaround
-- Create a simple test to see what works
SELECT 'Permission check complete' as status;
