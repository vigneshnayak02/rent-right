-- CREATE PUBLIC BUCKET - Simple Solution
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/keilhtlygcickccfnrpl

-- Create the public bucket (this usually works even with limited permissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('public', 'public', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*'];

-- Verify bucket was created
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'public';

-- Show success message
SELECT 'Public bucket created successfully - uploads should now work' as status;
