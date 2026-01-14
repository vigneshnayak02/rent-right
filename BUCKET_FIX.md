# Bucket Error Fix Solutions

## Quick Fixes to Try

### 1. Verify Exact Bucket Name
Go to Supabase Dashboard → Storage → Check if bucket name is EXACTLY:
- `psbike-images` (no spaces, correct case)
- NOT `psbike-images ` (with trailing space)
- NOT `psbike-images` (different case)

### 2. Check Bucket Region
Ensure bucket is in same region as project:
- Go to Supabase Dashboard → Settings → General
- Check "Region" (should be same for bucket and project)

### 3. Update Bucket Policies
Run these SQL commands in Supabase SQL Editor:

```sql
-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'psbike-images');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'psbike-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'psbike-images' AND 
  auth.role() = 'authenticated'
);
```

### 4. CORS Configuration
In Supabase Dashboard → Storage → Settings → CORS:
```json
[
  {
    "origin": ["https://psrental.lovable.app", "https://*.lovable.app"],
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "headers": ["*"],
    "maxAge": 3600
  }
]
```

### 5. Alternative: Use Different Bucket Name
If `psbike-images` continues to fail:
1. Create new bucket: `rent-right-images`
2. Update environment variable: `VITE_SUPABASE_BUCKET=rent-right-images`
3. Redeploy to Lovable

### 6. Test with Simple Upload
Create a test file to verify bucket access:

```javascript
// Test bucket access
const { data, error } = await supabase.storage
  .from('psbike-images')
  .upload('test.txt', new Blob(['test'], {type: 'text/plain'}));

console.log('Test upload result:', { data, error });
```

### 7. Check Service Key Permissions
Ensure your service role key has storage permissions:
- Go to Supabase Dashboard → Settings → API
- Generate new service role key with storage access
- Update server environment variables

### 8. Use Public URL Directly
If all else fails, modify upload to use public URLs:
1. Upload image to Imgur/Cloudinary
2. Get public URL
3. Enter URL in "Image URL" field instead of file upload
