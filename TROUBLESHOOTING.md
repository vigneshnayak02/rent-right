# Supabase Upload Troubleshooting Guide

## 🔍 Step-by-Step Diagnosis

### 1. Run Diagnostic Tool
Open your live site (https://psrental.lovable.app/admin) and run this in browser console:

```javascript
import('/src/utils/supabase-test.js').then(module => {
  module.testSupabaseConnection();
});
```

Or directly:
```javascript
// Copy this function and run in console
async function quickTest() {
  console.log('🔍 Quick Supabase Test...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets?.map(b => b.name));
    console.log('Error:', error);
    
    const bucketName = 'rent-right-images';
    const exists = buckets?.some(b => b.name === bucketName);
    console.log(`Bucket "${bucketName}" exists:`, exists);
    
    if (exists) {
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(`test/${Date.now()}.txt`, testFile);
      
      console.log('Upload test:', { data, error: uploadError });
    }
  } catch (e) {
    console.error('Test failed:', e);
  }
}

quickTest();
```

### 2. Check Environment Variables
In browser console, check:
```javascript
console.log('Environment Variables:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_BUCKET:', import.meta.env.VITE_SUPABASE_BUCKET);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'MISSING');
```

### 3. Common Issues & Solutions

#### Issue A: "Bucket not found"
**Symptoms:**
- Console shows: `Bucket 'rent-right-images' not found`
- Available buckets list doesn't include your bucket

**Solutions:**
1. **Check Bucket Name**: Ensure exact match `rent-right-images`
2. **Check Project**: Verify bucket is in correct Supabase project
3. **Create Bucket**: Create bucket in Supabase dashboard
4. **Check Region**: Ensure bucket is in same region as project

#### Issue B: "Permission denied"
**Symptoms:**
- Console shows: `Permission denied` or `403 Forbidden`
- Bucket exists but upload fails

**Solutions:**
1. **Check Policies**: Run SQL to verify policies exist
2. **Make Bucket Public**: Update bucket settings to public
3. **Check CORS**: Add CORS configuration
4. **Verify Auth**: Ensure user is authenticated

#### Issue C: "Network error"
**Symptoms:**
- Console shows: `Network error` or `CORS error`
- Cannot connect to Supabase

**Solutions:**
1. **Check URL**: Verify Supabase URL is correct
2. **Check Key**: Verify publishable key is valid
3. **Check CORS**: Add your domain to CORS settings
4. **Check Firewall**: Ensure no network blocking

#### Issue D: "RLS policy error"
**Symptoms:**
- Console shows: `Row Level Security policy error`
- Policies exist but don't work

**Solutions:**
1. **Update Policies**: Use correct policy syntax
2. **Check Auth Role**: Ensure `auth.role()` matches
3. **Check Bucket ID**: Ensure `bucket_id` matches exactly
4. **Drop and Recreate**: Remove old policies and create new ones

### 4. Manual Bucket Setup

#### Step 1: Create Bucket
```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('rent-right-images', 'rent-right-images', true, 52428800, ARRAY['image/*']);
```

#### Step 2: Set Policies
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'rent-right-images');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'rent-right-images' AND 
  auth.role() = 'authenticated'
);
```

#### Step 3: Set CORS
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

### 5. Alternative Solutions

#### Solution A: Use Original Bucket
Change environment variable back to:
```bash
VITE_SUPABASE_BUCKET="psbike-images"
```

#### Solution B: Use Direct URLs
Instead of file upload, use "Image URL" field:
1. Upload image to Imgur/Cloudinary
2. Get public URL
3. Enter URL in admin panel

#### Solution C: Use Different Storage
Consider using:
- Firebase Storage
- AWS S3
- Cloudinary
- Imgur API

### 6. Debug Checklist

Before contacting support, verify:
- [ ] Bucket name matches exactly
- [ ] Bucket is public
- [ ] Policies exist and are correct
- [ ] CORS is configured
- [ ] Environment variables are set
- [ ] Supabase URL is correct
- [ ] API key is valid
- [ ] User is authenticated (if required)

### 7. Expected Console Output

**Successful Upload:**
```
🔍 Starting Supabase Connection Test...
📡 Testing basic connection...
✅ Basic connection successful
🔐 Auth status: Not authenticated
📦 Testing bucket access...
✅ Available buckets: ["rent-right-images"]
🎯 Bucket "rent-right-images" exists: true
📤 Testing upload permission...
✅ Upload test successful
📊 Test Results: {connection: true, auth: true, buckets: ["rent-right-images"], bucketExists: true, errors: []}
```

**Error Example:**
```
🔍 Starting Supabase Connection Test...
📦 Testing bucket access...
✅ Available buckets: ["some-other-bucket"]
🎯 Bucket "rent-right-images" exists: false
📊 Test Results: {connection: true, auth: true, buckets: ["some-other-bucket"], bucketExists: false, errors: []}
```

Run the diagnostic tool and share the output for targeted help!
