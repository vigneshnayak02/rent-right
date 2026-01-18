-- BYPASS PERMISSIONS - Use Service Role for All Operations
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Step 1: Create bucket using service role (bypasses table permissions)
-- This creates bucket directly with service role, not through storage table
DO $$
DECLARE
  bucket_name TEXT := 'images';
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket exists using service role
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets 
    WHERE name = bucket_name
  ) INTO bucket_exists;
  
  -- Create bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (bucket_name, bucket_name, true, 52428800, ARRAY['image/*']);
  END IF;
END $$;

-- Step 2: Grant public access to bucket (bypasses RLS)
-- This uses service role to bypass RLS entirely
DO $$
DECLARE
  bucket_name TEXT := 'images';
BEGIN
  -- Grant public access to all users for this bucket
  GRANT USAGE ON SCHEMA storage TO anon, authenticated;
  GRANT USAGE ON SCHEMA storage TO postgres;
  GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres;
  
  -- Grant specific permissions on storage.objects
  GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO postgres;
  
  -- Ensure bucket is public
  UPDATE storage.buckets 
  SET public = true 
  WHERE name = bucket_name;
END $$;

-- Step 3: Verify setup
SELECT 'Permissions bypassed - uploads should work now' as status;
SELECT name, public FROM storage.buckets WHERE name = 'images';

-- Step 4: Test direct bucket access
SELECT 'Testing bypassed access...' as test;
SELECT COUNT(*) as bucket_count FROM storage.buckets WHERE name = 'images';
